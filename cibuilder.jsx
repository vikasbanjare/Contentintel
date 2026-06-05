// ContentIntel — Thumbnail Prompt Studio
// Structured form → professional image-generation brief for ChatGPT / Midjourney / Ideogram

const {
  MOODS: BM, Block: BB, ChipGroup: BCG, Toggle: BTg,
  WorkHead: BWH, LoadingResults: BLR,
} = window;

const BUILDER_EXPRESSIONS = [
  { id: 'excited',  label: 'Excited',     emoji: '😄' },
  { id: 'shocked',  label: 'Shocked',     emoji: '😮' },
  { id: 'serious',  label: 'Serious',     emoji: '😐' },
  { id: 'pointing', label: 'Pointing',    emoji: '👉' },
  { id: 'laughing', label: 'Laughing',    emoji: '😂' },
  { id: 'love',     label: 'Love / Warm', emoji: '❤️' },
  { id: 'none',     label: 'Do nothing',  emoji: '—'  },
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

const BUILDER_FORMATS = [
  { id: 'youtube',  label: 'YouTube',        ratio: '16:9', dim: '1280 × 720' },
  { id: 'podcast',  label: 'Podcast Cover',  ratio: '1:1',  dim: '3000 × 3000' },
  { id: 'reels',    label: 'Reels / Shorts', ratio: '9:16', dim: '1080 × 1920' },
  { id: 'post',     label: 'Post',           ratio: '4:5',  dim: '1080 × 1350' },
];

const OUTPUT_TOOLS = [
  { id: 'chatgpt',    label: 'ChatGPT',    icon: '💬', url: 'https://chatgpt.com/', useQ: true,  note: 'Prompt pre-filled · paste your photos with Ctrl+V / Cmd+V' },
  { id: 'midjourney', label: 'Midjourney', icon: '🖼', url: 'https://www.midjourney.com/imagine', useQ: false, note: 'Prompt copied · paste into /imagine box · best photorealism' },
  { id: 'ideogram',   label: 'Ideogram',   icon: '✏️', url: 'https://ideogram.ai/t/explore',   useQ: false, note: 'Free · excellent for text in images · paste into prompt box' },
];

const FORMAT_DIMS = {
  youtube: { w: 1280, h: 720 },
  podcast: { w: 1000, h: 1000 },
  reels:   { w: 720,  h: 1280 },
  post:    { w: 1000, h: 1250 },
};

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
  const blob = await (await fetch(dataUrl)).blob();
  await navigator.clipboard.write([new ClipboardItem({ [mime || 'image/png']: blob })]);
}

// ── BuilderTab ────────────────────────────────────────────────────────────────
function BuilderTab() {
  const mood = 'lime';
  const m = BM[mood];

  const [format, setFormat] = React.useState('youtube');
  const fmt = BUILDER_FORMATS.find(f => f.id === format) || BUILDER_FORMATS[0];

  // Photos — up to 10, each with an expression
  const [photos, setPhotos] = React.useState([]);
  function addPhotos(files) {
    const slots = Math.min(files.length, 10 - photos.length);
    for (let i = 0; i < slots; i++) {
      bReadImage(files[i], img => setPhotos(ps => [...ps, { ...img, expression: 'excited' }]));
    }
  }
  function setExpr(i, v) { setPhotos(ps => ps.map((p, j) => j === i ? { ...p, expression: v } : p)); }
  function removePhoto(i) { setPhotos(ps => ps.filter((_, j) => j !== i)); }

  // Text
  const [headline, setHeadline] = React.useState('');
  const [subline, setSubline] = React.useState('');

  // Elements
  const [elements, setElements] = React.useState([]);
  const toggleEl = el => setElements(es => es.includes(el) ? es.filter(x => x !== el) : [...es, el]);

  // Reference image
  const [refImg, setRefImg] = React.useState(null);
  const [refOverride, setRefOverride] = React.useState(false);
  const [refState, setRefState] = React.useState('idle'); // idle | loading | done | error
  const [refAnalysis, setRefAnalysis] = React.useState('');

  // Extra note
  const [extraNote, setExtraNote] = React.useState('');

  // Brand
  const [brand] = React.useState(bLoadBrand);
  const brandColors = (brand.colors || []).filter(Boolean);
  const hasBrand = brandColors.length > 0 || !!brand.note;

  // Output
  const [prompt, setPrompt] = React.useState('');
  const [built, setBuilt] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState('');
  // Free in-app generation via Pollinations (no key needed)
  const [genState, setGenState] = React.useState('idle'); // idle | loading | done | error
  const [genUrl, setGenUrl] = React.useState('');
  const [genErr, setGenErr] = React.useState('');

  // ── Analyse reference with Claude vision ─────────────────────────────────
  async function analyzeRef() {
    const key = window.getKey ? window.getKey() : null;
    if (!key || !refImg) return;
    setRefState('loading');
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: window.getModel ? window.getModel() : 'claude-opus-4-8',
          max_tokens: 350,
          system: 'Extract visual design properties from thumbnail images. Return ONLY a JSON object.',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: refImg.mime, data: refImg.data } },
              { type: 'text', text: 'Analyse this thumbnail. Return JSON: { "layout": "composition description", "colors": "dominant colors & treatment", "textStyle": "how text is styled", "mood": "energy and mood", "keyElements": "notable design details" }' },
            ],
          }],
        }),
      });
      const data = await resp.json();
      const raw = (data.content?.[0]?.text || '').trim();
      const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0];
      const parsed = jsonStr ? JSON.parse(jsonStr) : null;
      if (parsed) setRefAnalysis(Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n'));
      setRefState('done');
    } catch (e) { setRefState('error'); }
  }

  // ── Build the prompt from all form inputs ─────────────────────────────────
  function buildPrompt() {
    const lines = [];
    lines.push(`Create a ${fmt.label} thumbnail (${fmt.ratio} format, ${fmt.dim}).`);
    lines.push('');

    if (photos.length > 0) {
      lines.push(`PEOPLE: ${photos.length} person${photos.length > 1 ? 's' : ''}.`);
      photos.forEach((p, i) => {
        const ex = BUILDER_EXPRESSIONS.find(e => e.id === p.expression);
        const exText = ex && ex.id !== 'none' ? `expression: ${ex.label}` : 'natural expression, no specific direction';
        lines.push(`- Person ${i + 1} (see attached photo ${i + 1}) — ${exText}.`);
      });
      lines.push('');
    }

    if (headline.trim() || subline.trim()) {
      lines.push('TEXT ON THUMBNAIL:');
      if (headline.trim()) lines.push(`- Main headline: "${headline.trim()}" — large, bold, dominant.`);
      if (subline.trim()) lines.push(`- Sub-text: "${subline.trim()}" — smaller, secondary.`);
      lines.push('');
    }

    if (elements.length > 0) {
      lines.push(`VISUAL ELEMENTS: ${elements.join('. ')}.`);
      lines.push('');
    }

    if (hasBrand && (refOverride || !refImg)) {
      const cp = [
        brandColors.length ? `Palette: ${brandColors.join(', ')}.` : '',
        brand.note ? `Brand note: ${brand.note}.` : '',
      ].filter(Boolean).join(' ');
      lines.push(`COLOUR: ${cp} Use these as the dominant colour treatment — background, accents, text highlights.`);
      lines.push('');
    }

    if (refImg) {
      if (refAnalysis) {
        const analysisLines = refOverride && hasBrand
          ? refAnalysis.split('\n').filter(l => !l.startsWith('colors')).join('\n')
          : refAnalysis;
        lines.push(`STYLE REFERENCE (see attached reference image — match its visual DNA):`);
        lines.push(analysisLines);
        if (refOverride && hasBrand) lines.push('Apply the brand colours above instead of the reference colours.');
      } else {
        lines.push(`STYLE: Match the layout, composition and energy of the attached reference image.${refOverride && hasBrand ? ' Use brand colours above instead of the reference colours.' : ''}`);
      }
      lines.push('');
    }

    if (extraNote.trim()) {
      lines.push(`ADDITIONAL DIRECTION: ${extraNote.trim()}`);
      lines.push('');
    }

    lines.push('Make it bold, high-contrast, and impossible to ignore at small thumbnail size. Professional photography and design quality.');

    const p = lines.join('\n');
    setPrompt(p);
    setBuilt(true);
    setGenState('idle'); setGenUrl(''); setGenErr('');
    setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  // ── Free in-app generation (Pollinations, no key needed) ──────────────────
  function runGenerate() {
    setGenState('loading'); setGenUrl(''); setGenErr('');
    const dims = FORMAT_DIMS[format] || FORMAT_DIMS.youtube;
    const seed = Math.floor(Math.random() * 1e6);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${dims.w}&height=${dims.h}&model=flux&nologo=true&seed=${seed}`;
    const img = new Image();
    img.onload = () => { setGenUrl(url); setGenState('done'); };
    img.onerror = () => { setGenErr('Generation failed — try again or use a different model below.'); setGenState('error'); };
    img.src = url;
  }

  // ── Open in tool ──────────────────────────────────────────────────────────
  async function openIn(tool) {
    if (photos.length > 0) {
      try { await bCopyImageToClipboard(photos[0].preview, photos[0].mime); } catch (e) {
        try { window.copyText && window.copyText(prompt); } catch (e2) {}
      }
    } else {
      try { window.copyText && window.copyText(prompt); } catch (e) {}
    }
    if (tool.useQ) {
      window.open(tool.url + '?q=' + encodeURIComponent(prompt.slice(0, 6000)), '_blank', 'noopener,noreferrer');
    } else {
      try { window.copyText && window.copyText(prompt); } catch (e) {}
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  }

  async function copyPhoto(p, idx) {
    try {
      await bCopyImageToClipboard(p.preview, p.mime);
      setCopyFeedback('photo-' + idx);
    } catch (e) { setCopyFeedback('photo-fail-' + idx); }
    setTimeout(() => setCopyFeedback(''), 1800);
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <BWH mood={mood} eyebrow="Prompt Studio" title="Build your thumbnail prompt"
        sub="Fill in the form — we'll write a professional image brief you can send to ChatGPT, Midjourney or Ideogram. No prompt-writing skills needed." />

      {/* FORMAT */}
      <BB mood={mood}>
        <BCG label="Format" options={BUILDER_FORMATS.map(f => f.label)} value={fmt.label}
          onChange={v => setFormat(BUILDER_FORMATS.find(f => f.label === v)?.id || 'youtube')} />
        <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-5)' }}>{fmt.ratio} · {fmt.dim}</div>
      </BB>

      {/* PHOTOS */}
      <BB mood={mood} title="People" desc="Upload up to 10 photos — one per person. Pick an expression for each.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {photos.map((p, i) => (
            <div key={i}>
              <div style={{ position: 'relative' }}>
                <img src={p.preview} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 10, display: 'block', border: '1px solid var(--stroke-1)' }} />
                <button onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, cursor: 'pointer', lineHeight: '20px', textAlign: 'center' }}>✕</button>
                <div style={{ position: 'absolute', bottom: 5, left: 5, fontSize: 10, fontWeight: 700, color: m.accentFrom, background: 'rgba(0,0,0,0.65)', padding: '2px 6px', borderRadius: 4 }}>Person {i + 1}</div>
              </div>
              <select className="ci-input" style={{ marginTop: 5, fontSize: 11.5, height: 28, padding: '0 6px', appearance: 'auto', width: '100%' }}
                value={p.expression} onChange={e => setExpr(i, e.target.value)}>
                {BUILDER_EXPRESSIONS.map(ex => <option key={ex.id} value={ex.id}>{ex.emoji} {ex.label}</option>)}
              </select>
            </div>
          ))}
          {photos.length < 10 && (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1', borderRadius: 10, border: '1.5px dashed var(--stroke-2)', cursor: 'pointer', color: 'var(--text-4)', fontSize: 12, gap: 7, background: 'rgba(255,255,255,0.02)' }}>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => addPhotos([...e.target.files])} />
              <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
              <span>Add photo</span>
            </label>
          )}
        </div>
        {photos.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-5)', marginTop: 8 }}>No photos added — generate without people, or describe them in the notes below.</div>
        )}
      </BB>

      {/* TEXT */}
      <BB mood={mood} title="Text on thumbnail" desc="Optional — leave blank to skip">
        <input className="ci-input" value={headline} onChange={e => setHeadline(e.target.value)}
          placeholder='Main headline — e.g. "I QUIT MY JOB"' />
        <input className="ci-input" style={{ marginTop: 8 }} value={subline} onChange={e => setSubline(e.target.value)}
          placeholder='Sub-text — e.g. Here&apos;s what happened next' />
      </BB>

      {/* ELEMENTS */}
      <BB mood={mood} title="Visual elements" desc="Pick what you want in the thumbnail">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BUILDER_ELEMENTS.map(el => {
            const on = elements.includes(el);
            return (
              <button key={el} className="pill" onClick={() => toggleEl(el)}
                style={{ height: 32, borderColor: on ? m.accentGlow : 'var(--stroke-1)', color: on ? m.accentFrom : 'var(--text-3)', background: on ? `${m.accentFrom}1a` : 'transparent' }}>
                {on ? '✓ ' : '+ '}{el}
              </button>
            );
          })}
        </div>
      </BB>

      {/* REFERENCE IMAGE */}
      <BB mood={mood} title="Reference image" desc="Optional — upload a thumbnail whose style you want to match">
        {!refImg ? (
          <label className="ci-drop" style={{ minHeight: 90, flexDirection: 'column', gap: 6, cursor: 'pointer', padding: 14 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { bReadImage(e.target.files[0], img => { setRefImg(img); setRefAnalysis(''); setRefState('idle'); }); }} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
            <span style={{ fontSize: 13 }}>Drop a reference thumbnail</span>
          </label>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={refImg.preview} alt="" style={{ width: 140, borderRadius: 9, border: '1px solid var(--stroke-1)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <button className="ci-copybtn" style={{ height: 28, fontSize: 11.5 }}
                  onClick={() => { setRefImg(null); setRefAnalysis(''); setRefState('idle'); }}>✕ Remove</button>
                {window.getKey && window.getKey() && refState === 'idle' && (
                  <button className="ci-copybtn" style={{ height: 28, fontSize: 11.5 }} onClick={analyzeRef}>🔍 Detect style</button>
                )}
                {refState === 'loading' && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Detecting…</span>}
                {refState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A' }}>✓ Style detected</span>}
                {refState === 'error' && <span style={{ fontSize: 12, color: '#f5788c' }}>Detection failed</span>}
              </div>
              {refAnalysis && (
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.6, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 10 }}>
                  {refAnalysis}
                </div>
              )}
              {hasBrand && (
                <BTg on={refOverride} onChange={setRefOverride} mood={mood}>Override reference colours with my brand colours</BTg>
              )}
              {!window.getKey?.() && (
                <div style={{ fontSize: 11.5, color: 'var(--text-5)', marginTop: 6 }}>Add a Claude API key in Settings to auto-detect the reference style.</div>
              )}
            </div>
          </div>
        )}
      </BB>

      {/* EXTRA NOTE */}
      <BB mood={mood} title="Extra direction" desc="Optional — any vibe, constraint or detail you want included">
        <textarea className="ci-textarea" style={{ minHeight: 72 }} value={extraNote} onChange={e => setExtraNote(e.target.value)}
          placeholder='e.g. "Dark, dramatic lighting. Minimal background. Premium finance feel." or "Two hosts facing each other, channel name top-left."' />
      </BB>

      {/* BUILD BUTTON */}
      <div style={{ marginTop: 6 }}>
        <window.GlowButton mood={mood} size="lg" onClick={buildPrompt} style={{ width: '100%' }}>
          ✨ Build my prompt
        </window.GlowButton>
      </div>

      {/* ── OUTPUT ── */}
      {built && prompt && (
        <div id="builder-output" style={{ marginTop: 20 }}>

          {/* ── SECTION 1: Free in-app generation ── */}
          <div style={{ padding: '20px 18px', borderRadius: 16, background: `linear-gradient(135deg, ${m.orbB}30, var(--surface-1))`, border: `1.5px solid ${m.accentGlow}`, boxShadow: `0 0 32px ${m.accentGlow}22`, marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 4 }}>
              ⚡ Generate now — free, no key needed
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>
              Runs FLUX right here in the app. No account, no cost. Result appears below — download it or regenerate.
              {photos.length > 0 && <span style={{ color: 'var(--text-4)' }}> Note: photos can't be sent to free generation — use ChatGPT below for photo-based edits.</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <window.GlowButton mood={mood} size="lg" onClick={runGenerate} style={{ opacity: genState === 'loading' ? 0.7 : 1 }}>
                {genState === 'loading' ? '⏳ Generating…' : genState === 'done' ? '↺ Regenerate' : '⚡ Generate now'}
              </window.GlowButton>
              {genState === 'loading' && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Takes ~10–20 seconds…</span>}
            </div>
            {genState === 'error' && <div style={{ marginTop: 10, fontSize: 13, color: '#f5788c' }}>{genErr}</div>}
            {genState === 'done' && genUrl && (
              <div style={{ marginTop: 14 }}>
                <img src={genUrl} alt="Generated thumbnail" style={{ width: '100%', maxWidth: 560, borderRadius: 12, display: 'block', border: '1px solid var(--stroke-1)' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <a className="ci-copybtn" href={genUrl} download="thumbnail.png" target="_blank" rel="noopener noreferrer"
                    style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 14px', textDecoration: 'none', fontSize: 12.5 }}>↓ Download</a>
                  <button className="ci-copybtn" style={{ height: 34, fontSize: 12.5 }} onClick={runGenerate}>↺ Try again</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-5)' }}>Not happy? Adjust the form above, rebuild the prompt, and regenerate — or use ChatGPT below for photo-accurate results.</div>
              </div>
            )}
          </div>

          {/* ── SECTION 2: Send to ChatGPT / other tools ── */}
          <div style={{ padding: '18px 18px', borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 4 }}>💬 Or use your own AI tools</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.55 }}>
              For photo-based results (editing your actual face / real photos), send to ChatGPT — it can see the images you paste.
              Copy your photos below, open ChatGPT, paste them, then paste the prompt and press Enter.
            </div>

            {/* Step-by-step photo copy */}
            {(photos.length > 0 || refImg) && (
              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 11, background: 'rgba(0,0,0,0.22)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>Step 1 — Copy your images (one at a time):</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {photos.map((ph, i) => {
                    const fb = copyFeedback === 'photo-' + i;
                    return (
                      <button key={i} className="ci-copybtn" style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => copyPhoto(ph, i)}>
                        <img src={ph.preview} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                        {fb ? '✓ Copied!' : `Copy photo ${i + 1}`}
                      </button>
                    );
                  })}
                  {refImg && (
                    <button className="ci-copybtn" style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={async () => { try { await bCopyImageToClipboard(refImg.preview, refImg.mime); setCopyFeedback('ref'); setTimeout(() => setCopyFeedback(''), 1800); } catch (e) {} }}>
                      <img src={refImg.preview} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                      {copyFeedback === 'ref' ? '✓ Copied!' : 'Copy reference'}
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-5)', lineHeight: 1.5 }}>
                  Step 2 — Click a tool below → paste images (Ctrl+V / Cmd+V) → paste the prompt → press Enter.
                </div>
              </div>
            )}

            {/* Editable prompt */}
            <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 4 }}>Prompt (edit if needed):</div>
            <textarea className="ci-textarea"
              style={{ minHeight: 130, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}
              value={prompt} onChange={e => setPrompt(e.target.value)} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OUTPUT_TOOLS.map(tool => (
                <div key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, background: 'rgba(0,0,0,0.18)', border: '1px solid var(--stroke-1)' }}>
                  <span style={{ fontSize: 18 }}>{tool.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{tool.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{tool.note}</div>
                  </div>
                  <button className="ci-copybtn"
                    style={{ height: 34, padding: '0 13px', background: `${m.accentFrom}18`, borderColor: `${m.accentGlow}`, color: m.accentFrom, fontWeight: 600, fontSize: 12.5 }}
                    onClick={() => openIn(tool)}>Open →</button>
                  <button className="ci-copybtn" style={{ height: 34, padding: '0 10px', fontSize: 12 }}
                    onClick={() => { window.copyText && window.copyText(prompt); }}>⧉</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.BuilderTab = BuilderTab;
