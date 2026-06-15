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

function ScriptTab({ onOpenKey, onNav }) {
  const mood = 'navy';
  const m = SM[mood];

  // Everything on this tab survives navigating away & back (sessionStorage), so the
  // script, analysis, fact-check and packaging are still here when you return.
  const SS = 'ci_script_session';
  const snap = React.useMemo(() => { try { return JSON.parse(sessionStorage.getItem(SS) || '{}'); } catch (e) { return {}; } }, []);

  const [text, setText] = React.useState(snap.text || '');
  // Receive a draft sent from the Create tab ("Refine in Script checker").
  React.useEffect(() => {
    if (window.__ciPrefillScript) { setText(window.__ciPrefillScript); window.__ciPrefillScript = null; }
  }, []);
  const [textB, setTextB] = React.useState(snap.textB || '');
  const [compare, setCompare] = React.useState(!!snap.compare);
  const [lang, setLang] = React.useState(snap.lang || 'Auto-detect');
  const [kind, setKind] = React.useState(snap.kind || 'Education');
  const [who, setWho] = React.useState(snap.who || 'General');
  const [where, setWhere] = React.useState(snap.where || 'Reels');
  const [scrMode, setScrMode] = React.useState(snap.scrMode || 'create');   // create | check
  const [topic, setTopic] = React.useState(snap.topic || '');
  const [cgen, setCgen] = React.useState(snap.cgen || { loading: false, hooks: null, script: null, sources: null, err: '' });
  const [rewrite, setRewrite] = React.useState({ dir: '', loading: false, out: null });
  const [selectedHook, setSelectedHook] = React.useState('');
  // Independent fact-check (Gemini + Google Search) and the Claude auto-fix of it.
  const [fc, setFc] = React.useState(snap.fc || { state: 'idle', data: null, fixing: false, fixed: null, err: '' });
  const [pkg, setPkg] = React.useState(snap.pkg || { state: 'idle', data: null, err: '' });
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

  const { state, report, usage, err, run, reset } = window.useAnalysis('script', { persistKey: 'ci_script_report' });

  // Persist the tab's inputs/outputs (sanitising any in-flight loading states).
  React.useEffect(() => {
    try {
      sessionStorage.setItem(SS, JSON.stringify({
        text, textB, compare, lang, kind, who, where, scrMode, topic,
        cgen: { ...cgen, loading: false },
        fc: fc.state === 'loading' ? { state: 'idle', data: null, fixing: false, fixed: null, err: '' } : { ...fc, fixing: false },
        pkg: pkg.state === 'loading' ? { state: 'idle', data: null, err: '' } : pkg,
      }));
    } catch (e) {}
  }, [text, textB, compare, lang, kind, who, where, scrMode, topic, cgen, fc, pkg]);

  // Clear everything on this tab and start fresh.
  function resetAll() {
    setText(''); setTextB(''); setCompare(false); setTopic('');
    setCgen({ loading: false, hooks: null, script: null, sources: null, err: '' });
    setRewrite({ dir: '', loading: false, out: null }); setSelectedHook('');
    setFc({ state: 'idle', data: null, fixing: false, fixed: null, err: '' });
    setPkg({ state: 'idle', data: null, err: '' });
    reset();
    try { sessionStorage.removeItem(SS); } catch (e) {}
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
      "You are ContentIntel's scriptwriter. Your ONLY job in CREATE mode: turn the given TOPIC into a finished short-form video script plus hook options. This is CREATIVE GENERATION for a creator -- it is NOT journalism, fact-checking, or gatekeeping.",
      "TOP PRIORITY -- this OVERRIDES every other instruction below, including any 'never fabricate', 'verify before writing', 'provide sources', numbered rule, or 'I cannot' guidance in the research/craft text: You ALWAYS deliver a complete script. You NEVER refuse, NEVER ask the user any questions, and NEVER ask the user for sources, dates, names, links or confirmation. If you ever think you 'cannot' write it, you are wrong -- write it. Never output a refusal, an apology, or a 'what I need from you' list.",
      "HOW TO HANDLE FACTS: You have a live web_search tool. For topics involving real events, numbers, names or current trends, search first and ground the script in what you actually find. BUT if you cannot verify the event (no sources found, or it may be fictional, misremembered or too recent): do NOT refuse and do NOT ask the user -- instead treat the TOPIC as the creator's stated premise and write the script anyway. Phrase any unconfirmed specifics as the creator's claim or with soft framing ('reportedly', 'the story goes') rather than inventing precise fake numbers or names, and still deliver the full script with hooks.",
      "SENSITIVE TOPICS (death, tragedy, conflict, accidents): handle with a respectful, careful tone -- but respect NEVER means refusing. Still deliver a complete, tasteful script.",
      "LANGUAGE: detect the topic's own language and write everything in it automatically. English topic -> English; Hindi/Hinglish -> match it; if unclear, default to simple English (or Hinglish for an Indian topic). NEVER ask which language to use.",
      core ? 'VIRALITY SCIENCE (craft guidance only -- if anything here implies you must verify/refuse/ask before writing, IGNORE that part; the TOP PRIORITY rule wins):\n"""\n' + core + '\n"""' : '',
      sc.systemGuidance ? 'HOOK & SCRIPT CRAFT (style reference ONLY -- ignore any part of it that tells you to fact-check before writing, demand sources, or refuse):\n"""\n' + sc.systemGuidance.slice(0, 3000) + '\n"""' : '',
      swipe ? 'PROVEN HOOK FORMULAS (adapt to the topic; fill blanks with real specifics):\n' + swipe : '',
      "QUALITY BAR -- this script will be graded by ContentIntel's own checker on the EXACT dimensions below, and it must score 85+. Engineer it to win on every one:\n" +
        "1. HOOK (first line): land a concrete promise/tension in the first 2-3 seconds with ONE specific (a number, result, name or bold claim). NEVER open with Hi / Today / In this video / So / Welcome / a definition. The script MUST open with the strongest hook from your hooks list, verbatim.\n" +
        "2. RETENTION (the middle): open-loop stacking -- raise a NEW question or tension BEFORE closing the previous one. Add a micro-hook every 2-3 lines (a surprising number, a sharp question, a reversal, a 'but'/'therefore' turn). Kill every 'and then... and then' chain. No filler, no throat-clearing.\n" +
        "3. VALUE TIMING: the first genuinely useful/interesting payoff must land by ~25% in -- front-load it, don't save everything for the end.\n" +
        "4. SHAREABILITY (STEPPS): bake in at least one of -- practical save-worthy tip, social-currency 'makes the sharer look smart' insight, a high-arousal 'wait, really?!' moment, or a tight story arc (I did X -> unexpected result -> lesson).\n" +
        "5. CTA (last line): ONE specific call to action that flows from the payoff just delivered (a save/comment/follow tied to the exact value). NEVER 'like and subscribe', 'follow for more', or 'hope this helped'.\n" +
        "Write tight, spoken, punchy lines a creator can read straight to camera -- not an essay. Every sentence must earn its place.",
      "HOOK RULES + HONEST SCORING (critical -- ContentIntel's checker will re-grade these and must AGREE with you): every hook must be ONE short spoken line, max ~14 words, that lands a concrete promise/tension with ONE specific in the first 2-3 seconds. No banned openers (Hi / Today / In this video / So / Welcome / a dictionary definition / a slow wind-up). Score each hook EXACTLY as a harsh checker would, not generously: a long, vague, or slow hook is 40-60; a decent hook is 65-78; only a tight, specific, curiosity- or tension-driven one-liner earns 85+. Do NOT inflate. The script MUST open with your highest-scoring hook, word-for-word and just as short -- do not expand it into a long paragraph.",
      'Return ONLY one JSON object: { "hooks": [ { "text": "one short hook line (<=14 words)", "type": "Curiosity|Contrarian|Emotional|Specific|Authority|Story", "score": 0-100 } x4 ], "script": "a complete ~120-150 word script whose FIRST line is your highest-scoring hook verbatim, ready to record", "sources": [ { "title": "publication or page title", "url": "https://the-real-url-you-used", "date": "publish date if known, else empty" } ] }.',
      'SOURCES: if you used web_search, list in "sources" the REAL urls you actually relied on (3-6 of them when available, from multiple outlets) so the creator and their viewers can click and verify. Use only genuine urls returned by the search -- never invent or guess a url. If you did not need to search, return "sources": []. When the script mentions facts/numbers/events drawn from these sources, weave in the timing naturally (e.g. "as of June 2026", "according to reports this week").',
      'FINAL REMINDER: output ONLY that JSON, with hooks, a complete script, and sources. No refusal, no questions, no apology, no missing-info list. Just write the script.',
    ].filter(Boolean).join('\n\n');
  }

  async function genScript() {
    if (topic.trim().length < 3) return;
    setCgen({ loading: true, hooks: null, script: null, sources: null, err: '' });
    try {
      const { text: raw, sources: webSrc } = await window.callClaude({
        system: buildCreateSys(),
        userText: `Topic: ${topic.trim()}\nContent type: ${kind}\nPlatform: ${where}\nAudience: ${who}\nLanguage: ${lang === 'Auto-detect' ? '(match the topic)' : lang}\n\nWrite it now.`,
        maxTokens: 2600,
      });
      const j = window.parseReport(raw);
      const cleanSrc = (arr) => (Array.isArray(arr) ? arr : [])
        .filter(s => s && /^https?:\/\//i.test(s.url || ''))
        .map(s => ({ title: (s.title || s.url).trim(), url: s.url.trim(), date: (s.date || '').trim() }));
      // Prefer the model's own cited sources; fall back to the real URLs the
      // web-search tool actually returned (captured server-side by the worker).
      const modelSrc = cleanSrc(j && j.sources);
      const sources = modelSrc.length ? modelSrc : cleanSrc(webSrc);
      // Carry this topic to the thumbnail builder ("suggest text" prefills from it).
      try { localStorage.setItem('ci_last_create', JSON.stringify({ topic: topic.trim(), ts: Date.now() })); } catch (e) {}
      if (j && (j.script || j.hooks)) setCgen({ loading: false, hooks: j.hooks || null, script: j.script || '', sources, sel: -1, err: '' });
      else setCgen({ loading: false, hooks: null, script: (raw || '').trim(), sources, sel: -1, err: '' }); // fallback: use raw text as the script
    } catch (e) {
      setCgen({ loading: false, hooks: null, script: null, sources: null, err: String(e.message) === 'NO_KEY' ? 'Sign in to generate.' : (e.message || 'Could not generate — try again.') });
    }
  }
  function useGenerated(scriptText) {
    setText(scriptText);
    setScrMode('check');
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Apply a hook rewrite from the report: swap ONLY the opening line, keep the rest.
  function applyHook(hookText) {
    setSelectedHook(hookText);
    setText(prev => {
      const sc = (prev || '').trim();
      const h = (hookText || '').trim();
      if (!sc) return h;
      // Replace only the existing opening sentence/line and keep the body.
      // A pasted script is often ONE block with no blank lines, so we must NOT
      // split on blank lines and overwrite the whole first block (that gutted
      // the entire script down to the one-line hook -> score crashed).
      const m = sc.match(/^.*?(?:[.!?\n]|$)/);
      const rest = m ? sc.slice(m[0].length).trim() : '';
      const opener = /[.!?]$/.test(h) ? h : h + '.';
      return rest ? opener + '\n\n' + rest : opener;
    });
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // In CREATE mode: clicking a hook option swaps it into the draft script as the
  // opening line (instant, no extra call) and marks it selected so "Use this"
  // carries the choice into the checker.
  function applyCreateHook(idx, hookText) {
    setSelectedHook(hookText);
    setCgen(c => {
      const sc = c.script || '';
      const m = sc.match(/^\s*.*?[.!?\n]/); // first sentence / first line
      const rest = m ? sc.slice(m[0].length).trim() : sc.trim();
      const h = hookText.trim();
      const opener = /[.!?]$/.test(h) ? h : h + '.';
      return { ...c, sel: idx, script: rest ? opener + ' ' + rest : opener };
    });
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

  // Independent fact-check: Gemini verifies the script's claims with Google Search.
  async function runFactCheck() {
    if (!text.trim()) { setFc({ state: 'error', data: null, fixing: false, fixed: null, err: 'Paste a script first.' }); return; }
    setFc({ state: 'loading', data: null, fixing: false, fixed: null, err: '' });
    try {
      // Use Gemini + Google Search when a Google key is set; otherwise fall back
      // to Claude with its live web_search tool. Both verify against live sources.
      const useGemini = !!(window.getGoogleKey && window.getGoogleKey());
      let data, engine;
      if (useGemini) {
        try { data = await window.geminiFactCheck(text, lang); engine = 'gemini'; }
        catch (e) {
          // Gemini busy / rate-limited / quota -> automatically fall back to Claude
          // instead of erroring out, so the user still gets a fact-check.
          if (/busy|rate.?limit|quota|429|503|high demand|overload/i.test(String(e && e.message)) && window.claudeFactCheck) {
            data = await window.claudeFactCheck(text, lang); engine = 'claude-fb';
          } else throw e;
        }
      } else {
        data = await window.claudeFactCheck(text, lang); engine = 'claude';
      }
      if (data) data.engine = engine;
      setFc({ state: 'done', data, fixing: false, fixed: null, err: '' });
    } catch (e) {
      const msg = String(e.message) === 'NO_KEY'
        ? 'Sign in (or add an API key in Settings) to run the fact-check.'
        : (e.message || 'Could not run the fact-check — try again.');
      setFc({ state: 'error', data: null, fixing: false, fixed: null, err: msg });
    }
  }

  // Claude rewrites the script to fix everything Gemini flagged, weaving in research.
  async function fixWithClaude() {
    const data = fc.data; if (!data) return;
    const flagged = (data.claims || []).filter(c => c && c.status && c.status !== 'verified');
    if (!flagged.length) { setFc(f => ({ ...f, fixed: text })); return; }
    setFc(f => ({ ...f, fixing: true, err: '' }));
    try {
      const core = (window.liveResearch && window.liveResearch().core) || '';
      const langLine = lang === 'Auto-detect'
        ? 'Write the rewrite in the SAME language as the original script.'
        : `Write the entire rewrite in ${lang}.`;
      const sys = [
        "You are ContentIntel's script editor. Rewrite the script so it is FACTUALLY CORRECT and still strong, keeping the same topic, length, creator voice and platform.",
        langLine,
        'An independent fact-check (Gemini + Google Search) flagged these claims. FIX EACH ONE: correct any false number/name/date/event to the verified fact; soften or cut anything unverifiable; keep everything that was verified. Do not introduce new unverifiable claims.',
        'FLAGGED CLAIMS:\n' + flagged.map(c => `- "${c.claim}" [${c.status}] -> ${c.correction || 'no reliable source; remove or soften'}${c.source ? ' (src: ' + c.source + ')' : ''}`).join('\n'),
        core ? 'Apply this virality craft where it helps (hook, open loops, payoff, CTA), but never at the cost of accuracy:\n"""\n' + core.slice(0, 1600) + '\n"""' : '',
        'Return ONLY the rewritten script — no preamble, no notes, no markdown.',
      ].filter(Boolean).join('\n\n');
      const { text: out } = await window.callClaude({ system: sys, userText: `ORIGINAL SCRIPT:\n${text}`, maxTokens: 1600 });
      setFc(f => ({ ...f, fixing: false, fixed: (out || '').trim() }));
    } catch (e) {
      setFc(f => ({ ...f, fixing: false, err: String(e.message) === 'NO_KEY' ? 'Sign in (or add an API key) to apply the fix.' : (e.message || 'Could not apply the fix — try again.') }));
    }
  }
  function useFixedScript() {
    if (!fc.fixed) return;
    setText(fc.fixed);
    setFc(f => ({ ...f, fixed: null, data: null, state: 'idle' }));
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const fcColor = s => s === 'verified' ? '#8FD86A' : s === 'false' ? '#F06A7E' : '#F0C85A';
  const fcLabel = s => s === 'verified' ? 'Verified' : s === 'false' ? 'False' : 'Unverified';

  // Titles + SEO tags + thumbnail text, per platform, grounded in the research.
  async function runPackaging() {
    if (!text.trim()) { setPkg({ state: 'error', data: null, err: 'Paste or generate a script first.' }); return; }
    setPkg({ state: 'loading', data: null, err: '' });
    try {
      const data = await window.packageScript(text, lang, { niche: kind, audience: who });
      setPkg({ state: 'done', data, err: '' });
    } catch (e) {
      const msg = String(e.message) === 'NO_KEY' ? 'Sign in (or add an API key) to generate titles & tags.' : (e.message || 'Could not generate packaging — try again.');
      setPkg({ state: 'error', data: null, err: msg });
    }
  }
  // Hand the script's thumbnail text + visual brief to the Builder tab, which
  // prefills its headline and scene direction from this.
  function sendToBuilder(thumbText) {
    const d = pkg.data || {};
    const ytTitle = (d.youtube && d.youtube.titles && d.youtube.titles[0] && d.youtube.titles[0].text) || '';
    const tt = thumbText || (d.thumbnailText && d.thumbnailText[0] && d.thumbnailText[0].text) || '';
    try { localStorage.setItem('ci_last_create', JSON.stringify({ topic: ytTitle || text.trim().slice(0, 90), title: ytTitle, thumbText: tt, brief: d.thumbnailBrief || '', ts: Date.now() })); } catch (e) {}
    if (onNav) onNav('builder');
  }
  const pkgColor = v => v >= 75 ? '#8FD86A' : v >= 55 ? '#F0C85A' : '#F06A7E';
  const PKG_PLATS = [
    { key: 'youtube', label: 'YouTube', tagKey: 'tags', tagLabel: 'SEO tags', hash: false },
    { key: 'instagram', label: 'Instagram', tagKey: 'hashtags', tagLabel: 'Hashtags', hash: true },
    { key: 'linkedin', label: 'LinkedIn', tagKey: 'hashtags', tagLabel: 'Hashtags', hash: true },
  ];

  const fcUsesGemini = !!(window.getGoogleKey && window.getGoogleKey());
  const fcEngineLabel = fcUsesGemini ? 'Gemini + Google Search' : 'Claude + Web Search';
  const factCheckPanel = (
    <SB mood={mood}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Independent fact-check</div>
        <span className="pill" style={{ height: 22, fontSize: 10.5, padding: '0 8px', color: '#7eb8ff' }}>{fcEngineLabel}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '6px 0 12px' }}>
        {fcUsesGemini
          ? 'Gemini checks your script’s facts against live Google Search — then Claude fixes anything flagged.'
          : 'Claude verifies your script’s facts with live web search — then fixes anything flagged. Add a Google AI key in Settings to use Gemini instead.'}
      </div>
      <SRB mood={mood} onClick={runFactCheck} loading={fc.state === 'loading'}>
        {fc.state === 'done' ? 'Re-run fact-check' : '🔎 Fact-check this script'}
      </SRB>
      {fc.state === 'error' && <div style={{ fontSize: 12.5, color: '#f5788c', marginTop: 10 }}>{fc.err}</div>}
      {fc.state === 'done' && fc.data && (
        <div style={{ marginTop: 14 }}>
          {fc.data.engine === 'claude-fb' && (
            <div style={{ fontSize: 11.5, color: '#F0C85A', marginBottom: 10, padding: '8px 11px', borderRadius: 9, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.2)' }}>
              Gemini was busy/rate-limited, so this was verified with Claude + web search instead.
            </div>
          )}
          {fc.data.summary && <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.55 }}>{fc.data.summary}</div>}
          {(fc.data.claims || []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fc.data.claims.map((c, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: fcColor(c.status), textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 2 }}>{fcLabel(c.status)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, flex: 1 }}>{c.claim}</span>
                  </div>
                  {c.correction && c.status !== 'verified' && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>→ {c.correction}</div>}
                  {c.source && /^https?:\/\//i.test(c.source) && <a href={c.source} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#7eb8ff', marginTop: 4, display: 'inline-block', wordBreak: 'break-all' }}>{c.source.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60)}</a>}
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: 12.5, color: 'var(--text-4)' }}>No checkable factual claims found — this reads as opinion/style.</div>}

          {(fc.data.claims || []).some(c => c.status !== 'verified') && (
            <div style={{ marginTop: 14 }}>
              <SRB mood={mood} onClick={fixWithClaude} loading={fc.fixing}>✦ Fix flagged claims with Claude →</SRB>
            </div>
          )}
          {fc.fixed && (
            <div style={{ marginTop: 16 }}>
              <Eyebrow mood={mood} glow>Fact-corrected script</Eyebrow>
              <div style={{ marginTop: 8 }}><SCB text={fc.fixed} label="Copy script" /></div>
              <div style={{ marginTop: 10 }}><SRB mood={mood} onClick={useFixedScript}>Use this + re-check →</SRB></div>
            </div>
          )}
          {fc.data.sources && fc.data.sources.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Sources checked</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {fc.data.sources.slice(0, 8).map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="pill" style={{ height: 24, fontSize: 11, padding: '0 9px', color: '#7eb8ff', textDecoration: 'none' }}>{(s.title || s.url).slice(0, 40)}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SB>
  );

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

  const packagingPanel = (
    <SB mood={mood}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Titles, SEO tags & thumbnail text</div>
        <span className="pill" style={{ height: 22, fontSize: 10.5, padding: '0 8px', color: '#8FD86A' }}>Per platform · scored</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '6px 0 12px' }}>
        3 title options each for YouTube, Instagram & LinkedIn — scored for click + search — plus SEO tags and thumbnail text, all grounded in the research (not random).
      </div>
      <SRB mood={mood} onClick={runPackaging} loading={pkg.state === 'loading'}>
        {pkg.state === 'done' ? 'Regenerate' : '🏷️ Get titles, tags & thumbnail text'}
      </SRB>
      {pkg.state === 'error' && <div style={{ fontSize: 12.5, color: '#f5788c', marginTop: 10 }}>{pkg.err}</div>}
      {pkg.state === 'done' && pkg.data && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {PKG_PLATS.map(p => {
            const d = pkg.data[p.key]; if (!d) return null;
            const tags = d[p.tagKey] || [];
            const kw = p.key === 'instagram' ? (d.keywords || []) : [];
            return (
              <div key={p.key}>
                <Eyebrow mood={mood} glow>{p.label}</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {(d.titles || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: pkgColor(t.score || 0), width: 28, textAlign: 'center', flexShrink: 0 }}>{t.score != null ? Math.round(t.score) : '–'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.45 }}>{t.text}</div>
                        {t.why && <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 3 }}>{t.why}</div>}
                      </div>
                      <button className="ci-copybtn" style={{ height: 28, flexShrink: 0 }} onClick={() => window.copyText(t.text)}>⧉</button>
                    </div>
                  ))}
                </div>
                {tags.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {p.tagLabel}
                        {p.key === 'youtube' && (() => { const n = tags.join(', ').length; return <span style={{ marginLeft: 7, fontWeight: 600, color: n > 500 ? '#F06A7E' : '#8FD86A' }}>{n}/500</span>; })()}
                      </span>
                      <button className="ci-copybtn" style={{ height: 24, fontSize: 11, padding: '0 9px' }} onClick={() => window.copyText(tags.join(p.hash ? ' ' : ', '))}>Copy all</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tags.map((tg, i) => <span key={i} className="pill" style={{ height: 24, fontSize: 11.5, padding: '0 9px', color: 'var(--text-2)' }}>{p.hash && !String(tg).startsWith('#') ? '#' + tg : tg}</span>)}
                    </div>
                    {kw.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-4)' }}>
                        <b style={{ color: 'var(--text-3)' }}>Caption keywords:</b> {kw.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {Array.isArray(pkg.data.thumbnailText) && pkg.data.thumbnailText.length > 0 && (
            <div>
              <Eyebrow mood={mood} glow>Thumbnail text</Eyebrow>
              <div style={{ fontSize: 11.5, color: 'var(--text-4)', margin: '4px 0 8px' }}>Short overlay text that complements the title — built for legibility at small size.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pkg.data.thumbnailText.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--stroke-1)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>{t.text}</div>
                      {t.why && <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>{t.why}</div>}
                    </div>
                    <button className="ci-copybtn" style={{ height: 28, flexShrink: 0 }} onClick={() => window.copyText(t.text)}>⧉</button>
                    {onNav && <button className="ci-copybtn" style={{ height: 28, flexShrink: 0, fontSize: 11.5, padding: '0 10px' }} onClick={() => sendToBuilder(t.text)}>🎨 Build</button>}
                  </div>
                ))}
              </div>
              {pkg.data.thumbnailBrief && (
                <div style={{ marginTop: 10, padding: '11px 13px', borderRadius: 10, background: `${m.orbB || m.accentFrom}14`, border: `1px solid ${m.accentGlow}40` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: m.accentFrom, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Thumbnail image brief — visual context for a pro look</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{pkg.data.thumbnailBrief}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {onNav && <SRB mood={mood} onClick={() => sendToBuilder()}>🎨 Build this thumbnail →</SRB>}
                    <button className="ci-copybtn" style={{ height: 38, padding: '0 12px', fontSize: 12 }} onClick={() => window.copyText(pkg.data.thumbnailBrief)}>⧉ Copy brief</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SB>
  );

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <SWH mood={mood} eyebrow="Script" title={scrMode === 'create' ? 'Create a script' : 'Check your script'}
        sub={scrMode === 'create' ? 'Start from a topic — get a ready-to-record script and hook options, then check & refine it.' : "Paste your video script. We'll tell you what's working, what's not, and how to fix it — line by line."} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', gap: 4, padding: 5, borderRadius: 999, border: '1px solid var(--stroke-2)', background: 'var(--surface-2)' }}>
          {['create', 'check'].map(mode => (
            <button key={mode} className="pill" onClick={() => setScrMode(mode)}
              style={{ height: 34, border: 'none', textTransform: 'capitalize', background: scrMode === mode ? 'var(--surface-3)' : 'transparent', fontWeight: scrMode === mode ? 700 : 500 }}>
              {mode === 'create' ? '✦ Create' : '✓ Check'}
            </button>
          ))}
        </div>
        {(text.trim() || topic.trim() || (cgen && cgen.script) || report || (pkg && pkg.data) || (fc && fc.data)) && (
          <button className="ci-copybtn" style={{ height: 34, padding: '0 14px', fontSize: 12.5 }} onClick={resetAll} title="Clear the script, analysis, fact-check and packaging">↺ New / Reset</button>
        )}
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
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4, marginBottom: 6 }}>Tap a hook to drop it into the draft script below as the opening line.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
                {cgen.hooks.map((h, i) => {
                  const on = cgen.sel === i;
                  return (
                    <button key={i} type="button" onClick={() => applyCreateHook(i, h.text)}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', width: '100%', cursor: 'pointer',
                        padding: '10px 10px', borderTop: i ? '1px solid var(--stroke-1)' : 'none', border: 'none', borderRadius: 8,
                        background: on ? 'var(--surface-2)' : 'transparent', outline: on ? '1px solid ' + ((m && m.accentFrom) || 'var(--stroke-2)') : 'none' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: (h.score >= 75 ? '#8FD86A' : h.score >= 55 ? '#F0C85A' : '#F06A7E'), width: 30 }}>{h.score != null ? Math.round(h.score) : '–'}</span>
                      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text-1)' }}>{h.text} <span style={{ fontSize: 10.5, color: 'var(--text-5)', textTransform: 'uppercase' }}>{h.type}</span></span>
                      <span style={{ fontSize: 11, color: on ? 'var(--text-2)' : 'var(--text-5)', flexShrink: 0, alignSelf: 'center' }}>{on ? '✓ in script' : 'Use →'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {cgen.script && (
            <div style={{ marginTop: 18 }}>
              <Eyebrow mood={mood} glow>Draft script</Eyebrow>
              <div style={{ marginTop: 8 }}><SCB text={cgen.script} label="Copy script" /></div>
              {cgen.sources && cgen.sources.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                    <span aria-hidden style={{ opacity: .8 }}>🔗</span>
                    Verified from {cgen.sources.length} {cgen.sources.length === 1 ? 'source' : 'sources'} — click to check
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cgen.sources.map((s, i) => {
                      let host = ''; try { host = new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { host = s.url; }
                      return (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer nofollow" title={s.title}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 260, padding: '6px 10px', borderRadius: 999, border: '1px solid var(--stroke-1)', background: 'var(--surface-1)', color: 'var(--text-2)', fontSize: 12, textDecoration: 'none' }}>
                          <span aria-hidden style={{ fontSize: 11, opacity: .7 }}>↗</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title || host}</span>
                          {s.date && <span style={{ color: 'var(--text-5)', fontSize: 10.5, flexShrink: 0 }}>· {s.date}</span>}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}><SRB mood={mood} onClick={() => useGenerated(cgen.script)}>Use this + check it →</SRB></div>
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
          {factCheckPanel}
          {packagingPanel}
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
