// ContentIntel — Accounts (Supabase): sign up w/ email confirmation, sign in,
// profile + plan + usage bar, sign out. Activates ONLY when window.CI_SAAS is
// configured (see saas/SETUP.md) — otherwise the app stays BYO-key, unchanged.

const SAAS = (typeof window !== 'undefined' && window.CI_SAAS) || {};
const saasOn = !!(SAAS.supabaseUrl && SAAS.supabaseAnonKey);

// Lazy-load supabase-js only when configured (zero weight otherwise).
let __sb = null;
function getSupabase() {
  return new Promise((resolve, reject) => {
    if (__sb) return resolve(__sb);
    if (!saasOn) return reject(new Error('SaaS not configured'));
    const make = () => { __sb = window.supabase.createClient(SAAS.supabaseUrl, SAAS.supabaseAnonKey); resolve(__sb); };
    if (window.supabase) return make();
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    sc.onload = make;
    sc.onerror = () => reject(new Error('Could not load the sign-in library.'));
    document.head.appendChild(sc);
  });
}

// Keep the session token globally so the engine can route through the worker.
async function refreshSession() {
  try {
    const sb = await getSupabase();
    const { data } = await sb.auth.getSession();
    window.CI_SESSION = data.session ? data.session.access_token : null;
    window.CI_USER = data.session ? data.session.user : null;
    window.dispatchEvent(new Event('ci-auth'));
    return data.session;
  } catch (e) { return null; }
}
if (saasOn) refreshSession();
window.refreshSession = refreshSession;

const PLAN_LABEL = { free: 'Free — 5 checks', starter: 'Starter — 50/mo', pro: 'Creator Pro — 250/mo', agency: 'Agency — 1,000/mo' };
const PLAN_LIMIT = { free: 5, starter: 50, pro: 250, agency: 1000 };

function AccountModal({ open, onClose, onNav }) {
  const [mode, setMode] = React.useState('signin'); // signin | signup | profile
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    setMsg('');
    refreshSession().then(sess => {
      if (sess) { setMode('profile'); loadProfile(); }
      else setMode('signin');
    });
  }, [open]);

  async function loadProfile() {
    try {
      const sb = await getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from('profiles').select('plan, checks_used, email, full_name').eq('id', user.id).single();
      setProfile({ ...(data || { plan: 'free', checks_used: 0 }), email: user.email });
    } catch (e) {}
  }

  async function submit() {
    if (!email.trim() || pass.length < 8) { setMsg('Enter your email and a password of 8+ characters.'); return; }
    setBusy(true); setMsg('');
    try {
      const sb = await getSupabase();
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({ email: email.trim(), password: pass });
        if (error) throw error;
        setMsg('✓ Account created — check your inbox and click the confirmation link, then sign in.');
        setMode('signin');
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) throw error;
        await refreshSession();
        setMode('profile'); loadProfile();
      }
    } catch (e) {
      setMsg(e.message === 'Email not confirmed' ? 'Confirm your email first — check your inbox (and spam).' : (e.message || 'Something went wrong.'));
    }
    setBusy(false);
  }

  async function signOut() {
    try { const sb = await getSupabase(); await sb.auth.signOut(); } catch (e) {}
    window.CI_SESSION = null; window.CI_USER = null;
    window.dispatchEvent(new Event('ci-auth'));
    onClose();
  }

  if (!open) return null;
  const limit = profile ? (PLAN_LIMIT[profile.plan] || 5) : 5;
  const used = profile ? (profile.checks_used || 0) : 0;
  const pct = Math.min(100, Math.round(used / limit * 100));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'rgba(4,6,12,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="ci-block" style={{ width: 420, maxWidth: '92vw', padding: 28 }} onClick={e => e.stopPropagation()}>
        {mode !== 'profile' ? (
          <>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28 }}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.55 }}>
              {mode === 'signup' ? '5 free checks on us. We confirm your email — no card needed.' : 'Sign in to run checks on your plan.'}
            </div>
            <input className="ci-input" style={{ marginTop: 18 }} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="ci-input" style={{ marginTop: 10 }} type="password" placeholder="Password (8+ characters)" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            {msg && <div style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.5, color: msg.startsWith('✓') ? '#8FD86A' : '#f5788c' }}>{msg}</div>}
            <div style={{ marginTop: 16 }}>
              <GlowButton mood="burgundy" size="lg" style={{ width: '100%', justifyContent: 'center' }} onClick={submit}>
                {busy ? 'One moment…' : mode === 'signup' ? 'Create account →' : 'Sign in →'}
              </GlowButton>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginTop: 14, textAlign: 'center' }}>
              {mode === 'signup'
                ? <span>Already have an account? <a onClick={() => { setMode('signin'); setMsg(''); }} style={{ color: 'var(--text-2)', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</a></span>
                : <span>New here? <a onClick={() => { setMode('signup'); setMsg(''); }} style={{ color: 'var(--text-2)', cursor: 'pointer', textDecoration: 'underline' }}>Create an account — 5 free checks</a></span>}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #6A1F35, #FF4D8D)', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>
                {(profile?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.email || '…'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{PLAN_LABEL[profile?.plan] || PLAN_LABEL.free}</div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-3)', marginBottom: 7 }}>
                <span>Checks used this month</span><b style={{ color: 'var(--text-1)' }}>{used} / {limit}</b>
              </div>
              <div style={{ height: 8, borderRadius: 5, background: 'var(--stroke-1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', borderRadius: 5, background: pct > 85 ? '#F06A7E' : pct > 60 ? '#F0C85A' : '#8FD86A', transition: 'width 0.8s cubic-bezier(0.2,0.7,0.3,1)' }} />
              </div>
            </div>
            {(profile?.plan || 'free') !== 'agency' && (
              <div style={{ marginTop: 18 }}>
                <GlowButton mood="burgundy" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { onClose(); onNav && onNav('pricing'); }}>
                  {profile?.plan === 'free' ? 'Upgrade — from ₹499/mo →' : 'Upgrade your plan →'}
                </GlowButton>
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-5)' }}>Your content is never stored — only this counter.</span>
              <button className="ci-copybtn" style={{ height: 32 }} onClick={signOut}>Sign out</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
window.AccountModal = AccountModal;
window.CI_SAAS_ON = saasOn;
