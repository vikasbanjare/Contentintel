/* ContentIntel SaaS proxy — Cloudflare Worker
   Verifies the user, enforces plan quotas, calls Anthropic with YOUR key.
   Secrets to set (wrangler secret put NAME):
     ANTHROPIC_KEY        your Anthropic API key
     SUPABASE_URL         https://xxxx.supabase.co
     SUPABASE_ANON_KEY    Supabase anon public key (for JWT verification)
     SUPABASE_SERVICE_KEY Supabase service-role key (for usage updates)
   Vars: ALLOWED_ORIGIN = https://www.yourdomain.com
*/

const PLAN_LIMITS = { free: 5, starter: 50, pro: 250, agency: 1000 };
const VISION_PLANS = ['pro', 'agency'];

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    // 1. Verify the user's JWT with Supabase
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    if (!jwt) return json({ error: 'Sign in to run checks.' }, 401, cors);
    const uRes = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + jwt },
    });
    if (!uRes.ok) return json({ error: 'Session expired — sign in again.' }, 401, cors);
    const user = await uRes.json();
    if (!user.email_confirmed_at) return json({ error: 'Confirm your email first (check your inbox).' }, 403, cors);

    // 2. Load profile (plan + usage), resetting the monthly window if needed
    const svc = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY, 'content-type': 'application/json' };
    const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=plan,checks_used,period_start`, { headers: svc });
    const rows = await pRes.json();
    let { plan = 'free', checks_used = 0, period_start } = rows[0] || {};
    const monthAgo = Date.now() - 30 * 864e5;
    if (!period_start || new Date(period_start).getTime() < monthAgo) {
      checks_used = 0;
      await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH', headers: svc,
        body: JSON.stringify({ checks_used: 0, period_start: new Date().toISOString() }),
      });
    }

    // 3. Enforce the plan
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    if (checks_used >= limit)
      return json({ error: `You've used all ${limit} checks on the ${plan} plan this month. Upgrade to keep going.`, upgrade: true }, 402, cors);

    const body = await req.json();
    const hasImages = JSON.stringify(body.messages || '').includes('"image"');
    if (hasImages && !VISION_PLANS.includes(plan))
      return json({ error: 'Thumbnail vision needs Creator Pro. Upgrade to analyze images.', upgrade: true }, 402, cors);

    // 4. Simple per-user rate limit (10/min) via Cloudflare cache API
    // (best-effort; for hard guarantees use Durable Objects later)

    // 5. Call Anthropic with YOUR key
    const aRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({ ...body, model: body.model || 'claude-sonnet-4-6' }),
    });
    const out = await aRes.text();

    // 6. Count it (only successful calls)
    if (aRes.ok) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/increment_usage`, {
        method: 'POST', headers: svc, body: JSON.stringify({ uid: user.id }),
      });
    }
    return new Response(out, { status: aRes.status, headers: { ...cors, 'content-type': 'application/json' } });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
