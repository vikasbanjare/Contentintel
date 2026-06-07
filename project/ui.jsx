// ContentFloh — design tokens, ambient bloom, shared UI primitives

// ─────────────────────────────────────────────────────────────────────────────
// Color moods — used as the bloom palette behind hero/key surfaces.
// Each tool has a default mood, but the user can override globally via tweaks.
// ─────────────────────────────────────────────────────────────────────────────
const MOODS = {
  burgundy: {
    label: 'Burgundy',
    orbA: '#8B1A3E',
    orbB: '#FF4D8D',
    orbC: '#3A0F1F',
    accentFrom: '#FF4D8D',
    accentTo: '#FF5FA2',
    accentGlow: 'rgba(255, 77, 141, 0.55)',
    swatch: '#FF4D8D',
  },
  navy: {
    label: 'Navy',
    orbA: '#0B2A6B',
    orbB: '#4D7CFE',
    orbC: '#0A1226',
    accentFrom: '#67C6FF',
    accentTo: '#4D7CFE',
    accentGlow: 'rgba(77, 124, 254, 0.55)',
    swatch: '#4D7CFE',
  },
  violet: {
    label: 'Violet',
    orbA: '#3D1F6A',
    orbB: '#8B5CF6',
    orbC: '#1A0F36',
    accentFrom: '#A78BFA',
    accentTo: '#7B61FF',
    accentGlow: 'rgba(139, 92, 246, 0.55)',
    swatch: '#8B5CF6',
  },
  cyan: {
    label: 'Cyan',
    orbA: '#0E5566',
    orbB: '#67C6FF',
    orbC: '#06262E',
    accentFrom: '#8FD8FF',
    accentTo: '#67C6FF',
    accentGlow: 'rgba(103, 198, 255, 0.55)',
    swatch: '#67C6FF',
  },
  lime: {
    label: 'Lime',
    orbA: '#2D4D0A',
    orbB: '#B7F96A',
    orbC: '#0E1E04',
    accentFrom: '#D9FF4A',
    accentTo: '#B7F96A',
    accentGlow: 'rgba(217, 255, 74, 0.55)',
    swatch: '#D9FF4A',
  },
  ember: {
    label: 'Ember',
    orbA: '#6A1F35',
    orbB: '#FF6B4A',
    orbC: '#2A0A12',
    accentFrom: '#FFB07A',
    accentTo: '#FF6B4A',
    accentGlow: 'rgba(255, 107, 74, 0.55)',
    swatch: '#FF6B4A',
  },
};

const TYPES = {
  grotesk: {
    label: 'Grotesk',
    display: "'Space Grotesk', system-ui, sans-serif",
    ui: "'Manrope', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
    displayCaps: false,
    displayTracking: '-0.025em',
  },
  editorial: {
    label: 'Editorial',
    display: "'Instrument Serif', Georgia, serif",
    ui: "'Manrope', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
    displayCaps: false,
    displayTracking: '-0.015em',
  },
  poster: {
    label: 'Poster',
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    ui: "'Manrope', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
    displayCaps: true,
    displayTracking: '-0.02em',
  },
};

const DENSITIES = {
  compact: { ui: 13, control: 32, gap: 12, pad: 18 },
  regular: { ui: 14, control: 36, gap: 16, pad: 24 },
  comfy:   { ui: 15, control: 40, gap: 20, pad: 28 },
};

// ─────────────────────────────────────────────────────────────────────────────
// AmbientBloom — animated radial gradient orbs behind hero areas
// ─────────────────────────────────────────────────────────────────────────────
function AmbientBloom({ mood = 'burgundy', intensity = 1, variant = 'hero' }) {
  const m = MOODS[mood] || MOODS.burgundy;
  const i = intensity;

  if (variant === 'subtle') {
    return (
      <div className="bloom" aria-hidden="true">
        <div className="bloom-orb" style={{
          width: 480, height: 480,
          left: '-10%', top: '-20%',
          background: m.orbA,
          opacity: 0.35 * i,
        }} />
        <div className="bloom-orb" style={{
          width: 360, height: 360,
          right: '-8%', bottom: '-15%',
          background: m.orbB,
          opacity: 0.22 * i,
          animationDelay: '-6s',
        }} />
      </div>
    );
  }

  // hero variant — big atmospheric bloom
  return (
    <div className="bloom" aria-hidden="true">
      <div className="bloom-orb" style={{
        width: 720, height: 720,
        left: '50%', top: '-10%',
        transform: 'translateX(-50%)',
        background: `radial-gradient(circle, ${m.orbB} 0%, ${m.orbA} 45%, transparent 75%)`,
        opacity: 0.7 * i,
        filter: 'blur(60px)',
      }} />
      <div className="bloom-orb" style={{
        width: 560, height: 560,
        right: '-10%', bottom: '-15%',
        background: m.orbA,
        opacity: 0.4 * i,
        animationDelay: '-9s',
      }} />
      <div className="bloom-orb" style={{
        width: 320, height: 320,
        left: '5%', bottom: '10%',
        background: m.orbC,
        opacity: 0.5 * i,
        mixBlendMode: 'normal',
        animationDelay: '-3s',
      }} />
      <div className="bloom-grain" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — left navigation rail
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'script', label: 'Script', icon: 'script', count: 4 },
  { id: 'variations', label: 'Variations', icon: 'variations' },
  { id: 'abtest', label: 'A/B Tests', icon: 'ab' },
  { id: 'thumbs', label: 'Thumbnails', icon: 'thumbs' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'analytics', label: 'Results', icon: 'chart' },
];

const PROJECTS = [
  { id: 'p1', name: 'Atlas Sneaker Drop', color: '#FF4D8D', count: 18 },
  { id: 'p2', name: 'Q4 Pricing Push', color: '#4D7CFE', count: 12 },
  { id: 'p3', name: 'Newsletter Hooks', color: '#8B5CF6', count: 7 },
  { id: 'p4', name: 'iOS App Promo', color: '#D9FF4A', count: 4 },
];

function NavIcon({ name }) {
  const s = { width: 16, height: 16, stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 7L8 2.5 13.5 7v6a.5.5 0 01-.5.5h-3v-4h-3v4H3a.5.5 0 01-.5-.5V7z"/></svg>;
    case 'script': return <svg {...s} viewBox="0 0 16 16"><path d="M3 2.5h7l3 3V13a.5.5 0 01-.5.5h-9.5A.5.5 0 012.5 13V3a.5.5 0 01.5-.5z"/><path d="M10 2.5v3h3M5 8h6M5 10.5h4"/></svg>;
    case 'variations': return <svg {...s} viewBox="0 0 16 16"><circle cx="5" cy="5" r="2.5"/><circle cx="11" cy="5" r="2.5"/><circle cx="8" cy="11" r="2.5"/></svg>;
    case 'ab': return <svg {...s} viewBox="0 0 16 16"><rect x="2.5" y="3" width="4.5" height="10" rx="1"/><rect x="9" y="3" width="4.5" height="10" rx="1"/><path d="M4.75 7v2M11.25 6v4"/></svg>;
    case 'thumbs': return <svg {...s} viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1.5"/><circle cx="6" cy="6.5" r="1"/><path d="M2.5 11l3-3 2.5 2.5L11 7l2.5 2.5"/></svg>;
    case 'folder': return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 4.5a1 1 0 011-1H6l1.5 1.5h5a1 1 0 011 1V12a1 1 0 01-1 1h-9a1 1 0 01-1-1V4.5z"/></svg>;
    case 'chart': return <svg {...s} viewBox="0 0 16 16"><path d="M2.5 13V3M2.5 13h11"/><path d="M5 11V8M8 11V5.5M11 11V7"/></svg>;
    default: return null;
  }
}

function Sidebar({ active = 'home', mood = 'burgundy', collapsed = false }) {
  const m = MOODS[mood];
  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      flexShrink: 0,
      height: '100%',
      borderRight: '1px solid var(--stroke-1)',
      background: 'rgba(7, 9, 14, 0.72)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 12px',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 18px' }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`,
          boxShadow: `0 0 16px ${m.accentGlow}`,
          display: 'grid', placeItems: 'center',
          fontFamily: "var(--font-display, 'Space Grotesk')",
          fontWeight: 800, fontSize: 14, color: '#0b0f14',
        }}>⌁</div>
        {!collapsed && (
          <div style={{ fontFamily: "var(--font-display, 'Space Grotesk')", fontWeight: 700, letterSpacing: '-0.01em', fontSize: 15 }}>
            ContentFloh
          </div>
        )}
      </div>

      {/* New project */}
      <button className="btn primary" style={{
        height: 34, width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
        marginBottom: 14, fontSize: 13,
        background: 'rgba(255,255,255,0.92)',
      }}>
        <span style={{ fontSize: 16, lineHeight: 1, fontWeight: 400 }}>+</span>
        {!collapsed && <span>New project</span>}
      </button>

      {/* Search */}
      {!collapsed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', marginBottom: 18,
          background: 'var(--surface-1)',
          border: '1px solid var(--stroke-1)',
          borderRadius: 8,
          color: 'var(--text-4)',
          fontSize: 12.5,
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5"/><path d="M13.5 13.5l-3-3"/>
          </svg>
          <span style={{ flex: 1 }}>Search…</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.7 }}>⌘K</span>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!collapsed && <div className="eyebrow dim" style={{ padding: '2px 8px 6px' }}>Tools</div>}
        {NAV.map(item => (
          <div key={item.id} className={'nav-item' + (active === item.id ? ' is-active' : '')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '8px' : '7px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8,
            color: active === item.id ? 'var(--text-1)' : 'var(--text-3)',
            background: active === item.id ? 'var(--surface-2)' : 'transparent',
            border: active === item.id ? '1px solid var(--stroke-2)' : '1px solid transparent',
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.15s',
          }}>
            {active === item.id && (
              <div style={{
                position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 16, borderRadius: 2,
                background: `linear-gradient(180deg, ${m.accentFrom}, ${m.accentTo})`,
                boxShadow: `0 0 10px ${m.accentGlow}`,
              }} />
            )}
            <NavIcon name={item.icon} />
            {!collapsed && (
              <>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count && <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{item.count}</span>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Projects */}
      {!collapsed && (
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="eyebrow dim" style={{ padding: '2px 8px 6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Recent</span>
            <span style={{ opacity: 0.6 }}>+</span>
          </div>
          {PROJECTS.map(p => (
            <div key={p.id} className="nav-item" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 8,
              fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: p.color, boxShadow: `0 0 8px ${p.color}80`,
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{p.count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Footer / user */}
      {!collapsed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          borderRadius: 10,
          background: 'var(--surface-1)',
          border: '1px solid var(--stroke-1)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: `linear-gradient(135deg, #6A1F35, #FF4D8D)`,
            display: 'grid', placeItems: 'center',
            fontWeight: 600, fontSize: 11,
          }}>EM</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>Eli Marek</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>Pro · 24,800 cr</div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar — breadcrumb + workspace switch + actions
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ crumbs = [], right = null, mood = 'burgundy' }) {
  const m = MOODS[mood];
  return (
    <header style={{
      height: 52,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 22px',
      borderBottom: '1px solid var(--stroke-1)',
      background: 'rgba(7, 9, 14, 0.4)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--text-5)' }}>/</span>}
            <span style={{ color: i === crumbs.length - 1 ? 'var(--text-1)' : 'var(--text-3)', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Status pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#B7F96A', boxShadow: '0 0 8px rgba(183,249,106,0.6)' }} className="pulse-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Live</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'var(--stroke-1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>24,800 cr</span>
      </div>

      {right}

      <button className="btn ghost" style={{ height: 30, padding: '0 12px', fontSize: 12.5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.accentFrom, boxShadow: `0 0 8px ${m.accentGlow}` }} />
        Share
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic helpers
// ─────────────────────────────────────────────────────────────────────────────
function Eyebrow({ children, mood, glow = false }) {
  const m = MOODS[mood || 'burgundy'];
  return (
    <div className="eyebrow" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      color: glow ? m.accentFrom : undefined,
      textShadow: glow ? `0 0 12px ${m.accentGlow}` : undefined,
    }}>
      {glow && <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.accentFrom, boxShadow: `0 0 8px ${m.accentGlow}` }} />}
      {children}
    </div>
  );
}

function GlowButton({ mood = 'burgundy', children, size = 'md', style = {}, onClick, ...rest }) {
  const m = MOODS[mood];
  const h = size === 'lg' ? 48 : size === 'sm' ? 30 : 38;
  const pad = size === 'lg' ? '0 22px' : size === 'sm' ? '0 12px' : '0 18px';
  const fs = size === 'lg' ? 14 : size === 'sm' ? 12 : 13;
  return (
    <button
      onClick={onClick}
      className="sheen"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: pad, height: h,
        borderRadius: h / 2,
        background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`,
        color: '#0b0710',
        border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 600, fontSize: fs,
        letterSpacing: '0.01em',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.18) inset, 0 8px 24px ${m.accentGlow}, 0 0 40px ${m.accentGlow}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      {...rest}
    >
      {children}
    </button>
  );
}

function Chip({ children, active = false, onClick, icon = null }) {
  return (
    <button onClick={onClick} className={'pill' + (active ? ' active' : '')} style={{
      height: 28,
      fontSize: 12,
    }}>
      {icon}
      {children}
    </button>
  );
}

function Card({ children, style = {}, className = '', mood, glow = false }) {
  const m = mood ? MOODS[mood] : null;
  return (
    <div className={'glass lift ' + className} style={{
      borderRadius: 18,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      ...(glow && m ? { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 32px ${m.accentGlow}, 0 1px 2px rgba(0,0,0,0.4)` } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

// Score badge — circular percent with gradient ring
function ScoreRing({ score = 86, size = 44, mood = 'burgundy' }) {
  const m = MOODS[mood];
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const gid = `score-grad-${Math.random().toString(36).slice(2,7)}`;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={m.accentFrom}/>
            <stop offset="100%" stopColor={m.accentTo}/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: `drop-shadow(0 0 6px ${m.accentGlow})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: 'var(--text-1)',
      }}>{score}</div>
    </div>
  );
}

// Workflow step indicator
function StepDots({ step = 1, total = 4, mood = 'burgundy' }) {
  const m = MOODS[mood];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === step ? 18 : 6,
          height: 6,
          borderRadius: 3,
          background: i + 1 <= step ? `linear-gradient(90deg, ${m.accentFrom}, ${m.accentTo})` : 'var(--surface-2)',
          boxShadow: i + 1 === step ? `0 0 8px ${m.accentGlow}` : 'none',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  MOODS, TYPES, DENSITIES,
  AmbientBloom, Sidebar, Topbar, Eyebrow, GlowButton, Chip, Card, ScoreRing, StepDots,
  NavIcon, NAV, PROJECTS,
});

