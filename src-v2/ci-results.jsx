// ContentIntel — shared result primitives (reused across tabs)

const { MOODS: RM } = window;

function setAccentVars(el, mood) {
  const m = RM[mood] || RM.navy;
  return { '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow };
}

// Traffic-light verdict banner
function TrafficLight({ level, title, text }) {
  return (
    <div className={'ci-light ' + level}>
      <div className="ci-light-orb" />
      <div>
        <div className="ci-light-title">{title}</div>
        <div className="ci-light-text">{text}</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 7 }}>
        {['green','yellow','red'].map(c => (
          <span key={c} className={'ci-dot ' + c} style={{ opacity: c === level ? 1 : 0.22, width: 11, height: 11 }} />
        ))}
      </div>
    </div>
  );
}

// Block wrapper with title
function Block({ title, desc, right, children, mood, style }) {
  return (
    <div className="ci-block" style={style}>
      {(title || right) && (
        <div className="ci-block-head">
          <div>
            <div className="ci-block-title">{title}</div>
            {desc && <div className="ci-block-desc">{desc}</div>}
          </div>
          <div style={{ flex: 1 }} />
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// Score with plain explanation + bar
function ScoreItem({ name, score, why, mood }) {
  const m = RM[mood] || RM.navy;
  const color = score >= 75 ? '#8FD86A' : score >= 60 ? '#F0C85A' : '#F06A7E';
  return (
    <div className="ci-score-item">
      <div className="ci-score-top">
        <span className="ci-score-name">{name}</span>
        <span className="ci-score-num" style={{ color }}>{score}</span>
      </div>
      <div className="score-bar" style={{ marginBottom: 8 }}>
        <div className="score-bar-fill" style={{ width: score + '%', background: `linear-gradient(90deg, ${color}, ${color})`, boxShadow: `0 0 10px ${color}80` }} />
      </div>
      <div className="ci-score-why">{why}</div>
    </div>
  );
}

// Issue line with severity dot
function Issue({ level, children }) {
  return (
    <div className="ci-issue">
      <span className={'ci-dot ' + level} />
      <span>{children}</span>
    </div>
  );
}

// Copy-to-clipboard block
// Robust copy — clipboard API with an execCommand fallback for sandbox / file://
// / non-HTTPS contexts where navigator.clipboard is blocked. Resolves true/false.
function copyText(text) {
  const t = typeof text === 'string' ? text : String(text == null ? '' : text);
  return new Promise((resolve) => {
    const fallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = t; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '-9999px'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { ta.setSelectionRange(0, t.length); } catch (e) {}
        const ok = document.execCommand('copy');
        document.body.removeChild(ta); resolve(!!ok);
      } catch (e) { resolve(false); }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(() => resolve(true), fallback);
      } else fallback();
    } catch (e) { fallback(); }
  });
}
function downloadText(text, filename) {
  try {
    const blob = new Blob([text || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename || 'report.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {}
}

function CopyBlock({ text, label = 'Copy', mono = false, onApply, applyLabel = '← Use hook' }) {
  const [done, setDone] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  function copy() {
    copyText(text).then(ok => {
      setDone(ok ? 'done' : 'fail');
      setTimeout(() => setDone(false), 1600);
    });
  }
  function handleApply() {
    onApply();
    setApplied(true);
    setTimeout(() => setApplied(false), 1800);
  }
  return (
    <div className="ci-copyblock">
      <div className="ci-copyblock-text" style={mono ? { fontFamily: 'var(--font-mono)', fontSize: 12.5 } : {}}>{text}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
        {onApply && (
          <button className={'ci-copybtn' + (applied ? ' done' : '')}
            style={applied ? {} : { background: 'rgba(100,160,255,0.12)', borderColor: 'rgba(100,160,255,0.35)', color: '#7eb8ff' }}
            onClick={handleApply}>{applied ? '✓ Applied' : applyLabel}</button>
        )}
        <button className={'ci-copybtn' + (done === 'done' ? ' done' : '')} onClick={copy}>
          {done === 'done' ? '✓ Copied' : done === 'fail' ? 'Press Ctrl/⌘+C' : <>⧉ {label}</>}
        </button>
      </div>
    </div>
  );
}

// Chip used in inputs
function CIChip({ active, onClick, children }) {
  return (
    <button className={'pill' + (active ? ' active' : '')} onClick={onClick} style={{ height: 30, fontSize: 12.5 }}>
      {children}
    </button>
  );
}

// Single-select chip group
function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="ci-chiprow">
      {label && <span className="ci-chip-label">{label}</span>}
      {options.map(o => (
        <CIChip key={o} active={value === o} onClick={() => onChange(o)}>{o}</CIChip>
      ))}
    </div>
  );
}

// Toggle (A/B)
function Toggle({ on, onChange, mood, children }) {
  const m = RM[mood] || RM.navy;
  return (
    <label className="ci-toggle" onClick={() => onChange(!on)}>
      <span className={'ci-toggle-track' + (on ? ' on' : '')} style={on ? { background: m.accentFrom, boxShadow: `0 0 14px ${m.accentGlow}` } : {}}>
        <span className="ci-toggle-knob" />
      </span>
      <span style={{ fontSize: 13, color: on ? 'var(--text-1)' : 'var(--text-3)', fontWeight: 500 }}>{children}</span>
    </label>
  );
}

// Run button (big)
function RunButton({ mood, onClick, loading, children }) {
  return (
    <GlowButton mood={mood} size="lg" onClick={onClick} style={{ justifyContent: 'center' }}>
      {loading ? (
        <>
          <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} className="spin" />
          Checking…
        </>
      ) : children}
    </GlowButton>
  );
}

// Section header inside working area
function WorkHead({ mood, eyebrow, title, sub }) {
  return (
    <div className="ci-section-head">
      <Eyebrow mood={mood} glow>{eyebrow}</Eyebrow>
      <h2 className="ci-h2">{title}</h2>
      {sub && <p className="ci-sub">{sub}</p>}
    </div>
  );
}

// Loading shimmer rows
function LoadingResults({ rows = 4 }) {
  return (
    <div className="ci-block">
      <div className="ci-block-head"><div className="shimmer" style={{ width: 160, height: 16, borderRadius: 4 }} /></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
          <div className="shimmer" style={{ width: '40%', height: 13, borderRadius: 4 }} />
          <div className="shimmer" style={{ width: '100%', height: 6, borderRadius: 3 }} />
          <div className="shimmer" style={{ width: '75%', height: 11, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// Quick 0-10 score row (thumbnail tab)
function QScore({ name, score, why }) {
  const color = score >= 7 ? '#8FD86A' : score >= 4 ? '#F0C85A' : '#F06A7E';
  return (
    <div style={{ padding: '11px 0', borderTop: '1px solid var(--stroke-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} style={{ width: 6, height: 14, borderRadius: 2, background: i < score ? color : 'var(--surface-3)', boxShadow: i < score ? `0 0 6px ${color}70` : 'none' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color, width: 28, textAlign: 'right' }}>{score}</span>
      </div>
      {why && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>{why}</div>}
    </div>
  );
}

// Checklist row (✓ ✗ ~)
function Check({ state, children }) {
  const map = { yes: ['✓', '#8FD86A'], no: ['✗', '#F06A7E'], mid: ['~', '#F0C85A'] };
  const [sym, color] = map[state] || map.mid;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 0', borderTop: '1px solid var(--stroke-1)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-2)' }}>
      <span style={{ width: 18, height: 18, borderRadius: 5, background: color + '22', color, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{sym}</span>
      <span>{children}</span>
    </div>
  );
}

// ── Dashboard primitives ─────────────────────────────────────────────────────
// Circular overall score
function ScoreDonut({ value = 0, size = 78, label }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = v >= 75 ? '#8FD86A' : v >= 55 ? '#F0C85A' : '#F06A7E';
  const r = (size - 10) / 2, c = 2 * Math.PI * r, off = c * (1 - v / 100), cc = size / 2;
  // Sweep in from empty on mount (CSS transition on stroke-dashoffset).
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => { const t = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true))); return () => cancelAnimationFrame(t); }, []);
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cc} cy={cc} r={r} fill="none" stroke="var(--stroke-2)" strokeWidth="6" />
        <circle className="ci-donut-ring" cx={cc} cy={cc} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={drawn ? off : c} transform={`rotate(-90 ${cc} ${cc})`}
          style={{ filter: `drop-shadow(0 0 5px ${color}90)` }} />
        <text x={cc} y={cc} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight="800" fontSize={size * 0.34} fill="var(--text-1)">{v}</text>
      </svg>
      {label && <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>}
    </div>
  );
}

// Clean dashboard score bar (name · number · gradient track)
function ScoreBar({ name, score, why }) {
  const v = Math.max(0, Math.min(100, Math.round(score)));
  const color = v >= 75 ? '#8FD86A' : v >= 55 ? '#F0C85A' : '#F06A7E';
  // Grow in from 0 on mount (CSS transition on width).
  const [grown, setGrown] = React.useState(false);
  React.useEffect(() => { const t = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true))); return () => cancelAnimationFrame(t); }, []);
  return (
    <div style={{ padding: '9px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 500 }}>{name}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }}>{v}</span>
      </div>
      <div className="ci-scorebar-track" style={{ height: 8, borderRadius: 5, background: 'var(--stroke-1)', overflow: 'hidden' }}>
        <div className="ci-scorebar-fill" style={{ height: '100%', width: (grown ? v : 0) + '%', borderRadius: 5, background: color, boxShadow: `0 0 10px ${color}66` }} />
      </div>
      {why && <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6, lineHeight: 1.5 }}>{why}</div>}
    </div>
  );
}

// Script quality / attention curve over the runtime — with hover tooltips
function QualityGraph({ points = [], mood = 'navy' }) {
  const m = RM[mood] || RM.navy;
  const pts = (points || []).filter(p => p && typeof p.value === 'number').slice(0, 14);
  if (pts.length < 2) return null;
  const [hov, setHov] = React.useState(null);
  const W = 1000, H = 240, padX = 34, padTop = 18, padBot = 52;
  const innerW = W - padX * 2, innerH = H - padTop - padBot, base = padTop + innerH;
  const xs = i => padX + (innerW * i) / (pts.length - 1);
  const ys = v => padTop + innerH * (1 - Math.max(0, Math.min(100, v)) / 100);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${xs(pts.length - 1).toFixed(1)},${base} L${xs(0).toFixed(1)},${base} Z`;
  const accent = m.accentFrom;
  const gid = 'qg-' + mood;
  return (
    <div style={{ position: 'relative' }}>
      {hov !== null && pts[hov] && (
        <div style={{
          position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-3)', border: '1px solid var(--stroke-2)',
          borderRadius: 8, padding: '7px 12px', fontSize: 12.5, zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'none',
          maxWidth: 280, textAlign: 'center', lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700, color: pts[hov].value < 42 ? '#F06A7E' : pts[hov].value >= 75 ? '#8FD86A' : '#F0C85A' }}>
            {Math.round(pts[hov].value)}
          </span>
          <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>{pts[hov].label || `Segment ${hov + 1}`}</span>
          {pts[hov].note && <div style={{ color: 'var(--text-4)', fontSize: 11.5, marginTop: 2 }}>{pts[hov].note}</div>}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', cursor: 'crosshair' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map(g => (
          <line key={g} x1={padX} y1={ys(g)} x2={W - padX} y2={ys(g)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        ))}
        {[25, 50, 75].map(g => (
          <text key={'gl'+g} x={padX - 6} y={ys(g) + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="12" fill="rgba(255,255,255,0.2)">{g}</text>
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${m.accentGlow})` }} />
        {pts.map((p, i) => {
          const low = p.value < 42;
          const isHov = hov === i;
          const col = low ? '#F06A7E' : accent;
          return (
            <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
              <circle cx={xs(i)} cy={ys(p.value)} r={isHov ? 9 : (low ? 6 : 4.5)}
                fill={col} stroke="#0b0e15" strokeWidth="2"
                style={{ transition: 'r 0.1s', filter: isHov ? `drop-shadow(0 0 6px ${col})` : 'none' }} />
              {isHov && <circle cx={xs(i)} cy={ys(p.value)} r={14} fill="transparent" />}
              <text x={xs(i)} y={H - 28} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill={isHov ? 'var(--text-1)' : 'var(--text-3)'}>{p.label || (i + 1)}</text>
            </g>
          );
        })}
        {hov !== null && <line x1={xs(hov)} y1={padTop} x2={xs(hov)} y2={base} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 4" />}
      </svg>
    </div>
  );
}

// Beat sheet — timestamp · beat · line, coloured by strength
function BeatSheet({ items = [] }) {
  const col = { green: '#8FD86A', yellow: '#F0C85A', red: '#F06A7E' };
  return (
    <div>
      {(items || []).map((it, i) => {
        const c = col[it.level] || 'var(--stroke-2)';
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 92px 1fr', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-3)', paddingTop: 1 }}>{it.t || ''}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: col[it.level] || 'var(--text-4)', paddingTop: 2 }}>{it.label || ''}</span>
            <span style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.55, borderLeft: `2px solid ${c}`, paddingLeft: 12 }}>{it.text}{it.note && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>{it.note}</span>}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  TrafficLight, Block, ScoreItem, Issue, CopyBlock, CIChip, ChipGroup,
  Toggle, RunButton, WorkHead, LoadingResults, QScore, Check, setAccentVars,
  ScoreDonut, ScoreBar, QualityGraph, BeatSheet, copyText, downloadText,
});
