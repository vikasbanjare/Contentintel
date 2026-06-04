// ContentIntel image proxy — Cloudflare Worker.
// Keeps your image-gen API keys server-side (never in the browser), fixes the
// NVIDIA CORS problem, and lets you share your site on your own keys.
//
// DEPLOY (no command line needed):
// 1. Go to dash.cloudflare.com → Workers & Pages → Create → Worker.
// 2. Replace the default code with THIS file, click Deploy.
// 3. Worker → Settings → Variables → add secrets:
//      NVIDIA_KEY = nvapi-...        (your NVIDIA key, for FLUX)
//      GOOGLE_KEY = AIza...          (optional, for Gemini)
//    (Optional) ALLOW_ORIGIN = https://vikasbanjare.github.io   to lock it to your site.
// 4. Copy the Worker URL (https://xxx.workers.dev) and paste it into the app:
//      Settings → "Image proxy URL".
// 5. (Recommended) add a Cloudflare Rate Limiting rule on the Worker route so
//    visitors can't drain your free quota.

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return j({ error: "POST only" }, 405, cors);

    let body;
    try { body = await request.json(); } catch (e) { return j({ error: "bad json" }, 400, cors); }
    const provider = body.provider;

    try {
      if (provider === "flux") {
        if (!env.NVIDIA_KEY) return j({ error: "Worker is missing NVIDIA_KEY secret" }, 500, cors);
        const r = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
          method: "POST",
          headers: { "content-type": "application/json", "accept": "application/json", "authorization": "Bearer " + env.NVIDIA_KEY },
          body: JSON.stringify(body.payload || {}),
        });
        return passthrough(r, cors);
      }
      if (provider === "gemini") {
        if (!env.GOOGLE_KEY) return j({ error: "Worker is missing GOOGLE_KEY secret" }, 500, cors);
        const model = (body.model || "gemini-2.5-flash-image").replace(/[^a-zA-Z0-9._-]/g, "");
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GOOGLE_KEY}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body.payload || {}),
        });
        return passthrough(r, cors);
      }
      if (provider === "reve") {
        if (!env.REVE_KEY) return j({ error: "Worker is missing REVE_KEY secret" }, 500, cors);
        // Default = AI/ML API OpenAI-style. If your Reve key is from another
        // provider, set REVE_URL (and adjust the body in the app) to match.
        const url = env.REVE_URL || "https://api.aimlapi.com/v1/images/generations";
        const r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "authorization": "Bearer " + env.REVE_KEY },
          body: JSON.stringify(body.payload || {}),
        });
        return passthrough(r, cors);
      }
      return j({ error: "unknown provider" }, 400, cors);
    } catch (e) {
      return j({ error: String(e && e.message || e) }, 502, cors);
    }
  },
};

async function passthrough(r, cors) {
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { "content-type": "application/json", ...cors } });
}
function j(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...cors } });
}
