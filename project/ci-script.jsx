// ContentIntel — Script tab (full checker)

const {
  MOODS: SM, TrafficLight: STL, Block: SB, ScoreItem: SSI, Issue: SIs,
  CopyBlock: SCB, ChipGroup: SCG, Toggle: STg, RunButton: SRB,
  WorkHead: SWH, LoadingResults: SLR,
} = window;

const DEFAULT_SCRIPT = `Most people quit their new habit in the first week. Here's the one trick that fixed it for me.

When I started, I tried to do an hour a day. By day three I'd already given up.

So I changed one thing: I made the goal embarrassingly small. Two minutes. That's it.

Two minutes is too small to skip. And once you start, you usually keep going.

Within a month, two minutes had quietly turned into thirty — without any willpower.

The point isn't the two minutes. It's showing up every single day.

So pick your habit, shrink it until it feels almost silly, and just start.

If this helped, save it — and tell me in the comments which habit you're starting.`;

const SAMPLE_REPORT_TEXT = `ContentIntel — Script report (sample)

OVERALL: 73/100 — Strong hook, soft middle.

SCORES
- Hook strength: 84
- Retention / open loops: 58
- Pacing & delivery: 69
- Emotional arc: 54
- CTA: 62

BIGGEST FIX
Cut the proof section in half — lead with the result, drop the setup list. That is the only stretch where predicted retention falls.

(Add your Anthropic API key to analyse your real script and copy the full report.)`;

function ScriptTab({ onOpenKey }) {
  const mood = 'navy';
  const m = SM[mood];

  const [text, setText] = React.useState('');
  const [textB, setTextB] = React.useState('');
  const [compare, setCompare] = React.useState(false);
  const [lang, setLang] = React.useState('Auto-detect');
  const [kind, setKind] = React.useState('Education');
  const [who, setWho] = React.useState('General');
  const [where, setWhere] = React.useState('Reels');
  const [rewrite, setRewrite] = React.useState({ open: false, dir: '', loading: false, out: null });
  const fileRef = React.useRef(null);

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '').trim();
      if (content) { if (compare && text.trim()) setTextB(content); else setText(content); }
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  const { state, report, usage, err, run } = window.useAnalysis('script');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const seconds = Math.round(words / 2.5); // ~150 wpm
  const lengthOk = where === 'Reels' || where === 'Shorts' ? seconds <= 35 : true;

  const userText =
    `Language: ${lang === 'Auto-detect' ? '(detect from the script)' : lang}\nContent type: ${kind}\nAudience: ${who}\nPublishing to: ${where}\nWord count: ${words} (~${seconds}s)\n\n` +
    `SCRIPT (Version A):\n${text}` +
    (compare && textB.trim()
      ? `\n\nSCRIPT (Version B):\n${textB}\n\nCompare Version A and Version B and declare the winner (fill the "winner" field).`
      : '');
  const estIn = window.estTokens(window.buildSystem('script'), userText);

  function check() { run({ userText, maxTokens: 5200 }); }

  // Turn the analysis report into a short brief the rewriter can act on.
  function feedbackBrief() {
    if (!report || typeof report !== 'object') return '';
    const parts = [];
    if (report.verdict) parts.push(`Verdict: ${report.verdict.title || ''} — ${report.verdict.text || ''}`);
    if (Array.isArray(report.scores) && report.scores.length)
      parts.push('Scores: ' + report.scores.map(s => `${s.name} ${Math.round(s.score)}/100 (${s.why})`).join('; '));
    (report.sections || []).forEach(sec => {
      if (sec && sec.type === 'issues')
        parts.push((sec.title || 'Issues') + ': ' + (sec.items || []).map(i => i.text).join(' | '));
    });
    if (report.bottomLine) parts.push('Highest-impact fix: ' + report.bottomLine);
    return parts.filter(Boolean).join('\n');
  }

  async function doRewrite() {
    setRewrite(r => ({ ...r, loading: true, out: null }));
    try {
      const brief = feedbackBrief();
      const langPart = lang === 'Auto-detect' ? '(keep the script\'s original language)' : `in ${lang}`;
      const { text: out } = await window.callClaude({
        system: 'You are an expert short-form scriptwriter. Rewrite the script so it fixes the listed problems. Return ONLY the rewritten script — no preamble, no commentary, no markdown.',
        userText:
          `Rewrite this ${where} video script ${langPart}, keeping it natural and conversational.\n\n` +
          (brief ? `APPLY THIS ANALYSIS FEEDBACK — fix each point:\n${brief}\n\n` : '') +
          (rewrite.dir ? `Extra direction from the creator: ${rewrite.dir}\n\n` : 'Focus: stronger hook, tighter middle, one clear CTA.\n\n') +
          `ORIGINAL SCRIPT:\n${text}`,
        maxTokens: 1500,
      });
      setRewrite(r => ({ ...r, loading: false, out: (out || '').trim() }));
    } catch (e) {
      const msg = String(e.message) === 'NO_KEY'
        ? 'Add your Anthropic API key (top-right) to use the live rewriter.'
        : 'Could not reach the rewriter — ' + (e.message || 'try again in a moment.');
      setRewrite(r => ({ ...r, loading: false, out: msg }));
    }
  }

  // The "regenerate from feedback" panel — shown under BOTH the real report and the sample.
  const rewritePanel = (
    <SB mood={mood}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>🔄 Regenerate this script from the feedback above</div>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '6px 0 12px' }}>
        We'll apply the analysis and rewrite your script. Add an optional direction:
      </div>
      <input className="ci-input" value={rewrite.dir} onChange={e => setRewrite(r => ({ ...r, dir: e.target.value }))}
        placeholder="e.g. 'Make it funnier' · 'More aggressive hook' · 'Shorten for Reels' · 'Add more numbers'" />
      <div style={{ marginTop: 12 }}>
        <SRB mood={mood} onClick={doRewrite} loading={rewrite.loading}>Rewrite my script →</SRB>
      </div>
      {rewrite.out && (
        <div style={{ marginTop: 14 }}>
          <Eyebrow mood={mood} glow>Improved script</Eyebrow>
          <div className="ci-copyblock" style={{ display: 'block', marginTop: 8 }}>
            <div className="ci-copyblock-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{rewrite.out}</div>
            <button className="ci-copybtn" style={{ height: 34, marginTop: 12 }}
              onClick={() => window.copyText(rewrite.out)}>⧉ Copy script</button>
          </div>
        </div>
      )}
    </SB>
  );

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <SWH mood={mood} eyebrow="Script check" title="Check your script"
        sub="Paste your video script. We'll tell you what's working, what's not, and how to fix it — line by line." />

      {/* INPUT */}
      <SB mood={mood} style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <STg on={compare} onChange={setCompare} mood={mood}>Compare two versions</STg>
          <input ref={fileRef} type="file" accept=".txt,.md,.text,text/plain" style={{ display: 'none' }} onChange={onFile} />
          <button type="button" className="ci-drop" style={{ minHeight: 40, padding: '8px 14px', width: 'auto', border: '1px solid var(--stroke-1)' }}
            onClick={() => fileRef.current && fileRef.current.click()}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10.5V3M5 6l3-3 3 3M3 11.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>
            Upload a file (.txt, .md)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: compare ? '1fr 1fr' : '1fr', gap: 12 }}>
          <div>
            {compare && <label className="ci-label">Version A</label>}
            <textarea className="ci-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste your script here…" />
          </div>
          {compare && (
            <div>
              <label className="ci-label">Version B</label>
              <textarea className="ci-textarea" value={textB} onChange={e => setTextB(e.target.value)} placeholder="Paste the second version here..." />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          <SCG label="Language" options={['Auto-detect', 'English', 'Hindi', 'Hinglish', 'Spanish', 'Other']} value={lang} onChange={setLang} />
          <SCG label="Content" options={['Education', 'Entertainment', 'Tech', 'Fitness', 'Comedy', 'Vlog', 'Finance', 'Ad', 'Other']} value={kind} onChange={setKind} />
          <SCG label="Audience" options={['General', 'Gen Z', 'Millennials', 'Professionals', 'Beginners']} value={who} onChange={setWho} />
          <SCG label="Going to" options={['Reels', 'TikTok', 'Shorts', 'YouTube', 'Other']} value={where} onChange={setWhere} />
        </div>

        <div className="ci-wpm" style={{ marginTop: 16 }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="var(--text-3)" strokeWidth="1.6"><path d="M2.5 13V3M2.5 13h11M5 11V8M8 11V5.5M11 11V7"/></svg>
          <span>Word count: <b>{words}</b></span>
          <span style={{ color: 'var(--text-5)' }}>·</span>
          <span>Video length: <b>~{seconds}s</b></span>
          <span style={{ color: 'var(--text-5)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: lengthOk ? '#8FD86A' : '#F0C85A' }}>
            <span className={'ci-dot ' + (lengthOk ? 'green' : 'yellow')} /> {lengthOk ? `Good length for ${where}` : `A bit long for ${where} — consider trimming`}
          </span>
        </div>

        <div style={{ marginTop: 16 }}>
          <window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label="Check my script" />
        </div>
      </SB>

      {/* RESULTS */}
      {state === 'loading' && <div style={{ marginTop: 14 }}><SLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {/* Real AI report (key OR free Claude AI) */}
      {state === 'done' && report && (
        <div className="ci-results" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.UsageBadge usage={usage} />
          <window.ReportView report={report} mood={mood} />
          {rewritePanel}
        </div>
      )}

      {/* Sample report (no key / fallback) */}
      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> This is a <b>sample report</b>. Add your Anthropic API key to analyze <i>your</i> script for real → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>

          <TrafficLight level="yellow" title="Needs work"
            text="Fix the issues marked in red before posting. Your topic is strong — the opening and middle need attention." />

          {/* Fix these first */}
          <SB title="Fix these first" desc="These 3 things will make the biggest difference" mood={mood}
            right={<span className="pill" style={{ height: 26 }}>🎯 Priority</span>}>
            <SSI mood={mood} name="Opening hook" score={62} why="Your first line doesn't give the viewer a reason to stay. It starts too slow — the question is good but the delivery buries it." />
            <SSI mood={mood} name="Will they stay" score={71} why="Good flow in the middle, but energy drops around line 8–10. Viewers may swipe before the payoff." />
            <SSI mood={mood} name="Will they engage" score={55} why="Missing a clear call-to-action. Viewers won't know what to do next — no follow, comment, or save prompt." />
          </SB>

          {/* Hook */}
          <SB title="Your hook" desc="Hook type: Question hook" mood={mood}>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>A question hook works, but yours asks then stalls. Lead with the stakes, then the question. Here's a stronger version:</div>
            <SCB text={`90% log SIP mein paisa ganwa dete hain — aur galti sirf ek hoti hai. Aaj woh galti main aapko dikhata hoon.`} label="Copy hook" />
          </SB>

          {/* Curiosity loops */}
          <SB title="Curiosity loops" desc="Open questions: 3 found" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <SIs level="green">You asked <i>"kya aapko pata hai…"</i> at line 1 — answered at line 9 ✓</SIs>
              <SIs level="green">You asked <i>"lekin kyun?"</i> at line 4 — answered at line 4 ✓</SIs>
              <SIs level="red">You hinted <i>"compounding ka magic"</i> at line 8 — never shown. Pay it off with a number.</SIs>
            </div>
          </SB>

          {/* Emotion map */}
          <SB title="How your script feels, line by line" mood={mood}>
            <div className="ci-emotion">
              {[
                ['L1', 'Curiosity', '#67C6FF'], ['L3', 'Neutral', '#8B93A7'], ['L4', 'Surprise', '#A78BFA'],
                ['L6', 'Neutral', '#8B93A7'], ['L8', 'Neutral', '#8B93A7'], ['L9', 'Relief', '#8FD86A'],
              ].map(([l, name, c]) => (
                <div key={l} className="ci-emotion-cell">
                  <div className="ci-emotion-line">{l}</div>
                  <div className="ci-emotion-name" style={{ color: c }}>{name}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.2)' }}>
              <span className="ci-dot yellow" style={{ marginTop: 4 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>Lines 6–8 feel the same. Add a shift — a surprising number, a quick story, or a tone change — to reset attention.</span>
            </div>
          </SB>

          {/* Issues */}
          <SB title="What we found" mood={mood}>
            <SIs level="red">No pattern interrupt for 6 lines straight. Viewer will get bored around line 5.</SIs>
            <SIs level="yellow">Your main point ("galat fund choose karte hain") doesn't land until 50% through. Move it earlier.</SIs>
            <SIs level="green">Good use of Hinglish — feels natural and relatable for working people.</SIs>
          </SB>

          {/* Structure */}
          <SB title="Structure" mood={mood}>
            {[
              ['Emotional flow', 'Starts curious, goes flat in the middle, picks up at the end.'],
              ['Speed', `${words} words for a ${seconds}s ${where}. Either cut ~30 words or stretch to 60 seconds.`],
              ['Pattern breaks', 'Only 1 found. Add at least 2–3 more — a question, a visual cue, a tone shift.'],
              ['Value timing', 'You deliver something useful around 50% in. Aim for the 30% mark.'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, padding: '11px 0', borderTop: '1px solid var(--stroke-1)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{k}</span>
                <span style={{ color: 'var(--text-1)', lineHeight: 1.5 }}>{v}</span>
              </div>
            ))}
          </SB>

          {/* Drop-off */}
          <SB title="Where viewers will drop off" mood={mood}>
            <SIs level="yellow">Line 3: Long explanation with no payoff yet. Viewers may leave here.</SIs>
            <SIs level="yellow">Line 7: Repetition of "consistent / patience" point. Feels like filler.</SIs>
          </SB>

          {/* CTA rewrite */}
          <SB title="Your ending is weak" desc="Here's a stronger close that tells viewers what to do" mood={mood}>
            <SCB text={`Agar yeh kaam aaya, toh save kar lo — next video mein woh 3 funds bataunga jo main khud use karta hoon. Follow kar lo taaki miss na ho.`} label="Copy CTA" />
          </SB>

          {/* Titles */}
          <SB title="Titles that fit this script" mood={mood}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '90% Log SIP Mein Yeh Galti Karte Hain (Aap Mat Karna)',
                'SIP Se Paisa Kyun Doobta Hai? Asli Wajah',
                'Maine SIP Mein Paisa Ganwaya — Phir Yeh Seekha',
              ].map((t, i) => <SCB key={i} text={t} label="Copy" />)}
            </div>
          </SB>

          {/* SEO + description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SB title="YouTube tags" desc="142 / 500 characters used" mood={mood}>
              <SCB mono text="SIP, mutual funds, sip investment, sip mistakes, finance hindi, paisa invest, sip kaise kare, compounding, long term investment" label="Copy tags" />
            </SB>
            <SB title="Ready-to-use description" mood={mood}>
              <SCB text="SIP mein 90% log yeh ek galti karte hain. Is video mein samjhaaya hai ki kaise sahi fund choose karein aur long-term wealth banayein. ⏱ 0:00 Intro 0:08 Galti 0:20 Solution. #SIP #MutualFunds #FinanceHindi" label="Copy" />
            </SB>
          </div>

          {/* Verdict */}
          <SB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#07090E', fontWeight: 700 }}>✦</div>
              <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--text-1)' }}>
              Your hook is weak and the middle drags, but the topic is strong and the ending has potential. Fix the opening 2 lines and add a pattern break around line 6 — <span style={{ color: m.accentFrom, fontWeight: 600 }}>that alone will significantly improve retention.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="ci-copybtn" style={{ height: 34 }} onClick={() => window.copyText(SAMPLE_REPORT_TEXT)}>📋 Copy full report</button>
              <button className="ci-copybtn" style={{ height: 34 }} onClick={() => window.downloadText(SAMPLE_REPORT_TEXT, 'script-report.txt')}>↓ Download as text file</button>
            </div>
          </SB>

          {/* Regenerate from feedback */}
          {rewritePanel}

        </div>
      )}
    </div>
  );
}
window.ScriptTab = ScriptTab;

