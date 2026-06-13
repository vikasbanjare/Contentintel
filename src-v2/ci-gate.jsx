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

function AuthGate({ onAuthed }) {
  const m = MOODS.burgundy;
  const saasOn = !!window.CI_SAAS_ON;
  const [mode, setMode] = React.useState('signup'); // signup | signin
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.1 });
    document.querySelectorAll('.ci-gate .ci-rise').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  async function submit() {
    const em = email.trim();
    if (!em || !/.+@.+\..+/.test(em)) { setMsg('Enter a valid email address.'); return; }
    if (saasOn && pass.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    setBusy(true); setMsg('');
    try {
      if (saasOn && window.ciGetSupabase) {
        const sb = await window.ciGetSupabase();
        if (mode === 'signup') {
          const { error } = await sb.auth.signUp({ email: em, password: pass });
          if (error) throw error;
          setMsg('✓ Account created — check your inbox, click the confirmation link, then sign in.');
          setMode('signin'); setBusy(false); return;
        }
        const { error } = await sb.auth.signInWithPassword({ email: em, password: pass });
        if (error) throw error;
        await window.refreshSession();
      }
      markOnboarded(em);
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
              ? (saasOn ? '5 free checks on us — we just confirm your email. No card.' : 'Enter your email to get early access. No card needed.')
              : 'Sign in to pick up where you left off.'}
          </div>
          <input className="ci-input" style={{ marginTop: 18 }} type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          {saasOn && (
            <input className="ci-input" style={{ marginTop: 10 }} type="password" placeholder="Password (8+ characters)" value={pass}
              onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
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
        </div>
      </div>
    </div>
  );
}
window.AuthGate = AuthGate;
