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
  const [comments, setComments] = React.useState('');
  const [tone, setTone] = React.useState('Friendly');
  const [context, setContext] = React.useState('');

  const { state, report, usage, err, run, reset } = useAnalysis('comments');
  const loading = state === 'loading';
  const estIn = estTokens(COMMENTS_SYSTEM, comments, context);

  const commentCount = comments.trim()
    ? comments.split(/\n---\n|\n–––\n/).filter(s => s.trim()).length
    : 0;

  function generate() {
    if (!comments.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    run({
      system: COMMENTS_SYSTEM + (profileCtx ? '\n\nCreator context (match their voice):\n' + profileCtx : ''),
      userText: [
        `Reply tone: ${tone}`,
        context.trim() ? `Video context: ${context.trim()}` : '',
        `Comments (separated by --- or blank lines):\n\n${comments.trim()}`,
      ].filter(Boolean).join('\n\n'),
      maxTokens: 2000,
    });
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Reply Generator</Eyebrow>
        <h2 className="ci-h2">Comment Replies</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Paste your comments — get thoughtful, on-brand replies that build community, boost engagement, and save you time.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Video context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — helps with answers)</span></span>
            <input className="ci-input" placeholder="e.g. Video about starting a SIP with ₹500/month, posted on finance channel"
              value={context} onChange={e => { setContext(e.target.value); reset(); }} />
          </label>
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
            estIn={estIn} estOut={1600} onClick={generate}
            disabled={!comments.trim()} disabledHint="Paste at least one comment" />
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
