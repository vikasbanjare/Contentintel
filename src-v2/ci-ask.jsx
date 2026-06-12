// ContentIntel — Ask tab: research-grounded growth Q&A (Instagram / YouTube / any platform)

const { MOODS: AM, Block: AB, RunButton: ARB, WorkHead: AWH, LoadingResults: ALR } = window;

const ASK_SUGGESTIONS = [
  'Why are my Reels stuck at 200 views?',
  'Best time to post on Instagram?',
  'How many hashtags should I actually use?',
  'How do I get more saves and shares?',
  'Reels vs carousels — what grows faster?',
  'How do I do Instagram SEO for my page?',
  "My followers grow but views don't. Why?",
  'How much should I charge for a brand deal?',
  'What should I post on each day of the week?',
  'How do trial reels work?',
];

function buildAskSystem() {
  const core = (window.liveResearch().core || '');
  const askR = window.getResearch('ask') || {};
  return [
    `You are ContentIntel's growth strategist. Answer the user's question directly, specifically and practically.`,
    `LANGUAGE LAW: answer in the same language as the question (Hindi -> Hindi, Hinglish -> Hinglish, English -> English).`,
    core ? 'SHARED RESEARCH:\n"""\n' + core + '\n"""' : '',
    askR.systemGuidance || '',
    askR.notes || 'Output JSON: {"answer":"2-5 short paragraphs","steps":["3-6 do-today actions"],"related":["2-3 follow-up questions"]}. Return ONLY the JSON object.',
  ].filter(Boolean).join('\n\n');
}

function AskTab({ onOpenKey }) {
  const mood = 'violet';
  const m = AM[mood];
  const [q, setQ] = React.useState('');
  const [state, setState] = React.useState('idle'); // idle | loading | done | error
  const [out, setOut] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [asked, setAsked] = React.useState('');
  const inputRef = React.useRef(null);

  async function ask(question) {
    const text = String(question || q).trim();
    if (!text) return;
    setQ(text); setAsked(text); setErr(''); setOut(null); setState('loading');
    try {
      const { text: raw } = await window.callClaude({
        system: buildAskSystem(),
        userText: `QUESTION: ${text}`,
        maxTokens: 1600,
      });
      let json = window.parseReport(raw);
      if (!json || (!json.answer && !json.steps)) {
        const body = (raw || '').trim();
        if (!body) throw new Error('Empty response — try again.');
        json = { answer: body, steps: [], related: [] };
      }
      setOut(json); setState('done');
      try { window.saveHistory({ type: 'ask', t: Date.now(), level: 'green', score: null, title: text.slice(0, 80) }); } catch (e) {}
      document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (String(e.message) === 'NO_KEY') {
        setErr('Add your Anthropic API key (top-right) to ask live questions — it takes 30 seconds.');
      } else {
        setErr(e.message || 'Something went wrong — try again.');
      }
      setState('error');
    }
  }

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <AWH mood={mood} eyebrow="Ask anything" title="Your growth questions, answered"
        sub="Instagram, YouTube, Reels, SEO, brand deals — ask in any language. Answers come from real platform research, not generic advice." />

      <AB mood={mood} style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input ref={inputRef} className="ci-input" style={{ fontSize: 15.5, height: 52 }}
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') ask(); }}
            placeholder="e.g. Why are my Reels stuck at 200 views?" />
          <ARB mood={mood} onClick={() => ask()} loading={state === 'loading'}>Ask →</ARB>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {ASK_SUGGESTIONS.map(s => (
            <button key={s} className="pill" style={{ height: 32, fontSize: 12.5 }} onClick={() => ask(s)}>{s}</button>
          ))}
        </div>
      </AB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><ALR rows={3} /></div>}
      {state === 'error' && (
        <div className="ci-block" style={{ marginTop: 14, border: '1px solid rgba(245,120,140,0.3)' }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{err}</div>
          <button className="ci-copybtn" style={{ height: 32, marginTop: 12 }} onClick={onOpenKey}>Open Settings</button>
        </div>
      )}

      {state === 'done' && out && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AB mood={mood}>
            <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginBottom: 10 }}>You asked: <i>{asked}</i></div>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-1)', whiteSpace: 'pre-wrap' }}>{out.answer}</div>
          </AB>

          {Array.isArray(out.steps) && out.steps.length > 0 && (
            <AB title="Do this today" mood={mood}>
              {out.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, color: '#07090E', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12.5 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-1)' }}>{st}</span>
                </div>
              ))}
            </AB>
          )}

          {Array.isArray(out.related) && out.related.length > 0 && (
            <AB title="People also ask" mood={mood}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {out.related.map((r, i) => (
                  <button key={i} className="pill" style={{ height: 'auto', minHeight: 36, fontSize: 13.5, justifyContent: 'flex-start', textAlign: 'left', padding: '8px 14px', whiteSpace: 'normal' }} onClick={() => ask(r)}>
                    {r} →
                  </button>
                ))}
              </div>
            </AB>
          )}
        </div>
      )}
    </div>
  );
}
window.AskTab = AskTab;
