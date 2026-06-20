// ContentIntel -- floating feedback widget. Saves to the Supabase `feedback`
// table (see SQL in chat). Shows inside the app for signed-in users.

function FeedbackWidget() {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const saasOn = !!window.CI_SAAS_ON;

  async function send() {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      if (saasOn && window.ciGetSupabase && window.CI_SESSION) {
        const sb = await window.ciGetSupabase();
        const u = window.CI_USER || {};
        await sb.from('feedback').insert({ user_id: u.id || null, email: u.email || null, rating, message: msg.trim() });
      } else {
        // fallback: open an email draft
        window.open('mailto:vikasbanjare94@gmail.com?subject=ContentIntel%20feedback&body=' + encodeURIComponent((rating ? '['+rating+'] ' : '') + msg.trim()), '_blank');
      }
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setMsg(''); setRating(''); }, 1600);
    } catch (e) {
      setMsg(m => m); // keep text
      alert('Could not send feedback right now — please try again.');
    }
    setBusy(false);
  }

  const RATINGS = [['love', '😍 Love it'], ['ok', '🙂 It’s ok'], ['meh', '😕 Frustrating']];

  return (
    <>
      <button onClick={() => setOpen(true)} title="Send feedback"
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 120, height: 44, padding: '0 18px', borderRadius: 999,
          border: '1px solid var(--stroke-2)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Feedback
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(4,6,12,0.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center' }}>
          <div className="ci-block" style={{ width: 420, maxWidth: '92vw', padding: 26 }} onClick={e => e.stopPropagation()}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 34 }}>🙏</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>Thank you!</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Your feedback shapes what we build next.</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26 }}>Tell us what you think</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.55 }}>What's working? What's missing? What should we build next?</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {RATINGS.map(([k, label]) => (
                    <button key={k} onClick={() => setRating(k)} className="pill"
                      style={{ flex: 1, height: 38, fontSize: 13, border: rating === k ? '1.5px solid var(--ci-accent, #FF4D8D)' : '1px solid var(--stroke-2)',
                        background: rating === k ? 'rgba(255,77,141,0.1)' : 'transparent' }}>{label}</button>
                  ))}
                </div>
                <textarea className="ci-textarea" style={{ minHeight: 110, marginTop: 12 }} value={msg} onChange={e => setMsg(e.target.value)}
                  placeholder="Type your feedback here…" />
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <GlowButton mood="burgundy" onClick={send} style={{ flex: 1, justifyContent: 'center' }}>{busy ? 'Sending…' : 'Send feedback'}</GlowButton>
                  <button className="ci-copybtn" style={{ height: 44, padding: '0 16px' }} onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
window.FeedbackWidget = FeedbackWidget;
