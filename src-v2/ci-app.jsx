// ContentIntel -- main app

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typeSet": "grotesk",
  "density": "regular",
  "bloomIntensity": 1,
  "homeAccent": "burgundy"
}/*EDITMODE-END*/;

function CIApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = useCITheme();
  const [tab, setTab] = React.useState('home');
  const [keyOpen, setKeyOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [hasKey, setHasKey] = React.useState(!!window.getKey());
  const [admin, setAdmin] = React.useState(window.isAdmin());
  const [gateStep, setGateStep] = React.useState(() => {
    try { if (new URLSearchParams(location.search).get('admin')) return null; } catch (e) {}
    return (window.ciGateDone && window.ciGateDone()) ? null : 'welcome';
  });

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


  const activeMood = tab === 'home' ? t.homeAccent
    : (window.CI_TABS.find(x => x.id === tab) || {}).mood
    || ((window.CI_MORE_TABS || []).includes(tab) ? 'lime' : 'burgundy');

  function nav(id) {
    setTab(id);
    document.querySelector('.ci-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  function openKey() { setKeyOpen(true); }
  function closeKey(changed) { setKeyOpen(false); if (changed) setHasKey(!!window.getKey()); }
  function onAdmin() { nav('research'); }
  function exitResearch() { setAdmin(window.isAdmin()); nav('home'); }

  // If unlocked via ?admin=... on this browser, jump straight to the editor.
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
  else if (tab === 'ask') View = <AskTab onOpenKey={openKey} />;
  else if (tab === 'pricing') View = <PricingTab onNav={nav} />;
  else if (tab === 'more') View = <MoreHub onNav={nav} />;
  else if (tab === 'builder') View = <BuilderTab />;
  else if (tab === 'platform') View = <PlatformTab />;
  else if (tab === 'playbook') View = <PlaybookTab />;
  else if (tab === 'history') View = <HistoryTab />;
  else if (tab === 'research') View = admin ? <ResearchTab onClose={exitResearch} onNav={nav} /> : <HomeView onNav={nav} onOpenKey={openKey} hasKey={hasKey} />;
  else if (tab === 'train') View = admin ? <TrainTab onClose={exitResearch} onNav={nav} onOpenKey={openKey} /> : <HomeView onNav={nav} onOpenKey={openKey} hasKey={hasKey} />;

  // Preload all videos into the browser cache on first mount
  React.useEffect(() => {
    const urls = Object.values(window.CI_VIDEOS || {}).filter(Boolean);
    urls.forEach(url => {
      const v = document.createElement('video');
      v.src = url;
      v.preload = 'auto';
      v.muted = true;
    });
  }, []);

  // Dismiss splash screen once app is mounted
  React.useEffect(() => {
    const el = document.getElementById('ci-splash');
    if (!el) return;
    const t = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => { try { el.remove(); } catch(e){} }, 600);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  const V = window.CI_VIDEOS || {};
  const ambientDark  = V.ambientDark  || '';
  const ambientLight = V.ambientLight || V.ambientDark || '';
  const onTool = tab !== 'home';

  if (gateStep === 'welcome') {
    return <AuthGate onAuthed={() => setGateStep('pricing')} />;
  }
  if (gateStep === 'pricing') {
    return (
      <div className="ci-app">
        <div className="ci-scroll" style={{ minHeight: '100vh', paddingTop: 40 }}>
          <PricingTab gate onSkip={() => setGateStep(null)} onNav={nav} />
        </div>
      </div>
    );
  }

  return (
    <div className="ci-app">
      <TopNav active={tab} onNav={nav} mood={activeMood}
        onOpenKey={openKey} onAdmin={onAdmin} onAccount={() => setAccountOpen(true)} hasKey={hasKey} admin={admin} />
      <KeyModal open={keyOpen} onClose={closeKey} />
      {window.AccountModal && <window.AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} onNav={nav} />}

      {/* Ambient videos: ALWAYS mounted so the browser never reloads them on tab switch.
          Visibility is controlled by opacity + CSS transition only. */}
      {ambientDark && (
        <video src={ambientDark} autoPlay muted loop playsInline
          style={{ position:'fixed', inset:0, width:'100%', height:'100%', objectFit:'cover',
                   pointerEvents:'none', zIndex:0,
                   opacity: onTool && theme !== 'light' ? 0.08 : 0,
                   transition: 'opacity 0.7s ease' }} />
      )}
      {ambientLight && (
        <video src={ambientLight} autoPlay muted loop playsInline
          style={{ position:'fixed', inset:0, width:'100%', height:'100%', objectFit:'cover',
                   pointerEvents:'none', zIndex:0,
                   opacity: onTool && theme === 'light' ? 0.05 : 0,
                   transition: 'opacity 0.7s ease' }} />
      )}

      <div className="ci-scroll" style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
        {onTool && (
          <div style={{ position: 'fixed', top: 60, left: 0, right: 0, height: '60vh', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }}>
            <AmbientBloom mood={activeMood} intensity={0.5} variant="subtle" />
          </div>
        )}
        {View}
      </div>

      {admin && (
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
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CIApp />);
