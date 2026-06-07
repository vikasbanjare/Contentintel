// ContentIntel -- Platform IQ tab
// Mosseri AMA + YouTube algorithm data (2024-2026)

const { MOODS: PLM, Block: PLB, WorkHead: PLWH } = window;

// ── Data ──────────────────────────────────────────────────────────────────────

const MOSSERI_CARDS = [
  { n:"1",  title:"Top 3 Ranking Signals (Jan 2025)",          highlight:false, source:"Mosseri, January 2025",
    body:"Watch Time (#1 across all surfaces), Sends per Reach (DM shares -- 3-5x more valuable for new audiences), Likes per Reach. Applies to Feed, Reels, Stories and Explore." },
  { n:"2",  title:"Watch Time -- Users Decide in 1.7 Seconds", highlight:false, source:"Meta internal data, 2025",
    body:"Meta internal data: users make stay/scroll decision in 1.7 seconds. Aim for 60%+ hold rate at the 3-second mark. Strong hooks outperform weak hooks by 5-10x in total reach." },
  { n:"3",  title:"DM Shares -- 3-5x More Valuable Than Likes",highlight:false, source:"Mosseri + Metricool 2025",
    body:"694K Reels sent via DM every minute (Metricool 2025). Create 'send this to someone who...' moments. Shares signal genuine human connection -- the strongest signal for non-follower reach." },
  { n:"4",  title:"The Audition System -- How Reels Distribute", highlight:false, source:"Instagram internal system, 2025",
    body:"Post → small non-follower test group → strong performance → wider audition. Peak visibility 6-12 hours after posting. First 30-60 minutes = most critical window. Do not post and go to sleep." },
  { n:"5",  title:"Trial Reels -- Test Before Full Publish",    highlight:false, source:"Instagram data + Mosseri, Feb 2026",
    body:"Shown to non-followers only. 40% of creators who use it post more Reels. 80% see increased non-follower reach. Now schedulable (Feb 2026). Compare only to other Trial Reels." },
  { n:"6",  title:"'Your Algorithm' Feature -- Dec 2025",       highlight:false, source:"Mosseri, December 2025",
    body:"Users can add/remove topics from Reels recommendations. Biggest structural shift to Reels in years. Niche consistency and topic clarity are now critical. Settings → Content Preferences." },
  { n:"7",  title:"Reposts Penalty -- 10 = Banned From Recs",  highlight:false, source:"Instagram policy, 2025",
    body:"10+ reposts within any 30-day window = completely excluded from ALL recommendations (Explore, Reels for non-followers, suggested posts). Strictly enforced. No exceptions." },
  { n:"8",  title:"Carousels = Highest Engagement Format 2026", highlight:false, source:"Buffer data + Instagram, 2026",
    body:"Up to 20 slides. Reshown to users who did not see all slides = multiple impression opportunities per post. First slide = hook. Buffer data (4M+ posts): carousels consistently outperform single images." },
  { n:"9",  title:"Stories -- Hard Cap at 5-7 Per Session",     highlight:false, source:"Mosseri",
    body:"View counts drop after the 5th Story in a session. Do not directly boost post reach but maintain follower warmth. Stickers, polls, questions increase replies = algorithmic boost. Best time: 8-10 AM India." },
  { n:"10", title:"AI Translations = Reach Multiplier",         highlight:false, source:"Mosseri, late 2025",
    body:"Auto-translates Reels captions + audio to Hindi, Portuguese, English, Spanish. Mosseri specifically called this out as a reach tactic. Hindi content now reaches global Indian diaspora automatically." },
  { n:"11", title:"Captions Are An Official Ranking Factor",    highlight:false, source:"Mosseri confirmed",
    body:"Mosseri listed captions as an official Reels ranking factor. Most users watch sound-off. Captions also help Instagram AI correctly categorize content for recommendations. Easiest improvement -- zero extra effort." },
  { n:"12", title:"Original Content Gets 40-60% More Distribution", highlight:false, source:"Mosseri year-end memo, Dec 31 2025",
    body:"Dec 31 2025 Mosseri memo: Instagram will prioritize raw, real human content over AI-generated material throughout 2026. Reposts receive significantly less algorithmic push." },
  { n:"13", title:"Instagram Is Now A Search Engine",           highlight:false, source:"Mosseri",
    body:"Instagram reads captions like Google reads page copy. Keywords in captions, titles, alt text, on-screen text all feed the search algorithm. Keyword-rich captions beat vague ones in search distribution." },
  { n:"14", title:"Hashtags Changed Function",                  highlight:false, source:"Mosseri confirmed 2024-2025",
    body:"Hashtags = minor topic signals for Instagram AI -- NOT discovery tools. Following hashtags removed December 2024. Use 3-5 highly relevant max. Focus on keyword-rich captions instead. 30-hashtag stacking hurts." },
  { n:"15", title:"Comments Are Searchable Too",                highlight:false, source:"Mosseri",
    body:"Instagram now understands comment context around posts. Ask specific questions to generate quality responses. Threaded conversations carry significant algorithmic weight." },
  { n:"16", title:"Shares > Likes. Always.",                    highlight:false, source:"Mosseri",
    body:"Instagram calls shares 'bringing people together' and heavily rewards it. Opinions outperform information. Relatable > educational when it comes to shareability. 'Send this to someone who...' is the most powerful CTA." },
  { n:"17", title:"5 Rules For Recommendation Eligibility",     highlight:false, source:"Instagram policy",
    body:"(1) No watermarks from other platforms, (2) Must include audio, (3) Under 3 minutes, (4) Original content not reposted, (5) No community guideline violations. Break any rule = follower-only distribution." },
  { n:"18", title:"Private Sharing Is The New Viral",           highlight:false, source:"Mosseri",
    body:"DMs, group chats, Stories sharing growing faster than public sharing. Most content travels privately before it goes public. Optimize for person-to-person shareability." },
  { n:"19", title:"Feed Posts Still Matter",                    highlight:false, source:"Mosseri",
    body:"Main feed remains critically important. Do not go Reels-only. Carousels still drive high saves and deep engagement. Creators who went Reels-only saw follower relationship quality decline." },
  { n:"20", title:"The Mosseri Playbook -- One Sentence",       highlight:true,  source:"Adam Mosseri",
    body:"Create content that a stranger can discover through search, watch until the end, and immediately send to a friend. Every strategy decision should pass this test." },
];

const PLAT_SUBTABS = {
  instagram: [
    { k:"reels",     label:"Reels" },
    { k:"stories",   label:"Stories" },
    { k:"carousels", label:"Carousels" },
    { k:"features",  label:"New Features" },
    { k:"seo",       label:"Search & SEO" },
  ],
  youtube: [
    { k:"longform",  label:"Long-form" },
    { k:"shorts",    label:"Shorts" },
    { k:"seo",       label:"SEO & Search" },
    { k:"community", label:"Community" },
  ],
};

const PLAT_QUICK_Q = {
  instagram: {
    reels:     ["Best Reel length for finance content?","How does Trial Reels work?","Hook strategy for first 3 seconds?","Should I add captions to all Reels?","How many Reels per week?","Best time to post Reels in India?"],
    stories:   ["How many Stories per day?","Do Stories boost Reel reach?","Best stickers for engagement?","When to post Stories in India?","Polls vs questions -- which works better?"],
    carousels: ["How many slides is optimal?","First slide strategy?","Carousels vs Reels for reach?","How to get saves on carousels?","Educational carousel structure for finance?"],
    features:  ["What is the 'Your Algorithm' feature?","How to use Trial Reels effectively?","How does AI translation boost reach?","How to reset Instagram recommendations?"],
    seo:       ["How to use keywords in captions?","Hashtag strategy for 2025-2026?","How does Instagram search work now?","Alt text strategy on Instagram?","How to write comments that help SEO?"],
  },
  youtube: {
    longform:  ["Ideal video length for finance content?","Hook strategy for YouTube?","Pattern interrupt tips to reduce drop-off?","How to use end screens and cards?","Best upload time in India?"],
    shorts:    ["Does posting Shorts help my main channel?","Should I cross-post Reels as Shorts?","Best Shorts length for discovery?","Hook in first second -- tips?","When do Shorts go viral?"],
    seo:       ["Keyword in title -- where exactly?","YouTube description best practices?","Do tags still matter?","How to use chapter timestamps?","How to rank a finance video in India?"],
    community: ["How to use Community posts for growth?","Best types of Community posts?","Do polls outperform text posts?","How often to post in Community tab?","How to grow engagement via comments?"],
  },
};

const ANALYTICS_GUIDE = {
  instagram: [
    { signal:"Low reach despite posting",        problem:"10+ reposts = banned from recommendations",   fix:"Stop reposting for 30 days, post original content only" },
    { signal:"Low sends per reach",              problem:"Content not opinionated or relatable enough", fix:"Add more personal opinions, use 'send this to someone who...' CTA" },
    { signal:"Stories views declining",          problem:"Posting too many stories",                    fix:"Cap at 5-7 per session. Never more." },
    { signal:"Reels not reaching non-followers", problem:"Watermark, no audio, or topic unclear",       fix:"Remove watermarks, add audio, pick clear niche topic" },
    { signal:"Low saves",                        problem:"No clear reference/value to save",            fix:"Switch to carousels with step-by-step content" },
    { signal:"High impressions, low reach",      problem:"Content not recommended beyond followers",    fix:"Check all 5 eligibility rules. Improve hook for audition system." },
  ],
  youtube: [
    { signal:"Low CTR (under 2%)",               problem:"Thumbnail or title mismatch",                 fix:"A/B test thumbnail and title separately" },
    { signal:"Low AVD (under 30%)",              problem:"Hook or pacing problem",                      fix:"Tighten first 30 seconds. Add pattern interrupt every 2-3 min." },
    { signal:"High impressions, low views",      problem:"Title/thumbnail not compelling",              fix:"Realign thumbnail promise with title. Research competitor thumbnails." },
    { signal:"Low Shorts completion",            problem:"Hook too slow",                               fix:"Fix first 1-2 seconds. Start with a result or shock statement." },
    { signal:"High watch time, low subscribers", problem:"Weak end screen / subscribe CTA",             fix:"Add explicit subscribe ask at 70% mark and in end screen" },
    { signal:"Shorts not getting views",         problem:"Shorts can go viral weeks later",             fix:"Wait 2-3 weeks before judging Shorts performance. Never delete." },
  ],
};

const POSTING_TIMES = {
  instagram: {
    reels:     ["7-9 AM IST","12-2 PM IST","7-9 PM IST"],
    stories:   ["8-10 AM IST"],
    best_days: ["Tuesday","Wednesday","Thursday","Friday"],
    finance:   ["Monday mornings (salary anxiety)","Friday evenings (weekend investing mood)"],
  },
  youtube: {
    longform: ["Sat-Sun 10 AM-12 PM IST","Weekdays 6-8 PM IST"],
    shorts:   ["12-2 PM IST","6-8 PM IST"],
    finance:  ["Monday-Wednesday (investing decision mood)"],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

function PlatformTimeRow({ label, times }) {
  if (!times || !times.length) return null;
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
      <div style={{ fontSize:12, fontWeight:700, color:"var(--text-4)", minWidth:110, paddingTop:3 }}>{label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {times.map(function(t, i) {
          return (
            <span key={i} style={{ padding:"3px 11px", borderRadius:20, background:"rgba(0,0,0,0.2)", border:"1px solid var(--stroke-1)", fontSize:12, color:"var(--text-2)" }}>{t}</span>
          );
        })}
      </div>
    </div>
  );
}

function PlatformTab() {
  var mood = "violet";
  var m = PLM[mood];

  var platRes = window.getResearch ? (window.getResearch("platform") || {}) : {};
  var platSys = platRes.systemGuidance || "You are a platform strategy expert for Indian content creators. Answer with bullet points, 5-7 points max. Give India-specific, actionable advice.";

  var rPlat  = React.useState("instagram");
  var plat   = rPlat[0]; var setPlat = rPlat[1];

  var rSub   = React.useState("reels");
  var sub    = rSub[0]; var setSub = rSub[1];

  var rQ     = React.useState("");
  var q      = rQ[0]; var setQ = rQ[1];

  var rState = React.useState("idle");
  var askState = rState[0]; var setAskState = rState[1];

  var rAns   = React.useState("");
  var answer = rAns[0]; var setAnswer = rAns[1];

  var rErr   = React.useState("");
  var askErr = rAns[0]; var setAskErr = rErr[1];

  React.useEffect(function() {
    var tabs = PLAT_SUBTABS[plat] || [];
    if (tabs.length) setSub(tabs[0].k);
  }, [plat]);

  function ask(question) {
    var qText = (question || q || "").trim();
    if (!qText) return;
    if (question) setQ(question);
    setAskState("loading"); setAnswer(""); setAskErr("");
    window.callClaude({ system: platSys, userText: qText, maxTokens: 700 })
      .then(function(res) { setAnswer(res.text || ""); setAskState("done"); })
      .catch(function(e) {
        if (String(e.message) === "NO_KEY") { setAskState("nokey"); return; }
        setAskErr(e.message || "Something went wrong.");
        setAskState("error");
      });
  }

  var subtabs = PLAT_SUBTABS[plat] || [];
  var quickQs = ((PLAT_QUICK_Q[plat] || {})[sub]) || [];
  var analyticsRows = ANALYTICS_GUIDE[plat] || [];
  var times = POSTING_TIMES[plat] || {};
  var platLabel = plat === "instagram" ? "Instagram" : "YouTube";

  return (
    <div className="ci-work" style={{ "--ci-accent": m.accentFrom, "--ci-glow": m.accentGlow }}>
      <PLWH mood={mood} eyebrow="Platform IQ"
        title="Instagram and YouTube intelligence"
        sub="Algorithm facts confirmed by Mosseri and YouTube 2024-2026. Click a quick question or type your own." />

      {/* Platform picker */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["instagram","youtube"].map(function(p) {
          var active = plat === p;
          return (
            <button key={p} className="pill" onClick={function() { return setPlat(p); }}
              style={{ height:40, padding:"0 22px", fontWeight:700, fontSize:13.5,
                background: active ? m.accentFrom + "1a" : "transparent",
                borderColor: active ? m.accentGlow : "var(--stroke-1)",
                color: active ? m.accentFrom : "var(--text-3)" }}>
              {p === "instagram" ? "Instagram" : "YouTube"}
            </button>
          );
        })}
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
        {subtabs.map(function(t) {
          var active = sub === t.k;
          return (
            <button key={t.k} className="pill" onClick={function() { return setSub(t.k); }}
              style={{ height:32, fontSize:12.5, padding:"0 14px",
                background: active ? m.accentFrom + "15" : "transparent",
                borderColor: active ? m.accentGlow : "var(--stroke-1)",
                color: active ? m.accentFrom : "var(--text-4)" }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Ask section */}
      <PLB mood={mood} title="Ask a question" desc="Click a quick question below or type your own">

        {quickQs.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {quickQs.map(function(qq, i) {
              return (
                <button key={i} onClick={function() { return ask(qq); }}
                  style={{ height:30, padding:"0 13px", borderRadius:20, border:"1px solid var(--stroke-1)", background:"transparent", color:"var(--text-3)", fontSize:12, cursor:"pointer" }}>
                  {qq}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display:"flex", gap:8 }}>
          <input className="ci-input" style={{ flex:1 }} value={q}
            onChange={function(e) { return setQ(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") ask(); }}
            placeholder={"Ask anything about " + platLabel + " algorithm, growth or strategy..."} />
          <button className="ci-copybtn"
            style={{ height:44, padding:"0 18px", background:m.accentFrom + "18", borderColor:m.accentGlow, color:m.accentFrom, fontWeight:700, fontSize:13, flexShrink:0, opacity: askState === "loading" ? 0.6 : 1 }}
            onClick={function() { return ask(); }} disabled={askState === "loading"}>
            {askState === "loading" ? "Asking..." : "Ask"}
          </button>
        </div>

        {askState === "loading" && (
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, color:"var(--text-4)", fontSize:13 }}>
            <span style={{ display:"inline-block", width:12, height:12, border:"2px solid currentColor", borderRightColor:"transparent", borderRadius:"50%" }} className="spin" />
            Thinking...
          </div>
        )}

        {askState === "done" && answer && (
          <div style={{ marginTop:14, padding:"15px 16px", borderRadius:12, background:"rgba(0,0,0,0.22)", border:"1px solid " + m.accentGlow + "30", fontSize:13.5, color:"var(--text-1)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
            <div style={{ fontSize:11, color:m.accentFrom, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Answer</div>
            {answer}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="ci-copybtn" style={{ height:28, fontSize:11.5 }}
                onClick={function() { if (window.copyText) window.copyText(answer); }}>Copy</button>
              <button className="ci-copybtn" style={{ height:28, fontSize:11.5 }}
                onClick={function() { setAskState("idle"); setAnswer(""); }}>Clear</button>
            </div>
          </div>
        )}

        {askState === "nokey" && (
          <window.FreeModeHint system={platSys} userText={q} />
        )}

        {askState === "error" && (
          <div style={{ marginTop:10, fontSize:13, color:"#f5788c" }}>{askErr}</div>
        )}
      </PLB>

      {/* Mosseri 20 Cards */}
      <details className="ci-block ci-collapse" style={{ padding:0, marginTop:4 }}>
        <summary style={{ cursor:"pointer", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", fontWeight:700, fontSize:14, color:"var(--text-1)" }}>
          <span>Adam Mosseri -- 20 Confirmed Insights (2024-2026)</span>
          <span style={{ opacity:0.4, fontSize:11.5 }}>tap to open</span>
        </summary>
        <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          {MOSSERI_CARDS.map(function(card) {
            return (
              <div key={card.n} style={{ padding:"12px 14px", borderRadius:10,
                background: card.highlight ? m.accentFrom + "12" : "rgba(0,0,0,0.18)",
                border: "1px solid " + (card.highlight ? m.accentGlow : "var(--stroke-1)") }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:m.accentFrom, minWidth:22, marginTop:2 }}>{card.n}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13.5, color:"var(--text-1)", marginBottom:4 }}>{card.title}</div>
                    <div style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65 }}>{card.body}</div>
                    <div style={{ fontSize:10.5, color:"var(--text-5)", marginTop:5 }}>Source: {card.source}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Analytics troubleshooter */}
      <details className="ci-block ci-collapse" style={{ padding:0, marginTop:4 }}>
        <summary style={{ cursor:"pointer", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", fontWeight:700, fontSize:14, color:"var(--text-1)" }}>
          <span>Analytics troubleshooter -- {platLabel}</span>
          <span style={{ opacity:0.4, fontSize:11.5 }}>tap to open</span>
        </summary>
        <div style={{ padding:"0 16px 16px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 3fr 3fr", gap:6, marginBottom:8, padding:"0 4px" }}>
            {["Signal","Problem","Fix"].map(function(h) {
              return <div key={h} style={{ fontSize:10, fontWeight:700, color:"var(--text-5)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>;
            })}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {analyticsRows.map(function(row, i) {
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"3fr 3fr 3fr", gap:8, padding:"10px 12px", borderRadius:10, background:"rgba(0,0,0,0.15)", border:"1px solid var(--stroke-1)" }}>
                  <div style={{ fontSize:12.5, color:"var(--text-2)", lineHeight:1.5 }}>{row.signal}</div>
                  <div style={{ fontSize:12.5, color:"var(--text-3)", lineHeight:1.5 }}>{row.problem}</div>
                  <div style={{ fontSize:12.5, color:"#8FD86A", lineHeight:1.5 }}>{row.fix}</div>
                </div>
              );
            })}
          </div>
        </div>
      </details>

      {/* Posting times */}
      <PLB mood={mood} title={"Best posting times -- " + platLabel + " (India IST)"}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {plat === "instagram" ? (
            <>
              <PlatformTimeRow label="Reels" times={times.reels} />
              <PlatformTimeRow label="Stories" times={times.stories} />
              <PlatformTimeRow label="Best days" times={times.best_days} />
              <PlatformTimeRow label="Finance" times={times.finance} />
            </>
          ) : (
            <>
              <PlatformTimeRow label="Long-form" times={times.longform} />
              <PlatformTimeRow label="Shorts" times={times.shorts} />
              <PlatformTimeRow label="Finance" times={times.finance} />
            </>
          )}
        </div>
      </PLB>

    </div>
  );
}

window.PlatformTab = PlatformTab;

