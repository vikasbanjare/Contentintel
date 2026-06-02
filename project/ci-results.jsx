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
function CopyBlock({ text, label = 'Copy', mono = false }) {
  const [done, setDone] = React.useState(false);
  function copy() {
    try { navigator.clipboard.writeText(typeof text === 'string' ? text : ''); } catch (e) {}
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  }
  return (
    <div className="ci-copyblock">
      <div className="ci-copyblock-text" style={mono ? { fontFamily: 'var(--font-mono)', fontSize: 12.5 } : {}}>{text}</div>
      <button className={'ci-copybtn' + (done ? ' done' : '')} onClick={copy}>
        {done ? '✓ Copied' : <>⧉ {label}</>}
      </button>
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

Object.assign(window, {
  TrafficLight, Block, ScoreItem, Issue, CopyBlock, CIChip, ChipGroup,
  Toggle, RunButton, WorkHead, LoadingResults, QScore, Check, setAccentVars,
});
