// ContentIntel -- CREATE: topic in -> scored hooks, a draft script, titles, and
// thumbnail concepts (using your uploaded photo). The "blank page" painkiller.

const { MOODS: CM, Block: CB, RunButton: CRB, WorkHead: CWH, LoadingResults: CLR, ChipGroup: CCG, CopyBlock: CCB } = window;

function buildCreateSystem(hasPhoto) {
  const core = (window.liveResearch && window.liveResearch().core) || '';
  const sc = (window.getResearch && window.getResearch('script')) || {};
  const th = (window.getResearch && window.getResearch('thumbnail')) || {};
  const swipe = (sc.hookSwipeFile || '').split('\n').filter(l => /^\d+\./.test(l.trim())).slice(0, 40).join('\n');
  return [
    "You are ContentIntel's idea engine. Given a TOPIC, generate ready-to-use, research-grounded content ideas for a short-form video. Everything must be specific to the topic -- never generic filler.",
    "LANGUAGE LAW: write everything in the language the user asks for (Hindi -> Hindi, Hinglish -> Hinglish, Spanish -> Spanish, etc.).",
    core ? 'VIRALITY SCIENCE:\n"""\n' + core + '\n"""' : '',
    sc.systemGuidance ? 'HOOK & SCRIPT METHODOLOGY:\n"""\n' + sc.systemGuidance.slice(0, 3200) + '\n"""' : '',
    swipe ? 'PROVEN HOOK FORMULAS (adapt to the topic; fill the blanks with real specifics, never leave placeholders):\n' + swipe : '',
    th.systemGuidance ? 'THUMBNAIL AESTHETIC RULES (the thumbnail prompts MUST follow these -- realistic faces, pro typography, 60-30-10 colour):\n"""\n' + th.systemGuidance.slice(0, 2600) + '\n"""' : '',
    hasPhoto
      ? "A reference PHOTO of the creator is attached. Look at it and DESCRIBE that real person (look, hair, vibe) inside each thumbnail prompt, and add the note: 'attach this same photo when generating so it stays the real person.' Never invent a different face."
      : "No photo is attached. Write thumbnail prompts that work as a complete description, and remind the user they can upload their photo for an accurate likeness.",
    'Return ONLY one valid JSON object (no markdown, no text around it) in EXACTLY this shape:\n'
      + '{ "hooks": [ { "text": "the spoken first line", "type": "Curiosity|Contrarian|Emotional|Specific|Authority|Story", "score": 0-100, "why": "one short reason" } x5 ],'
      + ' "titles": [ "5 title options" ],'
      + ' "script": "a complete ~110-140 word short-form script using the STRONGEST hook, ready to record",'
      + ' "thumbnails": [ { "concept": "1-line idea", "prompt": "full image prompt following the aesthetic rules" } x3 ] }\n'
      + 'Each hook uses a different force and a realistic predicted score. Keep every string tight.',
  ].filter(Boolean).join('\n\n');
}

function readPhoto(file, cb) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    const img = new Image();
    img.onload = () => {
      const MAX = 1024, scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const out = c.toDataURL('image/jpeg', 0.85);
      cb({ mime: 'image/jpeg', data: out.split(',')[1] || '', preview: out });
    };
    img.onerror = () => cb({ mime: file.type || 'image/png', data: String(url).split(',')[1] || '', preview: url });
    img.src = url;
  };
  reader.readAsDataURL(file);
}

function openHandoff(where, prompt) {
  const text = prompt + '\n\n(Attach your photo here so the thumbnail uses your real face, then press enter.)';
  try { window.copyText && window.copyText(text); } catch (e) {}
  if (where === 'gemini') { window.open('https://gemini.google.com/app', '_blank', 'noopener'); }
  else { window.open('https://chatgpt.com/?q=' + encodeURIComponent(text.slice(0, 6000)), '_blank', 'noopener'); }
}

function CreateTab({ onNav }) {
  const mood = 'burgundy';
  const m = CM[mood];
  const [topic, setTopic] = React.useState('');
  const [niche, setNiche] = React.useState('Education');
  const [platform, setPlatform] = React.useState('Reels');
  const [lang, setLang] = React.useState('Auto');
  const [photo, setPhoto] = React.useState(null);
  const [state, setState] = React.useState('idle');
  const [out, setOut] = React.useState(null);
  const [err, setErr] = React.useState('');
  const fileRef = React.useRef(null);

  async function generate() {
    if (topic.trim().length < 3) return;
    setState('loading'); setErr(''); setOut(null);
    const userText = `Topic: ${topic.trim()}\nNiche: ${niche}\nPlatform: ${platform}\nLanguage: ${lang === 'Auto' ? '(match the topic\'s language)' : lang}\n\nGenerate the ideas now.`;
    try {
      const { text } = await window.callClaude({
        system: buildCreateSystem(!!photo),
        userText,
        images: photo ? [photo] : [],
        maxTokens: 3600,
      });
      const json = window.parseReport(text);
      if (!json || (!json.hooks && !json.script)) throw new Error('Could not parse ideas — try again.');
      // Carry topic + best title to the thumbnail builder ("suggest text" prefills from it).
      try { localStorage.setItem('ci_last_create', JSON.stringify({ topic: topic.trim(), title: (json.titles && json.titles[0]) || '', ts: Date.now() })); } catch (e) {}
      setOut(json); setState('done');
      document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(String(e.message) === 'NO_KEY' ? 'Sign in to generate ideas.' : (e.message || 'Something went wrong.'));
      setState('error');
    }
  }

  function refineScript(s) {
    window.__ciPrefillScript = s;
    onNav && onNav('script');
  }
  const scoreColor = v => v >= 75 ? '#8FD86A' : v >= 55 ? '#F0C85A' : '#F06A7E';

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <CWH mood={mood} eyebrow="Create" title="Start from just a topic"
        sub="Give us a topic — get scroll-stopping hooks (scored), a ready-to-record script, titles, and thumbnail concepts. Then refine them in one click." />

      <CB mood={mood} style={{ padding: 22 }}>
        <label className="ci-label">What's your video about?</label>
        <textarea className="ci-textarea" style={{ minHeight: 70 }} value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. How beginners should start investing in SIPs · A day in my life as a baker · Why most reels flop" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          <CCG label="Niche" options={['Education', 'Entertainment', 'Finance', 'Tech', 'Fitness', 'Food', 'Lifestyle', 'Comedy', 'Other']} value={niche} onChange={setNiche} />
          <CCG label="Platform" options={['Reels', 'TikTok', 'Shorts', 'YouTube']} value={platform} onChange={setPlatform} />
          <CCG label="Language" options={['Auto', 'English', 'Hindi', 'Hinglish', 'Spanish']} value={lang} onChange={setLang} />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="ci-label">Your photo <span style={{ fontWeight: 400, color: 'var(--text-4)' }}>— optional, but makes the thumbnail use your real face</span></label>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => readPhoto(e.target.files[0], setPhoto)} />
          {photo
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <img src={photo.preview} alt="you" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--stroke-2)' }} />
                <button className="ci-copybtn" style={{ height: 32 }} onClick={() => setPhoto(null)}>Remove</button>
              </div>
            : <button type="button" className="ci-drop" style={{ minHeight: 40, padding: '8px 14px', width: 'auto', border: '1px solid var(--stroke-1)', marginTop: 6 }} onClick={() => fileRef.current && fileRef.current.click()}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10.5V3M5 6l3-3 3 3M3 11.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>
                Upload your photo
              </button>}
        </div>

        <div style={{ marginTop: 18 }}>
          <CRB mood={mood} onClick={generate} loading={state === 'loading'}>✦ Generate ideas</CRB>
          {topic.trim().length < 3 && <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 12 }}>Enter a topic first.</span>}
        </div>
      </CB>

      {state === 'loading' && <div style={{ marginTop: 14 }}><CLR rows={4} /></div>}
      {state === 'error' && <div className="ci-block" style={{ marginTop: 14, color: 'var(--text-2)' }}>{err}</div>}

      {state === 'done' && out && (
        <div className="ci-results" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.isArray(out.hooks) && out.hooks.length > 0 && (
            <CB title="Hook ideas" desc="Each scored by our virality engine — pick your favourite" mood={mood}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {out.hooks.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0, width: 40 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: scoreColor(h.score || 0) }}>{h.score != null ? Math.round(h.score) : '–'}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h.type || ''}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, color: 'var(--text-1)', lineHeight: 1.5 }}>{h.text}</div>
                      {h.why && <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>{h.why}</div>}
                    </div>
                    <button className="ci-copybtn" style={{ height: 30, flexShrink: 0 }} onClick={() => window.copyText(h.text)}>⧉</button>
                  </div>
                ))}
              </div>
            </CB>
          )}

          {out.script && (
            <CB title="Draft script" desc="Built from the strongest hook — refine it in the Script checker" mood={mood}>
              <div style={{ fontSize: 14.5, color: 'var(--text-1)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{out.script}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <CRB mood={mood} onClick={() => refineScript(out.script)}>Refine in Script checker →</CRB>
                <button className="ci-copybtn" style={{ height: 44, padding: '0 16px' }} onClick={() => window.copyText(out.script)}>⧉ Copy script</button>
              </div>
            </CB>
          )}

          {Array.isArray(out.titles) && out.titles.length > 0 && (
            <CB title="Title options" mood={mood}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {out.titles.map((t, i) => <CCB key={i} text={t} label="Copy" />)}
              </div>
            </CB>
          )}

          {Array.isArray(out.thumbnails) && out.thumbnails.length > 0 && (
            <CB title="Thumbnail concepts" desc={photo ? 'Built around your photo — attach it again when generating' : 'Upload your photo above for an accurate likeness'} mood={mood}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {out.thumbnails.map((t, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--stroke-1)', background: 'var(--surface-1)' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{t.concept}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.55 }}>{t.prompt}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <button className="ci-copybtn" style={{ height: 32 }} onClick={() => window.copyText(t.prompt)}>⧉ Copy prompt</button>
                      <button className="ci-copybtn" style={{ height: 32 }} onClick={() => openHandoff('chatgpt', t.prompt)}>🎨 ChatGPT</button>
                      <button className="ci-copybtn" style={{ height: 32 }} onClick={() => openHandoff('gemini', t.prompt)}>✨ Gemini</button>
                    </div>
                  </div>
                ))}
              </div>
            </CB>
          )}
        </div>
      )}
    </div>
  );
}
window.CreateTab = CreateTab;
