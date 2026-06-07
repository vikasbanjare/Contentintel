// ContentIntel — main app

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typeSet": "grotesk",
  "density": "regular",
  "bloomIntensity": 1,
  "homeAccent": "burgundy"
}/*EDITMODE-END*/;

function CIApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [focusMode, setFocusMode] = React.useState(false);
  const [keyOpen, setKeyOpen] = React.useState(false);
  const [hasKey, setHasKey] = React.useState(!!window.getKey());
  const [admin, setAdmin] = React.useState(window.isAdmin());

  React.useEffect(() => {
    const root = document.documentElement;
    const type = window.TYPES[t.typeSet] || window.TYPES.grotesk;
    root.style.setProperty('--font-display', type.display);
    root.style.setProperty('--font-ui', type.ui);
    root.style.setProperty('--font-mono', type.mono);
    root.style.setProperty('--display-tracking', type.displayTracking);
    root.style.setProperty('--display-case', type.displayCaps ? 'uppercase' : 'none');
    const d = window.DENSITIES[t.density] || window.DENSITIES.regular;
    root.style.setProperty('--ui-size', d.ui + 'px');
    root.style.setProperty('--bloom-mul', t.bloomIntensity);
  }, [t.typeSet, t.density, t.bloomIntensity]);

  // focus mode dims ambient bloom
  React.useEffect(() => {
    let el = document.getElementById('ci-focus-style');
    if (!el) { el = document.createElement('style'); el.id = 'ci-focus-style'; document.head.appendChild(el); }
    el.textContent = focusMode ? '.bloom-orb,.ci-hero-video{opacity:0.12 !important}.ci-hero-scrim{background:#07090E !important}' : '';
  }, [focusMode]);

  const activeMood = tab === 'home' ? t.homeAccent
    : (window.CI_TABS.find(x => x.id === tab) || {}).mood || 'burgundy';

  function nav(id) {
    setTab(id);
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  function openKey() { setKeyOpen(true); }
  function closeKey(changed) { setKeyOpen(false); if (changed) setHasKey(!!window.getKey()); }
  function onAdmin() { nav('research'); }
  function exitResearch() { setAdmin(window.isAdmin()); nav('home'); }

  // If unlocked via ?admin=… on this browser, jump straight to the editor.
  React.useEffect(() => {
    try {
      if (window.isAdmin() && new URLSearchParams(location.search).get('admin')) { setAdmin(true); setTab('research'); }
    } catch (e) {}
  }, []);

  let View = null;
  if (tab === 'home') View = <HomeView onNav={nav} onOpenKey={openKey} hasKey={hasKey} />;
  else if (tab === 'script') View = <ScriptTab onOpenKey={openKey} />;
  else if (tab === 'thumbnail') View = <ThumbnailTab onOpenKey={openKey} />;
  else if (tab === 'title') View = <TitleTab onOpenKey={openKey} />;
  else if (tab === 'ads') View = <AdsTab onOpenKey={openKey} />;
  else if (tab === 'studio') View = <StudioTab onOpenKey={openKey} />;
  else if (tab === 'playbook') View = <PlaybookTab />;
  else if (tab === 'history') View = <HistoryTab />;
  else if (tab === 'research') View = admin ? <ResearchTab onClose={exitResearch} onNav={nav} /> : <HomeView onNav={nav} onOpenKey={openKey} hasKey={hasKey} />;
  else if (tab === 'train') View = admin ? <TrainTab onClose={exitResearch} onNav={nav} onOpenKey={openKey} /> : <HomeView onNav={nav} onOpenKey={openKey} hasKey={hasKey} />;

  return (
    <div className="ci-app">
      <TopNav active={tab} onNav={nav} mood={activeMood} focusMode={focusMode} onToggleFocus={() => setFocusMode(f => !f)}
        onOpenKey={openKey} onAdmin={onAdmin} hasKey={hasKey} admin={admin} />
      <KeyModal open={keyOpen} onClose={closeKey} />

      <div className="ci-scroll" style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
        {/* ambient bloom for non-home tabs */}
        {tab !== 'home' && (
          <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: '60vh', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }}>
            <AmbientBloom mood={activeMood} intensity={0.5} variant="subtle" />
          </div>
        )}
        {View}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Home accent" />
        <TweakColor
          label="Hero mood"
          value={window.MOODS[t.homeAccent].swatch}
          options={['burgundy', 'navy', 'violet', 'ember'].map(k => window.MOODS[k].swatch)}
          onChange={v => {
            const f = Object.entries(window.MOODS).find(([k, m]) => m.swatch === v);
            if (f) setTweak('homeAccent', f[0]);
          }}
        />

        <TweakSection label="Typography" />
        <TweakRadio label="Type set" value={t.typeSet}
          options={[{ value: 'grotesk', label: 'Grotesk' }, { value: 'editorial', label: 'Editorial' }, { value: 'poster', label: 'Poster' }]}
          onChange={v => setTweak('typeSet', v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'comfy', label: 'Comfy' }]}
          onChange={v => setTweak('density', v)} />

        <TweakSection label="Atmosphere" />
        <TweakSlider label="Bloom intensity" value={t.bloomIntensity} min={0.2} max={1.4} step={0.05}
          onChange={v => setTweak('bloomIntensity', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CIApp />);
