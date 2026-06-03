// ContentIntel — Thumbnail / Title / Ads / History tabs

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

// ── THUMBNAIL ────────────────────────────────────────────────────────────────
function ThumbnailTab({ onOpenKey }) {
  const mood = 'ember';
  const m = TM[mood];
  const [compare, setCompare] = React.useState(false);
  const [title, setTitle] = React.useState('How I Learned to Cook in 30 Days');
  const [kind, setKind] = React.useState('Lifestyle');
  const [imgA, setImgA] = React.useState(null);
  const [imgB, setImgB] = React.useState(null);
  const [descA, setDescA] = React.useState('');
  const [descB, setDescB] = React.useState('');
  const { state, report, usage, err, run } = window.useAnalysis('thumbnail');

  const hasVision = !!window.getKey(); // image vision only works with an API key; the free Claude AI is text-only
  const userText = compare
    ? `Video title: ${title || '(none given)'}\nContent type: ${kind}\n\n` +
      `THUMBNAIL A: ${descA.trim() || '(see attached image A)'}\n` +
      `THUMBNAIL B: ${descB.trim() || '(see attached image B)'}\n\n` +
      `Compare thumbnail A and thumbnail B for the same video and declare the winner (fill the "winner" field).`
    : `Video title: ${title || '(none given)'}\nContent type: ${kind}\n\n` +
      `THUMBNAIL: ${descA.trim() || '(judge from the attached image)'}\n\n` +
      `Judge whether this thumbnail will earn the click.`;
  const estIn = window.estTokens(window.buildSystem('thumbnail'), userText) + (hasVision && imgA ? 1400 : 0);
  // Vision only when a key is present AND we're not comparing (single-image vision path).
  function check() { run({ userText, image: (hasVision && !compare ? imgA : null), maxTokens: 3000 }); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Thumbnail check" title="Check your thumbnail"
        sub="Upload your thumbnail. We'll check if it'll get clicks — based on what actually works, not how pretty it looks." />

      <TB mood={mood}>
        <div style={{ marginBottom: 14 }}><TTg on={compare} onChange={setCompare} mood={mood}>Compare two thumbnails</TTg></div>
        <div style={{ display: 'grid', gridTemplateColumns: compare ? '1fr 1fr' : '1fr', gap: 12 }}>
          <ImageDrop image={imgA} onPick={setImgA} label="Drop your image here — any size, JPG or PNG" />
          {compare && <ImageDrop image={imgB} onPick={setImgB} label="Drop the second image" />}
        </div>

        {!hasVision && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10, padding: '8px 11px', borderRadius: 9, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.2)', lineHeight: 1.5 }}>
            The free AI inside Claude can't see images — so <b>describe each thumbnail below</b> and that's what gets reviewed. (Add an API key in Settings for real image vision.)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: compare ? '1fr 1fr' : '1fr', gap: 12, marginTop: 14 }}>
          <div>
            {compare && <label className="ci-label">Describe thumbnail A</label>}
            {!compare && <label className="ci-label">Describe your thumbnail (text, faces, colors, layout)</label>}
            <textarea className="ci-textarea" style={{ minHeight: 72 }} value={descA} onChange={e => setDescA(e.target.value)}
              placeholder="e.g. Close-up of a shocked face, big yellow text 'I QUIT', dark kitchen background, a burnt pan…" />
          </div>
          {compare && (
            <div>
              <label className="ci-label">Describe thumbnail B</label>
              <textarea className="ci-textarea" style={{ minHeight: 72 }} value={descB} onChange={e => setDescB(e.target.value)}
                placeholder="Describe the second thumbnail the same way…" />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="ci-label">What's the video title? (helps us check if thumb + title work together)</label>
          <input className="ci-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Paste the video title…" />
        </div>
        <div style={{ marginTop: 14 }}>
          <TCG label="Content" options={['Education', 'Entertainment', 'Tech', 'Lifestyle', 'Food', 'Gaming', 'Fitness', 'Finance', 'Other']} value={kind} onChange={setKind} />
        </div>
        <div style={{ marginTop: 16 }}><window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label={compare ? 'Compare thumbnails' : 'Check my thumbnail'} /></div>
      </TB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><TLR rows={4} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div><window.UsageBadge usage={usage} /><window.ReportView report={report} mood={mood} /></div>
      )}

      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> <b>Sample report.</b> Add your API key and upload an image to analyze your real thumbnail → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>
          <TTL level="yellow" title="Decent, but missing key elements"
            text="Good structure and colors — but no human face is hurting your click-through rate." />

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
            <TB title="Quick scores" desc="Overall: 72 — good structure, but no face" mood={mood}>
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
            <TIs level="red">Add your face (or any face showing surprise) — this alone can boost clicks 20–30%.</TIs>
            <TIs level="yellow">Put a crown or trophy on the winning model — teases the answer without revealing it.</TIs>
            <TIs level="yellow">Make the model names bigger — they disappear on phone screens.</TIs>
          </TB>

          <TB title="AI prompts for a better thumbnail" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TCB text="Young Indian man, shocked expression, holding phone, 5 glowing AI logos floating behind him, dark tech background, neon lighting, 16:9" label="Copy prompt" />
              <TCB text="Split-screen battle — 3 AI logos with red X vs 2 with gold crown, dark background, VS text in center, dramatic lighting" label="Copy prompt" />
            </div>
          </TB>

          <TB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 10 }}>
              Good thumbnail for tech — clear topic, strong contrast, real curiosity. The biggest weakness is no human face. Add a reaction face and a "winner" hint like a crown — <span style={{ color: m.accentFrom, fontWeight: 600 }}>that'll make a big difference without cluttering the design.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="ci-copybtn" style={{ height: 34 }}>📋 Copy report</button>
              <button className="ci-copybtn" style={{ height: 34 }}>↓ Download</button>
            </div>
          </TB>
        </div>
      )}
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
    ['Controversial', 'Your SIP Is Losing Money — Here Is Why'],
    ['Social proof', '5 SIP Mistakes 90% Beginners Make'],
    ['Aspirational', 'Avoid These 5 Mistakes, Build ₹1 Crore With SIP'],
  ];

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <TWH mood={mood} eyebrow="Title check" title="Check your title"
        sub="Test your video title. We'll check if it's click-worthy, search-friendly, and works on mobile." />

      <TB mood={mood}>
        <div style={{ marginBottom: 14 }}><TTg on={compare} onChange={setCompare} mood={mood}>Compare two titles</TTg></div>
        <input className="ci-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Type your title here…" style={{ fontSize: 16 }} />
        {compare && <input className="ci-input" value={titleB} onChange={e => setTitleB(e.target.value)} placeholder="Second title…" style={{ marginTop: 10, fontSize: 16 }} />}
        <div style={{ marginTop: 14 }}>
          <label className="ci-label">What's the video about? (optional — helps us judge if title matches content)</label>
          <input className="ci-input" value={about} onChange={e => setAbout(e.target.value)} placeholder="One line about the video…" />
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
            <span className={'ci-dot ' + (chars <= 60 ? 'green' : 'yellow')} />{chars <= 60 ? 'Good — under 60' : 'Long — may truncate'}
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
          <TTL level="yellow" title="Close — a few tweaks will lift it" text="Clear and readable, but the hook word and keyword position need work." />

          <TB title="Scores" mood={mood}>
            <TSI mood={mood} name="Click chance" score={58} why="Doesn't create enough urgency to click. Needs a stronger hook word up front." />
            <TSI mood={mood} name="Curiosity" score={72} why="Good list format, but the payoff feels predictable. A number or stake raises it." />
            <TSI mood={mood} name="Clarity" score={81} why="Clear what the video is about. No confusion." />
          </TB>

          <TB title="Title breakdown" mood={mood}>
            {[
              ['Characters', `${chars} — good, under 60`, 'green'],
              ['Power words', '2 found — decent, 3+ is ideal', 'yellow'],
              ['Numbers', 'Yes — numbers boost clicks 15–25%', 'green'],
              ['Brackets', 'None — adding [2026] or [Step-by-Step] can help', 'yellow'],
              ['Keyword position', '"SIP" appears at word 2 — good, keep it in the first 3 words', 'green'],
            ].map(([k, v, lvl]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '20px 130px 1fr', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--stroke-1)', fontSize: 13 }}>
                <span className={'ci-dot ' + lvl} />
                <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{k}</span>
                <span style={{ color: 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)', fontSize: 12.5, color: 'var(--text-2)' }}>
              On mobile, viewers see: <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>"{title.slice(0, 40)}{title.length > 40 ? '…' : ''}"</span>
            </div>
          </TB>

          <TB title="10 alternative titles" desc="Different angles — copy whichever fits" mood={mood}>
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
  const [primary, setPrimary] = React.useState('Tired of trainers that fall apart in 3 months? The Atlas Mach lasts 800km — guaranteed, or your money back.');
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
              <input className="ci-input" placeholder="Optional supporting line…" />
            </div>
            <TCG label="CTA button" options={['Learn More', 'Sign Up', 'Shop Now', 'Download', 'Apply Now']} value={cta} onChange={setCta} />
            <TCG label="Goal" options={['Traffic', 'Leads', 'Conversions', 'Awareness']} value={goal} onChange={setGoal} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="ci-label">Headlines (one per line — max 30 characters each)</label><textarea className="ci-textarea" style={{ minHeight: 90 }} defaultValue={'Atlas Mach Running Shoe\nLasts 800km Guaranteed\nFree Returns, 30 Days'} /></div>
            <div><label className="ci-label">Descriptions (one per line — max 90 characters each)</label><textarea className="ci-textarea" style={{ minHeight: 70 }} defaultValue={'The $90 trainer that beat the $200 ones in a real half-marathon. Try risk-free.'} /></div>
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
          <TTL level="red" title="Not ready — your hook is hidden" text="Your strongest line falls after the 'See More' cutoff. Most people won't read it." />

          <TB title="Scores" mood={mood}>
            <TSI mood={mood} name="Scroll-stopping power" score={45} why="Your opening line blends into the feed. The benefit is buried — lead with it." />
            <TSI mood={mood} name="Copy quality" score={62} why="Message is clear but doesn't create urgency." />
            <TSI mood={mood} name="CTA fit" score={78} why={`"${cta}" matches your ${goal.toLowerCase()} objective well.`} />
          </TB>

          <TB title="What people actually see" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 5 }}>ON FEED · BEFORE "SEE MORE"</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)' }}>"{primary.slice(0, META_PRIMARY)}{primary.length > META_PRIMARY ? '… See More' : ''}"</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke-1)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 5 }}>HEADLINE ON MOBILE</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 600 }}>"{headline.slice(0, META_HEAD)}{headline.length > META_HEAD ? '…' : ''}"</div>
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
              <div><div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Stronger main text</div><TCB text="Your trainers shouldn't die at 3 months. The Atlas Mach lasts 800km — guaranteed, or your money back. Runners are switching for a reason." label="Copy" /></div>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Stronger headline</div><TCB text="800km or Money Back" label="Copy" /></div>
            </div>
          </TB>

          <TB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 10 }}>Your offer is strong but it's hidden. Move the guarantee to your first line and harden the headline — <span style={{ color: m.accentFrom, fontWeight: 600 }}>that's the difference between a scroll and a click.</span></div>
          </TB>
        </div>
      )}
    </div>
  );
}
window.AdsTab = AdsTab;

// ── HISTORY ──────────────────────────────────────────────────────────────────
function HistoryTab() {
  const mood = 'burgundy';
  const m = TM[mood];
  const [filter, setFilter] = React.useState('All');
  const items = [
    { type: 'Script', tmood: 'navy', date: '2h ago', preview: '"Kya aapko pata hai ki 90% log SIP mein…"', verdict: 'yellow', score: 71 },
    { type: 'Thumbnail', tmood: 'ember', date: '5h ago', preview: 'Which AI Wins 2026 — 5 logos, no face', verdict: 'yellow', score: 72 },
    { type: 'Title', tmood: 'cyan', date: 'Yesterday', preview: '"5 SIP Mistakes Beginners Make"', verdict: 'yellow', score: 70 },
    { type: 'Ads', tmood: 'violet', date: 'Yesterday', preview: 'Atlas Mach — "Tired of trainers that…"', verdict: 'red', score: 52 },
    { type: 'Script', tmood: 'navy', date: '2d ago', preview: '"Atlas Mach broke me — here\'s why"', verdict: 'green', score: 88 },
    { type: 'Title', tmood: 'cyan', date: '3d ago', preview: '"$90 Shoe Beat My $200 Trainer"', verdict: 'green', score: 91 },
  ];
  const filtered = filter === 'All' ? items : items.filter(i => i.type === filter.replace(/s$/, '') || i.type === filter);

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <Eyebrow mood={mood} glow>History</Eyebrow>
          <h2 className="ci-h2">Past checks</h2>
        </div>
        <button className="ci-copybtn" style={{ height: 34 }}>Clear all</button>
      </div>

      <div className="ci-chiprow" style={{ marginBottom: 16 }}>
        {['All', 'Scripts', 'Thumbnails', 'Titles', 'Ads'].map(f => (
          <button key={f} className={'pill' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)} style={{ height: 30, fontSize: 12.5 }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((it, i) => {
          const im = TM[it.tmood];
          return (
            <div key={i} className="ci-block lift" style={{ padding: 16, display: 'grid', gridTemplateColumns: '110px 1fr 80px 44px 30px', gap: 16, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${im.accentFrom}, ${im.accentTo})`, display: 'grid', placeItems: 'center', color: '#07090E' }}><CITabIcon name={it.type === 'Script' ? 'script' : it.type === 'Thumbnail' ? 'thumb' : it.type === 'Title' ? 'title' : 'ads'} /></span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{it.type}</span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.preview}</div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{it.date}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className={'ci-dot ' + it.verdict} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: it.verdict === 'green' ? '#8FD86A' : it.verdict === 'yellow' ? '#F0C85A' : '#F06A7E' }}>{it.score}</span>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.HistoryTab = HistoryTab;
