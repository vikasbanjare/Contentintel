// ContentFloh — Screens (part 2): Thumbnails, Projects, Analytics, Asset Detail, Onboarding, Generate flow

const { MOODS: M2, AmbientBloom: AB2, Sidebar: SB2, Topbar: TB2, Eyebrow: EY2,
  GlowButton: GB2, Chip: CH2, Card: CD2, ScoreRing: SR2, StepDots: SD2 } = window;

// ─────────────────────────────────────────────────────────────────────────────
// 7. THUMBNAIL LAB — visual grid with selection
// ─────────────────────────────────────────────────────────────────────────────
function Thumbnail({ idx, layout, mood, label, sub, picked, onPick, ratio = '4/5' }) {
  const m = M2[mood];
  // Each layout draws a different fake thumbnail composition with bold typography
  return (
    <div onClick={onPick} style={{
      position: 'relative',
      aspectRatio: ratio,
      borderRadius: 14,
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid ' + (picked ? 'rgba(255,255,255,0.4)' : 'var(--stroke-1)'),
      boxShadow: picked ? `0 0 0 2px ${m.accentFrom}, 0 12px 32px ${m.accentGlow}` : '0 4px 16px rgba(0,0,0,0.3)',
      transform: picked ? 'translateY(-3px)' : 'none',
      transition: 'all 0.25s cubic-bezier(0.2,0.7,0.3,1)',
    }}>
      {/* base bg per layout */}
      <div style={{ position: 'absolute', inset: 0,
        background: layout === 'photo'
          ? `radial-gradient(circle at 30% 30%, ${m.orbB}, ${m.orbA} 60%, #1a0710 100%)`
          : layout === 'text'
          ? `linear-gradient(180deg, ${m.orbC} 0%, #07090E 100%)`
          : layout === 'split'
          ? `linear-gradient(135deg, ${m.orbA} 0%, ${m.orbA} 50%, #07090E 50%, #07090E 100%)`
          : `radial-gradient(ellipse at 50% 110%, ${m.orbB} 0%, ${m.orbC} 60%, #07090E 100%)`,
      }} />

      {/* layout content */}
      {layout === 'photo' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 60%, rgba(0,0,0,0.5), transparent 60%)' }} />
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 28, lineHeight: 0.95,
              textTransform: 'uppercase', letterSpacing: '-0.02em',
              color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 6, color: m.accentFrom, letterSpacing: '0.1em' }}>{sub}</div>
          </div>
        </>
      )}
      {layout === 'text' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 22, lineHeight: 1.05,
            color: 'white',
            textTransform: 'uppercase', letterSpacing: '-0.02em',
          }}>{label}</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 22, lineHeight: 1.05,
            background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            color: 'transparent',
            textTransform: 'uppercase', letterSpacing: '-0.02em',
          }}>{sub}</div>
        </div>
      )}
      {layout === 'split' && (
        <>
          <div style={{ position: 'absolute', left: 12, top: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>NEW · LIMITED</div>
          <div style={{ position: 'absolute', left: 14, right: 14, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 0.95,
            textTransform: 'uppercase', color: 'white',
          }}>{label}</div>
          <div style={{ position: 'absolute', right: 14, bottom: 14,
            padding: '6px 10px', borderRadius: 999,
            background: 'white', color: '#07090E',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
          }}>{sub}</div>
        </>
      )}
      {layout === 'glow' && (
        <>
          <div style={{
            position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)',
            width: '60%', aspectRatio: '1',
            background: `radial-gradient(circle, ${m.accentFrom}, transparent 70%)`,
            filter: 'blur(20px)', opacity: 0.7,
          }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '40%', transform: 'translateY(-50%)', textAlign: 'center', padding: '0 14px' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30,
              color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9,
            }}>{label}</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16, textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, color: m.accentFrom, letterSpacing: '0.18em',
          }}>{sub}</div>
        </>
      )}

      {/* corner pick indicator */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        width: 22, height: 22, borderRadius: '50%',
        background: picked ? `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` : 'rgba(0,0,0,0.4)',
        border: '1.5px solid ' + (picked ? 'transparent' : 'rgba(255,255,255,0.5)'),
        display: 'grid', placeItems: 'center',
        color: '#0b0710', fontSize: 13, fontWeight: 800,
        backdropFilter: 'blur(8px)',
        boxShadow: picked ? `0 0 12px ${m.accentGlow}` : 'none',
        transition: 'all 0.2s',
      }}>{picked ? '✓' : ''}</div>

      {/* corner score */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        padding: '3px 7px', borderRadius: 6,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'white',
        letterSpacing: '0.04em',
      }}>{['83','91','76','88','94','79'][idx % 6]}%</div>
    </div>
  );
}

function ThumbnailLabScreen() {
  const mood = 'ember';
  const m = M2[mood];
  const thumbs = [
    { layout: 'glow',  label: 'Game Over', sub: 'For Your Old Trainer', mood: 'ember' },
    { layout: 'photo', label: 'PR Killer', sub: '— ATLAS MACH', mood: 'ember' },
    { layout: 'text',  label: '$90 Shoe.', sub: '3 Min PR.', mood: 'burgundy' },
    { layout: 'split', label: 'Atlas Mach\nDrops Friday', sub: 'PREORDER', mood: 'lime' },
    { layout: 'photo', label: 'Half-Marathon Cheat Code', sub: 'CONFIRMED', mood: 'violet' },
    { layout: 'text',  label: 'Run.', sub: 'Stupid Fast.', mood: 'cyan' },
  ];
  const [picked, setPicked] = React.useState(new Set([1]));
  function toggle(i) {
    setPicked(p => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="thumbs" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Workspace', 'Atlas Sneaker Drop', 'Thumbnails']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AB2 mood={mood} intensity={0.6} variant="subtle" />

          <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <EY2 mood={mood} glow>Thumbnail lab · 6 directions</EY2>
                <h2 className="display" style={{ fontSize: 38, margin: '6px 0 0' }}>Pick the cover that earns the click.</h2>
                <p style={{ color: 'var(--text-3)', fontSize: 13.5, marginTop: 8 }}>
                  Each direction explores a different emotional tone and visual hierarchy. Tap to mark winners — we'll iterate on those.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CH2>Filters</CH2>
                <CH2>Aspect: 4:5</CH2>
                <CH2>↻ Regen unselected</CH2>
                <GB2 mood={mood} size="sm">Export {picked.size} →</GB2>
              </div>
            </div>

            <div className="glass" style={{ marginTop: 22, padding: 12, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span className="eyebrow">Direction</span>
              {['All', 'Bold typography', 'Photo-led', 'Gradient glow', 'Split layout'].map((d, i) => (
                <CH2 key={d} active={i === 0}>{d}</CH2>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{picked.size} picked / 6 total</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
              {thumbs.map((t, i) => (
                <div key={i} className="lift">
                  <Thumbnail idx={i} {...t} picked={picked.has(i)} onPick={() => toggle(i)} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '0 2px' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{['Cinematic urgency', 'Confident proof', 'Bold typography', 'Promotional split', 'Editorial portrait', 'Minimal command'][i]}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{['Glow', 'Photo', 'Type', 'Split', 'Photo', 'Type'][i]} · v{i+1}</div>
                    </div>
                    <button style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--stroke-1)',
                      color: 'var(--text-2)', cursor: 'pointer',
                      fontSize: 12,
                    }}>↻</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ThumbnailLabScreen = ThumbnailLabScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 8. PROJECT WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
function ProjectsScreen() {
  const mood = 'cyan';
  const m = M2[mood];
  const projects = [
    { id: 'p1', name: 'Atlas Sneaker Drop', color: '#FF4D8D', stage: 'Testing', items: 18, performance: 84, tags: ['Performance', 'Paid social'], lastEdit: '2h ago' },
    { id: 'p2', name: 'Q4 Pricing Push', color: '#4D7CFE', stage: 'Drafting', items: 12, performance: 71, tags: ['Email', 'Lifecycle'], lastEdit: '5h ago' },
    { id: 'p3', name: 'Newsletter Hooks', color: '#8B5CF6', stage: 'Live', items: 7, performance: 92, tags: ['Newsletter', 'Top of funnel'], lastEdit: 'Yesterday' },
    { id: 'p4', name: 'iOS App Promo', color: '#D9FF4A', stage: 'Reviewing', items: 4, performance: 68, tags: ['App store', 'Video'], lastEdit: '2d ago' },
    { id: 'p5', name: 'Black Friday Lockup', color: '#FFB07A', stage: 'Idea', items: 0, performance: null, tags: ['Promo'], lastEdit: 'just now' },
  ];

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="projects" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Workspace', 'Projects']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AB2 mood={mood} intensity={0.45} variant="subtle" />

          <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <EY2 mood={mood} glow>Projects · 5 active</EY2>
                <h2 className="display" style={{ fontSize: 38, margin: '6px 0 0' }}>Campaigns, in one ledger.</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CH2 active>Grid</CH2>
                <CH2>Kanban</CH2>
                <CH2>Table</CH2>
                <div style={{ width: 1, height: 22, background: 'var(--stroke-1)', margin: '0 4px' }} />
                <CH2>Sort: Recent</CH2>
                <GB2 mood={mood} size="sm">+ New project</GB2>
              </div>
            </div>

            {/* Big featured card */}
            <div className="glass-strong" style={{
              marginTop: 22, padding: 24, borderRadius: 18,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280,
                background: `radial-gradient(circle, ${m.orbB}, transparent 70%)`, opacity: 0.4, filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#FF4D8D', boxShadow: '0 0 12px #FF4D8D88' }} />
                  <EY2>Active focus</EY2>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 10 }}>
                  <h3 className="display" style={{ fontSize: 32, margin: 0 }}>Atlas Sneaker Drop</h3>
                  <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(255,77,141,0.15)', color: '#FF9CC2', fontSize: 11, fontFamily: 'var(--font-mono)' }}>TESTING</span>
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
                  Launch sprint for the Mach trainer. 18 assets in motion, 4 hooks in live test. Auto-promote on Friday.
                </p>
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <CH2>Performance</CH2>
                  <CH2>Paid social</CH2>
                  <CH2>Atlas brand</CH2>
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[
                  { l: 'Scripts', v: 6, sub: '2 live, 4 draft' },
                  { l: 'A/B tests', v: 3, sub: '1 winning' },
                  { l: 'Thumbnails', v: 9, sub: '4 picked' },
                  { l: 'Impressions', v: '184K', sub: '+12% wow' },
                  { l: 'CTR avg', v: '3.9%', sub: 'best: 4.6%' },
                  { l: 'Health', v: 84, sub: 'on track', ring: true },
                ].map((s, i) => (
                  <div key={i} className="glass" style={{ padding: 14, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.l}</div>
                    {s.ring
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}><SR2 score={84} size={32} mood={mood}/><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.sub}</span></div>
                      : <>
                          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.sub}</div>
                        </>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Project grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
              {projects.slice(1).map(p => (
                <CD2 key={p.id} className="sheen" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', minHeight: 168 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9,
                      background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)`,
                      boxShadow: `0 0 14px ${p.color}80`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{p.stage} · {p.lastEdit}</div>
                    </div>
                    <span style={{ color: 'var(--text-4)' }}>⋯</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.tags.map(t => <span key={t} style={{ fontSize: 11, color: 'var(--text-3)', padding: '3px 7px', borderRadius: 5, background: 'var(--surface-1)' }}>{t}</span>)}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: 'var(--text-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{p.items} assets</span>
                    {p.performance !== null && <>
                      <span>·</span>
                      <span style={{ color: p.performance >= 80 ? '#B7F96A' : 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.performance} score</span>
                    </>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </CD2>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProjectsScreen = ProjectsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 9. ANALYTICS / RESULTS
// ─────────────────────────────────────────────────────────────────────────────
function SparkLine({ data, color = '#B7F96A', glow = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 140, h = 36;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : {}} />
      <circle cx={pts.split(' ').slice(-1)[0].split(',')[0]} cy={pts.split(' ').slice(-1)[0].split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
}

function AnalyticsScreen() {
  const mood = 'lime';
  const m = M2[mood];

  const stats = [
    { l: 'Assets generated', v: '1,284', delta: '+24%', spark: [40,45,50,48,62,70,80,85,90,95,110,128], color: '#D9FF4A' },
    { l: 'Avg hook score', v: '82', delta: '+6pt', spark: [62,65,70,68,72,75,78,76,80,82,81,82], color: '#67C6FF' },
    { l: 'Best CTR', v: '4.6%', delta: '+0.9pt', spark: [2.1,2.4,2.8,3.0,3.3,3.5,3.7,3.9,4.0,4.2,4.5,4.6], color: '#FF4D8D' },
    { l: 'Time to ship', v: '14m', delta: '−38%', spark: [42,40,36,30,28,25,22,20,18,16,15,14], color: '#A78BFA' },
  ];

  const top = [
    { rank: 1, name: '"$90 shoe. Half-marathon Sunday."', proj: 'Atlas Sneaker', ctr: '4.6%', cpc: '$0.71', score: 94 },
    { rank: 2, name: '"PR killer. Confirmed."',          proj: 'Atlas Sneaker', ctr: '4.2%', cpc: '$0.81', score: 91 },
    { rank: 3, name: '"Don\'t open this if you hate Mondays."', proj: 'Newsletter Hooks', ctr: '3.9%', cpc: '$0.66', score: 89 },
    { rank: 4, name: '"Your $200 trainer is a scam."',   proj: 'Atlas Sneaker', ctr: '3.7%', cpc: '$0.94', score: 84 },
    { rank: 5, name: '"Black Friday but for grown-ups"',  proj: 'Q4 Pricing Push', ctr: '3.4%', cpc: '$1.02', score: 81 },
  ];

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="analytics" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Workspace', 'Results']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AB2 mood={mood} intensity={0.35} variant="subtle" />

          <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <EY2 mood={mood} glow>Results · last 30 days</EY2>
                <h2 className="display" style={{ fontSize: 38, margin: '6px 0 0' }}>What's actually working.</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CH2>Range: 30d</CH2>
                <CH2>All projects</CH2>
                <CH2>↗ Export report</CH2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 22 }}>
              {stats.map((s, i) => (
                <CD2 key={i} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.l}</div>
                    <div style={{ fontSize: 11, color: s.delta.startsWith('+') || s.delta.startsWith('−') && s.l === 'Time to ship' ? '#B7F96A' : '#FF9CC2', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.v}</div>
                  <SparkLine data={s.spark} color={s.color} />
                </CD2>
              ))}
            </div>

            {/* Mid section: leaderboard + insight */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14 }}>
              <CD2 style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <EY2>Top performers · this period</EY2>
                  <CH2>Filter</CH2>
                </div>
                <div>
                  {top.map((row, i) => (
                    <div key={row.rank} style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 140px 64px 64px 44px',
                      alignItems: 'center', gap: 14,
                      padding: '12px 18px',
                      borderBottom: i < top.length - 1 ? '1px solid var(--stroke-1)' : 'none',
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: row.rank === 1 ? m.accentFrom : 'var(--text-3)' }}>{row.rank.toString().padStart(2, '0')}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{row.proj}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>{row.ctr}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{row.cpc}</div>
                      <SR2 score={row.score} size={28} mood={mood} />
                    </div>
                  ))}
                </div>
              </CD2>

              <CD2 mood={mood} glow style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#0b0710', fontWeight: 700 }}>✦</div>
                  <EY2 mood={mood} glow>AI insight</EY2>
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 500 }}>
                  Specificity is your CTR multiplier. Hooks with a concrete number or time outperform vague ones by <span style={{ color: m.accentFrom, fontWeight: 700, fontFamily: 'var(--font-display)' }}>+38%</span> this period.
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Try regenerating the bottom 5 hooks with a "lead with a number" constraint. Suggested for Q4 Pricing.
                </div>
                <GB2 mood={mood} size="sm" style={{ alignSelf: 'flex-start' }}>Apply to 5 hooks →</GB2>
              </CD2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AnalyticsScreen = AnalyticsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 10. ASSET DETAIL / EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function AssetDetailScreen() {
  const mood = 'violet';
  const m = M2[mood];
  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="script" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Workspace', 'Atlas Sneaker', 'Asset · "$90 shoe."']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px' }}>
          <AB2 mood={mood} intensity={0.35} variant="subtle" />

          {/* Main */}
          <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <button className="btn ghost" style={{ height: 28, padding: '0 10px', fontSize: 12 }}>← Back</button>
              <span style={{ color: 'var(--text-4)' }}>·</span>
              <EY2>Script · 30s UGC · v3</EY2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B7F96A' }} className="pulse-dot" />
                AUTOSAVED · 2s
              </div>
            </div>

            <h2 className="display" style={{ fontSize: 42, margin: '4px 0 0', maxWidth: 720, lineHeight: 1.0 }}>
              "$90 shoe. Half-marathon Sunday. Three minutes off my PR."
            </h2>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <CH2 active>Confident</CH2>
              <CH2>30s</CH2>
              <CH2>UGC</CH2>
              <CH2>Atlas brand voice</CH2>
            </div>

            {/* Asset preview */}
            <div className="glass-strong" style={{
              marginTop: 22, borderRadius: 18, padding: 24,
              display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* fake video frame */}
              <div style={{
                aspectRatio: '4/5',
                borderRadius: 14,
                background: `radial-gradient(circle at 30% 30%, ${m.orbB}, ${m.orbA} 60%, #1a0710 100%)`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4), transparent 70%)' }} />
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 20,
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 0.95,
                  textTransform: 'uppercase', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                  $90 SHOE.<br/>3-MIN<br/>PR.
                </div>
                <div style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>00:00 / 0:30</div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center',
                  color: '#0b0710', fontSize: 18,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>▶</div>
              </div>

              {/* Script breakdown */}
              <div>
                <EY2 mood={mood} glow>Beat sheet</EY2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {[
                    { t: '0:00', tag: 'HOOK', body: '"$90 shoe. Half-marathon Sunday. Three minutes off my PR."' },
                    { t: '0:04', tag: 'CONTEXT', body: 'I tested fourteen trainers this year. This one ended the search.' },
                    { t: '0:11', tag: 'PROOF', body: 'Stack of a max-cushion. Weight of a racer. Atlas Mach.' },
                    { t: '0:20', tag: 'REVEAL', body: 'No knee pain. No calf pain. Just stupid grin energy.' },
                    { t: '0:26', tag: 'CTA', body: 'Link in bio. Sizes are bleeding.' },
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 80px 1fr', gap: 12, alignItems: 'baseline', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--stroke-1)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: m.accentFrom }}>{b.t}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>{b.tag}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.45 }}>{b.body}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* version history */}
            <div className="glass" style={{ marginTop: 14, padding: 14, borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <EY2>Version history · 4 drafts</EY2>
                <CH2>Compare ↗</CH2>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    minWidth: 160, padding: 12, borderRadius: 10,
                    background: i === 3 ? `linear-gradient(135deg, ${m.orbC}, var(--surface-2))` : 'var(--surface-1)',
                    border: '1px solid ' + (i === 3 ? `rgba(167,139,250,0.4)` : 'var(--stroke-1)'),
                    boxShadow: i === 3 ? `0 0 16px ${m.accentGlow}` : 'none',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>v0{i} · {['mon 9:14','tue 11:02','wed 4:33','thu 9:08'][i-1]}</div>
                    <div style={{ fontSize: 12.5, marginTop: 6, color: i === 3 ? 'var(--text-1)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: i === 3 ? 600 : 400 }}>
                      {['"Drop your old shoe."','"Atlas Mach broke me."','"$90 trainer beat the $200."','"$90 shoe. Half-marathon Sunday."'][i-1]}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: i === 3 ? m.accentFrom : 'var(--text-4)' }}>
                      score {[71, 76, 82, 94][i-1]} {i === 3 && '· CURRENT'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side rail */}
          <div style={{ borderLeft: '1px solid var(--stroke-1)', padding: 22, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18,
            background: 'rgba(7,9,14,0.4)', backdropFilter: 'blur(12px)' }}>
            <div>
              <EY2 mood={mood} glow>Scores</EY2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {[
                  { l: 'Hook strength', v: 94, c: '#A78BFA' },
                  { l: 'Voice match', v: 91, c: '#B7F96A' },
                  { l: 'Predicted CTR', v: 88, c: '#67C6FF' },
                  { l: 'Clarity', v: 82, c: '#FF9CC2' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>{s.l}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{s.v}</span>
                    </div>
                    <div className="score-bar" style={{ '--accent-from': s.c, '--accent-to': s.c, '--accent-glow': s.c+'80' }}>
                      <div className="score-bar-fill" style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 18 }}>
              <EY2>Next actions</EY2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                <button className="btn ghost" style={{ width: '100%', justifyContent: 'flex-start', height: 36 }}>↻ Regenerate hook only</button>
                <button className="btn ghost" style={{ width: '100%', justifyContent: 'flex-start', height: 36 }}>⇆ Send to A/B test</button>
                <button className="btn ghost" style={{ width: '100%', justifyContent: 'flex-start', height: 36 }}>◫ Generate thumbnails</button>
                <button className="btn ghost" style={{ width: '100%', justifyContent: 'flex-start', height: 36 }}>⌗ Translate (8)</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 18 }}>
              <EY2>Export</EY2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                {['Meta Ads', 'TikTok', 'YT Shorts', 'PDF brief'].map(x => (
                  <button key={x} style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--surface-1)', border: '1px solid var(--stroke-1)',
                    color: 'var(--text-1)', fontFamily: 'inherit', fontSize: 12,
                    cursor: 'pointer', textAlign: 'left',
                  }}>{x}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <GB2 mood={mood} size="md" style={{ width: '100%', justifyContent: 'center' }}>
              Promote to live ↗
            </GB2>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AssetDetailScreen = AssetDetailScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 11. ONBOARDING — first prompt, empty state with brief builder
// ─────────────────────────────────────────────────────────────────────────────
function OnboardingScreen() {
  const mood = 'cyan';
  const m = M2[mood];
  const [step, setStep] = React.useState(2);
  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="home" mood={mood} collapsed />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Welcome', 'New project']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto', display: 'grid', placeItems: 'center', padding: '40px' }}>
          <AB2 mood={mood} intensity={0.7} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <SD2 step={step} total={4} mood={mood} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>STEP {step} OF 4</span>
            </div>

            <EY2 mood={mood} glow>Tell us what you're shipping</EY2>
            <h2 className="display" style={{ fontSize: 56, margin: '10px 0 0', lineHeight: 0.95 }}>
              What are we<br/>
              <span style={{ background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                making today?
              </span>
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 14, maxWidth: 460 }}>
              Sketch the campaign in plain language. Be specific about the product, audience, and angle if you have one.
            </p>

            <div className="glass-strong" style={{
              marginTop: 30, padding: 18, borderRadius: 20,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.4), 0 0 80px ${m.accentGlow}`,
            }}>
              <textarea
                defaultValue="Launching the Atlas Mach trainer next Friday. Targeting runners 25-40 who've been let down by max-cushion brands. Angle: a $90 shoe that beat their $200 trainer in a real half-marathon."
                style={{
                  width: '100%', minHeight: 120,
                  padding: 8, border: 'none', outline: 'none', resize: 'none',
                  background: 'transparent', color: 'var(--text-1)',
                  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.55,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <CH2 icon="↗">Import from URL</CH2>
                <CH2 icon="◐">Upload brand kit</CH2>
                <CH2 icon="⌗">Reuse past project</CH2>
                <div style={{ flex: 1 }} />
                <GB2 mood={mood} size="md">Continue →</GB2>
              </div>
            </div>

            {/* Suggested starts */}
            <div style={{ marginTop: 30 }}>
              <EY2>Or start from a template</EY2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
                {[
                  { t: 'Product launch sprint', s: 'Hook · A/B · 6 thumbnails', icon: '⚡', mood: 'navy' },
                  { t: 'Newsletter hook test',  s: 'Subject lines + preview text', icon: '✉', mood: 'lime' },
                  { t: 'Promo countdown',       s: '7-day cadence, 14 variants', icon: '◔', mood: 'burgundy' },
                ].map((c, i) => {
                  const cm = M2[c.mood];
                  return (
                    <CD2 key={i} className="sheen" style={{ padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${cm.accentFrom}, ${cm.accentTo})`, display: 'grid', placeItems: 'center', color: '#0b0710', fontWeight: 700, boxShadow: `0 0 12px ${cm.accentGlow}` }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.t}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{c.s}</div>
                      </div>
                    </CD2>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.OnboardingScreen = OnboardingScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 12. COMPARE / WINNER PICKER — full-bleed side-by-side cinematic comparison
// ─────────────────────────────────────────────────────────────────────────────
function CompareScreen() {
  const mood = 'violet';
  const m = M2[mood];
  const [pick, setPick] = React.useState(null);
  const lanes = [
    { id: 'A', mood: 'burgundy', label: 'Cinematic urgency', headline: "$90 SHOE.\n3-MIN PR.", score: 94, ctr: '4.6%', cpc: '$0.71', tags: ['Glow', 'Vertical', 'Type-first'] },
    { id: 'B', mood: 'navy',     label: 'Confident proof',    headline: "ATLAS MACH\nCONFIRMED",  score: 88, ctr: '4.0%', cpc: '$0.83', tags: ['Photo', 'Center', 'Editorial'] },
    { id: 'C', mood: 'lime',     label: 'Bold lockup',        headline: "RUN.\nSTUPID FAST.",     score: 81, ctr: '3.7%', cpc: '$0.94', tags: ['Type', 'High contrast', 'Minimal'] },
  ];

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <SB2 active="abtest" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TB2 mood={mood} crumbs={['Workspace', 'Atlas Sneaker', 'Compare · 3 finalists']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AB2 mood={mood} intensity={0.45} variant="subtle" />

          <div style={{ position: 'relative', zIndex: 1, padding: '24px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <EY2 mood={mood} glow>Compare · pick a winner</EY2>
                <h2 className="display" style={{ fontSize: 36, margin: '6px 0 0' }}>Three finalists. One ships.</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CH2>Side-by-side</CH2>
                <CH2 active>Cinematic</CH2>
                <CH2>Diff view</CH2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 22 }}>
              {lanes.map(l => {
                const lm = M2[l.mood];
                const isPick = pick === l.id;
                return (
                  <div key={l.id} className="lift" style={{
                    borderRadius: 18, overflow: 'hidden', position: 'relative',
                    border: '1px solid ' + (isPick ? 'rgba(167,139,250,0.5)' : 'var(--stroke-2)'),
                    boxShadow: isPick ? `0 0 0 1px ${m.accentFrom}, 0 20px 60px ${m.accentGlow}` : '0 8px 24px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s',
                  }}>
                    {/* Thumbnail header */}
                    <div style={{
                      aspectRatio: '4/3',
                      background: `radial-gradient(circle at 50% 70%, ${lm.orbB}, ${lm.orbA} 50%, #07090E 100%)`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ position: 'absolute', inset: 0, padding: 26, display: 'grid', placeItems: 'center' }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800,
                          fontSize: 36, lineHeight: 0.92, color: 'white',
                          textTransform: 'uppercase', letterSpacing: '-0.02em',
                          textAlign: 'center', whiteSpace: 'pre-line',
                          textShadow: '0 2px 18px rgba(0,0,0,0.6)',
                        }}>{l.headline}</div>
                      </div>
                      <div style={{ position: 'absolute', top: 12, left: 12,
                        width: 26, height: 26, borderRadius: 7,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                        display: 'grid', placeItems: 'center',
                        color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                      }}>{l.id}</div>
                      <div style={{ position: 'absolute', top: 12, right: 12,
                        padding: '4px 9px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'white', letterSpacing: '0.05em',
                      }}>{l.score}%</div>
                    </div>

                    {/* Stats body */}
                    <div className="glass-strong" style={{ padding: 18, borderRadius: 0, borderTop: 'none', border: 'none' }}>
                      <EY2>{l.label}</EY2>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {l.tags.map(t => <span key={t} style={{ fontSize: 10.5, color: 'var(--text-3)', padding: '3px 7px', borderRadius: 5, background: 'var(--surface-1)' }}>{t}</span>)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--stroke-1)' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>CTR</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{l.ctr}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>CPC</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{l.cpc}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>SCORE</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: lm.accentFrom }}>{l.score}</div>
                        </div>
                      </div>

                      <button onClick={() => setPick(l.id)} style={{
                        marginTop: 14, width: '100%', height: 38, borderRadius: 10,
                        background: isPick ? `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` : 'var(--surface-2)',
                        color: isPick ? '#0b0710' : 'var(--text-1)',
                        border: '1px solid ' + (isPick ? 'transparent' : 'var(--stroke-2)'),
                        fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: isPick ? `0 0 24px ${m.accentGlow}` : 'none',
                        transition: 'all 0.2s',
                      }}>{isPick ? '◆ Promoting' : 'Promote this'}</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom strip */}
            <div className="glass-strong" style={{
              marginTop: 18, padding: 18, borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`, display: 'grid', placeItems: 'center', color: '#0b0710', fontWeight: 700, boxShadow: `0 0 18px ${m.accentGlow}` }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>ContentFloh suggests <span style={{ color: m.accentFrom }}>Lane A — Cinematic urgency</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>+18% CTR delta over the next-best, $0.10 cheaper per click, and best brand-voice match (91/100).</div>
              </div>
              <CH2>See reasoning →</CH2>
              <GB2 mood={mood} size="sm">Ship the winner →</GB2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.CompareScreen = CompareScreen;
