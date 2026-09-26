// ContentIntel — FREE local engine.
// Real, useful output computed entirely in the browser: no API key, no sign-in,
// no cost, no network. These power the "always works" layer of every tool and
// double as the automatic fallback when an AI call fails or quota runs out.
// Rules of the road: never fabricate facts, never claim AI wrote it, and label
// the output so users know it's the instant/free tier.

// ── Text utilities ──────────────────────────────────────────────────────────
const FREE_STOP = new Set(('a an the and or but if then than that this these those of in on at to for with from by is are was were be been being it its as your you my me we our their his her he she they i do does did how why what when who which will can could should would about into over under more most best worst new now just very really).').split(/[\s)]+/).filter(Boolean));

function freeWords(s) {
  return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 2 && !FREE_STOP.has(w));
}
// Topic keywords by frequency, longest-first tiebreak — the backbone of every
// local generator (keeps output about the user's actual subject).
function freeKeywords(text, n) {
  const freq = {};
  for (const w of freeWords(text)) freq[w] = (freq[w] || 0) + 1;
  return Object.keys(freq).sort((a, b) => (freq[b] - freq[a]) || (b.length - a.length)).slice(0, n || 6);
}
function freeTitleCase(s) {
  return String(s || '').split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}
// The subject phrase, cleaned of hook scaffolding so it can slot into templates.
function freeSubject(text) {
  let t = String(text || '').trim().replace(/\s+/g, ' ');
  t = t.replace(/^(how to|how i|why|what|the|a|an|my|this is|here is|top \d+|\d+)\s+/i, '');
  t = t.replace(/[?!.]+$/, '');
  return t.slice(0, 72) || 'this topic';
}
function freeNumber(text) {
  const m = String(text || '').match(/[₹$€]?\s?\d[\d,.]*\s*(lakh|crore|cr|k|m|%|x|days?|weeks?|months?|years?|hours?|mins?|minutes?)?/i);
  return m ? m[0].trim() : '';
}

// ── Title rewrites (10 angles, no AI) ───────────────────────────────────────
// Each angle is a documented CTR pattern; the local scorer then ranks them so
// the user sees the strongest first — that ranking is the real value here.
function freeTitleIdeas(title, opts) {
  const o = opts || {};
  const subj = freeSubject(title);
  const subjT = freeTitleCase(subj);
  const num = freeNumber(title) || (o.about ? freeNumber(o.about) : '');
  const kw = freeKeywords(title + ' ' + (o.about || ''), 3);
  const topic = freeTitleCase(kw[0] || subj.split(' ')[0] || 'This');
  const year = new Date().getFullYear();
  const out = [
    { angle: 'Curiosity gap', text: `The Truth About ${subjT} Nobody Tells You` },
    { angle: 'Mistake / negative', text: `${num ? num + ' ' : '5 '}${topic} Mistakes That Cost You Money` },
    { angle: 'How-to (clear promise)', text: `How To ${subjT} — Step By Step` },
    { angle: 'Question hook', text: `Are You Making These ${topic} Mistakes?` },
    { angle: 'Beginner framing', text: `${subjT}: The Beginner's Guide (${year})` },
    { angle: 'Social proof', text: `Why 90% Of People Get ${topic} Wrong` },
    { angle: 'Before / after', text: `I Tried ${subjT} — Here's What Happened` },
    { angle: 'Urgency', text: `Stop Doing This With ${topic} (Fix It Today)` },
    { angle: 'Listicle + qualifier', text: `${num ? num : '7'} ${topic} Tips [With Real Examples]` },
    { angle: 'Contrarian', text: `${subjT} Is Not What You Think` },
  ];
  // Rank by the same local CTR heuristics the app already uses.
  const score = (t) => (window.scoreTitleCTR && (window.scoreTitleCTR(t) || {}).score) || 50;
  return out.map(x => ({ ...x, score: score(x.text) })).sort((a, b) => b.score - a.score);
}

// ── Hashtags + description (no AI) ──────────────────────────────────────────
function freeHashtags(text, platform) {
  const kw = freeKeywords(text, 8);
  const base = kw.map(w => '#' + w.replace(/[^a-z0-9]/g, ''));
  const generic = {
    YouTube: ['#youtube', '#youtuber', '#tutorial'],
    Instagram: ['#reels', '#explore', '#instagood', '#trending'],
    TikTok: ['#fyp', '#foryou', '#viral', '#learnontiktok'],
    LinkedIn: ['#learning', '#career', '#growth'],
    X: ['#thread', '#tips'],
  }[platform] || ['#tips', '#howto'];
  const seen = new Set(); const all = [];
  for (const h of [...base, ...generic]) { const k = h.toLowerCase(); if (h.length > 2 && !seen.has(k)) { seen.add(k); all.push(h); } }
  return all.slice(0, platform === 'Instagram' || platform === 'TikTok' ? 12 : 8);
}
function freeDescription(title, about, platform) {
  const subj = freeSubject(title);
  const body = (about || '').trim();
  const lines = [
    `${freeTitleCase(subj)} — everything you need to know.`,
    body ? body.slice(0, 300) : `In this video we break down ${subj} step by step, with practical examples you can apply right away.`,
    '',
    'Timestamps:',
    '0:00 Intro',
    '0:30 The main idea',
    '2:00 Walkthrough',
    '5:00 Key takeaways',
    '',
    freeHashtags(title + ' ' + body, platform).join(' '),
  ];
  return lines.join('\n');
}

// ── Local thumbnail scorecard (no AI, no vision) ────────────────────────────
// Uses the measurements the app already computes in-browser (palette, contrast,
// brightness, saturation, face size) and turns them into concrete, honest
// advice. It never guesses at content it cannot see.
function freeThumbScore(q, faceInfo) {
  if (!q) return null;
  const items = []; let score = 50;
  const add = (ok, warn, pts, label, tip) => { score += ok ? pts : -pts; items.push({ ok, label, tip: ok ? '' : tip, warn }); };
  add(q.contrastScore === 'green', q.contrastScore === 'yellow', 12, `Contrast ${q.contrast}%`,
    'Low contrast disappears at small sizes — deepen shadows and brighten the subject.');
  add(q.brightScore === 'green', q.brightScore === 'yellow', 8, `Brightness ${q.brightness}%`,
    q.brightness < 40 ? 'Too dark for mobile feeds — lift exposure on the subject.' : 'Slightly blown out — pull highlights back.');
  add(q.satScore === 'green', q.satScore === 'yellow', 8, `Saturation ${q.saturation}%`,
    q.saturation < 35 ? 'Muted colour reads as low-energy — boost vibrance.' : 'Oversaturated can look cheap — ease it back.');
  if (faceInfo) {
    const big = faceInfo.count > 0 && faceInfo.largestPct >= 18;
    add(big, faceInfo.count > 0, 12, faceInfo.count === 0 ? 'No face detected' : `${faceInfo.count} face · ${faceInfo.largestPct}% of frame`,
      faceInfo.count === 0 ? 'Thumbnails with a clear human face and one strong emotion typically win more clicks.'
        : 'Face is small — crop tighter so the expression reads at 120px.');
  }
  return { score: Math.max(10, Math.min(96, Math.round(score))), items };
}

// ── Script outline (no AI) ──────────────────────────────────────────────────
// A retention-shaped skeleton the creator fills in — structure is the part a
// template genuinely can provide; the words still need a human or AI.
function freeScriptOutline(topic, seconds) {
  const s = Math.max(30, Math.min(1800, parseInt(seconds, 10) || 480));
  const subj = freeSubject(topic);
  const pct = (p) => { const t = Math.round(s * p); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  return [
    { at: '0:00', beat: 'Hook (first 5 seconds)', note: `Open on the single most surprising thing about ${subj}. No intro, no "welcome back" — state the payoff or the problem immediately.` },
    { at: pct(0.04), beat: 'Promise', note: 'One sentence on exactly what the viewer will be able to do by the end. Be specific and concrete.' },
    { at: pct(0.10), beat: 'Context / stakes', note: 'Why this matters now, and what it costs to get it wrong. Keep it under 20 seconds.' },
    { at: pct(0.20), beat: 'Point 1', note: 'Your strongest point first — never save the best for last on short-form-trained audiences.' },
    { at: pct(0.42), beat: 'Point 2 + example', note: 'Add a concrete example, number, or demo here. Visual change resets attention.' },
    { at: pct(0.62), beat: 'Pattern break', note: 'Change something: location, B-roll, a question to camera, a graphic. This is where most drop-off happens.' },
    { at: pct(0.75), beat: 'Point 3 / the twist', note: 'The insight most people miss — this is what makes the video worth sharing.' },
    { at: pct(0.90), beat: 'Recap + one action', note: 'Three-line recap, then ONE clear next step. Multiple CTAs kill conversion.' },
    { at: pct(0.97), beat: 'Next-video hook', note: 'Point at the specific next video, not a generic "subscribe".' },
  ];
}

window.freeKeywords = freeKeywords;
window.freeTitleIdeas = freeTitleIdeas;
window.freeHashtags = freeHashtags;
window.freeDescription = freeDescription;
window.freeThumbScore = freeThumbScore;
window.freeScriptOutline = freeScriptOutline;
window.freeSubject = freeSubject;
