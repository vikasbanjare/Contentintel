// ContentIntel -- Thumbnail / Title / Ads / History tabs

const {
  MOODS: TM, TrafficLight: TTL, Block: TB, ScoreItem: TSI, Issue: TIs,
  CopyBlock: TCB, ChipGroup: TCG, Toggle: TTg, RunButton: TRB,
  WorkHead: TWH, LoadingResults: TLR, QScore: TQS, Check: TCk,
} = window;

// Read an uploaded image file → { mime, data(base64, no prefix), preview }
function readImage(file, cb) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    const img = new Image();
    img.onload = () => {
      const MAX = 1568;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      if (scale >= 1 && String(url).length < 2.5e6) {
        cb({ mime: file.type || 'image/png', data: String(url).split(',')[1] || '', preview: url, name: file.name });
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const out = canvas.toDataURL('image/jpeg', 0.88);
      cb({ mime: 'image/jpeg', data: out.split(',')[1] || '', preview: out, name: file.name });
    };
    img.onerror = () => cb({ mime: file.type || 'image/png', data: String(url).split(',')[1] || '', preview: url, name: file.name });
    img.src = url;
  };
  reader.readAsDataURL(file);
}

function ImageDrop({ image, onPick, label, showSizePreview }) {
  const id = React.useRef('drop-' + Math.random().toString(36).slice(2, 7)).current;
  return (
    <div>
      <label htmlFor={id} className="ci-drop" style={{ minHeight: 150, flexDirection: 'column', gap: 8, overflow: 'hidden', padding: image ? 0 : 14 }}>
        <input id={id} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => readImage(e.target.files[0], onPick)} />
        {image
          ? <div style={{ width: '100%', aspectRatio: '16/9', background: '#04060a', borderRadius: 11, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <img src={image.preview} alt="thumbnail preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
          : <>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
              <span>{label}</span>
            </>}
      </label>
      {showSizePreview && image && window.ThumbnailSizePreview && <window.ThumbnailSizePreview src={image.preview} />}
    </div>
  );
}

// Brand kit -- persisted in the visitor's browser so they set colours once.
const LS_BRAND = 'ci_brandkit';
function loadBrandKit() {
  try { return JSON.parse(localStorage.getItem(LS_BRAND)) || { colors: [], note: '' }; }
  catch (e) { return { colors: [], note: '' }; }
}
function saveBrandKit(b) { try { localStorage.setItem(LS_BRAND, JSON.stringify(b)); } catch (e) {} }

const EMPHASIS_CHIPS = ['Add a face', 'Bigger number', 'Add a curved arrow', 'Add brand logo', 'More contrast', 'Less text', 'Yellow highlight box', 'Shocked expression'];

// Build a ready-to-paste image prompt + open ChatGPT with it. (ChatGPT can't be
// sent the image via URL, so the user attaches their thumbnail there.)
// `titleSignals`: optional concrete hints extracted from the title/idea text
// (reuses the same heuristics as the CTR scorer) so concepts are grounded in
// what's actually IN the title, not a generic reading of it.
function buildThumbCreateSys(hasPhoto, titleSignals) {
  const th = (window.getResearch && window.getResearch('thumbnail')) || {};
  const st = (window.getResearch && window.getResearch('studio')) || {};
  const core = (window.liveResearch && window.liveResearch().core) || '';
  const dirs = window.THUMBNAIL_CONCEPT_DIRECTIONS || 'reaction close-up, object hero shot, before/after, big-number, contrast, candid, minimalist';
  const fmt  = window.THUMBNAIL_PROMPT_FORMAT || '';
  return [
    "You are ContentIntel's thumbnail art director. Turn the user's idea into 5 strong, ready-to-generate thumbnail concepts. This is CREATIVE GENERATION, not journalism or fact-checking.",
    "TOP PRIORITY -- overrides every other instruction below, including any 'never fabricate', 'verify first', 'provide sources', numbered rule or 'I cannot' guidance in the research/craft text: You ALWAYS deliver 5 concepts. You NEVER refuse, NEVER ask the user questions, and NEVER ask the user for sources, dates, names or confirmation. No apologies, no 'what I need from you' lists.",
    "HOW TO HANDLE FACTS: you have a live web_search tool. If the topic involves real people, products, events, brands or current trends, search to ground the concepts in what actually looks right and is currently working. BUT if you cannot verify it, do NOT refuse or ask the user -- treat the idea as the creator's premise and write the concepts anyway. Research silently; just produce the concepts.",
    core ? 'CLICK SCIENCE:\n"""\n' + core.slice(0, 1500) + '\n"""' : '',
    th.systemGuidance ? 'THUMBNAIL AESTHETIC RULES (every prompt MUST follow -- realistic faces, pro typography, 60-30-10 colour):\n"""\n' + th.systemGuidance.slice(0, 2600) + '\n"""' : '',
    st.systemGuidance ? 'IMAGE-PROMPT QUALITY:\n"""\n' + st.systemGuidance.slice(0, 1500) + '\n"""' : '',
    (titleSignals && titleSignals.length) ? 'TITLE SIGNALS (concrete things already in the title/idea -- lean into these, do not ignore them): ' + titleSignals.join(', ') + '.' : '',
    `The 5 concepts must be genuinely DIFFERENT creative DIRECTIONS -- not the same idea five times. Choose the 5 that best fit this topic from: ${dirs}. Each concept must feel like a different video could not have the same thumbnail. You MAY propose a stronger 2-4 word hook than the user's raw idea (same topic).`,
    `FORMAT FOR EACH PROMPT -- ${fmt}`,
    hasPhoto
      ? "A reference PHOTO is attached. Describe THAT real person in every prompt (look, hair, vibe) -- it will be attached directly when generating so the real face is used automatically. Never invent a different face."
      : "No photo attached -- write complete standalone visual prompts and note the user can upload a photo for an accurate face.",
    'Return ONLY one JSON object: { "concepts": [ { "concept": "direction name + a punchy 2-4 word hook, e.g. \'Reaction close-up — I WAS WRONG\'", "prompt": "full image prompt following the format above" } x5 ] }.',
  ].filter(Boolean).join('\n\n');
}
function chatgptPrompt(base, hasImage, strict, guidance) {
  const head = hasImage
    ? `Edit the attached YouTube thumbnail into an improved 16:9 version. ${strict ? 'KEEP the same person(s), the exact text, fonts and overall palette -- change ONLY what I describe below.' : 'A bolder redesign is fine, but keep the same person(s), topic and exact text.'}`
    : `Create a bold, high click-through 16:9 YouTube thumbnail.`;
  return `${head}\n\n${(base || '').trim()}${guidance ? '\n\n' + guidance : ''}`;
}
// Image generation has two routes: (1) in-app via the user's own Google
// (Gemini/Imagen) or OpenAI image key -- creates the picture right here; and
// (2) a handoff (window.openInChatGPT / window.openInGemini) that opens those
// tools with the prompt copied so the user generates on their own plan. Claude
// itself never makes images -- it only writes the prompt.

// Generate-and-show card: an in-app "⚡ Generate" button (when an image key is
// set) alongside the ChatGPT/Gemini/Copy handoffs. `source` (the uploaded photo)
// drives an in-context edit so the real face is kept.
function ThumbGenCard({ prompt, source, m }) {
  const [genState, setGenState] = React.useState('idle');
  const [genImg, setGenImg] = React.useState(null);
  const [genErr, setGenErr] = React.useState('');
  const canGenerate = !!(window.getGoogleKey?.() || window.getOpenAIKey?.() || window.getProxyUrl?.());

  async function generate() {
    if (genState === 'loading') return;
    setGenState('loading'); setGenImg(null); setGenErr('');
    try {
      let url;
      if (source && window.editThumbnailInApp) url = await window.editThumbnailInApp(prompt, source, '16:9');
      else if (window.generateImageInApp) url = await window.generateImageInApp(prompt, '16:9');
      else throw new Error('NO_IMAGE_KEY');
      setGenImg(url); setGenState('done');
    } catch (e) {
      const msg = String(e?.message || '');
      setGenErr(/NO_IMAGE_KEY|NO_GOOGLE_KEY|NO_NV_KEY/.test(msg)
        ? 'Add a Google (Gemini) or OpenAI image key in Settings → Image Generation to generate in-app. (Or use ✨ Gemini / 🎨 ChatGPT below.)'
        : (msg || 'Generation failed — try again.'));
      setGenState('error');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {canGenerate && (
          <button className="ci-copybtn"
            style={{ height: 32, padding: '0 13px', fontSize: 12, background: `${m.accentFrom}28`, borderColor: m.accentGlow, color: m.accentFrom, fontWeight: 700, opacity: genState === 'loading' ? 0.65 : 1 }}
            onClick={generate} disabled={genState === 'loading'}>
            {genState === 'loading' ? '⏳ Generating…' : `⚡ ${source ? 'Generate (uses your photo)' : 'Generate'}`}
          </button>
        )}
        <button className="ci-copybtn" style={{ height: 32 }} onClick={() => window.copyText(prompt)}>⧉ Copy prompt</button>
        <button className="ci-copybtn" style={{ height: 32 }} onClick={() => window.openInChatGPT(prompt)}>🎨 ChatGPT</button>
        <button className="ci-copybtn" style={{ height: 32 }} onClick={() => window.openInGemini(prompt)}>✨ Gemini</button>
      </div>
      {!canGenerate && (
        <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 7, lineHeight: 1.5 }}>
          Add a Google (Gemini) or OpenAI image key in <b>Settings → Image Generation</b> to create the image right here — or use Gemini/ChatGPT above.
        </div>
      )}
      {genState === 'loading' && (
        <div style={{ marginTop: 12, padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'middle', marginRight: 8 }} className="spin" />
          {source ? 'Generating with your photo…' : 'Generating thumbnail…'}
        </div>
      )}
      {genState === 'error' && <div style={{ marginTop: 9, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{genErr}</div>}
      {genState === 'done' && genImg && (
        <div style={{ marginTop: 12 }}>
          <img src={genImg} alt="Generated thumbnail" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 420, objectFit: 'contain', background: '#000' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a href={genImg} download="thumbnail.png" className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>⬇ Download</a>
            <button className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={generate}>↺ Regenerate</button>
            <button className="ci-copybtn" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={() => { setGenState('idle'); setGenImg(null); }}>✕ Clear</button>
          </div>
          {window.ThumbnailSizePreview && <window.ThumbnailSizePreview src={genImg} />}
        </div>
      )}
    </div>
  );
}

// ── THUMBNAIL ────────────────────────────────────────────────────────────────
function ThumbnailTab({ onOpenKey }) {
  const mood = 'ember';
  const m = TM[mood];
  const [mode, setMode] = React.useState('Check');
  const [cmpMode, setCmpMode] = React.useState('Single');
  const count = cmpMode === 'A/B/C' ? 3 : cmpMode === 'A/B' ? 2 : 1;
  const compare = count > 1;
  const [title, setTitle] = React.useState('');
  const [showTitle, setShowTitle] = React.useState(true);
  const [kind, setKind] = React.useState('Auto-detect');
  const [layout, setLayout] = React.useState('Auto-detect');
  const [scheme, setScheme] = React.useState('Auto-detect');
  const [nicheSel, setNicheSel] = React.useState('Auto-detect');
  const [strict, setStrict] = React.useState(true);
  const [imgA, setImgA] = React.useState(null);
  const [imgB, setImgB] = React.useState(null);
  const [imgC, setImgC] = React.useState(null);
  const [descA, setDescA] = React.useState('');
  const [descB, setDescB] = React.useState('');
  const [descC, setDescC] = React.useState('');
  const LBL = ['A', 'B', 'C'];
  const imgsAll = [imgA, imgB, imgC], setImgs = [setImgA, setImgB, setImgC];
  const descsAll = [descA, descB, descC], setDescs = [setDescA, setDescB, setDescC];
  // Brand kit + regeneration guidance
  const [brand, setBrand] = React.useState(loadBrandKit);
  const [emphasis, setEmphasis] = React.useState([]);
  const [addNote, setAddNote] = React.useState('');
  React.useEffect(() => { saveBrandKit(brand); }, [brand]);
  const setColor = (i, v) => setBrand(b => ({ ...b, colors: b.colors.map((c, j) => j === i ? v : c) }));
  const addColor = () => setBrand(b => b.colors.length >= 5 ? b : ({ ...b, colors: [...b.colors, '#FFE14D'] }));
  const delColor = (i) => setBrand(b => ({ ...b, colors: b.colors.filter((_, j) => j !== i) }));
  const toggleEmph = (c) => setEmphasis(e => e.includes(c) ? e.filter(x => x !== c) : [...e, c]);
  const { state, report, usage, sources, err, run } = window.useAnalysis('thumbnail');

  // Layout + colour options come straight from the research design library (single source of truth).
  const TLib = window.getResearch('thumbnail') || {};
  const layoutOpts = ['Auto-detect', ...((TLib.layouts || []).map(x => x.name))];
  const schemeOpts = ['Auto-detect', ...((TLib.colorSchemes || []).map(x => x.name))];
  const nicheOpts = ['Auto-detect', ...((window.nicheNames && window.nicheNames('thumbnail')) || []), 'None (universal)'];

  // Vision works with a personal key OR when signed in through the Worker (owner key).
  const hasVision = !!window.getKey() || !!(typeof window !== 'undefined' && window.CI_SESSION && (window.CI_SAAS || {}).workerUrl);
  const targetLine =
    (layout !== 'Auto-detect' ? `Target layout archetype: ${layout}\n` : '') +
    (scheme !== 'Auto-detect' ? `Target colour scheme: ${scheme}\n` : '') +
    ((layout === 'Auto-detect' && scheme === 'Auto-detect') ? 'Auto-detect the layout archetype and colour scheme and judge their fit.\n' : '');
  const brandColors = (brand.colors || []).filter(Boolean);
  const guidance = [
    brandColors.length ? `Brand colours: ${brandColors.join(', ')} -- build the regenerated thumbnail's palette around these (background / highlight box / number / accents) so it is on-brand, keeping strong contrast.` : '',
    brand.note ? `Brand notes: ${brand.note}` : '',
    emphasis.length ? `What to add / emphasise in the regeneration: ${emphasis.join('; ')}.` : '',
    addNote.trim() ? `Also for the regeneration: ${addNote.trim()}` : '',
  ].filter(Boolean).join('\n');
  const guidanceBlock = guidance ? `\nREGENERATION GUIDANCE:\n${guidance}\n` : '';
  const head = `Video title: ${(showTitle && title.trim()) ? title.trim() : '(none given)'}\nContent type: ${kind === 'Auto-detect' ? '(detect it from the thumbnail/title)' : kind}\n${targetLine}\n`;
  // No API key => the free AI is TEXT-ONLY and cannot see the uploaded images.
  // It must NOT fabricate scores or a winner it can't actually see.
  const noVision = !hasVision;
  const blindNote = noVision
    ? `IMPORTANT: Image vision is OFF (no API key connected). You CANNOT see the actual images -- judge ONLY from any text descriptions below. For ANY thumbnail with no description, you genuinely cannot evaluate it: do NOT guess, do NOT score it, and do NOT pick it as the winner. If you do not have enough described thumbnails to compare fairly, say so plainly and tell the user to connect an API key (for real image vision) or describe each thumbnail in words -- and in that case DO NOT output a winner.\n\n`
    : '';
  const cell = (i) => descsAll[i].trim() || (noVision ? '(no description given -- and the image cannot be seen)' : `(see attached Image ${i + 1})`);
  const userText = (compare
    ? head + blindNote +
      Array.from({ length: count }, (_, i) => `THUMBNAIL ${LBL[i]}${noVision ? '' : ` (= Image ${i + 1})`}: ${cell(i)}`).join('\n') + '\n\n' +
      `Compare these ${count} thumbnails for the SAME video and, ONLY if you can actually evaluate them, declare a single winner: fill the "winner" field with pick = A, B${count === 3 ? ' or C' : ''}, rank them and give the one specific reason it wins. Judge the ACTUAL execution you can see (text legibility, face/expression, contrast, focal clarity) -- a worse-executed "improved" version can legitimately lose to a cleaner original; never favour a version just because it is labelled the upgrade.`
    : head + blindNote +
      `THUMBNAIL: ${descA.trim() || (noVision ? '(no description given -- and the image cannot be seen)' : '(judge from the attached image)')}\n\n` +
      `Judge whether this thumbnail will earn the click.`) + guidanceBlock;
  // Vision works for single AND multi-image (A/B/C) when a key is present.
  const imgs = hasVision ? (compare ? imgsAll.slice(0, count).filter(Boolean) : (imgA ? [imgA] : [])) : [];
  // Ideation = 5 DIFFERENT creative directions (not one idea at escalating intensity).
  const upgradeAsk = compare ? '' :
    '\n\nALSO: end the report with a "copy" section titled "5 thumbnail concepts to try" containing EXACTLY 5 blocks. Each block is a genuinely DIFFERENT creative DIRECTION — not the same idea five times. Choose the 5 that best fit this topic from: reaction close-up (huge emotive face), object/result hero shot, before→after split, big-number/stat, contrast or "X vs Y", caught-in-the-moment candid, bold minimalist.\n' +
    '- Each block LABEL = the direction name + a punchy 2-4 word OVERLAY TEXT for that concept. You MAY improve on the original words to a stronger hook (keep the same topic). Example label: \'Reaction close-up — "I WAS WRONG"\'.\n' +
    '- Each block TEXT = a TIGHT image-generator prompt (2-4 sentences), SUBJECT FIRST: describe the finished SCENE — the person (position, exact expression/emotion, clothing) or the hero object, then background + ONE bold colour scheme, then composition + lighting. Be concrete and specific to THIS video. Do NOT bake long on-image text into the scene (the overlay words are in the label). End with only: sharp focus, high contrast, one clear focal point, photorealistic. NEVER include meta like "1280x720", "high-CTR", "legible at 120px", or "KEEP:".\n' +
    'The 5 concepts must look clearly different from each other AND from the current thumbnail.';
  // Niche routing + edit mode are baked into the system prompt (one source of truth).
  // compactPlaybook trims the playbook when auto-detecting -> fewer input tokens.
  const system = window.buildSystem('thumbnail', { niche: nicheSel, relax: !strict, compactPlaybook: true });
  const fullUserText = userText + upgradeAsk;
  const estIn = window.estTokens(system, fullUserText) + imgs.length * 1400;
  // Generate mode: describe-from-scratch prompt (no analysis, no tokens).
  const [genPrompt, setGenPrompt] = React.useState('');
  const [genIdeas, setGenIdeas] = React.useState({ loading: false, items: null, err: '' });
  // Output headroom: A/B/C produces 3 full analyses + a winner, so it needs more
  // room or the JSON truncates and the report comes back broken/empty.
  // Every compared slot needs an image or a written description — otherwise
  // there is literally nothing to judge and the call would waste tokens.
  const slotsReady = Array.from({ length: count }).every((_, i) => imgsAll[i] || descsAll[i].trim().length >= 12);
  function check() { if (!slotsReady) return; run({ userText: fullUserText, images: imgs, maxTokens: count === 3 ? 5500 : count === 2 ? 4500 : 3200, system }); }

  async function genConcepts() {
    if (!genPrompt.trim() && !imgA) { setGenIdeas({ loading: false, items: null, err: 'Describe the thumbnail or upload a photo first.' }); return; }
    setGenIdeas({ loading: true, items: null, err: '' });
    try {
      // Ground the concepts in concrete signals already present in the title/idea
      // (same heuristics as the CTR scorer) instead of a purely generic reading.
      const signalSrc = [(showTitle && title.trim()) || '', genPrompt.trim()].filter(Boolean).join('. ');
      const sig = window.scoreTitleCTR ? window.scoreTitleCTR(signalSrc) : null;
      const titleSignals = sig ? sig.factors.map(f => f.label) : [];
      const ut = `Video title: ${(showTitle && title.trim()) ? title.trim() : '(none)'}\nContent type: ${kind}\nIdea: ${genPrompt.trim() || '(use the attached photo as the subject)'}\n${guidance || ''}\n\nGive 5 concepts now.`;
      const { text } = await window.callClaude({ system: buildThumbCreateSys(!!imgA, titleSignals), userText: ut, images: imgA ? [imgA] : [], maxTokens: 2600, temperature: 0.9 });
      const j = window.parseReport(text);
      if (j && Array.isArray(j.concepts) && j.concepts.length) setGenIdeas({ loading: false, items: j.concepts, err: '' });
      else setGenIdeas({ loading: false, items: null, err: 'Could not generate concepts -- try again.' });
    } catch (e) {
      setGenIdeas({ loading: false, items: null, err: String(e.message) === 'NO_KEY' ? 'Add your Anthropic (Claude) API key in Settings to write concepts.' : (e.message || 'Could not generate.') });
    }
  }
  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Thumbnail studio" title={mode === 'Generate' ? 'Generate a thumbnail' : 'Check your thumbnail'}
        sub={mode === 'Generate' ? 'Describe what you want (and optionally upload one to remix) -- generate straight away, no analysis.' : "Upload your thumbnail. We'll check if it'll get clicks -- based on what actually works, not how pretty it looks."} />

      <div style={{ marginBottom: 16 }}>
        <TCG label="Mode" options={['Check', 'Generate']} value={mode} onChange={setMode} />
      </div>

      {mode === 'Generate' && (<>
        <TB mood={mood}>
          <label className="ci-label">Upload your photo <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>-- optional, but keeps your real face in the thumbnail</span></label>
          <ImageDrop image={imgA} onPick={setImgA} label="Drop your photo -- JPG or PNG (optional)" />
          <label className="ci-label" style={{ marginTop: 16 }}>What's the thumbnail for? <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>-- a topic or a rough idea</span></label>
          <textarea className="ci-textarea" style={{ minHeight: 80 }} value={genPrompt} onChange={e => setGenPrompt(e.target.value)}
            placeholder="e.g. 'My video on how beginners should start SIP investing' or 'Shocked reaction to a ₹500 Cr story'" />
          <div style={{ marginTop: 14 }}>
            <window.GlowButton mood={mood} size="lg" onClick={genConcepts}>{genIdeas.loading ? 'Designing…' : '✦ Suggest 5 concepts'}</window.GlowButton>
            <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 12 }}>Uses your research + your photo to write ready prompts.</span>
          </div>
          {genIdeas.err && <div style={{ fontSize: 13, color: '#f5788c', marginTop: 12 }}>{genIdeas.err}</div>}
        </TB>

        {genIdeas.items && genIdeas.items.length > 0 && (
          <TB title="Thumbnail concepts" desc={imgA ? 'Built around your photo — attach it again when generating' : 'Upload your photo above for an accurate likeness'} mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {genIdeas.items.map((t, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--stroke-1)', background: 'var(--surface-1)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{t.concept}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.55 }}>{t.prompt}</div>
                  <div style={{ marginTop: 10 }}>
                    <ThumbGenCard prompt={chatgptPrompt(t.prompt, !!imgA, strict, guidance)} source={imgA || null} m={m} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 12, lineHeight: 1.5 }}>
              <b>⚡ Generate</b> makes the image here (needs a Google/OpenAI image key). Or open ✨ Gemini / 🎨 ChatGPT, <b>attach your photo there</b>, and generate on your own plan.
            </div>
          </TB>
        )}

        <TB mood={mood}>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 10 }}>Already have your own prompt? Generate it here, or send it to an image tool:</div>
          <ThumbGenCard prompt={chatgptPrompt(genPrompt.trim() || 'A bold, high click-through YouTube thumbnail.', !!imgA, strict, guidance)} source={imgA || null} m={m} />
        </TB>
      </>)}

      {mode === 'Check' && (<>
      <TB mood={mood}>
        <div style={{ marginBottom: 14 }}>
          <TCG label="Test" options={['Single', 'A/B', 'A/B/C']} value={cmpMode} onChange={setCmpMode} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 12 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>
              {compare && <div style={{ fontSize: 12, fontWeight: 700, color: m.accentFrom, marginBottom: 6, letterSpacing: '.04em' }}>{LBL[i]}</div>}
              <ImageDrop image={imgsAll[i]} onPick={setImgs[i]} label={i === 0 ? 'Drop your image -- JPG or PNG' : `Drop image ${LBL[i]}`} showSizePreview={cmpMode === 'Single'} />
            </div>
          ))}
        </div>

        {!hasVision && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10, padding: '8px 11px', borderRadius: 9, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.2)', lineHeight: 1.5 }}>
            The free AI inside Claude can't see images -- so <b>describe each thumbnail below</b> and that's what gets reviewed. (Add an API key in Settings for real image vision.)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 12, marginTop: 14 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>
              <label className="ci-label">{compare ? `Describe thumbnail ${LBL[i]}` : 'Describe your thumbnail (text, faces, colors, layout)'}</label>
              <textarea className="ci-textarea" style={{ minHeight: 72 }} value={descsAll[i]} onChange={e => setDescs[i](e.target.value)}
                placeholder={i === 0 ? "e.g. Close-up of a shocked face, big yellow text 'I QUIT', dark kitchen background..." : `Describe thumbnail ${LBL[i]} the same way...`} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <TTg on={showTitle} onChange={setShowTitle} mood={mood}>Pair with a title (checks if thumb + title work together)</TTg>
          {showTitle && (
            <input className="ci-input" style={{ marginTop: 10 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Type your video title here..." />
          )}
        </div>
        <div style={{ marginTop: 14 }}>
          <TCG label="Content" options={['Auto-detect', 'Education', 'Entertainment', 'Tech', 'Lifestyle', 'Food', 'Gaming', 'Fitness', 'Finance', 'Other']} value={kind} onChange={setKind} />
        </div>
        <details className="ci-collapse" style={{ marginTop: 16, border: '1px solid var(--stroke-1)', borderRadius: 12, background: 'var(--surface-1)' }}>
          <summary style={{ cursor: 'pointer', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: 13.5, color: 'var(--text-2)' }}>
            <span>⚙ Advanced -- layout, niche & on-brand regeneration</span>
            <span className="ci-collapse-caret" style={{ opacity: 0.45, fontSize: 11.5 }}>optional ▾</span>
          </summary>
          <div style={{ padding: '0 16px 16px' }}>
            <div>
              <TCG label="Layout" options={layoutOpts} value={layout} onChange={setLayout} />
            </div>
            <div style={{ marginTop: 14 }}>
              <TCG label="Colour scheme" options={schemeOpts} value={scheme} onChange={setScheme} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="ci-label">Niche playbook <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>-- pick yours, or "None" for a clean, unbiased review</span></label>
              <select className="ci-input" value={nicheSel} onChange={e => setNicheSel(e.target.value)} style={{ appearance: 'auto' }}>
                {nicheOpts.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--stroke-1)' }}>
              <label className="ci-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                🎨 Brand colours <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>-- keeps the regen on-brand (saved here)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {(brand.colors || []).map((c, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <input type="color" value={c} onChange={e => setColor(i, e.target.value)}
                      style={{ width: 38, height: 38, border: '1px solid var(--stroke-1)', borderRadius: 9, background: 'none', cursor: 'pointer', padding: 2 }} />
                    <button onClick={() => delColor(i)} title="Remove"
                      style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'var(--surface-3)', color: 'var(--text-2)', fontSize: 10, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                  </div>
                ))}
                {(brand.colors || []).length < 5 && (
                  <button className="ci-copybtn" style={{ height: 38 }} onClick={addColor}>+ Add colour</button>
                )}
              </div>
              <input className="ci-input" style={{ marginTop: 10 }} value={brand.note || ''} onChange={e => setBrand(b => ({ ...b, note: e.target.value }))}
                placeholder="Optional brand note -- e.g. 'logo bottom-right, bold Montserrat-style font'" />

              <label className="ci-label" style={{ marginTop: 16 }}>✨ Regeneration -- what should we add or emphasise?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {EMPHASIS_CHIPS.map(c => {
                  const on = emphasis.includes(c);
                  return (
                    <button key={c} onClick={() => toggleEmph(c)} className="pill"
                      style={{ height: 32, borderColor: on ? m.accentGlow : 'var(--stroke-1)', color: on ? m.accentFrom : 'var(--text-2)', background: on ? `${m.accentFrom}1a` : 'transparent' }}>
                      {on ? '✓ ' : '+ '}{c}
                    </button>
                  );
                })}
              </div>
              <input className="ci-input" style={{ marginTop: 10 }} value={addNote} onChange={e => setAddNote(e.target.value)}
                placeholder="Anything else for the new version..." />
              <div style={{ marginTop: 14 }}>
                <TTg on={strict} onChange={setStrict} mood={mood}>Strict edit -- keep my image, change only what I ask</TTg>
              </div>
            </div>
          </div>
        </details>

        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} estOut={count === 3 ? 5500 : count === 2 ? 4500 : 3200} label={count === 3 ? 'Compare A / B / C' : count === 2 ? 'Compare A / B' : 'Check my thumbnail'}
          disabled={!slotsReady} disabledHint={compare ? 'Each slot needs an image or a written description (at least 12 characters) before comparing.' : 'Upload your thumbnail — or type a description at least 12 characters long below.'} /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={4} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div>
          <window.UsageBadge usage={usage} />
          {compare && report.winner && (
            <div className="ci-block" style={{ marginBottom: 14, padding: 18, background: `linear-gradient(135deg, ${m.orbB}33, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: m.accentFrom, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Winner</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-1)' }}>{report.winner.label || report.winner.pick}</div>
              {report.winner.why && <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.55 }}>{report.winner.why}</div>}
              {Array.isArray(report.scores) && report.scores.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {report.scores.map((s, i) => (
                    <div key={i} style={{ padding: '6px 11px', borderRadius: 9, background: 'var(--inset)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: s.score >= 75 ? '#8FD86A' : s.score >= 55 ? '#F0C85A' : '#F06A7E' }}>{s.score}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <window.ReportView report={report} mood={mood} sources={sources} />
          {!compare && imgA && (
            <div className="ci-block" style={{ marginTop: 14, background: `linear-gradient(135deg, ${m.orbB}44, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)' }}>🎨 Generate the improved thumbnail</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4, marginBottom: 12 }}>Takes the grounded fix above into ChatGPT or Gemini -- attach your thumbnail there and it edits it.</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <window.GlowButton mood={mood} onClick={() => window.openInChatGPT(chatgptPrompt(window.regenPromptFromReport(report) || '', true, strict, guidance))}>🎨 Generate in ChatGPT →</window.GlowButton>
                <button className="ci-copybtn" style={{ height: 38, padding: '0 14px' }} onClick={() => window.openInGemini(chatgptPrompt(window.regenPromptFromReport(report) || '', true, strict, guidance))}>✨ Copy + open Gemini</button>
                <button className="ci-copybtn" style={{ height: 38, padding: '0 14px' }} onClick={() => window.copyText(chatgptPrompt(window.regenPromptFromReport(report) || '', true, strict, guidance))}>⧉ Copy prompt</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 10, lineHeight: 1.5 }}>Prompt is copied + prefilled. Attach your thumbnail there, then press enter.</div>
            </div>
          )}
        </div>
      )}

      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> <b>Sample report.</b> Add your API key and upload an image to analyze your real thumbnail → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>
          <TTL level="yellow" title="Decent, but missing key elements"
            text="Good structure and colors -- but no human face is hurting your click-through rate." />

          <div className="ci-thumb-sample-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
            {/* what we see */}
            <TB title="What we see" mood={mood} style={{ padding: 18 }}>
              <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', position: 'relative', background: `radial-gradient(circle at 50% 60%, ${m.orbB}, ${m.orbA} 55%, #07090E 100%)`, marginBottom: 12 }}>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>Which AI<br/>Wins 2026?</div>
                </div>
                <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {['#10A37F','#D97757','#4285F4','#7B61FF','#FF6B4A'].map((c,i)=><span key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c }} />)}
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>Five AI model logos in a row. Bold text "WHICH AI WINS IN 2026?" Dark background, no human face. Clean tech layout.</div>
              <div style={{ marginTop: 10, fontSize: 12, color: m.accentFrom }}>Looks like: an AI/LLM comparison video</div>
            </TB>

            {/* quick scores */}
            <TB title="Quick scores" desc="Overall: 72 -- good structure, but no face" mood={mood}>
              <TQS name="Main subject clarity" score={8} why="Easy to understand what this is about." />
              <TQS name="Readable on phone" score={7} why="Title is fine, but model names underneath are hard to read." />
              <TQS name="Color contrast" score={8} why="Bright logos on dark background works well." />
              <TQS name="Face / expression" score={0} why="No face found. Faces with emotion get ~30% more clicks." />
              <TQS name="Text amount" score={5} why="Slightly too much text on screen." />
              <TQS name="Stands out in feed" score={8} why="Dark thumbnail pops on YouTube's white feed." />
            </TB>
          </div>

          <TB title="The checklist" mood={mood}>
            <TCk state="no">Face: No human face. This is the single biggest thing you can add to improve clicks.</TCk>
            <TCk state="yes">Instant story: Viewer immediately understands this is a comparison.</TCk>
            <TCk state="yes">Curiosity: "Which AI wins?" + the title creates a question they want answered.</TCk>
            <TCk state="mid">Phone readable: Title works, but model names too small on mobile.</TCk>
            <TCk state="yes">One focal point: Clean row of logos with text above. Eyes know where to go.</TCk>
          </TB>

          <TB title="What to fix" mood={mood}>
            <TIs level="red">Add your face (or any face showing surprise) -- this alone can boost clicks 20-30%.</TIs>
            <TIs level="yellow">Put a crown or trophy on the winning model -- teases the answer without revealing it.</TIs>
            <TIs level="yellow">Make the model names bigger -- they disappear on phone screens.</TIs>
          </TB>

          <TB title="AI prompts for a better thumbnail" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TCB text="Young Indian man, shocked expression, holding phone, 5 glowing AI logos floating behind him, dark tech background, neon lighting, 16:9" label="Copy prompt" />
              <TCB text="Split-screen battle -- 3 AI logos with red X vs 2 with gold crown, dark background, VS text in center, dramatic lighting" label="Copy prompt" />
            </div>
          </TB>

          <TB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 10 }}>
              Good thumbnail for tech -- clear topic, strong contrast, real curiosity. The biggest weakness is no human face. Add a reaction face and a "winner" hint like a crown -- <span style={{ color: m.accentFrom, fontWeight: 600 }}>that'll make a big difference without cluttering the design.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="ci-copybtn" style={{ height: 34 }}>📋 Copy report</button>
              <button className="ci-copybtn" style={{ height: 34 }}>↓ Download</button>
            </div>
          </TB>
        </div>
      )}
      </>)}
    </div>
  );
}
window.ThumbnailTab = ThumbnailTab;

// ── TITLE ────────────────────────────────────────────────────────────────────
// Opt-in local AI CTR predictor (WebLLM / MLC AI). Runs a small model fully in
// the browser via WebGPU. Heavy (~400MB) so it is strictly gated behind an
// explicit "Load model" click — it never downloads on its own.
function LocalCTRPredictor({ title, mood }) {
  const m = TM[mood] || TM.cyan;
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('idle'); // idle|loading|ready|predicting|error
  const [progress, setProgress] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [err, setErr] = React.useState('');
  const engineRef = React.useRef(null);
  const mountedRef = React.useRef(true);
  const MODEL = 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC';
  const hasGPU = typeof navigator !== 'undefined' && !!navigator.gpu;

  // Release the GPU engine and stop state updates once this tab unmounts.
  React.useEffect(() => () => {
    mountedRef.current = false;
    try { engineRef.current && engineRef.current.unload && engineRef.current.unload(); } catch (e) {}
  }, []);

  async function loadModel() {
    if (!hasGPU) { setErr('This needs WebGPU — use desktop Chrome or Edge.'); setStatus('error'); return; }
    setStatus('loading'); setErr(''); setProgress('Starting…');
    try {
      const webllm = await import('https://esm.run/@mlc-ai/web-llm');
      const eng = await webllm.CreateMLCEngine(MODEL, { initProgressCallback: p => { if (mountedRef.current) setProgress(p.text || ''); } });
      if (!mountedRef.current) { try { eng.unload && eng.unload(); } catch (e) {} return; }
      engineRef.current = eng;
      setStatus('ready');
    } catch (e) { if (mountedRef.current) { setErr(e.message || 'Could not load the local model.'); setStatus('error'); } }
  }

  async function predict() {
    if (!engineRef.current || !title.trim()) return;
    setStatus('predicting'); setResult(null); setErr('');
    try {
      const reply = await engineRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a YouTube CTR expert. Given a video title, output ONLY a JSON object {"score": <integer 0-100>, "reason": "<max 12 words>"}. Score = predicted click-through appeal.' },
          { role: 'user', content: 'Title: ' + title.trim() },
        ],
        temperature: 0.3, max_tokens: 80,
      });
      if (!mountedRef.current) return;
      const txt = (reply.choices && reply.choices[0] && reply.choices[0].message.content) || '';
      const mj = txt.match(/\{[\s\S]*\}/);
      let parsed = null; if (mj) { try { parsed = JSON.parse(mj[0]); } catch (e) {} }
      if (parsed && parsed.score != null) setResult({ score: Math.max(0, Math.min(100, Math.round(parsed.score))), reason: parsed.reason || '' });
      else setResult({ score: null, reason: txt.slice(0, 120) });
      setStatus('ready');
    } catch (e) { if (mountedRef.current) { setErr(e.message || 'Prediction failed.'); setStatus('error'); } }
  }

  return (
    <div style={{ marginTop: 14, border: '1px solid var(--stroke-1)', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 14px', background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
        <span>🧠 Local AI CTR Predictor <span style={{ fontWeight: 400, color: 'var(--text-5)' }}>· runs offline in your browser, no API key</span></span>
        <span style={{ color: 'var(--text-5)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: 14 }}>
          {status === 'idle' && (
            <div>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5, margin: '0 0 10px' }}>
                Downloads a small AI model (~400&nbsp;MB) <b>once</b> into your browser, then scores titles fully offline — nothing leaves your device. Needs desktop Chrome/Edge (WebGPU).
              </p>
              <button onClick={loadModel} disabled={!hasGPU}
                style={{ height: 38, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${m.accentFrom}`, background: m.accentFrom + '18', color: m.accentFrom, fontSize: 13, fontWeight: 700, cursor: hasGPU ? 'pointer' : 'not-allowed', opacity: hasGPU ? 1 : 0.5 }}>
                {hasGPU ? 'Load model (~400 MB, one time)' : 'WebGPU not available in this browser'}
              </button>
            </div>
          )}
          {status === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-3)' }}>
              <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ flex: 1 }}>{progress || 'Loading model…'}</span>
            </div>
          )}
          {(status === 'ready' || status === 'predicting') && (
            <div>
              <button onClick={predict} disabled={status === 'predicting' || !title.trim()}
                style={{ height: 38, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${m.accentFrom}`, background: m.accentFrom + '18', color: m.accentFrom, fontSize: 13, fontWeight: 700, cursor: (status === 'predicting' || !title.trim()) ? 'not-allowed' : 'pointer', opacity: (status === 'predicting' || !title.trim()) ? 0.6 : 1 }}>
                {status === 'predicting' ? 'Predicting…' : '⚡ Predict CTR for this title'}
              </button>
              {result && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {result.score != null && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 26, color: result.score >= 70 ? '#8FD86A' : result.score >= 45 ? '#F0C85A' : '#F06A7E' }}>{result.score}</div>
                  )}
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{result.reason}</div>
                </div>
              )}
            </div>
          )}
          {status === 'error' && <div style={{ fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{err} <button className="ci-copybtn" style={{ height: 24, padding: '0 8px', fontSize: 11, marginLeft: 6 }} onClick={() => { setStatus('idle'); setErr(''); }}>Retry</button></div>}
        </div>
      )}
    </div>
  );
}

// Batch title ranker — paste several titles, score + rank them instantly with the
// offline scoreTitleCTR heuristic. No API key, fully client-side.
function BatchTitleRanker({ mood }) {
  const m = TM[mood] || TM.cyan;
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState('');
  const scorer = window.scoreTitleCTR;
  const ranked = React.useMemo(() => {
    if (!scorer) return [];
    const lines = raw.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8);
    return lines
      .map(t => { const r = scorer(t); return { title: t, score: r ? r.score : null, factors: r ? r.factors : [] }; })
      .filter(x => x.score !== null)
      .sort((a, b) => b.score - a.score);
  }, [raw, scorer]);
  const count = raw.split('\n').map(s => s.trim()).filter(Boolean).length;

  return (
    <div style={{ marginTop: 14, border: '1px solid var(--stroke-1)', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 14px', background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
        <span>🏁 Batch Title Ranker <span style={{ fontWeight: 400, color: 'var(--text-5)' }}>· score & rank up to 8 titles instantly, offline</span></span>
        <span style={{ color: 'var(--text-5)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: 14 }}>
          <textarea className="ci-input" rows={5}
            placeholder={"Paste one title per line (up to 8):\n5 Mistakes Every Beginner Makes\nHow I Saved ₹1 Lakh in 60 Days\nThe Truth About Index Funds Nobody Tells You"}
            value={raw} onChange={e => setRaw(e.target.value)}
            style={{ resize: 'vertical', lineHeight: 1.6, fontSize: 13.5 }} />
          <div style={{ fontSize: 11, color: 'var(--text-5)', marginTop: 4 }}>{count} title{count !== 1 ? 's' : ''}{count > 8 ? ' (only first 8 ranked)' : ''}</div>
          {ranked.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {ranked.map((r, i) => {
                const col = r.score >= 72 ? '#8FD86A' : r.score >= 50 ? '#F0C85A' : '#F06A7E';
                const winner = i === 0 && ranked.length > 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10,
                    background: winner ? m.accentFrom + '12' : 'var(--surface-2)', border: `1px solid ${winner ? m.accentFrom + '44' : 'var(--stroke-1)'}` }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: col, minWidth: 34, textAlign: 'center' }}>{r.score}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: winner ? 700 : 500, lineHeight: 1.4 }}>
                        {winner && <span style={{ marginRight: 6 }}>🏆</span>}{r.title}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                        {r.factors.slice(0, 6).map(f => (
                          <span key={f.key} style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 999, background: f.col + '18', color: f.col, fontWeight: 600 }}>{f.label}</span>
                        ))}
                      </div>
                    </div>
                    <CopyBlockButton text={r.title} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TitleTab({ onOpenKey }) {
  const mood = 'cyan';
  const m = TM[mood];
  const [compare, setCompare] = React.useState(false);
  const [title, setTitle] = React.useState('5 Mistakes Every Beginner Makes');
  const [titleB, setTitleB] = React.useState('');
  const [about, setAbout] = React.useState('');
  const [lang, setLang] = React.useState('Auto-detect');
  const [platform, setPlatform] = React.useState('YouTube');
  const [aud, setAud] = React.useState('General');
  const { state, report, usage, sources, err, run } = window.useAnalysis('title');
  const chars = title.length;

  const userText =
    `Language: ${lang === 'Auto-detect' ? '(detect from the title)' : lang}\nPlatform: ${platform}\nAudience: ${aud}\n` +
    (about.trim() ? `Video is about: ${about}\n` : '') +
    `TITLE${compare && titleB.trim() ? ' A' : ''}: ${title}` +
    (compare && titleB.trim()
      ? `\nTITLE B: ${titleB}\n\nCompare title A and title B and declare the winner (fill the "winner" field). Then provide 10 alternative titles, each labelled with its angle.`
      : `\n\nEvaluate this title and provide 10 alternative titles, each labelled with its angle.`);
  const estIn = window.estTokens(window.buildSystem('title'), userText);
  const titleReady = title.trim().length >= 4 && (!compare || titleB.trim().length >= 4);
  function check() { if (!titleReady) return; run({ userText, maxTokens: 2800 }); }

  const alts = [
    ['Curiosity', 'SIP Mein Yeh 5 Galtiyan? 90% Log Karte Hain'],
    ['Fear', 'Stop! In 5 SIP Mistakes Se Paisa Doob Raha Hai'],
    ['Specific numbers', '5 SIP Mistakes That Cost You ₹10 Lakh'],
    ['Hinglish', '5 SIP Galtiyan Jo Beginners Karte Hain'],
    ['Negative framing', 'Never Make These 5 SIP Mistakes in 2026'],
    ['Question', 'Kya Aap Bhi Yeh 5 SIP Galtiyan Kar Rahe Ho?'],
    ['Listicle', '5 SIP Mistakes [With Real Examples]'],
    ['Controversial', 'Your SIP Is Losing Money -- Here Is Why'],
    ['Social proof', '5 SIP Mistakes 90% Beginners Make'],
    ['Aspirational', 'Avoid These 5 Mistakes, Build ₹1 Crore With SIP'],
  ];

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Title check" title="Check your title"
        sub="Test your video title. We'll check if it's click-worthy, search-friendly, and works on mobile." />

      <TB mood={mood}>
        <div style={{ marginBottom: 14 }}><TTg on={compare} onChange={setCompare} mood={mood}>Compare two titles</TTg></div>
        <input className="ci-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Type your title here..." style={{ fontSize: 16 }} />
        {compare && <input className="ci-input" value={titleB} onChange={e => setTitleB(e.target.value)} placeholder="Second title..." style={{ marginTop: 10, fontSize: 16 }} />}
        <div style={{ marginTop: 14 }}>
          <label className="ci-label">What's the video about? (optional -- helps us judge if title matches content)</label>
          <input className="ci-input" value={about} onChange={e => setAbout(e.target.value)} placeholder="One line about the video..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          <TCG label="Language" options={['Auto-detect', 'English', 'Hindi', 'Hinglish', 'Spanish', 'Other']} value={lang} onChange={setLang} />
          <TCG label="Platform" options={['Reels', 'TikTok', 'Shorts', 'YouTube']} value={platform} onChange={setPlatform} />
          <TCG label="Audience" options={['General', 'Gen Z', 'Millennials', 'Professionals', 'Beginners']} value={aud} onChange={setAud} />
        </div>
        <div className="ci-wpm" style={{ marginTop: 16 }}>
          <span>Characters: <b>{chars}</b></span>
          <span style={{ color: 'var(--text-5)' }}>·</span>
          <span style={{ color: chars <= 60 ? '#8FD86A' : '#F0C85A', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span className={'ci-dot ' + (chars <= 60 ? 'green' : 'yellow')} />{chars <= 60 ? 'Good -- under 60' : 'Long -- may truncate'}
          </span>
        </div>
        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} estOut={2800} label="Check my title"
          disabled={!titleReady} disabledHint={compare && title.trim() ? 'Type the second title too (or turn off compare).' : 'Type your title first — nothing to check yet.'} /></div>
        <LocalCTRPredictor title={title} mood={mood} />
        <BatchTitleRanker mood={mood} />
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div><window.UsageBadge usage={usage} /><window.ReportView report={report} mood={mood} sources={sources} /></div>
      )}

      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> <b>Sample report.</b> Add your API key to analyze your real title → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>
          <TTL level="yellow" title="Close -- a few tweaks will lift it" text="Clear and readable, but the hook word and keyword position need work." />

          <TB title="Scores" mood={mood}>
            <TSI mood={mood} name="Click chance" score={58} why="Doesn't create enough urgency to click. Needs a stronger hook word up front." />
            <TSI mood={mood} name="Curiosity" score={72} why="Good list format, but the payoff feels predictable. A number or stake raises it." />
            <TSI mood={mood} name="Clarity" score={81} why="Clear what the video is about. No confusion." />
          </TB>

          <TB title="Title breakdown" mood={mood}>
            {[
              ['Characters', `${chars} -- good, under 60`, 'green'],
              ['Power words', '2 found -- decent, 3+ is ideal', 'yellow'],
              ['Numbers', 'Yes -- numbers boost clicks 15-25%', 'green'],
              ['Brackets', 'None -- adding [2026] or [Step-by-Step] can help', 'yellow'],
              ['Keyword position', '"SIP" appears at word 2 -- good, keep it in the first 3 words', 'green'],
            ].map(([k, v, lvl]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '20px 130px 1fr', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--stroke-1)', fontSize: 13 }}>
                <span className={'ci-dot ' + lvl} />
                <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{k}</span>
                <span style={{ color: 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)', fontSize: 12.5, color: 'var(--text-2)' }}>
              On mobile, viewers see: <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>"{title.slice(0, 40)}{title.length > 40 ? '...' : ''}"</span>
            </div>
          </TB>

          <TB title="10 alternative titles" desc="Different angles -- copy whichever fits" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alts.map(([angle, t]) => (
                <div key={angle} className="ci-copyblock">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: m.accentFrom, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{angle}</div>
                    <div className="ci-copyblock-text">{t}</div>
                  </div>
                  <CopyBlockButton text={t} />
                </div>
              ))}
            </div>
          </TB>
        </div>
      )}
    </div>
  );
}
window.TitleTab = TitleTab;

// small inline copy button (so we don't double-wrap copyblock)
function CopyBlockButton({ text }) {
  const [done, setDone] = React.useState(false);
  return (
    <button className={'ci-copybtn' + (done ? ' done' : '')} onClick={() => { try { navigator.clipboard.writeText(text); } catch(e){} setDone(true); setTimeout(()=>setDone(false),1400); }}>
      {done ? '✓' : '⧉ Copy'}
    </button>
  );
}

// ── ADS ──────────────────────────────────────────────────────────────────────
function AdsTab({ onOpenKey }) {
  const mood = 'violet';
  const m = TM[mood];
  const [platform, setPlatform] = React.useState('Meta');
  const [primary, setPrimary] = React.useState('Tired of trainers that fall apart in 3 months? The Atlas Mach lasts 800km -- guaranteed, or your money back.');
  const [headline, setHeadline] = React.useState('Built to Outlast Your PR');
  const [cta, setCta] = React.useState('Shop Now');
  const [desc, setDesc] = React.useState('');
  const [goal, setGoal] = React.useState('Conversions');
  // Google Ads controlled state (was uncontrolled defaultValue — data never reached Claude)
  const [gHeadlines, setGHeadlines] = React.useState('Atlas Mach Running Shoe\nLasts 800km Guaranteed\nFree Returns, 30 Days');
  const [gDescriptions, setGDescriptions] = React.useState('The $90 trainer that beat the $200 ones in a real half-marathon. Try risk-free.');
  const [gKeywords, setGKeywords] = React.useState('running shoes, marathon trainer, cushioned running shoe');
  const { state, report, usage, sources, err, run } = window.useAnalysis('ads');

  const META_PRIMARY = 125, META_HEAD = 27;
  const pOver = primary.length > META_PRIMARY, hOver = headline.length > META_HEAD;

  const userText = platform === 'Meta'
    ? `Platform: Meta\nObjective: ${goal}\nCTA button: ${cta}\n\nPrimary/main text (${primary.length} chars): ${primary}\nHeadline (${headline.length} chars): ${headline}${desc.trim() ? `\nDescription: ${desc.trim()}` : ''}\n\nCheck character limits, "See More" truncation, scroll-stopping power and compliance. Show what people actually see, and give stronger rewrites.`
    : `Platform: Google Ads\nObjective: ${goal}\n\nHeadlines (max 30 chars each):\n${gHeadlines}\n\nDescriptions (max 90 chars each):\n${gDescriptions}\n\nKeywords: ${gKeywords}\n\nCheck headline character limits, description limits, ad strength score, keyword relevance, and quality. Flag any truncations and give stronger alternatives.`;
  const estIn = window.estTokens(window.buildSystem('ads'), userText);
  const adReady = platform === 'Meta' ? primary.trim().length >= 12 : gHeadlines.trim().length >= 5;
  function check() { if (!adReady) return; run({ userText, maxTokens: 2200 }); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Ad check" title="Check your ad copy"
        sub="Paste your Meta or Google ad. We'll check character limits, truncation, and whether it'll stop the scroll." />

      <TB mood={mood}>
        <div style={{ marginBottom: 16 }}><TCG label="Platform" options={['Meta', 'Google']} value={platform} onChange={setPlatform} /></div>

        {platform === 'Meta' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="ci-label">Main text (shown above your image)</label>
                <span className={'ci-counter ' + (pOver ? 'over' : 'ok')}>{Math.min(primary.length, META_PRIMARY)}/{META_PRIMARY} before "See More"</span>
              </div>
              <textarea className="ci-textarea" style={{ minHeight: 90 }} value={primary} onChange={e => setPrimary(e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="ci-label">Headline (bold text below image)</label>
                <span className={'ci-counter ' + (hOver ? 'over' : 'ok')}>{headline.length}/{META_HEAD} on mobile</span>
              </div>
              <input className="ci-input" value={headline} onChange={e => setHeadline(e.target.value)} />
            </div>
            <div>
              <label className="ci-label">Description (most people never see this)</label>
              <input className="ci-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional supporting line..." />
            </div>
            <TCG label="CTA button" options={['Learn More', 'Sign Up', 'Shop Now', 'Download', 'Apply Now']} value={cta} onChange={setCta} />
            <TCG label="Goal" options={['Traffic', 'Leads', 'Conversions', 'Awareness']} value={goal} onChange={setGoal} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="ci-label">Headlines (one per line — max 30 characters each)</label><textarea className="ci-textarea" style={{ minHeight: 90 }} value={gHeadlines} onChange={e => setGHeadlines(e.target.value)} /></div>
            <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="ci-label">Descriptions (one per line — max 90 characters each)</label>
              {gDescriptions.split('\n').some(l => l.length > 90) && (
                <span style={{ fontSize: 11.5, color: '#F06A7E', fontWeight: 600 }}>Over limit on {gDescriptions.split('\n').filter(l => l.length > 90).length} line{gDescriptions.split('\n').filter(l => l.length > 90).length !== 1 ? 's' : ''}</span>
              )}
            </div>
            <textarea className="ci-textarea" style={{ minHeight: 70 }} value={gDescriptions} onChange={e => setGDescriptions(e.target.value)} />
            {gDescriptions.split('\n').map((l, i) => l.length > 90 ? (
              <div key={i} style={{ fontSize: 11.5, color: '#F06A7E', marginTop: 3 }}>Line {i + 1}: {l.length}/90 chars ({l.length - 90} over)</div>
            ) : null)}
          </div>
            <div><label className="ci-label">Keywords you're targeting</label><input className="ci-input" value={gKeywords} onChange={e => setGKeywords(e.target.value)} /></div>
          </div>
        )}

        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} estOut={2200} label="Check my ad"
          disabled={!adReady} disabledHint="Write your ad's main text first — nothing to check yet." /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div><window.UsageBadge usage={usage} /><window.ReportView report={report} mood={mood} sources={sources} /></div>
      )}

      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> <b>Sample report.</b> Add your API key to analyze your real ad → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>
          <TTL level="red" title="Not ready -- your hook is hidden" text="Your strongest line falls after the 'See More' cutoff. Most people won't read it." />

          <TB title="Scores" mood={mood}>
            <TSI mood={mood} name="Scroll-stopping power" score={45} why="Your opening line blends into the feed. The benefit is buried -- lead with it." />
            <TSI mood={mood} name="Copy quality" score={62} why="Message is clear but doesn't create urgency." />
            <TSI mood={mood} name="CTA fit" score={78} why={`"${cta}" matches your ${goal.toLowerCase()} objective well.`} />
          </TB>

          <TB title="What people actually see" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 5 }}>ON FEED · BEFORE "SEE MORE"</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)' }}>"{primary.slice(0, META_PRIMARY)}{primary.length > META_PRIMARY ? '... See More' : ''}"</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 5 }}>HEADLINE ON MOBILE</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 600 }}>"{headline.slice(0, META_HEAD)}{headline.length > META_HEAD ? '...' : ''}"</div>
              </div>
            </div>
          </TB>

          <TB title="What we found" mood={mood}>
            <TIs level="red">Your hook is after the "See More" cutoff. Move your strongest line first.</TIs>
            <TIs level="yellow">Headline could name the benefit harder. "Lasts 800km or Money Back" beats "Built to Outlast."</TIs>
            <TIs level="green">CTA matches your objective well.</TIs>
          </TB>

          <TB title="Stronger versions" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Stronger main text</div><TCB text="Your trainers shouldn't die at 3 months. The Atlas Mach lasts 800km -- guaranteed, or your money back. Runners are switching for a reason." label="Copy" /></div>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Stronger headline</div><TCB text="800km or Money Back" label="Copy" /></div>
            </div>
          </TB>

          <TB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 10 }}>Your offer is strong but it's hidden. Move the guarantee to your first line and harden the headline -- <span style={{ color: m.accentFrom, fontWeight: 600 }}>that's the difference between a scroll and a click.</span></div>
          </TB>
        </div>
      )}
    </div>
  );
}
window.AdsTab = AdsTab;

// ── HISTORY ──────────────────────────────────────────────────────────────────
function timeAgo(t) {
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return s + 's ago';
  const mn = Math.floor(s / 60); if (mn < 60) return mn + 'm ago';
  const h = Math.floor(mn / 60); if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : d + 'd ago';
}
// Real-world results logger -- the credibility + come-back-weekly loop.
function HistoryResults({ it, mood, onSaved }) {
  const a = it.actual || null;
  const [open, setOpen] = React.useState(false);
  const [views, setViews] = React.useState(a ? a.views : '');
  const [ctr, setCtr]     = React.useState(a ? a.ctr : '');
  const [note, setNote]   = React.useState(a ? a.note : '');
  const m = TM[mood] || TM.navy;
  function save() {
    window.updateHistory(it.t, { actual: { views: String(views).trim(), ctr: String(ctr).trim(), note: String(note).trim(), loggedAt: Date.now() } });
    setOpen(false); onSaved && onSaved();
  }
  if (a && !open) {
    return (
      <div className="ci-block" style={{ padding: '14px 16px', marginTop: 12, background: 'rgba(143,216,106,0.06)', border: '1px solid rgba(143,216,106,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8FD86A', marginBottom: 6 }}>📈 Real results</div>
            <div style={{ fontSize: 14, color: 'var(--text-1)' }}>
              Predicted <b>{it.score != null ? it.score : '--'}</b>
              {a.views ? <span> → <b>{a.views}</b> views</span> : null}
              {a.ctr ? <span> · <b>{a.ctr}</b> CTR</span> : null}
            </div>
            {a.note && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>{a.note}</div>}
          </div>
          <button className="ci-copybtn" style={{ height: 30 }} onClick={() => setOpen(true)}>Edit</button>
        </div>
      </div>
    );
  }
  return (
    <div className="ci-block" style={{ padding: 16, marginTop: 12 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>Posted it? Add your real numbers</div>
      <div style={{ fontSize: 12, color: 'var(--text-4)', margin: '4px 0 12px' }}>See how the prediction held up — and build your own track record.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input className="ci-input" placeholder="Views (e.g. 142K)" value={views} onChange={e => setViews(e.target.value)} />
        <input className="ci-input" placeholder="CTR / ER (e.g. 6.2%)" value={ctr} onChange={e => setCtr(e.target.value)} />
      </div>
      <input className="ci-input" style={{ marginTop: 10 }} placeholder="Note (optional) — what you changed, what happened" value={note} onChange={e => setNote(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <GlowButton mood={mood} onClick={save}>Save results</GlowButton>
        {it.actual && <button className="ci-copybtn" style={{ height: 38 }} onClick={() => setOpen(false)}>Cancel</button>}
      </div>
    </div>
  );
}

function HistoryTab() {
  const mood = 'burgundy';
  const m = TM[mood];
  const [filter, setFilter] = React.useState('All');
  const [openIdx, setOpenIdx] = React.useState(-1);
  const [items, setItems] = React.useState(() => (window.loadHistory ? window.loadHistory() : []));
  const TYPE_LABEL = { script: 'Script', thumbnail: 'Thumbnail', title: 'Title', ads: 'Ads', ask: 'Ask' };
  const tmoodOf = { script: 'navy', thumbnail: 'ember', title: 'cyan', ads: 'violet', ask: 'violet' };
  const filtered = filter === 'All' ? items : items.filter(i => TYPE_LABEL[i.type] === filter.replace(/s$/, ''));
  React.useEffect(() => { setOpenIdx(-1); }, [filter]);
  function clearAll() { window.clearHistory && window.clearHistory(); setItems([]); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <Eyebrow mood={mood} glow>History</Eyebrow>
          <h2 className="ci-h2">Past checks</h2>
          <p className="ci-sub" style={{ marginTop: 6 }}>Open any check, then log the real views after you post — see how the prediction held up.</p>
        </div>
        {items.length > 0 && <button className="ci-copybtn" style={{ height: 34 }} onClick={clearAll}>Clear all</button>}
      </div>

      {items.length === 0 ? (
        <div className="ci-block" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🗂️</div>
          <div style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600 }}>No checks yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Run a Script, Thumbnail, Title or Ads check and it'll be saved here (on this device).</div>
        </div>
      ) : (
        <>
          <div className="ci-chiprow" style={{ marginBottom: 16 }}>
            {['All', 'Scripts', 'Thumbnails', 'Titles', 'Ads'].map(f => (
              <button key={f} className={'pill' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)} style={{ height: 30, fontSize: 12.5 }}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((it, i) => {
              const im = TM[tmoodOf[it.type] || 'navy'];
              const lvl = it.level || 'yellow';
              const hasReport = it.report && typeof it.report === 'object';
              const isOpen = openIdx === i;
              return (
                <div key={i}>
                <div className="ci-block ci-history-row" onClick={() => hasReport && setOpenIdx(isOpen ? -1 : i)}
                  style={{ padding: 16, display: 'grid', gridTemplateColumns: '120px 1fr 90px 70px', gap: 16, alignItems: 'center', cursor: hasReport ? 'pointer' : 'default', borderColor: isOpen ? im.accentGlow : undefined }}
                  title={!hasReport ? 'Full report not stored — re-run this check to see the details' : undefined}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${im.accentFrom}, ${im.accentTo})`, display: 'grid', placeItems: 'center', color: '#07090E' }}><CITabIcon name={it.type === 'script' ? 'script' : it.type === 'thumbnail' ? 'thumb' : it.type === 'title' ? 'title' : 'ads'} /></span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{TYPE_LABEL[it.type] || it.type}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.actual ? '📈 ' : ''}{it.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{timeAgo(it.t)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span className={'ci-dot ' + lvl} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: lvl === 'green' ? '#8FD86A' : lvl === 'yellow' ? '#F0C85A' : '#F06A7E' }}>{it.score != null ? it.score : '--'}</span>
                    {hasReport && <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 2 }}>{isOpen ? '▴' : '▾'}</span>}
                  </div>
                </div>
                {isOpen && !hasReport && (
                  <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(240,200,90,0.07)', border: '1px solid rgba(240,200,90,0.2)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-3)', flex: 1 }}>Full report not stored — re-run this check to see the details.</span>
                  </div>
                )}
                {isOpen && hasReport && (
                  <div style={{ marginTop: 10, paddingLeft: 6, borderLeft: `2px solid ${im.accentGlow}` }}>
                    {it.input && (
                      <div className="ci-block" style={{ padding: '12px 16px', marginBottom: 12 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 6 }}>What was checked</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{it.input}{it.input.length >= 2000 ? '…' : ''}</div>
                      </div>
                    )}
                    <window.ReportView report={it.report} mood={tmoodOf[it.type] || 'navy'} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                        onClick={() => { try { window.copyText(JSON.stringify(it.report, null, 2)); } catch(e){} }}>
                        ⧉ Copy report JSON
                      </button>
                      {it.report?.verdict && (
                        <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                          onClick={() => {
                            const r = it.report;
                            const lines = [`Score: ${r.overall ?? '--'} — ${r.verdict?.title ?? ''}`];
                            if (r.bottomLine) lines.push(`Bottom line: ${r.bottomLine}`);
                            (r.scores || []).forEach(s => lines.push(`${s.name}: ${s.score} — ${s.why}`));
                            (r.sections || []).forEach(s => { if (s.body) lines.push(`\n${s.title}:\n${s.body}`); });
                            try { window.copyText(lines.join('\n')); } catch(e) {}
                          }}>
                          ⧉ Copy as text
                        </button>
                      )}
                      <button className="ci-copybtn" style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                        onClick={() => window.print()} title="Save as PDF using your browser's print dialog">
                        ⬇ Save as PDF
                      </button>
                    </div>
                    <HistoryResults it={it} mood={tmoodOf[it.type] || 'navy'} onSaved={() => setItems(window.loadHistory())} />
                  </div>
                )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
window.HistoryTab = HistoryTab;
