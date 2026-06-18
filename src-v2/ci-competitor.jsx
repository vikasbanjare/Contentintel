// ContentIntel — Competitor Breakdown

const COMPETITOR_SYSTEM = [
  "You are ContentIntel's competitive intelligence analyst. Break down a competitor's video with tactical precision — what's working, why it works, and how to beat it.",
  "LANGUAGE LAW: match the language of the submitted title.",
  "Analyse:",
  "• Title hook: what psychological trigger it uses (curiosity gap, social proof, fear, aspiration, numbers)",
  "• Thumbnail strategy: what visual pattern they used (if image provided)",
  "• Audience targeting: exactly who this was made for and why it resonates",
  "• Content gaps they left open: what angle they missed that YOU could own",
  "• Replication opportunities: what you can borrow ethically and improve on",
  "Score dimensions 0-100: Title Hook Strength, Audience Targeting Clarity, Content Gap Score (higher = more opportunity for you), Overall Threat Level.",
  "Bottom line: the single highest-leverage move to outperform this specific video.",
  "Sections: What's working (checklist), How to outperform (copy blocks — write 3 alternative titles that beat theirs + a thumbnail concept that beats theirs), Content gaps to exploit (kv list with gap + your angle).",
].join("\n");

function CompetitorTab({ onOpenKey }) {
  const mood = 'navy';
  const m = MOODS[mood] || MOODS.burgundy;
  const [title, setTitle] = React.useState('');
  const [channel, setChannel] = React.useState('');
  const [recent, setRecent] = React.useState('');
  const [thumb, setThumb] = React.useState(null);
  const fileRef = React.useRef(null);

  const { state, report, usage, err, run, reset } = useAnalysis('competitor');
  const loading = state === 'loading';
  const estIn = estTokens(COMPETITOR_SYSTEM, title, channel, recent);

  function readThumb(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const img = new Image();
      img.onload = () => {
        const MAX = 1024, scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const out = c.toDataURL('image/jpeg', 0.85);
        setThumb({ mime: 'image/jpeg', data: out.split(',')[1] || '', preview: out });
      };
      img.onerror = () => setThumb({ mime: file.type || 'image/jpeg', data: url.split(',')[1] || '', preview: url });
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function generate() {
    if (!title.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    run({
      system: COMPETITOR_SYSTEM + (profileCtx ? '\n\nYour channel context (for tailored counter-strategy):\n' + profileCtx : ''),
      userText: [
        `Competitor title: ${title.trim()}`,
        channel.trim() ? `Competitor channel: ${channel.trim()}` : '',
        recent.trim() ? `Their other recent titles:\n${recent.trim()}` : '',
        thumb ? '(Their thumbnail image is attached — analyse it visually.)' : '',
      ].filter(Boolean).join('\n'),
      images: thumb ? [thumb] : [],
      maxTokens: 2400,
    });
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Competitor Analysis</Eyebrow>
        <h2 className="ci-h2">Competitor Breakdown</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Paste a competitor's title and thumbnail — get a tactical breakdown of what they did right, 3 titles that beat theirs, and the gaps you can own.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Competitor's video title *</span>
            <input className="ci-input" style={{ fontSize: 15 }}
              placeholder="e.g. I Made ₹10 Lakhs From YouTube in 2024 — Here's Exactly How"
              value={title} onChange={e => { setTitle(e.target.value); reset(); }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Their channel</span>
              <input className="ci-input" placeholder="e.g. @CompetitorName" value={channel} onChange={e => { setChannel(e.target.value); reset(); }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Their thumbnail <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { readThumb(e.target.files[0]); reset(); }} />
              {thumb
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                    <img src={thumb.preview} alt="thumbnail"
                      style={{ width: 80, height: 45, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--stroke-1)' }} />
                    <button className="ci-copybtn" style={{ height: 30 }}
                      onClick={() => { setThumb(null); reset(); }}>Remove</button>
                  </div>
                : <button type="button" className="ci-drop"
                    style={{ minHeight: 42, padding: '8px 14px', width: 'auto', border: '1px solid var(--stroke-1)', marginTop: 2 }}
                    onClick={() => fileRef.current && fileRef.current.click()}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10.5V3M5 6l3-3 3 3M3 11.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>
                    Upload their thumbnail
                  </button>}
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Their other recent titles <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — one per line, reveals their strategy)</span>
            </span>
            <textarea className="ci-input" rows={4}
              placeholder={"I Lost ₹2 Lakh in Stocks — What I Learned\nBest Mutual Funds to Buy in 2025\nWhy 90% of Indians Never Get Rich"}
              value={recent} onChange={e => { setRecent(e.target.value); reset(); }}
              style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
          </label>
        </div>
        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Break down competitor" loading={loading}
            estIn={estIn} estOut={1800} onClick={generate}
            disabled={!title.trim()} disabledHint="Enter a competitor title first" />
        </div>
      </div>

      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}
      {state === 'done' && report && (
        <div style={{ marginTop: 24 }}>
          <ReportView report={report} mood={mood} />
          {usage && <UsageBadge usage={usage} />}
        </div>
      )}
    </div>
  );
}
window.CompetitorTab = CompetitorTab;
