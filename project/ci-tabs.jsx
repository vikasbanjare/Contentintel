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
    const data = String(url).split(',')[1] || '';
    cb({ mime: file.type || 'image/png', data, preview: url, name: file.name });
  };
  reader.readAsDataURL(file);
}

function ImageDrop({ image, onPick, label }) {
  const id = React.useRef('drop-' + Math.random().toString(36).slice(2, 7)).current;
  return (
    <label htmlFor={id} className="ci-drop" style={{ minHeight: 150, flexDirection: 'column', gap: 8, overflow: 'hidden', padding: image ? 0 : 14 }}>
      <input id={id} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => readImage(e.target.files[0], onPick)} />
      {image
        ? <img src={image.preview} alt="thumbnail preview" style={{ width: '100%', height: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 11 }} />
        : <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>
            <span>{label}</span>
          </>}
    </label>
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
function chatgptPrompt(base, hasImage, strict, guidance) {
  const head = hasImage
    ? `Edit the attached YouTube thumbnail into an improved 16:9 version. ${strict ? 'KEEP the same person(s), the exact text, fonts and overall palette -- change ONLY what I describe below.' : 'A bolder redesign is fine, but keep the same person(s), topic and exact text.'}`
    : `Create a bold, high click-through 16:9 YouTube thumbnail.`;
  return `${head}\n\n${(base || '').trim()}${guidance ? '\n\n' + guidance : ''}`;
}
// Image generation is a handoff: copy the prompt + open ChatGPT or Gemini in a
// new tab (window.openInChatGPT / window.openInGemini). The user pastes their
// photo there. No in-app generator -- the free ones were unreliable.

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
  const { state, report, usage, err, run } = window.useAnalysis('thumbnail');

  // Layout + colour options come straight from the research design library (single source of truth).
  const TLib = window.getResearch('thumbnail') || {};
  const layoutOpts = ['Auto-detect', ...((TLib.layouts || []).map(x => x.name))];
  const schemeOpts = ['Auto-detect', ...((TLib.colorSchemes || []).map(x => x.name))];
  const nicheOpts = ['Auto-detect', ...((window.nicheNames && window.nicheNames('thumbnail')) || []), 'None (universal)'];

  const hasVision = !!window.getKey(); // image vision only works with an API key; the free Claude AI is text-only
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
  const userText = (compare
    ? head +
      Array.from({ length: count }, (_, i) => `THUMBNAIL ${LBL[i]} (= Image ${i + 1}): ${descsAll[i].trim() || `(see attached Image ${i + 1})`}`).join('\n') + '\n\n' +
      `Compare these ${count} thumbnails for the SAME video and declare a single winner. Fill the "winner" field with pick = A, B${count === 3 ? ' or C' : ''}; rank them and give the one specific reason it wins.`
    : head +
      `THUMBNAIL: ${descA.trim() || '(judge from the attached image)'}\n\n` +
      `Judge whether this thumbnail will earn the click.`) + guidanceBlock;
  // Vision works for single AND multi-image (A/B/C) when a key is present.
  const imgs = hasVision ? (compare ? imgsAll.slice(0, count).filter(Boolean) : (imgA ? [imgA] : [])) : [];
  // Ask for 3 ranked, ready-to-generate upgrade prompts (basic -> mild -> bold).
  const upgradeAsk = compare ? '' :
    '\n\nALSO: end the report with a "copy" section titled "3 ways to upgrade this thumbnail" containing EXACTLY 3 blocks, each a complete, ready-to-paste image prompt for ChatGPT/Gemini that keeps the same person, topic and exact text:\n' +
    '- block 1 label "1 - Basic fix (quickest)": the smallest change with the biggest payoff.\n' +
    '- block 2 label "2 - Mild redesign (medium effort)": a moderate reworking of layout/contrast/elements.\n' +
    '- block 3 label "3 - Full redesign (boldest)": a bold, scroll-stopping reimagining.';
  // Niche routing + edit mode are baked into the system prompt (one source of truth).
  // compactPlaybook trims the playbook when auto-detecting -> fewer input tokens.
  const system = window.buildSystem('thumbnail', { niche: nicheSel, relax: !strict, compactPlaybook: true });
  const fullUserText = userText + upgradeAsk;
  const estIn = window.estTokens(system, fullUserText) + imgs.length * 1400;
  // Generate mode: describe-from-scratch prompt (no analysis, no tokens).
  const [genPrompt, setGenPrompt] = React.useState('');
  function check() { run({ userText: fullUserText, images: imgs, maxTokens: count === 3 ? 5200 : count === 2 ? 4200 : 3200, system }); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Thumbnail studio" title={mode === 'Generate' ? 'Generate a thumbnail' : 'Check your thumbnail'}
        sub={mode === 'Generate' ? 'Describe what you want (and optionally upload one to remix) -- generate straight away, no analysis.' : "Upload your thumbnail. We'll check if it'll get clicks -- based on what actually works, not how pretty it looks."} />

      <div style={{ marginBottom: 16 }}>
        <TCG label="Mode" options={['Check', 'Generate']} value={mode} onChange={setMode} />
      </div>

      {mode === 'Generate' && (
        <TB mood={mood}>
          <label className="ci-label">Upload a thumbnail to remix <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>-- optional; attach it in ChatGPT to edit it</span></label>
          <ImageDrop image={imgA} onPick={setImgA} label="Drop an image -- JPG or PNG (optional)" />
          <label className="ci-label" style={{ marginTop: 16 }}>Describe the thumbnail you want</label>
          <textarea className="ci-textarea" style={{ minHeight: 90 }} value={genPrompt} onChange={e => setGenPrompt(e.target.value)}
            placeholder="e.g. 'Shocked founder on the right, huge yellow ₹500 Cr on the left, dark navy background with an upward green graph'" />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            <window.GlowButton mood={mood} size="lg" onClick={() => window.openInChatGPT(chatgptPrompt(genPrompt.trim() || 'A bold, high click-through YouTube thumbnail.', !!imgA, strict, guidance))}>🎨 Generate in ChatGPT →</window.GlowButton>
            <button className="ci-copybtn" style={{ height: 48, padding: '0 16px' }} onClick={() => window.openInGemini(chatgptPrompt(genPrompt.trim() || 'A bold, high click-through YouTube thumbnail.', !!imgA, strict, guidance))}>✨ Open in Gemini</button>
            <button className="ci-copybtn" style={{ height: 48, padding: '0 16px' }} onClick={() => window.copyText(chatgptPrompt(genPrompt.trim() || 'A bold, high click-through YouTube thumbnail.', !!imgA, strict, guidance))}>⧉ Copy prompt</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 10, lineHeight: 1.5 }}>
            Opens ChatGPT or Gemini with your prompt (also copied). There: <b>attach your thumbnail</b> (drag it in), then press enter -- image generation runs on your own plan.
          </div>
        </TB>
      )}

      {mode === 'Check' && (<>
      <TB mood={mood}>
        <div style={{ marginBottom: 14 }}>
          <TCG label="Test" options={['Single', 'A/B', 'A/B/C']} value={cmpMode} onChange={setCmpMode} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 12 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>
              {compare && <div style={{ fontSize: 12, fontWeight: 700, color: m.accentFrom, marginBottom: 6, letterSpacing: '.04em' }}>{LBL[i]}</div>}
              <ImageDrop image={imgsAll[i]} onPick={setImgs[i]} label={i === 0 ? 'Drop your image -- JPG or PNG' : `Drop image ${LBL[i]}`} />
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

        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label={count === 3 ? 'Compare A / B / C' : count === 2 ? 'Compare A / B' : 'Check my thumbnail'} /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={4} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div>
          <window.UsageBadge usage={usage} />
          <window.ReportView report={report} mood={mood} />
          {!compare && imgA && (
            <div className="ci-block" style={{ marginTop: 14, background: `linear-gradient(135deg, ${m.orbB}44, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)' }}>🎨 Generate the improved thumbnail</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4, marginBottom: 12 }}>Takes the grounded fix above into ChatGPT or Gemini -- attach your thumbnail there and it edits it.</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <window.GlowButton mood={mood} onClick={() => window.openInChatGPT(chatgptPrompt(window.regenPromptFromReport(report) || '', true, strict, guidance))}>🎨 Generate in ChatGPT →</window.GlowButton>
                <button className="ci-copybtn" style={{ height: 38, padding: '0 14px' }} onClick={() => window.openInGemini(chatgptPrompt(window.regenPromptFromReport(report) || '', true, strict, guidance))}>✨ Open in Gemini</button>
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

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
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
  const { state, report, usage, err, run } = window.useAnalysis('title');
  const chars = title.length;

  const userText =
    `Language: ${lang === 'Auto-detect' ? '(detect from the title)' : lang}\nPlatform: ${platform}\nAudience: ${aud}\n` +
    (about.trim() ? `Video is about: ${about}\n` : '') +
    `TITLE${compare && titleB.trim() ? ' A' : ''}: ${title}` +
    (compare && titleB.trim()
      ? `\nTITLE B: ${titleB}\n\nCompare title A and title B and declare the winner (fill the "winner" field). Then provide 10 alternative titles, each labelled with its angle.`
      : `\n\nEvaluate this title and provide 10 alternative titles, each labelled with its angle.`);
  const estIn = window.estTokens(window.buildSystem('title'), userText);
  function check() { run({ userText, maxTokens: 4000 }); }

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
        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label="Check my title" /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div><window.UsageBadge usage={usage} /><window.ReportView report={report} mood={mood} /></div>
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
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)', fontSize: 12.5, color: 'var(--text-2)' }}>
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
  const [goal, setGoal] = React.useState('Conversions');
  const { state, report, usage, err, run } = window.useAnalysis('ads');

  const META_PRIMARY = 125, META_HEAD = 27;
  const pOver = primary.length > META_PRIMARY, hOver = headline.length > META_HEAD;

  const userText = `Platform: ${platform}\nObjective: ${goal}\nCTA button: ${cta}\n\n` +
    `Primary/main text (${primary.length} chars): ${primary}\nHeadline (${headline.length} chars): ${headline}\n\n` +
    `Check character limits, "See More" truncation, scroll-stopping power and compliance. Show what people actually see, and give stronger rewrites.`;
  const estIn = window.estTokens(window.buildSystem('ads'), userText);
  function check() { run({ userText, maxTokens: 3000 }); }

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
              <input className="ci-input" placeholder="Optional supporting line..." />
            </div>
            <TCG label="CTA button" options={['Learn More', 'Sign Up', 'Shop Now', 'Download', 'Apply Now']} value={cta} onChange={setCta} />
            <TCG label="Goal" options={['Traffic', 'Leads', 'Conversions', 'Awareness']} value={goal} onChange={setGoal} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="ci-label">Headlines (one per line -- max 30 characters each)</label><textarea className="ci-textarea" style={{ minHeight: 90 }} defaultValue={'Atlas Mach Running Shoe\nLasts 800km Guaranteed\nFree Returns, 30 Days'} /></div>
            <div><label className="ci-label">Descriptions (one per line -- max 90 characters each)</label><textarea className="ci-textarea" style={{ minHeight: 70 }} defaultValue={'The $90 trainer that beat the $200 ones in a real half-marathon. Try risk-free.'} /></div>
            <div><label className="ci-label">Keywords you're targeting</label><input className="ci-input" defaultValue="running shoes, marathon trainer, cushioned running shoe" /></div>
          </div>
        )}

        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label="Check my ad" /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div><window.UsageBadge usage={usage} /><window.ReportView report={report} mood={mood} /></div>
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
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 5 }}>ON FEED · BEFORE "SEE MORE"</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)' }}>"{primary.slice(0, META_PRIMARY)}{primary.length > META_PRIMARY ? '... See More' : ''}"</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)' }}>
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
function HistoryTab() {
  const mood = 'burgundy';
  const m = TM[mood];
  const [filter, setFilter] = React.useState('All');
  const [items, setItems] = React.useState(() => (window.loadHistory ? window.loadHistory() : []));
  const TYPE_LABEL = { script: 'Script', thumbnail: 'Thumbnail', title: 'Title', ads: 'Ads' };
  const tmoodOf = { script: 'navy', thumbnail: 'ember', title: 'cyan', ads: 'violet' };
  const filtered = filter === 'All' ? items : items.filter(i => TYPE_LABEL[i.type] === filter.replace(/s$/, ''));
  function clearAll() { window.clearHistory && window.clearHistory(); setItems([]); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <Eyebrow mood={mood} glow>History</Eyebrow>
          <h2 className="ci-h2">Past checks</h2>
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
              return (
                <div key={i} className="ci-block" style={{ padding: 16, display: 'grid', gridTemplateColumns: '120px 1fr 90px 50px', gap: 16, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${im.accentFrom}, ${im.accentTo})`, display: 'grid', placeItems: 'center', color: '#07090E' }}><CITabIcon name={it.type === 'script' ? 'script' : it.type === 'thumbnail' ? 'thumb' : it.type === 'title' ? 'title' : 'ads'} /></span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{TYPE_LABEL[it.type] || it.type}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{timeAgo(it.t)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span className={'ci-dot ' + lvl} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: lvl === 'green' ? '#8FD86A' : lvl === 'yellow' ? '#F0C85A' : '#F06A7E' }}>{it.score != null ? it.score : '--'}</span>
                  </div>
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

