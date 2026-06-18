// ContentIntel — Caption & Description Generator

const CAPTION_SYSTEM = [
  "You are an expert social media copywriter for video creators.",
  "Write platform-optimised captions, descriptions and hashtag sets that maximise clicks, saves, watch-time and shares.",
  "",
  "Platform rules:",
  "• YouTube description: 2–3 sentence SEO-optimised opener with the most important keywords in line 1; a short 'What you'll learn' bullet list; a CTA (subscribe / watch next); timestamps line if relevant; links placeholder.",
  "• Instagram/Reels caption: punchy hook on line 1 (under 125 chars before the fold), 2–3 lines body with emotion + value + CTA, 5–8 relevant emojis scattered naturally.",
  "• TikTok caption: max 150 chars total, conversational/slang tone, 3–5 relevant trend hashtags inline.",
  "• LinkedIn post: professional angle, insight or story hook, 3 short paragraphs, 3–5 hashtags at the end.",
  "• Hashtags block: YouTube (8–12 tags, NO # symbol), Instagram (20–25 tags with #), TikTok (5–7 trend tags with #).",
  "",
  "Output ONLY the submit_report tool call. No prose outside the tool.",
  "Use sections of type 'copy' — one section per platform, one final section for Hashtags.",
  "Each copy block should have a short label and the full ready-to-use text.",
].join("\n");

function CaptionTab({ onOpenKey }) {
  const mood = 'lime';
  const m = MOODS[mood] || MOODS.burgundy;
  const [title, setTitle] = React.useState('');
  const [desc,  setDesc]  = React.useState('');
  const [plats, setPlats] = React.useState(['youtube', 'instagram', 'tiktok']);

  const { state, report, usage, err, run, reset } = useAnalysis('caption');
  const loading = state === 'loading';
  const estIn   = estTokens(CAPTION_SYSTEM, title, desc);

  const PLATFORMS = [
    { id: 'youtube',   label: 'YouTube',   col: '#FF0000' },
    { id: 'instagram', label: 'Instagram', col: '#E1306C' },
    { id: 'tiktok',    label: 'TikTok',    col: '#69C9D0' },
    { id: 'linkedin',  label: 'LinkedIn',  col: '#0A66C2' },
  ];

  function toggle(id) {
    setPlats(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    reset();
  }

  function generate() {
    if (!title.trim()) return;
    const profileCtx = typeof window.getProfileContext === 'function' ? window.getProfileContext() : '';
    const system = CAPTION_SYSTEM + (profileCtx ? '\n\nCreator context (personalise accordingly):\n' + profileCtx : '');
    const platList = plats.length ? plats.map(id => PLATFORMS.find(p => p.id === id)?.label).filter(Boolean).join(', ') : 'YouTube, Instagram, TikTok';
    run({
      system,
      userText: [
        `Video title: ${title.trim()}`,
        desc.trim() ? `Content summary: ${desc.trim()}` : '',
        `Generate captions for: ${platList}`,
        'Add a Hashtags section with platform-specific tag sets.',
      ].filter(Boolean).join('\n'),
      maxTokens: 2200,
    });
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Caption Generator</Eyebrow>
        <h2 className="ci-h2">Captions &amp; Descriptions</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          One video title → platform-ready captions, descriptions and hashtag sets for every channel you post on.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Video title *</span>
            <input className="ci-input" style={{ fontSize: 15 }}
              placeholder="e.g. I invested ₹50,000 in index funds for 1 year — here's what happened"
              value={title} onChange={e => { setTitle(e.target.value); reset(); }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>What the video covers <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span>
            <textarea className="ci-input" rows={3}
              placeholder="Key topics, takeaways, moments — the more you give, the better the captions"
              value={desc} onChange={e => { setDesc(e.target.value); reset(); }}
              style={{ resize: 'vertical', lineHeight: 1.55 }} />
          </label>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Platforms</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
              {PLATFORMS.map(pl => {
                const on = plats.includes(pl.id);
                return (
                  <button key={pl.id} onClick={() => toggle(pl.id)}
                    style={{ height: 32, padding: '0 14px', borderRadius: 999,
                      border: `1.5px solid ${on ? pl.col : 'var(--stroke-2)'}`,
                      background: on ? pl.col + '18' : 'transparent',
                      color: on ? pl.col : 'var(--text-3)',
                      fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {pl.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Generate captions" loading={loading}
            estIn={estIn} estOut={1800} onClick={generate}
            disabled={!title.trim()} disabledHint="Enter a video title first" />
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
window.CaptionTab = CaptionTab;
