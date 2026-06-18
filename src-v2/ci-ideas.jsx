// ContentIntel — Video Idea Generator

const IDEAS_SYSTEM = [
  "You are ContentIntel's video strategist. Generate high-potential video ideas that are specific, niche-aware, and designed to perform.",
  "LANGUAGE LAW: match the language of the user's niche input.",
  "For each idea produce: a click-worthy title, the opening hook line (first 5 seconds spoken), the core angle/unique POV, a thumbnail concept, and an estimated CTR score 0-100.",
  "Vary the formats across ideas: tutorial, story/case study, controversial take, number list, challenge, myth-busting, behind-the-scenes, reaction.",
  "Be SPECIFIC. No generic advice. Every title must have stakes, numbers, or a clear curiosity gap.",
  "Output only the submit_report tool. Use sections of type 'copy' — one per idea, titled 'Idea N — [angle]'. Each section has blocks: Title, Hook, Angle, Thumbnail concept.",
  "In the verdict.text summarise the top 3 angles that will perform best for this niche.",
  "Set overall to the average predicted CTR score.",
  "Set verdict.level based on idea quality: green=strong batch, yellow=mixed, red=weak.",
  "Set verdict.title to a punchy summary like '8 high-potential ideas — 3 standouts'.",
  "Set verdict.text to which 2-3 ideas have the highest viral potential and why.",
  "Set bottomLine to the single idea you'd film first and why.",
  "Add 3 scores: Niche Relevance / Format Variety / Average CTR Potential — each 0-100.",
].join("\n");

function IdeasTab({ onOpenKey }) {
  const mood = 'violet';
  const m = MOODS[mood] || MOODS.burgundy;
  const [niche, setNiche] = React.useState('');
  const [theme, setTheme] = React.useState('');
  const [count, setCount] = React.useState('10');

  const { state, report, usage, err, run, reset } = useAnalysis('ideas');
  const loading = state === 'loading';
  const estIn = estTokens(IDEAS_SYSTEM, niche, theme);

  const NICHES = ['Finance', 'Tech', 'Fitness', 'Food', 'Lifestyle', 'Education', 'Business', 'Gaming', 'Travel', 'Comedy'];

  function generate() {
    if (!niche.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    run({
      system: IDEAS_SYSTEM + (profileCtx ? '\n\nCreator context (tailor every idea to this):\n' + profileCtx : ''),
      userText: [
        `Niche: ${niche.trim()}`,
        theme.trim() ? `Theme / focus area: ${theme.trim()}` : '',
        `Generate ${count} video ideas.`,
      ].filter(Boolean).join('\n'),
      maxTokens: 3200,
    });
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Idea Generator</Eyebrow>
        <h2 className="ci-h2">Video Ideas</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Tell us your niche — get {count} high-potential video ideas with titles, hooks, angles, and thumbnail concepts ready to execute.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Your niche *</span>
            <input className="ci-input" placeholder="e.g. Personal finance for Indians, Fitness for busy moms, Street food Mumbai"
              value={niche} onChange={e => { setNiche(e.target.value); reset(); }} />
          </label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {NICHES.map(n => {
              const on = niche === n;
              return (
                <button key={n} onClick={() => { setNiche(n); reset(); }}
                  style={{ height: 28, padding: '0 12px', borderRadius: 999,
                    border: `1px solid ${on ? m.accentFrom : 'var(--stroke-2)'}`,
                    background: on ? m.accentFrom + '18' : 'transparent',
                    color: on ? m.accentFrom : 'var(--text-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {n}
                </button>
              );
            })}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Theme / focus <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </span>
            <input className="ci-input" placeholder="e.g. beginner mistakes, controversial takes, viral trends, how-tos"
              value={theme} onChange={e => { setTheme(e.target.value); reset(); }} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>Ideas to generate:</span>
            {['5', '10', '15'].map(n => (
              <button key={n} onClick={() => setCount(n)}
                style={{ height: 32, width: 42, borderRadius: 8,
                  border: `1px solid ${count === n ? m.accentFrom : 'var(--stroke-2)'}`,
                  background: count === n ? m.accentFrom + '18' : 'transparent',
                  color: count === n ? m.accentFrom : 'var(--text-3)',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Generate ideas" loading={loading}
            estIn={estIn} estOut={2600} onClick={generate}
            disabled={!niche.trim()} disabledHint="Enter your niche first" />
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
window.IdeasTab = IdeasTab;
