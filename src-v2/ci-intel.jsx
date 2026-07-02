// ContentIntel — Intelligence: live trend & platform monitoring digest.
// Runs a real web-research sweep (Gemini + Google Search grounding with the
// user's key, or Claude + web_search in hosted mode) across the domains that
// matter to creators, and reports: what changed → why it matters → do this now.
// Honest scope: this is ON-DEMAND intelligence with daily caching — a browser
// app cannot monitor 24/7. (The always-on upgrade path is a Worker cron.)

const INTEL_CACHE_KEY = 'ci_intel_cache_v1';
const INTEL_STALE_MS = 24 * 3600 * 1000; // refresh daily

const INTEL_DOMAINS = [
  {
    id: 'platforms', icon: '📡', label: 'Platform Updates',
    desc: 'Algorithm, reach, features & policy changes across Instagram, TikTok, YouTube, LinkedIn, X, Facebook, Reddit, Threads',
    query: 'Search for social media platform updates from the LAST 30 DAYS: algorithm changes, reach/engagement ranking changes, new features, monetization and creator-program updates, AI-content policies — across Instagram, TikTok, YouTube, Facebook, LinkedIn, X/Twitter, Reddit, Threads, Pinterest, Snapchat. Prioritise OFFICIAL announcements and credible industry reporting; ignore speculation.',
  },
  {
    id: 'youtube', icon: '▶️', label: 'YouTube Deep-Dive',
    desc: 'Algorithm, CTR & retention research, Shorts, search/recommendations, Creator Insider, monetization',
    query: 'Search for YouTube-specific changes and findings from the LAST 30 DAYS: algorithm/recommendation updates, Creator Insider announcements, thumbnail and title CTR findings, retention/watch-time research, Shorts changes, search/SEO changes, monetization and policy updates.',
  },
  {
    id: 'viral', icon: '🔥', label: 'Viral Patterns & Formats',
    desc: 'Why things are going viral right now — emerging formats, hooks, storytelling, thumbnail & editing trends',
    query: 'Search for CURRENT viral content patterns (last 30 days): emerging short-form and long-form formats, hook formulas creators are using, storytelling and retention techniques, thumbnail and title trends, editing styles. Name real creators/examples where possible and whether claims are backed by data.',
  },
  {
    id: 'ai', icon: '🤖', label: 'AI Tools & Research',
    desc: 'New models, tools & studies that improve creator workflows — scripts, images, video, voice, agents, cost',
    query: 'Search for NEW AI tools, models and credible research from the LAST 30 DAYS relevant to content creators: script/writing models, image and video generation, voice synthesis, AI agents/automation, prompt techniques, and notable studies (attention, consumer psychology, marketing). For each: what changed, is it better/cheaper than current common options, and should a creator adopt now or wait.',
  },
];

const INTEL_SYS = [
  'You are ContentIntel\'s intelligence analyst. Use Google Search to find REAL, RECENT developments for the domain requested, then produce an actionable digest for a content creator.',
  'Rules: only include things you actually found via search from credible sources (official announcements, reputable industry press, named studies). Recency matters — prefer the last 30 days. Never invent updates, dates, numbers or names. If little genuinely happened, return fewer items — never pad.',
  'Return ONLY one JSON object, no markdown fences:',
  '{ "items": [ { "headline": "short specific headline", "what": "1-2 sentences: what actually changed/was found", "why": "1 sentence: why it matters to a creator", "action": "1 sentence: the concrete thing to do about it now", "impact": "high|medium|low" } ] }',
  'Return 3-6 items, ordered most-important-first.',
].join('\n');

// One domain sweep. Gemini (Google Search grounding) when a Google key exists;
// otherwise Claude with live web_search (works in hosted mode / with a key).
async function intelDomainSearch(domain) {
  const gKey = window.getGoogleKey && window.getGoogleKey();
  const userText = 'DOMAIN: ' + domain.label + '\n' + domain.query + '\n\nReturn the JSON digest now.';
  if (gKey) {
    const payload = {
      systemInstruction: { parts: [{ text: INTEL_SYS }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      tools: [{ google_search: {} }],
      generationConfig: { maxOutputTokens: 1600, temperature: 0.3 },
    };
    let res;
    for (let a = 0; ; a++) {
      res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': gKey }, body: JSON.stringify(payload),
      });
      if (res.ok) break;
      if ((res.status === 429 || res.status === 503) && a < 1) { await new Promise(r => setTimeout(r, 2500)); continue; }
      let d = ''; try { d = (await res.json())?.error?.message || ''; } catch (e) {}
      throw new Error(d || ('Search failed (' + res.status + ').'));
    }
    const data = await res.json();
    const cand = (data.candidates || [])[0] || {};
    const text = (((cand.content || {}).parts) || []).map(p => p.text || '').join('');
    const j = (window.parseReport || (() => null))(text) || {};
    // Real grounding sources from the search
    const gm = cand.groundingMetadata || cand.grounding_metadata || {};
    const chunks = gm.groundingChunks || gm.grounding_chunks || [];
    const sources = []; const seen = new Set();
    for (const c of (chunks || [])) {
      const web = (c && (c.web || c.retrievedContext)) || {};
      const url = web.uri || web.url;
      if (url && !seen.has(url)) { seen.add(url); sources.push({ title: (web.title || url).slice(0, 120), url }); }
    }
    return { items: Array.isArray(j.items) ? j.items : [], sources };
  }
  // Claude fallback (hosted worker provides web_search on smart/max engines)
  const { text, sources } = await window.callClaude({ system: INTEL_SYS, userText, maxTokens: 1600, temperature: 0.3, webSearch: true });
  const j = (window.parseReport || (() => null))(text) || {};
  const srcs = (sources || []).map(s => ({ title: (s.title || s.url || '').slice(0, 120), url: s.url })).filter(s => s.url);
  return { items: Array.isArray(j.items) ? j.items : [], sources: srcs };
}

function intelLoadCache() {
  try { return JSON.parse(localStorage.getItem(INTEL_CACHE_KEY)) || null; } catch (e) { return null; }
}
function intelSaveCache(results) {
  try { localStorage.setItem(INTEL_CACHE_KEY, JSON.stringify({ ts: Date.now(), results })); } catch (e) {}
}
function intelAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

const INTEL_IMPACT = { high: '#F06A7E', medium: '#F0C85A', low: '#8FD86A' };

function IntelItemCard({ it, accent }) {
  const col = INTEL_IMPACT[(it.impact || '').toLowerCase()] || '#F0C85A';
  const copyIt = () => {
    const t = `${it.headline}\n\nWhat changed: ${it.what}\nWhy it matters: ${it.why}\nDo this: ${it.action}`;
    window.copyText ? window.copyText(t) : navigator.clipboard.writeText(t).catch(() => {});
  };
  return (
    <div style={{ padding: '13px 15px', borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--stroke-1)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: col, border: `1px solid ${col}44`, background: col + '15', borderRadius: 999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.05em', flexShrink: 0, marginTop: 2 }}>{(it.impact || 'med').slice(0, 6)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{it.headline}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55, marginTop: 5 }}>{it.what}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginTop: 4 }}><b style={{ color: accent }}>Why it matters:</b> {it.why}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginTop: 4, padding: '6px 9px', borderRadius: 8, background: accent + '10', border: `1px solid ${accent}25` }}>
            <b style={{ color: accent }}>→ Do this:</b> {it.action}
          </div>
        </div>
        <button className="ci-copybtn" style={{ height: 26, padding: '0 8px', fontSize: 11, flexShrink: 0 }} onClick={copyIt} title="Copy this insight">⧉</button>
      </div>
    </div>
  );
}

function IntelTab({ onOpenKey }) {
  const mood = 'violet';
  const m = MOODS[mood] || MOODS.burgundy;
  const cached = React.useMemo(intelLoadCache, []);
  const [results, setResults] = React.useState(() => (cached && cached.results) || {});
  const [ts, setTs] = React.useState(() => (cached && cached.ts) || null);
  const [running, setRunning] = React.useState(false);
  const [phase, setPhase] = React.useState(''); // which domain is being searched
  const [serverFed, setServerFed] = React.useState(false); // digest came from the Worker cron
  const liveRef = React.useRef(true);
  React.useEffect(() => () => { liveRef.current = false; }, []);

  // Hosted mode: pull the server's daily auto-digest (Worker cron) when it's
  // newer than anything cached locally — fresh intelligence with zero clicks.
  React.useEffect(() => {
    const saas = (typeof window !== 'undefined' && window.CI_SAAS) || {};
    if (!(saas.workerUrl && window.CI_SESSION)) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch(saas.workerUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + window.CI_SESSION },
          body: JSON.stringify({ intel: true }),
        });
        const data = await res.json().catch(() => null);
        if (!live || !res.ok || !data || !data.results) return;
        const serverTs = new Date(data.created_at || 0).getTime() || 0;
        const local = intelLoadCache();
        if (serverTs && (!local || serverTs > local.ts)) {
          setResults(data.results);
          setTs(serverTs);
          setServerFed(true);
          try { localStorage.setItem(INTEL_CACHE_KEY, JSON.stringify({ ts: serverTs, results: data.results })); } catch (e) {}
        }
      } catch (e) {}
    })();
    return () => { live = false; };
  }, []);

  const gKey = window.getGoogleKey && window.getGoogleKey();
  const canRun = !!gKey || (window.canRun && window.canRun());
  const engine = gKey ? 'Gemini + Google Search' : 'Claude + web search';
  const stale = !ts || (Date.now() - ts) > INTEL_STALE_MS;

  async function sweep() {
    if (running || !canRun) return;
    setRunning(true);
    const out = { ...results };
    // Sequential with a gap: gentle on the shared free-tier quota (~10 req/min).
    for (const d of INTEL_DOMAINS) {
      if (!liveRef.current) return;
      setPhase(d.label);
      try {
        const r = await intelDomainSearch(d);
        out[d.id] = { ...r, err: '' };
      } catch (e) {
        out[d.id] = { items: (out[d.id] && out[d.id].items) || [], sources: (out[d.id] && out[d.id].sources) || [], err: String(e.message || 'Search failed.') };
      }
      if (!liveRef.current) return;
      setResults({ ...out });
      await new Promise(r => setTimeout(r, 1500));
    }
    if (!liveRef.current) return;
    setPhase('');
    setRunning(false);
    const now = Date.now();
    setTs(now);
    intelSaveCache(out);
  }

  const hasAny = INTEL_DOMAINS.some(d => results[d.id] && results[d.id].items && results[d.id].items.length);

  return (
    <div className="ci-work" style={{ '--ci-accent': m.accentFrom, '--ci-glow': m.accentGlow }}>
      <div>
        <Eyebrow mood={mood} glow>Intelligence</Eyebrow>
        <h2 className="ci-h2">Trend &amp; Platform Intelligence</h2>
        <p className="ci-sub" style={{ marginTop: 6 }}>
          A live web-research sweep across platform updates, YouTube changes, viral patterns and new AI tools —
          each finding distilled to <b>what changed → why it matters → do this now</b>, with sources.
        </p>
      </div>

      <div className="ci-block" style={{ padding: 20, marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
              {ts ? (stale ? 'Digest is stale — run a fresh sweep' : 'Digest up to date') : 'No digest yet — run your first sweep'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 3 }}>
              {ts ? `Last updated ${intelAgo(ts)} · ` : ''}{serverFed ? 'Auto-updated daily by the server · ' : ''}Engine: {engine} · 4 focused searches · cached 24h
            </div>
          </div>
          <GlowButton mood={mood} onClick={sweep} style={{ opacity: (running || !canRun) ? 0.6 : 1 }}>
            {running ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Scanning {phase}…
              </span>
            ) : (ts ? '↻ Run fresh sweep' : '⚡ Run intelligence sweep')}
          </GlowButton>
        </div>
        {!canRun && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(240,200,90,0.08)', border: '1px solid rgba(240,200,90,0.3)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            <b style={{ color: '#F0C85A' }}>Add a key to run the sweep</b> — a free Google Gemini key works best (live Google Search grounding).{' '}
            <button className="ci-copybtn" style={{ height: 26, padding: '0 10px', fontSize: 11.5, marginLeft: 6 }} onClick={onOpenKey}>Open Settings</button>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-5)', lineHeight: 1.5 }}>
          {serverFed
            ? 'This digest was generated automatically by the daily server sweep — you can still run a fresh manual sweep any time.'
            : 'This sweep runs when you ask (and caches for a day). Signed-in users on the hosted app get a server digest refreshed automatically every day.'}
        </div>
      </div>

      {INTEL_DOMAINS.map(d => {
        const r = results[d.id];
        const isActive = running && phase === d.label;
        return (
          <div key={d.id} className="ci-block" style={{ padding: 20, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>{d.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 1 }}>{d.desc}</div>
              </div>
              {isActive && <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid var(--text-3)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            </div>
            {r && r.err && !r.items.length && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: '#F06A7E' }}>{r.err}</div>
            )}
            {r && r.items && r.items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {r.items.map((it, i) => <IntelItemCard key={i} it={it} accent={m.accentFrom} />)}
              </div>
            )}
            {r && r.sources && r.sources.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {r.sources.slice(0, 6).map((s, i) => {
                  let host = ''; try { host = new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { host = s.url; }
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer nofollow" title={s.title}
                      style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--stroke-1)', color: 'var(--text-4)', textDecoration: 'none', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ↗ {host}
                    </a>
                  );
                })}
              </div>
            )}
            {!r && !isActive && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-5)' }}>Run the sweep to fill this section.</div>
            )}
          </div>
        );
      })}

      {hasAny && (
        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--text-5)', lineHeight: 1.6, textAlign: 'center' }}>
          Every insight is grounded in the linked sources — click through before betting a strategy on it.
        </div>
      )}
    </div>
  );
}
window.IntelTab = IntelTab;
