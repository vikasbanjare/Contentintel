// ContentIntel — Competitor Breakdown (full deep analytics)

const COMPETITOR_SYSTEM = `You are ContentIntel's competitor analyst. Use EVERY real number from the data — never invent or guess metrics.
LANGUAGE LAW: reply in the same language as the channel titles.

You receive per competitor: Channel name, Subscribers, Avg views, Engagement rate, Posts/month, Top day, Format split (Shorts/mid/long), and per-video rows: Title | Views | Likes | Comments | Engagement% | Duration | Age.

Output submit_report with EXACTLY these 5 sections using EXACT field names shown:

Section 1 — type "kv", title "Channel Stats":
rows: one row per KEY METRIC per competitor using REAL numbers from the data.
Include: Subscribers / Avg views / Engagement rate / Posts per month / Top posting day / Best format / View-to-sub ratio.
Use level "green" for strong, "yellow" for average, "red" for weak.

Section 2 — type "copy", title "Top Videos That Worked":
blocks: one block per competitor's top 3 videos by view count.
label = competitor name + video title + actual view count.
text = hook type used (curiosity/number/fear/social proof) + why it worked + content angle.

Section 3 — type "issues", title "Gaps You Can Own":
items: 5 specific content gaps — angles they miss or do poorly.
level = "green" (easy win for you). text = gap + why you can own it.

Section 4 — type "copy", title "5 Titles That Beat Them":
blocks: 5 ready-to-use titles that outperform their best content.
label = hook type used. text = the actual title (in their niche, with specific numbers).

Section 5 — type "checklist", title "30-Day Action Plan":
items: 8 specific weekly actions — posting schedule, topics, formats, engagement.
state = "no" (to-do). text = one concrete action per item.

Scores array (use EXACT field names: name / score / why):
[ "Title Hook Strength", "Posting Consistency", "Engagement Quality", "Content Depth", "Overall Threat Level" ] — each 0-100, why = one clause quoting actual numbers.

verdict: level "red" (strong field) or "yellow" (beatable). title = 6-word punchy assessment. text = 2 sentences: biggest threat + your opening.
bottomLine: ONE specific action to take this week — name day, format, topic.`;


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
      maxTokens: 5000,
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
