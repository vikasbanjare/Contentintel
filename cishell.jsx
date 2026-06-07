// ContentIntel — shell: TopNav, tab icons, Home (video hero + feature showcase)
// NOTE: MOODS is the global `const MOODS` declared in ui.jsx (shared across the
// classic text/babel scripts). We must NOT redeclare it here or it collides.

const VIDEO_SRC = (typeof window !== 'undefined' && window.__resources && window.__resources.heroVideo)
  || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

// Tab definitions — each has a mood chosen for its content
const TABS = [
  { id: 'script',    label: 'Script',    mood: 'navy',     icon: 'script' },
  { id: 'thumbnail', label: 'Thumbnail', mood: 'ember',    icon: 'thumb' },
  { id: 'title',     label: 'Title',     mood: 'cyan',     icon: 'title' },
  { id: 'ads',       label: 'Ads',       mood: 'violet',   icon: 'ads' },
  { id: 'studio',    label: 'Studio',    mood: 'violet',   icon: 'studio' },
  { id: 'playbook',  label: 'Playbook',  mood: 'ember',    icon: 'playbook' },
  { id: 'history',   label: 'History',   mood: 'burgundy', icon: 'history' },
];

function CITabIcon({ name }) {
  const s = { width: 15, height: 15, stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'script':  return <svg {...s} viewBox="0 0 16 16"><path d="M3 2.5h7l3 3V13a.5.5 0 01-.5.5h-9.5A.5.5 0 012.5 13V3a.5.5 0 01.5-.5z"/><path d="M10 2.5v3h3M5 8h6M5 10.5h4"/></svg>;
    case 'thumb':   return <svg {...s} viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1.5"/><circle cx="6" cy="6.5" r="1"/><path d="M2.5 11l3-3 2.5 2.5L11 7l2.5 2.5"/></svg>;
    case 'title':   return <svg {...s} viewBox="0 0 16 16"><path d="M3 4.5h10M3 8h7M3 11.5h9"/></svg>;
    case 'ads':     return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 6.5v3l8 3.5v-10l-8 3.5z"/><path d="M2.5 6.5H5v3H2.5zM12 5.5a3 3 0 010 5"/></svg>;
    case 'history': return <svg {...s} viewBox="0 0 16 16"><path d="M8 4.5V8l2.5 1.5"/><circle cx="8" cy="8" r="5.5"/></svg>;
    case 'playbook': return <svg {...s} viewBox="0 0 16 16"><path d="M3 3h7a2 2 0 012 2v8H5a2 2 0 00-2 2V3z"/><path d="M3 3a2 2 0 00-2 2v8a2 2 0 012-2"/><path d="M6 6h4M6 8.5h3"/></svg>;
    case 'studio':  return <svg {...s} viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="5" height="5" rx="1"/><rect x="8.5" y="2.5" width="5" height="5" rx="1"/><rect x="2.5" y="8.5" width="5" height="5" rx="1"/><circle cx="11" cy="11" r="2.5"/></svg>;
    case 'home':    return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 7L8 2.5 13.5 7v6a.5.5 0 01-.5.5h-3v-4h-3v4H3a.5.5 0 01-.5-.5V7z"/></svg>;
    default: return null;
  }
}
window.CITabIcon = CITabIcon;

function TopNav({ active, onNav, mood, focusMode, onToggleFocus, onOpenKey, onAdmin, hasKey, admin }) {
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

      <button className="ci-iconbtn" title="Toggle focus mode" onClick={onToggleFocus}>
        {focusMode
          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4"/></svg>
          : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 106.5 6.5z"/></svg>}
      </button>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: `linear-gradient(135deg, #6A1F35, #FF4D8D)`,
        display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12, color: '#fff',
      }}>EM</div>
    </nav>
  );
}
window.TopNav = TopNav;

// ── HOME ────────────────────────────────────────────────────────────────────
function HomeView({ onNav, onOpenKey, hasKey }) {
  const mood = 'burgundy';
  const m = MOODS[mood];

  const features = [
    { id: 'script',    label: 'Script',    icon: 'script', mood: 'navy',     line: 'Hook strength, retention, drop-off risk and a stronger rewrite — line by line.' },
    { id: 'thumbnail', label: 'Thumbnail', icon: 'thumb',  mood: 'ember',    line: "Will it earn the click? We read your image like the feed does — not how pretty it is." },
    { id: 'title',     label: 'Title',     icon: 'title',  mood: 'cyan',     line: 'Click chance, curiosity, mobile truncation, plus 10 alternative angles to steal.' },
    { id: 'ads',       label: 'Ads',       icon: 'ads',    mood: 'violet',   line: 'Meta & Google limits, scroll-stopping power, compliance flags and rewrites.' },
  ];

  const stats = [
    { v: '0–100', l: 'Plain-language scores' },
    { v: '4', l: 'Formats checked' },
    { v: 'A/B', l: 'Compare two versions' },
    { v: '<10s', l: 'Per check' },
  ];

  return (
    <div className="ci-reveal">
      {/* HERO with looping video */}
      <section className="ci-hero" style={{ minHeight: 560, display: 'flex', alignItems: 'center' }}>
        <video className="ci-hero-video" src={VIDEO_SRC} autoPlay muted loop playsInline />
        <div className="ci-hero-scrim" />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <div className="bloom-orb" style={{ width: 560, height: 560, right: '-8%', top: '-20%', background: m.orbA, opacity: 0.4, filter: 'blur(80px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1140, margin: '0 auto', padding: '0 26px', width: '100%' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: m.accentFrom, textShadow: `0 0 14px ${m.accentGlow}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.accentFrom, boxShadow: `0 0 10px ${m.accentGlow}` }} className="pulse-dot" />
              Pre-publish checker
            </div>
            <h1 className="display" style={{ fontSize: 76, margin: '16px 0 0', lineHeight: 0.92, letterSpacing: 'var(--display-tracking, -0.025em)', textTransform: 'var(--display-case, none)' }}>
              Know it'll work<br/>before you{' '}
              <span style={{ background: 'linear-gradient(135deg, #FF4D8D, #FF9CC2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>hit publish.</span>
            </h1>
            <p style={{ margin: '22px 0 0', fontSize: 16, lineHeight: 1.55, color: 'var(--text-1)', maxWidth: 520, textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
              Paste a script, drop a thumbnail, test a title or an ad. ContentIntel tells you what's working, what's not, and exactly how to fix it — in plain language, before it goes live.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 30 }}>
              <GlowButton mood={mood} size="lg" onClick={() => onNav('script')}>Check your content →</GlowButton>
              <button className="btn ghost" style={{ height: 48, padding: '0 20px', fontSize: 14, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }} onClick={() => onNav('thumbnail')}>See a sample report</button>
            </div>
            <div onClick={onOpenKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 20, cursor: 'pointer', fontSize: 12.5, color: 'var(--text-2)' }}>
              <span className={'ci-keydot ' + (hasKey ? 'on' : 'off')} />
              {hasKey
                ? <span>Running on your own Anthropic key — analyses are live.</span>
                : <span>Runs on <b>your own</b> Anthropic API key (stored only in your browser). <span style={{ color: m.accentFrom, textDecoration: 'underline' }}>Connect key</span></span>}
            </div>
          </div>
        </div>
      </section>

      {/* STATS strip */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 26px' }}>
        <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: 16, marginTop: -28, position: 'relative', zIndex: 3, overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '20px 24px', borderLeft: i ? '1px solid var(--stroke-1)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE SHOWCASE */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '64px 26px 40px', position: 'relative' }}>
        <AmbientBloom mood={mood} intensity={0.4} variant="subtle" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <Eyebrow mood={mood} glow>Four checks · one workflow</Eyebrow>
              <h2 className="display" style={{ fontSize: 40, margin: '10px 0 0' }}>Everything you ship, graded first.</h2>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 280, textAlign: 'right' }}>
              Pick a format to run a check. Each report is plain-English, scored 0–100, with copy-ready fixes.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {features.map(f => {
              const fm = MOODS[f.mood];
              return (
                <div key={f.id} className="ci-feature sheen" onClick={() => onNav(f.id)}>
                  <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, background: `radial-gradient(circle, ${fm.orbB}, transparent 70%)`, opacity: 0.22, filter: 'blur(30px)' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${fm.accentFrom}, ${fm.accentTo})`, boxShadow: `0 0 18px ${fm.accentGlow}`, display: 'grid', placeItems: 'center', color: '#07090E' }}>
                      <CITabIcon name={f.icon} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 16, fontFamily: 'var(--font-display)' }}>{f.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 7, lineHeight: 1.5, flex: 1 }}>{f.line}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                      <span>RUN CHECK</span><span style={{ fontSize: 14, color: fm.accentFrom }}>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT READS — sample teaser */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '20px 26px 90px' }}>
        <div className="glass-strong" style={{ borderRadius: 22, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -80, bottom: -80, width: 320, height: 320, background: `radial-gradient(circle, ${m.orbB}, transparent 70%)`, opacity: 0.25, filter: 'blur(50px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Eyebrow mood={mood} glow>No jargon, just fixes</Eyebrow>
            <h3 className="display" style={{ fontSize: 30, margin: '12px 0 0', lineHeight: 1.05 }}>It talks like a smart friend, not a dashboard.</h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 14, lineHeight: 1.6 }}>
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

          {/* mini sample card */}
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
