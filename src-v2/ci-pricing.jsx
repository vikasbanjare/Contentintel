// ContentIntel — Pricing (3 tiers, annual-first anchor, decoy ladder)

// PASTE YOUR PAYMENT LINKS HERE (Razorpay Payment Links / Lemon Squeezy URLs).
// Empty string = button opens the contact mail instead.
const PAY = {
  starter_m: '', starter_y: '',
  pro_m: '',     pro_y: '',
  agency_m: '',  agency_y: '',
  contact: 'mailto:vikasbanjare94@gmail.com?subject=ContentIntel%20plan',
};

const TIERS = [
  {
    id: 'starter', name: 'Starter', tag: 'For getting serious',
    m: 499, y: 4990, mood: 'cyan',
    features: [
      ['50 checks / month', true],
      ['Script · Title · Ads · Ask', true],
      ['Hook rewrites', true],
      ['Thumbnail vision (A/B/C)', false],
      ['Hook-locked script rewrites', false],
      ['Studio + Platform IQ', false],
      ['History — 7 days', true],
    ],
  },
  {
    id: 'pro', name: 'Creator Pro', tag: 'Everything, for one channel', popular: true,
    m: 1299, y: 12990, mood: 'burgundy',
    features: [
      ['250 checks / month', true],
      ['Script · Title · Ads · Ask', true],
      ['Thumbnail vision (A/B/C compare)', true],
      ['Hook-locked script rewrites', true],
      ['Studio + Platform IQ', true],
      ['Full history, forever', true],
      ['Priority support', true],
    ],
  },
  {
    id: 'agency', name: 'Agency', tag: 'For teams & client work',
    m: 3999, y: 39990, mood: 'violet',
    features: [
      ['1,000 checks / month', true],
      ['Everything in Creator Pro', true],
      ['5 team seats', true],
      ['Client-ready report exports', true],
      ['WhatsApp priority support', true],
    ],
  },
];

function PricingTab({ onNav }) {
  const [annual, setAnnual] = React.useState(true);
  const m = MOODS.burgundy;

  function buy(tier) {
    const link = PAY[tier.id + (annual ? '_y' : '_m')];
    window.open(link || PAY.contact, '_blank', 'noopener');
  }

  return (
    <div className="ci-work wide" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 14px' }}>
        <Eyebrow mood="burgundy" glow>Pricing</Eyebrow>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 52, margin: '12px 0 0', letterSpacing: '-0.01em' }}>
          One good hook pays for the year.
        </h2>
        <p style={{ fontSize: 15.5, color: 'var(--text-3)', marginTop: 14, lineHeight: 1.65 }}>
          Start with <b style={{ color: 'var(--text-1)' }}>5 free checks</b> — no card needed. Your scripts and thumbnails are never stored; only a usage count is kept.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 22, padding: 5, borderRadius: 999, border: '1px solid var(--stroke-2)', background: 'var(--surface-2)' }}>
          <button className="pill" onClick={() => setAnnual(false)} style={{ height: 34, border: 'none', background: !annual ? 'var(--surface-3)' : 'transparent', fontWeight: !annual ? 700 : 500 }}>Monthly</button>
          <button className="pill" onClick={() => setAnnual(true)} style={{ height: 34, border: 'none', background: annual ? 'var(--surface-3)' : 'transparent', fontWeight: annual ? 700 : 500 }}>
            Annual&nbsp;<span style={{ color: '#8FD86A', fontSize: 11.5 }}>2 months free</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 30, alignItems: 'stretch', maxWidth: 1080, margin: '30px auto 0' }}>
        {TIERS.map(t => {
          const tm = MOODS[t.mood];
          const monthlyEq = annual ? Math.round(t.y / 12) : t.m;
          return (
            <div key={t.id} className="ci-block" style={{
              padding: 28, position: 'relative', display: 'flex', flexDirection: 'column',
              border: t.popular ? `1.5px solid ${tm.accentFrom}` : '1px solid var(--stroke-1)',
              boxShadow: t.popular ? `0 18px 60px ${tm.accentGlow}` : undefined,
              transform: t.popular ? 'scale(1.03)' : 'none', zIndex: t.popular ? 1 : 0,
            }}>
              {t.popular && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', background: `linear-gradient(135deg, ${tm.accentFrom}, ${tm.accentTo})`, color: '#fff', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 13, color: tm.accentFrom, fontWeight: 700, letterSpacing: '0.04em' }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginTop: 3 }}>{t.tag}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 16 }}>
                <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 46, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>₹{monthlyEq.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 13, color: 'var(--text-4)' }}>/month</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4, minHeight: 16 }}>
                {annual ? `₹${t.y.toLocaleString('en-IN')} billed yearly` : `save ₹${(t.m * 12 - t.y).toLocaleString('en-IN')}/yr on annual`}
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {t.features.map(([f, on]) => (
                  <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: on ? 'var(--text-2)' : 'var(--text-5)' }}>
                    <span style={{ color: on ? '#8FD86A' : 'var(--text-5)', fontWeight: 700, marginTop: 1 }}>{on ? '✓' : '—'}</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22 }}>
                {t.popular
                  ? <GlowButton mood={t.mood} size="lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => buy(t)}>Get Creator Pro →</GlowButton>
                  : <button className="ci-copybtn" style={{ width: '100%', height: 46, fontSize: 14 }} onClick={() => buy(t)}>Choose {t.name}</button>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--text-4)', lineHeight: 1.7 }}>
        Founding-member launch: <b style={{ color: '#F0C85A' }}>40% off annual, locked for life</b> — first 100 accounts.<br/>
        Cancel anytime · GST invoice available · <a href={PAY.contact} style={{ color: 'var(--text-3)' }}>Questions? Talk to us</a>
      </div>
    </div>
  );
}
window.PricingTab = PricingTab;
