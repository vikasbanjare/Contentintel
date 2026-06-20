// ContentIntel — Caption & Description Generator

// Real-time title CTR score (no CDN needed — pure heuristic scoring)
function scoreTitleCTR(title) {
  const t = (title || '').trim();
  if (t.length < 5) return null;
  let score = 45;
  const factors = [];

  // Character length — ideal 50-70
  const len = t.length;
  if (len >= 50 && len <= 70) { score += 10; factors.push({ key: 'len', label: 'Ideal length', col: '#8FD86A' }); }
  else if (len < 25) { score -= 12; factors.push({ key: 'len', label: 'Too short', col: '#F06A7E' }); }
  else if (len > 100) { score -= 8; factors.push({ key: 'len', label: 'Very long', col: '#F06A7E' }); }

  // Number (numbers boost CTR ~36%)
  if (/\d/.test(t)) { score += 9; factors.push({ key: 'num', label: 'Has number', col: '#8FD86A' }); }

  // Question
  if (/\?/.test(t)) { score += 7; factors.push({ key: 'q', label: 'Question', col: '#8FD86A' }); }

  // Bracket/parens qualifier
  if (/[\[(].{2,}[\])]/.test(t)) { score += 5; factors.push({ key: 'br', label: 'Qualifier []', col: '#8FD86A' }); }

  // Power words
  if (/\b(secret|never|always|stop|best|worst|mistake|truth|real|only|revealed|shocking|surprising|proven|ultimate|simple|instant|free)\b/i.test(t)) {
    score += 8; factors.push({ key: 'pw', label: 'Power word', col: '#F0C85A' });
  }

  // How/Why/What hooks
  if (/^(how|why|what|when)\b/i.test(t)) { score += 6; factors.push({ key: 'hw', label: 'How/Why/What', col: '#8FD86A' }); }

  // Negative framing
  if (/\b(mistake|wrong|fail|worst|stop|never|avoid|don.t)\b/i.test(t)) { score += 5; factors.push({ key: 'neg', label: 'Negative hook', col: '#F0C85A' }); }

  // Year signal
  if (/20\d\d/.test(t)) { score += 3; factors.push({ key: 'yr', label: 'Year', col: '#8FD86A' }); }

  // Weak openers (penalty)
  if (/^(hi |hey |hello |welcome |so |today |in this video |this is )/i.test(t)) {
    score -= 14; factors.push({ key: 'wo', label: 'Weak opener', col: '#F06A7E' });
  }

  // Excessive ALL CAPS (trust penalty)
  const capsCount = t.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  if (capsCount >= 3) { score -= 8; factors.push({ key: 'caps', label: 'Too many CAPS', col: '#F06A7E' }); }

  // Curiosity / gap framing
  if (/\b(this is why|the reason|nobody|everyone|truth about|don.t know|hidden|before you)\b/i.test(t)) {
    score += 6; factors.push({ key: 'cg', label: 'Curiosity gap', col: '#8FD86A' });
  }

  const final = Math.max(12, Math.min(98, score));
  return { score: final, factors };
}

function TitleCTRBadge({ title }) {
  const result = React.useMemo(() => scoreTitleCTR(title), [title]);
  if (!result) return null;
  const { score, factors } = result;
  const col = score >= 72 ? '#8FD86A' : score >= 50 ? '#F0C85A' : '#F06A7E';
  const label = score >= 72 ? 'Strong CTR' : score >= 50 ? 'Average CTR' : 'Weak CTR';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: col + '18', border: `1px solid ${col}44` }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14, color: col }}>{score}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: col }}>{label}</span>
      </div>
      {factors.map(f => (
        <span key={f.key} style={{ fontSize: 10.5, padding: '3px 7px', borderRadius: 999, background: f.col + '18', color: f.col, fontWeight: 600, border: `1px solid ${f.col}33` }}>{f.label}</span>
      ))}
    </div>
  );
}

const CAPTION_SYSTEM = [
  "You are an expert social media copywriter for video creators.",
  "Write platform-optimised captions, descriptions and hashtag sets that maximise clicks, saves, watch-time and shares.",
  "",
  "If a transcript or script is provided, extract the key moments, hooks, and value points from it.",
  "Use the actual content to write specific, grounded captions — not generic ones.",
  "",
  "Platform rules:",
  "• YouTube description: 2–3 sentence SEO-optimised opener with the most important keywords in line 1; a short 'What you'll learn' bullet list with actual points from the content; a CTA (subscribe / watch next); timestamps if relevant; links placeholder.",
  "• Instagram/Reels caption: punchy hook on line 1 (under 125 chars before the fold), 2–3 lines body with emotion + value + CTA, 5–8 relevant emojis scattered naturally.",
  "• TikTok caption: max 150 chars total, conversational/slang tone, 3–5 relevant trend hashtags inline.",
  "• LinkedIn post: professional angle, insight or story hook, 3 short paragraphs, 3–5 hashtags at the end.",
  "• Twitter/X thread: first tweet as a strong hook (under 280 chars), 3–5 follow-up tweets expanding the key point.",
  "• Hashtags block: YouTube (8–12 tags, NO # symbol), Instagram (20–25 tags with #), TikTok (5–7 trend tags with #).",
  "",
  "Output ONLY the submit_report tool call. No prose outside the tool.",
  "Use sections of type 'copy' — one section per platform, one final section for Hashtags.",
  "Each copy block should have a short label and the full ready-to-use text.",
  "Set verdict.level='green', verdict.title='Captions Ready', verdict.text=one sentence summarising what was generated.",
  "Add 3 scores: Platform Fit (how well captions match each platform's style) / Hook Strength (first line quality) / Hashtag Relevance — each 0-100.",
  "Set bottomLine to the single most important tip for maximising reach with these captions.",
].join("\n");

// Parse SRT string → array of { index, start, end, text }
function parseSRT(srt) {
  const segs = [];
  const blocks = (srt || '').trim().split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    const tLine = lines.find(l => /\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(l));
    if (!tLine) continue;
    const tm = tLine.match(/(\d{2}:\d{2}:\d{2})[,\.](\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})[,\.](\d{3})/);
    if (!tm) continue;
    const text = lines.slice(lines.indexOf(tLine) + 1).join(' ').trim();
    if (text) segs.push({ index: segs.length + 1, start: tm[1], end: tm[3], ms_start: tm[2], ms_end: tm[4], text });
  }
  return segs;
}

// Compact "00:00:04" → "0:04", strip leading zeros for readability
function fmtTime(t) {
  const p = (t || '').split(':');
  if (p.length < 3) return t;
  const h = parseInt(p[0], 10), m = parseInt(p[1], 10), s = parseInt(p[2], 10);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function SRTViewer({ srt, accentColor }) {
  const segs = React.useMemo(() => parseSRT(srt), [srt]);
  const [copied, setCopied] = React.useState(null);
  const [search, setSearch] = React.useState('');
  if (!segs.length) return null;
  function copyOne(i, text) {
    window.copyText ? window.copyText(text) : navigator.clipboard.writeText(text).catch(() => {});
    setCopied(i); setTimeout(() => setCopied(c => c === i ? null : c), 1600);
  }
  function copyAll() {
    const plain = segs.map(s => s.text).join(' ');
    window.copyText ? window.copyText(plain) : navigator.clipboard.writeText(plain).catch(() => {});
    setCopied('all'); setTimeout(() => setCopied(c => c === 'all' ? null : c), 1600);
  }
  const q = search.trim().toLowerCase();
  const visible = q ? segs.filter(s => s.text.toLowerCase().includes(q)) : segs;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {segs.length} segments
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transcript…"
            style={{ height: 28, padding: '0 10px', borderRadius: 6, border: '1px solid var(--stroke-2)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 12, outline: 'none', width: 160 }} />
          <button className="ci-copybtn" style={{ height: 28, padding: '0 10px', fontSize: 11.5 }} onClick={copyAll}>
            {copied === 'all' ? '✓ Copied' : '⧉ Copy all text'}
          </button>
        </div>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 10, border: '1px solid var(--stroke-1)', padding: '4px 0' }}>
        {visible.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-4)' }}>No results for "{search}"</div>}
        {visible.map((s, i) => (
          <div key={s.index} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', transition: 'background 0.1s', cursor: 'default' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accentColor || '#8FD86A', flexShrink: 0, paddingTop: 2, width: 42 }}>{fmtTime(s.start)}</span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {q ? s.text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi')).map((part, pi) =>
                part.toLowerCase() === q ? <mark key={pi} style={{ background: (accentColor || '#8FD86A') + '33', color: 'var(--text-1)', borderRadius: 2 }}>{part}</mark> : part
              ) : s.text}
            </span>
            <button className="ci-copybtn" style={{ height: 24, padding: '0 8px', fontSize: 11, flexShrink: 0, opacity: 0.7 }}
              onClick={() => copyOne(s.index, s.text)} title="Copy this line">
              {copied === s.index ? '✓' : '⧉'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Lazy-load compromise.js and extract SEO keywords from text
async function loadCompromise() {
  if (window.nlp) return window.nlp;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/compromise@14.15.1/builds/compromise.js';
    s.onload = () => resolve(window.nlp);
    s.onerror = () => reject(new Error('Could not load NLP library'));
    document.head.appendChild(s);
  });
}

// Optional stopword-filtered single-word tags via keyword-extractor (esm.sh).
let _kwExtractor = null;
async function keywordExtractorTags(text) {
  try {
    if (!_kwExtractor) { const mod = await import('https://esm.sh/keyword-extractor@0.0.28'); _kwExtractor = mod.default || mod; }
    return _kwExtractor.extract(text, { language: 'english', remove_digits: false, return_changed_case: false, remove_duplicates: true }) || [];
  } catch (e) { return []; }
}

async function extractSEOKeywords(text) {
  try {
    const nlp = await loadCompromise();
    const doc = nlp(text);
    // Multi-word noun phrases first — these make the strongest YouTube tags
    // (e.g. "index funds", "compound interest"). Then named topics, then nouns.
    const phrases = doc.match('#Adjective? #Noun+').json().map(p => p.text.trim()).filter(p => p.split(/\s+/).length >= 2 && p.length > 6);
    const topics  = doc.topics().json().map(t => t.text.trim()).filter(Boolean);
    const nouns   = doc.nouns().json().map(n => n.text.trim()).filter(n => n.length > 3);
    let extras = [];
    try { extras = await keywordExtractorTags(text); } catch (e) {}
    const seen = new Set();
    const result = [];
    for (const kw of [...phrases, ...topics, ...nouns, ...extras]) {
      const k = kw.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (k.length < 3 || seen.has(k)) continue;
      seen.add(k); result.push(kw.trim());
      if (result.length >= 14) break;
    }
    return result;
  } catch (e) { return []; }
}

// Language detection via franc-min (ESM, lazy import). Returns a friendly name.
const ISO6393_NAMES = {
  eng: 'English', spa: 'Spanish', fra: 'French', deu: 'German', ita: 'Italian',
  por: 'Portuguese', nld: 'Dutch', rus: 'Russian', jpn: 'Japanese', kor: 'Korean',
  cmn: 'Chinese', arb: 'Arabic', hin: 'Hindi', ben: 'Bengali', urd: 'Urdu',
  pan: 'Punjabi', tam: 'Tamil', tel: 'Telugu', mar: 'Marathi', guj: 'Gujarati',
  tur: 'Turkish', vie: 'Vietnamese', ind: 'Indonesian', tha: 'Thai', pol: 'Polish',
  ukr: 'Ukrainian', ron: 'Romanian', ell: 'Greek', heb: 'Hebrew', fas: 'Persian',
  swe: 'Swedish', ces: 'Czech', hun: 'Hungarian', fin: 'Finnish', dan: 'Danish',
};
let _francMod = null;
async function detectLanguage(text) {
  const t = (text || '').trim();
  if (t.length < 20) return null;
  try {
    if (!_francMod) _francMod = await import('https://esm.sh/franc-min@6?bundle');
    const code = _francMod.franc(t, { minLength: 18 });
    if (!code || code === 'und') return null;
    return { code, name: ISO6393_NAMES[code] || code.toUpperCase() };
  } catch (e) { return null; }
}

// Flesch readability — pure JS, no CDN (counts syllables/words/sentences).
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return word ? 1 : 0;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}
function fleschReadability(text) {
  const t = (text || '').trim();
  if (t.length < 30) return null;
  const sentences = (t.match(/[.!?]+(?:\s|$)/g) || []).length || 1;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 8) return null;
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);
  const wps = words.length / sentences, spw = syllables / words.length;
  const ease = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * wps - 84.6 * spw)));
  const grade = Math.max(1, Math.round(0.39 * wps + 11.8 * spw - 15.59));
  let band, col;
  if (ease >= 70) { band = 'Easy to read'; col = '#8FD86A'; }
  else if (ease >= 50) { band = 'Fairly readable'; col = '#F0C85A'; }
  else { band = 'Hard to read'; col = '#F06A7E'; }
  return { ease, grade, band, col };
}

// Extract YouTube video ID from URLs or bare IDs
function extractYTVideoId(s) {
  s = (s || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:[?&]v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Parse YouTube timedtext XML (auto-generated or manual CC) into SRT string
function parseYTTimedText(xml) {
  const re = /<text[^>]*start="([\d.]+)"[^>]*dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const segs = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    const start = parseFloat(m[1]);
    const end   = start + parseFloat(m[2]);
    const text  = m[3].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
                       .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]+>/g,'').trim();
    if (text) segs.push({ i: segs.length + 1, start, end, text });
  }
  if (!segs.length) return '';
  function ts(s) {
    const h=Math.floor(s/3600), mm=Math.floor((s%3600)/60), ss=Math.floor(s%60), ms=Math.round((s%1)*1000);
    return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  }
  return segs.map(s => `${s.i}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}`).join('\n\n');
}

// Fetch YouTube captions via allorigins.win CORS proxy (no API key).
// Tries 'en', then 'en-US', then auto-generated 'a.en'.
async function fetchYTCaptions(videoId) {
  for (const lang of ['en', 'en-US', 'a.en']) {
    const ytUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`;
    try {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(ytUrl)}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(9000) : undefined });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml || !xml.includes('<text')) continue;
      const srt = parseYTTimedText(xml);
      if (srt && srt.length > 50) return srt;
    } catch (e) { continue; }
  }
  throw new Error('No English captions found for this video. It may not have subtitles, or they may be disabled.');
}

function CaptionTab({ onOpenKey }) {
  const mood = 'lime';
  const m = MOODS[mood] || MOODS.burgundy;
  const [title, setTitle] = React.useState('');
  const [desc,  setDesc]  = React.useState('');
  const [transcript, setTranscript] = React.useState('');
  const [srtSegments, setSrtSegments] = React.useState(null); // parsed SRT segments for viewer
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [transFile, setTransFile] = React.useState(null);
  const [transState, setTransState] = React.useState('idle'); // idle | transcribing | done | error
  const [transErr, setTransErr] = React.useState('');
  const [ytUrl, setYtUrl] = React.useState('');
  const [ytFetchState, setYtFetchState] = React.useState('idle');
  const [ytFetchErr, setYtFetchErr] = React.useState('');
  const groqKey = window.getGroqKey ? window.getGroqKey() : '';
  const [plats, setPlats] = React.useState(['youtube', 'instagram', 'tiktok']);

  const { state, report, usage, err, run, reset } = useAnalysis('caption');
  const loading = state === 'loading';
  const estIn   = window.estTokens ? window.estTokens(CAPTION_SYSTEM, title, desc, transcript) : 0;

  const [keywords, setKeywords] = React.useState([]);
  const [kwLoading, setKwLoading] = React.useState(false);
  const [kwCopied, setKwCopied] = React.useState(null);
  const [lang, setLang] = React.useState(null);

  React.useEffect(() => {
    const text = [title.trim(), transcript.trim()].filter(Boolean).join('. ');
    if (text.length < 15) { setKeywords([]); setLang(null); return; }
    setKwLoading(true);
    const timer = setTimeout(async () => {
      const [kw, lg] = await Promise.all([extractSEOKeywords(text), detectLanguage(text)]);
      setKeywords(kw);
      setLang(lg);
      setKwLoading(false);
    }, 900);
    return () => { clearTimeout(timer); };
  }, [title, transcript]);

  // Readability of the key-points/summary text (instant, no CDN).
  const readability = React.useMemo(() => fleschReadability(desc), [desc]);

  const PLATFORMS = [
    { id: 'youtube',   label: 'YouTube',   col: '#FF0000' },
    { id: 'instagram', label: 'Instagram', col: '#E1306C' },
    { id: 'tiktok',    label: 'TikTok',    col: '#69C9D0' },
    { id: 'linkedin',  label: 'LinkedIn',  col: '#0A66C2' },
    { id: 'twitter',   label: 'Twitter/X', col: '#1DA1F2' },
  ];

  function toggle(id) {
    setPlats(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    reset();
  }

  async function transcribeFile() {
    if (!transFile || transState === 'transcribing') return;
    if (!groqKey) { setTransErr('Add a Groq API key in Settings → Platform Data to transcribe.'); setTransState('error'); return; }
    setTransState('transcribing'); setTransErr('');
    try {
      const srt = await window.transcribeWithGroq(transFile, groqKey);
      const segs = parseSRT(srt);
      setTranscript(srt);
      setSrtSegments(segs.length >= 2 ? segs : null);
      setShowTranscript(true);
      setTransState('done');
      reset();
    } catch (e) {
      setTransErr(e.message || 'Transcription failed.');
      setTransState('error');
    }
  }

  async function fetchYTTranscriptFromUrl() {
    const vid = extractYTVideoId(ytUrl);
    if (!vid) { setYtFetchErr('Enter a valid YouTube URL or video ID.'); setYtFetchState('error'); return; }
    setYtFetchState('fetching'); setYtFetchErr('');
    try {
      const srt = await fetchYTCaptions(vid);
      const segs = parseSRT(srt);
      setTranscript(srt);
      setSrtSegments(segs.length >= 2 ? segs : null);
      setShowTranscript(true);
      setYtFetchState('done');
      reset();
    } catch (e) {
      setYtFetchErr(e.message || 'Could not fetch captions.');
      setYtFetchState('error');
    }
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
        desc.trim() ? `Content summary / key points: ${desc.trim()}` : '',
        transcript.trim() ? `Video transcript / script:\n\n${transcript.trim()}` : '',
        `Generate captions for: ${platList}`,
        'Add a Hashtags section with platform-specific tag sets.',
      ].filter(Boolean).join('\n\n'),
      maxTokens: 2800,
    });
  }

  const transcriptWords = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Caption Generator</Eyebrow>
        <h2 className="ci-h2">Captions &amp; Descriptions</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          One video title (or full transcript) → platform-ready captions, descriptions and hashtag sets for every channel you post on.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Video title *</span>
              {title.trim() && (
                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'var(--surface-2)',
                  color: title.length > 100 ? '#F06A7E' : title.length > 70 ? '#F0C85A' : '#8FD86A',
                  fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{title.length}/100 chars</span>
              )}
            </div>
            <input className="ci-input" style={{ fontSize: 15 }}
              placeholder="e.g. I invested ₹50,000 in index funds for 1 year — here's what happened"
              value={title} onChange={e => { setTitle(e.target.value); reset(); }}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate(); }} />
            <TitleCTRBadge title={title} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Key points / summary <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </span>
            <textarea className="ci-input" rows={3}
              placeholder="Key topics, takeaways, moments — the more you give, the better the captions"
              value={desc} onChange={e => { setDesc(e.target.value); reset(); }}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate(); }}
              style={{ resize: 'vertical', lineHeight: 1.55 }} />
            {readability && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 999, background: readability.col + '18', color: readability.col, fontWeight: 700, border: `1px solid ${readability.col}33` }}>
                  📖 {readability.band}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-5)' }}>Flesch {readability.ease} · grade {readability.grade}</span>
              </div>
            )}
          </label>

          {/* Transcript toggle */}
          <div>
            <button
              onClick={() => setShowTranscript(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer',
                color: showTranscript ? m.accentFrom : 'var(--text-3)', fontSize: 13, fontWeight: 600, padding: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${showTranscript ? m.accentFrom : 'var(--stroke-2)'}`,
                fontSize: 11, transition: 'all 0.15s' }}>
                {showTranscript ? '▲' : '▼'}
              </span>
              {showTranscript ? 'Hide transcript' : '+ Paste video transcript (for deeper, content-specific captions)'}
              {transcriptWords > 0 && !showTranscript && (
                <span style={{ fontSize: 11, color: m.accentFrom, fontWeight: 700, marginLeft: 4 }}>({transcriptWords} words added)</span>
              )}
            </button>
            {showTranscript && (
              <div style={{ marginTop: 10 }}>
                {srtSegments && srtSegments.length >= 2 ? (
                  <div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 6, lineHeight: 1.5 }}>
                      Click any segment to copy it. Full transcript is used for caption generation.
                    </div>
                    <SRTViewer srt={transcript} accentColor={m.accentFrom} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-5)' }}>{transcriptWords} words</span>
                      <button className="ci-copybtn" style={{ height: 24, padding: '0 9px', fontSize: 11 }}
                        onClick={() => { setSrtSegments(null); }}>Edit as text ↓</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea className="ci-input" rows={8}
                      placeholder={"Paste your full video script or transcript here.\n\nClaude will extract real hooks, key moments, and specific points to build captions that match your actual content — not just the title."}
                      value={transcript} onChange={e => { setTranscript(e.target.value); setSrtSegments(null); reset(); }}
                      onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate(); }}
                      style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 12.5 }} />
                    {transcriptWords > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-5)', display: 'block', textAlign: 'right', marginTop: 4 }}>
                        {transcriptWords} words · Claude will extract key moments from this
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audio/video transcription via Groq Whisper */}
          <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
              AI Transcription <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Groq Whisper — free)</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5, margin: '0 0 10px' }}>
              Upload your video or audio file and get an instant transcript — like Premiere Pro's caption AI, but free. The transcript auto-fills the field above for better captions.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 8,
                border: '1.5px solid var(--stroke-2)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {transFile ? `📎 ${transFile.name.slice(0, 28)}${transFile.name.length > 28 ? '…' : ''}` : '📎 Choose file'}
                <input type="file" accept="audio/*,video/mp4,video/webm,.mp3,.mp4,.wav,.m4a,.webm,.ogg" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) { setTransFile(f); setTransState('idle'); setTransErr(''); } }} />
              </label>
              {transFile && (
                <button onClick={transcribeFile} disabled={transState === 'transcribing'}
                  style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${m.accentFrom}`,
                    background: m.accentFrom + '18', color: m.accentFrom, fontSize: 13, fontWeight: 700,
                    cursor: transState === 'transcribing' ? 'not-allowed' : 'pointer', opacity: transState === 'transcribing' ? 0.65 : 1 }}>
                  {transState === 'transcribing' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', width: 11, height: 11, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Transcribing…
                    </span>
                  ) : 'Transcribe →'}
                </button>
              )}
              {transState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A', fontWeight: 600 }}>✓ Done — {srtSegments ? `${srtSegments.length} segments` : 'transcript filled in'} above</span>}
            </div>
            {transState === 'error' && transErr && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>
                {transErr}{transErr.includes('Groq') && <button className="ci-copybtn" style={{ height: 24, padding: '0 8px', fontSize: 11, marginLeft: 8 }} onClick={onOpenKey}>Open Settings</button>}
              </div>
            )}
            {!groqKey && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-4)', lineHeight: 1.4 }}>
                No Groq key — <button style={{ background: 'none', border: 'none', color: m.accentFrom, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }} onClick={onOpenKey}>add one free in Settings → Platform Data</button> to enable transcription.
              </div>
            )}
          </div>

          {/* YouTube auto-transcript (no key needed) */}
          <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
              YouTube Auto-Transcript <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(no key needed)</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5, margin: '0 0 10px' }}>
              Paste any YouTube URL and fetch its captions instantly — works on any video with CC or auto-generated subtitles.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="ci-input" style={{ flex: 1, minWidth: 200 }}
                placeholder="https://youtube.com/watch?v=..."
                value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtFetchState('idle'); setYtFetchErr(''); }} />
              <button onClick={fetchYTTranscriptFromUrl}
                disabled={ytFetchState === 'fetching' || !ytUrl.trim()}
                style={{ height: 40, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${m.accentFrom}`,
                  background: m.accentFrom + '18', color: m.accentFrom, fontSize: 13, fontWeight: 700,
                  cursor: (ytFetchState === 'fetching' || !ytUrl.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (ytFetchState === 'fetching' || !ytUrl.trim()) ? 0.65 : 1 }}>
                {ytFetchState === 'fetching' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 11, height: 11, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Fetching…
                  </span>
                ) : 'Fetch captions →'}
              </button>
              {ytFetchState === 'done' && <span style={{ fontSize: 12, color: '#8FD86A', fontWeight: 600 }}>✓ Captions loaded</span>}
            </div>
            {ytFetchState === 'error' && ytFetchErr && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{ytFetchErr}</div>
            )}
          </div>

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

        {(keywords.length > 0 || kwLoading) && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--stroke-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>SEO Keywords</span>
              {kwLoading && <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid var(--text-4)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
              {lang && <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-3)', fontWeight: 600 }}>🌐 {lang.name}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {keywords.map((kw, i) => (
                <button key={i} onClick={() => {
                  window.copyText ? window.copyText(kw) : navigator.clipboard.writeText(kw).catch(() => {});
                  setKwCopied(i); setTimeout(() => setKwCopied(c => c === i ? null : c), 1200);
                }}
                  style={{ height: 28, padding: '0 10px', borderRadius: 999,
                    border: `1px solid ${m.accentFrom}33`, background: kwCopied === i ? m.accentFrom + '25' : m.accentFrom + '10',
                    color: kwCopied === i ? m.accentFrom : 'var(--text-2)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {kwCopied === i ? '✓ ' : ''}{kw}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-5)' }}>Click any keyword to copy • Use these in your tags and description</div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <AnalyzeButton mood={mood} label="Generate captions" loading={loading}
            estIn={estIn} estOut={2200} onClick={generate}
            disabled={!title.trim()} disabledHint="Enter a video title first" />
          {title.trim() && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-5)', textAlign: 'center' }}>Ctrl+Enter to generate</div>}
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
