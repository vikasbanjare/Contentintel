// ContentIntel -- shell: TopNav, tab icons, Home (video hero + feature showcase)
// NOTE: MOODS is the global `const MOODS` declared in ui.jsx (shared across the
// classic text/babel scripts). We must NOT redeclare it here or it collides.

// ── VIDEO CONFIG ─────────────────────────────────────────────────────────────
// Two videos x two themes. Use DIRECT .mp4 links (higgsfield's CDN format:
// https://d8j0ntlcm91z4.cloudfront.net/.../hf_....mp4). The /s/ share links do
// NOT work in a <video> tag. Empty LIGHT values fall back to the dark video.
window.__resources = (typeof window !== 'undefined' && window.__resources) || {};
const CI_VIDEOS = {
  heroDark:     window.__resources.heroVideoDark     || "https://github.com/user-attachments/assets/2a0b12f2-7288-4a07-adf9-f02e38d92870",
  heroLight:    window.__resources.heroVideoLight    || "https://github.com/user-attachments/assets/bba9884a-b375-4b8a-9e2e-35594c121d3a",
  ambientDark:  window.__resources.ambientVideoDark  || "https://github.com/user-attachments/assets/f09e7494-5ae7-41ad-9f10-4a616831d96b",
  ambientLight: window.__resources.ambientVideoLight || "https://github.com/user-attachments/assets/e50bc266-97ba-43f9-bb4f-8c2594ede9b4",
};
function ciHeroVideo(theme)    { return (theme === 'light' && CI_VIDEOS.heroLight)    ? CI_VIDEOS.heroLight    : CI_VIDEOS.heroDark; }
function ciAmbientVideo(theme) { return (theme === 'light' && CI_VIDEOS.ambientLight) ? CI_VIDEOS.ambientLight : CI_VIDEOS.ambientDark; }
window.CI_VIDEOS = CI_VIDEOS;
window.ciHeroVideo = ciHeroVideo;
window.ciAmbientVideo = ciAmbientVideo;
const VIDEO_SRC = CI_VIDEOS.heroDark; // legacy alias

// Shared theme hook: tracks the current theme and updates live when toggled.
function useCITheme() {
  const read = () => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light') ? 'light' : 'dark';
  const [t, setT] = React.useState(read);
  React.useEffect(() => {
    const f = () => setT(read());
    window.addEventListener('ci-theme', f);
    return () => window.removeEventListener('ci-theme', f);
  }, []);
  return t;
}
window.useCITheme = useCITheme;

// Tab definitions -- each has a mood chosen for its content
const TABS = [
  { id: 'script',    label: 'Script',      mood: 'navy',     icon: 'script'    },
  { id: 'thumbnail', label: 'Thumbnail',   mood: 'ember',    icon: 'thumb'     },
  { id: 'title',     label: 'Title',       mood: 'cyan',     icon: 'title'     },
  { id: 'ads',       label: 'Ads',         mood: 'violet',   icon: 'ads'       },
  { id: 'ask',       label: 'Ask',         mood: 'violet',   icon: 'ask'       },
  { id: 'pricing',   label: 'Pricing',     mood: 'burgundy', icon: 'pricing'   },
  { id: 'builder',   label: 'Studio',      mood: 'lime',     icon: 'studio'    },
  { id: 'platform',  label: 'Platform IQ', mood: 'violet',   icon: 'platform'  },
  { id: 'playbook',  label: 'Playbook',    mood: 'ember',    icon: 'playbook'  },
  { id: 'history',   label: 'History',     mood: 'burgundy', icon: 'history'   },
];

function CITabIcon({ name }) {
  const s = { width: 15, height: 15, stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'script':  return <svg {...s} viewBox="0 0 16 16"><path d="M3 2.5h7l3 3V13a.5.5 0 01-.5.5h-9.5A.5.5 0 012.5 13V3a.5.5 0 01.5-.5z"/><path d="M10 2.5v3h3M5 8h6M5 10.5h4"/></svg>;
    case 'thumb':   return <svg {...s} viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1.5"/><circle cx="6" cy="6.5" r="1"/><path d="M2.5 11l3-3 2.5 2.5L11 7l2.5 2.5"/></svg>;
    case 'title':   return <svg {...s} viewBox="0 0 16 16"><path d="M3 4.5h10M3 8h7M3 11.5h9"/></svg>;
    case 'ads':     return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 6.5v3l8 3.5v-10l-8 3.5z"/><path d="M2.5 6.5H5v3H2.5zM12 5.5a3 3 0 010 5"/></svg>;
    case 'history':  return <svg {...s} viewBox="0 0 16 16"><path d="M8 4.5V8l2.5 1.5"/><circle cx="8" cy="8" r="5.5"/></svg>;
    case 'studio':   return <svg {...s} viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="9" rx="1.5"/><path d="M5 14h6M8 11v3M5 5.5h6M5 7.5h4"/></svg>;
    case 'platform': return <svg {...s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M8 2.5C6 5 5 6.5 5 8s1 3 3 5.5M8 2.5C10 5 11 6.5 11 8s-1 3-3 5.5M2.5 8h11"/></svg>;
    case 'playbook': return <svg {...s} viewBox="0 0 16 16"><path d="M3 3h7a2 2 0 012 2v8H5a2 2 0 00-2 2V3z"/><path d="M3 3a2 2 0 00-2 2v8a2 2 0 012-2"/><path d="M6 6h4M6 8.5h3"/></svg>;
    case 'home':     return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 7L8 2.5 13.5 7v6a.5.5 0 01-.5.5h-3v-4h-3v4H3a.5.5 0 01-.5-.5V7z"/></svg>;
    case 'ask':     return <svg {...s} viewBox="0 0 16 16"><path d="M6 6a2 2 0 113.4 1.4C8.7 8.1 8 8.6 8 9.5"/><circle cx="8" cy="12" r="0.5" fill="currentColor"/><circle cx="8" cy="8" r="6"/></svg>;
    case 'pricing': return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 8.5V3.5a1 1 0 011-1h5l5 5a1 1 0 010 1.4l-4.6 4.6a1 1 0 01-1.4 0l-5-5z"/><circle cx="6" cy="6" r="1"/></svg>;
    default: return null;
  }
}
window.CITabIcon = CITabIcon;

// Light / dark theme toggle (persists in localStorage; applied to <html data-theme>).
function ThemeToggle() {
  const [light, setLight] = React.useState(() => {
    try { return localStorage.getItem('ci_theme') === 'light'; } catch (e) { return false; }
  });
  React.useEffect(() => {
    const root = document.documentElement;
    if (light) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('ci_theme', light ? 'light' : 'dark'); } catch (e) {}
    try { window.dispatchEvent(new Event('ci-theme')); } catch (e) {}
  }, [light]);
  return (
    <button className={'ci-themeswitch' + (light ? ' light' : '')} title={light ? 'Switch to dark mode' : 'Switch to light mode'}
      onClick={() => setLight(v => !v)} aria-label="Toggle theme">
      <span className="ci-themeswitch-icon sun">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4"/></svg>
      </span>
      <span className="ci-themeswitch-icon moon">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 106.5 6.5z"/></svg>
      </span>
      <span className="ci-themeswitch-knob" />
    </button>
  );
}
window.ThemeToggle = ThemeToggle;

function TopNav({ active, onNav, mood, onOpenKey, onAdmin, onAccount, hasKey, admin }) {
  const m = MOODS[mood] || MOODS.burgundy;
  return (
    <nav className="ci-nav">
      <div className="ci-logo" onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>
        <div className="ci-logo-mark" style={{ background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, boxShadow: `0 0 16px ${m.accentGlow}` }}>◈</div>
        ContentIntel
      </div>
      <span className="ci-badge">Pre-publish checker</span>

      <div style={{ flex: 1 }} />

      <div className="ci-tabs">
        {TABS.map(t => {
          const tm = MOODS[t.mood];
          const isActive = active === t.id;
          return (
            <button key={t.id} className={'ci-tab' + (isActive ? ' active' : '')} onClick={() => onNav(t.id)}>
              <span className="ci-tab-glow" style={{ boxShadow: isActive ? `inset 0 0 0 1px ${tm.accentGlow}, 0 0 18px ${tm.accentGlow}` : 'none' }} />
              <span style={{ color: isActive ? tm.accentFrom : 'inherit', display: 'flex' }}><CITabIcon name={t.icon} /></span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <button className="ci-keybtn" title="API key & model settings" onClick={onOpenKey}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5.5" cy="8" r="2.5"/><path d="M8 8h5.5M11.5 8v2.2M13.5 8v1.6"/></svg>
        <span>{hasKey ? "Key connected" : "Add API key"}</span>
        <span className={"ci-keydot " + (hasKey ? "on" : "off")} />
      </button>

      {admin && (
        <button className="ci-iconbtn" title="Research editor (admin only)" onClick={onAdmin}
          style={{ color: m.accentFrom, borderColor: m.accentGlow }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 016 0"/></svg>
        </button>
      )}

      {window.CI_SAAS_ON && (
        <button className="ci-keybtn" title="Account" onClick={onAccount}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="5.5" r="2.6"/><path d="M2.8 13.5a5.2 5.2 0 0110.4 0"/></svg>
          <span>{window.CI_USER ? 'Account' : 'Sign in'}</span>
        </button>
      )}
      <ThemeToggle />
    </nav>
  );
}
window.TopNav = TopNav;

// ── HOME ────────────────────────────────────────────────────────────────────
function HomeView({ onNav, onOpenKey, hasKey }) {
  const mood = 'burgundy';
  const m = MOODS[mood];
  const heroRef = React.useRef(null);
  const par1 = React.useRef(null), par2 = React.useRef(null), par3 = React.useRef(null), parCards = React.useRef(null);

  React.useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (par1.current) par1.current.style.transform = `translate(${x * 30}px, ${y * 22}px)`;
        if (par2.current) par2.current.style.transform = `translate(${x * -42}px, ${y * -30}px)`;
        if (par3.current) par3.current.style.transform = `translate(${x * 18}px, ${y * 26}px)`;
        if (parCards.current) parCards.current.style.transform = `translate(${x * -14}px, ${y * -10}px)`;
      });
    };
    el.addEventListener('mousemove', onMove);
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  React.useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.ci-rise').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const features = [
    { id: 'script',    label: 'Script',    icon: 'script', mood: 'navy',   tags: ['Hook strength', 'Retention curve', 'Rewrites'],  line: 'Reads your script line by line — hook pull, drop-off risk, and a stronger rewrite.' },
    { id: 'thumbnail', label: 'Thumbnail', icon: 'thumb',  mood: 'ember',  tags: ['Click read', 'A/B/C compare', 'Fix prompts'],   line: 'Will it earn the click? We read it like the feed does — then regenerate it beautifully.' },
    { id: 'title',     label: 'Title',     icon: 'title',  mood: 'cyan',   tags: ['Click chance', '10 angles', 'Mobile preview'],  line: 'Click chance, curiosity and mobile truncation, plus 10 alternative angles to steal.' },
    { id: 'ads',       label: 'Ads',       icon: 'ads',    mood: 'violet', tags: ['Char limits', 'Scroll-stop', 'Compliance'],     line: 'Meta & Google limits, scroll-stopping power, compliance flags and rewrites.' },
    { id: 'ask',       label: 'Ask',       icon: 'ask',    mood: 'violet', tags: ['Instagram SEO', 'Algorithm', 'Pricing'],        line: 'Stuck at 200 views? Hashtags? Brand-deal pricing? Ask anything, get a real answer.' },
  ];

  const stats = [
    { v: '9', l: 'Tools in one place' },
    { v: 'A/B/C', l: 'Test up to 3 thumbnails' },
    { v: '160+', l: 'Proven hook formulas inside' },
    { v: 'Any', l: 'Language — Hindi to Spanish' },
  ];

  return (
    <div className="ci-reveal">
      <section ref={heroRef} className="ci-hero ci-hero-aurora" style={{ minHeight: 640, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div className="ci-aurora-wrap" aria-hidden="true">
          <div ref={par1} style={{ position: 'absolute', inset: 0, transition: 'transform 0.4s cubic-bezier(0.2,0.7,0.3,1)' }}>
            <div className="ci-aurora-orb a" />
          </div>
          <div ref={par2} style={{ position: 'absolute', inset: 0, transition: 'transform 0.5s cubic-bezier(0.2,0.7,0.3,1)' }}>
            <div className="ci-aurora-orb b" />
            <div className="ci-aurora-orb d" />
          </div>
          <div ref={par3} style={{ position: 'absolute', inset: 0, transition: 'transform 0.45s cubic-bezier(0.2,0.7,0.3,1)' }}>
            <div className="ci-aurora-orb c" />
          </div>
          <div className="ci-aurora-sweep" />
          <div className="ci-hero-grid" />
        </div>

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1180, margin: '0 auto', padding: '0 32px', width: '100%', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 30, alignItems: 'center' }}>
          <div>
            <div className="ci-fadeup d1 eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--text-3)', letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.accentFrom, boxShadow: `0 0 10px ${m.accentGlow}` }} className="pulse-dot" />
              Pre-publish checker
            </div>
            <h1 className="ci-fadeup d2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 84, margin: '18px 0 0', lineHeight: 1.04, letterSpacing: '-0.018em', color: 'var(--text-1)' }}>
              Know it&rsquo;ll work<br/>before you{' '}
              <span className="ci-grad-text" style={{ fontStyle: 'italic' }}>hit publish.</span>
            </h1>
            <p className="ci-fadeup d3" style={{ margin: '26px 0 0', fontSize: 18, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: 540 }}>
              Paste a script, drop a thumbnail, test a title or an ad. ContentIntel tells you what&rsquo;s working, what&rsquo;s not, and exactly how to fix it &mdash; in plain language, before it goes live.
            </p>
            <div className="ci-fadeup d4" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 32 }}>
              <GlowButton mood={mood} size="lg" onClick={() => onNav('script')}>Check your content →</GlowButton>
              <button className="btn ghost ci-ghostbtn" style={{ height: 48, padding: '0 22px', fontSize: 14.5 }} onClick={() => onNav('pricing')}>See pricing</button>
            </div>
            <div className="ci-fadeup d5" onClick={onOpenKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 22, cursor: 'pointer', fontSize: 13, color: 'var(--text-4)' }}>
              <span className={'ci-keydot ' + (hasKey ? 'on' : 'off')} />
              {hasKey
                ? <span>Running on your own Anthropic key — analyses are live.</span>
                : <span>Runs on <b>your own</b> Anthropic API key (stored only in your browser). <span style={{ color: m.accentFrom, textDecoration: 'underline' }}>Connect key</span></span>}
            </div>
          </div>

          <div ref={parCards} className="ci-fadeup d4" style={{ position: 'relative', minHeight: 380, transition: 'transform 0.5s cubic-bezier(0.2,0.7,0.3,1)' }} aria-hidden="true">
            <div className="ci-float-card f1 glass-strong">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--stroke-2)" strokeWidth="5"/>
                  <circle className="ci-donut-anim" cx="32" cy="32" r="26" fill="none" stroke="#8FD86A" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="163.4" strokeDashoffset="21" transform="rotate(-90 32 32)" style={{ filter: 'drop-shadow(0 0 5px rgba(143,216,106,0.6))' }}/>
                  <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight="800" fontSize="17" fill="var(--text-1)">87</text>
                </svg>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span className="ci-dot green" /><b style={{ fontSize: 14.5, color: 'var(--text-1)' }}>Ready to ship</b></div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Hook lands in 1.8s — strong open loop.</div>
                </div>
              </div>
            </div>
            <div className="ci-float-card f2 glass-strong">
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Hook strength</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--stroke-1)', overflow: 'hidden' }}>
                  <div className="ci-bar-anim" style={{ height: '100%', width: '84%', borderRadius: 4, background: 'linear-gradient(90deg, #FF4D8D, #FF9CC2)' }} />
                </div>
                <b style={{ fontSize: 15, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>84</b>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 8 }}>&ldquo;Most people quit in week one&hellip;&rdquo; — opens with stakes ✓</div>
            </div>
            <div className="ci-float-card f3 glass-strong">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>🎨</span>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}><b style={{ color: 'var(--text-1)' }}>Thumbnail B wins</b> — face + one bold claim beats the busy collage.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ci-rise" style={{ maxWidth: 1140, margin: '0 auto', padding: '0 26px', marginTop: -34, position: 'relative', zIndex: 5 }}>
        <div className="glass ci-stats-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: 20, overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} className="ci-stat-cell" style={{ padding: '24px 28px', borderLeft: i ? '1px solid var(--stroke-1)' : 'none' }}>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 36, letterSpacing: '-0.01em', color: 'var(--text-1)' }}>{s.v}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="ci-section-warm" style={{ marginTop: 48, padding: '56px 32px 56px', position: 'relative' }}>
        <AmbientBloom mood={mood} intensity={0.35} variant="subtle" />
        <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="ci-rise" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <Eyebrow mood={mood} glow>Nine tools · one workflow</Eyebrow>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 50, margin: '10px 0 0', letterSpacing: '-0.01em', color: 'var(--text-1)' }}>Everything you ship, graded first.</h2>
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--text-3)', maxWidth: 300, textAlign: 'right', lineHeight: 1.65 }}>
              Pick a format to run a check. Each report is plain-English, scored 0-100, with copy-ready fixes.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: 18 }}>
            {features.map((f, fi) => {
              const fm = MOODS[f.mood];
              return (
                <div key={f.id} className={'ci-feature ci-rise rd' + (fi % 5)} onClick={() => onNav(f.id)}
                  style={{ padding: 26, minHeight: 250, background: 'var(--surface-2)', borderRadius: 20, border: '1px solid var(--stroke-1)',
                    borderTop: `2px solid ${fm.accentFrom}55`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, background: `radial-gradient(circle, ${fm.orbB}, transparent 70%)`, opacity: 0.22, filter: 'blur(40px)' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div className="ci-feature-icon" style={{ width: 38, height: 38, borderRadius: 11, border: `1px solid ${fm.accentFrom}40`, background: `${fm.accentFrom}15`, display: 'grid', placeItems: 'center', color: fm.accentFrom, flexShrink: 0 }}>
                        <CITabIcon name={f.icon} />
                      </div>
                      <span className="ci-feature-arrow" style={{ fontSize: 16, color: fm.accentFrom }}>→</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                      {f.tags.map(t => (
                        <span key={t} style={{ fontSize: 11.5, color: 'var(--text-3)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--stroke-2)', background: 'var(--inset-soft)', whiteSpace: 'nowrap' }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 27, marginTop: 18, letterSpacing: '-0.01em', color: 'var(--text-1)' }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.6, flex: 1 }}>{f.line}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '20px 32px 90px' }}>
        <div className="glass-strong ci-rise" style={{ borderRadius: 22, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -80, bottom: -80, width: 320, height: 320, background: `radial-gradient(circle, ${m.orbB}, transparent 70%)`, opacity: 0.25, filter: 'blur(50px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Eyebrow mood={mood} glow>No jargon, just fixes</Eyebrow>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 40, margin: '10px 0 0', lineHeight: 1.08, letterSpacing: '-0.01em' }}>It talks like a smart friend, not a dashboard.</h3>
            <p style={{ fontSize: 15.5, color: 'var(--text-2)', marginTop: 16, lineHeight: 1.65 }}>
              Every score comes with a plain explanation and the exact change to make. Green means ship it. Yellow means fix the flagged lines first. Red means rework before you post.
            </p>
            <div style={{ display: 'flex', gap: 20, marginTop: 22 }}>
              {[['green','Ship it'],['yellow','Fix first'],['red','Rework']].map(([c,l]) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                  <span className={'ci-dot ' + c} /> {l}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="ci-light yellow" style={{ marginBottom: 12 }}>
              <div className="ci-light-orb" />
              <div>
                <div className="ci-light-title" style={{ fontSize: 16 }}>Needs work</div>
                <div className="ci-light-text">Fix the issues marked in red before posting.</div>
              </div>
            </div>
            <div className="ci-block" style={{ padding: 18 }}>
              <div className="ci-score-item" style={{ paddingTop: 0 }}>
                <div className="ci-score-top">
                  <span className="ci-score-name">Opening hook</span>
                  <span className="ci-score-num" style={{ color: '#F0C85A' }}>62</span>
                </div>
                <div className="ci-score-why">Your first line doesn't give the viewer a reason to stay. It starts too slow.</div>
              </div>
              <div className="ci-score-item">
                <div className="ci-score-top">
                  <span className="ci-score-name">Will they engage</span>
                  <span className="ci-score-num" style={{ color: '#F06A7E' }}>55</span>
                </div>
                <div className="ci-score-why">Missing a clear call-to-action. Viewers won't know what to do next.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.HomeView = HomeView;
window.CI_TABS = TABS;
window.CI_VIDEO = VIDEO_SRC;
