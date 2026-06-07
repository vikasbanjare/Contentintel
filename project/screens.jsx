// ContentFloh — Screens (part 1): Home variations + Script Generator + Variations + A/B Test

const {
  MOODS, AmbientBloom, Sidebar, Topbar, Eyebrow,
  GlowButton, Chip, Card, ScoreRing, StepDots, NavIcon,
} = window;

// ─────────────────────────────────────────────────────────────────────────────
// 1–3. HOME — three color-mood variations (same layout, different bloom)
// ─────────────────────────────────────────────────────────────────────────────
function HomeHero({ mood, headline, eyebrow }) {
  const m = MOODS[mood];
  return (
    <div style={{
      position: 'relative',
      padding: '56px 56px 40px',
      minHeight: 360,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      isolation: 'isolate',
    }}>
      <AmbientBloom mood={mood} intensity={1} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
        <Eyebrow mood={mood} glow>{eyebrow}</Eyebrow>
        <h1 className="display" style={{
          fontSize: 72,
          margin: '14px 0 0',
          textWrap: 'pretty',
          lineHeight: 0.92,
          letterSpacing: 'var(--display-tracking, -0.025em)',
          textTransform: 'var(--display-case, none)',
        }}>{headline}</h1>
        <p style={{
          margin: '20px 0 0',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--text-2)',
          maxWidth: 480,
        }}>
          Drop in a brief. ContentFloh generates scripts, ad variants, thumbnails, and A/B tests — all in one workspace tuned for shipping.
        </p>
      </div>
    </div>
  );
}

function PromptDock({ mood, placeholder = 'Describe what happens in the ad…' }) {
  const m = MOODS[mood];
  const [val, setVal] = React.useState('');
  const [genre, setGenre] = React.useState('UGC');
  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '0 56px' }}>
      <div className="glass-strong" style={{
        borderRadius: 22,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${m.accentGlow}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--surface-2)',
            border: '1px solid var(--stroke-2)',
            color: 'var(--text-2)',
            cursor: 'pointer',
            fontSize: 18,
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>+</button>
          <textarea
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              minHeight: 38,
              maxHeight: 90,
              padding: '10px 4px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--text-1)',
              fontFamily: 'inherit',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
          <GlowButton mood={mood} size="md" style={{ alignSelf: 'center' }}>
            Generate
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, opacity: 0.7, fontSize: 11 }}>✦ 48</span>
          </GlowButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 50 }}>
          {['Script', 'A/B Test', 'Thumbnail', 'Variations'].map(g => (
            <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
          <div style={{ flex: 1 }} />
          <Chip icon={<span style={{ opacity: 0.7 }}>⌗</span>}>Tone</Chip>
          <Chip icon={<span style={{ opacity: 0.7 }}>◐</span>}>Format</Chip>
          <Chip icon={<span style={{ opacity: 0.7 }}>⚙</span>}>Advanced</Chip>
        </div>
      </div>
    </div>
  );
}

function ToolGrid({ mood }) {
  const tools = [
    { id: 'script', name: 'Script Generator', desc: 'Hooks, ad copy, short-form video scripts', mood: 'navy', new: false },
    { id: 'ab', name: 'A/B Tests', desc: 'Compare hooks, CTAs, layouts side-by-side', mood: 'burgundy', new: false },
    { id: 'thumb', name: 'Thumbnail Lab', desc: 'Generate visual directions with emotional tone', mood: 'ember', new: true },
    { id: 'var', name: 'Variation Engine', desc: 'Regen tone, format, energy without losing context', mood: 'violet', new: false },
  ];
  return (
    <div style={{ padding: '36px 56px 32px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <Eyebrow>Tools · pick your entry</Eyebrow>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Or start from a project →</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {tools.map(t => {
          const tm = MOODS[t.mood];
          return (
            <Card key={t.id} className="sheen" style={{ padding: 18, minHeight: 168, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${tm.accentFrom}, ${tm.accentTo})`,
                boxShadow: `0 0 18px ${tm.accentGlow}`,
                display: 'grid', placeItems: 'center',
                color: '#0b0710', fontWeight: 700, fontSize: 14,
              }}>
                {t.id === 'script' ? '⌁' : t.id === 'ab' ? 'A/B' : t.id === 'thumb' ? '◫' : '✺'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  {t.new && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 5px', borderRadius: 4, background: 'rgba(217,255,74,0.16)', color: '#D9FF4A', letterSpacing: '0.08em' }}>NEW</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>{t.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
                <span>OPEN</span>
                <span style={{ fontSize: 14 }}>→</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RecentRow() {
  const items = [
    { tag: 'A/B · 4 variants', title: '"Last pair before they\'re gone"', meta: '2h ago · Atlas Sneaker', perf: 92 },
    { tag: 'Script · 60s UGC', title: 'Mom-bun energy: bag drop reveal', meta: '5h ago · Atlas Sneaker', perf: 78 },
    { tag: 'Thumbnail · 6 picks', title: 'iOS app launch — sunrise variants', meta: 'Yesterday · App Promo', perf: 84 },
  ];
  return (
    <div style={{ padding: '0 56px 48px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <Eyebrow>Picked up where you left off</Eyebrow>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>View all →</div>
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: 4 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 200px 60px 28px',
            alignItems: 'center', gap: 16,
            padding: '12px 16px',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{it.tag}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{it.meta}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: it.perf >= 85 ? '#B7F96A' : 'var(--text-2)' }}>{it.perf}</div>
            <div style={{ fontSize: 14, color: 'var(--text-3)' }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeScreen({ mood = 'burgundy', headline, eyebrow = 'Marketing Studio' }) {
  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <Sidebar active="home" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar mood={mood} crumbs={['Workspace', 'Home']} />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <HomeHero mood={mood} headline={headline} eyebrow={eyebrow} />
          <PromptDock mood={mood} />
          <ToolGrid mood={mood} />
          <RecentRow />
        </div>
      </div>
    </div>
  );
}

window.HomeBurgundy = () => <HomeScreen mood="burgundy" eyebrow="Marketing Studio · v3.2" headline={<>Turn one brief into <span style={{ background: 'linear-gradient(135deg, #FF4D8D, #FF9CC2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>a hundred shippable ads</span>.</>} />;

window.HomeNavy = () => <HomeScreen mood="navy" eyebrow="Marketing Studio · v3.2" headline={<>Generate, test, ship — <span style={{ background: 'linear-gradient(135deg, #8FD8FF, #4D7CFE)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>at the speed of thought</span>.</>} />;

window.HomeViolet = () => <HomeScreen mood="violet" eyebrow="Marketing Studio · v3.2" headline={<>The creative OS for <span style={{ background: 'linear-gradient(135deg, #A78BFA, #7B61FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>marketers who ship daily</span>.</>} />;

// ─────────────────────────────────────────────────────────────────────────────
// 4. SCRIPT GENERATOR — working generate flow with claude.complete
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_SCRIPT = [
  { t: 'HOOK · 0:00–0:03', body: "I bought this $90 shoe and now I won't run in anything else." },
  { t: 'PROBLEM · 0:03–0:07', body: "Every other trainer I tried killed my arches by mile three. So I tested fourteen brands." },
  { t: 'REVEAL · 0:07–0:14', body: "Atlas Mach. Stack height of a max-cushion. Weight of a racer. The geometry is wild." },
  { t: 'PROOF · 0:14–0:22', body: "Half-marathon Sunday — three minutes off my PR. Knees fine. Calves fine. Stupid grin? Yes." },
  { t: 'CTA · 0:22–0:30', body: "Link in bio. Sizes are bleeding fast. Don't @ me when they're gone." },
];

function ScriptGeneratorScreen() {
  const mood = 'navy';
  const m = MOODS[mood];
  const [prompt, setPrompt] = React.useState('Atlas Mach trainer — 30s UGC, "secretly-the-best" angle, end on urgency');
  const [state, setState] = React.useState('idle'); // idle | loading | done
  const [script, setScript] = React.useState(FALLBACK_SCRIPT);
  const [tone, setTone] = React.useState('Confident');
  const [format, setFormat] = React.useState('30s UGC');

  async function generate() {
    setState('loading');
    try {
      const out = await window.claude.complete({
        messages: [{
          role: 'user',
          content: `You are a senior performance-marketing copywriter. Write a ${format} video ad script for: "${prompt}". Tone: ${tone}. Return STRICT JSON array, exactly 5 objects with keys "t" (timecode label like "HOOK · 0:00–0:03") and "body" (one short sentence, no fluff). No markdown, no preamble.`
        }]
      });
      // try parse JSON in output
      const match = out.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length) {
          setScript(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      // fallback stays
    }
    setState('done');
  }

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <Sidebar active="script" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar mood={mood} crumbs={['Workspace', 'Atlas Sneaker Drop', 'Script']} />

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', position: 'relative', overflow: 'hidden' }}>
          <AmbientBloom mood={mood} intensity={0.5} variant="subtle" />

          {/* Left: brief panel */}
          <div style={{
            borderRight: '1px solid var(--stroke-1)',
            padding: '24px 22px',
            display: 'flex', flexDirection: 'column', gap: 18,
            position: 'relative', zIndex: 1,
            background: 'rgba(7,9,14,0.4)',
            backdropFilter: 'blur(12px)',
            overflow: 'auto',
          }}>
            <div>
              <Eyebrow>01 · Brief</Eyebrow>
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500 }}>What are we making?</div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{
                  marginTop: 8, width: '100%', minHeight: 88,
                  padding: 12, borderRadius: 12,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--stroke-1)',
                  color: 'var(--text-1)',
                  fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
                  resize: 'none', outline: 'none',
                }}
              />
            </div>

            <div>
              <Eyebrow>02 · Format</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {['15s Hook', '30s UGC', '60s Story', 'Static caption'].map(f => (
                  <Chip key={f} active={format === f} onClick={() => setFormat(f)}>{f}</Chip>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>03 · Tone</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {['Confident', 'Friendly', 'Provocative', 'Deadpan', 'Hyped'].map(t => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>{t}</Chip>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>04 · References</Eyebrow>
              <div className="glass" style={{ marginTop: 10, padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="checker" style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface-2)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>atlas-brand-voice.md</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>4.2 KB · attached</div>
                </div>
                <span style={{ color: 'var(--text-4)' }}>×</span>
              </div>
              <button style={{
                marginTop: 8, width: '100%',
                padding: '10px', borderRadius: 10,
                background: 'transparent',
                border: '1px dashed var(--stroke-2)',
                color: 'var(--text-3)',
                fontFamily: 'inherit', fontSize: 12,
                cursor: 'pointer',
              }}>+ Add brand asset</button>
            </div>

            <div style={{ flex: 1 }} />

            <GlowButton mood={mood} size="lg" onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
              {state === 'loading' ? (
                <>
                  <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} className="spin" />
                  Generating
                </>
              ) : (
                <>Generate script <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, opacity: 0.7, fontSize: 11 }}>✦ 48</span></>
              )}
            </GlowButton>
          </div>

          {/* Right: script output */}
          <div style={{ position: 'relative', zIndex: 1, padding: '24px 36px', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <Eyebrow mood={mood} glow>Draft 03 · {format} · {tone.toLowerCase()}</Eyebrow>
                <h2 className="display" style={{ fontSize: 32, margin: '6px 0 0' }}>The Atlas Mach script.</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Chip>↻ Regenerate</Chip>
                <Chip>⇆ A/B test</Chip>
                <Chip>↗ Export</Chip>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {state === 'loading' ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass" style={{ padding: 18, borderRadius: 14, display: 'flex', gap: 14 }}>
                    <div className="shimmer" style={{ width: 96, height: 14, borderRadius: 4 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div className="shimmer" style={{ width: '78%', height: 12, borderRadius: 4 }} />
                      <div className="shimmer" style={{ width: '52%', height: 12, borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              ) : (
                script.map((line, i) => (
                  <div key={i} className="glass lift" style={{
                    padding: 18, borderRadius: 14,
                    display: 'grid', gridTemplateColumns: '140px 1fr 30px', gap: 18, alignItems: 'start',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: m.accentFrom, letterSpacing: '0.06em', paddingTop: 4 }}>{line.t}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text-1)' }}>{line.body}</div>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 14 }}>↻</button>
                  </div>
                ))
              )}
            </div>

            {state !== 'loading' && (
              <div className="glass" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={84} size={36} mood={mood} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Hook strength</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>Pattern interrupt + specificity</div>
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--stroke-1)', margin: '0 4px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={91} size={36} mood="lime" />
                  <div>
                    <div style={{ fontWeight: 500 }}>Voice match</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>Atlas brand · 91% fit</div>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <Chip>See analysis →</Chip>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScriptGeneratorScreen = ScriptGeneratorScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 5. VARIATIONS / REGEN
// ─────────────────────────────────────────────────────────────────────────────
const VARIANT_SEEDS = [
  { tone: 'Confident', energy: 'High', body: '"You won\'t run in another shoe after this. I tested fourteen brands. Atlas Mach won by three minutes."', score: 86, pinned: true },
  { tone: 'Friendly',  energy: 'Mid',  body: '"Okay, hear me out — I\'ve been switching trainers for months. This is the one I actually keep wearing."', score: 78 },
  { tone: 'Provocative', energy: 'High', body: '"Your $200 trainer is a marketing scam. This $90 one ran circles around it on Sunday."', score: 81 },
  { tone: 'Deadpan',   energy: 'Low',  body: '"Bought a shoe. Ran a half. PR dropped. That\'s it. That\'s the post."', score: 73 },
];

function VariationsScreen() {
  const mood = 'violet';
  const m = MOODS[mood];
  const [variants, setVariants] = React.useState(VARIANT_SEEDS);
  const [tone, setTone] = React.useState('Mixed');
  const [energy, setEnergy] = React.useState('Mid');
  const [format, setFormat] = React.useState('30s UGC');
  const [regenIdx, setRegenIdx] = React.useState(null);

  async function regen(i) {
    setRegenIdx(i);
    try {
      const out = await window.claude.complete({
        messages: [{
          role: 'user',
          content: `Rewrite this ad hook in a fresh way. Tone: ${variants[i].tone}. Energy: ${variants[i].energy}. Keep it under 22 words, one sentence, conversational. Return ONLY the new line, no quotes, no preamble.\n\nOriginal: ${variants[i].body}`
        }]
      });
      const clean = out.trim().replace(/^["']|["']$/g, '');
      if (clean.length > 8) {
        const next = [...variants];
        next[i] = { ...next[i], body: '"' + clean + '"', score: Math.min(95, next[i].score + Math.floor(Math.random()*9)-3) };
        setVariants(next);
      }
    } catch(e) {}
    setRegenIdx(null);
  }

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <Sidebar active="variations" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar mood={mood} crumbs={['Workspace', 'Atlas Sneaker Drop', 'Variations']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '28px 36px' }}>
          <AmbientBloom mood={mood} intensity={0.45} variant="subtle" />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <Eyebrow mood={mood} glow>Variation engine</Eyebrow>
              <StepDots step={2} total={4} mood={mood} />
            </div>
            <h2 className="display" style={{ fontSize: 38, margin: '6px 0 0' }}>Four directions, one source line.</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 8, maxWidth: 560 }}>
              Same hook, four creative bets. Pin what's working and regen the rest until the slate feels alive.
            </p>

            <div className="glass" style={{ marginTop: 22, padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="eyebrow">Tone</span>
                {['Mixed', 'Confident', 'Friendly', 'Deadpan'].map(t => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>{t}</Chip>
                ))}
              </div>
              <div style={{ width: 1, height: 22, background: 'var(--stroke-1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="eyebrow">Energy</span>
                {['Low', 'Mid', 'High'].map(e => (
                  <Chip key={e} active={energy === e} onClick={() => setEnergy(e)}>{e}</Chip>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <Chip>↻ Regen unpinned (3)</Chip>
              <GlowButton mood={mood} size="sm">Send to A/B test →</GlowButton>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 18 }}>
              {variants.map((v, i) => (
                <Card key={i} mood={mood} glow={v.pinned} style={{
                  padding: 20,
                  borderColor: v.pinned ? 'rgba(167,139,250,0.4)' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>V.0{i+1}</span>
                    <Chip>{v.tone}</Chip>
                    <Chip>{v.energy}</Chip>
                    <div style={{ flex: 1 }} />
                    {v.pinned && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: m.accentFrom, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.accentFrom, boxShadow: `0 0 6px ${m.accentGlow}` }} />
                        PINNED
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: 'var(--text-1)', minHeight: 78 }}>
                    {regenIdx === i ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="shimmer" style={{ height: 16, width: '90%', borderRadius: 4 }} />
                        <div className="shimmer" style={{ height: 16, width: '75%', borderRadius: 4 }} />
                        <div className="shimmer" style={{ height: 16, width: '60%', borderRadius: 4 }} />
                      </div>
                    ) : v.body}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <ScoreRing score={v.score} size={38} mood={mood} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Predicted CTR</div>
                      <div className="score-bar" style={{ '--accent-from': m.accentFrom, '--accent-to': m.accentTo, '--accent-glow': m.accentGlow, marginTop: 4 }}>
                        <div className="score-bar-fill" style={{ width: `${v.score}%` }}/>
                      </div>
                    </div>
                    <button onClick={() => regen(i)} disabled={regenIdx !== null} style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--stroke-1)',
                      color: 'var(--text-2)', cursor: 'pointer',
                      display: 'grid', placeItems: 'center',
                    }}>↻</button>
                    <button onClick={() => {
                      const next = [...variants]; next[i] = { ...next[i], pinned: !next[i].pinned }; setVariants(next);
                    }} style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: v.pinned ? `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` : 'var(--surface-2)',
                      border: '1px solid ' + (v.pinned ? 'transparent' : 'var(--stroke-1)'),
                      color: v.pinned ? '#0b0710' : 'var(--text-2)', cursor: 'pointer',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 600,
                    }}>◆</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.VariationsScreen = VariationsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 6. A/B TEST — working vote picker
// ─────────────────────────────────────────────────────────────────────────────
function ABTestScreen() {
  const mood = 'burgundy';
  const m = MOODS[mood];
  const [votes, setVotes] = React.useState({ A: 124, B: 96 });
  const [picked, setPicked] = React.useState(null);

  function vote(side) {
    setPicked(side);
    setVotes(v => ({ ...v, [side]: v[side] + 1 }));
  }

  const total = votes.A + votes.B;
  const pctA = Math.round(votes.A / total * 100);
  const pctB = 100 - pctA;
  const leadingSide = pctA >= pctB ? 'A' : 'B';

  const sides = {
    A: {
      tag: 'Hook A · Specificity',
      headline: '"$90 shoe. Half-marathon Sunday. Three minutes off my PR."',
      meta: 'Confident · 30s UGC',
      stats: { ctr: '4.2%', cpc: '$0.81', score: 86 },
    },
    B: {
      tag: 'Hook B · Pattern interrupt',
      headline: '"Your $200 trainer is a marketing scam."',
      meta: 'Provocative · 30s UGC',
      stats: { ctr: '3.7%', cpc: '$0.94', score: 79 },
    },
  };

  return (
    <div className="artboard-root" style={{ display: 'flex' }}>
      <Sidebar active="abtest" mood={mood} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar mood={mood} crumbs={['Workspace', 'Atlas Sneaker Drop', 'A/B · Hook test']} />

        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AmbientBloom mood={mood} intensity={0.7} />

          <div style={{ position: 'relative', zIndex: 1, padding: '34px 48px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow mood={mood} glow>A/B test · live</Eyebrow>
                <h2 className="display" style={{ fontSize: 38, margin: '6px 0 0' }}>Which hook is winning?</h2>
                <p style={{ color: 'var(--text-3)', fontSize: 13.5, marginTop: 6 }}>
                  220 internal previews collected · 14h running · auto-promote when confidence &gt; 95%
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Chip>Pause</Chip>
                <Chip>Settings</Chip>
                <GlowButton mood={mood} size="sm">Promote winner →</GlowButton>
              </div>
            </div>

            {/* Score bar comparing the two */}
            <div className="glass-strong" style={{ marginTop: 22, padding: 18, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                <span>HOOK A · {pctA}%</span>
                <span style={{ color: m.accentFrom }}>{leadingSide === 'A' ? 'A leading' : 'B leading'} by {Math.abs(pctA - pctB)}pt</span>
                <span>HOOK B · {pctB}%</span>
              </div>
              <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-2)' }}>
                <div style={{
                  width: `${pctA}%`,
                  background: `linear-gradient(90deg, ${m.accentFrom}, ${m.accentTo})`,
                  boxShadow: `0 0 16px ${m.accentGlow}`,
                  transition: 'width 0.6s cubic-bezier(0.2,0.7,0.3,1)',
                }} />
                <div style={{
                  width: `${pctB}%`,
                  background: `linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))`,
                  transition: 'width 0.6s cubic-bezier(0.2,0.7,0.3,1)',
                }} />
              </div>
            </div>

            {/* Two big variant cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
              {['A', 'B'].map(side => {
                const s = sides[side];
                const isLeading = side === leadingSide;
                return (
                  <div key={side} className="glass-strong" style={{
                    padding: 24, borderRadius: 18,
                    position: 'relative', overflow: 'hidden',
                    border: '1px solid ' + (picked === side ? 'rgba(255,77,141,0.5)' : 'var(--stroke-2)'),
                    boxShadow: picked === side ? `0 0 0 1px ${m.accentFrom}, 0 20px 60px ${m.accentGlow}` : undefined,
                    transition: 'all 0.3s',
                  }}>
                    {isLeading && (
                      <div style={{
                        position: 'absolute', top: 14, right: 14,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 999,
                        background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`,
                        color: '#0b0710', fontSize: 10.5, fontWeight: 700,
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                        boxShadow: `0 0 16px ${m.accentGlow}`,
                      }}>
                        ◆ LEADING
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: isLeading ? `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` : 'var(--surface-2)',
                        color: isLeading ? '#0b0710' : 'var(--text-1)',
                        display: 'grid', placeItems: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                      }}>{side}</div>
                      <Eyebrow>{s.tag}</Eyebrow>
                    </div>

                    <div className="display" style={{ fontSize: 28, lineHeight: 1.15, marginTop: 18, minHeight: 130 }}>{s.headline}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>{s.meta}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, padding: 14, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--stroke-1)' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CTR</div>
                        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.stats.ctr}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CPC</div>
                        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.stats.cpc}</div>
                      </div>
                      <div style={{ flex: 1 }} />
                      <ScoreRing score={s.stats.score} mood={mood} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button onClick={() => vote(side)} style={{
                        flex: 1, height: 40, borderRadius: 12,
                        background: picked === side
                          ? `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})`
                          : 'var(--surface-2)',
                        color: picked === side ? '#0b0710' : 'var(--text-1)',
                        border: '1px solid ' + (picked === side ? 'transparent' : 'var(--stroke-2)'),
                        fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: picked === side ? `0 0 24px ${m.accentGlow}` : 'none',
                        transition: 'all 0.2s',
                      }}>
                        {picked === side ? '◆ Picked' : 'Pick this'}
                      </button>
                      <button style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--stroke-1)',
                        color: 'var(--text-2)', cursor: 'pointer',
                      }}>↻</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* footer comparison strip */}
            <div className="glass" style={{ marginTop: 18, padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 18, fontSize: 12.5 }}>
              <span className="eyebrow">Insights</span>
              <span>Hook A's specificity ("$90", "three minutes") outperforms on cold audiences (+18% CTR).</span>
              <div style={{ flex: 1 }} />
              <Chip>See full analysis →</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ABTestScreen = ABTestScreen;
