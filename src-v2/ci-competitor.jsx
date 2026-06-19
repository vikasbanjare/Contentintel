// ContentIntel — Competitor Breakdown (multi-channel)

const COMPETITOR_SYSTEM = [
  "You are ContentIntel's competitive intelligence analyst. Break down competitor channels with tactical precision.",
  "LANGUAGE LAW: match the language of the submitted titles.",
  "You will receive video data in this format: Title | Views | Likes | Comments | Duration | Age",
  "Use ALL available metrics. Identify top-performing videos and what makes them work.",
  "When multiple competitors are provided, compare them against each other AND against your channel.",
  "Analyse each competitor:",
  "• Title hook: what psychological trigger they use (curiosity gap, social proof, fear, aspiration, numbers, controversy)",
  "• Content strategy: what formats, angles and niches they consistently win in",
  "• Audience targeting: exactly who this is made for and why it resonates",
  "• Top performers: which videos get the most views and why (reference actual numbers)",
  "• Content gaps: what angles they missed that YOU could own",
  "• Replication opportunities: what to borrow ethically and improve on",
  "Score 0-100 per competitor: Title Hook Strength, Audience Targeting Clarity, Content Variety, Gap Opportunity, Overall Threat Level.",
  "Calculate average views per competitor. Identify their highest and lowest performers.",
  "Bottom line: the single highest-leverage move to outperform all competitors combined.",
  "Required sections:",
  "1. Competitive landscape — checklist of each competitor's winning patterns (with view counts)",
  "2. Top videos by competitor — copy block: each competitor's 3 highest-view videos and what made them work",
  "3. How to beat them — copy blocks: write 3 titles that beat their best + 1 thumbnail concept",
  "4. Content gaps to exploit — kv list: Gap / Your angle for each opportunity",
  "5. Title patterns to steal — copy block listing their most effective formulas you can adapt",
  "Set verdict.level to 'yellow' (moderate threat) or 'red' (high threat) based on overall competitive strength.",
  "Set verdict.title to a punchy threat assessment (e.g. 'Strong competition — 3 clear gaps to exploit').",
  "Set verdict.text to a 2-sentence summary of the biggest competitive threat and your biggest opportunity.",
].join("\n");

const EMPTY_COMPETITOR = () => ({
  id: Math.random().toString(36).slice(2),
  handle: '',
  title: '',
  recent: '',
  videoData: [],
  channelInfo: null,
  fetchState: 'idle',
  fetchErr: '',
});

function CompetitorTab({ onOpenKey }) {
  const mood = 'navy';
  const m = MOODS[mood] || MOODS.burgundy;

  const [mode, setMode] = React.useState(window.getYouTubeKey ? (window.getYouTubeKey() ? 'auto' : 'manual') : 'manual');
  const [competitors, setCompetitors] = React.useState([EMPTY_COMPETITOR()]);
  const [thumb, setThumb] = React.useState(null);
  const fileRef = React.useRef(null);

  const { state, report, usage, err, run, reset } = useAnalysis('competitor');
  const loading = state === 'loading';
  const ytKey = window.getYouTubeKey ? window.getYouTubeKey() : '';

  function updateComp(id, patch) {
    setCompetitors(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  function addCompetitor() {
    if (competitors.length >= 4) return;
    setCompetitors(prev => [...prev, EMPTY_COMPETITOR()]);
    reset();
  }

  function removeCompetitor(id) {
    if (competitors.length <= 1) return;
    setCompetitors(prev => prev.filter(c => c.id !== id));
    reset();
  }

  async function fetchChannel(comp) {
    if (!comp.handle.trim()) return;
    updateComp(comp.id, { fetchState: 'fetching', fetchErr: '', channelInfo: null, recent: '', videoData: [] });
    reset();
    try {
      const ch   = await window.fetchYTChannel(comp.handle.trim(), ytKey);
      const vids = await window.fetchYTVideos(ch.id, ytKey, 20);
      const chInfo = { name: ch.snippet.title, subs: ch.statistics.subscriberCount, videoCount: ch.statistics.videoCount };
      const recentTitles = vids.map(v => v.title).join('\n');
      updateComp(comp.id, { channelInfo: chInfo, videoData: vids, recent: recentTitles, fetchState: 'fetched' });
    } catch (e) {
      updateComp(comp.id, { fetchErr: e.message || 'Could not fetch channel data.', fetchState: 'error' });
    }
  }

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
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    const compBlocks = competitors.map((comp, idx) => {
      const label = `Competitor ${idx + 1}${comp.channelInfo ? ': ' + comp.channelInfo.name : (comp.handle.trim() ? ': ' + comp.handle.trim() : '')}`;
      const hasStats = comp.videoData.length > 0 && parseInt(comp.videoData[0]?.viewCount || 0) > 0;
      const videoText = comp.videoData.length > 0
        ? (hasStats
            ? `Recent videos with analytics (${comp.videoData.length}):\n${window.formatVideoStats(comp.videoData)}`
            : `Recent titles:\n${comp.videoData.map(v => v.title).join('\n')}`)
        : (comp.recent.trim() ? `Recent titles:\n${comp.recent.trim()}` : '');
      const subLine = comp.channelInfo ? `Subscribers: ${Number(comp.channelInfo.subs||0).toLocaleString()} | Videos: ${comp.channelInfo.videoCount}` : '';
      const titleLine = comp.title.trim() ? `Standout title: ${comp.title.trim()}` : '';
      return [label, subLine, titleLine, videoText].filter(Boolean).join('\n');
    });

    const canAnalyze = competitors.some(c => c.title.trim() || c.recent.trim() || c.videoData.length > 0);
    if (!canAnalyze) return;

    run({
      system: COMPETITOR_SYSTEM + (profileCtx ? '\n\nYour channel context (counter-strategy must be tailored to this):\n' + profileCtx : ''),
      userText: [
        `Analysing ${competitors.length} competitor${competitors.length > 1 ? 's' : ''}:`,
        compBlocks.join('\n\n---\n\n'),
        thumb ? '(Thumbnail attached — analyse visually.)' : '',
      ].filter(Boolean).join('\n\n'),
      images: thumb ? [thumb] : [],
      maxTokens: 3000,
    });
  }

  const fmt = (n) => { const v = parseInt(n || 0); return v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v); };
  const canAnalyze = competitors.some(c => c.title.trim() || c.recent.trim() || c.videoData.length > 0);

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Competitor Analysis</Eyebrow>
        <h2 className="ci-h2">Competitor Breakdown</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Compare up to 4 competitors at once — auto-fetch their channels or enter manually — and get a full tactical breakdown.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'auto', label: '⚡ Auto-fetch from YouTube' }, { id: 'manual', label: '✎ Enter manually' }].map(opt => (
            <button key={opt.id} onClick={() => { setMode(opt.id); reset(); setCompetitors([EMPTY_COMPETITOR()]); }}
              style={{ flex: 1, height: 38, borderRadius: 10, border: `1.5px solid ${mode === opt.id ? m.accentFrom : 'var(--stroke-2)'}`,
                background: mode === opt.id ? m.accentFrom + '18' : 'transparent',
                color: mode === opt.id ? m.accentFrom : 'var(--text-3)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* No YT key warning in auto mode */}
        {mode === 'auto' && !ytKey && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.3)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
            <b style={{ color: '#F0C85A' }}>YouTube API key needed</b> — add it in Settings → Platform Data tab.{' '}
            <button className="ci-copybtn" style={{ height: 28, padding: '0 10px', fontSize: 12, marginLeft: 8 }} onClick={onOpenKey}>Open Settings</button>
          </div>
        )}

        {/* Competitor cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {competitors.map((comp, idx) => (
            <div key={comp.id} style={{ padding: '16px 18px', borderRadius: 12, border: '1px solid var(--stroke-1)', background: 'var(--surface-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: m.accentFrom, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Competitor {idx + 1}
                </span>
                {competitors.length > 1 && (
                  <button onClick={() => removeCompetitor(comp.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 4 }}>
                    ✕ Remove
                  </button>
                )}
              </div>

              {mode === 'auto' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="ci-input" placeholder="@CompetitorChannel or youtube.com/@Channel"
                      value={comp.handle}
                      onChange={e => { updateComp(comp.id, { handle: e.target.value, fetchState: 'idle', channelInfo: null, recent: '' }); reset(); }}
                      onKeyDown={e => { if (e.key === 'Enter' && ytKey) fetchChannel(comp); }}
                      style={{ flex: 1 }} />
                    <GlowButton mood={mood} onClick={() => fetchChannel(comp)}
                      style={{ whiteSpace: 'nowrap', opacity: (!comp.handle.trim() || !ytKey || comp.fetchState === 'fetching') ? 0.5 : 1 }}>
                      {comp.fetchState === 'fetching' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Fetching…
                        </span>
                      ) : 'Fetch →'}
                    </GlowButton>
                  </div>
                  {comp.fetchState === 'error' && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(240,90,110,0.08)', border: '1px solid rgba(240,90,110,0.25)', fontSize: 13, color: '#F06A7E' }}>{comp.fetchErr}</div>
                  )}
                  {comp.fetchState === 'fetched' && comp.channelInfo && (
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(100,120,220,0.07)', border: '1px solid rgba(100,120,220,0.2)', fontSize: 13, color: 'var(--text-2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{comp.channelInfo.name}</span>
                      <span style={{ color: 'var(--text-4)', marginLeft: 10 }}>{fmt(comp.channelInfo.subs)} subscribers · {comp.videoData.length} videos fetched</span>
                    </div>
                  )}
                </div>
              )}

              {mode === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="ci-input" style={{ fontSize: 14 }}
                    placeholder="Competitor's best / latest title"
                    value={comp.title} onChange={e => { updateComp(comp.id, { title: e.target.value }); reset(); }} />
                  <textarea className="ci-input" rows={4}
                    placeholder={"Other recent titles (one per line)\n\nI Lost ₹2 Lakh in Stocks — What I Learned\nBest Mutual Funds to Buy in 2025"}
                    value={comp.recent} onChange={e => { updateComp(comp.id, { recent: e.target.value }); reset(); }}
                    style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add competitor button */}
        {competitors.length < 4 && (
          <button onClick={addCompetitor}
            style={{ marginTop: 12, width: '100%', height: 38, borderRadius: 10, border: `1.5px dashed var(--stroke-2)`,
              background: 'transparent', color: 'var(--text-4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = m.accentFrom; e.currentTarget.style.color = m.accentFrom; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--stroke-2)'; e.currentTarget.style.color = 'var(--text-4)'; }}>
            + Add competitor {competitors.length + 1} of 4
          </button>
        )}

        {/* Thumbnail upload */}
        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Thumbnail <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — upload for visual analysis)</span>
          </span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { readThumb(e.target.files[0]); reset(); }} />
          <div style={{ marginTop: 8 }}>
            {thumb
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={thumb.preview} alt="thumbnail" style={{ width: 120, height: 68, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--stroke-1)' }} />
                  <button className="ci-copybtn" style={{ height: 30 }} onClick={() => { setThumb(null); reset(); }}>Remove</button>
                </div>
              : <button type="button" className="ci-drop"
                  style={{ minHeight: 44, padding: '10px 16px', width: 'auto', border: '1px solid var(--stroke-1)' }}
                  onClick={() => fileRef.current && fileRef.current.click()}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10.5V3M5 6l3-3 3 3M3 11.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>
                  Upload a thumbnail for visual analysis
                </button>}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label={`Analyse ${competitors.length} competitor${competitors.length > 1 ? 's' : ''}`} loading={loading}
            estIn={0} estOut={2200} onClick={generate}
            disabled={!canAnalyze}
            disabledHint={mode === 'auto' ? 'Fetch at least one competitor channel first' : 'Enter at least one competitor title first'} />
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
