// ContentIntel -- engine: BYO-key auth, real Claude calls, token estimate,
// generic report renderer, analysis hook. (Client-side, no backend.)

const { MOODS: EM } = window;

// Build stamp -- so you can confirm which version is actually live. Open the
// browser console (F12) and look for this line; if it's older than expected,
// you're on a cached file -> hard-refresh (Ctrl/Cmd+Shift+R).
window.CI_BUILD = "2026-06-16-r7";
try { console.log("%cContentIntel build " + window.CI_BUILD, "color:#8FD86A;font-weight:700"); } catch (e) {}

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
// Optional OpenAI key -- used for DALL-E 3 image generation.
const LS_OPENAI = "ci_openai_key";
const getOpenAIKey   = () => { try { return localStorage.getItem(LS_OPENAI) || ""; } catch (e) { return ""; } };
const setOpenAIKeyLS = (k) => { try { k ? localStorage.setItem(LS_OPENAI, k) : localStorage.removeItem(LS_OPENAI); } catch (e) {} };
// Optional proxy URL (Cloudflare Worker). When set, image calls go through it
// so keys stay server-side and browser CORS is bypassed.
const LS_PROXY = "ci_proxy_url";
const getProxyUrl   = () => { try { return (localStorage.getItem(LS_PROXY) || "").trim(); } catch (e) { return ""; } };
const setProxyUrlLS = (u) => { try { u ? localStorage.setItem(LS_PROXY, u) : localStorage.removeItem(LS_PROXY); } catch (e) {} };
// Web-search toggle (BYO-key only; default off — uses extra tokens).
const LS_WEBSEARCH = "ci_websearch";
const getWebSearch   = () => { try { return localStorage.getItem(LS_WEBSEARCH) === "1"; } catch (e) { return false; } };
const setWebSearchLS = (on) => { try { on ? localStorage.setItem(LS_WEBSEARCH, "1") : localStorage.removeItem(LS_WEBSEARCH); } catch (e) {} };
const getModel = () => { try { return localStorage.getItem(LS_MODEL) || CI_DEFAULT_MODEL; } catch (e) { return CI_DEFAULT_MODEL; } };
const setModelLS = (m) => { try { localStorage.setItem(LS_MODEL, m); } catch (e) {} };
const modelInfo = (id) => CI_MODELS.find(m => m.id === (id || getModel())) || CI_MODELS[1];

// True when running inside a Claude preview/artifact (Anthropic provides free AI there).
const hasSandbox = () => { try { return typeof window !== "undefined" && window.claude && typeof window.claude.complete === "function"; } catch (e) { return false; } };
// Can we run a REAL analysis right now? Either the user's own key OR the free Claude sandbox.
const canRun = () => !!getKey() || hasSandbox() || !!(typeof window !== 'undefined' && window.CI_SESSION);

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
    let keep = arr.slice(0, 30);
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(keep));
    } catch (qe) {
      // Quota hit: drop stored reports from older entries, keep the summaries.
      keep = keep.map((it, i) => i < 8 ? it : { ...it, report: undefined, input: undefined });
      try { localStorage.setItem(LS_HISTORY, JSON.stringify(keep)); } catch (e2) {}
    }
  } catch (e) {}
}
function clearHistory() { try { localStorage.removeItem(LS_HISTORY); } catch (e) {} }
// Merge a patch into one saved history entry (matched by its timestamp).
function updateHistory(t, patch) {
  try {
    const arr = loadHistory().map(it => it.t === t ? { ...it, ...patch } : it);
    localStorage.setItem(LS_HISTORY, JSON.stringify(arr));
    return arr;
  } catch (e) { return loadHistory(); }
}

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

// Extract web-search source URLs from Anthropic content blocks (mirrors worker.js).
function extractSourcesBYO(blocks) {
  const out = [], seen = new Set();
  const add = (url, title) => {
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    out.push({ title: (title || url).slice(0, 160), url });
  };
  for (const b of (blocks || [])) {
    if (!b) continue;
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) if (r && r.type === 'web_search_result') add(r.url, r.title);
    }
    if (b.type === 'text' && Array.isArray(b.citations)) {
      for (const c of b.citations) if (c) add(c.url, c.title);
    }
  }
  return out.slice(0, 8);
}

// ── The real call -- direct browser → Anthropic (BYO key) ─────────────────────
async function callClaudeOnce({ system, userText, image, images, model, maxTokens = 1800, temperature }) {
  // SaaS mode: signed-in users run through the ContentIntel worker (owner's
  // key, plan limits enforced server-side) — no personal key needed.
  const saas = (typeof window !== 'undefined' && window.CI_SAAS) || {};
  if (saas.workerUrl && window.CI_SESSION) {
    const imgsS = (images && images.length) ? images.filter(Boolean) : (image ? [image] : []);
    const contentS = imgsS.length
      ? [
          ...imgsS.flatMap((im, i) => [
            ...(imgsS.length > 1 ? [{ type: "text", text: `Image ${i + 1}:` }] : []),
            { type: "image", source: { type: "base64", media_type: im.mime, data: im.data } },
          ]),
          { type: "text", text: userText },
        ]
      : userText;
    const sysS = typeof system === "string" && system.length > 2000
      ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }] : system;
    const resS = await fetch(saas.workerUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "Authorization": "Bearer " + window.CI_SESSION },
      body: JSON.stringify({ engine: (window.getEngine && window.getEngine()) || 'smart', max_tokens: maxTokens, ...(temperature != null ? { temperature } : {}), system: sysS, messages: [{ role: "user", content: contentS }] }),
    });
    const dataS = await resS.json().catch(() => ({}));
    if (!resS.ok) {
      if (resS.status === 401) { window.CI_SESSION = null; throw new Error(dataS.error || "Session expired — sign in again."); }
      throw new Error(dataS.error || ("Request failed (" + resS.status + ")."));
    }
    const textS = (dataS.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return { text: textS, usage: dataS.usage || null, sources: dataS.ci_sources || null };
  }
  const key = getKey();
  // Web search: enabled only when the user has toggled it on AND the selected model
  // is not Haiku (Haiku doesn't support web_search_20250305). When disabled we inject
  // NO_TOOL_NOTE so the model never leaks <function_calls> XML to the UI.
  const webOn = getWebSearch() && !(model || getModel()).includes("haiku");
  const NO_TOOL_NOTE = "\n\nEXECUTION NOTE (highest priority): You have NO web_search tool and NO external tools in this session. Ignore any instruction above about searching the web or 'search first'. NEVER output tool-call or function-call syntax of any kind -- no <function_calls>, <invoke>, <function_results> or similar; such text is NOT executed and leaks to the user. Do not narrate searching. Answer only from your own knowledge; if a topic is recent or unverifiable, treat it as the user's stated premise and proceed. Output only the final answer in the exact format requested.";
  if (!webOn && typeof system === "string") system = system + NO_TOOL_NOTE;
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
  // Prompt caching: the big research system prompt is cached server-side, so
  // every check after the first is noticeably faster + ~90% cheaper on input.
  const sysBlock = typeof system === "string" && system.length > 2000
    ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }]
    : system;
  const tools = webOn ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }] : undefined;
  const betaStr = webOn ? "prompt-caching-2024-07-31,web-search-2025-03-05" : "prompt-caching-2024-07-31";

  // Web search may trigger stop_reason "pause_turn" — feed the partial turn back
  // and continue until the model finishes (mirrors the worker's loop).
  const msgs = [{ role: "user", content }];
  let lastData = null, guard = 0;
  const allBlocks = [];
  while (true) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": betaStr,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: model || getModel(), max_tokens: maxTokens, ...(temperature != null ? { temperature } : {}), system: sysBlock, messages: msgs, ...(tools ? { tools } : {}) }),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json())?.error?.message || ""; } catch (e) {}
      if (res.status === 401) throw new Error("Invalid API key. Check it in Settings.");
      if (res.status === 429) throw new Error("Rate limited or out of credit on this key.");
      throw new Error(detail || ("Request failed (" + res.status + ")."));
    }
    lastData = await res.json();
    if (Array.isArray(lastData.content)) allBlocks.push(...lastData.content);
    if (lastData.stop_reason === "pause_turn" && guard++ < 3) {
      msgs.push({ role: "assistant", content: lastData.content });
      continue;
    }
    break;
  }
  const text = allBlocks.filter(c => c.type === "text").map(c => c.text).join("");
  const byoSources = webOn ? extractSourcesBYO(allBlocks) : [];
  return { text, usage: lastData.usage || null, sources: byoSources.length > 0 ? byoSources : null };
}

// The model returns a transient 529 "overloaded" / "high demand" when busy. That's
// not a real failure -- retry a couple of times with backoff before surfacing it,
// and show a friendly message rather than the raw API error.
const isOverloaded = (e) => /overloaded|high demand|529|503|temporarily unavailable|please try again later/i.test(String(e && e.message || ""));
async function callClaude(args) {
  const MAX = 3;
  for (let attempt = 0; ; attempt++) {
    try {
      const out = await callClaudeOnce(args);
      if (out && typeof out.text === "string") out.text = stripToolNoise(out.text);
      return out;
    } catch (e) {
      if (isOverloaded(e) && attempt < MAX - 1) {
        await new Promise(r => setTimeout(r, 900 * Math.pow(2, attempt) + Math.random() * 400));
        continue;
      }
      if (isOverloaded(e)) throw new Error("The AI is busy right now (high demand). Wait a few seconds and try again.");
      throw e;
    }
  }
}

// ── Image generation (Gemini) -- edits the user's thumbnail per the instruction ─
// BYO Google AI Studio key. Returns a data: URL (or throws a clear error).
// Transform a KEEP/CHANGE editing instruction into a self-contained image-generation
// description that works for text-to-image models (no original image available).
function preprocessForImageGen(raw) {
  let p = String(raw || "").trim();
  // Extract the change description from the KEEP / CHANGE ONLY format.
  const keepM  = p.match(/KEEP\s*:\s*([\s\S]*?)(?=\nCHANGE\s+ONLY\s*:|\nwhy this|$)/i);
  const changeM = p.match(/CHANGE\s+ONLY\s*:\s*([\s\S]*?)(?=\nwhy this|$)/i);
  if (keepM || changeM) {
    const keep   = (keepM   ? keepM[1]   : "").replace(/\n+/g, "; ").replace(/;\s*;/g, ";").trim();
    const change = (changeM ? changeM[1] : "").replace(/\n+/g, "; ").replace(/;\s*;/g, ";").trim();
    p = [keep && `Visual context: ${keep}`, change && `Improvements to apply: ${change}`].filter(Boolean).join(". ");
  }
  return [
    "Professional high-CTR YouTube thumbnail, 1280×720, commercial photography quality.",
    p,
    "Requirements: ultra-sharp, vibrant saturated colors, dramatic professional lighting, bold clear composition with one dominant focal point, readable text at 120px thumbnail size, photorealistic quality.",
  ].filter(Boolean).join(" ");
}

// From a finished SCRIPT, produce platform-tuned packaging -- 3 title options each
// for YouTube / Instagram / LinkedIn (scored for click + search), SEO tags/hashtags,
// and thumbnail text. Everything is grounded in the title + platform + thumbnail
// research so nothing is random.
async function packageScript(script, lang, opts = {}) {
  const ti = getResearch("title") || {};
  const pl = getResearch("platform") || {};
  const th = getResearch("thumbnail") || {};
  const core = liveResearch().core || "";
  const langLine = (!lang || lang === "Auto-detect" || lang === "Auto")
    ? "Detect the script's own language and write ALL titles, tags and thumbnail text in that same language and script."
    : `Write ALL titles, tags and thumbnail text in ${lang}.`;
  const sys = [
    "You are ContentIntel's packaging engine. From a finished video SCRIPT, write the metadata that makes it get found and clicked, tuned PER PLATFORM. Everything must be specific to THIS script's actual topic and angle -- never generic filler.",
    langLine,
    core ? "VIRALITY SCIENCE:\n" + core.slice(0, 1800) : "",
    ti.systemGuidance ? "TITLE SCIENCE (apply to every title; an honest, payable curiosity gap -- never clickbait the script can't deliver):\n" + ti.systemGuidance : "",
    pl.systemGuidance ? "PLATFORM / SEO RULES (ranking signals, hashtag counts, keyword placement -- follow these exactly):\n" + pl.systemGuidance.slice(0, 2600) : "",
    (th.designPrinciples || th.systemGuidance) ? "THUMBNAIL-TEXT RULES (2-4 words, legible at 120px, complements the title -- never repeats it):\n" + (String(th.designPrinciples || "").slice(0, 700) + "\n" + String(th.systemGuidance || "").slice(0, 700)).trim() : "",
    "THUMBNAIL BRIEF: also write a one-to-two sentence VISUAL concept for the thumbnail image (not the words) drawn from the script -- the main subject + their expression/emotion, the key object or scene, the mood, and a simple high-contrast composition idea. Make it concrete enough for an AI image generator to produce a professional, click-worthy thumbnail. This is the scene, NOT the overlay text.",
    "PER-PLATFORM INTENT -- YouTube: search + browse, keyword EARLY, ~60 chars, strong curiosity gap. Instagram: hook-style first line + keyword-rich phrasing + 3-5 highly-relevant hashtags (hashtags = minor topic signals, not discovery). LinkedIn: professional, insight-led hook, zero hype, 3 relevant hashtags.",
    "YOUTUBE TAGS (this is the ranking box -- make it strong, not a token list): return 18-30 tags ORDERED most-important-first. Start with the EXACT primary keyword, then its close variations/synonyms, then 2-3 broader category terms, then specific long-tail phrases a real viewer would type (questions, 'how to', year, niche+topic combos) pulled from THIS script. Lowercase, no # symbols, no duplicates. YouTube caps tags at 500 characters TOTAL (including commas) -- pack it close to that limit but never exceed it, so order the highest-value tags first in case of truncation.",
    "SCORE each title 0-100 for predicted click + search strength using the title science, with a one-line 'why' naming the specific lever (curiosity gap / keyword / number / stake). Be honest -- not everything is a 90.",
    "Return ONLY one valid JSON object, no markdown:\n"
      + '{ "youtube":{ "titles":[{"text":"","score":0,"why":""}], "tags":["18-30 ranking tags, primary keyword first, <500 chars total, lowercase, no #"] },'
      + ' "instagram":{ "titles":[{"text":"","score":0,"why":""}], "hashtags":["3-5 with #"], "keywords":["caption SEO keywords"] },'
      + ' "linkedin":{ "titles":[{"text":"","score":0,"why":""}], "hashtags":["3 with #"] },'
      + ' "thumbnailText":[{"text":"2-4 words","why":""}], "thumbnailBrief":"1-2 sentence visual concept for the image" }\n'
      + "EXACTLY 3 titles per platform and EXACTLY 3 thumbnailText options.",
  ].filter(Boolean).join("\n\n");
  const ctx = (opts.niche ? `NICHE: ${opts.niche}\n` : "") + (opts.audience ? `AUDIENCE: ${opts.audience}\n` : "");
  const { text } = await callClaude({ system: sys, userText: ctx + "\nSCRIPT:\n" + script, maxTokens: 2300, temperature: 0.8 });
  const json = (window.parseReport || (x => null))(text);
  if (!json || (!json.youtube && !json.instagram && !json.linkedin)) throw new Error("Could not generate packaging -- try again.");
  return json;
}

// Turn a plain thumbnail brief into ONE research-grounded image prompt: Claude acts
// as art director, picks the best-fit layout + colour scheme from the research, and
// writes a self-contained prompt the image model will actually follow. Falls back to
// the raw brief if Claude isn't available.
async function groundThumbPrompt(brief, opts = {}) {
  const th = getResearch("thumbnail") || {};
  const st = getResearch("studio") || {};
  const cat = (arr) => (arr || []).map(x => `- ${x.name}: ${x.what || ""}`).join("\n");
  const ratio = (opts.ratio && (opts.ratio.label || opts.ratio)) || "16:9";
  const sys = [
    "You are a senior YouTube thumbnail ART DIRECTOR. Convert the creator's brief into ONE complete, self-contained image-generation prompt that a text-to-image model (Gemini / DALL-E) will follow precisely.",
    "From the research below, CHOOSE the single best-fit LAYOUT archetype and the single best-fit COLOUR scheme for this brief, and design to them. Apply the design principles. Keep every person and their count, the topic, and the EXACT on-image text words from the brief unchanged.",
    th.designPrinciples ? "DESIGN PRINCIPLES:\n" + th.designPrinciples : "",
    (th.layouts && th.layouts.length) ? "LAYOUT ARCHETYPES (pick ONE that fits):\n" + cat(th.layouts) : "",
    (th.colorSchemes && th.colorSchemes.length) ? "COLOUR SCHEMES (pick ONE that fits):\n" + cat(th.colorSchemes) : "",
    st.systemGuidance ? "IMAGE-PROMPT QUALITY SCIENCE:\n" + st.systemGuidance.slice(0, 2600) : "",
    `OUTPUT: a single tight paragraph describing the FINISHED thumbnail (${ratio}, 1280x720) in this order -- [subject: who, position, expression, clothing]. [exact on-image text: the words, weight, colour, placement]. [background + the chosen colour scheme]. [composition using the chosen layout + lighting]. End with: ultra-sharp, high-contrast, cinematic professional lighting, one dominant focal point, legible at 120px; render ONLY the specified words with no gibberish lettering. Output ONLY the prompt text -- no preamble, no explanation, no markdown.`,
  ].filter(Boolean).join("\n\n");
  const { text } = await callClaude({ system: sys, userText: "CREATOR BRIEF:\n" + brief, maxTokens: 700, temperature: 0.7 });
  return (text || "").trim();
}

// The non-negotiable design rules every generated thumbnail must obey -- distilled
// from the thumbnail research, plus an explicit anti-gibberish text rule (the #1
// thing image models get wrong). Pulled into EVERY generation, edit or text-to-image.
function thumbDesignLaw() {
  const th = (getResearch("thumbnail") || {});
  const st = (getResearch("studio") || {});
  const dp = String(th.designPrinciples || st.designPrinciples || "").trim();
  return [
    "DESIGN LAW (follow strictly): exactly ONE dominant focal point on a rule-of-thirds line, with strong foreground/background separation. High contrast, a tight 60-30-10 colour palette, cinematic directional lighting. If a person is shown: a sharp, realistic, undistorted face with ONE clear emotion and correct eyes/hands. Bold enough to read at 120px.",
    "TEXT RULE: render ONLY the exact words specified, spelled correctly, in a heavy bold sans-serif with a strong outline or drop shadow; 3-5 BIG words maximum. Add NO other words, captions, logos, watermarks, or random/gibberish lettering.",
    "AVOID: clutter, muddy low-contrast colour, tiny text, plastic over-smoothed 'AI' skin, warped faces, extra fingers or limbs, stray symbols.",
    dp ? "Researched principles to apply where relevant: " + dp.slice(0, 600) : "",
  ].filter(Boolean).join("\n");
}

async function generateThumbnail({ instruction, image, model, aspect }) {
  // Try Google's image models in order so a key/region that doesn't expose the
  // newest one still works: Nano Banana (GA) → its preview → 2.0 preview → 2.0 exp.
  const CANDIDATES = model ? [model] : [
    "gemini-2.5-flash-image",
    "gemini-2.5-flash-image-preview",
    "gemini-2.0-flash-preview-image-generation",
    "gemini-2.0-flash-exp",
  ];
  const fullInstruction = String(instruction || "").trim() + "\n\n" + thumbDesignLaw();
  const key = getGoogleKey();
  const proxy = getProxyUrl();
  if (!key && !proxy) throw new Error("NO_GOOGLE_KEY");
  const ratio = aspect || "16:9";
  const buildPayload = (mdl) => {
    const parts = [{ text: fullInstruction }];
    if (image && image.data) parts.push({ inline_data: { mime_type: image.mime || "image/png", data: image.data } });
    const generationConfig = { responseModalities: ["TEXT", "IMAGE"] };
    // Only the 2.5 image model accepts imageConfig.aspectRatio; older ones 400 on it.
    if (/2\.5-flash-image/.test(mdl)) generationConfig.imageConfig = { aspectRatio: ratio };
    return { contents: [{ parts }], generationConfig };
  };
  const attempt = (mdl) => {
    const payload = buildPayload(mdl);
    if (key) return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    return fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "gemini", model: mdl, payload }) })
      .catch(e => { throw new Error("Couldn't reach your proxy URL (" + (e && e.message || "network/CORS") + "). Check it in Settings."); });
  };
  let lastDetail = "";
  for (const mdl of CANDIDATES) {
    let res;
    for (let a = 0; ; a++) {           // transient overload backoff, per model
      res = await attempt(mdl);
      if (res.ok || !(res.status === 429 || res.status === 503 || res.status === 500) || a >= 2) break;
      await new Promise(r => setTimeout(r, 900 * Math.pow(2, a) + Math.random() * 400));
    }
    if (res.ok) {
      const data = await res.json();
      const ps = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      for (const p of ps) {
        const inl = p.inlineData || p.inline_data;
        if (inl && inl.data) return "data:" + (inl.mimeType || inl.mime_type || "image/png") + ";base64," + inl.data;
      }
      lastDetail = ps.map(p => p.text).filter(Boolean).join(" ").slice(0, 180) || "model returned no image";
      continue;                        // OK but no image (often a safety/text reply) -> try next
    }
    let detail = ""; try { detail = (await res.json())?.error?.message || ""; } catch (e) {}
    lastDetail = detail || ("HTTP " + res.status);
    if (res.status === 400 && /API key|invalid/i.test(detail)) throw new Error("That Google AI key looks invalid -- check it in Settings.");
    if (res.status === 429 && /quota|billing/i.test(detail)) throw new Error("This Google key is out of image quota / needs billing enabled. Add billing in Google AI Studio, or try again later.");
    // 403 (API not enabled) / 404 (model unavailable) / other -> try the next model
  }
  throw new Error("Couldn't generate the image with this key. " + (lastDetail ? "(" + lastDetail + ") " : "") + "Make sure image generation is enabled for your Google AI key (Generative Language API + billing).");
}

// Independent fact-check via Gemini, grounded with Google Search. Browser-direct
// with the user's Google key (CORS-OK), so no Worker change is needed. Returns
// { summary, claims:[{claim,status,correction,source}], sources:[{title,url}] }.
async function geminiFactCheck(scriptText, lang) {
  const key = getGoogleKey();
  const proxy = getProxyUrl();
  const mdl = "gemini-2.5-flash";
  const langLine = lang && lang !== "Auto-detect" ? `Write every string in ${lang}.` : "Write every string in the SAME language as the script.";
  const sys =
`You are an INDEPENDENT fact-checker for a short-form video script. Use Google Search to verify the factual, numeric, dated, named and "claim" assertions in the script below. ${langLine}
For each checkable claim decide a status: "verified" (matches reliable sources), "false" (contradicted by reliable sources), or "unverified" (no reliable source found / too vague). Ignore pure opinion, style or storytelling. For anything false or unverified, give the correct fact (or note no source exists) in one short line.
Return ONLY one JSON object, no markdown, no text around it:
{ "summary": "one line on overall factual reliability", "claims": [ { "claim": "the exact claim from the script", "status": "verified|false|unverified", "correction": "the correct fact in one line, or empty if verified", "source": "the main URL you relied on, or empty" } ] }

SCRIPT:
"""
${(scriptText || "").slice(0, 6000)}
"""`;
  const payload = { contents: [{ parts: [{ text: sys }] }], tools: [{ google_search: {} }] };
  const doFetch = async () => {
    if (key) return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    if (proxy) {
      try { return await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "gemini", model: mdl, payload }) }); }
      catch (e) { throw new Error("Couldn't reach your proxy URL (" + (e && e.message || "network/CORS") + "). Check it in Settings."); }
    }
    throw new Error("NO_GOOGLE_KEY");
  };
  let res;
  for (let attempt = 0; ; attempt++) {
    res = await doFetch();
    if (res.ok) break;
    // 429 (rate limit) / 503 (overloaded) are transient -- back off and retry.
    if ((res.status === 429 || res.status === 500 || res.status === 503) && attempt < 2) {
      await new Promise(r => setTimeout(r, 900 * Math.pow(2, attempt) + Math.random() * 400));
      continue;
    }
    let detail = ""; try { detail = (await res.json())?.error?.message || ""; } catch (e) {}
    if (res.status === 400 && /API key|invalid/i.test(detail)) throw new Error("That Google AI key looks invalid -- check it in Settings.");
    if (res.status === 429 || res.status === 503) throw new Error("Gemini is busy or rate-limited right now. Wait a few seconds and try again.");
    throw new Error(detail || ("Fact-check request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const cand = (data.candidates || [])[0] || {};
  const parts = ((cand.content || {}).parts) || [];
  const textOut = parts.map(p => p.text || "").join("").trim();
  const j = parseReport(textOut) || {};
  // Real sources Gemini grounded against (groundingMetadata).
  const gm = cand.groundingMetadata || cand.grounding_metadata || {};
  const chunks = gm.groundingChunks || gm.grounding_chunks || [];
  const sources = [], seen = new Set();
  for (const c of (chunks || [])) {
    const web = (c && (c.web || c.retrievedContext)) || {};
    const url = web.uri || web.url;
    if (url && !seen.has(url)) { seen.add(url); sources.push({ title: (web.title || url).slice(0, 160), url, date: "" }); }
  }
  return { summary: j.summary || "", claims: Array.isArray(j.claims) ? j.claims : [], sources };
}

// Fallback fact-check for when no Google key is set: Claude verifies the claims
// using its live web_search tool (provided by the worker in hosted mode) and
// returns the SAME shape as geminiFactCheck.
async function claudeFactCheck(scriptText, lang) {
  const langLine = lang && lang !== "Auto-detect" ? `Write every string in ${lang}.` : "Write every string in the SAME language as the script.";
  const sys =
`You are an INDEPENDENT fact-checker for a short-form video script. You have a live web_search tool -- USE IT to verify the factual, numeric, dated, named and "claim" assertions in the script. Cross-check against multiple reliable sources before judging. ${langLine}
For each checkable claim decide a status: "verified" (matches reliable sources), "false" (contradicted by reliable sources), or "unverified" (no reliable source found / too vague). Ignore pure opinion, style or storytelling. For anything false or unverified, give the correct fact (or note no source exists) in one short line.
Return ONLY one JSON object, no markdown, no text around it:
{ "summary": "one line on overall factual reliability", "claims": [ { "claim": "the exact claim from the script", "status": "verified|false|unverified", "correction": "the correct fact in one line, or empty if verified", "source": "the main URL you relied on, or empty" } ] }`;
  const { text, sources } = await callClaude({ system: sys, userText: `SCRIPT:\n"""\n${(scriptText || "").slice(0, 6000)}\n"""`, maxTokens: 1500, temperature: 0.2 });
  const j = parseReport(text) || {};
  const srcs = (sources || []).map(s => ({ title: (s.title || s.url || "").slice(0, 160), url: s.url || s.uri || "", date: s.date || s.page_age || "" })).filter(s => s.url);
  return { summary: j.summary || "", claims: Array.isArray(j.claims) ? j.claims : [], sources: srcs };
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

// Image generation via OpenAI DALL-E 3 (text-to-image). BYO OpenAI key.
// Direct browser calls are CORS-blocked by OpenAI; use a proxy URL for those.
async function generateImageDalle({ prompt, size, model }) {
  const mdl = model || "dall-e-3";
  const sz  = size  || "1792x1024";
  const payload = { model: mdl, prompt, n: 1, response_format: "b64_json", size: sz };
  const proxy = getProxyUrl();
  const key   = getOpenAIKey();
  let res;
  if (proxy) {
    try { res = await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "openai", payload }) }); }
    catch (e) { throw new Error("Couldn't reach your proxy URL. Check it in Settings."); }
  } else if (key) {
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": "Bearer " + key },
        body: JSON.stringify(payload),
      });
    } catch (e) { throw new Error("OpenAI blocked direct browser access (CORS). Add a proxy URL in Settings to bypass it."); }
  } else {
    throw new Error("NO_OPENAI_KEY");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("OpenAI key rejected — check it in Settings.");
    throw new Error((err.error && err.error.message) || ("DALL-E request failed (" + res.status + ")."));
  }
  const data = await res.json();
  const b64 = ((data.data || [])[0] || {}).b64_json || "";
  if (!b64) throw new Error("DALL-E returned no image. Try again.");
  return "data:image/png;base64," + b64;
}

// Unified in-app image generation (no source image -- pure text-to-image).
// Preprocesses editing-style prompts into descriptive generation prompts first.
async function generateImageInApp(promptText, aspect) {
  const processed = preprocessForImageGen(promptText);
  const gKey  = getGoogleKey();
  const oKey  = getOpenAIKey();
  const proxy = getProxyUrl();
  if (gKey) return await generateThumbnail({ instruction: processed, aspect });
  if (oKey || proxy) return await generateImageDalle({ prompt: processed });
  throw new Error("NO_IMAGE_KEY");
}

// Image editing -- uses the source image to drive Gemini's in-context edit.
// Falls back to text-to-image if no Google key / proxy.
async function editThumbnailInApp(promptText, sourceImage, aspect) {
  const gKey  = getGoogleKey();
  const proxy = getProxyUrl();
  if (gKey && sourceImage) return await generateThumbnail({ instruction: promptText, image: sourceImage, aspect });
  return await generateImageInApp(promptText, aspect); // fall back to text-to-image
}

// Image-gen handoff: copy the prompt + open the tool in a new tab. The user
// pastes their own photo(s) there and presses enter -- generation runs on their
// own ChatGPT / Gemini plan (no key, no cost to us, no flaky free generator).
function openInChatGPT(promptText) {
  const p = String(promptText || "");
  try { window.copyText && window.copyText(p); } catch (e) {}
  window.open("https://chatgpt.com/?q=" + encodeURIComponent(p.slice(0, 6000)), "_blank", "noopener,noreferrer");
}
// Tiny on-screen toast (pure DOM, no React) so handoffs give clear feedback.
function ciToast(msg) {
  try {
    let el = document.getElementById("ci-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ci-toast";
      el.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;background:#12151c;color:#f2f4fa;border:1px solid rgba(255,255,255,0.14);box-shadow:0 8px 30px rgba(0,0,0,0.5);padding:13px 18px;border-radius:12px;font-size:13.5px;font-family:var(--font-ui,sans-serif);max-width:90vw;text-align:center;opacity:0;transition:opacity .2s,transform .2s;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(-4px)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(-50%)"; }, 4200);
  } catch (e) {}
}

// Reliable synchronous clipboard copy (works inside a click, before a new tab
// steals focus). Returns true on success.
function ciCopySync(p) {
  let ok = false;
  try {
    const ta = document.createElement("textarea");
    ta.value = p; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "-9999px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { ta.setSelectionRange(0, p.length); } catch (e) {}
    ok = document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) {}
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p); } catch (e) {}
  return ok;
}

function openInGemini(promptText) {
  const p = String(promptText || "");
  // Sync copy first (inside click handler = trusted gesture = execCommand works).
  ciCopySync(p);
  // Also fire async API — belt & suspenders for browsers that prefer it.
  try { if (navigator.clipboard) navigator.clipboard.writeText(p).catch(() => {}); } catch(e) {}

  try {
    const hide = (el) => { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(80px)"; };
    let el = document.getElementById("ci-gemini-bar");
    if (!el) {
      el = document.createElement("div");
      el.id = "ci-gemini-bar";
      el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(80px);z-index:99999;" +
        "background:#1a1d2a;color:#f2f4fa;border:1px solid rgba(255,255,255,0.16);box-shadow:0 12px 40px rgba(0,0,0,0.6);" +
        "padding:14px 18px;border-radius:16px;font-size:13.5px;font-family:var(--font-ui,sans-serif);max-width:92vw;width:420px;" +
        "opacity:0;transition:transform .25s cubic-bezier(.2,.8,.3,1),opacity .25s;display:flex;align-items:center;gap:12px;";

      const info = document.createElement("span");
      info.style.cssText = "flex:1;text-align:left;line-height:1.4";
      info.innerHTML = '<b style="color:#a8e6cf">Prompt copied!</b><br><span style="font-size:12px;color:#8b93a7">Paste with Ctrl+V / Cmd+V</span>';

      const openBtn = document.createElement("button");
      openBtn.textContent = "Open Gemini →";
      openBtn.style.cssText = "flex-shrink:0;background:linear-gradient(135deg,#4285f4,#34a853);color:#fff;border:none;" +
        "border-radius:10px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap";
      openBtn.addEventListener("click", () => { window.open("https://gemini.google.com/app", "_blank", "noopener"); hide(el); });

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText = "flex-shrink:0;background:transparent;color:#5c6478;border:none;cursor:pointer;font-size:18px;line-height:1;padding:0 4px";
      closeBtn.addEventListener("click", () => hide(el));

      el.appendChild(info); el.appendChild(openBtn); el.appendChild(closeBtn);
      document.body.appendChild(el);
    }
    requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => hide(el), 12000);
  } catch(e) {}
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
- LANGUAGE: Every single string in this JSON -- verdict text, score "why", issue text, copy blocks, and "bottomLine" -- must be written in the EXACT same language and script as the user's submitted content. Hindi script -> Hindi. Hinglish -> Hinglish. NEVER default to English for non-English content.
- ALWAYS include "overall" (0-100), a single headline score for the whole piece.
- SCORE CALIBRATION -- applies to EVERY score, both each dimension in "scores" AND "overall". Use the FULL 0-100 range; do NOT cluster in the 50s-60s. Anchors: 90-100 = elite, no real weakness on that dimension; 80-89 = strong, one or two minor fixes from excellent; 70-79 = good, clearly works, 2-3 real but fixable gaps; 55-69 = mixed, notable problems; 40-54 = weak, major rework; below 40 = broken. Grade ONLY what is on the page right now. If a previously weak element (hook, pacing, CTA, etc.) has genuinely been fixed, that dimension's score MUST rise to match -- never anchor to an earlier impression of this content, and never default to a "safe" middle number. When a dimension is genuinely well-executed, score it 80+; do not withhold high marks out of habit. Reserve low scores for real, nameable problems -- and when you give one, the issue you list must justify it. (Note: the app derives the headline from these dimension scores, so score each dimension honestly and precisely.)
- For a SCRIPT, ALWAYS include a "graph" section (the predicted attention/quality curve across the runtime, 6-10 points whose VALUE dips at weak/slow moments) AND a "beats" section (the script split into labelled beats -- HOOK, CONTEXT/SETUP, PROOF, TURN, PAYOFF, CTA, etc. -- each with the actual line text and a level). The graph's x-labels and the beats should line up in order.
- "winner" is ONLY for A/B comparisons (two versions / two thumbnails / two titles). Include it and name the winner clearly when comparing. OMIT it entirely for single-item checks.
- Only include a compliance/regulatory section when the topic actually calls for it (financial, medical, legal, gambling and similar regulated claims). For ordinary content, do NOT add any compliance note.
- BE RUTHLESSLY CONCISE -- this is quick pre-publish feedback, not an essay. HARD CAPS: at most 3 sections; at most 5 scores; at most 3 issue items; "graph" exactly 6 points; "beats" at most 6 items. Every string is ONE short sentence of at most ~18 words -- cut adjectives, never repeat a point made elsewhere, no preamble inside strings. Only a regeneration-prompt "text" body or a hook-rewrite block may run longer. "bottomLine" = ONE sentence. Score "why" = one clause quoting the exact words. Shorter reports are BETTER reports.
- Quote the user's EXACT words from the submitted content; pair each criticism with a one-line, copy-ready fix in the user's own language.
- The JSON must be COMPLETE and valid -- close every brace and bracket, escape quotes inside strings, and never stop mid-object.`;

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
    `LANGUAGE LAW -- highest priority, overrides everything else: Detect the language of the submitted content and write your ENTIRE response in that language. Every verdict, score reason, hook rewrite, issue, fix, and the bottomLine must be in the same language as the content. Hindi -> Hindi. Hinglish -> Hinglish. Spanish -> Spanish. Tamil/Marathi/Bengali/any other language -> that language. Default to English ONLY when the content itself is in English.`,
    `Adapt to the content you are given: detect its region, audience, platform and topic, and judge it by what actually works for THAT context. Never assume a fixed country or niche.`,
    `WEB VERIFICATION: you have a live web_search tool. When the content makes a factual, statistical, dated, trending or claim-based assertion (numbers, names, events, prices, "the latest", "#1", records, etc.), search and cross-check it against multiple real sources before judging it. Flag anything you cannot verify or that is outdated/wrong as a credibility risk. Never ask the user to provide sources -- find and verify them yourself. If a claim checks out, you may note that briefly. Do NOT search for things that don't need it (pure style/wording judgements); keep it to what genuinely needs verifying.`,
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
// Remove leaked tool-call / function-call XML the model sometimes emits as text
// (when it wrongly thinks it has a web_search tool). Keeps the real prose/JSON.
function stripToolNoise(s) {
  return String(s || "")
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, "")
    .replace(/<function_results>[\s\S]*?<\/function_results>/gi, "")
    .replace(/<invoke\b[\s\S]*?<\/invoke>/gi, "")
    .replace(/<\/?(?:function_calls|function_results|invoke|parameter)\b[^>]*>/gi, "")
    .trim();
}

function parseReport(text) {
  let t = stripToolNoise(text);
  // Prefer fenced blocks that actually contain an object; if several, take the LAST
  // (the model's final answer comes after any preamble/reasoning).
  const fences = Array.from(t.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)).map(m => m[1].trim()).filter(b => b.includes("{"));
  if (fences.length) t = fences[fences.length - 1];
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

// Weight a dimension by what it is (creators control hook/retention/value/CTA the
// most, so those move the headline score the most). Unknown names get a mid weight,
// so non-script reports effectively become an equal-weight average.
function dimWeight(name) {
  const n = String(name || "").toLowerCase();
  if (/hook/.test(n)) return 3;
  if (/reten|loop/.test(n)) return 2.5;
  if (/value|payoff/.test(n)) return 2;
  if (/cta|call to action/.test(n)) return 1.5;
  if (/pacing|deliver/.test(n)) return 1;
  if (/emotion|arc/.test(n)) return 1;
  if (/share|stepps/.test(n)) return 1;
  return 1.5;
}
// Derive the headline "overall" from the per-dimension scores (weighted), so that
// fixing a weak dimension MECHANICALLY raises the overall instead of leaving it to
// the model's gut number (which clustered in the low 60s and never moved).
function computeOverall(json) {
  const scores = json && Array.isArray(json.scores) ? json.scores.filter(s => s && typeof s.score === "number") : [];
  if (!scores.length) return typeof (json && json.overall) === "number" ? Math.round(json.overall) : null;
  let wsum = 0, w = 0;
  for (const s of scores) { const k = dimWeight(s.name); wsum += k * s.score; w += k; }
  return Math.max(0, Math.min(100, Math.round(wsum / w)));
}

// ── useAnalysis -- shared runner for every checker tab ────────────────────────
// state: idle | loading | done | error
// when done with report=null → the tab shows its built-in SAMPLE (no key path)
function useAnalysis(type, opts = {}) {
  const pk = opts.persistKey;   // when set, the last result survives tab switches
  const boot = (() => { if (!pk) return null; try { return JSON.parse(sessionStorage.getItem(pk) || "null"); } catch (e) { return null; } })();
  const [state, setState] = React.useState(boot && boot.report ? "done" : "idle");
  const [report, setReport] = React.useState((boot && boot.report) || null);
  const [usage, setUsage] = React.useState((boot && boot.usage) || null);
  const [sources, setSources] = React.useState((boot && boot.sources) || null);
  const [err, setErr] = React.useState("");
  React.useEffect(() => {
    if (!pk) return;
    try {
      if (state === "done" && report) sessionStorage.setItem(pk, JSON.stringify({ report, usage, sources }));
    } catch (e) {}
  }, [pk, state, report, usage, sources]);

  async function run({ userText, image, images, maxTokens, system }) {
    setErr(""); setReport(null); setUsage(null); setSources(null); setState("loading");
    if (!canRun()) { // sample mode -- no key and not in a Claude preview
      setTimeout(() => setState("done"), 850);
      return;
    }
    try {
      const { text, usage, sources: rawSources } = await callClaude({ system: system || buildSystem(type), userText, image, images, maxTokens, temperature: 0.4 });
      let json = parseReport(text);
      if (!json || typeof json !== "object") {
        const body = (text || "").trim();
        if (!body) throw new Error("The AI returned an empty response. Try again.");
        // If the model clearly tried to return the JSON report but it failed to
        // parse (truncated / malformed), do NOT dump raw JSON at the user -- ask
        // for a re-run. Only show plain text when the reply was genuinely prose.
        const looksLikeJson = /^[\s`]*[{[]/.test(body) || /"(verdict|scores|sections|bottomLine)"\s*:/.test(body);
        if (looksLikeJson) throw new Error("The analysis came back malformed — tap Re-analyze to try again.");
        json = { sections: [{ type: "text", title: "Analysis", body }] };
      }
      // Recompute the headline score from the dimensions (weighted) so it tracks
      // the actual per-dimension grades rather than the model's free-form number.
      const co = computeOverall(json);
      if (co != null) json.overall = co;
      setSources(Array.isArray(rawSources) && rawSources.length > 0 ? rawSources : null);
      setReport(json); setUsage(usage); setState("done");
      try {
        const vd = json.verdict || {};
        saveHistory({ type, t: Date.now(), level: vd.level || "yellow",
          score: typeof json.overall === "number" ? Math.round(json.overall) : null,
          title: vd.title || (json.winner && json.winner.label) || "Analysis",
          input: String(userText || "").slice(0, 600),
          report: json });
      } catch (e) {}
    } catch (e) {
      if (String(e.message) === "NO_KEY") { setTimeout(() => setState("done"), 600); return; }
      setErr(e.message || "Something went wrong."); setState("error");
    }
  }
  return { state, report, usage, sources, err, run,
    reset: () => { setState("idle"); setReport(null); setUsage(null); setSources(null); setErr(""); if (pk) try { sessionStorage.removeItem(pk); } catch (e) {} } };
}

// ── AnalyzeButton -- Run button that shows the token estimate ─────────────────
function AnalyzeButton({ mood, onClick, loading, estIn, label = "Analyze", model, disabled, disabledHint }) {
  const inTok = estIn + 0;
  const total = inTok + CI_OUTPUT_GUESS;
  const cost = estCost(inTok, CI_OUTPUT_GUESS, model);
  const hasKey = !!getKey();
  const free = !hasKey && hasSandbox(); // free Claude preview AI
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <GlowButton mood={mood} size="lg" onClick={disabled ? undefined : onClick}
        style={{ justifyContent: "center", opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer", filter: disabled ? "saturate(0.4)" : "none" }}>
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
        {disabled && disabledHint ? <span style={{ color: "#F0C85A" }}>{disabledHint}</span> : <>est. {fmtTokens(inTok)} in + ~{fmtTokens(CI_OUTPUT_GUESS)} out · ~{fmtCost(cost)}</>}
        {free && <span style={{ color: "var(--text-4)" }}> · live</span>}
        {!hasKey && !free && !(typeof window !== 'undefined' && window.CI_SESSION && (window.CI_SAAS||{}).workerUrl) && <span style={{ color: "var(--text-4)" }}> · preview — connect a key for live results</span>}
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
function Collapsible({ title, desc, children, startOpen }) {
  return (
    <details className="ci-block ci-collapse" open={!!startOpen} style={{ padding: 0 }}>
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

// One ranked upgrade prompt -- copy it, send to ChatGPT/Gemini, or generate in-app.
function GenPromptCard({ block, mood }) {
  const m = EM[mood] || EM.navy;
  const [done, setDone] = React.useState(false);
  const [genState, setGenState] = React.useState("idle"); // idle | loading | done | error
  const [genImg, setGenImg]     = React.useState(null);
  const [genErr, setGenErr]     = React.useState("");

  const canGenerate = !!(getGoogleKey() || getOpenAIKey() || getProxyUrl());

  function copy() { try { window.copyText && window.copyText(block.text); } catch (e) {} setDone(true); setTimeout(() => setDone(false), 1500); }

  async function generate() {
    if (genState === "loading") return;
    setGenState("loading"); setGenImg(null); setGenErr("");
    try {
      const url = await generateImageInApp(block.text);
      setGenImg(url); setGenState("done");
    } catch (e) {
      const msg = String(e && e.message || "");
      if (msg === "NO_IMAGE_KEY") setGenErr("Add a Google AI or OpenAI key in Settings to generate in-app.");
      else setGenErr(msg || "Generation failed — try again.");
      setGenState("error");
    }
  }

  return (
    <div style={{ padding: "13px 14px", borderRadius: 12, background: "var(--inset)", border: "1px solid var(--stroke-1)" }}>
      {block.label && <div style={{ fontSize: 12, fontWeight: 800, color: m.accentFrom, marginBottom: 6, letterSpacing: "0.01em" }}>{block.label}</div>}
      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{block.text}</div>
      <div style={{ display: "flex", gap: 7, marginTop: 11, flexWrap: "wrap", alignItems: "center" }}>
        {canGenerate && (
          <button className="ci-copybtn"
            style={{ height: 32, padding: "0 13px", fontSize: 12, background: `linear-gradient(135deg,${m.accentFrom}28,${m.accentFrom}12)`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700, opacity: genState === "loading" ? 0.65 : 1 }}
            onClick={generate} disabled={genState === "loading"}>
            {genState === "loading" ? "⏳ Generating…" : "⚡ Generate"}
          </button>
        )}
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12 }} onClick={() => openInChatGPT(block.text)}>🎨 ChatGPT</button>
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12 }} onClick={() => openInGemini(block.text)}>✨ Gemini</button>
        <button className="ci-copybtn" style={{ height: 32, padding: "0 12px", fontSize: 12 }} onClick={copy}>{done ? "✓ Copied" : "⧉ Copy"}</button>
      </div>

      {genState === "loading" && (
        <div style={{ marginTop: 14, padding: "22px 0", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
          <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%", verticalAlign: "middle", marginRight: 8 }} className="spin" />
          Generating image…
        </div>
      )}
      {genState === "error" && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: "#F06A7E", lineHeight: 1.5 }}>{genErr}</div>
      )}
      {genState === "done" && genImg && (
        <div style={{ marginTop: 14 }}>
          <img src={genImg} alt="Generated" style={{ width: "100%", borderRadius: 10, display: "block", maxHeight: 500, objectFit: "contain", background: "#000" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <a href={genImg} download="thumbnail.png" className="ci-copybtn" style={{ height: 30, padding: "0 12px", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>⬇ Download</a>
            <button className="ci-copybtn" style={{ height: 30, padding: "0 12px", fontSize: 12 }} onClick={generate}>↺ Regenerate</button>
            <button className="ci-copybtn" style={{ height: 30, padding: "0 12px", fontSize: 12 }} onClick={() => { setGenState("idle"); setGenImg(null); }}>✕ Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GroundingBadge -- shows whether the report used live web search ───────────
function GroundingBadge({ sources }) {
  const [open, setOpen] = React.useState(false);
  const hasSources = Array.isArray(sources) && sources.length > 0;
  return (
    <div style={{ marginTop: 12, borderTop: "1px solid var(--stroke-1)", paddingTop: 10 }}>
      {hasSources ? (
        <div>
          <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#4ADE80", fontWeight: 600, letterSpacing: 0.2 }}>✅ Verified with {sources.length} live {sources.length === 1 ? "source" : "sources"}</span>
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>{open ? "▲" : "▼"}</span>
          </button>
          {open && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
              {sources.map((s, i) => (
                <a key={i} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none", display: "flex", alignItems: "baseline", gap: 6, lineHeight: 1.4 }}>
                  <span style={{ color: "var(--text-4)", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ textDecoration: "underline", textDecorationColor: "var(--stroke-1)" }}>{s.title || s.url || "Source"}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: "var(--text-4)" }}>⚠ From model knowledge · not live-verified</span>
      )}
    </div>
  );
}

// ── ReportView -- dashboard-style report renderer ─────────────────────────────
function ReportView({ report, mood, onApplyText, sources }) {
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
          <GroundingBadge sources={sources} />
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
          const isHookSection = onApplyText && /hook|opening|intro/i.test(sec.title || "");
          return <Collapsible key={"r" + i} title={sec.title || "Copy & rewrites"} desc={sec.desc} startOpen={isHookSection}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(sec.blocks || []).map((b, j) => (
                <CopyBlock key={j} text={b.text} label={b.label || "Copy"} mono={!!b.mono}
                  onApply={isHookSection ? () => onApplyText(b.text) : undefined} />
              ))}
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

      {/* Shareable, branded summary -- every share markets the tool */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
        <button className="ci-copybtn" style={{ height: 34 }} onClick={() => {
          const sc = typeof report.overall === "number" ? Math.round(report.overall) + "/100" : "";
          const v = report.verdict || {};
          const lines = [
            "ContentIntel report" + (sc ? " — " + sc : ""),
            v.title ? "Verdict: " + v.title + (v.text ? " — " + v.text : "") : "",
            ...(Array.isArray(report.scores) ? report.scores.map(x => "• " + x.name + ": " + Math.round(x.score)) : []),
            report.bottomLine ? "Biggest fix: " + report.bottomLine : "",
            "",
            "Checked with ContentIntel · https://contentintel.in",
          ].filter(Boolean);
          window.copyText(lines.join("\n"));
        }}>⧉ Copy shareable summary</button>
        <span style={{ fontSize: 11.5, color: "var(--text-5)" }}>Includes a contentintel.in credit — share your wins.</span>
      </div>
    </div>
  );
}

// ── KeyModal -- settings: paste key + pick model ──────────────────────────────
function KeyModal({ open, onClose }) {
  const [key, setKey]     = React.useState(getKey());
  const [gkey, setGkey]   = React.useState(getGoogleKey());
  const [okey, setOkey]   = React.useState(getOpenAIKey());
  const [nvkey, setNvkey] = React.useState(getNvidiaKey());
  const [rvkey, setRvkey] = React.useState(getReveKey());
  const [proxy, setProxy] = React.useState(getProxyUrl());
  const [model, setModel] = React.useState(getModel());
  const [show, setShow]   = React.useState(false);
  const [webSearch, setWebSearch] = React.useState(getWebSearch());
  // In hosted/SaaS mode the worker holds the Claude key, so the personal Anthropic
  // key is irrelevant -- open straight to the image/fact-check key and hide that tab.
  const saasMode = typeof window !== "undefined" && !!((window.CI_SAAS || {}).workerUrl);
  const [section, setSection] = React.useState(saasMode ? "image" : "analysis"); // analysis | image
  React.useEffect(() => {
    if (open) { setKey(getKey()); setGkey(getGoogleKey()); setOkey(getOpenAIKey()); setNvkey(getNvidiaKey()); setRvkey(getReveKey()); setProxy(getProxyUrl()); setModel(getModel()); setWebSearch(getWebSearch()); }
  }, [open]);
  if (!open) return null;
  function save() { setKeyLS(key.trim()); setGoogleKeyLS(gkey.trim()); setOpenAIKeyLS(okey.trim()); setNvidiaKeyLS(nvkey.trim()); setReveKeyLS(rvkey.trim()); setProxyUrlLS(proxy.trim()); setModelLS(model); setWebSearchLS(webSearch); onClose(true); }
  function clear() { setKeyLS(""); setKey(""); }

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setSection(id)} style={{ flex: 1, height: 34, border: "none", borderRadius: 8, background: section === id ? "var(--surface-3)" : "transparent", color: section === id ? "var(--text-1)" : "var(--text-3)", fontWeight: section === id ? 700 : 400, fontSize: 13, cursor: "pointer" }}>{label}</button>
  );

  return (
    <div className="ci-modal-scrim" onClick={() => onClose(false)}>
      <div className="ci-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Settings <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-5)" }}>build {window.CI_BUILD || "?"}</span></h3>
          <button className="ci-iconbtn" style={{ width: 30, height: 30 }} onClick={() => onClose(false)}>✕</button>
        </div>

        {/* Tab switcher */}
        {!saasMode && (
          <div style={{ display: "flex", background: "var(--surface-1)", border: "1px solid var(--stroke-1)", borderRadius: 10, padding: 3, marginBottom: 18 }}>
            <TabBtn id="analysis" label="Analysis (Claude)" />
            <TabBtn id="image" label="Image Generation" />
          </div>
        )}

        {section === "analysis" && <>
          <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.55, margin: "0 0 14px" }}>
            ContentIntel runs on <b>your own</b> Anthropic API key — stored only in this browser, sent directly to Anthropic.
          </p>
          <label className="ci-label">Anthropic API key</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="ci-input" type={show ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)} placeholder="sk-ant-..." style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
            <button className="ci-copybtn" style={{ height: 44 }} onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 8 }}>
            No key? Create one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: "var(--text-2)" }}>console.anthropic.com</a>. Without a key you'll see sample reports.
          </div>
          <label className="ci-label" style={{ marginTop: 18 }}>Model</label>
          <select className="ci-input" value={model} onChange={e => setModel(e.target.value)} style={{ appearance: "auto" }}>
            {CI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 8 }}>
            Pricing (approx, per 1M tokens): in ${modelInfo(model).inP} / out ${modelInfo(model).outP}.
          </div>

          <label className="ci-label" style={{ marginTop: 18 }}>Live web search</label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={webSearch} onChange={e => setWebSearch(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--ci-accent, #818CF8)", cursor: "pointer" }} />
            <span style={{ fontSize: 13.5, color: "var(--text-2)" }}>Enable real-time web verification</span>
          </label>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 6, lineHeight: 1.5 }}>
            When on, Claude searches the web before answering — facts, algorithm changes, and numbers are grounded in live sources. Uses roughly <b>2× tokens</b>. Not available on Haiku. Off by default.
          </div>
        </>}

        {section === "image" && <>
          <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.55, margin: "0 0 14px" }}>
            Add a key to generate images <b>directly inside ContentIntel</b> — no ChatGPT or Gemini tab needed.
            Any one key unlocks the <b>⚡ Generate</b> button on all upgrade prompts. The <b>Google AI key</b> also powers the <b>independent fact-check</b> (Gemini + Google Search).
          </p>

          <label className="ci-label">Google AI Studio key <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(Gemini Imagen — recommended)</span></label>
          <input className="ci-input" type="password" value={gkey} onChange={e => setGkey(e.target.value)} placeholder="AIza..." style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 6 }}>
            Free tier available at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: "var(--text-2)" }}>aistudio.google.com</a>. Works directly from the browser (no proxy needed).
          </div>

          <label className="ci-label" style={{ marginTop: 16 }}>OpenAI key <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(DALL-E 3)</span></label>
          <input className="ci-input" type="password" value={okey} onChange={e => setOkey(e.target.value)} placeholder="sk-..." style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 6 }}>
            From <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: "var(--text-2)" }}>platform.openai.com</a>. Requires a proxy URL below to bypass browser CORS restrictions.
          </div>

          <label className="ci-label" style={{ marginTop: 16 }}>Proxy URL <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(optional Cloudflare Worker)</span></label>
          <input className="ci-input" type="url" value={proxy} onChange={e => setProxy(e.target.value)} placeholder="https://your-worker.workers.dev" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 6 }}>
            Routes NVIDIA / Reve / OpenAI calls through your own Worker to bypass CORS. Not needed for Google AI.
          </div>
        </>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <GlowButton mood="navy" onClick={save}>Save</GlowButton>
          {getKey() && <button className="ci-copybtn" style={{ height: 38 }} onClick={clear}>Remove Claude key</button>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CI_MODELS, CI_DEFAULT_MODEL, CI_OUTPUT_GUESS, ADMIN_PASS,
  getKey, setKeyLS, getModel, setModelLS, modelInfo, getWebSearch, setWebSearchLS, getResearch, liveResearch,
  canRun, hasSandbox,
  loadLocalResearch, saveLocalResearch, clearLocalResearch, hasLocalResearch,
  estTokens, fmtTokens, estCost, fmtCost, callClaude, buildSystem, parseReport,
  useAnalysis, AnalyzeButton, UsageBadge, ErrorCard, ReportView, GroundingBadge, KeyModal,
  nicheNames, splitPlaybookBlocks, loadHistory, saveHistory, clearHistory, updateHistory,
  getGoogleKey, setGoogleKeyLS, generateThumbnail, regenPromptFromReport,
  openInChatGPT, openInGemini,
  getNvidiaKey, setNvidiaKeyLS, generateThumbnailFlux, getProxyUrl, setProxyUrlLS,
  getReveKey, setReveKeyLS, generateThumbnailReve,
  getOpenAIKey, setOpenAIKeyLS, generateImageDalle, generateImageInApp, editThumbnailInApp,
  preprocessForImageGen, geminiFactCheck, claudeFactCheck, groundThumbPrompt, packageScript,
});
