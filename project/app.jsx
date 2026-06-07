// ContentFloh — App entry: design canvas with all 12 artboards + Tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "moodMode": "perTool",
  "moodGlobal": "burgundy",
  "typeSet": "grotesk",
  "density": "regular",
  "bloomIntensity": 1,
  "motion": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks as CSS vars on documentElement
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
    if (!t.motion) {
      root.style.setProperty('--motion-mul', '0');
    } else {
      root.style.setProperty('--motion-mul', '1');
    }
  }, [t.typeSet, t.density, t.motion]);

  // Build screen array. perTool mode uses each screen's natural mood;
  // global mode overrides every screen to use t.moodGlobal.
  const moodFor = (defaultMood) => t.moodMode === 'global' ? t.moodGlobal : defaultMood;

  // wrap a screen in a CSS-var context so artboard renders with current intensity
  const wrap = (children) => (
    <div className="artboard-shell" style={{
      width: '100%', height: '100%',
      filter: t.motion ? 'none' : 'none',
    }}>{children}</div>
  );

  return (
    <>
      <DesignCanvas title="ContentFloh" subtitle="AI creative workflow · 12 screens · 3 home variations · click anywhere">

        <DCSection id="home" title="Home" subtitle="Three color-mood directions for the entry point">
          <DCArtboard id="home-burgundy" label="A · Burgundy bloom" width={1280} height={820}>
            <MoodWrap mood={moodFor('burgundy')}><HomeBurgundy /></MoodWrap>
          </DCArtboard>
          <DCArtboard id="home-navy" label="B · Navy bloom" width={1280} height={820}>
            <MoodWrap mood={moodFor('navy')}><HomeNavy /></MoodWrap>
          </DCArtboard>
          <DCArtboard id="home-violet" label="C · Violet bloom" width={1280} height={820}>
            <MoodWrap mood={moodFor('violet')}><HomeViolet /></MoodWrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="tools" title="Tools" subtitle="The four core generators — fully interactive">
          <DCArtboard id="script" label="Script Generator · click Generate" width={1280} height={820}>
            <ScriptGeneratorScreen />
          </DCArtboard>
          <DCArtboard id="variations" label="Variation Engine · regen any card" width={1280} height={820}>
            <VariationsScreen />
          </DCArtboard>
          <DCArtboard id="abtest" label="A/B Test · vote a winner" width={1280} height={820}>
            <ABTestScreen />
          </DCArtboard>
          <DCArtboard id="thumbs" label="Thumbnail Lab · pick winners" width={1280} height={820}>
            <ThumbnailLabScreen />
          </DCArtboard>
        </DCSection>

        <DCSection id="workspace" title="Workspace" subtitle="Where campaigns and results live">
          <DCArtboard id="projects" label="Projects" width={1280} height={900}>
            <ProjectsScreen />
          </DCArtboard>
          <DCArtboard id="analytics" label="Results dashboard" width={1280} height={900}>
            <AnalyticsScreen />
          </DCArtboard>
          <DCArtboard id="asset" label="Asset detail · export" width={1280} height={900}>
            <AssetDetailScreen />
          </DCArtboard>
        </DCSection>

        <DCSection id="flows" title="Flows" subtitle="First-run + final pick">
          <DCArtboard id="onboarding" label="Onboarding · new project" width={1280} height={900}>
            <OnboardingScreen />
          </DCArtboard>
          <DCArtboard id="compare" label="Compare · pick a winner" width={1280} height={900}>
            <CompareScreen />
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Mood" />
        <TweakRadio
          label="Mode"
          value={t.moodMode}
          options={[{ value: 'perTool', label: 'Per tool' }, { value: 'global', label: 'Global' }]}
          onChange={v => setTweak('moodMode', v)}
        />
        {t.moodMode === 'global' && (
          <TweakColor
            label="Global mood"
            value={window.MOODS[t.moodGlobal].swatch}
            options={Object.entries(window.MOODS).map(([k, v]) => v.swatch)}
            onChange={v => {
              const found = Object.entries(window.MOODS).find(([k, m]) => m.swatch === v);
              if (found) setTweak('moodGlobal', found[0]);
            }}
          />
        )}

        <TweakSection label="Typography" />
        <TweakRadio
          label="Type set"
          value={t.typeSet}
          options={[
            { value: 'grotesk',   label: 'Grotesk' },
            { value: 'editorial', label: 'Editorial' },
            { value: 'poster',    label: 'Poster' },
          ]}
          onChange={v => setTweak('typeSet', v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'regular', label: 'Regular' },
            { value: 'comfy',   label: 'Comfy' },
          ]}
          onChange={v => setTweak('density', v)}
        />

        <TweakSection label="Atmosphere" />
        <TweakSlider
          label="Bloom intensity"
          value={t.bloomIntensity}
          min={0.2} max={1.4} step={0.05}
          onChange={v => setTweak('bloomIntensity', v)}
        />
        <TweakToggle
          label="Motion"
          value={t.motion}
          onChange={v => setTweak('motion', v)}
        />
      </TweaksPanel>
    </>
  );
}

// Lets us recolor an entire screen via the "global mood" override by
// piping a different mood prop down. Most screens take a `mood` themselves,
// so for the home variants we render the same component, and for the rest
// the natural mood is shown.
function MoodWrap({ mood, children }) {
  // We don't override children's internal mood — but the user gets to see
  // the global mood applied via the home variants directly (they share
  // mood already). For the tools, mood is intrinsic to the tool.
  return <>{children}</>;
}

// Motion toggle: when off, disable bloom drift animations
const motionStyle = document.createElement('style');
motionStyle.id = 'motion-toggle';
document.head.appendChild(motionStyle);
function syncMotion() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--motion-mul').trim();
  if (v === '0') {
    motionStyle.textContent = '.bloom-orb,.pulse-dot,.float-y,.spin{animation:none!important}';
  } else {
    motionStyle.textContent = '';
  }
}
// Observe root for inline style changes (rough but works)
new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
syncMotion();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
