// ContentIntel — Comment Reply Generator

const COMMENTS_SYSTEM = [
  "You are ContentIntel's community manager. Write thoughtful, on-brand replies to YouTube or social media comments that build community, show personality, and signal the algorithm.",
  "LANGUAGE LAW: match the language of each comment exactly.",
  "Comment types and approach:",
  "• Positive/praise: thank genuinely + ask a follow-up question that invites more replies",
  "• Question: answer clearly + invite further discussion",
  "• Constructive criticism: acknowledge the point + provide context or redirect gracefully",
  "• Negative/troll: short, calm, don't feed — or skip replying (say 'skip' as the reply text)",
  "• Spam/irrelevant: reply text = 'skip'",
  "Style rules: warm but real — never sound like a bot. Keep replies under 200 chars unless a detailed answer is genuinely needed. Use emojis only if the commenter did first.",
  "Output only the submit_report tool. Use sections of type 'copy' — one per comment. Title each section with a truncated version of the comment. One block per section with label 'Reply'.",
  "Set verdict.level='green', verdict.title='Replies Ready', verdict.text=one sentence summary (e.g. 'X replies generated, Y skipped').",
  "Add 2 scores: Community Building Potential / Voice Match — each 0-100.",
  "Set bottomLine to one tip for improving comment engagement on this type of content.",
].join("\n");

function CommentsTab({ onOpenKey }) {
  const mood = 'cyan';
  const m = MOODS[mood] || MOODS.burgundy;
  const [mode, setMode] = React.useState('manual');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [fetchState, setFetchState] = React.useState('idle'); // idle | fetching | fetched | error
  const [fetchErr, setFetchErr] = React.useState('');
  const [fetchedComments, setFetchedComments] = React.useState([]);
  const [comments, setComments] = React.useState('');
  const [tone, setTone] = React.useState('Friendly');
  const [context, setContext] = React.useState('');

  const { state, report, usage, err, run, reset } = useAnalysis('comments');
  const loading = state === 'loading';

  const ytKey = window.getYouTubeKey ? window.getYouTubeKey() : '';
  const hasYT = !!ytKey;

  // Count comments in manual mode
  const commentCount = comments.trim()
    ? comments.split(/\n---\n|\n–––\n/).filter(s => s.trim()).length
    : 0;

  async function fetchComments() {
    const videoId = window.parseYTVideoId ? window.parseYTVideoId(videoUrl.trim()) : null;
    if (!videoId) { setFetchErr('Paste a valid YouTube video URL (e.g. youtube.com/watch?v=...).'); setFetchState('error'); return; }
    setFetchState('fetching'); setFetchErr(''); setFetchedComments([]); reset();
    try {
      const items = await window.fetchYTComments(videoId, ytKey, 50);
      if (!items.length) throw new Error('No comments found on this video (comments may be disabled).');
      setFetchedComments(items);
      setFetchState('fetched');
    } catch (e) {
      setFetchErr(e.message || 'Could not fetch comments.');
      setFetchState('error');
    }
  }

  function generate() {
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    let commentText = '';
    if (mode === 'auto' && fetchedComments.length) {
      commentText = fetchedComments.map(c => `${c.author}: ${c.text}`).join('\n---\n');
    } else {
      if (!comments.trim()) return;
      commentText = comments.trim();
    }
    if (!commentText.trim()) return;
    run({
      system: COMMENTS_SYSTEM + (profileCtx ? '\n\nCreator context (match their voice):\n' + profileCtx : ''),
      userText: [
        `Reply tone: ${tone}`,
        context.trim() ? `Video context: ${context.trim()}` : '',
        `Comments (separated by --- on its own line):\n\n${commentText}`,
      ].filter(Boolean).join('\n\n'),
      maxTokens: 2400,
    });
  }

  const canGenerate = mode === 'auto' ? fetchedComments.length > 0 : comments.trim().length > 0;
  const estIn = window.estTokens ? window.estTokens(COMMENTS_SYSTEM, comments, context) : 0;

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Reply Generator</Eyebrow>
        <h2 className="ci-h2">Comment Replies</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Auto-fetch real comments from any YouTube video — or paste them manually — and get thoughtful, on-brand replies instantly.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'auto', label: '⚡ Fetch from YouTube' },
            { id: 'manual', label: '✎ Paste manually' },
          ].map(opt => (
            <button key={opt.id} onClick={() => { setMode(opt.id); reset(); setFetchState('idle'); setFetchedComments([]); }}
              style={{ flex: 1, height: 38, borderRadius: 10, border: `1.5px solid ${mode === opt.id ? m.accentFrom : 'var(--stroke-2)'}`,
                background: mode === opt.id ? m.accentFrom + '18' : 'transparent',
                color: mode === opt.id ? m.accentFrom : 'var(--text-3)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Video context (both modes) */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Video context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — helps answer questions accurately)</span>
            </span>
            <input className="ci-input" placeholder="e.g. Video about starting a SIP with ₹500/month on a finance channel"
              value={context} onChange={e => { setContext(e.target.value); reset(); }} />
          </label>

          {mode === 'auto' && (
            <>
              {!hasYT && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.3)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  <b style={{ color: '#F0C85A' }}>YouTube API key needed</b> — contact support or use manual mode to paste comments.
                </div>
              )}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>YouTube video URL *</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="ci-input" placeholder="youtube.com/watch?v=... or youtu.be/..."
                    value={videoUrl} onChange={e => { setVideoUrl(e.target.value); setFetchState('idle'); setFetchedComments([]); reset(); }}
                    onKeyDown={e => { if (e.key === 'Enter' && hasYT) fetchComments(); }}
                    style={{ flex: 1 }} />
                  <GlowButton mood={mood} onClick={fetchComments}
                    style={{ whiteSpace: 'nowrap', opacity: (!videoUrl.trim() || !hasYT || fetchState === 'fetching') ? 0.5 : 1 }}>
                    {fetchState === 'fetching' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Fetching…
                      </span>
                    ) : 'Fetch comments →'}
                  </GlowButton>
                </div>
              </label>
              {fetchState === 'error' && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(240,90,110,0.08)', border: '1px solid rgba(240,90,110,0.25)', fontSize: 13, color: '#F06A7E' }}>{fetchErr}</div>
              )}
              {fetchState === 'fetched' && fetchedComments.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0,200,200,0.06)', border: '1px solid rgba(0,200,200,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
                    {fetchedComments.length} comments fetched
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                    {fetchedComments.slice(0, 10).map((c, i) => (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface-2)', fontSize: 12.5, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 700, color: m.accentFrom }}>{c.author}</span>
                        <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>{c.text.length > 100 ? c.text.slice(0, 100) + '…' : c.text}</span>
                        {c.likes > 0 && <span style={{ color: 'var(--text-5)', marginLeft: 8, fontSize: 11 }}>👍 {c.likes}</span>}
                      </div>
                    ))}
                    {fetchedComments.length > 10 && (
                      <div style={{ fontSize: 12, color: 'var(--text-4)', textAlign: 'center', padding: '4px 0' }}>
                        +{fetchedComments.length - 10} more comments will be included in the analysis
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {mode === 'manual' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Paste comments *</span>
              <textarea className="ci-input" rows={8}
                placeholder={"Separate each comment with --- on its own line:\n\nThis video changed my life! What app do you use for SIP?\n---\nI've been doing this for 6 months and the returns are amazing 🔥\n---\nI don't agree, markets are too risky right now"}
                value={comments} onChange={e => { setComments(e.target.value); reset(); }}
                style={{ resize: 'vertical', lineHeight: 1.65, fontFamily: 'var(--font-mono)', fontSize: 13 }} />
              {commentCount > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-5)', textAlign: 'right' }}>
                  {commentCount} comment{commentCount !== 1 ? 's' : ''} detected
                </span>
              )}
            </label>
          )}

          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Reply tone</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
              {['Friendly', 'Professional', 'Playful', 'Educational'].map(t => (
                <button key={t} onClick={() => setTone(t)}
                  style={{ height: 30, padding: '0 14px', borderRadius: 999,
                    border: `1px solid ${tone === t ? m.accentFrom : 'var(--stroke-2)'}`,
                    background: tone === t ? m.accentFrom + '18' : 'transparent',
                    color: tone === t ? m.accentFrom : 'var(--text-3)',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Generate replies" loading={loading}
            estIn={estIn} estOut={1800} onClick={generate}
            disabled={!canGenerate}
            disabledHint={mode === 'auto' ? 'Fetch comments from a YouTube video first' : 'Paste at least one comment'} />
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
window.CommentsTab = CommentsTab;
