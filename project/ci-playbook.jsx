// ContentIntel — Thumbnail Playbook (public page).
// Renders the thumbnail research library (design principles, layout archetypes,
// colour schemes, per-niche proven patterns, example regen prompts, A/B tests)
// as a browsable, on-brand guide. Data comes from research.js, so it stays in
// sync with whatever the owner trains.

// Map a colour-scheme name to a representative CSS swatch.
function schemeSwatch(name) {
  const M = {
    'Sky-blue growth': 'linear-gradient(135deg,#7cc6ff,#1e6fd6)',
    'Navy grid + growth graph': 'linear-gradient(135deg,#0b1f3a,#1f9d6b)',
    'Stock-chart green/red': 'linear-gradient(135deg,#19c37d,#e23b3b)',
    'Brand-matched': 'conic-gradient(from 210deg,#ff5e3a,#ffd400,#19c37d,#2bd2ff,#7b61ff,#ff5e3a)',
    'High-contrast complementary': 'linear-gradient(135deg,#ff7a3c,#1fb6c9)',
    'Bold saturated primary': 'linear-gradient(135deg,#ff3b30,#ffd400 55%,#2b6cff)',
    'Dark + neon accent': 'linear-gradient(135deg,#0a0a12,#39ff14)',
    'Bright + white space': 'linear-gradient(135deg,#ffffff,#dfe7f5)',
    'Warm dramatic': 'linear-gradient(135deg,#ff5e3a,#b3001b)',
    'Cool / tech': 'linear-gradient(135deg,#2bd2ff,#1455c4)',
    'Monochrome + single accent': 'linear-gradient(135deg,#2a2a2a,#9aa0a6 70%,#ff3b30)',
    'Dark premium / photographic': 'linear-gradient(135deg,#0c0f16,#3a4356)',
  };
  return M[name] || 'linear-gradient(135deg,#3a3f4a,#8a93a6)';
}

// Split provenPatterns (one string, blocks separated by blank lines) into
// { title, body } cards. First line = heading.
function splitPlaybook(text) {
  return String(text || '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(block => {
    const nl = block.indexOf('\n');
    return nl === -1 ? { title: block, body: '' } : { title: block.slice(0, nl).trim(), body: block.slice(nl + 1).trim() };
  });
}

const PLAYBOOK_REGEN_EXAMPLES = [
  {
    label: 'Business case-study',
    text: "Improve THIS thumbnail: keep the founder photo, cut them out cleanly on the right third with rim light, smiling at camera. Background: the company's real storefront on a bright sky-blue sky with a faint upward green growth line. Bottom-left, two lines: '₹900 Crore' in big serif-italic white + 'Cloud Kitchen Factory' in bold sans. Draw a hand-drawn curved white arrow from the number to the founder. Add a small black '100K+ VIEWS' pill top-right. Keep the real brand logo as a tilted badge near the subject.",
  },
  {
    label: 'Personal-finance interview',
    text: "Improve THIS thumbnail: expert guest cut out on the left, host on the right, podcast mics in front, dark navy background with a faint market chart. Centre-top: 'You Only Need This' in white, then '1 FUND!' in a yellow highlight pill (black text), then 'To Retire Early'. Add a small 'HOW?' reaction box beside the host and a curved arrow. Keep both real faces and the real claim.",
  },
  {
    label: 'On-brand (your colours)',
    text: "Improve THIS thumbnail using my brand colours #0A2540 (background) and #FFE14D (highlight). Keep the subject and topic. Put the key number in a #FFE14D rounded box with black text; use #0A2540 for the backdrop with a subtle grid; white body text with a soft shadow; add my logo bottom-right. Maintain strong contrast and a single clear focal point.",
  },
];

function PlaybookTab() {
  const mood = 'ember';
  const m = window.MOODS[mood];
  const r = window.getResearch('thumbnail') || {};
  const layouts = r.layouts || [];
  const schemes = r.colorSchemes || [];
  const principles = String(r.designPrinciples || '').split('\n').map(s => s.replace(/^[-•]\s*/, '').trim()).filter(s => s && !/^\(/.test(s));
  const playbooks = splitPlaybook(r.provenPatterns);
  const abExamples = [
    'Face vs no-face — same text, one with a large reacting face, one product-only. Hypothesis: a face lifts CTR for personality-led niches.',
    'Hook frame — “₹500 Cr” big-number vs “India’s Delivery King” authority vs “Why did it fail?” question. Hypothesis: number wins for credibility, question wins for curiosity.',
    'Expression — calm-confident vs shocked/wide-eyed. Hypothesis: shock wins for scam/outrage topics, calm wins for premium/business.',
    'Highlight — key word in a yellow box vs plain bold. Hypothesis: the yellow box raises legibility + click pull at small sizes.',
    'Colour — your brand palette vs high-contrast complementary (teal/orange). Hypothesis: contrast pops more in a busy feed.',
  ];

  const Stat = ({ n, label }) => (
    <div style={{ textAlign: 'center', padding: '4px 14px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: m.accentFrom }}>{n}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
    </div>
  );

  return (
    <div className="ci-work wide" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <window.WorkHead mood={mood} eyebrow="Thumbnail Playbook"
        title="What actually makes thumbnails get clicked"
        sub="Patterns reverse-engineered from hundreds of top-performing thumbnails — the layouts, colours, text frames and devices that repeat across the best, plus copy-ready regeneration prompts and A/B tests." />

      <window.Block mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbB}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
          <Stat n={playbooks.length} label="niche playbooks" />
          <Stat n={layouts.length} label="layout archetypes" />
          <Stat n={schemes.length} label="colour schemes" />
          <Stat n={principles.length} label="design principles" />
        </div>
      </window.Block>

      {principles.length > 0 && (
        <window.Block title="Core design principles" desc="The rules the best thumbnails follow at a glance" mood={mood}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 }}>
            {principles.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                <span style={{ color: m.accentFrom, marginTop: 1 }}>◈</span><span>{p}</span>
              </div>
            ))}
          </div>
        </window.Block>
      )}

      <window.Block title="Layout archetypes" desc="Pick the structure that fits your story" mood={mood}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
          {layouts.map((l, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--stroke-1)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 5 }}>{l.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{l.what}</div>
            </div>
          ))}
        </div>
      </window.Block>

      <window.Block title="Colour schemes" desc="What pops in a crowded, muted feed" mood={mood}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {schemes.map((s, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--stroke-1)' }}>
              <div style={{ height: 54, background: schemeSwatch(s.name) }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{s.what}</div>
              </div>
            </div>
          ))}
        </div>
      </window.Block>

      {playbooks.length > 0 && (
        <window.Block title="Proven patterns by niche" desc="The repeatable formulas — apply the one that matches your channel" mood={mood}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {playbooks.map((p, i) => (
              <details key={i} style={{ borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--stroke-1)', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.45 }}>{p.title}</summary>
                {p.body && <div style={{ whiteSpace: 'pre-wrap', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 10 }}>{p.body}</div>}
              </details>
            ))}
          </div>
        </window.Block>
      )}

      <window.Block title="Example regeneration prompts" desc="Copy, tweak the specifics, paste into any image generator" mood={mood}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLAYBOOK_REGEN_EXAMPLES.map((ex, i) => (
            <window.CopyBlock key={i} label={ex.label} text={ex.text} mono={false} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 10, lineHeight: 1.5 }}>
          Tip: in the <b>Thumbnail check</b> tab, add your brand colours and what to emphasise — the analyzer writes a regen prompt grounded in your actual thumbnail and your palette.
        </div>
      </window.Block>

      <window.Block title="A/B testing — what to try" desc="Change ONE variable per test so the winner is attributable" mood={mood}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {abExamples.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 800, color: m.accentFrom, fontFamily: 'var(--font-display)' }}>{String.fromCharCode(65 + i)}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </window.Block>

      <window.Block mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
        <window.Eyebrow mood={mood} glow>Put it to work</window.Eyebrow>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginTop: 10, color: 'var(--text-1)' }}>
          Open the <b>Thumbnail</b> tab, drop your design, set your brand colours, and run a check — you'll get a score against these patterns plus a regeneration prompt built from your own thumbnail.
        </div>
      </window.Block>
    </div>
  );
}

Object.assign(window, { PlaybookTab });
