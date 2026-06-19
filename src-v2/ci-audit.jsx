// ContentIntel — Channel Audit (with YouTube auto-fetch + deep analytics)

const AUDIT_SYSTEM = [
  "You are ContentIntel's channel strategist. Audit a YouTube channel with full data-driven precision — be blunt, specific, and actionable.",
  "LANGUAGE LAW: match the language of the submitted content.",
  "You receive a structured analytics block. Use EVERY metric — never skip numbers.",
  "",
  "Analyse these dimensions (score each 0-100):",
  "• Title CTR Potential — are titles curiosity-driven, specific, with stakes or numbers?",
  "• Niche Consistency — clear focus or scattered topics?",
  "• Content Gap Awareness — what obvious high-traffic angles are missing?",
  "• Audience Targeting — do titles speak to a specific person or feel generic?",
  "• Growth Trajectory — is performance improving, plateauing, or declining over time?",
  "• Posting Consistency — is the frequency sustainable and strategic?",
  "• Engagement Quality — is the audience loyal (high eng rate) or passive (view-only)?",
  "",
  "Required sections (ALL required):",
  "1. Channel snapshot — kv list: Avg views / Avg engagement rate / Posts per month / Top posting day / Format split (Shorts/mid/long)",
  "2. Strengths — checklist of what's genuinely working (cite exact titles + numbers)",
  "3. Critical issues — issues list with level (red/yellow) and a copy-ready fix for each",
  "4. Top vs bottom performers — copy block: the highest and lowest view count videos, WHY the gap exists, and what to do about it",
  "5. Posting strategy analysis — text: frequency, timing, consistency gaps, and what schedule to move to",
  "6. Engagement audit — text: what the like/comment rates say about audience loyalty vs casual viewers",
  "7. Title rewrites — rewrite the 3 weakest-performing titles as copy blocks (Original → Rewrite, name the hook type used)",
  "8. 30-day action plan — kv rows: Week 1–4 with specific, measurable actions",
  "",
  "Be SPECIFIC. Reference exact titles, their view counts, and engagement rates.",
  "Calculate average views. Flag any video 2× above or below average.",
  "Set verdict.level: green=score 70+, yellow=40-69, red=below 40.",
  "Set verdict.title to a punchy health verdict (e.g. 'Solid niche — posting inconsistency is killing growth').",
  "Set verdict.text to a 2-sentence summary: biggest strength + biggest problem.",
  "Set bottomLine to the single most impactful change they should make this week.",
].join("\n");

function AuditTab({ onOpenKey }) {
  const mood = 'lime';
  const m = MOODS[mood] || MOODS.burgundy;

  // Mode: 'auto' uses YouTube API, 'manual' accepts pasted titles
  const [mode, setMode]       = React.useState(window.getYouTubeKey ? (window.getYouTubeKey() ? 'auto' : 'manual') : 'manual');
  const [handle, setHandle]   = React.useState('');
  const [about, setAbout]     = React.useState('');
  const [titles, setTitles]   = React.useState('');
  const [videoData, setVideoData] = React.useState([]);
  const [metrics, setMetrics] = React.useState(null);
  const [fetchState, setFetchState] = React.useState('idle');
  const [fetchErr, setFetchErr]     = React.useState('');
  const [channelInfo, setChannelInfo] = React.useState(null);

  const { state, report, usage, err, run, reset } = useAnalysis('audit');
  const loading = state === 'loading';

  const ytKey = window.getYouTubeKey ? window.getYouTubeKey() : '';

  async function fetchChannel() {
    if (!handle.trim()) return;
    setFetchState('fetching'); setFetchErr(''); setChannelInfo(null); setTitles(''); setMetrics(null); reset();
    try {
      const ch  = await window.fetchYTChannel(handle.trim(), ytKey);
      const vids = await window.fetchYTVideos(ch.id, ytKey, 25);
      const chInfo = {
        name: ch.snippet.title,
        subs: ch.statistics.subscriberCount,
        views: ch.statistics.viewCount,
        videoCount: ch.statistics.videoCount,
        description: ch.snippet.description,
      };
      setChannelInfo(chInfo);
      setVideoData(vids);
      setTitles(vids.map(v => v.title).join('\n'));
      setMetrics(window.analyzeChannelMetrics ? window.analyzeChannelMetrics(vids) : null);
      if (!about.trim() && ch.snippet.description) {
        setAbout(ch.snippet.description.slice(0, 200));
      }
      setFetchState('fetched');
    } catch (e) {
      setFetchErr(e.message || 'Could not fetch channel data.');
      setFetchState('error');
    }
  }

  const titleCount = titles.trim() ? titles.trim().split('\n').filter(l => l.trim()).length : 0;

  function generate() {
    if (!titles.trim() && !videoData.length) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    const videoText = videoData.length > 0 && window.formatCompetitorAnalytics
      ? window.formatCompetitorAnalytics(videoData, channelInfo)
      : (titles.trim() ? `Recent video titles (${titleCount}):\n${titles.trim()}` : '');
    run({
      system: AUDIT_SYSTEM + (profileCtx ? '\n\nCreator context:\n' + profileCtx : ''),
      userText: [
        channelInfo
          ? `Channel: ${channelInfo.name} | Subscribers: ${Number(channelInfo.subs||0).toLocaleString()} | Total channel views: ${Number(channelInfo.views||0).toLocaleString()}`
          : (handle.trim() ? `Channel: ${handle.trim()}` : ''),
        about.trim() ? `Niche / About: ${about.trim()}` : '',
        videoText,
      ].filter(Boolean).join('\n\n'),
      maxTokens: 3500,
    });
  }

  function fmt(n) { const v = parseInt(n || 0); return v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v); }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Channel Audit</Eyebrow>
        <h2 className="ci-h2">Full Channel Health Check</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Enter a YouTube channel handle to auto-fetch their videos, or paste titles manually for any platform.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'auto', label: '⚡ Auto-fetch from YouTube' }, { id: 'manual', label: '✎ Paste titles manually' }].map(opt => (
            <button key={opt.id} onClick={() => { setMode(opt.id); reset(); setChannelInfo(null); setFetchState('idle'); setTitles(''); setVideoData([]); }}
              style={{ flex: 1, height: 38, borderRadius: 10, border: `1.5px solid ${mode === opt.id ? m.accentFrom : 'var(--stroke-2)'}`,
                background: mode === opt.id ? m.accentFrom + '18' : 'transparent',
                color: mode === opt.id ? m.accentFrom : 'var(--text-3)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          ))}
        </div>

        {mode === 'auto' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!ytKey && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.3)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                <b style={{ color: '#F0C85A' }}>YouTube API key needed</b> — add it in Settings → Platform Data tab to auto-fetch any channel.{' '}
                <button className="ci-copybtn" style={{ height: 28, padding: '0 10px', fontSize: 12, marginLeft: 8 }} onClick={onOpenKey}>Open Settings</button>
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>YouTube channel handle *</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="ci-input" placeholder="@YourChannel or youtube.com/@YourChannel"
                  value={handle} onChange={e => { setHandle(e.target.value); setFetchState('idle'); setChannelInfo(null); setTitles(''); reset(); }}
                  onKeyDown={e => { if (e.key === 'Enter' && ytKey) fetchChannel(); }}
                  style={{ flex: 1 }} />
                <GlowButton mood={mood} onClick={fetchChannel}
                  style={{ whiteSpace: 'nowrap', opacity: (!handle.trim() || !ytKey || fetchState === 'fetching') ? 0.5 : 1 }}>
                  {fetchState === 'fetching' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Fetching…
                    </span>
                  ) : 'Fetch channel →'}
                </GlowButton>
              </div>
            </label>
            {fetchState === 'error' && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(240,90,110,0.08)', border: '1px solid rgba(240,90,110,0.25)', fontSize: 13, color: '#F06A7E' }}>{fetchErr}</div>
            )}
            {fetchState === 'fetched' && channelInfo && (
              <div style={{ borderRadius: 12, background: 'rgba(143,216,106,0.06)', border: '1px solid rgba(143,216,106,0.2)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: metrics ? 12 : 0 }}>
                  <span style={{ fontSize: 22 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{channelInfo.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
                      {fmt(channelInfo.subs)} subscribers · {fmt(channelInfo.views)} total views · {fmt(channelInfo.videoCount)} videos
                    </div>
                  </div>
                </div>
                {metrics && (
                  <>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      {[
                        { label: 'Avg views', val: fmt(metrics.avgViews) },
                        { label: 'Engagement', val: metrics.avgEngRate + '%' },
                        { label: 'Posts/month', val: metrics.postsPerMonth !== null ? `~${metrics.postsPerMonth}` : 'N/A' },
                        { label: 'Avg length', val: metrics.avgDurSecs ? `${Math.floor(metrics.avgDurSecs/60)}m` : 'N/A' },
                      ].map(s => (
                        <div key={s.label} style={{ flex: '1 0 70px', padding: '7px 10px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#8FD86A' }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 1 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {metrics.postsPerWeek !== null && <span style={{ fontSize: 12, color: 'var(--text-3)', padding: '3px 8px', borderRadius: 999, background: 'var(--surface-2)' }}>~{metrics.postsPerWeek}/week · top day: {metrics.topDay}</span>}
                      {metrics.shorts > 0 && <span style={{ fontSize: 12, color: '#5CD9A0', padding: '3px 8px', borderRadius: 999, background: 'var(--surface-2)' }}>Shorts: {metrics.shorts}</span>}
                      {metrics.longs > 0 && <span style={{ fontSize: 12, color: '#F0C85A', padding: '3px 8px', borderRadius: 999, background: 'var(--surface-2)' }}>Long-form: {metrics.longs}</span>}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Channel name</span>
                <input className="ci-input" placeholder="e.g. @YourChannel" value={handle} onChange={e => { setHandle(e.target.value); reset(); }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Platform / niche</span>
                <input className="ci-input" placeholder="e.g. YouTube — personal finance" value={about} onChange={e => { setAbout(e.target.value); reset(); }} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Video / post titles * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— paste 10–20 for best results, one per line</span>
              </span>
              <textarea className="ci-input" rows={10}
                placeholder={"One title per line — works for YouTube, Instagram, TikTok, or any platform:\n\nI Invested ₹50,000 in Index Funds — Here's What Happened\nWhy Your SIP Is Not Working (Fix This Now)\n5 Money Mistakes I Made in My 20s"}
                value={titles} onChange={e => { setTitles(e.target.value); reset(); }}
                style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
              {titleCount > 0 && (
                <span style={{ fontSize: 11, color: titleCount >= 10 ? '#8FD86A' : '#F0C85A', textAlign: 'right' }}>
                  {titleCount} titles {titleCount < 10 ? '— add more for a better audit' : '— good sample'}
                </span>
              )}
            </label>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Audit channel" loading={loading}
            estIn={estTokens(AUDIT_SYSTEM, titles, about)} estOut={2200} onClick={generate}
            disabled={!titles.trim()}
            disabledHint={mode === 'auto' ? 'Fetch a channel first' : 'Paste video titles first'} />
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
