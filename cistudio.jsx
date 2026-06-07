// ContentIntel — Design Studio: generate professional social media designs.
// Claude acts as art director → crafts a precise prompt → sends to image generator.
// 10 style categories, 16 platform presets, reference image support.

const { MOODS: StM, Block: StB, WorkHead: StWH } = window;

// ── Platform presets (2025 standard dimensions) ───────────────────────────────
const STUDIO_PLATFORMS = [
  // Instagram — portrait 4:5 gets highest feed engagement
  { id: 'ig-post',     label: 'Instagram Post (square)',    w: 1080, h: 1080, cat: 'Instagram' },
  { id: 'ig-port',     label: 'Instagram Post (portrait)',  w: 1080, h: 1350, cat: 'Instagram' },
  { id: 'ig-story',    label: 'Instagram Story / Reel',     w: 1080, h: 1920, cat: 'Instagram' },
  { id: 'ig-carousel', label: 'Instagram Carousel Slide',   w: 1080, h: 1080, cat: 'Instagram' },
  { id: 'ig-land',     label: 'Instagram Landscape',        w: 1080, h: 566,  cat: 'Instagram' },
  // Facebook
  { id: 'fb-post',     label: 'Facebook Post',              w: 1200, h: 630,  cat: 'Facebook'  },
  { id: 'fb-cover',    label: 'Facebook Cover Photo',       w: 820,  h: 360,  cat: 'Facebook'  },
  // LinkedIn
  { id: 'li-post',     label: 'LinkedIn Post (landscape)',  w: 1200, h: 627,  cat: 'LinkedIn'  },
  { id: 'li-post-sq',  label: 'LinkedIn Post (square)',     w: 1200, h: 1200, cat: 'LinkedIn'  },
  { id: 'li-banner',   label: 'LinkedIn Profile Banner',    w: 1584, h: 396,  cat: 'LinkedIn'  },
  { id: 'li-ad',       label: 'LinkedIn Carousel Ad',       w: 1080, h: 1080, cat: 'LinkedIn'  },
  // Twitter / X
  { id: 'tw-post',     label: 'Twitter / X Post',          w: 1200, h: 675,  cat: 'Twitter/X' },
  { id: 'tw-header',   label: 'Twitter / X Header',        w: 1500, h: 500,  cat: 'Twitter/X' },
  // TikTok
  { id: 'tiktok',      label: 'TikTok Photo / Video',      w: 1080, h: 1920, cat: 'TikTok'    },
  // Pinterest
  { id: 'pin',         label: 'Pinterest Standard Pin',    w: 1000, h: 1500, cat: 'Pinterest' },
  // YouTube
  { id: 'yt-thumb',    label: 'YouTube Thumbnail',         w: 1280, h: 720,  cat: 'YouTube'   },
  { id: 'yt-banner',   label: 'YouTube Channel Banner',    w: 2560, h: 1440, cat: 'YouTube'   },
  // Email
  { id: 'email',       label: 'Email Header',              w: 1200, h: 400,  cat: 'Email'     },
  { id: 'newsletter',  label: 'Newsletter Hero',           w: 1200, h: 800,  cat: 'Email'     },
  // WhatsApp
  { id: 'wa-status',   label: 'WhatsApp Status',           w: 1080, h: 1920, cat: 'WhatsApp'  },
  // Custom
  { id: 'custom',      label: 'Custom size…',              w: null, h: null, cat: 'Custom'    },
];

// ── 10 design style categories ────────────────────────────────────────────────
const DESIGN_STYLES = [
  {
    id: 'editorial',
    label: 'Editorial Illustration',
    icon: '✏',
    desc: 'Magazine-quality ink art — New Yorker, Monocle, Bloomberg Businessweek',
  },
  {
    id: 'flat',
    label: 'Flat / Geometric',
    icon: '◼',
    desc: 'Bold 2D vector, limited palette, purposeful whitespace, no shadows',
  },
  {
    id: 'isometric',
    label: 'Isometric',
    icon: '⬡',
    desc: '3D axonometric grid — SaaS, tech, productivity aesthetic',
  },
  {
    id: '3d-render',
    label: '3D Render / CGI',
    icon: '◎',
    desc: 'Photorealistic studio render — glass, metal, clay, product viz',
  },
  {
    id: 'cartoon',
    label: 'Cartoonist / Character',
    icon: '☺',
    desc: 'Expressive characters, comic warmth, bold outlines, cel shading',
  },
  {
    id: 'brutalism',
    label: 'Brutalism',
    icon: '▬',
    desc: 'Raw type-first, thick borders, deconstructed grid, zine energy',
  },
  {
    id: 'swiss',
    label: 'Swiss / Grid Style',
    icon: '▦',
    desc: 'International Typographic Style — Helvetica, strict grid, modernist poster',
  },
  {
    id: 'glass',
    label: 'Glass / Bento UI',
    icon: '⬜',
    desc: 'Frosted glass panels, bento cards, dark-mode ambient glow',
  },
  {
    id: 'handdrawn',
    label: 'Hand-drawn / Organic',
    icon: '〰',
    desc: 'Sketch texture, watercolour wash, imperfect ink strokes, human warmth',
  },
  {
    id: 'luxury',
    label: 'Dark Luxury',
    icon: '◆',
    desc: 'Premium brand — near-black, gold type, editorial serif, moody light',
  },
];

// Image models shared with thumbnail tab (defined in ci-tabs.jsx, already in window scope)
const ST_IMG_MODELS = [
  { id: 'poll-flux',  label: 'Free · FLUX — no key needed',                  provider: 'pollinations', pmodel: 'flux'  },
  { id: 'poll-turbo', label: 'Free · Turbo — faster, no key',                provider: 'pollinations', pmodel: 'turbo' },
  { id: 'black-forest-labs/flux.2-klein-4b', label: 'FLUX klein-4B — NVIDIA (needs proxy)', provider: 'nvidia'       },
  { id: 'gemini-2.5-flash-image',            label: 'Gemini — edits YOUR image (Google key)', provider: 'gemini'     },
  { id: 'reve/create-image',                 label: 'Reve — image (Reve key)',                provider: 'reve'       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function stGcd(a, b) { return b === 0 ? a : stGcd(b, a % b); }
function stRatio(w, h) {
  if (!w || !h) return '';
  const g = stGcd(w, h);
  const rw = w / g, rh = h / g;
  // Simplify very large ratios to decimals
  if (rw > 20 || rh > 20) return (w / h).toFixed(2) + ':1';
  return rw + ':' + rh;
}

// Snap to nearest multiple of 64 for FLUX compatibility, min 256
function stFluxSize(w, h) {
  const snap = (n) => Math.max(256, Math.round(n / 64) * 64);
  return snap(w) + 'x' + snap(h);
}

function stFallbackPrompt(style, desc, w, h) {
  const kw = {
    editorial:  'editorial illustration, ink linework, Pantone spot colors, magazine print quality, New Yorker style, limited color palette',
    flat:       'flat vector design, geometric shapes, bold 2-color palette, negative space, Dribbble-quality, no gradients no shadows',
    isometric:  'isometric vector illustration, 30-degree axonometric projection, clean technical linework, muted palette with accent color',
    '3d-render':'3D render, studio HDRI lighting, physically-based materials, product visualization, Keyshot quality, crisp shadows',
    cartoon:    'character illustration, bold outlines, cel shading, flat color, expressive pose, warm palette, vector art, Procreate feel',
    brutalism:  'brutalist design, raw bold typography, thick black border, high contrast, deconstructed grid, zine aesthetic',
    swiss:      'Swiss International Style, Helvetica, strict column grid, modernist poster, generous whitespace, 2-color Pantone',
    glass:      'glassmorphism UI, frosted glass cards, dark navy background, bento grid, ambient gradient glow, Apple design system',
    handdrawn:  'hand-drawn ink illustration, watercolour wash, sketch texture, organic imperfect linework, warm cream paper background',
    luxury:     'dark luxury brand design, near-black background, gold foil typography, elegant Didot serif, editorial fashion aesthetic',
  }[style] || 'professional graphic design, clean layout, strong visual hierarchy';
  const orient = (w && h) ? (w > h ? 'horizontal landscape composition' : w < h ? 'vertical portrait composition' : 'square composition') : '';
  return [desc, kw, orient, 'no watermark, professional quality'].filter(Boolean).join(', ');
}

function buildStudioSystem(r, styleObj, styleGuide, w, h, platformLabel) {
  const orientation = !w || !h ? 'square' : w > h ? 'landscape / horizontal' : w < h ? 'portrait / vertical' : 'square';
  return [
    'You are a world-class art director and image-prompt engineer with 20 years at top design agencies (Pentagram, Collins, Wolff Olins). Your one job: transform a design brief into a single, precise image generation prompt that produces professional, non-AI-looking graphic design.',
    '',
    r.systemGuidance ? 'ART DIRECTION PRINCIPLES — UNIVERSAL:\n' + r.systemGuidance : '',
    '',
    styleGuide ? 'STYLE — ' + (styleObj ? styleObj.label.toUpperCase() : '') + ':\n' + styleGuide : '',
    '',
    'PLATFORM: ' + platformLabel + (w && h ? ' (' + w + '×' + h + 'px, ' + orientation + ')' : ''),
    '',
    'OUTPUT RULES (non-negotiable):',
    '1. Return ONLY the image generation prompt — no preamble, no explanation, no markdown, no quotes.',
    '2. Length: 200–500 characters. Specific > long.',
    '3. Structure: subject + composition → style vocabulary → color palette → quality/craft terms.',
    '4. NEVER use: stunning, beautiful, amazing, masterpiece, epic, cinematic (unless 3D film), aesthetic vibe, hyperrealistic.',
    '5. DO use: specific color references (Pantone 485C, #1A1A2E, warm ivory), named typefaces where relevant, professional craft terms (grid system, leading, Bézier, print-ready, CMYK).',
    '6. End with 2–3 quality anchors fitting the style (e.g. "vector Bézier precision, offset print quality" or "Keyshot studio render, product photography lighting").',
  ].filter(Boolean).join('\n');
}

// ── Image drop for reference upload ──────────────────────────────────────────
function StudioImageDrop({ image, onPick, onClear }) {
  const id = React.useRef('st-drop-' + Math.random().toString(36).slice(2, 7)).current;
  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const data = String(url).split(',')[1] || '';
      onPick({ mime: file.type || 'image/png', data, preview: url, name: file.name });
    };
    reader.readAsDataURL(file);
  }
  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor={id} className="ci-drop" style={{ minHeight: 100, flexDirection: 'column', gap: 6, overflow: 'hidden', padding: image ? 0 : 10, cursor: 'pointer' }}>
        <input id={id} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => readFile(e.target.files[0])} />
        {image
          ? <img src={image.preview} alt="reference" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 9 }} />
          : <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Drop a reference image (optional)</span>
            </>}
      </label>
      {image && (
        <button onClick={onClear} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      )}
    </div>
  );
}

// ── Style card grid ───────────────────────────────────────────────────────────
function StyleGrid({ value, onChange, accentFrom, accentGlow }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
      {DESIGN_STYLES.map(s => {
        const active = value === s.id;
        return (
          <button key={s.id} onClick={() => onChange(s.id)}
            style={{
              background: active ? `linear-gradient(135deg, ${accentFrom}26, ${accentFrom}0a)` : 'var(--surface-1)',
              border: active ? `1.5px solid ${accentFrom}99` : '1.5px solid var(--stroke-1)',
              borderRadius: 11, padding: '11px 8px 9px', cursor: 'pointer', textAlign: 'center',
              color: 'var(--text-1)', transition: 'border-color .12s, background .12s',
              boxShadow: active ? `0 0 10px ${accentGlow}` : 'none',
            }}>
            <div style={{ fontSize: 20, marginBottom: 5, lineHeight: 1 }}>{s.icon}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.25, marginBottom: 3, color: active ? accentFrom : 'var(--text-2)' }}>{s.label}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-4)', lineHeight: 1.35 }}>{s.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Platform picker ───────────────────────────────────────────────────────────
function PlatformPicker({ value, customW, customH, onPlatform, onCustomW, onCustomH }) {
  const cats = [...new Set(STUDIO_PLATFORMS.map(p => p.cat))];
  const plat = STUDIO_PLATFORMS.find(p => p.id === value) || STUDIO_PLATFORMS[0];
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <select className="ci-input" value={value} onChange={e => onPlatform(e.target.value)}
        style={{ appearance: 'auto', flex: '1 1 240px' }}>
        {cats.map(cat => (
          <optgroup key={cat} label={cat}>
            {STUDIO_PLATFORMS.filter(p => p.cat === cat).map(p => (
              <option key={p.id} value={p.id}>
                {p.label}{p.w ? ' — ' + p.w + '×' + p.h + 'px' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {value === 'custom' ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="ci-input" type="number" min="100" max="5000" value={customW}
            onChange={e => onCustomW(e.target.value)} placeholder="W" style={{ width: 80 }} />
          <span style={{ color: 'var(--text-4)', fontWeight: 600 }}>×</span>
          <input className="ci-input" type="number" min="100" max="5000" value={customH}
            onChange={e => onCustomH(e.target.value)} placeholder="H" style={{ width: 80 }} />
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>px</span>
        </div>
      ) : plat.w ? (
        <span style={{ fontSize: 12, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>
          {plat.w}×{plat.h}px · {stRatio(plat.w, plat.h)}
        </span>
      ) : null}
    </div>
  );
}

// ── Main StudioTab ────────────────────────────────────────────────────────────
function StudioTab({ onOpenKey }) {
  const mood = 'violet';
  const m = StM[mood];

  const [styleId, setStyleId]     = React.useState('editorial');
  const [platId, setPlatId]       = React.useState('ig-post');
  const [customW, setCustomW]     = React.useState('1080');
  const [customH, setCustomH]     = React.useState('1080');
  const [desc, setDesc]           = React.useState('');
  const [refImage, setRefImage]   = React.useState(null);
  const [genModelId, setGenModelId] = React.useState('poll-flux');

  const [phase, setPhase]             = React.useState('idle'); // idle | crafting | generating | done | error
  const [craftedPrompt, setCrafted]   = React.useState('');
  const [editedPrompt, setEdited]     = React.useState('');
  const [genOut, setGenOut]           = React.useState(null);
  const [genVia, setGenVia]           = React.useState('');
  const [errMsg, setErrMsg]           = React.useState('');

  const plat = STUDIO_PLATFORMS.find(p => p.id === platId) || STUDIO_PLATFORMS[0];
  const w = platId === 'custom' ? (parseInt(customW) || 1080) : plat.w;
  const h = platId === 'custom' ? (parseInt(customH) || 1080) : plat.h;
  const selStyle = DESIGN_STYLES.find(s => s.id === styleId) || DESIGN_STYLES[0];
  const hasKey = !!window.getKey();

  // ── Step 1: craft the prompt via Claude ──────────────────────────────────────
  async function craftPrompt(briefText) {
    if (hasKey) {
      const r = window.getResearch('studio') || {};
      const sGuide = (r.styles || {})[styleId] || '';
      const sys = buildStudioSystem(r, selStyle, sGuide, w, h, plat.label || platId);
      const userMsg = 'Design brief: ' + briefText.trim() +
        (refImage ? '\n(A reference image was uploaded — match its colour mood and subject; do not replicate it literally)' : '');
      const { text } = await window.callClaude({ system: sys, userText: userMsg, image: refImage || undefined, maxTokens: 550 });
      return (text || '').trim();
    }
    return stFallbackPrompt(styleId, briefText, w, h);
  }

  // ── One-click: craft → generate ─────────────────────────────────────────────
  async function handleGenerate() {
    if (!desc.trim() && !editedPrompt.trim()) return;
    setGenOut(null); setErrMsg('');

    let prompt = editedPrompt.trim();

    // Always re-craft when user has typed a description
    if (desc.trim()) {
      setPhase('crafting');
      try {
        prompt = await craftPrompt(desc);
        setCrafted(prompt);
        setEdited(prompt);
      } catch (e) {
        // Fall back silently — still generate with a basic prompt
        prompt = stFallbackPrompt(styleId, desc, w, h);
        setCrafted(prompt);
        setEdited(prompt);
      }
    }

    if (!prompt) { setPhase('idle'); return; }
    await doGenerate(prompt);
  }

  // Re-generate from the (possibly edited) crafted prompt
  async function reGenerate() {
    const p = editedPrompt || craftedPrompt;
    if (!p) return;
    await doGenerate(p);
  }

  async function doGenerate(p) {
    setPhase('generating'); setErrMsg('');
    const gm = ST_IMG_MODELS.find(x => x.id === genModelId) || ST_IMG_MODELS[0];
    try {
      let out, via;
      if (gm.provider === 'pollinations') {
        const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(p) +
          '?width=' + (w || 1080) + '&height=' + (h || 1080) +
          '&nologo=true&model=' + (gm.pmodel || 'flux') + '&seed=' + Math.floor(Math.random() * 1e6);
        await new Promise((res, rej) => {
          const im = new Image();
          im.onload = res;
          im.onerror = () => rej(new Error('Free generator did not respond — try again or pick another model.'));
          im.src = url;
        });
        out = url; via = 'Free · ' + (gm.pmodel || 'flux');
      } else if (gm.provider === 'nvidia') {
        out = await window.generateThumbnailFlux({ prompt: p, model: gm.id, size: stFluxSize(w || 1024, h || 1024) });
        via = 'NVIDIA FLUX';
      } else if (gm.provider === 'reve') {
        out = await window.generateThumbnailReve({ prompt: p, model: gm.id });
        via = 'Reve';
      } else if (gm.provider === 'gemini') {
        const instruction = refImage
          ? 'Edit the reference image to match this design direction. Maintain the subject but apply the style: ' + p
          : 'Create this design: ' + p;
        out = await window.generateThumbnail({ instruction, image: refImage });
        via = 'Google Gemini';
      }
      setGenOut(out); setGenVia(via); setPhase('done');
    } catch (e) {
      const em = String(e.message);
      const msg = (em === 'NO_GOOGLE_KEY' || em === 'NO_NV_KEY' || em === 'NO_REVE_KEY')
        ? 'Add the required API key in Settings (top-right) for this model.'
        : (e.message || 'Could not generate — try again.');
      setErrMsg(msg); setPhase('error');
    }
  }

  const busy = phase === 'crafting' || phase === 'generating';
  const btnLabel = phase === 'crafting' ? '✦ Art directing…' : phase === 'generating' ? '⟳ Generating…' : '✦ Generate design →';

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <StWH mood={mood}
        eyebrow="Design Studio"
        title="Generate a professional design"
        sub="Pick a style and platform, describe what you want — Claude acts as your art director and crafts a precise visual prompt before generating." />

      {/* ── Style picker ── */}
      <StB mood={mood}>
        <label className="ci-label" style={{ marginBottom: 10 }}>Design style</label>
        <StyleGrid value={styleId} onChange={id => { setStyleId(id); setCrafted(''); setEdited(''); setGenOut(null); }} accentFrom={m.accentFrom} accentGlow={m.accentGlow} />
      </StB>

      {/* ── Platform + size ── */}
      <StB mood={mood}>
        <label className="ci-label" style={{ marginBottom: 10 }}>Platform &amp; output size</label>
        <PlatformPicker value={platId} customW={customW} customH={customH}
          onPlatform={v => { setPlatId(v); setGenOut(null); }}
          onCustomW={setCustomW} onCustomH={setCustomH} />

        {/* Size reference table */}
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: 12, color: 'var(--text-4)', cursor: 'pointer', userSelect: 'none' }}>
            ▸ All platform sizes reference
          </summary>
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, color: 'var(--text-3)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--stroke-1)', color: 'var(--text-4)', textAlign: 'left' }}>
                  <th style={{ padding: '4px 10px 4px 0', fontWeight: 600 }}>Platform</th>
                  <th style={{ padding: '4px 10px', fontWeight: 600 }}>Format</th>
                  <th style={{ padding: '4px 10px', fontWeight: 600 }}>Pixels</th>
                  <th style={{ padding: '4px 0', fontWeight: 600 }}>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {STUDIO_PLATFORMS.filter(p => p.w).map(p => (
                  <tr key={p.id} onClick={() => setPlatId(p.id)}
                    style={{ borderBottom: '1px solid var(--stroke-1)', cursor: 'pointer', background: platId === p.id ? m.accentFrom + '14' : 'transparent' }}>
                    <td style={{ padding: '5px 10px 5px 0', color: 'var(--text-4)' }}>{p.cat}</td>
                    <td style={{ padding: '5px 10px', color: 'var(--text-2)' }}>{p.label}</td>
                    <td style={{ padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{p.w}×{p.h}</td>
                    <td style={{ padding: '5px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>{stRatio(p.w, p.h)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </StB>

      {/* ── Brief + reference ── */}
      <StB mood={mood}>
        <label className="ci-label">Describe your design</label>
        <textarea className="ci-textarea" style={{ minHeight: 100 }}
          value={desc} onChange={e => { setDesc(e.target.value); setCrafted(''); setEdited(''); }}
          placeholder="e.g. 'A launch announcement for my new SaaS product — dark theme, product screenshot mockup, headline: Launch Day is Here, primary color deep blue'" />

        <div style={{ marginTop: 14 }}>
          <label className="ci-label">Reference image <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>— optional, for mood / palette / subject inspiration</span></label>
          <StudioImageDrop image={refImage} onPick={setRefImage} onClear={() => setRefImage(null)} />
        </div>
      </StB>

      {/* ── Generator model + go ── */}
      <StB mood={mood}>
        <label className="ci-label">Image generator</label>
        <select className="ci-input" value={genModelId} onChange={e => setGenModelId(e.target.value)} style={{ appearance: 'auto', maxWidth: 400 }}>
          {ST_IMG_MODELS.map(mm => <option key={mm.id} value={mm.id}>{mm.label}</option>)}
        </select>
        {!hasKey && (
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 8, lineHeight: 1.5 }}>
            No API key — Claude art direction is skipped and a built-in style template is used instead. Add a key in{' '}
            <button onClick={onOpenKey} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 12 }}>Settings</button>
            {' '}for AI-crafted prompts.
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <window.GlowButton mood={mood} size="lg" onClick={handleGenerate} disabled={busy || (!desc.trim() && !editedPrompt.trim())}>
            {busy
              ? <><span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} className="spin" /> {btnLabel}</>
              : btnLabel}
          </window.GlowButton>
        </div>
        {errMsg && <div style={{ fontSize: 13, color: '#f5788c', marginTop: 10, lineHeight: 1.5 }}>{errMsg}</div>}
      </StB>

      {/* ── Crafted prompt (editable) ── */}
      {craftedPrompt && (
        <StB mood={mood}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
            <div>
              <label className="ci-label" style={{ margin: 0 }}>Art-director prompt</label>
              <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>Edit below, then re-generate — or copy it into any image tool</div>
            </div>
            <button className="ci-copybtn" style={{ flexShrink: 0 }} onClick={() => window.copyText && window.copyText(editedPrompt || craftedPrompt)}>⧉ Copy</button>
          </div>
          <textarea className="ci-textarea"
            style={{ minHeight: 90, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', lineHeight: 1.6 }}
            value={editedPrompt} onChange={e => setEdited(e.target.value)} />
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <window.GlowButton mood={mood} size="md" onClick={reGenerate} disabled={phase === 'generating'}>
              {phase === 'generating'
                ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} className="spin" /> Generating…</>
                : '⟳ Re-generate →'}
            </window.GlowButton>
            <button className="ci-copybtn" style={{ height: 38, padding: '0 14px' }}
              onClick={() => window.open('https://chatgpt.com/?q=' + encodeURIComponent((editedPrompt || craftedPrompt).slice(0, 6000)), '_blank', 'noopener,noreferrer')}>
              Open in ChatGPT →
            </button>
          </div>
        </StB>
      )}

      {/* ── Generated result ── */}
      {genOut && phase === 'done' && (
        <StB mood={mood}>
          {genVia && (
            <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 8 }}>
              Generated with {genVia} · {w}×{h}px · {stRatio(w, h)}
            </div>
          )}
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <img src={genOut} alt="generated design"
              style={{ width: '100%', maxWidth: Math.min(w, 640), aspectRatio: w + '/' + h, borderRadius: 12, display: 'block', border: '1px solid var(--stroke-2)', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <a className="ci-copybtn" href={genOut} download={'design-' + styleId + '-' + platId + '.png'}
              style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 14px', textDecoration: 'none' }}>
              ↓ Download
            </a>
            <button className="ci-copybtn" style={{ height: 34, padding: '0 14px' }}
              onClick={() => { setGenOut(null); setEdited(craftedPrompt); }}>
              ↺ Try again
            </button>
          </div>
        </StB>
      )}
    </div>
  );
}

window.StudioTab = StudioTab;
