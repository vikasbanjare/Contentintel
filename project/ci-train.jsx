// ContentIntel — Train from thumbnails (admin-only).
// Drop up to 500 reference thumbnails → batched vision analysis → aggregate the
// design patterns → synthesize an updated playbook → merge into the research
// library (private draft). The owner then Downloads research.js to publish.
//
// Requires an Anthropic API key (vision). The free preview AI cannot see images.

const TRAIN_MAX = 500;
const TRAIN_DOWNSCALE_W = 640; // thumbnails are judged small; downscale to cut tokens/cost/memory

// Read a file → downscaled JPEG { mime, data(base64), preview, name }
function trainReadImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read failed"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, TRAIN_DOWNSCALE_W / (img.width || TRAIN_DOWNSCALE_W));
        const w = Math.max(1, Math.round((img.width || TRAIN_DOWNSCALE_W) * scale));
        const h = Math.max(1, Math.round((img.height || TRAIN_DOWNSCALE_W) * scale));
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const url = c.toDataURL("image/jpeg", 0.82);
        resolve({ mime: "image/jpeg", data: url.split(",")[1] || "", preview: url, name: file.name });
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

// Limited-concurrency pool. Errors are captured per item, never thrown.
async function trainPool(items, worker, concurrency, onProgress) {
  let idx = 0, done = 0;
  const results = new Array(items.length);
  async function next() {
    const i = idx++;
    if (i >= items.length) return;
    try { results[i] = await worker(items[i], i); }
    catch (e) { results[i] = { __error: String(e && e.message || e) }; }
    onProgress(++done, items.length);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

function trainParseLoose(text) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence) t = fence[1].trim();
  const s = Math.min(...["[", "{"].map(c => { const k = t.indexOf(c); return k < 0 ? 1e9 : k; }));
  const e = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
  if (s < 1e9 && e !== -1) t = t.slice(s, e + 1);
  try { return JSON.parse(t); } catch (e1) {
    try { return JSON.parse(t.replace(/,\s*([}\]])/g, "$1")); } catch (e2) { return null; }
  }
}

// ── Aggregate per-image records into frequency stats ─────────────────────────
function trainAggregate(records, niche) {
  const ok = records.filter(r => r && !r.__error && typeof r === "object");
  const tally = {};
  const bump = (k, v) => { if (v == null || v === "") return; (tally[k] = tally[k] || {})[v] = (tally[k][v] || 0) + 1; };
  let faces = 0, arrows = 0, numHooks = 0, wordSum = 0, wordN = 0;
  const powerWords = {}, badges = {}, hooks = [];
  ok.forEach(r => {
    bump("layout", r.layout); bump("colorScheme", r.colorScheme); bump("faceExpression", r.faceExpression);
    if (r.hasFace) faces++; if (r.hasArrow) arrows++;
    if (r.numberHook && String(r.numberHook).toLowerCase() !== "none") numHooks++;
    if (typeof r.wordCount === "number") { wordSum += r.wordCount; wordN++; }
    (r.powerWords || []).forEach(w => { if (w) powerWords[w] = (powerWords[w] || 0) + 1; });
    (r.badges || []).forEach(b => { if (b) badges[b] = (badges[b] || 0) + 1; });
    if (r.textHook) hooks.push(r.textHook);
  });
  const n = ok.length || 1;
  const top = (obj, k = 8) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, k);
  return {
    niche, n: ok.length, errors: records.length - ok.length,
    layouts: top(tally.layout || {}), colorSchemes: top(tally.colorScheme || {}),
    faceExpressions: top(tally.faceExpression || {}),
    withFacePct: Math.round((faces / n) * 100), withArrowPct: Math.round((arrows / n) * 100),
    numberHookPct: Math.round((numHooks / n) * 100), avgWordCount: wordN ? +(wordSum / wordN).toFixed(1) : null,
    powerWords: top(powerWords, 12), badges: top(badges, 6), sampleHooks: hooks.slice(0, 24),
  };
}

// ── Component ────────────────────────────────────────────────────────────────
function TrainTab({ onClose, onNav, onOpenKey }) {
  const mood = "violet";
  const m = window.MOODS[mood];
  const TLib = window.getResearch("thumbnail") || {};
  const layoutNames = (TLib.layouts || []).map(x => x.name);
  const schemeNames = (TLib.colorSchemes || []).map(x => x.name);

  const [files, setFiles] = React.useState([]);     // {mime,data,preview,name}
  const [niche, setNiche] = React.useState("Business / startup case-study (Indian)");
  const [notes, setNotes] = React.useState("");
  const [batch, setBatch] = React.useState(6);
  const [phase, setPhase] = React.useState("idle"); // idle|reading|running|synth|done|error
  const [prog, setProg] = React.useState({ done: 0, total: 0 });
  const [stats, setStats] = React.useState(null);
  const [synth, setSynth] = React.useState(null);   // {summary, provenPatterns, designPrinciples, layoutsToAdd, colorSchemesToAdd}
  const [append, setAppend] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const hasKey = !!window.getKey();
  const estCost = window.estCost(files.length * 1300 + 1200, files.length * 40 + 1500, window.getModel());

  async function onPick(fileList) {
    const arr = Array.from(fileList || []).slice(0, TRAIN_MAX);
    setErr(""); setPhase("reading"); setProg({ done: 0, total: arr.length });
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      try { out.push(await trainReadImage(arr[i])); } catch (e) {}
      setProg({ done: i + 1, total: arr.length });
    }
    setFiles(out); setPhase("idle");
  }

  function classifySystem() {
    return [
      "You are a precise thumbnail DESIGN ANALYST. You receive one or more images labelled Image 1, Image 2, …",
      "For EACH image, extract its design features. Classify `layout` and `colorScheme` using ONLY one of the allowed names below, or \"other\" if none fit.",
      "ALLOWED LAYOUTS: " + (layoutNames.join(" | ") || "(none)"),
      "ALLOWED COLOUR SCHEMES: " + (schemeNames.join(" | ") || "(none)"),
      'Return ONLY a JSON array (no markdown, no prose), one object per image in order:',
      '[{"i":1,"layout":"<name|other>","colorScheme":"<name|other>","textHook":"<main on-image text, verbatim, or empty>","wordCount":<int>,"hasFace":true,"faceCount":<int>,"faceExpression":"<smiling|shock|serious|neutral|none>","hasArrow":true,"badges":["100K+ VIEWS"],"powerWords":["King"],"numberHook":"<e.g. 900 Crore | $10,000 | none>","notes":"<one short phrase>"}]',
      "Be literal about what is visible. Do not invent text that is not there.",
    ].join("\n");
  }

  async function start() {
    if (!hasKey) { setErr("Bulk training needs your own Anthropic API key (the free preview AI can't see images). Add it in Settings."); return; }
    if (!files.length) { setErr("Add some thumbnails first."); return; }
    setErr(""); setStats(null); setSynth(null); setPhase("running");
    // chunk into groups
    const chunks = [];
    for (let i = 0; i < files.length; i += batch) chunks.push(files.slice(i, i + batch));
    let imagesDone = 0; setProg({ done: 0, total: files.length });
    const sys = classifySystem();
    const chunkResults = await trainPool(chunks, async (chunk) => {
      const { text } = await window.callClaude({
        system: sys,
        userText: `Analyze these ${chunk.length} thumbnail(s). Niche/context: ${niche || "(unspecified)"}. Return the JSON array.`,
        images: chunk, maxTokens: 220 * chunk.length + 400,
      });
      const arr = trainParseLoose(text);
      return Array.isArray(arr) ? arr : (arr ? [arr] : []);
    }, 2, (d) => { /* per-chunk */ });
    // flatten, tracking progress by images
    const records = [];
    chunkResults.forEach((res, ci) => {
      const chunk = chunks[ci];
      if (res && res.__error) { chunk.forEach(() => records.push({ __error: res.__error })); }
      else { const a = res || []; chunk.forEach((f, k) => records.push(Object.assign({ name: f.name }, a[k] || { __error: "no record" }))); }
      imagesDone += chunk.length; setProg({ done: imagesDone, total: files.length });
    });
    const agg = trainAggregate(records, niche);
    setStats(agg);
    // synthesize
    setPhase("synth");
    try {
      const synthSys = [
        "You are a thumbnail STRATEGIST. From aggregated feature statistics of analyzed TOP-PERFORMING thumbnails in a niche, write updated research that another AI will use to score and regenerate thumbnails in that niche.",
        "Base everything ONLY on the stats provided; cite the key frequencies (e.g. 'face in 80%'). Be concrete and directly actionable.",
        'Return ONLY JSON: {"summary":"2-3 sentences","provenPatterns":"a niche-scoped playbook: layout, colours, text/number formula, power words, badges, tone — numbered, directly usable","designPrinciples":"6-10 bullet lines","layoutsToAdd":[{"name":"","what":""}],"colorSchemesToAdd":[{"name":"","what":""}]}',
        "layoutsToAdd / colorSchemesToAdd: ONLY archetypes/schemes that recur in the stats but are NOT already in this list — else return empty arrays. Existing layouts: " + (layoutNames.join(" | ")) + ". Existing schemes: " + (schemeNames.join(" | ")) + ".",
      ].join("\n");
      const { text } = await window.callClaude({
        system: synthSys,
        userText: "Niche: " + niche + "\nOwner notes (e.g. which were winners): " + (notes || "(none)") + "\n\nAGGREGATED STATS (JSON):\n" + JSON.stringify(agg, null, 2),
        maxTokens: 1600,
      });
      const obj = trainParseLoose(text) || {};
      setSynth({
        summary: obj.summary || "",
        provenPatterns: obj.provenPatterns || "",
        designPrinciples: obj.designPrinciples || "",
        layoutsToAdd: Array.isArray(obj.layoutsToAdd) ? obj.layoutsToAdd : [],
        colorSchemesToAdd: Array.isArray(obj.colorSchemesToAdd) ? obj.colorSchemesToAdd : [],
      });
      setPhase("done");
    } catch (e) { setErr("Synthesis failed: " + (e.message || e)); setPhase("error"); }
  }

  function mergeByName(existing, additions) {
    const out = [...(existing || [])];
    (additions || []).forEach(a => { if (a && a.name && !out.some(x => x.name === a.name)) out.push({ name: a.name, what: a.what || "" }); });
    return out;
  }
  function saveToResearch() {
    if (!synth) return;
    const cur = JSON.parse(JSON.stringify(window.__CI_RESEARCH_OVERRIDE || window.CI_RESEARCH || {}));
    cur.thumbnail = cur.thumbnail || {};
    const stamp = `\n\n— ${niche} (n=${stats ? stats.n : files.length}, trained ${new Date().toISOString().slice(0, 10)}) —\n`;
    cur.thumbnail.provenPatterns = append && cur.thumbnail.provenPatterns
      ? (cur.thumbnail.provenPatterns + "\n" + stamp + synth.provenPatterns)
      : (stamp.trim() + "\n" + synth.provenPatterns);
    if (synth.designPrinciples) cur.thumbnail.designPrinciples = synth.designPrinciples;
    cur.thumbnail.layouts = mergeByName(cur.thumbnail.layouts, synth.layoutsToAdd);
    cur.thumbnail.colorSchemes = mergeByName(cur.thumbnail.colorSchemes, synth.colorSchemesToAdd);
    window.saveLocalResearch(cur);
    setMsg("Merged into your private research draft — your thumbnail analyses use it now. Open Research → Download research.js to publish to everyone.");
    setTimeout(() => setMsg(""), 7000);
  }

  const busy = phase === "reading" || phase === "running" || phase === "synth";
  const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;

  return (
    <div className="ci-work wide" style={{ "--ci-accent": m.accentFrom, "--ci-glow": m.accentGlow }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Eyebrow mood={mood} glow>Admin · train</Eyebrow>
          <h2 className="ci-h2">Train from thumbnails</h2>
          <p className="ci-sub" style={{ marginTop: 8, maxWidth: 680 }}>
            Drop up to {TRAIN_MAX} reference thumbnails (ideally proven top-performers in one niche). The app analyses them in batches with image vision, aggregates the design patterns, and writes an updated playbook into your research library.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onNav && <button className="ci-copybtn" style={{ height: 34 }} onClick={() => onNav("research")}>Open Research →</button>}
          <button className="ci-copybtn" style={{ height: 34 }} onClick={onClose}>Exit</button>
        </div>
      </div>

      {!hasKey && (
        <div className="ci-block" style={{ marginBottom: 14, border: "1px solid rgba(240,200,90,0.3)", background: "rgba(240,200,90,0.07)" }}>
          <b style={{ fontSize: 13.5 }}>Bulk training needs your API key.</b>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>
            Image vision only works on your own Anthropic key (the free preview AI is text-only). <button className="ci-copybtn" style={{ height: 30, marginLeft: 6 }} onClick={onOpenKey}>Open Settings</button>
          </div>
        </div>
      )}

      <Block title="1 · Reference thumbnails" mood={mood}>
        <label htmlFor="train-drop" className="ci-drop" style={{ minHeight: 120, flexDirection: "column", gap: 8, cursor: "pointer" }}>
          <input id="train-drop" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => onPick(e.target.files)} />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" /></svg>
          <span>{files.length ? `${files.length} image${files.length > 1 ? "s" : ""} loaded — click to replace` : `Drop or select up to ${TRAIN_MAX} thumbnails`}</span>
        </label>
        {phase === "reading" && <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 8 }}>Loading & downscaling… {prog.done}/{prog.total}</div>}
        {files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {files.slice(0, 60).map((f, i) => <img key={i} src={f.preview} alt="" style={{ width: 64, height: 36, objectFit: "cover", borderRadius: 5, opacity: 0.9 }} />)}
            {files.length > 60 && <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>+{files.length - 60} more</span>}
          </div>
        )}
      </Block>

      <Block title="2 · Context" mood={mood}>
        <label className="ci-label">Niche / context (one cohesive set trains best)</label>
        <input className="ci-input" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. Finance explainer (Hindi) · Gaming · Beauty tutorials" />
        <label className="ci-label" style={{ marginTop: 12 }}>Owner notes (optional) — e.g. which were the biggest winners, CTR, what to weight</label>
        <textarea className="ci-textarea" style={{ minHeight: 60 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. The 900 Crore one did 2M+; the no-text one flopped…" />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <label className="ci-label" style={{ margin: 0 }}>Images per request</label>
          <select className="ci-input" style={{ width: 90, appearance: "auto" }} value={batch} onChange={e => setBatch(+e.target.value)}>
            {[4, 6, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{files.length} imgs · ~{Math.ceil(files.length / batch)} requests · est. ~{window.fmtCost(estCost)}</span>
        </div>
      </Block>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 16px", flexWrap: "wrap" }}>
        <GlowButton mood={mood} size="lg" onClick={start} disabled={busy || !files.length}>
          {busy ? (phase === "synth" ? "Synthesizing playbook…" : phase === "running" ? `Analyzing ${prog.done}/${prog.total}…` : "Loading…") : "Start training →"}
        </GlowButton>
        {busy && phase !== "reading" && (
          <div style={{ flex: "1 1 200px", maxWidth: 320 }}>
            <div style={{ height: 8, borderRadius: 5, background: "var(--surface-2)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: pct + "%", background: m.accentFrom, transition: "width .3s" }} />
            </div>
          </div>
        )}
        {err && <span style={{ fontSize: 12.5, color: "#f5788c", maxWidth: 420, lineHeight: 1.4 }}>{err}</span>}
      </div>

      {stats && (
        <Block title="Aggregated patterns" desc={`${stats.n} analyzed${stats.errors ? ` · ${stats.errors} failed` : ""}`} mood={mood}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, fontSize: 13 }}>
            <StatList title="Layouts" items={stats.layouts} n={stats.n} />
            <StatList title="Colour schemes" items={stats.colorSchemes} n={stats.n} />
            <StatList title="Face expressions" items={stats.faceExpressions} n={stats.n} />
            <StatList title="Power words" items={stats.powerWords} n={stats.n} />
            <StatList title="Badges" items={stats.badges} n={stats.n} />
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Headline signals</div>
              <div style={{ color: "var(--text-3)", lineHeight: 1.8 }}>
                Face: <b style={{ color: "var(--text-1)" }}>{stats.withFacePct}%</b><br />
                Arrow: <b style={{ color: "var(--text-1)" }}>{stats.withArrowPct}%</b><br />
                Number hook: <b style={{ color: "var(--text-1)" }}>{stats.numberHookPct}%</b><br />
                Avg words: <b style={{ color: "var(--text-1)" }}>{stats.avgWordCount ?? "—"}</b>
              </div>
            </div>
          </div>
        </Block>
      )}

      {synth && (
        <>
          {synth.summary && (
            <Block mood={mood} style={{ background: `linear-gradient(135deg, ${m.orbC}55, var(--surface-1))`, border: `1px solid ${m.accentGlow}` }}>
              <Eyebrow mood={mood} glow>What this set teaches</Eyebrow>
              <div style={{ fontSize: 15, lineHeight: 1.55, marginTop: 8, color: "var(--text-1)" }}>{synth.summary}</div>
            </Block>
          )}
          <Block title="Proven-patterns playbook (editable)" desc="Goes into thumbnail.provenPatterns — the analyzer scores & regenerates against this for this niche." mood={mood}>
            <textarea className="ci-textarea" style={{ minHeight: 200, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6 }}
              value={synth.provenPatterns} onChange={e => setSynth(s => ({ ...s, provenPatterns: e.target.value }))} />
          </Block>
          <Block title="Design principles (editable)" desc="Replaces thumbnail.designPrinciples." mood={mood}>
            <textarea className="ci-textarea" style={{ minHeight: 150, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6 }}
              value={synth.designPrinciples} onChange={e => setSynth(s => ({ ...s, designPrinciples: e.target.value }))} />
          </Block>
          {(synth.layoutsToAdd.length > 0 || synth.colorSchemesToAdd.length > 0) && (
            <Block title="New library entries to add" mood={mood}>
              {synth.layoutsToAdd.map((x, i) => <div key={"l" + i} style={{ fontSize: 13, color: "var(--text-2)", padding: "4px 0" }}><b>Layout · {x.name}</b> — {x.what}</div>)}
              {synth.colorSchemesToAdd.map((x, i) => <div key={"c" + i} style={{ fontSize: 13, color: "var(--text-2)", padding: "4px 0" }}><b>Colour · {x.name}</b> — {x.what}</div>)}
            </Block>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-2)" }}>
              <input type="checkbox" checked={append} onChange={e => setAppend(e.target.checked)} /> Append to existing patterns (keep other niches)
            </label>
            <GlowButton mood={mood} onClick={saveToResearch}>Save to research (private)</GlowButton>
            {onNav && <button className="ci-copybtn" style={{ height: 38 }} onClick={() => onNav("research")}>Open Research to publish →</button>}
          </div>
          {msg && <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 10, maxWidth: 560, lineHeight: 1.5 }}>{msg}</div>}
        </>
      )}
    </div>
  );
}

function StatList({ title, items, n }) {
  if (!items || !items.length) return null;
  return (
    <div>
      <div style={{ fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>{title}</div>
      {items.map(([k, c], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "var(--text-3)", padding: "2px 0" }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
          <b style={{ color: "var(--text-1)" }}>{Math.round((c / (n || 1)) * 100)}%</b>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { TrainTab });

