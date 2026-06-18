// ContentIntel — Content Repurposer

const REPURPOSE_SYSTEM = [
  "You are ContentIntel's content strategist. Repurpose video content into platform-optimised written formats without losing the creator's voice, facts, or personality.",
  "LANGUAGE LAW: match the language of the submitted content.",
  "Format rules:",
  "• Blog post: 400–600 words, SEO H2 headers, conversational but authoritative, ends with a CTA to watch the video.",
  "• Twitter/X thread: 8–10 tweets, each under 280 chars, numbered 1/N, scroll-stopping hook in tweet 1, value bomb or CTA in the last tweet.",
  "• Email newsletter: subject line + preview text on the first line, then 300-word body split into 2–3 short paragraphs, end with one CTA button text in [brackets].",
  "• LinkedIn article: insight-led opening (no 'I'm excited to share'), 3 short punchy paragraphs, concrete takeaway, 3–5 hashtags at the end.",
  "• YouTube Community post: 2–3 sentences, casual, ends with a question to spark replies.",
  "Rules: preserve the creator's specific examples and numbers. No filler or padding. Each format must stand alone.",
  "Output only the submit_report tool. Use sections of type 'copy' — one per requested format.",
].join("\n");

function RepurposeTab({ onOpenKey }) {
  const mood = 'ember';
  const m = MOODS[mood] || MOODS.burgundy;
  const [content, setContent] = React.useState('');
  const [formats, setFormats] = React.useState(['blog', 'twitter', 'email']);

  const { state, report, usage, err, run, reset } = useAnalysis('repurpose');
  const loading = state === 'loading';
  const estIn = estTokens(REPURPOSE_SYSTEM, content);

  const FORMATS = [
    { id: 'blog',      label: 'Blog post',            col: '#F0C85A' },
    { id: 'twitter',   label: 'Twitter/X thread',     col: '#1D9BF0' },
    { id: 'email',     label: 'Email newsletter',      col: '#8FD86A' },
    { id: 'linkedin',  label: 'LinkedIn article',      col: '#0A66C2' },
    { id: 'community', label: 'Community post',        col: '#FF0000' },
  ];

  function toggle(id) {
    setFormats(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    reset();
  }

  function generate() {
    if (!content.trim() || !formats.length) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    const fmtLabels = formats.map(id => FORMATS.find(f => f.id === id)?.label).filter(Boolean).join(', ');
    run({
      system: REPURPOSE_SYSTEM + (profileCtx ? '\n\nCreator context:\n' + profileCtx : ''),
      userText: `Repurpose into: ${fmtLabels}\n\n---\n${content.trim()}`,
      maxTokens: 3400,
    });
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Repurpose</Eyebrow>
        <h2 className="ci-h2">Content Repurposer</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          Paste your script, transcript, or video description — get blog posts, Twitter threads, emails, LinkedIn articles, and Community posts ready to publish.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Script / transcript / description *</span>
            <textarea className="ci-input" rows={9}
              placeholder="Paste your video script, transcript, or a detailed description of what the video covers. The more detail you give, the better the repurposed content."
              value={content} onChange={e => { setContent(e.target.value); reset(); }}
              style={{ resize: 'vertical', lineHeight: 1.65 }} />
            {wordCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-5)', textAlign: 'right' }}>~{wordCount} words</span>
            )}
          </label>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Output formats</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
              {FORMATS.map(f => {
                const on = formats.includes(f.id);
                return (
                  <button key={f.id} onClick={() => toggle(f.id)}
                    style={{ height: 32, padding: '0 14px', borderRadius: 999,
                      border: `1.5px solid ${on ? f.col : 'var(--stroke-2)'}`,
                      background: on ? f.col + '18' : 'transparent',
                      color: on ? f.col : 'var(--text-3)',
                      fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Repurpose content" loading={loading}
            estIn={estIn} estOut={2800} onClick={generate}
            disabled={!content.trim() || !formats.length}
            disabledHint={!content.trim() ? 'Paste your content first' : 'Select at least one format'} />
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
window.RepurposeTab = RepurposeTab;
