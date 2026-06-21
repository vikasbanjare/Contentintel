// ContentIntel — Creator Profile: channel memory & context injection

const CI_PROFILE_KEY = 'ci_creator_profile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(CI_PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

function saveProfile(p) {
  try { localStorage.setItem(CI_PROFILE_KEY, JSON.stringify(p)); } catch(e) {}
}

function getProfileContext() {
  const p = loadProfile();
  const parts = [];
  if (p.channel)  parts.push(`creator: ${p.channel}`);
  if (p.niche)    parts.push(`niche: ${p.niche}`);
  if (p.audience) parts.push(`audience: ${p.audience}`);
  if (p.platform) parts.push(`platform: ${p.platform}`);
  if (p.tone)     parts.push(`tone: ${p.tone}`);
  let out = '';
  if (parts.length) out = `Creator context — ${parts.join(' | ')}. Tailor all analysis, rewrites, and suggestions to this creator's specific niche, audience, and platform.`;
  // Voice-DNA: when present, every rewrite/script/caption must match this voice.
  if (p.voiceDna && p.voiceDna.trim()) {
    out += (out ? '\n\n' : '') + `VOICE — write/rewrite in THIS creator's exact voice (their own profile). Match their sentence shapes, signature phrases, hooks and CTAs; never default to a generic voice. Profile:\n"""\n${p.voiceDna.trim().slice(0, 1400)}\n"""`;
  }
  return out;
}
window.getProfileContext = getProfileContext;

const VOICE_DNA_PROMPT =
"You are building my VOICE-DNA — a reusable profile of HOW I write and talk, so you can match my voice later. " +
"Below are my real posts / video transcripts. Analyze HOW I express myself, not what they're about. " +
"Output ONE tight markdown profile with these sections: " +
"## How I sound (3-5 lines, quote me). " +
"## Sentence shapes (length & punctuation habits, 2-3 real quotes). " +
"## Signature phrases & tics (verbatim words/openers/transitions I reuse). " +
"## How I open (my hook patterns, quote my 3 strongest openers). " +
"## How I close (my real CTA / last-line style). " +
"## Anti-voice (words and moves that would instantly sound NOT like me). " +
"Ground every claim in a real quote from my posts — no generic adjectives. Keep it short enough to drop into a system prompt. Here are my posts:\n\n";

function ProfileModal({ open, onClose }) {
  const [p, setP] = React.useState(loadProfile);
  const [saved, setSaved] = React.useState(false);
  const [posts, setPosts] = React.useState('');
  const [vState, setVState] = React.useState('idle'); // idle | building | error
  const [vErr, setVErr] = React.useState('');

  if (!open) return null;

  function set(k, v) { setP(prev => ({ ...prev, [k]: v })); setSaved(false); }

  async function buildVoice() {
    const sample = posts.trim();
    if (sample.length < 200) { setVErr('Paste at least a few hundred characters of your real posts/transcripts (more = sharper).'); setVState('error'); return; }
    if (!window.callTextLLM) { setVErr('AI not available.'); setVState('error'); return; }
    setVState('building'); setVErr('');
    try {
      const profile = await window.callTextLLM({ system: 'You analyze a writer\'s voice and output a compact reusable voice profile.', userText: VOICE_DNA_PROMPT + sample.slice(0, 8000), maxTokens: 1200 });
      if (!profile || !profile.trim()) throw new Error('Empty response — try again.');
      setP(prev => ({ ...prev, voiceDna: profile.trim() })); setSaved(false); setVState('idle');
    } catch (e) {
      const m = String(e.message || '');
      setVErr(/NO_\w+_KEY|No API key/i.test(m) ? 'Add an API key (or pick a free provider) in Settings first.' : (m || 'Could not build voice profile.'));
      setVState('error');
    }
  }
  function save() { saveProfile(p); setSaved(true); setTimeout(() => onClose(true), 650); }
  function clear() { setP({}); saveProfile({}); setSaved(false); }

  const ctx = (() => {
    const parts = [];
    if (p.channel)  parts.push(`creator: ${p.channel}`);
    if (p.niche)    parts.push(`niche: ${p.niche}`);
    if (p.audience) parts.push(`audience: ${p.audience}`);
    if (p.platform) parts.push(`platform: ${p.platform}`);
    if (p.tone)     parts.push(`tone: ${p.tone}`);
    return parts.length ? parts.join(' · ') : '';
  })();

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,9,14,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ci-block" style={{ width: '100%', maxWidth: 540, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <Eyebrow mood="burgundy" glow>Channel Memory</Eyebrow>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 30, margin: '6px 0 0' }}>Creator Profile</h3>
          </div>
          <button className="ci-iconbtn" onClick={() => onClose()} title="Close" style={{ marginTop: 4 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '10px 0 24px', lineHeight: 1.65 }}>
          Tell ContentIntel about your channel once — every check, rewrite, and caption will automatically tailor its feedback to your niche, audience, and style.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Channel / Creator name</span>
            <input className="ci-input" placeholder="e.g. TechWithVikas" value={p.channel || ''} onChange={e => set('channel', e.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Niche / Topic</span>
            <input className="ci-input" placeholder="e.g. Personal finance for Indians, AI tutorials, Street food vlogging" value={p.niche || ''} onChange={e => set('niche', e.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Target audience</span>
            <input className="ci-input" placeholder="e.g. Beginners aged 20–35, Working professionals in India" value={p.audience || ''} onChange={e => set('audience', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Primary platform</span>
              <select className="ci-input" value={p.platform || ''} onChange={e => set('platform', e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="">Select…</option>
                <option value="YouTube">YouTube</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter/X">Twitter/X</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Content tone</span>
              <select className="ci-input" value={p.tone || ''} onChange={e => set('tone', e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="">Select…</option>
                <option value="Educational">Educational</option>
                <option value="Entertaining">Entertaining</option>
                <option value="Motivational">Motivational</option>
                <option value="Conversational">Conversational</option>
                <option value="Professional">Professional</option>
                <option value="Humorous">Humorous</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </label>
          </div>
        </div>

        {ctx && (
          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(143,216,106,0.07)', border: '1px solid rgba(143,216,106,0.22)', fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
            <span style={{ color: '#8FD86A', fontWeight: 700 }}>Active context: </span>{ctx}
          </div>
        )}

        {/* Voice-DNA — teach the AI to write like you */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--stroke-1)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Voice DNA <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— make every script & caption sound like YOU</span></span>
          {p.voiceDna ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(143,216,106,0.06)', border: '1px solid rgba(143,216,106,0.22)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55, maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                <span style={{ color: '#8FD86A', fontWeight: 700 }}>✓ Voice profile active.</span> Every rewrite now matches your voice.
                {'\n\n'}{p.voiceDna.slice(0, 600)}{p.voiceDna.length > 600 ? '…' : ''}
              </div>
              <button className="ci-copybtn" style={{ height: 28, padding: '0 12px', fontSize: 12, marginTop: 8 }} onClick={() => { set('voiceDna', ''); setPosts(''); }}>Rebuild / clear voice</button>
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55, margin: '0 0 8px' }}>
                Paste 10–20 of your real posts or video transcripts (how you actually talk). The AI extracts your voice once and reuses it everywhere — uses your selected provider (free providers work).
              </p>
              <textarea className="ci-input" rows={5} placeholder={"Paste your real posts / transcripts here, one after another…"}
                value={posts} onChange={e => { setPosts(e.target.value); setVState('idle'); setVErr(''); }}
                style={{ resize: 'vertical', lineHeight: 1.55, fontSize: 12.5 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <button onClick={buildVoice} disabled={vState === 'building'}
                  style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1.5px solid #8FD86A', background: 'rgba(143,216,106,0.12)', color: '#8FD86A', fontSize: 13, fontWeight: 700, cursor: vState === 'building' ? 'not-allowed' : 'pointer', opacity: vState === 'building' ? 0.65 : 1 }}>
                  {vState === 'building'
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 11, height: 11, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Building…</span>
                    : '🧬 Build my voice profile'}
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-5)' }}>{posts.trim() ? `${posts.trim().length} chars` : 'one-time, ~1 min'}</span>
              </div>
              {vState === 'error' && vErr && <div style={{ marginTop: 8, fontSize: 12.5, color: '#F06A7E', lineHeight: 1.5 }}>{vErr}</div>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <GlowButton mood="burgundy" size="lg" style={{ flex: 1, justifyContent: 'center' }} onClick={save}>
            {saved ? '✓ Saved!' : 'Save profile →'}
          </GlowButton>
          <button className="ci-copybtn" style={{ height: 46, padding: '0 16px' }} onClick={clear} title="Clear all profile fields">Clear</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-5)', textAlign: 'center', marginTop: 10 }}>Stored only on this device — never sent to our servers.</div>
      </div>
    </div>
  );
}
window.ProfileModal = ProfileModal;
