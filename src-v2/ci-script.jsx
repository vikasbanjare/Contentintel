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
  // Receive a draft sent from the Create tab ("Refine in Script checker").
  React.useEffect(() => {
    if (window.__ciPrefillScript) { setText(window.__ciPrefillScript); window.__ciPrefillScript = null; }
  }, []);
  const [textB, setTextB] = React.useState('');
  const [compare, setCompare] = React.useState(false);
  const [lang, setLang] = React.useState('Auto-detect');
  const [kind, setKind] = React.useState('Education');
  const [who, setWho] = React.useState('General');
  const [where, setWhere] = React.useState('Reels');
  const [scrMode, setScrMode] = React.useState('create');   // create | check
  const [topic, setTopic] = React.useState('');
  const [cgen, setCgen] = React.useState({ loading: false, hooks: null, script: null, err: '' });
  const [rewrite, setRewrite] = React.useState({ dir: '', loading: false, out: null });
  const [selectedHook, setSelectedHook] = React.useState('');
  const fileRef = React.useRef(null);

  // File upload: supports .txt / .md / .docx
  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const name = (f.name || '').toLowerCase();
    const apply = (content) => {
      const c = String(content || '').trim();
      if (c) { if (compare && text.trim()) setTextB(c); else setText(c); }
    };
    if ((name.endsWith('.docx') || name.endsWith('.doc')) && window.mammoth) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try { const r = await window.mammoth.extractRawText({ arrayBuffer: ev.target.result }); apply(r.value || ''); }
        catch (ex) { apply(''); }
      };
      reader.readAsArrayBuffer(f);
    } else {
      const reader = new FileReader();
      reader.onload = () => apply(reader.result);
      reader.readAsText(f);
    }
    e.target.value = '';
  }

  const { state, report, usage, err, run } = window.useAnalysis('script');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const seconds = Math.round(words / 2.5);
  const lengthOk = where === 'Reels' || where === 'Shorts' ? seconds <= 35 : true;

  const baseText =
    `Language: ${lang === 'Auto-detect' ? '(detect from the script)' : lang}\nContent type: ${kind}\nAudience: ${who}\nPublishing to: ${where}\nWord count: ${words} (~${seconds}s)\n\n` +
    `SCRIPT (Version A):\n${text}` +
    (compare && textB.trim()
      ? `\n\nSCRIPT (Version B):\n${textB}\n\nCompare Version A and Version B and declare the winner (fill the "winner" field).`
      : '');

  const hookUpgradeAsk = compare ? '' :
    '\n\nALSO: end the report with a "copy" section titled "3 ways to rewrite your hook" containing EXACTLY 3 blocks. Each is a fully rewritten opening hook (first 15-25 seconds only, not the whole script). They must differ sharply in approach:\n' +
    '- block 1 label "1 - Minimal rewrite (same structure, punchier words)": same hook type and structure, just sharpened -- tighter words, stronger stakes, cleaner pattern interrupt\n' +
    '- block 2 label "2 - New angle (different hook strategy)": completely different hook TYPE -- if the original uses a question, try a bold statement or a story opener; must feel like a different creator wrote it\n' +
    '- block 3 label "3 - Pattern interrupt (most disruptive)": the most unexpected, scroll-stopping opening possible -- controversial, counterintuitive, or emotionally charged; keep only the topic\n' +
    'Write each hook in the SAME LANGUAGE as the original script. Make each ready to paste in and record.';

  const userText = baseText + hookUpgradeAsk;
  const estIn = window.estTokens(window.buildSystem('script'), userText);

  const ready = text.trim().split(/\s+/).filter(Boolean).length >= 10;
  function check() { if (!ready) return; run({ userText, maxTokens: 4500 }); }

  // ---- CREATE: topic -> a draft script + hook options (research-grounded) ----
  function buildCreateSys() {
    const core = (window.liveResearch && window.liveResearch().core) || '';
    const sc = (window.getResearch && window.getResearch('script')) || {};
    const swipe = (sc.hookSwipeFile || '').split('\n').filter(l => /^\d+\./.test(l.trim())).slice(0, 36).join('\n');
    return [
      "You are ContentIntel's scriptwriter. Your ONLY job: turn the given TOPIC into a finished short-form video script plus hook options. This is CREATIVE GENERATION, not journalism or analysis.",
      "ABSOLUTE RULES: (1) NEVER ask the user any questions and NEVER request sources, dates, names or clarification from them -- find what you need yourself. (2) NEVER refuse; always deliver a full script. (3) Treat the TOPIC as the creator's premise and write it confidently. (4) Output ONLY the JSON object specified below -- no questions, no preamble, no markdown, no explanations.",
      "WEB GROUNDING: you have a live web_search tool. If the topic involves real facts, current events, numbers, names, products, trends or anything time-sensitive, go online and verify it across multiple sources FIRST, then write the script grounded in what you actually find (use real, current specifics -- not vague placeholders or invented stats). For purely evergreen/creative topics you don't need to search. Either way, never ask the user for any of this -- research it silently and just produce the final script.",
      "LANGUAGE: detect the topic's own language and write everything in it automatically. English topic -> English; Hindi/Hinglish -> match it; if unclear, default to simple English (or Hinglish for an Indian topic). NEVER ask which language to use.",
      core ? 'VIRALITY SCIENCE (craft guidance only -- the analysis-mode rule about never fabricating and asking for input does NOT apply here in CREATE mode):\n"""\n' + core + '\n"""' : '',
      sc.systemGuidance ? 'HOOK & SCRIPT CRAFT:\n"""\n' + sc.systemGuidance.slice(0, 3000) + '\n"""' : '',
      swipe ? 'PROVEN HOOK FORMULAS (adapt to the topic; fill blanks with real specifics):\n' + swipe : '',
      'Return ONLY one JSON object: { "hooks": [ { "text": "opening line", "type": "Curiosity|Contrarian|Emotional|Specific|Authority|Story", "score": 0-100 } x4 ], "script": "a complete ~120-150 word script using the strongest hook, ready to record" }.',
    ].filter(Boolean).join('\n\n');
  }

  async function genScript() {
    if (topic.trim().length < 3) return;
    setCgen({ loading: true, hooks: null, script: null, err: '' });
    try {
      const { text: raw } = await window.callClaude({
        system: buildCreateSys(),
        userText: `Topic: ${topic.trim()}\nContent type: ${kind}\nPlatform: ${where}\nAudience: ${who}\nLanguage: ${lang === 'Auto-detect' ? '(match the topic)' : lang}\n\nWrite it now.`,
        maxTokens: 2600,
      });
      const j = window.parseReport(raw);
      if (j && (j.script || j.hooks)) setCgen({ loading: false, hooks: j.hooks || null, script: j.script || '', err: '' });
      else setCgen({ loading: false, hooks: null, script: (raw || '').trim(), err: '' }); // fallback: use raw text as the script
    } catch (e) {
      setCgen({ loading: false, hooks: null, script: null, err: String(e.message) === 'NO_KEY' ? 'Sign in to generate.' : (e.message || 'Could not generate — try again.') });
    }
  }
  function useGenerated(scriptText) {
    setText(scriptText);
    setScrMode('check');
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Apply a hook rewrite from the report to the first paragraph of the script
  function applyHook(hookText) {
    setSelectedHook(hookText);
    setText(prev => {
      const parts = prev.split(/\n\n+/);
      parts[0] = hookText;
      return parts.join('\n\n');
    });
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Apply rewrite to the editor then immediately re-run the analysis
  function useAndRecheck() {
    const newText = rewrite.out;
    setText(newText);
    setRewrite({ dir: '', loading: false, out: null });
    const nw = newText.trim().split(/\s+/).length;
    const ns = Math.round(nw / 2.5);
    const newUserText =
      `Language: ${lang === 'Auto-detect' ? '(detect from the script)' : lang}\nContent type: ${kind}\nAudience: ${who}\nPublishing to: ${where}\nWord count: ${nw} (~${ns}s)\n\nSCRIPT (Version A):\n${newText}`;
    run({ userText: newUserText, maxTokens: 4500 });
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Research-powered prescriptive rewriter: reads the actual dimension scores
  // from the report and maps each weak area to a specific proven technique
  // (hook types, open-loop stacking, STEPPS, hook swipe-file templates).
  async function doRewrite() {
    if (!text.trim()) { setRewrite(r => ({ ...r, loading: false, out: 'Paste a script first — there is nothing to rewrite yet.' })); return; }
    setRewrite(r => ({ ...r, loading: true, out: null }));
    try {
      const scriptR = window.getResearch('script');
      const scores = (report && Array.isArray(report.scores)) ? report.scores : [];
      const dim = (pattern) => scores.find(s => new RegExp(pattern, 'i').test(s.name)) || {};

      const hookDim  = dim('hook');
      const retDim   = dim('retention|loop|open');
      const valDim   = dim('value|payoff|timing');
      const shareDim = dim('share|stepps');
      const ctaDim   = dim('cta');

      // Weak beats (red/yellow) from the beats section — line-level targets
      const weakBeats = [];
      (report && report.sections || []).forEach(sec => {
        if (sec && sec.type === 'beats') {
          (sec.items || []).filter(it => it.level === 'red' || it.level === 'yellow')
            .forEach(it => weakBeats.push(it));
        }
      });

      // A sample of numbered hook templates from the research swipe file
      const hookTemplates = (scriptR.hookSwipeFile || '')
        .split('\n').filter(l => /^\d+\./.test(l.trim())).slice(0, 24).join('\n');

      const fixes = [];

      if (selectedHook) {
        fixes.push(`HOOK -- USER-SELECTED (mandatory):
The creator chose this exact hook from the analysis. The rewritten script MUST OPEN with it -- verbatim or with only the lightest grammatical smoothing to fit the flow. Do NOT replace it with a different hook:
"${selectedHook}"
Build the rest of the script so it pays off the promise this hook makes.`);
      } else if (!hookDim.score || hookDim.score < 82) {
        fixes.push(`HOOK — current score: ${hookDim.score ? Math.round(hookDim.score) : '?'}/100 — REWRITE FROM ZERO
Analysis said: "${hookDim.why || 'hook is weak — generic or slow opening'}"
Pick the ONE hook force that best fits this topic and apply it fully:
  • CURIOSITY — open a loop the viewer must close.
  • CONTRARIAN — challenge what this audience believes.
  • EMOTIONAL TENSION — a stake, fear or desire in the first line.
  • SPECIFICITY — an exact number/result/timeframe.
  • SUBTLE AUTHORITY — earned credibility without bragging.
${hookTemplates ? 'PROVEN HOOK TEMPLATES — adapt ONE to this exact topic (translate to the script language, fill in real specifics, never leave blanks):\n' + hookTemplates : ''}
Hard rules: (1) land the promise within 2–3 seconds, (2) ONE concrete specific, (3) NEVER open with Hi / Today / In this video / So / Welcome back.`);
      }

      if (!retDim.score || retDim.score < 78) {
        const flatBeats = weakBeats.filter(b => !/hook|cta/i.test(b.label || ''));
        fixes.push(`RETENTION — current score: ${retDim.score ? Math.round(retDim.score) : '?'}/100 — RESTRUCTURE THE MIDDLE
Analysis said: "${retDim.why || 'middle is flat, no open loops'}"
Apply open-loop stacking: open a NEW question or tension BEFORE closing the previous one.
Every 3–5 lines add a micro-hook: a surprising number, a direct question, a bold claim, or a sharp tone shift.
${flatBeats.length ? 'These beats are weak — rewrite them from scratch:\n' + flatBeats.map(b => `  • [${b.label}] "${b.text}"${b.note ? ' — ' + b.note : ''}`).join('\n') : ''}
Move the FIRST real payoff to ~25% of the runtime. Use "but / therefore" logic; kill every "and then…and then" chain.`);
      }

      if (valDim.score && valDim.score < 75) {
        fixes.push(`VALUE TIMING — current score: ${Math.round(valDim.score)}/100
Analysis said: "${valDim.why}"
The first genuinely useful insight must land by line 3–4, not the final third. Front-load one concrete takeaway.`);
      }

      if (!shareDim.score || shareDim.score < 72) {
        fixes.push(`SHAREABILITY — current score: ${shareDim.score ? Math.round(shareDim.score) : '?'}/100
Analysis said: "${shareDim.why || 'missing save/share triggers'}"
Add ONE missing STEPPS lever:
  • Practical value: a specific actionable tip the viewer will screenshot/save.
  • Social currency: a surprising insight that makes the viewer look smart for sharing.
  • High-arousal emotion: one genuine "wait, really?!" moment backed by a specific fact.
  • Story: wrap the core point in "I [did X] → [unexpected result] → the lesson".`);
      }

      if (!ctaDim.score || ctaDim.score < 72) {
        fixes.push(`CTA — current score: ${ctaDim.score ? Math.round(ctaDim.score) : '?'}/100
Analysis said: "${ctaDim.why || 'CTA is generic or missing'}"
ONE specific CTA that flows from the payoff just delivered:
  • Save: "Save this for when you [specific trigger situation]."
  • Comment: "Tell me in the comments: [a question they have a real opinion on]."
  • Follow: "Follow for [the specific next piece that continues this]."
NEVER: "Like and subscribe" / "Follow for more" / "Hope this helped".`);
      }

      if (!fixes.length) {
        fixes.push(`Apply these proven improvements:
1. HOOK: lead with the end result or a shocking specific number; land it in 3 seconds.
2. MIDDLE: every 3–5 lines, add a micro-hook (question, bold claim, surprising number).
3. VALUE: first actionable insight by the 25% mark.
4. CTA: one specific save/comment prompt tied to what was just taught.
${hookTemplates ? 'HOOK TEMPLATES to adapt:\n' + hookTemplates : ''}`);
      }

      const langInstruction = lang === 'Auto-detect'
        ? 'DETECT the language of the original script and write the entire rewrite in that exact language and script. Never switch to English for a non-English original.'
        : `Write the entire rewrite in ${lang} only — every single word.`;

      const rwSystem = [
        `You are ContentIntel's script surgeon. One job: rebuild the original script so it would score 20+ points higher. Cosmetic edits are failure — restructure what the analysis flagged as weak.`,
        `LANGUAGE LAW: ${langInstruction}`,
        `PRESCRIPTIVE FIXES — apply ALL of the following (derived from the real analysis scores + ContentIntel research):\n\n${fixes.join('\n\n')}`,
        report && report.bottomLine ? `SINGLE BIGGEST FIX FROM ANALYSIS: ${report.bottomLine}` : '',
        rewrite.dir ? `Creator direction (highest priority): ${rewrite.dir}` : '',
        `CONSTRAINTS: same topic, same audience (${who}), same platform (${where}), target ~${Math.round(words * 0.85)}–${Math.round(words * 1.05)} words.
Return ONLY the rewritten script — no preamble, no label, no markdown.`,
      ].filter(Boolean).join('\n\n');

      const { text: out } = await window.callClaude({
        system: rwSystem,
        userText: `ORIGINAL SCRIPT:\n${text}`,
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

  const rewritePanel = (
    <SB mood={mood}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Rewrite from analysis</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '6px 0 12px' }}>
        Applies your actual dimension scores and proven virality techniques — not just the text feedback.
      </div>
      {selectedHook && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(100,160,255,0.08)', border: '1px solid rgba(100,160,255,0.25)', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#7eb8ff', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 1 }}>✓ Hook locked in</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5, flex: 1 }}>{selectedHook.slice(0, 160)}{selectedHook.length > 160 ? '…' : ''}</span>
          <button className="ci-copybtn" style={{ height: 26, padding: '0 9px', fontSize: 11 }} onClick={() => setSelectedHook('')}>✕</button>
        </div>
      )}
      <input className="ci-input" value={rewrite.dir} onChange={e => setRewrite(r => ({ ...r, dir: e.target.value }))}
        placeholder="e.g. 'More aggressive hook' · 'Shorter for Reels' · 'Add a shocking stat'" />
      <div style={{ marginTop: 12 }}>
        <SRB mood={mood} onClick={doRewrite} loading={rewrite.loading}>Rewrite my script →</SRB>
      </div>
      {rewrite.out && (
        <div style={{ marginTop: 16 }}>
          <Eyebrow mood={mood} glow>Improved script</Eyebrow>
          <div style={{ marginTop: 8 }}>
            <SCB text={rewrite.out} label="Copy script" />
          </div>
          <div style={{ marginTop: 10 }}>
            <SRB mood={mood} onClick={useAndRecheck}>Apply + Re-analyze →</SRB>
          </div>
        </div>
      )}
    </SB>
  );

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <SWH mood={mood} eyebrow="Script" title={scrMode === 'create' ? 'Create a script' : 'Check your script'}
        sub={scrMode === 'create' ? 'Start from a topic — get a ready-to-record script and hook options, then check & refine it.' : "Paste your video script. We'll tell you what's working, what's not, and how to fix it — line by line."} />

      <div style={{ display: 'inline-flex', gap: 4, padding: 5, borderRadius: 999, border: '1px solid var(--stroke-2)', background: 'var(--surface-2)', marginBottom: 18 }}>
        {['create', 'check'].map(mode => (
          <button key={mode} className="pill" onClick={() => setScrMode(mode)}
            style={{ height: 34, border: 'none', textTransform: 'capitalize', background: scrMode === mode ? 'var(--surface-3)' : 'transparent', fontWeight: scrMode === mode ? 700 : 500 }}>
            {mode === 'create' ? '✦ Create' : '✓ Check'}
          </button>
        ))}
      </div>

      {scrMode === 'create' && (
        <SB mood={mood} style={{ padding: 22 }}>
          <label className="ci-label">What's your video about?</label>
          <textarea className="ci-textarea" style={{ minHeight: 64 }} value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="e.g. How beginners should start SIP investing · Why most reels flop" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            <SCG label="Content" options={['Education', 'Entertainment', 'Tech', 'Fitness', 'Comedy', 'Vlog', 'Finance', 'Ad', 'Other']} value={kind} onChange={setKind} />
            <SCG label="Going to" options={['Reels', 'TikTok', 'Shorts', 'YouTube', 'Other']} value={where} onChange={setWhere} />
            <SCG label="Language" options={['Auto-detect', 'English', 'Hindi', 'Hinglish', 'Spanish', 'Other']} value={lang} onChange={setLang} />
          </div>
          <div style={{ marginTop: 16 }}>
            <SRB mood={mood} onClick={genScript} loading={cgen.loading}>✦ Generate script</SRB>
            {topic.trim().length < 3 && <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 12 }}>Enter a topic first.</span>}
          </div>
          {cgen.err && <div style={{ fontSize: 13, color: '#f5788c', marginTop: 12 }}>{cgen.err}</div>}
          {cgen.hooks && cgen.hooks.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <Eyebrow mood={mood} glow>Hook options</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {cgen.hooks.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: (h.score >= 75 ? '#8FD86A' : h.score >= 55 ? '#F0C85A' : '#F06A7E'), width: 30 }}>{h.score != null ? Math.round(h.score) : '–'}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text-1)' }}>{h.text} <span style={{ fontSize: 10.5, color: 'var(--text-5)', textTransform: 'uppercase' }}>{h.type}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cgen.script && (
            <div style={{ marginTop: 18 }}>
              <Eyebrow mood={mood} glow>Draft script</Eyebrow>
              <div style={{ marginTop: 8 }}><SCB text={cgen.script} label="Copy script" /></div>
              <div style={{ marginTop: 10 }}><SRB mood={mood} onClick={() => useGenerated(cgen.script)}>Use this + check it →</SRB></div>
            </div>
          )}
        </SB>
      )}

      {scrMode === 'check' && (
      <SB mood={mood} style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <STg on={compare} onChange={setCompare} mood={mood}>Compare two versions</STg>
          <input ref={fileRef} type="file" accept=".txt,.md,.text,.docx,.doc,text/plain" style={{ display: 'none' }} onChange={onFile} />
          <button type="button" className="ci-drop" style={{ minHeight: 40, padding: '8px 14px', width: 'auto', border: '1px solid var(--stroke-1)' }}
            onClick={() => fileRef.current && fileRef.current.click()}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10.5V3M5 6l3-3 3 3M3 11.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>
            Upload (.txt, .md, .docx)
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
          <window.AnalyzeButton mood={mood} onClick={check} loading={state === 'loading'} estIn={estIn} label="Check my script"
            disabled={!ready} disabledHint={text.trim() ? 'Script is too short to analyze — paste the full script (10+ words).' : 'Paste your script first — nothing to check yet.'} />
        </div>
      </SB>
      )}

      {state === 'loading' && <div style={{ marginTop: 14 }}><SLR rows={3} /></div>}
      {state === 'error' && <window.ErrorCard msg={err} onOpenKey={onOpenKey} />}

      {state === 'done' && report && (
        <div className="ci-results" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.UsageBadge usage={usage} />
          <window.ReportView report={report} mood={mood} onApplyText={applyHook} />
          {rewritePanel}
        </div>
      )}

      {state === 'done' && !report && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ci-sample-note" onClick={onOpenKey}>
            <span className="ci-dot yellow" /> This is a <b>sample report</b>. Add your Anthropic API key to analyze <i>your</i> script for real → <span style={{ textDecoration: 'underline' }}>Connect key</span>
          </div>
          <TrafficLight level="yellow" title="Needs work"
            text="Fix the issues marked in red before posting. Your topic is strong — the opening and middle need attention." />
          <SB title="Fix these first" desc="These 3 things will make the biggest difference" mood={mood}
            right={<span className="pill" style={{ height: 26 }}>🎯 Priority</span>}>
            <SSI mood={mood} name="Opening hook" score={62} why="Your first line doesn't give the viewer a reason to stay. It starts too slow — the question is good but the delivery buries it." />
            <SSI mood={mood} name="Will they stay" score={71} why="Good flow in the middle, but energy drops around line 8–10. Viewers may swipe before the payoff." />
            <SSI mood={mood} name="Will they engage" score={55} why="Missing a clear call-to-action. Viewers won't know what to do next — no follow, comment, or save prompt." />
          </SB>
          <SB title="Your hook" desc="Hook type: Question hook" mood={mood}>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>A question hook works, but yours asks then stalls. Lead with the stakes, then the question.</div>
            <SCB text={`90% log SIP mein paisa ganwa dete hain — aur galti sirf ek hoti hai. Aaj woh galti main aapko dikhata hoon.`} label="Copy hook" />
          </SB>
          <SB title="What we found" mood={mood}>
            <SIs level="red">No pattern interrupt for 6 lines straight. Viewer will get bored around line 5.</SIs>
            <SIs level="yellow">Your main point doesn't land until 50% through. Move it earlier.</SIs>
            <SIs level="green">Good use of Hinglish — feels natural and relatable for working people.</SIs>
          </SB>
          <SB title="Your ending is weak" desc="Here's a stronger close" mood={mood}>
            <SCB text={`Agar yeh kaam aaya, toh save kar lo — next video mein woh 3 funds bataunga jo main khud use karta hoon.`} label="Copy CTA" />
          </SB>
          <SB mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#07090E', fontWeight: 700 }}>✦</div>
              <Eyebrow mood={mood} glow>Bottom line</Eyebrow>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--text-1)' }}>
              Your hook is weak and the middle drags, but the topic is strong. Fix the opening 2 lines and add a pattern break around line 6 — <span style={{ color: m.accentFrom, fontWeight: 600 }}>that alone will significantly improve retention.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="ci-copybtn" style={{ height: 34 }} onClick={() => window.copyText(SAMPLE_REPORT_TEXT)}>📋 Copy full report</button>
              <button className="ci-copybtn" style={{ height: 34 }} onClick={() => window.downloadText(SAMPLE_REPORT_TEXT, 'script-report.txt')}>↓ Download as text file</button>
            </div>
          </SB>
          {rewritePanel}
        </div>
      )}
    </div>
  );
}
window.ScriptTab = ScriptTab;
