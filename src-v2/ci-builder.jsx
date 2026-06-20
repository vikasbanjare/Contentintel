// ContentIntel -- Thumbnail Prompt Studio

const { MOODS: BM, Block: BB, Toggle: BTg, WorkHead: BWH } = window;

const BUILDER_EXPRESSIONS = [
  { id: 'excited',  label: 'Excited',     emoji: '😄' },
  { id: 'shocked',  label: 'Shocked',     emoji: '😮' },
  { id: 'serious',  label: 'Serious',     emoji: '😐' },
  { id: 'pointing', label: 'Pointing',    emoji: '👉' },
  { id: 'laughing', label: 'Laughing',    emoji: '😂' },
  { id: 'love',     label: 'Love / Warm', emoji: '❤️' },
  { id: 'none',     label: 'Do nothing',  emoji: '--'  },
];

const BUILDER_ELEMENTS = [
  'Arrow pointing to subject',
  'Yellow highlight box behind text',
  'Split screen / divider',
  'Glow / neon effect',
  'Brand logo badge',
  'Graph / chart',
  'Before/After',
  'Dark cinematic bars',
  'Circular portrait frame',
  'Emoji overlay',
  'Number / stat callout',
  'Floating text bubble',
];

const BUILDER_RATIOS = [
  { id: 'wide',     label: '16:9', w: 1280, h: 720  },
  { id: 'square',   label: '1:1',  w: 1000, h: 1000 },
  { id: 'vertical', label: '9:16', w: 720,  h: 1280 },
  { id: 'portrait', label: '4:5',  w: 1000, h: 1250 },
];

const OUTPUT_TOOLS = [
  { id: 'chatgpt', label: 'ChatGPT',       icon: '💬', url: 'https://chatgpt.com/',          useQ: true,  note: 'Prompt pre-filled -- paste your photo(s) with Ctrl+V, then press enter' },
  { id: 'gemini',  label: 'Google Gemini', icon: '✨', url: 'https://gemini.google.com/app', useQ: false, note: 'Free -- prompt copied, paste it in and attach your photo(s)' },
];

// The three upgrade tiers MUST be sharply different in scope (shared spec).
const TIER_SPEC =
`THE THREE UPGRADE PROMPTS MUST DIFFER SHARPLY IN SCOPE and each must be a COMPLETE SELF-CONTAINED VISUAL SPECIFICATION -- because these prompts will be sent DIRECTLY to an AI image generator (Gemini Imagen, DALL-E) without the original image. Write what the FINISHED thumbnail LOOKS LIKE, not what to change. Do NOT use "KEEP:", "CHANGE ONLY:", "preserve" or "maintain".

FORMAT FOR EVERY PROMPT: "[Subject: who is in the frame, their position, expression, clothing]. [Text on thumbnail: exact words, font weight, color, placement]. [Background and color scheme]. [Composition and lighting]. Photo quality: ultra-sharp, vibrant saturated colors, cinematic professional lighting, commercial photography quality, 1280×720 YouTube thumbnail."

TIER 1 — BASIC POLISH: Same overall composition as the original but with professional execution. Same number of people in the same approximate positions with the same expression. EXACT same text words, displayed in a BOLDER, LARGER, higher-contrast treatment. Same background type but cleaner/more vivid. This should look like a professionally retouched version with stronger text and contrast.

TIER 2 — MILD REDESIGN: Same person(s) and EXACT same text words, but a different creative composition. New background (different color or scene), different positioning, bolder visual treatment. The subject and text are the same; everything else is redesigned for stronger CTR.

TIER 3 — FULL REIMAGINING: Bold new visual concept for the same topic. Different composition, lighting style, visual metaphor. Keep only the EXACT text words (and the same person if there is one). Maximise scroll-stopping impact at 120px thumbnail size.`;

// Upgrade tier card with inline ⚡ Generate button.
// When sourceImage is available (Builder tab), passes it to Gemini for image-editing mode;
// otherwise falls back to text-to-image.
function BuilderUpgradeCard({ u, i, m, sourceImage, aspect }) {
  const [genState, setGenState] = React.useState('idle');
  const [genImg, setGenImg]     = React.useState(null);
  const [genErr, setGenErr]     = React.useState('');
  const canGenerate = !!(window.getGoogleKey?.() || window.getOpenAIKey?.() || window.getProxyUrl?.());

  async function generate() {
    if (genState === 'loading') return;
    setGenState('loading'); setGenImg(null); setGenErr('');
    try {
      let url;
      if (window.editThumbnailInApp) {
        url = await window.editThumbnailInApp(u.prompt, sourceImage || null, aspect);
      } else if (window.generateImageInApp) {
        url = await window.generateImageInApp(u.prompt, aspect);
      } else {
        throw new Error('NO_IMAGE_KEY');
      }
      setGenImg(url); setGenState('done');
    } catch (e) {
      const msg = String(e?.message || '');
      setGenErr(msg === 'NO_IMAGE_KEY' ? 'Add a Google AI key in Settings (Image Generation tab) to generate in-app.' : (msg || 'Generation failed — try again.'));
      setGenState('error');
    }
  }

  return (
    <div style={{ padding: '13px 14px', borderRadius: 12, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: m.accentFrom, marginBottom: 6 }}>{i + 1}. {u.tier || ('Option ' + (i + 1))}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{u.prompt}</div>
      <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {canGenerate && (
          <button className="ci-copybtn"
            style={{ height: 32, padding: '0 13px', fontSize: 12, background: `${m.accentFrom}28`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700, opacity: genState === 'loading' ? 0.65 : 1 }}
            onClick={generate} disabled={genState === 'loading'}>
            {genState === 'loading' ? '⏳ Generating…' : `⚡ Generate${sourceImage ? ' (edit)' : ''}`}
          </button>
        )}
        <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12, background: `${m.accentFrom}18`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700 }} onClick={() => window.openInChatGPT(u.prompt)}>🎨 ChatGPT</button>
        <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12 }} onClick={() => window.openInGemini(u.prompt)}>✨ Gemini</button>
        <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12 }} onClick={() => window.copyText && window.copyText(u.prompt)}>⧉ Copy</button>
      </div>
      {genState === 'loading' && (
        <div style={{ marginTop: 14, padding: '22px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'middle', marginRight: 8 }} className="spin" />
          {sourceImage ? 'Editing your thumbnail with AI…' : 'Generating thumbnail…'}
        </div>
      )}
      {genState === 'error' && <div style={{ marginTop: 10, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{genErr}</div>}
      {genState === 'done' && genImg && (
        <div style={{ marginTop: 14 }}>
          <img src={genImg} alt="Generated" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 420, objectFit: 'contain', background: '#000' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a href={genImg} download="thumbnail.png" className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>⬇ Download</a>
            <button className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={generate}>↺ Regenerate</button>
            <button className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={() => { setGenState('idle'); setGenImg(null); }}>✕ Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

// In-app generation for the MAIN builder prompt -- creates the thumbnail right here
// with Gemini (Google AI key) or DALL-E (OpenAI/proxy). Only renders when a key is set.
function GenerateHere({ prompt, sourceImage, m, aspect }) {
  const [st, setSt] = React.useState('idle');
  const [img, setImg] = React.useState(null);
  const [err, setErr] = React.useState('');
  const canGen = !!(window.getGoogleKey?.() || window.getOpenAIKey?.() || window.getProxyUrl?.());
  const usingGoogle = !!window.getGoogleKey?.();
  if (!canGen) return null;
  async function go() {
    if (st === 'loading' || !prompt.trim()) return;
    setSt('loading'); setImg(null); setErr('');
    try {
      let url;
      if (sourceImage && window.editThumbnailInApp) url = await window.editThumbnailInApp(prompt, sourceImage, aspect);
      else url = await window.generateImageInApp(prompt, aspect);
      setImg(url); setSt('done');
    } catch (e) {
      const msg = String(e?.message || '');
      setErr(msg === 'NO_IMAGE_KEY' ? 'Add a Google AI key in Settings → Image Generation to generate here.' : (msg || 'Generation failed — try again.'));
      setSt('error');
    }
  }
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${m.accentFrom}1f, var(--inset))`, border: `1.5px solid ${m.accentGlow}`, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-1)' }}>⚡ Generate it right here {usingGoogle ? 'with Gemini' : ''}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{sourceImage ? 'Edits your uploaded thumbnail as the base.' : 'Creates the image in-app — no copy/paste needed.'}</div>
        </div>
        <button className="ci-copybtn"
          style={{ height: 36, padding: '0 16px', fontSize: 13, background: `${m.accentFrom}30`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700, opacity: st === 'loading' ? 0.65 : 1 }}
          onClick={go} disabled={st === 'loading'}>
          {st === 'loading' ? '⏳ Generating…' : st === 'done' ? '↺ Regenerate' : '⚡ Generate'}
        </button>
      </div>
      {st === 'loading' && (
        <div style={{ marginTop: 14, padding: '22px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'middle', marginRight: 8 }} className="spin" />
          {sourceImage ? 'Editing your thumbnail with AI…' : 'Generating your thumbnail…'}
        </div>
      )}
      {st === 'error' && <div style={{ marginTop: 10, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{err}</div>}
      {st === 'done' && img && (
        <div style={{ marginTop: 14 }}>
          <img src={img} alt="Generated thumbnail" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 420, objectFit: 'contain', background: '#000' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a href={img} download="thumbnail.png" className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>⬇ Download</a>
            <button className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={() => { setSt('idle'); setImg(null); }}>✕ Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

function bReadImage(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    cb({ mime: file.type || 'image/png', data: String(url).split(',')[1] || '', preview: url, name: file.name });
  };
  reader.readAsDataURL(file);
}

function bLoadBrand() {
  try { return JSON.parse(localStorage.getItem('ci_brandkit')) || { colors: [], note: '' }; }
  catch (e) { return { colors: [], note: '' }; }
}

async function bCopyImageToClipboard(dataUrl, mime) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if (!navigator.clipboard || !window.ClipboardItem) throw new Error('not supported');
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || mime || 'image/png']: blob })]);
}

function analyzeImageQuality(previewUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 200 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = data.length / 4;
        let sumL = 0, sumS = 0, minL = 255, maxL = 0;
        const lumas = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          const l = (mx + mn) / 2;
          const s = mx === mn ? 0 : (l < 128 ? (mx - mn) / (mx + mn) : (mx - mn) / (510 - mx - mn));
          lumas.push(l);
          sumL += l; sumS += s;
          if (l < minL) minL = l;
          if (l > maxL) maxL = l;
        }
        const avgL = sumL / pixels;
        const avgS = sumS / pixels;
        const variance = lumas.reduce((acc, l) => acc + (l - avgL) ** 2, 0) / pixels;
        const stdDev = Math.sqrt(variance);
        const brightness = Math.round(avgL / 255 * 100);
        const contrast = Math.round(Math.min(stdDev / 80, 1) * 100);
        const saturation = Math.round(Math.min(avgS * 2, 1) * 100);
        const range = Math.round((maxL - minL) / 255 * 100);
        const brightScore = brightness >= 30 && brightness <= 80 ? 'green' : brightness < 20 || brightness > 90 ? 'red' : 'yellow';
        const contrastScore = contrast >= 45 ? 'green' : contrast >= 25 ? 'yellow' : 'red';
        const satScore = saturation >= 30 ? 'green' : saturation >= 15 ? 'yellow' : 'red';
        res({ brightness, contrast, saturation, range, brightScore, contrastScore, satScore });
      } catch (e) { rej(e); }
    };
    img.onerror = rej;
    img.src = previewUrl;
  });
}

async function extractColorPalette(previewUrl) {
  if (!window.ColorThief) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      try {
        const ct = new window.ColorThief();
        const palette = ct.getPalette(img, 8);
        res(palette.map(([r, g, b]) => ({
          rgb: `rgb(${r},${g},${b})`,
          hex: '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
        })));
      } catch (e) { rej(e); }
    };
    img.onerror = rej;
    img.src = previewUrl;
  });
}

function BuilderTab({ onNav }) {
  const mood = 'ember';
  const m = BM[mood];

  const [ratio, setRatio] = React.useState('wide');
  const currentRatio = BUILDER_RATIOS.find(r => r.id === ratio) || BUILDER_RATIOS[0];

  const [people, setPeople] = React.useState([]);
  function addPerson() { if (people.length < 10) setPeople(ps => [...ps, { photo: null, expression: 'excited', desc: '' }]); }
  function setPersonPhoto(i, file) { bReadImage(file, img => setPeople(ps => ps.map((p, j) => j === i ? { ...p, photo: img } : p))); }
  function clearPersonPhoto(i) { setPeople(ps => ps.map((p, j) => j === i ? { ...p, photo: null } : p)); }
  function setPersonExpr(i, v) { setPeople(ps => ps.map((p, j) => j === i ? { ...p, expression: v } : p)); }
  function setPersonDesc(i, v) { setPeople(ps => ps.map((p, j) => j === i ? { ...p, desc: v } : p)); }
  function removePerson(i) { setPeople(ps => ps.filter((_, j) => j !== i)); }
  async function autoDescribePerson(i) {
    const p = people[i]; if (!p || !p.photo) return;
    setAutoDescState(s => ({ ...s, [i]: 'loading' }));
    try {
      const { text } = await window.callClaude({
        system: 'Describe the person in this photo in one short sentence suitable for an AI image generator. Focus on: approximate age, gender, notable features, clothing, and skin tone. Keep it under 30 words. Return ONLY the description.',
        userText: 'Describe this person for a thumbnail image generator.',
        image: p.photo,
        maxTokens: 80,
        temperature: 0.2,
      });
      const desc = (text || '').trim().replace(/^["']|["']$/g, '');
      if (desc) setPersonDesc(i, desc);
      setAutoDescState(s => ({ ...s, [i]: 'done' }));
      setTimeout(() => setAutoDescState(s => ({ ...s, [i]: 'idle' })), 2000);
    } catch (e) {
      setAutoDescState(s => ({ ...s, [i]: 'idle' }));
    }
  }

  // Prefill from a "Build this thumbnail" handoff from the Script tab (text + brief).
  // Only prefill when the handoff is < 1 hour old — stale data from yesterday is confusing.
  const bootCreate = React.useMemo(() => { try { return JSON.parse(localStorage.getItem('ci_last_create') || '{}'); } catch (e) { return {}; } }, []);
  const bootFresh = Date.now() - (bootCreate.ts || 0) < 3600000;
  const [headline, setHeadline] = React.useState(bootFresh ? (bootCreate.thumbText || '') : '');
  const [subline, setSubline] = React.useState('');

  // Live bridge: when the Script tab fires a packaging handoff while Builder is mounted,
  // update headline and extraNote without requiring a remount.
  React.useEffect(() => {
    function onHandoff() {
      try {
        const d = JSON.parse(localStorage.getItem('ci_last_create') || '{}');
        if (!d || !d.ts || Date.now() - d.ts > 5000) return; // ignore old entries
        if (d.thumbText) setHeadline(d.thumbText);
        if (d.brief) setExtraNote('Scene context from the script: ' + d.brief);
      } catch (e) {}
    }
    window.addEventListener('ci-builder-handoff', onHandoff);
    return () => window.removeEventListener('ci-builder-handoff', onHandoff);
  }, []);
  const [elements, setElements] = React.useState([]);
  const toggleEl = el => setElements(es => es.includes(el) ? es.filter(x => x !== el) : [...es, el]);

  const [refImg, setRefImg] = React.useState(null);
  const [refOverride, setRefOverride] = React.useState(false);
  const [refState, setRefState] = React.useState('idle');
  const [refAnalysis, setRefAnalysis] = React.useState('');

  const [analyseImg, setAnalyseImg] = React.useState(null);
  const [analyseDesc, setAnalyseDesc] = React.useState('');
  const [analyseState, setAnalyseState] = React.useState('idle');
  const [analyseSummary, setAnalyseSummary] = React.useState('');
  const [feedback, setFeedback] = React.useState([]); // research-based "what's wrong" list
  const [upgrades, setUpgrades] = React.useState([]); // 3 tiers: basic / mild / full
  const [colorPalette, setColorPalette] = React.useState([]);
  const [imageQuality, setImageQuality] = React.useState(null);

  React.useEffect(() => {
    if (!analyseImg) { setColorPalette([]); setImageQuality(null); return; }
    extractColorPalette(analyseImg.preview).then(setColorPalette).catch(() => setColorPalette([]));
    analyzeImageQuality(analyseImg.preview).then(setImageQuality).catch(() => setImageQuality(null));
  }, [analyseImg]);

  const [extraNote, setExtraNote] = React.useState(bootFresh && bootCreate.brief ? ('Scene context from the script: ' + bootCreate.brief) : '');
  const [brand] = React.useState(bLoadBrand);
  const brandColors = (brand.colors || []).filter(Boolean);
  const hasBrand = brandColors.length > 0 || !!brand.note;

  const [prompt, setPrompt] = React.useState('');
  const [built, setBuilt] = React.useState(false);
  const [building, setBuilding] = React.useState(false);
  const [groundingFailed, setGroundingFailed] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState('');
  const [autoDescState, setAutoDescState] = React.useState({});

  // AI thumbnail-text suggestions. Prefills the topic from the last Create result
  // (the "carry the script's topic into the thumbnail" thread) -- but the field is
  // free-type too, so it works whether or not you came from a generated script.
  const lastCreate = bootCreate; // same object, aliased for clarity
  const [txtTopic, setTxtTopic] = React.useState(bootFresh ? (bootCreate.title || bootCreate.topic || '') : '');
  const [txtState, setTxtState] = React.useState('idle');
  const [txtOpts, setTxtOpts] = React.useState([]);
  const [txtErr, setTxtErr] = React.useState('');

  async function suggestText() {
    const t = txtTopic.trim();
    if (t.length < 3) { setTxtState('needinput'); return; }
    setTxtState('loading'); setTxtErr(''); setTxtOpts([]);
    try {
      const sys = [
        'You suggest the TEXT that goes ON a video thumbnail -- the big overlay words -- for a given video topic or title.',
        'RULES: the "headline" is 2-5 BIG words max, legible at 120px; optionally a 2-4 word "sub". Make each punchy and click-earning via curiosity, a number, contrast, or stakes. NEVER a full sentence, never generic. Each of the 5 options must take a DIFFERENT angle. Write in the SAME language as the topic.',
        'Return ONLY one JSON object: { "options": [ { "headline": "BIG WORDS", "sub": "optional short sub or empty", "why": "one short reason it earns the click" } x5 ] }',
      ].join('\n\n');
      const { text } = await window.callClaude({ system: sys, userText: `Video topic/title: ${t}\n\nSuggest the thumbnail text now.`, maxTokens: 900 });
      const j = window.parseReport(text);
      const opts = (j && Array.isArray(j.options) ? j.options : []).filter(o => o && o.headline).slice(0, 5);
      if (!opts.length) throw new Error('no options');
      setTxtOpts(opts); setTxtState('done');
    } catch (e) {
      setTxtErr(String(e.message) === 'NO_KEY' ? 'Sign in (or add an API key) to suggest text.' : 'Could not suggest text -- try again.');
      setTxtState('error');
    }
  }
  function useSuggestion(o) { setHeadline((o.headline || '').trim()); setSubline((o.sub || '').trim()); }

  const hasKey = !!(window.getKey && window.getKey());
  const canCloud = !!(window.canRun && window.canRun()); // own key OR free Claude cloud

  // Research-grounded system prompt for the cloud check (NOT the report shape).
  function thumbSystem() {
    const r = (window.getResearch && window.getResearch('thumbnail')) || {};
    const st = (window.getResearch && window.getResearch('studio')) || {};
    const core = (window.liveResearch && window.liveResearch().core) || '';
    return [
      'You are a world-class YouTube thumbnail strategist. You judge thumbnails purely by what earns the click, grounded in the research below. Be specific and blunt -- no generic advice.',
      core ? 'RESEARCH PRINCIPLES:\n' + core : '',
      r.systemGuidance ? 'THUMBNAIL METHODOLOGY:\n' + r.systemGuidance : '',
      st.systemGuidance ? 'IMAGE-PROMPT QUALITY SCIENCE (every upgrade prompt MUST follow these rules):\n' + st.systemGuidance : '',
      'You will get a thumbnail as an image if one is attached, otherwise as a text description. Analyse it and return ONLY a single valid JSON object (no markdown, no text around it) in EXACTLY this shape:',
      '{ "whatsWrong": ["specific problem tied to a real click-through principle", "... up to 6"], "upgrades": [ { "tier": "Basic polish (keep the photo)", "prompt": "..." }, { "tier": "Mild redesign (same person & text, new design)", "prompt": "..." }, { "tier": "Full reimagining (change everything)", "prompt": "..." } ], "headline": "exact main text or empty", "subline": "secondary text or empty", "people": [{ "desc": "appearance", "expression": "excited|shocked|serious|pointing|laughing|love|none" }], "elements": ["only from: ' + BUILDER_ELEMENTS.join(', ') + '"] }',
      TIER_SPEC,
      'Every prompt must be concrete and DETAILED about composition, subject, colour, contrast and text size/placement. Never invent text, people or brands not present. Write in the same language as the thumbnail content.',
    ].filter(Boolean).join('\n\n');
  }

  // Wipe everything from a previous analysis so a new upload starts clean.
  function clearForm() {
    setHeadline(''); setSubline(''); setPeople([]); setElements([]);
    setFeedback([]); setUpgrades([]); setPrompt(''); setBuilt(false);
    setAnalyseSummary(''); setAnalyseDesc(''); setColorPalette([]); setImageQuality(null);
  }

  // Cloud check: works free inside Claude (text description) OR with an API key
  // (image vision). Finds what's wrong per the research and writes the fixed prompt.
  async function cloudCheck() {
    if (!canCloud) { setAnalyseState('nokey'); return; }
    if (!analyseImg && !analyseDesc.trim()) { setAnalyseState('needinput'); return; }
    setAnalyseState('loading'); setFeedback([]); setAnalyseSummary('');
    try {
      const userText = (analyseDesc.trim()
        ? 'Thumbnail description from the creator:\n' + analyseDesc.trim()
        : 'Analyse the attached thumbnail image.')
        + (headline.trim() ? '\nKnown headline text: "' + headline.trim() + '"' : '')
        + '\n\nReturn the JSON now.';
      // Only send the image to the vision model when the user has their own key;
      // the free Claude cloud is text-only, so it reads the description instead.
      const images = (hasKey && analyseImg) ? [analyseImg] : [];
      const { text } = await window.callClaude({ system: thumbSystem(), userText, images, maxTokens: 1600 });
      const parsed = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ['null'])[0]);
      if (!parsed) { setAnalyseState('error'); return; }
      // Replace fields unconditionally so a new thumbnail fully overwrites the
      // last one (empty values clear the old text instead of leaving it behind).
      setHeadline(parsed.headline || '');
      setSubline(parsed.subline || '');
      setPeople(Array.isArray(parsed.people) ? parsed.people.slice(0, 10).map(p => ({
        photo: null,
        expression: BUILDER_EXPRESSIONS.find(e => e.id === p.expression) ? p.expression : 'none',
        desc: p.desc || '',
      })) : []);
      setElements(Array.isArray(parsed.elements) ? parsed.elements.filter(e => BUILDER_ELEMENTS.includes(e)) : []);
      setFeedback(Array.isArray(parsed.whatsWrong) ? parsed.whatsWrong.filter(Boolean).slice(0, 6) : []);
      // Three tiers (basic / mild / full). Fall back to a single improvedPrompt if present.
      let ups = Array.isArray(parsed.upgrades) ? parsed.upgrades.filter(u => u && u.prompt).slice(0, 3) : [];
      if (!ups.length && parsed.improvedPrompt) ups = [{ tier: 'Improved version', prompt: String(parsed.improvedPrompt) }];
      setUpgrades(ups);
      if (ups.length) { setPrompt(ups[0].prompt); setBuilt(true); }
      setAnalyseSummary(hasKey && analyseImg ? 'Checked your image with the research.' : 'Checked your description with the research (free cloud).');
      setAnalyseState('done');
      setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140);
    } catch (e) {
      setAnalyseState(String(e && e.message) === 'NO_KEY' ? 'nokey' : 'error');
    }
  }

  async function analyzeRef() {
    if (!refImg) return;
    setRefState('loading');
    try {
      const { text: raw } = await window.callClaude({
        system: 'Extract visual design properties from this thumbnail image. Return ONLY a JSON object, no markdown.',
        userText: 'Analyse this thumbnail. Return JSON: { "layout": "...", "colors": "...", "textStyle": "...", "mood": "...", "keyElements": "..." }',
        image: refImg,
        maxTokens: 350,
        temperature: 0.2,
      });
      let parsed = null;
      try { parsed = JSON.parse((raw || '').match(/\{[\s\S]*\}/)?.[0] || 'null'); } catch (pe) {}
      if (parsed && typeof parsed === 'object') {
        setRefAnalysis(Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n'));
      } else {
        // Model returned prose instead of JSON — use it verbatim as style notes.
        const prose = (raw || '').trim().slice(0, 500);
        if (prose) setRefAnalysis(prose);
      }
      setRefState('done');
    } catch (e) {
      if (String(e?.message) === 'NO_KEY') setRefState('idle');
      else setRefState('error');
    }
  }

  function buildPrompt() {
    const lines = [];
    lines.push(`Create a thumbnail image (${currentRatio.label} aspect ratio, ${currentRatio.w}x${currentRatio.h}px).`);
    lines.push('');
    if (people.length > 0) {
      lines.push(`PEOPLE: ${people.length} person${people.length > 1 ? 's' : ''}.`);
      people.forEach((p, i) => {
        const ex = BUILDER_EXPRESSIONS.find(e => e.id === p.expression);
        const exText = ex && ex.id !== 'none' ? `expression: ${ex.label}` : 'natural expression';
        lines.push(`- Person ${i + 1}${p.photo ? ` (see photo ${i + 1})` : ''} -- ${exText}${p.desc.trim() ? `, looks like: ${p.desc.trim()}` : ''}.`);
      });
      lines.push('');
    }
    if (headline.trim() || subline.trim()) {
      lines.push('TEXT ON THUMBNAIL:');
      if (headline.trim()) lines.push(`- Main headline: "${headline.trim()}" -- large, bold, dominant.`);
      if (subline.trim()) lines.push(`- Sub-text: "${subline.trim()}" -- smaller, secondary.`);
      lines.push('');
    }
    if (elements.length > 0) { lines.push(`VISUAL ELEMENTS: ${elements.join('. ')}.`); lines.push(''); }
    // Colour is only added when the user actually set brand colours (or notes).
    // No auto-filled/random palette -- that caused unwanted, off-brand colours.
    if (hasBrand && (refOverride || !refImg)) {
      const colorRoles = brandColors.map((c, i) => {
        const role = i === 0 ? 'Primary/background' : i === 1 ? 'Accent/text' : i === 2 ? 'Secondary accent' : 'Highlight';
        return `${role}: ${c}`;
      });
      const cp = [colorRoles.length ? `MANDATORY palette -- ${colorRoles.join('; ')}.` : '', brand.note ? `Brand notes: ${brand.note}.` : ''].filter(Boolean).join(' ');
      lines.push(`COLOUR (use these exact colours): ${cp} Do not substitute or ignore these.`); lines.push('');
    }
    if (refImg) {
      if (refAnalysis) {
        const al = refOverride && hasBrand ? refAnalysis.split('\n').filter(l => !l.startsWith('colors')).join('\n') : refAnalysis;
        lines.push('STYLE REFERENCE (match this image visual DNA):'); lines.push(al);
        if (refOverride && hasBrand) lines.push('Apply brand colours above instead of reference colours.');
      } else {
        lines.push(`STYLE: Match layout and energy of the attached reference image.${refOverride && hasBrand ? ' Use brand colours above instead.' : ''}`);
      }
      lines.push('');
    }
    if (extraNote.trim()) { lines.push(`ADDITIONAL DIRECTION: ${extraNote.trim()}`); lines.push(''); }
    lines.push('Make it bold, high-contrast, impossible to ignore at small thumbnail size. Professional photography and design quality.');
    const brief = lines.join('\n');
    // Route the brief through Claude (art director) so the prompt actually applies
    // the researched layouts/colour-schemes/principles. Fall back to the raw brief.
    // setBuilt(true) is intentionally in .finally() so the output section only
    // reveals after grounding completes — not mid-request with the raw prompt.
    if (window.canRun && window.canRun() && window.groundThumbPrompt) {
      setPrompt(brief); setBuilding(true);
      window.groundThumbPrompt(brief, { ratio: currentRatio })
        .then(g => { setPrompt((g && g.length > 40) ? g : brief); })
        .catch(() => { setPrompt(brief); setGroundingFailed(true); })
        .finally(() => { setBuilding(false); setBuilt(true); setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); });
    } else {
      setPrompt(brief);
      setBuilt(true);
      setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  function openIn(tool) {
    // Route through the shared handoffs (ChatGPT pre-fills via URL; Gemini copies
    // synchronously so the paste actually works).
    if (tool.id === 'chatgpt' && window.openInChatGPT) return window.openInChatGPT(prompt);
    if (tool.id === 'gemini' && window.openInGemini) return window.openInGemini(prompt);
    try { window.copyText && window.copyText(prompt); } catch (e) {}
    if (tool.useQ) window.open(tool.url + '?q=' + encodeURIComponent(prompt.slice(0, 6000)), '_blank', 'noopener,noreferrer');
    else window.open(tool.url, '_blank', 'noopener,noreferrer');
  }

  async function copyPhoto(person, idx) {
    if (!person.photo) return;
    try { await bCopyImageToClipboard(person.photo.preview, person.photo.mime); setCopyFeedback('ok-' + idx); }
    catch (e) { setCopyFeedback('fail-' + idx); }
    setTimeout(() => setCopyFeedback(''), 2200);
  }

  async function copyRefImgFn() {
    try { await bCopyImageToClipboard(refImg.preview, refImg.mime); setCopyFeedback('ref-ok'); }
    catch (e) { setCopyFeedback('ref-fail'); }
    setTimeout(() => setCopyFeedback(''), 2200);
  }

  const photoPeople = people.filter(p => p.photo);

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <BWH mood={mood} eyebrow="Prompt Studio" title="Build your thumbnail prompt"
        sub="Check your current thumbnail free (it tells you what's wrong and writes the fix), or build one from scratch -- then send it to ChatGPT or Gemini." />

      {/* CLOUD CHECK -- free, no API key */}
      <BB mood={mood} title="Check & fix my thumbnail" desc="Runs free inside Claude -- no API key. Describe your current thumbnail (or upload it if you have an API key for image vision). It finds what's wrong using the research and writes the fixed prompt below.">
        {analyseImg && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={analyseImg.preview} alt="" style={{ width: 120, borderRadius: 9, border: '1px solid var(--stroke-1)', flexShrink: 0 }} />
              <div>
                <button className="ci-copybtn" style={{ height: 30, fontSize: 11.5 }}
                  onClick={() => { setAnalyseImg(null); clearForm(); setAnalyseState('idle'); }}>Remove image</button>
                {colorPalette.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Color palette</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {colorPalette.map((c, i) => (
                        <div key={i} title={`${c.hex} — click to copy`}
                          style={{ width: 24, height: 24, borderRadius: 6, background: c.rgb, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', flexShrink: 0, transition: 'transform .1s' }}
                          onClick={() => window.copyText && window.copyText(c.hex)}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={e => e.currentTarget.style.transform = ''} />
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-5)', marginTop: 4 }}>Click a swatch to copy its hex</div>
                  </div>
                )}
                {imageQuality && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Visual quality</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Brightness', val: imageQuality.brightness + '%', lvl: imageQuality.brightScore },
                        { label: 'Contrast', val: imageQuality.contrast + '%', lvl: imageQuality.contrastScore },
                        { label: 'Saturation', val: imageQuality.saturation + '%', lvl: imageQuality.satScore },
                      ].map(q => {
                        const col = q.lvl === 'green' ? '#8FD86A' : q.lvl === 'yellow' ? '#F0C85A' : '#F06A7E';
                        return (
                          <div key={q.label} style={{ padding: '4px 8px', borderRadius: 7, background: col + '18', border: `1px solid ${col}33`, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: col }}>{q.val}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{q.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!analyseImg && (
          <label className="ci-drop" style={{ minHeight: 72, flexDirection: 'row', gap: 8, cursor: 'pointer', padding: 12, marginBottom: 10 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && bReadImage(e.target.files[0], img => { clearForm(); setAnalyseState('idle'); setAnalyseImg(img); })} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
            <span style={{ fontSize: 12.5 }}>Upload your thumbnail <span style={{ color: 'var(--text-5)' }}>(optional -- only read with an API key)</span></span>
          </label>
        )}
        <label className="ci-label">Describe your current thumbnail</label>
        <textarea className="ci-textarea" style={{ minHeight: 80 }} value={analyseDesc} onChange={e => setAnalyseDesc(e.target.value)}
          placeholder="e.g. My face on the right looking normal, big white text 'NEW PHONE' on a grey background, phone in my hand on the left." />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <window.GlowButton mood={mood} onClick={cloudCheck} style={{ opacity: analyseState === 'loading' ? 0.65 : 1 }}>
            {analyseState === 'loading' ? 'Checking...' : analyseState === 'done' ? 'Check again' : (hasKey && analyseImg ? 'Check my image (free)' : 'Check & fix it (free)')}
          </window.GlowButton>
          {analyseState === 'loading' && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Reading the research...</span>}
          {analyseState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A' }}>{analyseSummary}</span>}
          {analyseState === 'error' && <span style={{ fontSize: 12, color: '#f5788c' }}>Couldn't read the result -- try again.</span>}
          {analyseState === 'needinput' && <span style={{ fontSize: 12, color: '#F0C85A' }}>Describe or upload your thumbnail first.</span>}
        </div>
        {analyseState === 'nokey' && (
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 10, padding: '10px 12px', borderRadius: 9, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.2)', lineHeight: 1.5 }}>
            To check for free, open this app inside <b>Claude.ai</b> (it uses Claude's cloud, no key). Or add your own API key in Settings.
          </div>
        )}
        {feedback.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>What's wrong (from the research):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {feedback.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  <span style={{ color: m.accentFrom, fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 10 }}>The fixed prompt is ready below -- send it to ChatGPT or Gemini.</div>
          </div>
        )}
      </BB>

      {/* ASPECT RATIO */}
      <BB mood={mood}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Aspect ratio</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BUILDER_RATIOS.map(r => (
            <button key={r.id} className="pill" onClick={() => setRatio(r.id)}
              style={{ height: 36, padding: '0 18px', fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 700,
                background: ratio === r.id ? `${m.accentFrom}1a` : 'transparent',
                borderColor: ratio === r.id ? m.accentGlow : 'var(--stroke-1)',
                color: ratio === r.id ? m.accentFrom : 'var(--text-3)' }}>
              {r.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 7, fontSize: 11.5, color: 'var(--text-5)' }}>{currentRatio.w} x {currentRatio.h} px</div>
      </BB>

      {/* PEOPLE */}
      <BB mood={mood} title="People" desc="Add up to 10 subjects. Describe appearance -- it goes into the prompt. Upload a photo only to paste manually into ChatGPT.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {people.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
              <div style={{ flexShrink: 0 }}>
                {p.photo ? (
                  <div style={{ position: 'relative', width: 58 }}>
                    <img src={p.photo.preview} alt="" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid var(--stroke-1)' }} />
                    <button onClick={() => clearPersonPhoto(i)}
                      style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'var(--inset)', color: '#fff', fontSize: 8, cursor: 'pointer', lineHeight: '16px', textAlign: 'center', padding: 0 }}>x</button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 58, height: 58, borderRadius: 8, border: '1.5px dashed var(--stroke-2)', cursor: 'pointer', color: 'var(--text-5)', gap: 2, background: 'rgba(255,255,255,0.02)' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && setPersonPhoto(i, e.target.files[0])} />
                    <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: 9 }}>photo</span>
                  </label>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: m.accentFrom, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Person {i + 1}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="ci-input" style={{ fontSize: 12, flex: 1 }} value={p.desc} onChange={e => setPersonDesc(i, e.target.value)}
                    placeholder="Describe appearance -- e.g. man in 30s, brown hair, glasses" />
                  {p.photo && (
                    <button className="ci-copybtn" style={{ height: 40, padding: '0 10px', fontSize: 11.5, whiteSpace: 'nowrap', flexShrink: 0 }}
                      onClick={() => autoDescribePerson(i)} disabled={autoDescState[i] === 'loading'}>
                      {autoDescState[i] === 'loading' ? '…' : autoDescState[i] === 'done' ? '✓' : '✦ Auto'}
                    </button>
                  )}
                </div>
                <select className="ci-input" style={{ fontSize: 12, height: 30, padding: '0 6px', appearance: 'auto' }}
                  value={p.expression} onChange={e => setPersonExpr(i, e.target.value)}>
                  {BUILDER_EXPRESSIONS.map(ex => <option key={ex.id} value={ex.id}>{ex.emoji} {ex.label}</option>)}
                </select>
              </div>
              <button onClick={() => removePerson(i)}
                style={{ background: 'none', border: 'none', color: 'var(--text-5)', cursor: 'pointer', fontSize: 14, padding: '2px 4px', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>x</button>
            </div>
          ))}
        </div>
        {people.length < 10 && (
          <button className="ci-copybtn" style={{ marginTop: people.length > 0 ? 8 : 0, fontSize: 12.5 }} onClick={addPerson}>+ Add person</button>
        )}
        {people.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-5)', marginTop: 6 }}>No people added -- leave empty to generate without subjects.</div>}
      </BB>

      {/* TEXT */}
      <BB mood={mood} title="Text on thumbnail" desc="Let AI suggest the big words, or type your own -- leave blank to skip">
        {/* AI suggestion */}
        <label className="ci-label">Suggest from a topic / title</label>
        {lastCreate.topic && <div style={{ fontSize: 11.5, color: m.accentFrom, marginBottom: 6 }}>↳ pulled from your last generated script — edit it or use as-is</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="ci-input" style={{ flex: 1, minWidth: 200 }} value={txtTopic} onChange={e => setTxtTopic(e.target.value)} placeholder="e.g. How I saved ₹5 lakh in a year" />
          <button className="ci-copybtn" style={{ height: 40, padding: '0 14px', whiteSpace: 'nowrap', background: `${m.accentFrom}18`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700 }}
            onClick={suggestText} disabled={txtState === 'loading'}>{txtState === 'loading' ? 'Thinking…' : '✦ Suggest text'}</button>
        </div>
        {txtState === 'needinput' && <div style={{ fontSize: 12, color: '#F0C85A', marginTop: 6 }}>Type a topic or title first.</div>}
        {txtState === 'error' && <div style={{ fontSize: 12, color: '#f5788c', marginTop: 6 }}>{txtErr}</div>}
        {txtOpts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {txtOpts.map((o, i) => (
              <button key={i} onClick={() => useSuggestion(o)}
                style={{ textAlign: 'left', cursor: 'pointer', padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-1)' }}>{o.headline}{o.sub ? <span style={{ fontWeight: 600, color: 'var(--text-3)' }}> · {o.sub}</span> : null}</div>
                {o.why && <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 3 }}>{o.why}</div>}
              </button>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-5)' }}>Tap one to fill the fields below — then edit freely.</div>
          </div>
        )}
        <div style={{ height: 1, background: 'var(--stroke-1)', margin: '14px 0' }} />
        <input className="ci-input" value={headline} onChange={e => setHeadline(e.target.value)} placeholder='Main headline -- e.g. I QUIT MY JOB' />
        <input className="ci-input" style={{ marginTop: 8 }} value={subline} onChange={e => setSubline(e.target.value)} placeholder="Sub-text -- e.g. what happened next" />
      </BB>

      {/* VISUAL ELEMENTS */}
      <BB mood={mood} title="Visual elements" desc="Pick what you want in the thumbnail">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BUILDER_ELEMENTS.map(el => {
            const on = elements.includes(el);
            return (
              <button key={el} className="pill" onClick={() => toggleEl(el)}
                style={{ height: 32, borderColor: on ? m.accentGlow : 'var(--stroke-1)', color: on ? m.accentFrom : 'var(--text-3)', background: on ? `${m.accentFrom}1a` : 'transparent' }}>
                {on ? '+ ' : '+ '}{el}
              </button>
            );
          })}
        </div>
      </BB>

      {/* REFERENCE IMAGE */}
      <BB mood={mood} title="Reference image" desc="Optional -- upload a thumbnail whose style you want to match">
        {!refImg ? (
          <label className="ci-drop" style={{ minHeight: 90, flexDirection: 'column', gap: 6, cursor: 'pointer', padding: 14 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && bReadImage(e.target.files[0], img => { setRefImg(img); setRefAnalysis(''); setRefState('idle'); })} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
            <span style={{ fontSize: 13 }}>Drop a reference thumbnail</span>
          </label>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={refImg.preview} alt="" style={{ width: 140, borderRadius: 9, border: '1px solid var(--stroke-1)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <button className="ci-copybtn" style={{ height: 28, fontSize: 11.5 }}
                  onClick={() => { setRefImg(null); setRefAnalysis(''); setRefState('idle'); }}>Remove</button>
                {window.canRun?.() && refState === 'idle' && (
                  <button className="ci-copybtn" style={{ height: 28, fontSize: 11.5 }} onClick={analyzeRef}>Detect style</button>
                )}
                {refState === 'loading' && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Detecting...</span>}
                {refState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A' }}>Style detected</span>}
                {refState === 'error' && <span style={{ fontSize: 12, color: '#f5788c' }}>Detection failed</span>}
              </div>
              {refAnalysis && <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.6, padding: '8px 10px', background: 'var(--inset)', borderRadius: 8, marginBottom: 10 }}>{refAnalysis}</div>}
              {hasBrand && <BTg on={refOverride} onChange={setRefOverride} mood={mood}>Override reference colours with my brand colours</BTg>}
              {!window.canRun?.() && <div style={{ fontSize: 11.5, color: 'var(--text-5)', marginTop: 6 }}>Sign in or add a Claude API key in Settings to auto-detect style.</div>}
            </div>
          </div>
        )}
      </BB>

      {/* EXTRA DIRECTION */}
      <BB mood={mood} title="Extra direction" desc="Optional -- any vibe, constraint or detail you want included">
        <textarea className="ci-textarea" style={{ minHeight: 72 }} value={extraNote} onChange={e => setExtraNote(e.target.value)}
          placeholder='e.g. Dark dramatic lighting. Minimal background. Two hosts facing each other.' />
      </BB>

      <div style={{ marginTop: 6 }}>
        <window.GlowButton mood={mood} size="lg" onClick={() => { setGroundingFailed(false); buildPrompt(); }} style={{ width: '100%', opacity: building ? 0.7 : 1 }}>
          {building ? 'Art-directing your prompt…' : 'Build my prompt'}
        </window.GlowButton>
        {(window.canRun?.() && window.groundThumbPrompt) && !groundingFailed && <div style={{ fontSize: 11.5, color: 'var(--text-5)', marginTop: 6, textAlign: 'center' }}>Claude writes a research-grounded prompt (best-fit layout + colour scheme) before you generate.</div>}
        {groundingFailed && <div style={{ fontSize: 11.5, color: '#F0C85A', marginTop: 6, textAlign: 'center' }}>Grounding failed — using your raw brief (still works, but not research-enhanced). Try again if you have an API key.</div>}
      </div>

      {built && prompt && (
        <div id="builder-output" style={{ marginTop: 20 }}>

          {/* THREE UPGRADE TIERS (from the cloud check) -- basic / mild / full */}
          {upgrades.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-1)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>3 ways to upgrade it</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
                Pick a level — send to ChatGPT or Gemini{(window.getGoogleKey?.() || window.getOpenAIKey?.() || window.getProxyUrl?.()) ? ', or hit ⚡ Generate to create it here instantly' : ''}. {analyseImg ? 'Generation uses your uploaded thumbnail as a base.' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upgrades.map((u, i) => (
                  <BuilderUpgradeCard key={i} u={u} i={i} m={m} sourceImage={analyseImg} aspect={currentRatio.label} />
                ))}
              </div>
            </div>
          )}

          {/* Generate in ChatGPT or Gemini */}
          <div style={{ padding: '18px 18px', borderRadius: 14, background: `linear-gradient(135deg, ${m.orbB}24, var(--surface-1))`, border: `1.5px solid ${m.accentGlow}` }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-1)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>Generate it in ChatGPT or Gemini</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.55 }}>
              These edit your real face accurately. {(photoPeople.length > 0 || refImg) ? 'Copy each photo below, open a tool, paste the photo(s), then the prompt is already there.' : 'Open a tool -- the prompt is copied and pre-filled -- then press enter.'}
            </div>
            {(photoPeople.length > 0 || refImg) && (
              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 11, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>Copy images to clipboard -- one at a time:</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {people.map((person, i) => {
                    if (!person.photo) return null;
                    const isFail = copyFeedback === 'fail-' + i;
                    return (
                      <button key={i} className="ci-copybtn"
                        style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: isFail ? '#f5788c88' : undefined, color: isFail ? '#f5788c' : undefined }}
                        onClick={() => copyPhoto(person, i)}>
                        <img src={person.photo.preview} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                        {copyFeedback === 'ok-' + i ? 'Copied!' : isFail ? 'Failed' : `Copy person ${i + 1}`}
                      </button>
                    );
                  })}
                  {refImg && (
                    <button className="ci-copybtn"
                      style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={copyRefImgFn}>
                      <img src={refImg.preview} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                      {copyFeedback === 'ref-ok' ? 'Copied!' : copyFeedback === 'ref-fail' ? 'Failed' : 'Copy reference'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 4 }}>Your prompt (edit if needed):</div>
            <textarea className="ci-textarea" style={{ minHeight: 130, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}
              value={prompt} onChange={e => setPrompt(e.target.value)} />
            <GenerateHere prompt={prompt} sourceImage={analyseImg} m={m} aspect={currentRatio.label} />
            {(photoPeople.length > 0) && (window.getGoogleKey?.() || window.getOpenAIKey?.() || window.getProxyUrl?.()) && (
              <div style={{ fontSize: 11, color: 'var(--text-4)', margin: '-4px 0 12px', lineHeight: 1.5 }}>
                Tip: in-app generation won't lock in a real uploaded face — for accurate likeness, use ChatGPT or Gemini below with your photo attached.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OUTPUT_TOOLS.map(tool => (
                <div key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                  <span style={{ fontSize: 18 }}>{tool.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{tool.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{tool.note}</div>
                  </div>
                  <button className="ci-copybtn" style={{ height: 34, padding: '0 13px', background: `${m.accentFrom}18`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 600, fontSize: 12.5 }}
                    onClick={() => openIn(tool)}>Open</button>
                  <button className="ci-copybtn" style={{ height: 34, padding: '0 10px', fontSize: 12 }}
                    onClick={() => { window.copyText && window.copyText(prompt); }}>Copy</button>
                </div>
              ))}
            </div>
          </div>

          {onNav && (headline.trim() || txtTopic.trim()) && (
            <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: `${m.orbB || m.accentFrom}14`, border: `1px solid ${m.accentGlow}40` }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Need a script for this video?</div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 10 }}>Take this topic straight to the Script tab — starts in Create mode with the topic prefilled.</div>
              <button className="ci-copybtn" style={{ height: 36, padding: '0 16px', fontSize: 13, background: `${m.accentFrom}20`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700 }}
                onClick={() => {
                  const t = (headline.trim() || txtTopic.trim());
                  try { window.__ciScriptTopic = t; } catch (e) {}
                  onNav('script');
                }}>
                ✦ Write a script →
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
window.BuilderTab = BuilderTab;
