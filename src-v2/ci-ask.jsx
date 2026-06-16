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
  const live = window.liveResearch();
  const core = live.core || '';
  const askR = window.getResearch('ask') || {};
  const scriptR = window.getResearch('script') || {};
  const thumbR = window.getResearch('thumbnail') || {};
  return [
    `You are ContentIntel's growth strategist. Answer the user's question directly, specifically and practically — cite numbers, thresholds, and tactics, not vague tips.`,
    `WEB VERIFICATION: you have a live web_search tool. When the answer depends on current facts, platform features, algorithm changes, numbers, pricing, tools or anything time-sensitive, search and cross-check multiple real sources FIRST, then answer from what you actually find -- never guess or rely on stale memory, and never ask the user to provide sources. Skip searching only for timeless, opinion-based questions.`,
    `LANGUAGE LAW: answer in the same language as the question (Hindi -> Hindi, Hinglish -> Hinglish, English -> English).`,
    core ? `PLATFORM & ALGORITHM RESEARCH (ground your answer in this):\n"""\n${core}\n"""` : '',
    scriptR.systemGuidance ? `HOOK & SCRIPT SCIENCE:\n${String(scriptR.systemGuidance).slice(0, 900)}` : '',
    thumbR.systemGuidance ? `THUMBNAIL SCIENCE:\n${String(thumbR.systemGuidance).slice(0, 600)}` : '',
    askR.systemGuidance || '',
    askR.notes || 'Output JSON: {"answer":"2-5 short paragraphs with specific numbers/thresholds","steps":["3-6 concrete do-today actions"],"related":["2-3 follow-up questions"]}. Return ONLY the JSON object.',
  ].filter(Boolean).join('\n\n');
}

function AskTab({ onOpenKey }) {
  const mood = 'violet';
  const m = AM[mood];
  const [q, setQ] = React.useState('');
  const [state, setState] = React.useState('idle'); // idle | loading | done | error
  const [err, setErr] = React.useState('');
  // Thread: array of { q, out } — newest last. Displayed newest-first.
  const [thread, setThread] = React.useState([]);
  const inputRef = React.useRef(null);
  const SS_ASK = 'ci_ask_session';

  // Rehydrate thread from sessionStorage on mount so it survives tab switches.
  React.useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SS_ASK) || 'null');
      if (Array.isArray(saved) && saved.length > 0) setThread(saved);
    } catch (e) {}
  }, []);

  // Persist thread to sessionStorage on every change.
  React.useEffect(() => {
    try {
      if (thread.length > 0) sessionStorage.setItem(SS_ASK, JSON.stringify(thread));
      else sessionStorage.removeItem(SS_ASK);
    } catch (e) {}
  }, [thread]);

  const currentOut = thread.length > 0 ? thread[thread.length - 1] : null;
  const pastThread = thread.slice(0, -1).reverse(); // older items, newest-first

  async function ask(question) {
    const text = String(question || q).trim();
    if (!text || state === 'loading') return;
    setQ(''); setErr(''); setState('loading');
    try {
      // Prepend up to 4 prior Q/A turns as context for follow-up questions.
      const ctx = thread.slice(-4).map(t => `Q: ${t.q}\nA: ${typeof t.out.answer === 'string' ? t.out.answer.slice(0, 700) : ''}...`).join('\n\n');
      const userText = ctx ? `PREVIOUS CONTEXT:\n${ctx}\n\nQUESTION: ${text}` : `QUESTION: ${text}`;
      const { text: raw } = await window.callClaude({
        system: buildAskSystem(),
        userText,
        maxTokens: 1600,
        temperature: 0.5,
      });
      let json = window.parseReport(raw);
      if (!json || (!json.answer && !json.steps)) {
        const body = (raw || '').trim();
        if (!body) throw new Error('Empty response — try again.');
        json = { answer: body, steps: [], related: [] };
      }
      setThread(prev => [...prev.slice(-4), { q: text, out: json }]);
      setState('done');
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

  function startFresh() {
    setThread([]); setQ(''); setErr(''); setState('idle');
    try { sessionStorage.removeItem('ci_ask_session'); } catch (e) {}
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
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
            placeholder={thread.length > 0 ? 'Ask a follow-up...' : 'e.g. Why are my Reels stuck at 200 views?'} />
          <ARB mood={mood} onClick={() => ask()} loading={state === 'loading'}>Ask →</ARB>
        </div>
        {thread.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {ASK_SUGGESTIONS.map(s => (
              <button key={s} className="pill" style={{ height: 32, fontSize: 12.5 }} onClick={() => ask(s)}>{s}</button>
            ))}
          </div>
        )}
        {thread.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{thread.length} question{thread.length !== 1 ? 's' : ''} in this conversation</span>
            <button className="ci-copybtn" style={{ height: 26, padding: '0 10px', fontSize: 11 }} onClick={startFresh}>Start fresh</button>
          </div>
        )}
      </AB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><ALR rows={3} /></div>}
      {state === 'error' && (
        <div className="ci-block" style={{ marginTop: 14, border: '1px solid rgba(245,120,140,0.3)' }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{err}</div>
          <button className="ci-copybtn" style={{ height: 32, marginTop: 12 }} onClick={onOpenKey}>Open Settings</button>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-4)' }}>Or try one of these:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {ASK_SUGGESTIONS.slice(0, 4).map(s => (
              <button key={s} className="pill" style={{ height: 30, fontSize: 12 }} onClick={() => { setState('idle'); setErr(''); ask(s); }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {(state === 'done' || state === 'idle') && currentOut && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Current answer */}
          <AB mood={mood}>
            <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginBottom: 10 }}>You asked: <i>{currentOut.q}</i></div>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-1)', whiteSpace: 'pre-wrap' }}>{currentOut.out.answer}</div>
          </AB>

          {Array.isArray(currentOut.out.steps) && currentOut.out.steps.length > 0 && (
            <AB title="Do this today" mood={mood}>
              {currentOut.out.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, color: '#07090E', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12.5 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-1)' }}>{st}</span>
                </div>
              ))}
            </AB>
          )}

          {Array.isArray(currentOut.out.related) && currentOut.out.related.length > 0 && (
            <AB title="Follow-up questions" mood={mood}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentOut.out.related.map((r, i) => (
                  <button key={i} className="pill" style={{ height: 'auto', minHeight: 36, fontSize: 13.5, justifyContent: 'flex-start', textAlign: 'left', padding: '8px 14px', whiteSpace: 'normal' }} onClick={() => ask(r)}>
                    {r} →
                  </button>
                ))}
              </div>
            </AB>
          )}

          {/* Previous answers in thread */}
          {pastThread.length > 0 && (
            <details style={{ marginTop: 4 }}>
              <summary style={{ fontSize: 12.5, color: 'var(--text-4)', cursor: 'pointer', padding: '8px 0', userSelect: 'none' }}>
                ▸ {pastThread.length} earlier question{pastThread.length !== 1 ? 's' : ''} in this conversation
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {pastThread.map((item, i) => (
                  <div key={i} className="ci-block" style={{ padding: '14px 16px', opacity: 0.75 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 6 }}>Q: <i>{item.q}</i></div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{typeof item.out.answer === 'string' ? item.out.answer.slice(0, 400) : ''}{item.out.answer && item.out.answer.length > 400 ? '…' : ''}</div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
window.AskTab = AskTab;
