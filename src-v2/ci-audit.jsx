// ContentIntel — Channel Audit (with YouTube auto-fetch + deep analytics)

const AUDIT_SYSTEM = `You are ContentIntel's senior channel strategist. Deliver a deep, honest, data-driven audit. Be blunt — no empty praise. Quote REAL numbers from the data at every point.
LANGUAGE LAW: reply in the same language as the channel titles.

You receive: Channel name, Subscribers, Total views, and per-video rows: Title | Views | Likes | Comments | Engagement% | Duration | Age. Plus computed: Avg views, Engagement rate, Posts/month, Avg gap between posts, Top day, Posting time, Format split (Shorts/mid/long).

Output submit_report with EXACTLY these 8 sections. Use EXACT JSON field names — no variations.

SECTION 1 type="kv" title="Channel Health Dashboard"
rows: every metric with a color-coded health rating. Include ALL: Subscribers / Total views / Avg views per video / View-to-sub ratio (avg views ÷ subs as %) / Avg engagement rate / Posts per month / Avg gap between posts / Top posting day / Posting time / Avg video length / Shorts count / Long-form count.
level: "green"=strong "yellow"=average "red"=weak. Flag any metric that needs urgent attention.

SECTION 2 type="checklist" title="What's Genuinely Working"
5-6 items. state="yes". Each item must quote a real title + real numbers.
Examples of good items: "Number-based titles average 3.2× more views than question titles (45K vs 14K)". "Long-form videos (>10min) get 2.1× more comments per view than Shorts."

SECTION 3 type="issues" title="Critical Problems Holding You Back"
5-6 items. level="red" or "yellow". Each item = specific problem + exact copy-ready fix.
Bad example: "Improve your titles" — never do this.
Good example: "9 of 20 titles have no hook word in first 3 words — start with the outcome: '₹1 Lakh in 6 Months: Here's My Exact SIP' instead of 'My Investment Journey'".

SECTION 4 type="copy" title="Performance Gap Analysis"
Block 1 label="Top Performer — [title] ([views] views, [eng]% eng)" text: hook type used + content angle + why the audience responded + what specific element to replicate in next 3 videos.
Block 2 label="Weakest Performer — [title] ([views] views, [eng]% eng)" text: exact reason it underperformed (weak hook / wrong topic / bad timing / wrong format) + full rewrite of the title + format change suggestion.
Block 3 label="Biggest View Gap" text: identify the single video that performed most differently from channel average (highest or lowest). Explain why with data — what does this reveal about what the audience actually wants?

SECTION 5 type="copy" title="Title Formula Performance"
Analyse which title patterns actually work for THIS channel. Find patterns in the top-performing titles (use numbers, questions, negative framing, "I did X", story hooks, etc).
Block 1 label="Title Patterns That Work" text: 2-3 patterns found in high-performing titles with avg view counts per pattern.
Block 2 label="Patterns That Underperform" text: 2-3 patterns found in low-performing titles with avg view counts.
Block 3 label="5 Optimised Title Rewrites" text: rewrite 5 of the weaker titles using the patterns that actually work for this channel. Format: "Original: [title]\n→ Rewrite: [new title] (hook type: X)".

SECTION 6 type="text" title="Posting Strategy & Audience Timing Analysis"
body: Deep analysis of posting behaviour. Cover: Is the current frequency sustainable and is it enough to grow? What does the gap between posts say about consistency? Is the top posting day actually optimal for this niche and audience? Are recent videos performing better or worse than older ones — and what this means for growth trajectory. Give a specific recommended posting schedule (days + frequency).

SECTION 7 type="text" title="Engagement Quality & Audience Loyalty"
body: Analyse what the engagement rate says about audience quality. Is this a loyal niche audience (high eng rate, repeat viewers) or a casual broad audience (high views, low engagement)? Which videos have the highest engagement rate (not just views) — what does this reveal about the core audience? What content type generates the most comments — why does this matter for algorithm? Give a specific recommendation to improve engagement quality.

SECTION 8 type="kv" title="30-Day Growth Action Plan"
rows: 8 rows with k="Day/Week X" and v=specific action. Cover: exact posting days to start with, 3 specific video topics to make first, format changes, one engagement experiment, one SEO improvement, one thumbnail test. Every action is concrete — no "post more consistently" type vague advice.

Scores (name/score/why — exact field names):
"Title CTR Potential" why=quote weakest title pattern with view count
"Posting Consistency" why=quote actual posts/month + gap between posts
"Niche Focus" why=describe topic spread with percentage
"Engagement Quality" why=quote actual engagement rate vs typical niche benchmark
"Growth Trajectory" why=compare newest 5 videos avg views vs oldest 5

verdict.level: "green" (score 70+) / "yellow" (40-69) / "red" (below 40).
verdict.title: 7-word channel health verdict naming the #1 strength and #1 problem.
verdict.text: sentence 1=biggest genuine strength with data. sentence 2=single biggest problem holding back growth.
bottomLine: ONE specific change to make THIS WEEK — exact topic, format, posting day, expected impact.`;
bottomLine: ONE specific change to make this week — name the exact action, day, and expected impact.`;


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
      maxTokens: 7000,
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
