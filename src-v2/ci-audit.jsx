// ContentIntel — Channel Audit

const AUDIT_SYSTEM = [
  "You are ContentIntel's channel strategist. Audit a YouTube channel comprehensively based on its video titles and give blunt, specific, actionable feedback.",
  "LANGUAGE LAW: match the language of the submitted titles.",
  "Evaluate across these dimensions (score each 0-100):",
  "• Title CTR Potential — are titles curiosity-driven, specific, with stakes or numbers?",
  "• Niche Consistency — does the channel have a clear focus or is it scattered?",
  "• Content Gap Awareness — are they missing obvious high-traffic angles for this niche?",
  "• Audience Targeting — do titles speak to a specific person or feel generic?",
  "• Growth Velocity Pattern — based on title progression, is the strategy improving?",
  "Be SPECIFIC. Reference exact titles from the list. Call out the best and worst performing title patterns.",
  "Bottom line: the single most impactful change they should make this week.",
  "Sections required: 1) Strengths — what's working (checklist), 2) Critical issues (issues list with level+fix), 3) Title rewrites — rewrite the 3 weakest titles (copy blocks), 4) 30-day action plan (kv rows: week 1/2/3/4 + action).",
].join("\n");

function AuditTab({ onOpenKey }) {
  const mood = 'lime';
  const m = MOODS[mood] || MOODS.burgundy;
  const [channel, setChannel] = React.useState('');
  const [about, setAbout] = React.useState('');
  const [titles, setTitles] = React.useState('');

  const { state, report, usage, err, run, reset } = useAnalysis('audit');
  const loading = state === 'loading';
  const estIn = estTokens(AUDIT_SYSTEM, channel, about, titles);

  const titleCount = titles.trim()
    ? titles.trim().split('\n').filter(l => l.trim()).length
    : 0;

  function generate() {
    if (!titles.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    run({
      system: AUDIT_SYSTEM + (profileCtx ? '\n\nCreator context:\n' + profileCtx : ''),
      userText: [
        channel.trim() ? `Channel: ${channel.trim()}` : '',
        about.trim() ? `Niche / About: ${about.trim()}` : '',
        `Recent video titles (${titleCount}):\n${titles.trim()}`,
      ].filter(Boolean).join('\n\n'),
      maxTokens: 2800,
    });
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Channel Audit</Eyebrow>
        <h2 className="ci-h2">Full Channel Health Check</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Paste your recent video titles — get a scored audit of your title strategy, niche clarity, content gaps, and a clear 30-day action plan.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Channel name</span>
              <input className="ci-input" placeholder="e.g. @YourChannel" value={channel} onChange={e => { setChannel(e.target.value); reset(); }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Niche / Topic</span>
              <input className="ci-input" placeholder="e.g. Personal finance for millennials" value={about} onChange={e => { setAbout(e.target.value); reset(); }} />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Your video titles * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— paste 10–20 for the most accurate audit</span>
            </span>
            <textarea className="ci-input" rows={10}
              placeholder={"One title per line:\n\nI Invested ₹50,000 in Index Funds — Here's What Happened\nWhy Your SIP Is Not Working (Fix This Now)\n5 Money Mistakes I Made in My 20s\nBest Mutual Funds to Buy in 2025 (Honest Review)\n..."}
              value={titles} onChange={e => { setTitles(e.target.value); reset(); }}
              style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
            {titleCount > 0 && (
              <span style={{ fontSize: 11, color: titleCount >= 10 ? '#8FD86A' : '#F0C85A', textAlign: 'right' }}>
                {titleCount} title{titleCount !== 1 ? 's' : ''} {titleCount < 10 ? '— add more for a better audit' : '— good sample size'}
              </span>
            )}
          </label>
        </div>
        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Audit my channel" loading={loading}
            estIn={estIn} estOut={2200} onClick={generate}
            disabled={!titles.trim()} disabledHint="Paste your video titles first" />
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
window.AuditTab = AuditTab;
