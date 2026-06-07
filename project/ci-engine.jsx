// ContentIntel -- engine: BYO-key auth, real Claude calls, token estimate,
// generic report renderer, analysis hook. (Client-side, no backend.)

const { MOODS: EM } = window;

// ── Config (editable) ────────────────────────────────────────────────────────
// Prices are per 1,000,000 tokens (USD) and are APPROXIMATE -- adjust to match
// Anthropic's current pricing. They only drive the on-screen cost estimate.
const CI_MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 -- fastest & cheapest", inP: 1.0,  outP: 5.0  },
  { id: "claude-sonnet-4-6",         label: "Sonnet 4.6 -- balanced (default)", inP: 3.0,  outP: 15.0 },
  { id: "claude-opus-4-8",           label: "Opus 4.8 -- most thorough",        inP: 15.0, outP: 75.0 },
];
const CI_DEFAULT_MODEL = "claude-sonnet-4-6";
const CI_OUTPUT_GUESS = 900; // tokens assumed for the report when estimating cost

const ADMIN_PASS = "vikas-intel-2026"; // your private unlock phrase for the Research editor

// ── Local storage (key + model live only in the user's browser) ──────────────
const LS_KEY = "ci_anthropic_key";
const LS_MODEL = "ci_model";
const getKey   = () => { try { return localStorage.getItem(LS_KEY) || ""; } catch (e) { return ""; } };
const setKeyLS = (k) => { try { k ? localStorage.setItem(LS_KEY, k) : localStorage.removeItem(LS_KEY); } catch (e) {} };
// Optional Google AI Studio key -- used ONLY for image generation (Gemini image model).
const LS_GKEY = "ci_google_key";
const getGoogleKey   = () => { try { return localStorage.getItem(LS_GKEY) || ""; } catch (e) { return ""; } };
const setGoogleKeyLS = (k) => { try { k ? localStorage.setItem(LS_GKEY, k) : localStorage.removeItem(LS_GKEY); } catch (e) {} };
// Optional NVIDIA API key -- used for FLUX image generation (free tier).
const LS_NVKEY = "ci_nvidia_key";
const getNvidiaKey   = () => { try { return localStorage.getItem(LS_NVKEY) || ""; } catch (e) { return ""; } };
const setNvidiaKeyLS = (k) => { try { k ? localStorage.setItem(LS_NVKEY, k) : localStorage.removeItem(LS_NVKEY); } catch (e) {} };
// Optional Reve key -- image generation (provider varies; default AI/ML API style).
const LS_REVE = "ci_reve_key";
const getReveKey   = () => { try { return localStorage.getItem(LS_REVE) || ""; } catch (e) { return ""; } };
const setReveKeyLS = (k) => { try { k ? localStorage.setItem(LS_REVE, k) : localStorage.removeItem(LS_REVE); } catch (e) {} };
// Optional proxy URL (Cloudflare Worker). When set, image calls go through it
// so keys stay server-side and browser CORS is bypassed.
const LS_PROXY = "ci_proxy_url";
const getProxyUrl   = () => { try { return (localStorage.getItem(LS_PROXY) || "").trim(); } catch (e) { return ""; } };
const setProxyUrlLS = (u) => { try { u ? localStorage.setItem(LS_PROXY, u) : localStorage.removeItem(LS_PROXY); } catch (e) {} };
const getModel = () => { try { return localStorage.getItem(LS_MODEL) || CI_DEFAULT_MODEL; } catch (e) { return CI_DEFAULT_MODEL; } };
const setModelLS = (m) => { try { localStorage.setItem(LS_MODEL, m); } catch (e) {} };
const modelInfo = (id) => CI_MODELS.find(m => m.id === (id || getModel())) || CI_MODELS[1];

// True when running inside a Claude preview/artifact (Anthropic provides free AI there).
const hasSandbox = () => { try { return typeof window !== "undefined" && window.claude && typeof window.claude.complete === "function"; } catch (e) { return false; } };
// Can we run a REAL analysis right now? Either the user's own key OR the free Claude sandbox.
const canRun = () => !!getKey() || hasSandbox();

// ── Research access (falls back to a tiny default so nothing ever breaks) ────
const DEFAULT_RESEARCH = {
  script:    { label: "Script",    systemGuidance: "Evaluate the script's hook, retention and CTA. Be specific and give rewrites.", rubric: [{ name: "Hook", what: "" }, { name: "Retention", what: "" }, { name: "CTA", what: "" }], notes: "" },
  thumbnail: { label: "Thumbnail", systemGuidance: "Judge whether the thumbnail earns the click in a feed.", rubric: [{ name: "Clarity", what: "" }, { name: "Face", what: "" }, { name: "Contrast", what: "" }], notes: "" },
  title:     { label: "Title",     systemGuidance: "Judge click-worthiness, clarity, truncation. Give 10 alternatives.", rubric: [{ name: "Click chance", what: "" }, { name: "Curiosity", what: "" }, { name: "Clarity", what: "" }], notes: "" },
  ads:       { label: "Ads",       systemGuidance: "Check limits, truncation, scroll-stopping power.", rubric: [{ name: "Scroll-stop", what: "" }, { name: "Copy", what: "" }, { name: "CTA fit", what: "" }], notes: "" },
};
function liveResearch() {
  return (typeof window !== "undefined" && window.__CI_RESEARCH_OVERRIDE) || window.CI_RESEARCH || {};
}
function getResearch(type) {
  const live = liveResearch();
  return (live && live[type]) || DEFAULT_RESEARCH[type] || {};
}

// Private, browser-only research draft (the owner's "keep adding" layer).
// Loaded at startup as an override so it never ships to other visitors until
// the owner downloads research.js and redeploys.
const LS_RESEARCH = "ci_research_local";
function loadLocalResearch() {
  try { const raw = localStorage.getItem(LS_RESEARCH); if (raw) window.__CI_RESEARCH_OVERRIDE = JSON.parse(raw); } catch (e) {}
}
function saveLocalResearch(obj) {
  try { localStorage.setItem(LS_RESEARCH, JSON.stringify(obj)); } catch (e) {}
  window.__CI_RESEARCH_OVERRIDE = obj;
}
function clearLocalResearch() {
  try { localStorage.removeItem(LS_RESEARCH); } catch (e) {}
  window.__CI_RESEARCH_OVERRIDE = null;
}
function hasLocalResearch() { try { return !!localStorage.getItem(LS_RESEARCH); } catch (e) { return false; } }
loadLocalResearch();

// ── Analysis history (saved locally per browser) ─────────────────────────────
const LS_HISTORY = "ci_history";
function loadHistory() { try { return JSON.parse(localStorage.getItem(LS_HISTORY)) || []; } catch (e) { return []; } }
function saveHistory(rec) {
  try {
    const arr = loadHistory();
    arr.unshift(rec);
    localStorage.setItem(LS_HISTORY, JSON.stringify(arr.slice(0, 50)));
  } catch (e) {}
}
function clearHistory() { try { localStorage.removeItem(LS_HISTORY); } catch (e) {} }

// ── Token estimate (rough: ~4 chars/token) ───────────────────────────────────
function estTokens(...strings) {
  const chars = strings.filter(Boolean).join(" ").length;
  return Math.max(1, Math.ceil(chars / 4));
}
function fmtTokens(n) {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
}
function estCost(inTok, outTok, model) {
  const m = modelInfo(model);
  return (inTok / 1e6) * m.inP + (outTok / 1e6) * m.outP;
}
function fmtCost(usd) {
  if (usd < 0.01) return "<$0.01";
  return "$" + usd.toFixed(2);
}

// ── The real call -- direct browser → Anthropic (BYO key) ─────────────────────
async function callClaude({ system, userText, image, images, model, maxTokens = 1800 }) {
  const key = getKey();
  // Normalise to an array so single- and multi-image (compare) paths share code.
  const imgs = (images && images.length) ? images.filter(Boolean) : (image ? [image] : []);
  // No personal key? If we're inside a Claude preview/artifact, use its free AI.
  if (!key) {
    if (hasSandbox()) {
      const prompt = [
        system, "",
        imgs.length ? "(IMPORTANT: " + imgs.length + " image(s) were attached but the free preview AI CANNOT see images. Do NOT guess what the image looks like or invent a thumbnail. Judge ONLY from any text description the user wrote; if there is none, say you cannot see the image and ask them to describe it or add an API key -- and give no scores or regen prompt for an image you cannot see.)" : "",
        userText,
      ].filter(Boolean).join("\n");
      // Claude artifact API: takes a single STRING prompt, returns a STRING.
      const out = await window.claude.complete(prompt);
      return { text: typeof out === "string" ? out : String(out || ""), usage: null };
    }
    throw new Error("NO_KEY");
  }
  const content = imgs.length
    ? [
        ...imgs.flatMap((im, i) => [
          ...(imgs.length > 1 ? [{ type: "text", text: `Image ${i + 1}:` }] : []),
          { type: "image", source: { type: "base64", media_type: im.mime, data: im.data } },
        ]),
        { type: "text", text: userText },
      ]
    : userText;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: model || getModel(), max_tokens: maxTokens, system, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch (e) {}
    if (res.status === 401) throw new Error("Invalid API key. Check it in Settings.");
    if (res.status === 429) throw new Error("Rate limited or out of credit on this key.");
    throw new Error(detail || ("Request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("");
  return { text, usage: data.usage || null };
}

// ── Image generation (Gemini) -- edits the user's thumbnail per the instruction ─
// BYO Google AI Studio key. Returns a data: URL (or throws a clear error).
async function generateThumbnail({ instruction, image, model }) {
  const mdl = model || "gemini-2.5-flash-image";
  const parts = [{ text: instruction }];
  if (image && image.data) parts.push({ inline_data: { mime_type: image.mime || "image/png", data: image.data } });
  const payload = { contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE"] } };
  // Gemini supports browser CORS, so call it DIRECTLY when a Google key is set.
  // Only fall back to the proxy when there's no key (e.g. a shared deployment).
  const key = getGoogleKey();
  const proxy = getProxyUrl();
  let res;
  if (key) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
  } else if (proxy) {
    try { res = await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "gemini", model: mdl, payload }) }); }
    catch (e) { throw new Error("Couldn't reach your proxy URL (" + (e && e.message || "network/CORS") + "). Check it in Settings."); }
  } else {
    throw new Error("NO_GOOGLE_KEY");
  }
  if (!res.ok) {
    let detail = ""; try { detail = (await res.json())?.error?.message || ""; } catch (e) {}
    if (res.status === 400 && /API key|invalid/i.test(detail)) throw new Error("That Google AI key looks invalid -- check it in Settings.");
    throw new Error(detail || ("Image request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const ps = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  for (const p of ps) {
    const inl = p.inlineData || p.inline_data;
    if (inl && inl.data) return "data:" + (inl.mimeType || inl.mime_type || "image/png") + ";base64," + inl.data;
  }
  throw new Error("The image model returned no image. Try again or simplify the request.");
}

// Image generation via NVIDIA-hosted FLUX (text-to-image). BYO NVIDIA key.
// flux.2-klein-4b is text-to-image, so it generates FROM the description (it
// can't preserve the user's exact photo the way Gemini's image edit can).
async function generateThumbnailFlux({ prompt, model, size }) {
  const mdl = model || "black-forest-labs/flux.2-klein-4b";
  const payload = { model: mdl, prompt, n: 1, response_format: "b64_json", size: size || "1024x1024" };
  const proxy = getProxyUrl();
  let res;
  if (proxy) {
    try { res = await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "flux", payload }) }); }
    catch (e) { throw new Error("Couldn't reach your proxy URL (" + (e && e.message || "network/CORS") + "). Open the URL in a browser -- it should say 'POST only'. Check it in Settings."); }
  } else {
    const key = getNvidiaKey();
    if (!key) throw new Error("NO_NV_KEY");
    try {
      res = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
        method: "POST",
        headers: { "content-type": "application/json", "accept": "application/json", "authorization": "Bearer " + key },
        body: JSON.stringify(payload),
      });
    } catch (e) { throw new Error("Couldn't reach NVIDIA from the browser (CORS). Add a proxy URL in Settings (the Cloudflare Worker)."); }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new Error("NVIDIA key was rejected -- check it in Settings.");
    throw new Error(err.detail || (err.error && err.error.message) || ("FLUX request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const item = ((data.data || data.artifacts || [])[0]) || {};
  let b64 = item.b64_json || item.base64 || item.b64 || data.image || data.b64_json || "";
  b64 = String(b64).replace(/^data:[^,]+,/, "");
  if (!b64) throw new Error("FLUX returned no image. Try again.");
  return "data:image/png;base64," + b64;
}

// Image generation via Reve (text-to-image). Default endpoint = AI/ML API
// OpenAI-style; adjust in the Worker (REVE_URL) if your key is from another
// Reve provider. Prefer the proxy (direct browser calls are likely CORS-blocked).
async function generateThumbnailReve({ prompt, model, size }) {
  const mdl = model || "reve/create-image";
  const payload = { model: mdl, prompt, n: 1, response_format: "b64_json" };
  const proxy = getProxyUrl();
  let res;
  if (proxy) {
    try { res = await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "reve", payload }) }); }
    catch (e) { throw new Error("Couldn't reach your proxy URL (" + (e && e.message || "network/CORS") + "). Open the URL in a browser -- it should say 'POST only'. Check it in Settings."); }
  } else {
    const key = getReveKey();
    if (!key) throw new Error("NO_REVE_KEY");
    try {
      res = await fetch("https://api.aimlapi.com/v1/images/generations", {
        method: "POST", headers: { "content-type": "application/json", "authorization": "Bearer " + key },
        body: JSON.stringify(payload),
      });
    } catch (e) { throw new Error("Couldn't reach Reve from the browser (likely CORS). Add a proxy URL in Settings."); }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new Error("Reve key was rejected -- check it in Settings.");
    throw new Error(err.detail || (err.error && err.error.message) || ("Reve request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const item = ((data.data || data.images || data.artifacts || [])[0]) || {};
  if (item.b64_json) return "data:image/png;base64," + item.b64_json;
  if (item.base64) return "data:image/png;base64," + item.base64;
  if (item.url) return item.url;
  if (data.url) return data.url;
  throw new Error("Reve returned no image (the response format may differ -- share your provider's docs and I'll adjust).");
}

// Image-gen handoff: copy the prompt + open the tool in a new tab. The user
// pastes their own photo(s) there and presses enter -- generation runs on their
// own ChatGPT / Gemini plan (no key, no cost to us, no flaky free generator).
function openInChatGPT(promptText) {
  const p = String(promptText || "");
  try { window.copyText && window.copyText(p); } catch (e) {}
  window.open("https://chatgpt.com/?q=" + encodeURIComponent(p.slice(0, 6000)), "_blank", "noopener,noreferrer");
}
function openInGemini(promptText) {
  const p = String(promptText || "");
  // Gemini's web app can't be pre-filled via URL, so we copy the prompt for the
  // user to paste. Copy SYNCHRONOUSLY (inside the click) so it lands on the
  // clipboard before the new tab steals focus -- the async clipboard API often
  // gets cancelled by window.open, which is why pasting was failing.
  try {
    const ta = document.createElement("textarea");
    ta.value = p; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "-9999px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { ta.setSelectionRange(0, p.length); } catch (e) {}
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) {}
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p); } catch (e) {}
  window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
}

// Pull the grounded regen prompt out of a report (falls back to the biggest fix).
function regenPromptFromReport(report) {
  const secs = (report && report.sections) || [];
  for (const s of secs) {
    if (s && s.type === "text" && /regen|KEEP:|CHANGE ONLY/i.test((s.title || "") + " " + (s.body || ""))) return s.body;
  }
  for (const s of secs) {
    if (s && s.type === "copy") for (const b of (s.blocks || [])) if (/KEEP:|CHANGE ONLY|regen/i.test((b.label || "") + " " + (b.text || ""))) return b.text;
  }
  return (report && report.bottomLine) || "";
}

// ── Prompt builder + JSON report parsing ─────────────────────────────────────
const REPORT_SHAPE =
`Return ONLY a single valid JSON object -- no markdown fences, no text before or after it -- in exactly this shape:
{
  "verdict": { "level": "green|yellow|red", "title": "short verdict", "text": "1-2 sentence summary" },
  "overall": 0-100,
  "winner": { "pick": "A|B|C|tie", "label": "what won, e.g. 'Version A' or 'Thumbnail B'", "why": "one specific sentence" },
  "scores": [ { "name": "string", "score": 0-100, "why": "plain-English reason" } ],
  "sections": [
     { "type": "graph",     "title": "string", "desc": "optional", "points": [ { "label": "short x-axis label e.g. '0:00 Hook'", "value": 0-100 } ] },
     { "type": "beats",     "title": "string", "items": [ { "t": "0:00", "label": "HOOK", "text": "the actual line", "level": "green|yellow|red", "note": "optional one-liner" } ] },
     { "type": "issues",    "title": "string", "items": [ { "level": "green|yellow|red", "text": "string" } ] },
     { "type": "copy",      "title": "string", "desc": "optional", "blocks": [ { "label": "Copy", "text": "string", "mono": false } ] },
     { "type": "kv",        "title": "string", "rows": [ { "k": "label", "v": "value", "level": "green|yellow|red (optional)" } ] },
     { "type": "checklist", "title": "string", "items": [ { "state": "yes|no|mid", "text": "string" } ] },
     { "type": "text",      "title": "string", "body": "string" }
  ],
  "bottomLine": "one honest paragraph: what to fix and the single highest-impact change"
}
Rules:
- ALWAYS include "overall" (0-100), a single headline score for the whole piece.
- For a SCRIPT, ALWAYS include a "graph" section (the predicted attention/quality curve across the runtime, 6-10 points whose VALUE dips at weak/slow moments) AND a "beats" section (the script split into labelled beats -- HOOK, CONTEXT/SETUP, PROOF, TURN, PAYOFF, CTA, etc. -- each with the actual line text and a level). The graph's x-labels and the beats should line up in order.
- "winner" is ONLY for A/B comparisons (two versions / two thumbnails / two titles). Include it and name the winner clearly when comparing. OMIT it entirely for single-item checks.
- Only include a compliance/regulatory section when the topic actually calls for it (financial, medical, legal, gambling and similar regulated claims). For ordinary content, do NOT add any compliance note.
- BE CONCISE AND SCANNABLE -- this is quick pre-publish feedback, not an essay. At MOST 4 sections (prefer 2-3); at most 6 scores; at most 4 issue items. Every string is ONE short sentence -- only a single regeneration-prompt "text" body may run longer. "bottomLine" ≤ 2 sentences. Never make the same point in two places.
- Quote the user's actual words; pair each criticism with a one-line, copy-ready fix.
- The JSON must be COMPLETE and valid -- close every brace and bracket, escape quotes inside strings, and never stop mid-object.
- Write in the same language and script as the user's content.`;

// Split provenPatterns (blocks separated by blank lines) and derive niche names.
function splitPlaybookBlocks(text) {
  return String(text || "").split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
}
function nicheName(block) {
  const nl = block.indexOf("\n");
  const head = (nl === -1 ? block : block.slice(0, nl)).trim();
  return head.split(/\s+\(|\s+--|\s+-\s/)[0].trim();
}
function nicheNames(type = "thumbnail") {
  return splitPlaybookBlocks((getResearch(type) || {}).provenPatterns).map(nicheName);
}

// opts: { niche: "Auto-detect" | "<niche name>" | "None (universal)", relax: bool }
function buildSystem(type, opts = {}) {
  const r = getResearch(type);
  const core = liveResearch().core || "";
  const rubric = (r.rubric || []).map(x => `- ${x.name}: ${x.what || ""}`).join("\n");
  // Niche routing -- inject ONLY the relevant playbook to stop cross-niche bias.
  let provenText = r.provenPatterns || "";
  const niche = opts.niche;
  if (provenText && niche && niche !== "Auto-detect") {
    if (niche === "None (universal)") provenText = "";
    else provenText = splitPlaybookBlocks(provenText).filter(b => nicheName(b) === niche).join("\n\n");
  } else if (provenText && opts.compactPlaybook && (!niche || niche === "Auto-detect")) {
    // Token saver: when auto-detecting, don't dump EVERY niche playbook. Send
    // just the niche names + a self-detect instruction (cuts input tokens a lot).
    const names = splitPlaybookBlocks(provenText).map(nicheName).filter(Boolean);
    provenText = names.length
      ? `Detect which of these niches the content belongs to, then apply that niche's known conventions from your own knowledge: ${names.join(", ")}. If it matches none, use universal principles only.`
      : "";
  }
  // Optional structured design library (currently used by the thumbnail check).
  const cat = (arr) => (arr || []).map(x => `- ${x.name}: ${x.what || ""}`).join("\n");
  const libParts = [];
  if (r.layouts && r.layouts.length)      libParts.push(`LAYOUT ARCHETYPES (classify this content as one, or "unclear"):\n${cat(r.layouts)}`);
  if (r.colorSchemes && r.colorSchemes.length) libParts.push(`COLOUR SCHEMES (classify, or "unclear"):\n${cat(r.colorSchemes)}`);
  if (r.designPrinciples)                  libParts.push(`DESIGN PRINCIPLES (from top performers -- apply where relevant):\n${r.designPrinciples}`);
  if (provenText)                          libParts.push(`PROVEN PATTERNS -- niche-scoped playbook(s). Use a playbook ONLY when the content clearly belongs to that niche; if it matches none, IGNORE these entirely and rely on the universal principles + the actual content + the brand. Do NOT import a niche's devices (yellow highlight, ₹Crore number, founder cut-out, arrow) into content that isn't in that niche:\n${provenText}`);
  if (r.regenGuidance)                     libParts.push(`REGENERATION-PROMPT RULES:\n${r.regenGuidance}`);
  if (r.abTesting)                         libParts.push(`A/B TESTING:\n${r.abTesting}`);
  const library = libParts.length ? `DESIGN LIBRARY -- reference for SCORING & classification ONLY. It is NOT a source of new elements, palette, people, brands or style for the regeneration, and it must NEVER override what is actually in the user's content. Apply a niche playbook only when the content clearly belongs to that niche; otherwise ignore it entirely:\n"""\n${libParts.join("\n\n")}\n"""` : "";
  return [
    `You are ContentIntel -- a blunt, specific, pre-publish ${r.label || type} reviewer for content creators of EVERY niche, language, region and platform.`,
    `Adapt to the content you are given: detect its language, region, audience, platform and topic, and judge it by what actually works for THAT context. Never assume a fixed country, language or niche. Reply in the content's own language.`,
    core ? `RESEARCH CONTEXT (principles -- apply what's relevant, ignore what isn't):\n"""\n${core}\n"""` : "",
    `${r.label || type}-SPECIFIC METHODOLOGY -- use this as your evaluation framework:`,
    `"""`, r.systemGuidance || "", `"""`,
    library,
    opts.relax ? `EDIT FREEDOM: the user enabled BOLD REDESIGN -- you MAY change layout, composition and colours more boldly for a stronger thumbnail. But STILL keep the same person(s) and their count, the same topic, and the EXACT text & typography, unless the user explicitly asked to change them.` : "",
    rubric ? `Score these dimensions (0-100):\n${rubric}` : "",
    r.notes ? `Extra: ${r.notes}` : "",
    REPORT_SHAPE,
  ].filter(Boolean).join("\n\n");
}

// Repair truncated/unbalanced JSON: close any open string and brackets so a
// cut-off model response still parses (we lose only the incomplete tail).
function repairJson(s) {
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === "{") stack.push("}");
      else if (c === "[") stack.push("]");
      else if (c === "}" || c === "]") stack.pop();
    }
  }
  let out = s;
  if (inStr) out += '"';           // close a dangling string
  out = out.replace(/,\s*$/, "");  // drop a dangling comma
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i];
  return out;
}

// Robust: tolerate code fences, surrounding prose, trailing commas AND
// truncated responses. Returns null (never throws) when nothing is usable.
function parseReport(text) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{");
  if (s === -1) return null;
  t = t.slice(s); // from first "{" to the end -- don't trim the tail (handle cut-offs)
  const tryParse = (x) => { try { return JSON.parse(x); } catch (e) { return undefined; } };
  let r = tryParse(t);
  if (r !== undefined) return r;
  r = tryParse(t.replace(/,\s*([}\]])/g, "$1")); // drop trailing commas
  if (r !== undefined) return r;
  r = tryParse(repairJson(t));                   // close a truncated tail
  if (r !== undefined) return r;
  // Last resort: walk back to earlier "}" boundaries, repairing each time, so a
  // long report that was cut mid-section still renders everything that completed.
  let idx = t.length;
  for (let n = 0; n < 50 && idx > 0; n++) {
    idx = t.lastIndexOf("}", idx - 1);
    if (idx === -1) break;
    r = tryParse(repairJson(t.slice(0, idx + 1)));
    if (r !== undefined) return r;
  }
  return null;
}

// ── useAnalysis -- shared runner for every checker tab ────────────────────────
// state: idle | loading | done | error
// when done with report=null → the tab shows its built-in SAMPLE (no key path)
function useAnalysis(type) {
  const [state, setState] = React.useState("idle");
  const [report, setReport] = React.useState(null);
  const [usage, setUsage] = React.useState(null);
  const [err, setErr] = React.useState("");

  async function run({ userText, image, images, maxTokens, system }) {
    setErr(""); setReport(null); setUsage(null); setState("loading");
    if (!canRun()) { // sample mode -- no key and not in a Claude preview
      setTimeout(() => setState("done"), 850);
      return;
    }
    try {
      const { text, usage } = await callClaude({ system: system || buildSystem(type), userText, image, images, maxTokens });
      let json = parseReport(text);
      if (!json || typeof json !== "object") {
        // Model didn't return clean JSON -- show its analysis as plain text rather than failing.
        const body = (text || "").trim();
        if (!body) throw new Error("The AI returned an empty response. Try again.");
        json = { sections: [{ type: "text", title: "Analysis", body }] };
      }
      setReport(json); setUsage(usage); setState("done");
      try {
        const vd = json.verdict || {};
        saveHistory({ type, t: Date.now(), level: vd.level || "yellow",
          score: typeof json.overall === "number" ? Math.round(json.overall) : null,
          title: vd.title || (json.winner && json.winner.label) || "Analysis" });
      } catch (e) {}
    } catch (e) {
      if (String(e.message) === "NO_KEY") { setTimeout(() => setState("done"), 600); return; }
      setErr(e.message || "Something went wrong."); setState("error");
    }
  }
  return { state, report, usage, err, run, reset: () => setState("idle") };
}

// ── AnalyzeButton -- Run button that shows the token estimate ─────────────────
function AnalyzeButton({ mood, onClick, loading, estIn, label = "Analyze", model }) {
  const inTok = estIn + 0;
  const total = inTok + CI_OUTPUT_GUESS;
  const cost = estCost(inTok, CI_OUTPUT_GUESS, model);
  const hasKey = !!getKey();
  const free = !hasKey && hasSandbox(); // free Claude preview AI
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <GlowButton mood={mood} size="lg" onClick={onClick} style={{ justifyContent: "center" }}>
        {loading ? (
          <>
            <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%" }} className="spin" />
            Analyzing...
          </>
        ) : (
          <>
            {label} <span style={{ opacity: 0.7, fontWeight: 500 }}>· ~{fmtTokens(total)} tokens</span> →
          </>
        )}
      </GlowButton>
      <span className="ci-est">
        est. {fmtTokens(inTok)} in + ~{fmtTokens(CI_OUTPUT_GUESS)} out · ~{fmtCost(cost)}
        {free && <span style={{ color: "var(--text-4)" }}> · free preview AI</span>}
        {!hasKey && !free && <span style={{ color: "var(--text-4)" }}> · sample only -- add your key</span>}
      </span>
    </div>
  );
}

// ── UsageBadge -- actual tokens after a real run ──────────────────────────────
function UsageBadge({ usage, model }) {
  if (!usage) return null;
  const inT = usage.input_tokens || 0, outT = usage.output_tokens || 0;
  const cost = estCost(inT, outT, model);
  return (
    <div className="ci-usage">
      ✓ Real analysis · used {fmtTokens(inT)} in + {fmtTokens(outT)} out = <b>{fmtTokens(inT + outT)} tokens</b> · ~{fmtCost(cost)}
    </div>
  );
}

// ── ErrorCard ────────────────────────────────────────────────────────────────
function ErrorCard({ msg, onOpenKey }) {
  return (
    <div className="ci-block" style={{ marginTop: 14, border: "1px solid rgba(245,120,140,0.3)", background: "linear-gradient(120deg, rgba(240,90,110,0.1), rgba(240,90,110,0.03))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className="ci-dot red" /> <b style={{ fontSize: 14 }}>Couldn't run the analysis</b>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{msg}</div>
      <button className="ci-copybtn" style={{ height: 32, marginTop: 12 }} onClick={onOpenKey}>Open Settings</button>
    </div>
  );
}

// Collapsible card -- keeps long detail (regen prompts, checklists, tables)
// tucked away so the report stays scannable. Styled like a Block.
function Collapsible({ title, desc, children }) {
  return (
    <details className="ci-block ci-collapse" style={{ padding: 0 }}>
      <summary style={{ cursor: "pointer", padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>
        <span>{title}</span>
        <span className="ci-collapse-caret" style={{ opacity: 0.45, fontSize: 11.5, marginLeft: 10, whiteSpace: "nowrap" }}>tap to open ▾</span>
      </summary>
      <div style={{ padding: "0 16px 16px" }}>
        {desc && <div style={{ fontSize: 12.5, color: "var(--text-3)", margin: "0 0 10px", lineHeight: 1.5 }}>{desc}</div>}
        {children}
      </div>
    </details>
  );
}

// One ranked upgrade prompt -- copy it, or send it straight to ChatGPT / Gemini.
function GenPromptCard({ block, mood }) {
  const m = EM[mood] || EM.navy;
  const [done, setDone] = React.useState(false);
  function copy() { try { window.copyText && window.copyText(block.text); } catch (e) {} setDone(true); setTimeout(() => setDone(false), 1500); }
  return (
    <div style={{ padding: "13px 14px", borderRadius: 12, background: "rgba(0,0,0,0.22)", border: "1px solid var(--stroke-1)" }}>
      {block.label && <div style={{ fontSize: 12, fontWeight: 800, color: m.accentFrom, marginBottom: 6, letterSpacing: "0.01em" }}>{block.label}</div>}
      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{block.text}</div>
      <div style={{ display: "flex", gap: 7, marginTop: 11, flexWrap: "wrap" }}>
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12, background: `${m.accentFrom}18`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700 }} onClick={() => openInChatGPT(block.text)}>🎨 ChatGPT</button>
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12 }} onClick={() => openInGemini(block.text)}>✨ Gemini</button>
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12 }} onClick={copy}>{done ? "✓ Copied" : "⧉ Copy"}</button>
      </div>
    </div>
  );
}

// ── ReportView -- dashboard-style report renderer ─────────────────────────────
function ReportView({ report, mood }) {
  const m = EM[mood] || EM.navy;
  if (!report || typeof report !== "object") return null;
  const v = report.verdict || {};
  const sections = Array.isArray(report.sections) ? report.sections.filter(Boolean) : [];
  const graphs = sections.filter(s => s.type === "graph");
  const beats  = sections.filter(s => s.type === "beats");
  const issues = sections.filter(s => s.type === "issues");
  const rest   = sections.filter(s => !["graph", "beats", "issues"].includes(s.type));
  const hasOverall = typeof report.overall === "number";

  return (
    <div className="ci-results" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header -- verdict + overall score */}
      {(v.level || hasOverall) && (
        <Block mood={mood}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", display: "flex", gap: 12 }}>
              {v.level && <span className={"ci-dot " + v.level} style={{ marginTop: 7, flexShrink: 0 }} />}
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-1)" }}>{v.title || "Verdict"}</div>
                {v.text && <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.55, marginTop: 6 }}>{v.text}</div>}
              </div>
            </div>
            {hasOverall && <ScoreDonut value={report.overall} label="Overall" />}
          </div>
        </Block>
      )}

      {/* Winner (A/B) */}
      {report.winner && report.winner.pick && (
        <Block mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbB}66, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
          <Eyebrow mood={mood} glow>{report.winner.pick === "tie" ? "It's a tie" : "Winner"}</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 20 }}>{report.winner.pick === "tie" ? "🤝" : "🏆"}</span>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-1)" }}>
              {report.winner.label || (report.winner.pick === "tie" ? "Too close to call" : `${report.winner.pick} wins`)}
            </div>
          </div>
          {report.winner.why && <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 8, color: "var(--text-2)" }}>{report.winner.why}</div>}
        </Block>
      )}

      {/* Script quality / attention curve */}
      {graphs.map((s, i) => (
        <Block key={"g" + i} title={s.title || "Quality across the video"} desc={s.desc || "Predicted attention & retention -- dips mark the weak spots"} mood={mood}>
          <QualityGraph points={s.points} mood={mood} />
        </Block>
      ))}

      {/* Scores */}
      {Array.isArray(report.scores) && report.scores.length > 0 && (
        <Block title="Scores" mood={mood}>
          {report.scores.map((s, i) => <ScoreBar key={i} name={s.name} score={s.score} why={s.why} />)}
        </Block>
      )}

      {/* Beat sheet -- the script broken down */}
      {beats.map((s, i) => (
        <Block key={"b" + i} title={s.title || "Script breakdown"} desc={s.desc} mood={mood}>
          <BeatSheet items={s.items} />
        </Block>
      ))}

      {/* Fix these */}
      {issues.map((s, i) => (
        <Block key={"i" + i} title={s.title || "Fix these"} mood={mood}>{(s.items || []).map((it, j) => <Issue key={j} level={it.level || "yellow"}>{it.text}</Issue>)}</Block>
      ))}

      {/* Biggest fix -- the one action */}
      {report.bottomLine && (
        <Block mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
          <Eyebrow mood={mood} glow>Biggest fix</Eyebrow>
          <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 10, color: "var(--text-1)" }}>{report.bottomLine}</div>
        </Block>
      )}

      {/* Everything else -- collapsible to keep it scannable */}
      {rest.map((sec, i) => {
        if (sec.type === "copy") {
          // Thumbnail upgrade prompts: show them OPEN and prominent, each with a
          // one-click "send to ChatGPT / Gemini" so the user can generate it.
          if (/upgrade|redesign|generate/i.test(sec.title || ""))
            return (
              <Block key={"r" + i} title={sec.title || "Ways to upgrade it"} mood={mood}>
                {sec.desc && <div style={{ fontSize: 12.5, color: "var(--text-3)", margin: "0 0 12px", lineHeight: 1.5 }}>{sec.desc}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(sec.blocks || []).map((b, j) => <GenPromptCard key={j} block={b} mood={mood} />)}
                </div>
              </Block>
            );
          return <Collapsible key={"r" + i} title={sec.title || "Copy & rewrites"} desc={sec.desc}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(sec.blocks || []).map((b, j) => <CopyBlock key={j} text={b.text} label={b.label || "Copy"} mono={!!b.mono} />)}
            </div>
          </Collapsible>;
        }
        if (sec.type === "checklist")
          return <Collapsible key={"r" + i} title={sec.title || "Checklist"}>{(sec.items || []).map((it, j) => <Check key={j} state={it.state || "mid"}>{it.text}</Check>)}</Collapsible>;
        if (sec.type === "kv")
          return <Collapsible key={"r" + i} title={sec.title || "Details"}>
            {(sec.rows || []).map((r, j) => (
              <div key={j} style={{ display: "grid", gridTemplateColumns: r.level ? "20px 150px 1fr" : "150px 1fr", gap: 12, alignItems: "center", padding: "11px 0", borderTop: j ? "1px solid var(--stroke-1)" : "none", fontSize: 13 }}>
                {r.level && <span className={"ci-dot " + r.level} />}
                <span style={{ color: "var(--text-3)", fontWeight: 500 }}>{r.k}</span>
                <span style={{ color: "var(--text-1)", lineHeight: 1.5 }}>{r.v}</span>
              </div>
            ))}
          </Collapsible>;
        if (sec.type === "text")
          return <Collapsible key={"r" + i} title={sec.title || "More"}><div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sec.body}</div></Collapsible>;
        return null;
      })}
    </div>
  );
}

// ── KeyModal -- settings: paste key + pick model ──────────────────────────────
function KeyModal({ open, onClose }) {
  const [key, setKey] = React.useState(getKey());
  const [gkey, setGkey] = React.useState(getGoogleKey());
  const [nvkey, setNvkey] = React.useState(getNvidiaKey());
  const [rvkey, setRvkey] = React.useState(getReveKey());
  const [proxy, setProxy] = React.useState(getProxyUrl());
  const [model, setModel] = React.useState(getModel());
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { if (open) { setKey(getKey()); setGkey(getGoogleKey()); setNvkey(getNvidiaKey()); setRvkey(getReveKey()); setProxy(getProxyUrl()); setModel(getModel()); } }, [open]);
  if (!open) return null;
  function save() { setKeyLS(key.trim()); setGoogleKeyLS(gkey.trim()); setNvidiaKeyLS(nvkey.trim()); setReveKeyLS(rvkey.trim()); setProxyUrlLS(proxy.trim()); setModelLS(model); onClose(true); }
  function clear() { setKeyLS(""); setKey(""); }
  return (
    <div className="ci-modal-scrim" onClick={() => onClose(false)}>
      <div className="ci-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Settings</h3>
          <button className="ci-iconbtn" style={{ width: 30, height: 30 }} onClick={() => onClose(false)}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.55, margin: "4px 0 18px" }}>
          ContentIntel runs on <b>your own</b> Anthropic API key. It's stored only in this browser (localStorage) and sent directly to Anthropic -- never to us.
        </p>

        <label className="ci-label">Anthropic API key</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="ci-input" type={show ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)} placeholder="sk-ant-..." style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
          <button className="ci-copybtn" style={{ height: 44 }} onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 8 }}>
          No key? Create one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: "var(--text-2)" }}>console.anthropic.com</a>. Without a key you'll still see sample reports.
        </div>

        <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 10, background: "var(--surface-1)", border: "1px solid var(--stroke-1)", fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>
          🎨 <b>Thumbnail images</b> are made in <b>ChatGPT or Gemini</b> -- the Thumbnail and Studio tabs give you a ready prompt and one-click buttons to open either (no extra keys needed here).
        </div>

        <label className="ci-label" style={{ marginTop: 18 }}>Model</label>
        <select className="ci-input" value={model} onChange={e => setModel(e.target.value)} style={{ appearance: "auto" }}>
          {CI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 8 }}>
          Pricing (approx, per 1M tokens): in ${modelInfo(model).inP} / out ${modelInfo(model).outP}. Edit in code if Anthropic's prices change.
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <GlowButton mood="navy" onClick={save}>Save</GlowButton>
          {getKey() && <button className="ci-copybtn" style={{ height: 38 }} onClick={clear}>Remove key</button>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CI_MODELS, CI_DEFAULT_MODEL, CI_OUTPUT_GUESS, ADMIN_PASS,
  getKey, setKeyLS, getModel, setModelLS, modelInfo, getResearch, liveResearch,
  canRun, hasSandbox,
  loadLocalResearch, saveLocalResearch, clearLocalResearch, hasLocalResearch,
  estTokens, fmtTokens, estCost, fmtCost, callClaude, buildSystem, parseReport,
  useAnalysis, AnalyzeButton, UsageBadge, ErrorCard, ReportView, KeyModal,
  nicheNames, splitPlaybookBlocks, loadHistory, saveHistory, clearHistory,
  getGoogleKey, setGoogleKeyLS, generateThumbnail, regenPromptFromReport,
  openInChatGPT, openInGemini,
  getNvidiaKey, setNvidiaKeyLS, generateThumbnailFlux, getProxyUrl, setProxyUrlLS,
  getReveKey, setReveKeyLS, generateThumbnailReve,
});

