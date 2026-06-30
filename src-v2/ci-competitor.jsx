// ContentIntel — Competitor Breakdown (deep analytics)

const COMPETITOR_SYSTEM = `You are ContentIntel's competitive intelligence analyst. Use ONLY real numbers from the data — never invent metrics.
LANGUAGE LAW: reply in the same language as the channel titles.

Each competitor block includes: Subscribers, Avg views, Engagement rate, Posts/month, Top day, Format split, and per-video data: Title | Views | Likes | Comments | Engagement% | Duration | Age.

Call submit_report with these 5 sections. Field names are EXACT — do not rename them.

── SECTION 1 ── type "kv" title "Channel Stats at a Glance"
One kv row per metric per competitor. Use format "CompetitorName — Metric" as k, real value as v.
Cover every metric using the COMPUTED INTELLIGENCE numbers provided: Subscribers / Avg views / Median views / Views-per-day (age-adjusted) / View-to-sub ratio / Engagement rate / Comment rate / Growth momentum (Growing/Declining + %) / View consistency / Posts per month / Top posting day / Best format by views / Top content pillar / Avg video length.
level "green"=strong "yellow"=ok "red"=weak.

── SECTION 2 ── type "copy" title "What They're Doing & How They Post"
One block per competitor. label = competitor name.
text must cover ALL of: posting frequency + consistency + top day/time + whether newer videos get more or fewer views than older ones (growing/declining) + which format (Shorts/mid/long) earns the most views with the actual numbers to prove it + their main 3-4 content topic pillars with high-performing title examples + the psychological hook they use most (curiosity/numbers/fear/social proof/aspiration/controversy).

── SECTION 3 ── type "copy" title "Their Best Videos — What Made Them Work"
One block per competitor's top 3 videos. label = "Competitor — Title (Xk views, X% eng)".
text: hook type that drove clicks + content angle + video length + whether engagement rate is above or below their channel average + what this reveals about what their audience really wants.

── SECTION 4 ── type "copy" title "How to Beat Them"
Block 1 label "Title Formulas to Steal" — decode their 3 most effective title patterns with real examples and view counts. Then give your adapted version of each formula for your niche.
Block 2 label "8 Titles That Outperform Their Best" — 8 specific, publish-ready titles with concrete hooks (numbers/outcomes/controversy) that directly compete with their highest-view content.
Block 3 label "Content Gaps You Can Own" — 6 specific angles they miss or do weakly, each with your exact content angle and why competitors can't copy you on it.
Block 4 label "Thumbnail Concept" — a detailed thumbnail concept that visually outperforms their style: subject/expression/text overlay/colours/layout.

── SECTION 5 ── type "checklist" title "Your 30-Day Action Plan"
10 items state "no". Be specific: name exact posting days, specific video topics with hooks, format mix changes, one engagement experiment, one SEO move. Zero vague advice.

scores — use exact field names name/score/why:
"Title Hook Strength" score 0-100, why quotes actual title + view count
"Posting Consistency" score 0-100, why quotes actual posts/month + gap
"Engagement Quality" score 0-100, why quotes actual engagement rate
"Content Depth" score 0-100, why quotes format split + avg length
"Overall Threat Level" score 0-100, why gives one specific data-backed reason

verdict.level "red" if hard to beat, "yellow" if beatable.
verdict.title 7 words naming their strength and your opening.
verdict.text 2 sentences: their biggest strength with data, then your clearest path to beating them.
bottomLine: ONE specific video to make this week — topic, hook, format, day.`;


const EMPTY_COMPETITOR = () => ({
  id: Math.random().toString(36).slice(2),
  handle: '',
  title: '',
  recent: '',
  videoData: [],
  channelInfo: null,
  fetchState: 'idle',
  fetchErr: '',
  metrics: null,
});

const cfmt = (n) => { const v = parseInt(n || 0); return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v); };

// Side-by-side comparison grid of every fetched competitor, leader highlighted.
function CompareTable({ competitors, mood }) {
  const m = MOODS[mood] || MOODS.navy;
  const cols = competitors.filter(c => c.metrics && c.channelInfo);
  if (cols.length < 2) return null;
  const dur = s => s ? Math.floor(s / 60) + 'm' : '?';
  const deep = {}; cols.forEach(c => { deep[c.id] = window.deepCompetitorAnalysis ? window.deepCompetitorAnalysis(c.videoData) : null; });
  const D = (c, f, d = 0) => { const x = deep[c.id]; return x ? f(x) : d; };
  const rows = [
    { label: 'Subscribers', get: c => parseInt(c.channelInfo.subs || 0), disp: c => cfmt(c.channelInfo.subs), better: 'high' },
    { label: 'Avg views', get: c => c.metrics.avgViews || 0, disp: c => cfmt(c.metrics.avgViews), better: 'high' },
    { label: 'Median views', get: c => D(c, x => x.medianViews), disp: c => D(c, x => cfmt(x.medianViews), '—') || '—', better: 'high' },
    { label: 'View/sub %', get: c => { const s = parseInt(c.channelInfo.subs || 0); return s ? (c.metrics.avgViews / s) * 100 : 0; }, disp: c => { const s = parseInt(c.channelInfo.subs || 0); return s ? ((c.metrics.avgViews / s) * 100).toFixed(0) + '%' : '—'; }, better: 'high' },
    { label: 'Views/day', get: c => D(c, x => x.avgViewsPerDay), disp: c => D(c, x => cfmt(x.avgViewsPerDay), '—') || '—', better: 'high' },
    { label: 'Engagement', get: c => c.metrics.avgEngRate || 0, disp: c => c.metrics.avgEngRate + '%', better: 'high' },
    { label: 'Comment rate', get: c => D(c, x => x.commentRate), disp: c => D(c, x => x.commentRate + '%', '—') || '—', better: 'high' },
    { label: 'Momentum', get: c => D(c, x => x.momentum.pct), disp: c => D(c, x => `${x.momentum.trend} ${x.momentum.pct > 0 ? '+' : ''}${x.momentum.pct}%`, '—') || '—', better: 'high' },
    { label: 'Consistency', get: () => 0, disp: c => D(c, x => x.consistency, '—') || '—', better: 'none' },
    { label: 'Posts/month', get: c => c.metrics.postsPerMonth || 0, disp: c => c.metrics.postsPerMonth != null ? '~' + c.metrics.postsPerMonth : 'N/A', better: 'high' },
    { label: 'Avg length', get: () => 0, disp: c => dur(c.metrics.avgDurSecs), better: 'none' },
    { label: 'Top day', get: () => 0, disp: c => c.metrics.topDay || '—', better: 'none' },
  ];
  const th = { textAlign: 'left', padding: '8px 10px', fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid var(--stroke-1)', whiteSpace: 'nowrap' };
  const td = { padding: '9px 10px', borderBottom: '1px solid var(--stroke-1)', whiteSpace: 'nowrap' };
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>📊 Side-by-side comparison</div>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--stroke-1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr><th style={th}>Metric</th>{cols.map(c => <th key={c.id} style={{ ...th, color: m.accentFrom }}>{(c.channelInfo.name || '').slice(0, 16)}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => {
              const vals = cols.map(r.get);
              const best = r.better === 'high' ? Math.max(...vals) : null;
              const tie = best != null && vals.filter(v => v === best).length === cols.length;
              return (
                <tr key={r.label}>
                  <td style={{ ...td, color: 'var(--text-4)', fontWeight: 500 }}>{r.label}</td>
                  {cols.map((c, i) => {
                    const win = best != null && !tie && vals[i] === best;
                    return <td key={c.id} style={{ ...td, color: win ? '#8FD86A' : 'var(--text-1)', fontWeight: win ? 800 : 600 }}>{r.disp(c)}{win ? ' ▲' : ''}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Per-competitor deep edge: momentum, consistency, velocity, engagement depth,
// content pillars, format performance, breakout hits, posting calendar.
function CompEdge({ comp, mood }) {
  const m = MOODS[mood] || MOODS.navy;
  const deep = React.useMemo(() => window.deepCompetitorAnalysis ? window.deepCompetitorAnalysis(comp.videoData) : null, [comp.videoData]);
  const fmtPerf = React.useMemo(() => window.analyzeFormatPerformance ? window.analyzeFormatPerformance(comp.videoData) : null, [comp.videoData]);
  const Cal = window.PostingCalendar;
  const calEl = (Cal && comp.videoData && comp.videoData.length >= 2) ? <Cal videos={comp.videoData} mood={mood} /> : null;
  if (!deep) return calEl ? <div style={{ marginTop: 10 }}>{calEl}</div> : null;
  const chip = (txt, col, bg, title) => <span title={title} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: bg || 'var(--surface-2)', color: col || 'var(--text-3)', fontWeight: 600 }}>{txt}</span>;
  const Label = ({ children }) => <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '9px 0 5px' }}>{children}</div>;
  const tCol = deep.momentum.trend === 'Growing' ? '#8FD86A' : deep.momentum.trend === 'Declining' ? '#F06A7E' : '#F0C85A';
  return (
    <div style={{ marginTop: 10, borderTop: '1px solid var(--stroke-1)', paddingTop: 10 }}>
      <Label>Channel signals</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {chip(`${deep.momentum.trend} ${deep.momentum.pct > 0 ? '+' : ''}${deep.momentum.pct}%`, tCol, tCol + '18', 'Recent videos vs older videos')}
        {chip(`${deep.consistency} views`, deep.consistency === 'Steady' ? '#8FD86A' : '#F0C85A', null, 'How reliable their view counts are')}
        {chip(`${cfmt(deep.avgViewsPerDay)}/day`, m.accentFrom, m.accentFrom + '18', 'Age-adjusted: avg views per day since publish')}
        {chip(`👍 ${deep.likeRate}%`, null, null, 'Avg like rate')}
        {chip(`💬 ${deep.commentRate}%`, null, null, 'Avg comment rate (stronger loyalty signal)')}
      </div>
      {deep.pillars.length > 0 && (<>
        <Label>Content pillars — topic · avg views · vs their avg</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {deep.pillars.slice(0, 6).map(p => {
            const col = p.lift > 15 ? '#8FD86A' : p.lift < -15 ? '#F06A7E' : 'var(--text-2)';
            return chip(`${p.topic} · ${cfmt(p.avgViews)} ${p.lift > 0 ? '+' + p.lift : p.lift}%`, col, 'var(--surface-2)', `${p.count} videos · ${p.avgEng}% engagement`);
          })}
        </div>
      </>)}
      {fmtPerf && (<>
        <Label>Format performance (avg views)</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {fmtPerf.rows.map(r => chip(`${r.format}: ${cfmt(r.avgViews)} (${r.count})`, r === fmtPerf.best ? m.accentFrom : 'var(--text-3)', r === fmtPerf.best ? m.accentFrom + '22' : 'var(--surface-2)'))}
        </div>
      </>)}
      {deep.breakouts.length > 0 && (<>
        <Label>Breakout hits (vs their median)</Label>
        {deep.breakouts.map((b, i) => (
          <div key={i} style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.55 }}>
            <b style={{ color: '#8FD86A' }}>{b.multiple}×</b> "{b.title.slice(0, 50)}{b.title.length > 50 ? '…' : ''}" — {cfmt(b.views)}
          </div>
        ))}
      </>)}
      {calEl}
    </div>
  );
}

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
    updateComp(comp.id, { fetchState: 'fetching', fetchErr: '', channelInfo: null, recent: '', videoData: [], metrics: null });
    reset();
    try {
      const ch   = await window.fetchYTChannel(comp.handle.trim(), ytKey);
      const vids = await window.fetchYTVideos(ch.id, ytKey, 25);
      const chInfo = { name: ch.snippet.title, subs: ch.statistics.subscriberCount, videoCount: ch.statistics.videoCount };
      const mx = window.analyzeChannelMetrics ? window.analyzeChannelMetrics(vids) : null;
      updateComp(comp.id, { channelInfo: chInfo, videoData: vids, recent: vids.map(v=>v.title).join('\n'), fetchState: 'fetched', metrics: mx });
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
      const label = `=== COMPETITOR ${idx + 1}${comp.channelInfo ? ': ' + comp.channelInfo.name : (comp.handle.trim() ? ' (' + comp.handle.trim() + ')' : '')} ===`;
      let body = '';
      if (comp.videoData.length > 0 && window.formatCompetitorAnalytics) {
        body = window.formatCompetitorAnalytics(comp.videoData, comp.channelInfo);
        // Append client-computed deep edges so the AI quotes real, accurate numbers.
        const pats = window.analyzeTitlePatterns ? window.analyzeTitlePatterns(comp.videoData) : [];
        const fp = window.analyzeFormatPerformance ? window.analyzeFormatPerformance(comp.videoData) : null;
        const dp = window.deepCompetitorAnalysis ? window.deepCompetitorAnalysis(comp.videoData) : null;
        if (dp) {
          body += `\n\n=== COMPUTED INTELLIGENCE (use these exact numbers) ===`;
          body += `\nGrowth momentum: ${dp.momentum.trend} (recent avg ${dp.momentum.recentAvg} vs older ${dp.momentum.olderAvg} views, ${dp.momentum.pct > 0 ? '+' : ''}${dp.momentum.pct}%).`;
          body += `\nView consistency: ${dp.consistency} (CV ${dp.cv}). Median views: ${dp.medianViews}. Age-adjusted velocity: ${dp.avgViewsPerDay} views/day.`;
          body += `\nEngagement depth: like rate ${dp.likeRate}%, comment rate ${dp.commentRate}% (comments = loyalty).`;
          if (dp.pillars.length) body += `\nContent pillars (topic | avg views | lift vs their avg): ` + dp.pillars.slice(0, 6).map(p => `${p.topic} | ${p.avgViews} | ${p.lift > 0 ? '+' : ''}${p.lift}% (${p.count} vids)`).join('; ') + '.';
          if (dp.breakouts.length) body += `\nBreakout hits (×median): ` + dp.breakouts.map(b => `"${b.title.slice(0, 50)}" ${b.multiple}× (${b.views})`).join('; ') + '.';
        }
        if (pats.length) body += `\nTitle patterns (lift vs their avg): ` + pats.filter(p => p.lift > 0).slice(0, 5).map(p => `${p.label} +${p.lift}%`).join('; ') + '.';
        if (fp) body += `\nFormat performance (avg views): ` + fp.rows.map(r => `${r.format} ${r.avgViews} (${r.count})`).join('; ') + `. Best: ${fp.best.format}.`;
      } else if (comp.recent.trim()) {
        body = (comp.title.trim() ? `Standout title: ${comp.title.trim()}\n` : '') + `Recent titles:\n${comp.recent.trim()}`;
      } else if (comp.title.trim()) {
        body = `Standout title: ${comp.title.trim()}`;
      }
      return label + '\n' + body;
    }).filter(b => b.trim());

    const canAnalyze = competitors.some(c => c.title.trim() || c.recent.trim() || c.videoData.length > 0);
    if (!canAnalyze || !compBlocks.length) return;

    run({
      system: COMPETITOR_SYSTEM + (profileCtx ? '\n\nYour channel context (all strategy must be tailored to this creator):\n' + profileCtx : ''),
      userText: [
        `Analysing ${competitors.length} competitor${competitors.length > 1 ? 's' : ''}:\n`,
        compBlocks.join('\n\n'),
        thumb ? '\n(A competitor thumbnail is attached — include visual analysis in Section 7.)' : '',
      ].filter(Boolean).join('\n'),
      images: thumb ? [thumb] : [],
      maxTokens: 5500,
    });
  }

  const fmt = (n) => { const v = parseInt(n || 0); return v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v); };
  const fmtDur = (s) => { if (!s) return '?'; const mn = Math.floor(s/60), sec = s%60; return `${mn}m ${sec}s`; };
  const canAnalyze = competitors.some(c => c.title.trim() || c.recent.trim() || c.videoData.length > 0);

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Competitor Analysis</Eyebrow>
        <h2 className="ci-h2">Deep Competitor Breakdown</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Compare up to 4 competitors — get every metric: views, engagement, posting frequency, timing, content formats, gaps, and a 30-day action plan.
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

        {mode === 'auto' && !ytKey && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.3)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
            <b style={{ color: '#F0C85A' }}>YouTube API key needed</b> — add it in Settings → Platform Data tab.{' '}
            <button className="ci-copybtn" style={{ height: 28, padding: '0 10px', fontSize: 12, marginLeft: 8 }} onClick={onOpenKey}>Open Settings</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {competitors.map((comp, idx) => (
            <div key={comp.id} style={{ borderRadius: 12, border: '1px solid var(--stroke-1)', background: 'var(--surface-1)', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: m.accentFrom, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Competitor {idx + 1}
                  {comp.channelInfo && <span style={{ color: 'var(--text-1)', marginLeft: 8, textTransform: 'none', fontWeight: 600, letterSpacing: 0 }}>{comp.channelInfo.name}</span>}
                </span>
                {competitors.length > 1 && (
                  <button onClick={() => removeCompetitor(comp.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 13, padding: '2px 6px', borderRadius: 4 }}>
                    ✕
                  </button>
                )}
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mode === 'auto' && (
                  <>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="ci-input" placeholder="@CompetitorChannel or youtube.com/@Channel"
                        value={comp.handle}
                        onChange={e => { updateComp(comp.id, { handle: e.target.value, fetchState: 'idle', channelInfo: null, recent: '', metrics: null }); reset(); }}
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
                    {/* Analytics preview card after fetch */}
                    {comp.fetchState === 'fetched' && comp.metrics && (
                      <div style={{ borderRadius: 10, background: 'rgba(100,120,220,0.06)', border: '1px solid rgba(100,120,220,0.18)', padding: '12px 14px' }}>
                        {/* Row 1: channel stats */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                          {[
                            { label: 'Subscribers', val: fmt(comp.channelInfo?.subs) },
                            { label: 'Avg views', val: fmt(comp.metrics.avgViews) },
                            { label: 'Engagement', val: comp.metrics.avgEngRate + '%' },
                            { label: 'Avg length', val: fmtDur(comp.metrics.avgDurSecs) },
                          ].map(stat => (
                            <div key={stat.label} style={{ flex: '1 0 80px', padding: '8px 10px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: m.accentFrom }}>{stat.val}</div>
                              <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>{stat.label}</div>
                            </div>
                          ))}
                        </div>
                        {/* Row 2: posting pattern */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                          {[
                            { label: 'Posts/month', val: comp.metrics.postsPerMonth !== null ? `~${comp.metrics.postsPerMonth}` : 'N/A' },
                            { label: 'Avg gap', val: comp.metrics.avgGapDays !== null ? `${comp.metrics.avgGapDays} days` : 'N/A' },
                            { label: 'Top posting day', val: comp.metrics.topDay },
                            { label: 'Posting time', val: comp.metrics.timeSlot },
                          ].map(stat => (
                            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 6, background: 'var(--surface-2)', fontSize: 12.5 }}>
                              <span style={{ color: 'var(--text-4)' }}>{stat.label}</span>
                              <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{stat.val}</span>
                            </div>
                          ))}
                        </div>
                        {/* Row 3: format split */}
                        {(comp.metrics.shorts > 0 || comp.metrics.mids > 0 || comp.metrics.longs > 0) && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                            {comp.metrics.shorts > 0 && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(100,220,160,0.12)', color: '#5CD9A0', fontSize: 12, fontWeight: 600 }}>Shorts: {comp.metrics.shorts}</span>}
                            {comp.metrics.mids > 0 && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(100,150,240,0.12)', color: '#7DA6F0', fontSize: 12, fontWeight: 600 }}>Mid: {comp.metrics.mids}</span>}
                            {comp.metrics.longs > 0 && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(240,180,90,0.12)', color: '#F0C85A', fontSize: 12, fontWeight: 600 }}>Long-form: {comp.metrics.longs}</span>}
                          </div>
                        )}
                        {/* Top/bottom performer */}
                        {comp.metrics.topVideo && (
                          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                            <span style={{ color: '#5CD9A0', fontWeight: 700 }}>▲ Top: </span>
                            <span>"{comp.metrics.topVideo.title.slice(0, 55)}{comp.metrics.topVideo.title.length > 55 ? '…' : ''}" — {fmt(comp.metrics.topVideo.viewCount)} views</span>
                          </div>
                        )}
                        {comp.metrics.bottomVideo && comp.metrics.bottomVideo !== comp.metrics.topVideo && (
                          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginTop: 3 }}>
                            <span style={{ color: '#F06A7E', fontWeight: 700 }}>▼ Lowest: </span>
                            <span>"{comp.metrics.bottomVideo.title.slice(0, 55)}{comp.metrics.bottomVideo.title.length > 55 ? '…' : ''}" — {fmt(comp.metrics.bottomVideo.viewCount)} views</span>
                          </div>
                        )}
                        {comp.videoData && comp.videoData.length > 0 && <CompEdge comp={comp} mood={mood} />}
                      </div>
                    )}
                  </>
                )}

                {mode === 'manual' && (
                  <>
                    <input className="ci-input" style={{ fontSize: 14 }}
                      placeholder="Competitor's best / latest title"
                      value={comp.title} onChange={e => { updateComp(comp.id, { title: e.target.value }); reset(); }} />
                    <textarea className="ci-input" rows={4}
                      placeholder={"Other recent titles (one per line)\n\nI Lost ₹2 Lakh in Stocks\nBest Mutual Funds to Buy in 2025\nWhy 90% of Indians Never Get Rich"}
                      value={comp.recent} onChange={e => { updateComp(comp.id, { recent: e.target.value }); reset(); }}
                      style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Side-by-side comparison across all fetched competitors */}
        <CompareTable competitors={competitors} mood={mood} />

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
            Their thumbnail <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — upload for visual analysis)</span>
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
          <AnalyzeButton mood={mood} label={`Deep-analyse ${competitors.length} competitor${competitors.length > 1 ? 's' : ''}`} loading={loading}
            estIn={0} estOut={3000} onClick={generate}
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
