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

    const svc = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY, 'content-type': 'application/json' };

    // Intelligence digest fetch: return the latest cron-generated digest for any
    // signed-in user (cheap read; no credits consumed).
    if (body.intel === true) {
      const iRes = await fetch(`${env.SUPABASE_URL}/rest/v1/intel_digests?select=created_at,results&order=created_at.desc&limit=1`, { headers: svc });
      const iRows = await iRes.json().catch(() => []);
      const out = (Array.isArray(iRows) && iRows[0]) || { results: null };
      // Attach the distilled knowledge (feeds the app's live prompt injection).
      const kRes = await fetch(`${env.SUPABASE_URL}/rest/v1/intel_knowledge?id=eq.1&select=updated_at,knowledge`, { headers: svc });
      const kRows = await kRes.json().catch(() => []);
      if (Array.isArray(kRows) && kRows[0]) { out.knowledge = kRows[0].knowledge; out.knowledge_updated_at = kRows[0].updated_at; }
      return json(out, 200, cors);
    }

    // 2. Load profile (plan + usage), resetting the monthly window if needed
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

  // ── Daily intelligence sweep ────────────────────────────────────────────────
  // Fires on the Cron Trigger you add in the Cloudflare dashboard
  // (Worker → Settings → Triggers → Cron Triggers → e.g. "0 6 * * *").
  // Runs the 4-domain web-research sweep server-side and stores the digest in
  // Supabase (intel_digests) so the app shows fresh intelligence with zero
  // clicks — and the accumulated history becomes trend-analysis data later.
  // Engine: GEMINI_KEY secret (free tier, Google Search grounding) if set,
  // else falls back to ANTHROPIC_KEY + web_search (a few cents per day).
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runIntelSweep(env));
  },
};

const INTEL_SYS = [
  'You are a content-intelligence analyst. Use web search to find REAL, RECENT developments for the requested domain, then produce an actionable digest for a content creator.',
  'Rules: only include things actually found via search from credible sources; prefer the last 30 days; never invent updates, dates, numbers or names; fewer items over padding.',
  'Return ONLY one JSON object, no markdown fences:',
  '{ "items": [ { "headline": "short specific headline", "what": "1-2 sentences: what changed/was found", "why": "1 sentence: why it matters to a creator", "action": "1 sentence: the concrete thing to do now", "impact": "high|medium|low" } ] }',
  'Return 3-6 items, most important first.',
].join('\n');

// Keep these domain queries in sync with src-v2/ci-intel.jsx (client sweep).
const INTEL_DOMAINS = [
  { id: 'platforms', label: 'Platform Updates', query: 'Search for social media platform updates from the LAST 30 DAYS: algorithm changes, reach/engagement ranking changes, new features, monetization and creator-program updates, AI-content policies — across Instagram, TikTok, YouTube, Facebook, LinkedIn, X/Twitter, Reddit, Threads, Pinterest, Snapchat. Prioritise official announcements and credible industry reporting.' },
  { id: 'youtube', label: 'YouTube Deep-Dive', query: 'Search for YouTube-specific changes and findings from the LAST 30 DAYS: algorithm/recommendation updates, Creator Insider announcements, thumbnail and title CTR findings, retention/watch-time research, Shorts changes, search/SEO changes, monetization and policy updates.' },
  { id: 'viral', label: 'Viral Patterns & Formats', query: 'Search for CURRENT viral content patterns (last 30 days): emerging short-form and long-form formats, hook formulas creators are using, storytelling and retention techniques, thumbnail and title trends, editing styles. Name real creators/examples where possible.' },
  { id: 'ai', label: 'AI Tools & Research', query: 'Search for NEW AI tools, models and credible research from the LAST 30 DAYS relevant to content creators: script/writing models, image and video generation, voice synthesis, AI agents/automation, and notable studies. For each: what changed and should a creator adopt now or wait.' },
];

function extractJson(text) {
  try { const m = String(text || '').match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (e) { return null; }
}

async function intelViaGemini(env, d) {
  const payload = {
    systemInstruction: { parts: [{ text: INTEL_SYS }] },
    contents: [{ role: 'user', parts: [{ text: 'DOMAIN: ' + d.label + '\n' + d.query + '\n\nReturn the JSON digest now.' }] }],
    tools: [{ google_search: {} }],
    generationConfig: { maxOutputTokens: 1600, temperature: 0.3 },
  };
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY }, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  const cand = (data.candidates || [])[0] || {};
  const text = (((cand.content || {}).parts) || []).map(p => p.text || '').join('');
  const j = extractJson(text) || {};
  const gm = cand.groundingMetadata || cand.grounding_metadata || {};
  const sources = []; const seen = new Set();
  for (const c of (gm.groundingChunks || gm.grounding_chunks || [])) {
    const w = (c && (c.web || c.retrievedContext)) || {};
    const u = w.uri || w.url;
    if (u && !seen.has(u)) { seen.add(u); sources.push({ title: (w.title || u).slice(0, 120), url: u }); }
  }
  return { items: Array.isArray(j.items) ? j.items : [], sources };
}

async function intelViaClaude(env, d) {
  // Sonnet, not Haiku — Haiku doesn't support the web_search tool.
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', max_tokens: 1600, system: INTEL_SYS,
      messages: [{ role: 'user', content: 'DOMAIN: ' + d.label + '\n' + d.query + '\n\nReturn the JSON digest now.' }],
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
    }),
  });
  if (!res.ok) throw new Error('anthropic ' + res.status);
  const data = await res.json();
  const blocks = data.content || [];
  const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('');
  const j = extractJson(text) || {};
  const sources = []; const seen = new Set();
  for (const b of blocks) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) {
        if (r && r.type === 'web_search_result' && r.url && !seen.has(r.url)) {
          seen.add(r.url); sources.push({ title: (r.title || r.url).slice(0, 120), url: r.url });
        }
      }
    }
  }
  return { items: Array.isArray(j.items) ? j.items : [], sources };
}

async function runIntelSweep(env) {
  const svc = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY, 'content-type': 'application/json' };
  // Freshness guard: the cron can safely fire hourly (or any schedule) — a real
  // sweep only runs when the newest digest is older than INTEL_MIN_HOURS
  // (default 20h). Otherwise the tick exits immediately and burns zero AI quota.
  // The digest looks back 30 days, so more than ~daily adds cost, not insight.
  const minHours = parseFloat(env.INTEL_MIN_HOURS || '20');
  try {
    const lRes = await fetch(`${env.SUPABASE_URL}/rest/v1/intel_digests?select=created_at&order=created_at.desc&limit=1`, { headers: svc });
    const lRows = await lRes.json();
    const last = Array.isArray(lRows) && lRows[0] && new Date(lRows[0].created_at).getTime();
    if (last && (Date.now() - last) < minHours * 3600e3) return;
  } catch (e) {}
  const results = {};
  for (const d of INTEL_DOMAINS) {
    try {
      results[d.id] = env.GEMINI_KEY ? await intelViaGemini(env, d) : await intelViaClaude(env, d);
      results[d.id].err = '';
    } catch (e) {
      results[d.id] = { items: [], sources: [], err: String((e && e.message) || e) };
    }
    await new Promise(r => setTimeout(r, 1500)); // gentle pacing
  }
  // Store the digest (history accumulates -> future trend analysis data).
  await fetch(`${env.SUPABASE_URL}/rest/v1/intel_digests`, {
    method: 'POST', headers: { ...svc, Prefer: 'return=minimal' }, body: JSON.stringify({ results }),
  });
  // Prune digests older than 90 days to keep the table bounded.
  const cutoff = new Date(Date.now() - 90 * 864e5).toISOString();
  await fetch(`${env.SUPABASE_URL}/rest/v1/intel_digests?created_at=lt.${encodeURIComponent(cutoff)}`, {
    method: 'DELETE', headers: svc,
  }).catch(() => {});
  // Self-improving loop: distill the recent digests into compact per-area
  // guidance that the app injects into every tool's prompt (thumbnail, title,
  // platform). Failure here never breaks the sweep itself.
  try { await distillKnowledge(env, svc); } catch (e) {}
}

// Distill 14 days of digests → durable, actionable guidance for prompt injection.
const INTEL_DISTILL_SYS = [
  'You distill content-intelligence digest items into compact guidance that will be injected into AI prompts for creator tools.',
  'Only keep findings that are actionable and likely durable (weeks, not hours); drop one-off news, launches without workflow impact, and anything speculative. Merge duplicates across days.',
  'Return ONLY one JSON object, no markdown:',
  '{ "thumbnail": "2-4 sentences: current thumbnail best-practice updates", "title": "2-4 sentences: current title/CTR guidance", "platform": "2-4 sentences: cross-platform algorithm & posting guidance", "general": "1-3 sentences: the biggest current shift creators must know" }',
  'Plain text values, each under 450 characters. Use "" for a field with nothing genuinely new.',
].join('\n');

async function distillKnowledge(env, svc) {
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/intel_digests?select=created_at,results&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=14`, { headers: svc });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) return;
  const lines = [];
  for (const row of rows) {
    const day = String(row.created_at || '').slice(0, 10);
    for (const [dom, res] of Object.entries(row.results || {})) {
      for (const it of ((res && res.items) || [])) {
        lines.push(`${day} [${dom}] ${it.headline || ''} :: ${it.what || ''} :: ${it.action || ''}`);
      }
    }
  }
  if (!lines.length) return;
  const corpus = 'DIGEST ITEMS (newest first):\n' + lines.join('\n').slice(0, 12000) + '\n\nDistil now.';
  const text = env.GEMINI_KEY ? await geminiPlainText(env, INTEL_DISTILL_SYS, corpus) : await claudePlainText(env, INTEL_DISTILL_SYS, corpus);
  const j = extractJson(text);
  if (!j || typeof j !== 'object') return;
  const knowledge = {
    thumbnail: String(j.thumbnail || '').slice(0, 600),
    title: String(j.title || '').slice(0, 600),
    platform: String(j.platform || '').slice(0, 600),
    general: String(j.general || '').slice(0, 400),
  };
  await fetch(`${env.SUPABASE_URL}/rest/v1/intel_knowledge`, {
    method: 'POST',
    headers: { ...svc, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 1, updated_at: new Date().toISOString(), knowledge }),
  });
}

// Plain text generation (no search tools) — used by the distillation step.
async function geminiPlainText(env, sys, user) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 900, temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  return ((((data.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('');
}

async function claudePlainText(env, sys, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 900, system: sys, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error('anthropic ' + res.status);
  const data = await res.json();
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

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
