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

function BuilderTab() {
  const mood = 'lime';
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

  const [headline, setHeadline] = React.useState('');
  const [subline, setSubline] = React.useState('');
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

  const [extraNote, setExtraNote] = React.useState('');
  const [brand] = React.useState(bLoadBrand);
  const brandColors = (brand.colors || []).filter(Boolean);
  const hasBrand = brandColors.length > 0 || !!brand.note;

  const [prompt, setPrompt] = React.useState('');
  const [built, setBuilt] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState('');

  const hasKey = !!(window.getKey && window.getKey());
  const canCloud = !!(window.canRun && window.canRun()); // own key OR free Claude cloud

  // Research-grounded system prompt for the cloud check (NOT the report shape).
  function thumbSystem() {
    const r = (window.getResearch && window.getResearch('thumbnail')) || {};
    const core = (window.liveResearch && window.liveResearch().core) || '';
    return [
      'You are a world-class YouTube thumbnail strategist. You judge thumbnails purely by what earns the click, grounded in the research below. Be specific and blunt -- no generic advice.',
      core ? 'RESEARCH PRINCIPLES:\n' + core : '',
      r.systemGuidance ? 'THUMBNAIL METHODOLOGY:\n' + r.systemGuidance : '',
      'You will get a thumbnail as an image if one is attached, otherwise as a text description. Analyse it and return ONLY a single valid JSON object (no markdown, no text around it) in EXACTLY this shape:',
      '{ "whatsWrong": ["specific problem tied to a real click-through principle", "... up to 6"], "improvedPrompt": "one complete, ready-to-paste image-generation prompt for ChatGPT/Gemini that keeps the SAME person, topic and exact text but fixes every problem -- be concrete about composition, expression, colour, contrast and text size/placement", "headline": "exact main text or empty", "subline": "secondary text or empty", "people": [{ "desc": "appearance", "expression": "excited|shocked|serious|pointing|laughing|love|none" }], "elements": ["only from: ' + BUILDER_ELEMENTS.join(', ') + '"] }',
      'Never invent text, people or brands not present in the thumbnail. Write in the same language as the thumbnail content.',
    ].filter(Boolean).join('\n\n');
  }

  // Wipe everything from a previous analysis so a new upload starts clean.
  function clearForm() {
    setHeadline(''); setSubline(''); setPeople([]); setElements([]);
    setFeedback([]); setPrompt(''); setBuilt(false);
    setAnalyseSummary(''); setAnalyseDesc('');
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
      if (parsed.improvedPrompt) { setPrompt(String(parsed.improvedPrompt)); setBuilt(true); }
      setAnalyseSummary(hasKey && analyseImg ? 'Checked your image with the research.' : 'Checked your description with the research (free cloud).');
      setAnalyseState('done');
      setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140);
    } catch (e) {
      setAnalyseState(String(e && e.message) === 'NO_KEY' ? 'nokey' : 'error');
    }
  }

  async function analyzeRef() {
    const key = window.getKey ? window.getKey() : null;
    if (!key || !refImg) return;
    setRefState('loading');
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: window.getModel ? window.getModel() : 'claude-sonnet-4-6',
          max_tokens: 350,
          system: 'Extract visual design properties. Return ONLY JSON.',
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: refImg.mime, data: refImg.data } },
            { type: 'text', text: 'Analyse this thumbnail. Return JSON: { "layout": "...", "colors": "...", "textStyle": "...", "mood": "...", "keyElements": "..." }' },
          ]}],
        }),
      });
      const data = await resp.json();
      const raw = (data.content?.[0]?.text || '').trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || 'null');
      if (parsed) setRefAnalysis(Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n'));
      setRefState('done');
    } catch (e) { setRefState('error'); }
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
    const p = lines.join('\n');
    setPrompt(p); setBuilt(true);
    setTimeout(() => document.getElementById('builder-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <img src={analyseImg.preview} alt="" style={{ width: 120, borderRadius: 9, border: '1px solid var(--stroke-1)', flexShrink: 0 }} />
            <button className="ci-copybtn" style={{ height: 30, fontSize: 11.5 }}
              onClick={() => { setAnalyseImg(null); clearForm(); setAnalyseState('idle'); }}>Remove image</button>
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
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--stroke-1)' }}>
              <div style={{ flexShrink: 0 }}>
                {p.photo ? (
                  <div style={{ position: 'relative', width: 58 }}>
                    <img src={p.photo.preview} alt="" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid var(--stroke-1)' }} />
                    <button onClick={() => clearPersonPhoto(i)}
                      style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 8, cursor: 'pointer', lineHeight: '16px', textAlign: 'center', padding: 0 }}>x</button>
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
                <input className="ci-input" style={{ fontSize: 12 }} value={p.desc} onChange={e => setPersonDesc(i, e.target.value)}
                  placeholder="Describe appearance -- e.g. man in 30s, brown hair, glasses" />
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
      <BB mood={mood} title="Text on thumbnail" desc="Optional -- leave blank to skip">
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
                {window.getKey?.() && refState === 'idle' && (
                  <button className="ci-copybtn" style={{ height: 28, fontSize: 11.5 }} onClick={analyzeRef}>Detect style</button>
                )}
                {refState === 'loading' && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Detecting...</span>}
                {refState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A' }}>Style detected</span>}
                {refState === 'error' && <span style={{ fontSize: 12, color: '#f5788c' }}>Detection failed</span>}
              </div>
              {refAnalysis && <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.6, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 10 }}>{refAnalysis}</div>}
              {hasBrand && <BTg on={refOverride} onChange={setRefOverride} mood={mood}>Override reference colours with my brand colours</BTg>}
              {!window.getKey?.() && <div style={{ fontSize: 11.5, color: 'var(--text-5)', marginTop: 6 }}>Add a Claude API key in Settings to auto-detect style.</div>}
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
        <window.GlowButton mood={mood} size="lg" onClick={buildPrompt} style={{ width: '100%' }}>
          Build my prompt
        </window.GlowButton>
      </div>

      {built && prompt && (
        <div id="builder-output" style={{ marginTop: 20 }}>

          {/* Generate in ChatGPT or Gemini */}
          <div style={{ padding: '18px 18px', borderRadius: 14, background: `linear-gradient(135deg, ${m.orbB}24, var(--surface-1))`, border: `1.5px solid ${m.accentGlow}` }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-1)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>Generate it in ChatGPT or Gemini</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.55 }}>
              These edit your real face accurately. {(photoPeople.length > 0 || refImg) ? 'Copy each photo below, open a tool, paste the photo(s), then the prompt is already there.' : 'Open a tool -- the prompt is copied and pre-filled -- then press enter.'}
            </div>
            {(photoPeople.length > 0 || refImg) && (
              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 11, background: 'rgba(0,0,0,0.22)', border: '1px solid var(--stroke-1)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OUTPUT_TOOLS.map(tool => (
                <div key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, background: 'rgba(0,0,0,0.18)', border: '1px solid var(--stroke-1)' }}>
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

        </div>
      )}
    </div>
  );
}
window.BuilderTab = BuilderTab;

