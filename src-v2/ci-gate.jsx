// ContentIntel -- onboarding gate. First-time visitors land here:
//   welcome / sign-in  ->  pricing (skippable)  ->  the app.
// Works TODAY in "early access" mode (email capture, no backend) and upgrades
// to real Supabase accounts + email confirmation the moment CI_SAAS is set.

const GATE_KEY = 'ci_onboarded';
const EMAIL_KEY = 'ci_user_email';
function gateDone()  { try { return localStorage.getItem(GATE_KEY) === '1'; } catch (e) { return false; } }
function markOnboarded(email) {
  try { localStorage.setItem(GATE_KEY, '1'); if (email) localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
}
function gateReset() { try { localStorage.removeItem(GATE_KEY); } catch (e) {} }
window.ciGateDone = gateDone;
window.ciGateReset = gateReset;
window.ciMarkOnboarded = markOnboarded;

function AuthGate({ onAuthed }) {
  const m = MOODS.burgundy;
  const saasOn = !!window.CI_SAAS_ON;
  const [mode, setMode] = React.useState('signup'); // signup | signin
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [persona, setPersona] = React.useState('');
  const [platform, setPlatform] = React.useState('');
  const [invite, setInvite] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.1 });
    document.querySelectorAll('.ci-gate .ci-rise').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  async function google() {
    try {
      const sb = await window.ciGetSupabase();
      if (invite.trim()) { try { localStorage.setItem('ci_pending_invite', invite.trim()); } catch (e) {} }
      await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    } catch (e) { setMsg('Could not start Google sign-in — try email instead.'); }
  }

  async function submit() {
    const em = email.trim();
    if (mode === 'signup' && !name.trim()) { setMsg('Please enter your name.'); return; }
    if (!em || !/.+@.+\..+/.test(em)) { setMsg('Enter a valid email address.'); return; }
    if (saasOn && pass.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    const meta = { full_name: name.trim(), phone: phone.trim(), persona, platform, invite_code: invite.trim() };
    setBusy(true); setMsg('');
    try {
      if (saasOn && window.ciGetSupabase) {
        const sb = await window.ciGetSupabase();
        if (mode === 'signup') {
          const { error } = await sb.auth.signUp({ email: em, password: pass, options: { data: meta } });
          if (error) throw error;
          setMsg('✓ Account created — check your inbox, click the confirmation link, then sign in.');
          setMode('signin'); setBusy(false); return;
        }
        const { error } = await sb.auth.signInWithPassword({ email: em, password: pass });
        if (error) throw error;
        await window.refreshSession();
      }
      markOnboarded(em); try { localStorage.setItem('ci_user_name', name.trim()); } catch(e){}
      onAuthed();
    } catch (e) {
      setMsg(e.message === 'Email not confirmed' ? 'Confirm your email first — check your inbox (and spam).' : (e.message || 'Something went wrong.'));
      setBusy(false);
    }
  }

  const bullets = [
    ['Script', 'Hook, retention & a stronger rewrite — line by line'],
    ['Thumbnail', 'Will it earn the click? A/B/C compare + redesign prompts'],
    ['Title · Ads · Ask', 'Angles, limits, and straight answers on growth'],
  ];

  return (
    <div className="ci-gate ci-hero-aurora" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', position: 'relative', overflow: 'hidden' }}>
      <div className="ci-aurora-wrap" aria-hidden="true">
        <div className="ci-aurora-orb a" /><div className="ci-aurora-orb b" /><div className="ci-aurora-orb c" /><div className="ci-aurora-sweep" /><div className="ci-hero-grid" />
      </div>

      {/* Left: the pitch */}
      <div className="ci-gate-pitch" style={{ position: 'relative', zIndex: 2, padding: '56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="ci-rise" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, marginBottom: 26 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>◈</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>ContentIntel</span>
        </div>
        <h1 className="ci-rise" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 62, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-1)' }}>
          Know it&rsquo;ll work<br/><span className="ci-grad-text" style={{ fontStyle: 'italic' }}>before you post.</span>
        </h1>
        <p className="ci-rise" style={{ fontSize: 16.5, color: 'var(--text-2)', marginTop: 20, maxWidth: 440, lineHeight: 1.6 }}>
          The pre-publish checker for creators. Grade your script, thumbnail, title and ads the way the algorithm does — fixed before they go live.
        </p>
        <div className="ci-rise" style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bullets.map(([h, d]) => (
            <div key={h} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: '#8FD86A', fontWeight: 800, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 14.5, color: 'var(--text-2)' }}><b style={{ color: 'var(--text-1)' }}>{h}</b> — {d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: the auth card */}
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', placeItems: 'center', padding: '40px 48px' }}>
        <div className="ci-block ci-rise" style={{ width: '100%', maxWidth: 380, padding: 30 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 29 }}>{mode === 'signup' ? 'Get started free' : 'Welcome back'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.55 }}>
            {mode === 'signup'
              ? (saasOn ? 'Sign up in one click. You\'ll enter your invite code next.' : 'Enter your email to get early access. No card needed.')
              : 'Sign in to pick up where you left off.'}
          </div>
          {saasOn && (
            <>
              <button type="button" onClick={google} style={{ width: '100%', height: 46, marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, border: '1px solid var(--stroke-2)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.6 9.2c0-.6-.05-1.18-.16-1.74H9v3.34h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.88 2.68-6.58z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.93v2.33A9 9 0 009 18z"/><path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 010-3.4V4.97H.93a9 9 0 000 8.06l3.02-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 00.93 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/></svg>
                Continue with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 2px', color: 'var(--text-5)', fontSize: 11.5 }}>
                <span style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }} /> or use email <span style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }} />
              </div>
            </>
          )}
          {mode === 'signup' && (
            <input className="ci-input" style={{ marginTop: 12 }} type="text" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          )}
          <input className="ci-input" style={{ marginTop: mode === 'signup' ? 10 : 18 }} type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          {saasOn && (
            <input className="ci-input" style={{ marginTop: 10 }} type="password" placeholder="Password (8+ characters)" value={pass}
              onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          )}
          {mode === 'signup' && (
            <>
              <input className="ci-input" style={{ marginTop: 10 }} type="tel" placeholder="Phone / WhatsApp (optional)" value={phone}
                onChange={e => setPhone(e.target.value)} />
              <select className="ci-input" style={{ marginTop: 10, appearance: 'auto' }} value={persona} onChange={e => setPersona(e.target.value)}>
                <option value="">What best describes you?</option>
                <option>Creator / Influencer</option>
                <option>Agency</option>
                <option>Business / Brand</option>
                <option>Marketer</option>
                <option>Just exploring</option>
              </select>
              <select className="ci-input" style={{ marginTop: 10, appearance: 'auto' }} value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="">Main platform</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Instagram + YouTube</option>
                <option>TikTok</option>
                <option>Other</option>
              </select>
            </>
          )}
          {msg && <div style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.5, color: msg.startsWith('✓') ? '#8FD86A' : '#f5788c' }}>{msg}</div>}
          <div style={{ marginTop: 16 }}>
            <GlowButton mood="burgundy" size="lg" style={{ width: '100%', justifyContent: 'center' }} onClick={submit}>
              {busy ? 'One moment…' : mode === 'signup' ? (saasOn ? 'Create account →' : 'Get started →') : 'Sign in →'}
            </GlowButton>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginTop: 14, textAlign: 'center' }}>
            {mode === 'signup'
              ? <span>Already with us? <a onClick={() => { setMode('signin'); setMsg(''); }} style={{ color: 'var(--text-2)', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</a></span>
              : <span>New here? <a onClick={() => { setMode('signup'); setMsg(''); }} style={{ color: 'var(--text-2)', cursor: 'pointer', textDecoration: 'underline' }}>Create an account</a></span>}
          </div>
          {!saasOn && (
            <div style={{ fontSize: 11, color: 'var(--text-5)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
              Early access — your email is stored only on this device for now.
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-5)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
            By continuing you agree to our <a href="/terms.html" target="_blank" style={{ color: 'var(--text-4)', textDecoration: 'underline' }}>Terms</a> & <a href="/privacy.html" target="_blank" style={{ color: 'var(--text-4)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
window.AuthGate = AuthGate;

// Shown AFTER login when the account isn't approved yet: enter an invite code.
function InviteGate({ onApproved }) {
  const m = MOODS.burgundy;
  const [code, setCode] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const email = (window.CI_USER && window.CI_USER.email) || '';

  async function submit() {
    if (!code.trim()) { setMsg('Enter your invite code.'); return; }
    setBusy(true); setMsg('');
    try {
      await window.ciRedeemInvite(code.trim());
      try { window.ciMarkOnboarded && window.ciMarkOnboarded(email); } catch (e) {}
      onApproved();
    } catch (e) { setMsg(e.message || 'That code is not valid.'); setBusy(false); }
  }
  async function logout() { try { await window.ciSignOut(); } catch (e) {} }

  return (
    <div className="ci-gate ci-hero-aurora" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="ci-aurora-wrap" aria-hidden="true">
        <div className="ci-aurora-orb a" /><div className="ci-aurora-orb b" /><div className="ci-aurora-orb c" /><div className="ci-aurora-sweep" /><div className="ci-hero-grid" />
      </div>
      <div className="ci-block ci-rise in" style={{ position: 'relative', zIndex: 2, width: 420, maxWidth: '92vw', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: 12, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>◈</div>
        <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, marginTop: 16 }}>You're almost in</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.6 }}>
          ContentIntel is in private alpha. Enter the invite code you were given to unlock access.
        </div>
        <input className="ci-input" style={{ marginTop: 20, textAlign: 'center', fontSize: 16, letterSpacing: '0.04em' }} value={code}
          onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Enter invite code" />
        {msg && <div style={{ fontSize: 12.5, marginTop: 12, color: '#f5788c' }}>{msg}</div>}
        <div style={{ marginTop: 16 }}>
          <GlowButton mood="burgundy" size="lg" style={{ width: '100%', justifyContent: 'center' }} onClick={submit}>
            {busy ? 'Checking…' : 'Unlock access →'}
          </GlowButton>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 16, lineHeight: 1.6 }}>
          Signed in as {email || 'your account'}. No code yet? Ask for one, then come back.<br/>
          <a onClick={logout} style={{ color: 'var(--text-3)', cursor: 'pointer', textDecoration: 'underline' }}>Sign out</a>
        </div>
      </div>
    </div>
  );
}
window.InviteGate = InviteGate;
