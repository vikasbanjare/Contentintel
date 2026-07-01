/* ContentIntel SaaS proxy — Cloudflare Worker
   Verifies the user, enforces plan quotas, calls Anthropic with YOUR key.
   Secrets to set (wrangler secret put NAME):
     ANTHROPIC_KEY        your Anthropic API key
     SUPABASE_URL         https://xxxx.supabase.co
     SUPABASE_ANON_KEY    Supabase anon public key (for JWT verification)
     SUPABASE_SERVICE_KEY Supabase service-role key (for usage updates)
   Vars: ALLOWED_ORIGIN = https://contentintel.in
*/

// CREDIT SYSTEM: plans grant credits; the user picks an engine; each engine
// burns credits at its real API-cost ratio. Server-enforced.
const PLAN_CREDITS = { free: 15, starter: 150, pro: 750, agency: 3000 };
const ENGINES = {
  quick: { id: 'claude-haiku-4-5-20251001', credits: 1 },
  smart: { id: 'claude-sonnet-4-6',         credits: 3 },
  max:   { id: 'claude-opus-4-8',           credits: 5 },
};
// Which engines each plan may use (Max/Opus is a Pro+ perk — sells upgrades).
const PLAN_ENGINES = {
  free: ['quick'], starter: ['quick', 'smart'],
  pro: ['quick', 'smart', 'max'], agency: ['quick', 'smart', 'max'],
};
const VISION_PLANS = ['pro', 'agency'];

// Abuse caps: bound a single request's cost so fixed per-call credits can't be
// gamed with a huge max_tokens or a giant prompt.
const MAX_OUTPUT_TOKENS = 8192;        // hard ceiling on max_tokens
const MAX_BODY_BYTES = 600 * 1024;     // ~600KB request body (covers images + text)

export default {
  async fetch(req, env) {
    // CORS: only reflect our own domain(s); never an arbitrary origin.
    const origin = req.headers.get('Origin') || '';
    const fallback = env.ALLOWED_ORIGIN || 'https://contentintel.in';
    let allowOrigin = fallback;
    try { if (origin && /(^|\.)contentintel\.in$/.test(new URL(origin).hostname)) allowOrigin = origin; } catch (e) {}
    if (env.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN) allowOrigin = origin;
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    // Reject oversized bodies early (cost-abuse / DoS guard).
    const clen = parseInt(req.headers.get('content-length') || '0', 10);
    if (clen && clen > MAX_BODY_BYTES) return json({ error: 'Request too large.' }, 413, cors);

    // 1. Verify the user's JWT with Supabase
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    if (!jwt) return json({ error: 'Sign in to run checks.' }, 401, cors);
    const uRes = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + jwt },
    });
    if (!uRes.ok) return json({ error: 'Session expired — sign in again.' }, 401, cors);
    const user = await uRes.json();
    if (!user.email_confirmed_at) return json({ error: 'Confirm your email first (check your inbox).' }, 403, cors);

    // Parse + size-check the body (content-length can be spoofed/absent).
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Request too large.' }, 413, cors);
    let body; try { body = JSON.parse(raw); } catch (e) { return json({ error: 'Bad request.' }, 400, cors); }

    // 2. Load profile (plan + usage), resetting the monthly window if needed
    const svc = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY, 'content-type': 'application/json' };
    const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=plan,checks_used,period_start,usd_limit`, { headers: svc });
    const rows = await pRes.json();
    let { plan = 'free', period_start, usd_limit } = rows[0] || {};
    // Owner/custom override: usd_limit is settable ONLY via the service role
    // (RLS + column grant block users), so it's a safe per-account override that
    // grants a custom credit ceiling and unlocks all engines + vision. This is
    // how an "unlimited" account works — set a high usd_limit on your profile.
    const hasOverride = usd_limit != null && usd_limit !== '' && !isNaN(Number(usd_limit));
    const monthAgo = Date.now() - 30 * 864e5;
    if (!period_start || new Date(period_start).getTime() < monthAgo) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH', headers: svc,
        body: JSON.stringify({ checks_used: 0, period_start: new Date().toISOString() }),
      });
    }

    // 3. Resolve the requested engine, enforce plan (override unlocks everything)
    const wanted = String(body.engine || (String(body.model || '').includes('haiku') ? 'quick' : String(body.model || '').includes('opus') ? 'max' : 'smart'));
    const allowed = hasOverride ? ['quick', 'smart', 'max'] : (PLAN_ENGINES[plan] || PLAN_ENGINES.free);
    const tier = allowed.includes(wanted) ? wanted : allowed[allowed.length - 1];
    const engine = ENGINES[tier];
    const limit = hasOverride ? Math.max(0, Math.round(Number(usd_limit) * 130)) : (PLAN_CREDITS[plan] ?? PLAN_CREDITS.free);
    const hasImages = JSON.stringify(body.messages || '').includes('"image"');
    if (hasImages && !(hasOverride || VISION_PLANS.includes(plan)))
      return json({ error: 'Thumbnail vision needs Creator Pro. Upgrade to analyze images.', upgrade: true }, 402, cors);

    // 4. Atomically reserve credits (also enforces a per-user rate limit). This
    //    closes the check-then-increment race: concurrent calls are serialized.
    const rRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/try_consume_credits`, {
      method: 'POST', headers: svc, body: JSON.stringify({ uid: user.id, amount: engine.credits, lim: limit }),
    });
    const status = (await rRes.json().catch(() => 'error'));
    if (status === 'rate_limited') return json({ error: 'Slow down — one check at a time. Try again in a second.' }, 429, cors);
    if (status === 'over_limit' || status === 'no_profile')
      return json({ error: `Not enough credits for the ${tier} engine (needs ${engine.credits} of ${limit}). Upgrade or switch to a lighter engine.`, upgrade: true }, 402, cors);
    if (status !== 'ok') return json({ error: 'Could not start the check. Try again.' }, 500, cors);

    // 5. Call Anthropic with YOUR key (max_tokens clamped to the abuse ceiling)
    const { engine: _e, ...rest } = body;
    const maxTok = Math.min(parseInt(rest.max_tokens, 10) || 2000, MAX_OUTPUT_TOKENS);
    let aRes, out;
    try {
      aRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
        body: JSON.stringify({ ...rest, max_tokens: maxTok, model: engine.id }),
      });
      out = await aRes.text();
    } catch (e) {
      // Network/Anthropic failure → refund the reserved credits.
      await refund(env, svc, user.id, engine.credits);
      return json({ error: 'Upstream AI request failed. Your credits were not charged.' }, 502, cors);
    }

    // 6. Refund the reservation if the call did not succeed.
    if (!aRes.ok) await refund(env, svc, user.id, engine.credits);

    return new Response(out, { status: aRes.status, headers: { ...cors, 'content-type': 'application/json' } });
  },
};

async function refund(env, svc, uid, amount) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/refund_credits`, {
      method: 'POST', headers: svc, body: JSON.stringify({ uid, amount }),
    });
  } catch (e) {}
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
