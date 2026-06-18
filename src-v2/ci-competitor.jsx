// ContentIntel — Competitor Breakdown (with YouTube auto-fetch)

const COMPETITOR_SYSTEM = [
  "You are ContentIntel's competitive intelligence analyst. Break down a competitor's channel with tactical precision.",
  "LANGUAGE LAW: match the language of the submitted titles.",
  "You will receive video data in this format: Title | Views | Likes | Comments | Duration | Age",
  "Use ALL available metrics. Identify their top-performing videos and what makes them work.",
  "Analyse:",
  "• Title hook: what psychological trigger they use (curiosity gap, social proof, fear, aspiration, numbers, controversy)",
  "• Content strategy: what formats, angles and niches they consistently win in",
  "• Audience targeting: exactly who this is made for and why it resonates",
  "• Top performers: which videos get the most views and why (reference actual numbers)",
  "• Content gaps: what angles they missed that YOU could own",
  "• Replication opportunities: what to borrow ethically and improve on",
  "Score 0-100: Title Hook Strength, Audience Targeting Clarity, Content Variety, Gap Opportunity (higher = more opening for you), Overall Threat Level.",
  "Calculate their average views. Identify their highest and lowest performers.",
  "Bottom line: the single highest-leverage move to outperform this competitor.",
  "Required sections:",
  "1. What's working — checklist of their winning patterns (with view counts where available)",
  "2. Their top videos — copy block: list their 3 highest-view videos and what made them work",
  "3. How to beat them — copy blocks: write 3 titles that outperform their best + 1 thumbnail concept",
  "4. Content gaps to exploit — kv list: Gap / Your angle for each opportunity",
  "5. Title patterns to steal — copy block listing their most effective formulas you can adapt",
  "Set verdict.level to 'yellow' (moderate threat) or 'red' (high threat) based on their strength.",
  "Set verdict.title to a punchy threat assessment (e.g. 'Strong competitor — beatable on depth').",
  "Set verdict.text to a 2-sentence summary of their biggest strength and your biggest opportunity.",
].join("\n");

function CompetitorTab({ onOpenKey }) {
  const mood = 'navy';
  const m = MOODS[mood] || MOODS.burgundy;

  const [mode, setMode]       = React.useState(window.getYouTubeKey ? (window.getYouTubeKey() ? 'auto' : 'manual') : 'manual');
  const [handle, setHandle]   = React.useState('');
  const [title, setTitle]     = React.useState('');
  const [recent, setRecent]   = React.useState('');
  const [videoData, setVideoData] = React.useState([]);
  const [thumb, setThumb]     = React.useState(null);
  const [fetchState, setFetchState] = React.useState('idle');
  const [fetchErr, setFetchErr]     = React.useState('');
  const [channelInfo, setChannelInfo] = React.useState(null);
  const fileRef = React.useRef(null);

  const { state, report, usage, err, run, reset } = useAnalysis('competitor');
  const loading = state === 'loading';
  const ytKey = window.getYouTubeKey ? window.getYouTubeKey() : '';

  async function fetchChannel() {
    if (!handle.trim()) return;
    setFetchState('fetching'); setFetchErr(''); setChannelInfo(null); setRecent(''); reset();
    try {
      const ch   = await window.fetchYTChannel(handle.trim(), ytKey);
      const vids = await window.fetchYTVideos(ch.id, ytKey, 20);
      setChannelInfo({ name: ch.snippet.title, subs: ch.statistics.subscriberCount, videoCount: ch.statistics.videoCount });
      setVideoData(vids);
      setRecent(vids.map(v => v.title).join('\n'));
      if (!title.trim() && vids.length) setTitle(vids[0].title);
      setFetchState('fetched');
    } catch (e) {
      setFetchErr(e.message || 'Could not fetch channel data.');
      setFetchState('error');
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
    if (!title.trim() && !recent.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    const chName = channelInfo ? channelInfo.name : handle.trim();
    const hasStats = videoData.length > 0 && parseInt(videoData[0].viewCount || 0) > 0;
    const videoText = videoData.length > 0
      ? (hasStats
          ? `Their recent videos with analytics (${videoData.length}):\n${window.formatVideoStats(videoData)}`
          : `Their recent titles:\n${videoData.map(v=>v.title).join('\n')}`)
      : (recent.trim() ? `Their recent titles:\n${recent.trim()}` : '');
    run({
      system: COMPETITOR_SYSTEM + (profileCtx ? '\n\nYour channel context (counter-strategy must be tailored to this):\n' + profileCtx : ''),
      userText: [
        title.trim() ? `Competitor's standout title: ${title.trim()}` : '',
        chName ? `Competitor channel: ${chName}` : '',
        channelInfo ? `Subscribers: ${Number(channelInfo.subs || 0).toLocaleString()} | Videos: ${channelInfo.videoCount}` : '',
        videoText || '',
        thumb ? '(Their thumbnail is attached — analyse it visually.)' : '',
      ].filter(Boolean).join('\n'),
      images: thumb ? [thumb] : [],
      maxTokens: 2400,
    });
  }

  const fmt = (n) => { const v = parseInt(n || 0); return v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : String(v); };
  const videoCount = recent.trim() ? recent.trim().split('\n').filter(l => l.trim()).length : 0;
  const canAnalyze = title.trim() || recent.trim();

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Competitor Analysis</Eyebrow>
        <h2 className="ci-h2">Competitor Breakdown</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Auto-fetch a competitor's YouTube channel or paste their titles — get a tactical breakdown, counter-titles, and the gaps you can own.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'auto', label: '⚡ Auto-fetch from YouTube' }, { id: 'manual', label: '✎ Enter manually' }].map(opt => (
            <button key={opt.id} onClick={() => { setMode(opt.id); reset(); setChannelInfo(null); setFetchState('idle'); setRecent(''); setTitle(''); setVideoData([]); }}
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
                <b style={{ color: '#F0C85A' }}>YouTube API key needed</b> — add it in Settings → Platform Data tab.{' '}
                <button className="ci-copybtn" style={{ height: 28, padding: '0 10px', fontSize: 12, marginLeft: 8 }} onClick={onOpenKey}>Open Settings</button>
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Competitor's channel handle *</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="ci-input" placeholder="@CompetitorChannel or youtube.com/@Channel"
                  value={handle} onChange={e => { setHandle(e.target.value); setFetchState('idle'); setChannelInfo(null); setRecent(''); reset(); }}
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
              <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(100,120,220,0.07)', border: '1px solid rgba(100,120,220,0.25)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{channelInfo.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>
                  {fmt(channelInfo.subs)} subscribers · {videoCount} recent titles fetched
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Competitor's best / latest title *</span>
              <input className="ci-input" style={{ fontSize: 15 }}
                placeholder="e.g. I Made ₹10 Lakhs From YouTube in 2024 — Here's Exactly How"
                value={title} onChange={e => { setTitle(e.target.value); reset(); }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Their other recent titles <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one per line — reveals strategy)</span></span>
              <textarea className="ci-input" rows={5}
                placeholder={"I Lost ₹2 Lakh in Stocks — What I Learned\nBest Mutual Funds to Buy in 2025\nWhy 90% of Indians Never Get Rich"}
                value={recent} onChange={e => { setRecent(e.target.value); reset(); }}
                style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
            </label>
          </div>
        )}

        {/* Thumbnail upload — available in both modes */}
        <div style={{ marginTop: 14 }}>
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
                  Upload their thumbnail
                </button>}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Break down competitor" loading={loading}
            estIn={estTokens(COMPETITOR_SYSTEM, title, recent)} estOut={1800} onClick={generate}
            disabled={!canAnalyze}
            disabledHint={mode === 'auto' ? 'Fetch a channel first' : 'Enter a competitor title first'} />
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
