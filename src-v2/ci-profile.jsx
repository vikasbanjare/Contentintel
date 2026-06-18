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
  if (!parts.length) return '';
  return `Creator context — ${parts.join(' | ')}. Tailor all analysis, rewrites, and suggestions to this creator's specific niche, audience, and platform.`;
}
window.getProfileContext = getProfileContext;

function ProfileModal({ open, onClose }) {
  const [p, setP] = React.useState(loadProfile);
  const [saved, setSaved] = React.useState(false);

  if (!open) return null;

  function set(k, v) { setP(prev => ({ ...prev, [k]: v })); setSaved(false); }
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
