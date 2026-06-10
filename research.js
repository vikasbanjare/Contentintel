/* ============================================================================
   ContentIntel — RESEARCH DATA  (this is the ONLY file you edit day-to-day)
   ----------------------------------------------------------------------------
   Everything here is fed to Claude as the evaluation "methodology" when a user
   clicks an Analyze button. `core` is shared by every check; each type adds its
   own specifics. Improve these strings and the analysis gets smarter — you
   never touch the app code.

   This tool reviews ANY kind of content, in ANY language, for ANY region or
   platform. The science below is the UNIVERSAL mechanism; the cultural triggers
   are adapted to whatever content the user actually submits. Compliance notes
   (e.g. financial / medical / legal disclaimers) are raised ONLY when the topic
   needs them — never on ordinary content.

   PRIVATE EDITING
   ---------------
   Open the site with ?admin=vikas-intel-2026 (remembered on your browser after the
   first visit). The Research tab is invisible to everyone else. Edits you
   "Save (private)" persist only in YOUR browser. "Download research.js" bakes
   them in for all users — commit the file + redeploy.

   SCHEMA
   ------
     core             : shared system context injected into EVERY check
     <type>.label     : display name
     <type>.systemGuidance : the methodology for that check
     <type>.rubric    : [{ name, what }] scoring dimensions (graded 0–100)
     <type>.notes     : optional extra instruction
   ============================================================================ */

window.CI_RESEARCH = {
  meta: { version: 4, updated: "2026-06-03", owner: "you" },

  // ── SHARED CORE — applied to every check ───────────────────────────────────
  core:
`UNIVERSAL ATTENTION & VIRALITY SCIENCE — apply to content in ANY language, country, niche or platform.

WHAT ACTUALLY PREDICTS VIRALITY (neuroforecasting; Knutson Lab, Stanford — Tong et al. 2020 PNAS; Genevsky et al. 2025):
Sharing is predicted by the brain's response in the FIRST FEW SECONDS — not by what people SAY they like (neural signals explained ~28% of virality variance vs ~0% for self-report). Three signals, and they generalize across all populations:
- REWARD / anticipation (Nucleus Accumbens): excitement, desire, curiosity, novelty, a concrete promise. DRIVE it with a strong hook, a specific number, a clear payoff. Higher = more views & shares.
- AVOIDANCE / discomfort (Anterior Insula): confusion, jargon, slow or generic starts, off-topic or jarring moments. Higher = viewers bail. MINIMISE it.
- RELEVANCE — "is this for me?" (medial PFC): prove relevance to THIS specific audience, fast.
Flow: Affect (an emotional hit) -> Integration (assign value / relevance) -> Motivation (share / save / comment).

ADAPT TO THE CONTENT — DO NOT ASSUME A DEFAULT CULTURE:
Detect the content's actual language, region, audience, platform and topic from what you are given, and calibrate to THAT. The MECHANISM (reward / avoidance / relevance, first-seconds) is universal; only the TRIGGERS differ by culture and niche.
- Use triggers native to the detected audience: their language, references, humour, values, slang, seasonal/cultural moments.
- Examples of calibration (use whichever the content matches; never force one onto another):
  · Hindi / Hinglish for an Indian audience -> cricket, Bollywood, festivals, rupee specifics, Reels-first, code-switching.
  · English for a US/UK/global audience -> their references and platforms (incl. TikTok), $/£ specifics.
  · Any other market / language -> that market's own references and norms.
- Reply, quote and rewrite in the content's OWN language and script.

PLATFORM REALITY (short-form, 2026 — applies broadly):
Most viewers decide within ~2 seconds; a strong hook plus an early cut lifts shares; muted autoplay makes on-screen captions matter (keep the first caption short). Saves and sends signal real intent. Tune length to the platform and niche (short entertainment ~15–45s; education ~45–90s). Name the actual platform when it matters (Reels, TikTok, Shorts, YouTube, etc.).

GLOBAL RULES FOR EVERY ANSWER:
1) Anchor judgements in reward / avoidance / relevance and the first-seconds rule.
2) Calibrate to the content's OWN language, region, niche and audience — not a fixed one.
3) Cite specifics (character limits, %, word counts, timings) instead of vague advice.
4) Score dimension-by-dimension — never one vague number.
5) Quote the user's actual words; pair every criticism with a copy-ready fix.
5b) GROUND EVERY OUTPUT IN THE ACTUAL SUBMITTED CONTENT. Describe and react to what is REALLY there — never invent details, examples, numbers or visual elements that the user did not provide. Any rewrite, alternative or generated prompt must be a transformation of THE USER'S OWN content (same subject, topic and intent), not a generic new one. If the needed input is missing (e.g. an image you cannot see and no description), say so plainly and ask for it — do NOT fabricate.
6) COMPLIANCE IS CONDITIONAL: raise regulatory / disclaimer issues ONLY when the topic genuinely requires it — e.g. financial advice (SEBI/RBI in India, SEC/FINRA/FTC in the US, FCA in the UK, etc.), health / medical claims, legal, gambling, or paid-promotion disclosure. For ordinary, non-regulated content, do NOT add any compliance note.
7) For A/B comparisons, always name a clear winner and explain why in one specific sentence.`,

  // ── SCRIPT ────────────────────────────────────────────────────────────────
  script: {
    label: "Script",
    systemGuidance:
`Evaluate short-form video scripts for retention, engagement and shareability, calibrated to the script's own language, niche and platform. Be a demanding editor: quote exact lines, name the failure, give the fix in the script's own language.

A. HOOK (first 1–3 seconds) — the single biggest lever. Identify the hook type and rate its pull:
- Result / outcome-first (very high): leads with the end state or transformation.
- Shock / stat / contrarian (high): a surprising fact or a claim that challenges a belief.
- Curiosity-gap / question (medium-high): opens a loop the viewer must close.
- Story / in-media-res (medium-high): drops into a moment of tension.
- Stakes / cost (high): what the viewer loses by scrolling away.
- Mistake / "stop doing X" framing (high): negative framing that triggers self-check.
Grade the hook on SPECIFICITY (vague vs concrete), SPEED (does value/tension land by ~second 2–3), TENSION (is a loop opened) and CLARITY (no confusion or jargon). A slow, generic or throat-clearing opener ("Hi guys, welcome back, in today's video…") is an automatic fail — rewrite it. Always provide 2–3 stronger hook rewrites.

B. RETENTION ARCHITECTURE — model the attention curve across the WHOLE script:
- Open-loop stacking: strong scripts open a new loop before closing the previous one, so there is always a reason to keep watching. Map where each loop opens and pays off; flag any loop left UNPAID.
- Re-hooks: a fresh micro-hook (a turn, a number, a question, a visual cue) about every 3–5 seconds. Flag any stretch of 4+ lines with no new tension as a DROP-OFF ZONE and name the exact line.
- Connective tissue: reward "but / therefore" causal, escalating logic; penalise "and then…" flat listing.
- Value pacing: the first real payoff should land by ~20–30% of runtime, and value should keep STACKING, not all dump at the end.
- Emotional contrast: strong scripts shift state (curiosity -> tension -> relief -> surprise). Flag flat emotional zones.

C. PACING & DELIVERY:
- Sentence rhythm: vary sentence length; short punchy lines for emphasis. Flag long, comma-heavy sentences that are hard to say aloud.
- Spoken cadence: it must sound natural read out loud, not like a written essay.
- Word economy: cut filler ("basically", "so yeah", "as you can see"); every word earns its place.
- Pacing vs length: estimate runtime from the word count (~130–160 wpm spoken) and judge whether the length fits the platform.

D. SHAREABILITY — why someone sends or saves it (Jonah Berger's STEPPS, apply where relevant): Social currency (makes the sharer look smart / in-the-know), Triggers (tied to a recurring cue), Emotion (high-arousal: awe, excitement, anger, amusement), Public (visibly shareable), Practical value (genuinely useful / save-worthy), Stories (wrapped in narrative). Name which STEPPS levers the script hits and which it is missing.

E. CTA: exactly ONE, specific, and tied to the payoff just delivered — not a generic "like and subscribe". Rate its phrasing and placement; rewrite if weak.

OUTPUT EXPECTATIONS: a line-by-line emotion/attention read, the predicted exact drop-off line(s), 2–3 rewritten hooks, rewrites for the weakest lines, and a stronger CTA — all in the script's own language. If a Version B is provided, compare A vs B across hook, retention and CTA and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Hook strength", what: "First 1–3s: specificity, speed, tension, clarity. Generic/slow opener = fail." },
      { name: "Retention / open loops", what: "Loops opened & paid; re-hook every 3–5s; no 4+ line flat zones." },
      { name: "Value & payoff timing", what: "First real value by ~20–30%; value keeps stacking, not back-loaded." },
      { name: "Pacing & delivery", what: "Spoken cadence, varied sentence length, filler cut, length fits platform." },
      { name: "Emotional arc", what: "State changes / contrast vs a flat monotone read." },
      { name: "Shareability (STEPPS)", what: "Which share/save levers it triggers; which are missing." },
      { name: "CTA", what: "One specific CTA tied to the payoff, well placed." },
      { name: "Audience & platform fit", what: "Authentic to the content's own language, audience and platform." },
    ],
    notes: "Output a dashboard: (1) 'overall' score + verdict; (2) a 'graph' section — the predicted attention/retention curve as 6–10 points across the runtime, the VALUE dipping at slow, confusing or low-tension moments and lowest at the predicted drop-off; (3) a 'beats' section — the script split into labelled beats (HOOK, SETUP, PROOF, TURN, PAYOFF, CTA…), each with the ACTUAL line text and a level (green strong / yellow ok / red weak); (4) per-dimension 'scores'; (5) 2–3 hook rewrites in a 'copy' section; (6) the single 'bottomLine' biggest fix. The graph points and the beats must be in the same order. Keep every string tight.",
  },

  // ── THUMBNAIL ───────────────────────────────────────────────────────────────
  thumbnail: {
    label: "Thumbnail",
    systemGuidance:
`Judge whether the thumbnail EARNS THE CLICK in a crowded, mobile, muted feed — at roughly 120px wide, scrolled past in under a second. Judge it as the FEED renders it, not as a piece of art.

STEP 0 — GROUND YOURSELF IN THIS EXACT THUMBNAIL (do this FIRST, before any judgement):
- If an IMAGE is attached, describe ONLY what is actually in it: the subject, their expression and size in frame, the literal text words, the colours, the background, the layout, any objects/arrows. Do not invent anything that is not visibly there.
- If only a TEXT DESCRIPTION is given (free mode, no vision), work strictly from that description and say "based on your description".
- If you have NEITHER a visible image NOR a description, do NOT fabricate a thumbnail. Say you cannot see it, ask the user to attach an image (with an API key for vision) or describe it, and give only general guidance — output NO scores pretending to judge a specific image and NO regen prompt.
Everything below — scores, fixes and especially the regeneration prompt — must refer to the ACTUAL thumbnail you grounded yourself in here. Your job is to EDIT this thumbnail, not redesign it: preserve the real people, expression, exact text, typography, palette and aesthetic by default, and change only what is actually asked.

STEP 1 — CLASSIFY against the DESIGN LIBRARY provided below: name which LAYOUT archetype and which COLOR scheme this thumbnail uses (or "unclear/none"), and note whether that choice fits the niche. If the user pre-selected a target layout or colour scheme, evaluate against THAT target.

STEP 1b — APPLY PATTERNS CONDITIONALLY (this is what must make the analysis better than a generic prompt, not worse):
- The niche playbooks in the DESIGN LIBRARY are NICHE-SPECIFIC. Apply one ONLY if THIS thumbnail clearly belongs to that niche (e.g. an Indian business case-study, a finance interview, a stock-tips video).
- If the thumbnail does NOT match any trained niche (e.g. cooking, travel, gaming, beauty, lifestyle, tech reviews), IGNORE the niche playbooks entirely and judge + regenerate from the UNIVERSAL principles, the thumbnail's ACTUAL content, and the brand. Do NOT import niche devices that don't belong.
- NEVER add a device just because it is common in the library. The yellow highlight box, the ₹Crore number, the founder cut-out and the curved arrow are NICHE devices — use them only when the niche/brand genuinely calls for them. Default to nothing; earn every element from the actual content.
COLOUR SOURCING — strict priority order (this fixes the "always yellow" problem):
1. If the user provided BRAND COLOURS, the palette MUST be built from those colours — they OVERRIDE every niche default.
2. Otherwise KEEP the thumbnail's OWN existing palette and aesthetic — do not change the colours just to match a niche.
3. Only if a colour is genuinely broken (e.g. text unreadable) suggest a minimal fix that still matches the original's mood.
Do NOT default to yellow, and do NOT make a clean/minimal/light thumbnail dark or over-saturated. The palette is the user's, not a habit.

A. THE SQUINT / HALF-SECOND TEST: at thumbnail size and a glance, is there ONE instantly clear focal point and ONE clear idea? If the eye doesn't know where to land, it fails — say so first.

B. VISUAL HIERARCHY & COMPOSITION:
- One dominant subject with strong figure-ground separation from the background (rim light, blur, cut-out).
- Deliberate placement (rule of thirds), intentional negative space, a sense of depth.
- Element count: more than ~3 competing elements = clutter; recommend what to remove.
- Gaze / direction: a subject's eye-line, a gesture or an arrow should lead toward the key element or text.

C. FACE & EMOTION (where the niche benefits):
- A large, well-lit face with a clear, EXAGGERATED emotion (shock, joy, curiosity, tension) typically lifts click-through; direct eye contact pulls harder.
- A flat or neutral expression wastes the slot. Absence of a face is often the single highest-impact fix — but judge by niche (some product / educational / aesthetic thumbnails win without a face).

D. TEXT:
- ~3–4 BIG words maximum; it must be legible at 120px. Penalise sentences, paragraphs and thin fonts.
- High contrast (bright fill on dark, plus an outline or shadow).
- Keep key text OUT of the safe-zone conflicts: bottom-right (YouTube timestamp), the right edge and lower third (Shorts/Reels UI + captions).
- Text should ADD to the title, not repeat it word-for-word.

E. COLOR & CONTRAST / FEED POP:
- Bold, saturated, high-contrast palettes pop; keep to a tight, intentional palette.
- Stand out against the PLATFORM and against likely competing thumbnails in this niche (e.g. don't blend into YouTube's red/white UI; a dark thumb can pop on a white feed and vice-versa).

F. CURIOSITY & PROMISE — thumb + title as ONE unit:
- Together they must form a single promise with a curiosity GAP: tease the outcome, don't reveal the full answer.
- Look for an open loop, a contrast / surprise, a visible stake, or a relatable trigger.
- Flag any mismatch between thumb and title (mismatch kills trust and retention).

G. PATTERN INTERRUPT: would this look DIFFERENT from the other thumbnails around it in this niche? Sameness = invisible.

REGENERATION PROMPT — STRICT GROUNDING CONTRACT (this OVERRIDES the design library and every niche playbook):
The regeneration prompt is an EDIT of the user's ACTUAL thumbnail, never a new design. Write it as two explicit lists — "KEEP:" and "CHANGE ONLY:" — then one line "why this helps".
KEEP by default (carry over EXACTLY, do not touch):
- the same person(s) — same identity, same number of people. NEVER add a person/face that isn't there and never remove one.
- the same facial EXPRESSION — do NOT change it unless the user explicitly asked.
- the EXACT text, word for word — never rewrite, translate, shorten or restyle it; keep the same FONT / typography.
- the same COLOUR palette and overall aesthetic — if the original is clean / minimal / light, it STAYS clean, minimal and light.
- the same background, layout, composition and crop.
CHANGE ONLY: the elements the user explicitly listed in their request; if they listed none, the SINGLE highest-impact fix, applied as conservatively as possible.
NEVER (these are hallucinations and are forbidden):
- do NOT invent or add any company / brand NAME, logo, product, or any person/face not in the original.
- do NOT add numbers, ₹/$ figures, badges, arrows, grids or "growth graphs".
- do NOT darken, over-saturate, or add "drama/energy" to a clean or minimal image.
- do NOT change the wording, the typography, or the expression.
If in STEP 0 you could NOT actually see the thumbnail, output NO regen prompt — ask for the image instead.

OUTPUT EXPECTATIONS: a short "what the feed actually sees" description (from STEP 0), the layout + colour-scheme classification (STEP 1), an overall 0–100 plus per-dimension scores, the SINGLE highest-impact change, and ONE grounded regeneration prompt written as the KEEP / CHANGE-ONLY contract above (a second only in compare mode). If 2–3 thumbnails (A/B/C) are attached/described, score EACH one, compare them dimension-by-dimension, and fill the "winner" field (pick = A, B or C) with the single strongest one and the one specific reason it wins.`,
    rubric: [
      { name: "Focal clarity (squint test)", what: "One instantly clear subject + idea at 120px in half a second." },
      { name: "Composition & hierarchy", what: "Figure-ground separation, placement, depth, ≤3 elements, leading gaze." },
      { name: "Face & emotion", what: "Large emotive face / focal point where the niche benefits; eye contact." },
      { name: "Text legibility & placement", what: "≤3–4 big words, high contrast, clear of safe zones, adds to the title." },
      { name: "Color & feed pop", what: "Saturated, tight, high-contrast palette that stands out against the feed." },
      { name: "Curiosity gap (thumb+title)", what: "One promise with an open loop; no answer given away; no mismatch." },
      { name: "Pattern interrupt", what: "Visibly different from competing thumbnails in this niche." },
    ],
    notes: "Keep the report FOCUSED and NON-REDUNDANT — never make the same point in two sections, and skip any section that would only restate another. For a SINGLE thumbnail, output in this order and nothing filler: (1) verdict, (2) the per-dimension scores, (3) ONE 'Biggest fix' that would raise the score most, (4) 2-4 concrete issues each with a copy-ready fix, (5) ONE grounded regeneration prompt that improves THIS thumbnail and explicitly applies the user's BRAND COLOURS and 'what to add / emphasise' requests, ending with a one-line 'expected score impact', (6) a short 2-3 variant A/B test plan. If the user gave brand colours or what-to-add, they MUST visibly shape the regen prompt. Lead with the squint test in the verdict.",

    // ── DESIGN LIBRARY ───────────────────────────────────────────────────────
    // STARTER patterns from established thumbnail design. Refined from the
    // owner's analysis of top-performing thumbnails (batches added over time).
    // The analyzer classifies each thumbnail against these, and the UI shows
    // them as Layout / Colour pickers. Edit freely — names here drive the UI.
    layouts: [
      { name: "Founder + brand scene", what: "Real founder/CEO cut out on the right third (smiling, eye contact) over the company's real store/product/logo + a faint upward growth graph, big number bottom-left, a curved arrow to the subject. The workhorse of business/case-study thumbnails." },
      { name: "Face + Text split", what: "Big emotive face on one side, 2–4 bold words on the other. The workhorse for talking-head / reaction content." },
      { name: "Full-bleed face", what: "A single close-up face fills the frame with an exaggerated expression; little or no text. Maximum emotion." },
      { name: "Subject + object/result", what: "Person reacting to or holding a clear object or end-result (the product, the money, the card, the dish). Shows the payoff." },
      { name: "Versus / duel", what: "Two subjects, logos or products facing off (e.g. challenger vs incumbent). Strong for rivalry, comparison and news stories." },
      { name: "Chart / data-viz hero", what: "A prominent line/area/bar chart with figures is the focal point (growth curve, gains/losses, before→after numbers). The 'finance/data' look; pairs with a small face." },
      { name: "Triptych / 3-panel", what: "Three labelled panels or logos side by side (e.g. OIL | INTERNET | AI, or A vs B vs C). Compresses a comparison or an era-timeline into one glance." },
      { name: "Interview / host + guest", what: "One or two real people (a guest founder, often with the host) in a photographic real setting or dark studio. The podcast/interview look — credibility over graphics." },
      { name: "Series wordmark + map (geo)", what: "A recurring host + a place MAP silhouette + a city skyline, under a consistent '[PLACE] TOPIC' wordmark. The whole identity is series recognisability; used for location/region exploration formats." },
      { name: "Cinematic editorial portrait", what: "A single serious/intense face in a dramatic, cinematic photo with minimal, restrained typography. Reads premium and journalistic; a calm contrast to the loud explainer look." },
      { name: "Before / after split", what: "Frame split into two contrasting states. Strong for transformations, comparisons, tutorials." },
      { name: "Text-dominant", what: "A large typographic statement is the hero; imagery is secondary. Good for ideas, news, finance, education." },
      { name: "Product / object hero", what: "The object centered on a clean or dramatic background (e.g. on a pile of cash). Good for tech, products, reviews — often no face." },
      { name: "Number / list hero", what: "A big number is the focal point (e.g. '7', '₹160 CR'). Signals a listicle or a concrete stake." },
      { name: "Annotated / arrow", what: "Hand-drawn circles, arrows or highlights direct the eye to the subject or a detail. Curiosity and 'look here' energy." },
      { name: "Scene / establishing", what: "A wide environmental shot (travel, vlog, cinematic). Sells place and mood; weak focal point unless composed well." },
    ],
    colorSchemes: [
      { name: "Sky-blue growth", what: "Bright daylight blue + clouds + a faint upward line-graph. Reads optimism/success — dominant in business/startup case-study thumbnails." },
      { name: "Navy grid + growth graph", what: "Dark navy background with a faint grid and a white/green upward line or area chart. The 'data/finance' look; makes white text and a cut-out face pop." },
      { name: "Stock-chart green/red", what: "Green-up / red-down chart with +/- figures. Instantly signals gains vs losses, winners vs losers, comparisons." },
      { name: "Brand-matched", what: "Palette pulled from the featured company's own brand colour (Fevicol blue, Netflix red/black, Airbnb coral, pink weddings). Ties the thumb to a recognisable brand." },
      { name: "High-contrast complementary", what: "Opposites that vibrate: teal/orange, blue/yellow, purple/yellow. The strongest in-feed pop." },
      { name: "Bold saturated primary", what: "Loud reds/yellows/blues at high saturation. Energetic, MrBeast-style." },
      { name: "Dark + neon accent", what: "Near-black background with ONE glowing accent (cyan, lime, magenta). Tech, gaming, drama." },
      { name: "Bright + white space", what: "Light, clean background with one strong accent. Pops on a dark feed; reads premium/educational." },
      { name: "Warm dramatic", what: "Reds/oranges/ambers, high energy and urgency. Good for stakes and emotion." },
      { name: "Cool / tech", what: "Blues/cyans, calm and trustworthy. Finance, software, explainer." },
      { name: "Dark premium / photographic", what: "Dark, real-photo or studio backdrop with bold light text and an accent-colour number. Reads premium/credible — common for interview & podcast thumbnails." },
      { name: "Monochrome + single accent", what: "One desaturated palette with a single saturated highlight on the focal point. Elegant, focuses the eye." },
    ],
    designPrinciples:
`Refined from analysis of top-performing thumbnails (n=89: Indian business/startup case-studies).
- One focal point that survives the squint test at ~120px; everything else is support.
- Strong figure-ground separation (rim light, blur, cut-out outline) so the subject pops off the background.
- ≤3 competing elements; negative space is a feature, not wasted room.
- Lead with the strongest CONCRETE specific — for business stories that is a big money number (₹/Crore) as the LARGEST element.
- Two-line text formula: an elegant serif-italic number/hook line + a bold-sans descriptor line. 3–5 words per block.
- Authority/dominance power words where they fit (King, Empire, Kingdom, Masterplan).
- A hand-drawn curved arrow from the number toward the subject/hero object both directs the eye and opens a curiosity gap ("who/what is this?").
- Composite the REAL subject (founder) + the REAL brand asset (store/product/logo) for instant credibility and recognition; a faint upward graph signals growth/success.
- Text ≤3–4 big words on busy areas, high contrast with an outline/shadow, kept out of the bottom-right (timestamp) and right edge (Shorts UI); one accent-colour word for emphasis.
- Faces: large, well-lit, eye contact. Match the expression to tone — confident/aspirational for business; shock/intense for drama, rivalry or news.
- Palette should contrast with the platform UI and neighbouring thumbnails, or be deliberately brand-matched. Thumb + title form ONE promise with a curiosity gap; never repeat the title verbatim.
- Optional social-proof pill ("100K+ VIEWS") top-right, or a status badge ("SOLD") for news hooks.`,

    // PROVEN PATTERNS — niche-scoped playbooks distilled from analysed top
    // performers. The analyzer applies the matching playbook when the
    // thumbnail's niche fits; otherwise it uses the general principles above.
    provenPatterns:
`BUSINESS / STARTUP / FINANCE CASE-STUDY EXPLAINER (e.g. Indian company-story channels) — proven high-CTR house style (analysed n=89):
1. LAYOUT: real founder/CEO or a RECOGNISABLE figure (e.g. Ambani, Musk, Tata, a celebrity) cut out on the right third — smiling + eye contact for success stories, serious/intense for conflict/news. Background = the company's real store/product/logo OR a navy grid with an upward growth graph (sky-blue daylight also common). A tilted BRAND-LOGO badge sits near the subject.
2. HOOK TEXT on the left / bottom-left, two lines. Pick ONE proven frame:
   • BIG NUMBER (most common, ~60%): a huge ₹/Crore/Lakh-Crore figure as the largest element + a 2–3 word descriptor ("12,000 Crore / Fashion Empire").
   • "INDIA'S ___ [KING / GENIUS / EMPIRE]" authority/identity frame ("India's Logistics Genius").
   • CONFLICT frame: "The man who beat ___", "Crushing ___", "Defeating ___?", "95% FAILED".
   Emphasis word in serif ITALIC (Genius, KING, Empire, Masterplan, Dominance, Disruption); descriptor in bold sans; one accent-colour word (red/green) for pop. 3–5 words per block. A crown graphic can literalise "King".
3. A hand-drawn curved arrow (white on dark, black on light) from the number/text to the founder or the brand-logo badge — both directs the eye and opens a "who/what is this?" gap.
4. Optional black "100K+/400K+ VIEWS" social-proof pill top-right; small channel logo top-left/bottom.
5. VARIANTS used for the right story: Versus/duel (two figures or logos, e.g. Modi vs Trump, UPI vs eRupee), Chart/data-viz hero (a growth/gains-vs-losses chart with figures), Triptych/3-panel (OIL | INTERNET | AI), Product/object hero on cash (price-reveal shock, e.g. "This Costs ₹4,50,000??").
6. TONE: confident and aspirational by default; intense for rivalry/news; shocked/curious for price reveals. A minimalist premium style ("It's not just a Phone") exists but is used sparingly.
6b. EXECUTION VARIANTS: (a) narrated FOUNDER/FIGURE cut-out (GrowthX style); (b) PERSONAL-BRAND REACTION HOST — one recurring host reacting to many topics with a shocked/curious wide-eyed face, text on the left with key words in YELLOW highlight boxes, topic/brand props, brand-logo rows for comparisons and verified-tweet quote cards ("Break It Down" style, n=30). Both keep the big-number hook + curved arrow.
When you judge or regenerate a thumbnail in THIS niche, score it against this formula and make the regen prompt follow it — while PRESERVING the real founder/figure, brand and number actually shown. (Note: patterns describe the house style; without CTR data they are not yet ranked by performance.)

STOCK-MARKET / TRADING TIPS (personal-brand finance creator, e.g. Indian stock channels) — observed style (n=4, single creator → low confidence, treat as hypothesis):
1. LAYOUT: the creator's OWN face cut out on the left or right third, eye contact, expression matched to the angle (smile for tips, wide-eyed shock for warnings, smirk for contrarian). Light/white or blue-grid background with a faint green up-line stock chart.
2. HOOK TEXT: bold ALL-CAPS sans, large (~half the frame). Lead with a SMALL specific stock count — "2 Stocks", "3 Breakout Stocks" (NOT crore figures). Trader vocabulary: Breakout, In Focus, Falling Market, Good?/Bad?.
3. SIGNATURE DEVICE: a highlighter/marker emphasis — a yellow highlight box (or a coral word) behind ONE key word ("Breakout", "IN FOCUS", "CONDITION").
4. CURIOSITY GAP = hidden tickers: "?" cards, a magnifier over a news clue, "IN FOCUS" — withhold the actual stock names (the payoff). A curved arrow can point to the clue.
5. PROPS that signal the topic: phone showing news, ₹500 cash stacks, gold coins, sector buildings; good-vs-bad = green/red split.
Keep the creator's real face and the real stock count/claim shown; do not invent tickers.

FOUNDER-INTERVIEW / BUSINESS PODCAST (host + guest case-study interviews) — observed style (n=15):
1. LAYOUT: the GUEST (often a recognisable founder), frequently WITH the host — one or two real people in a photographic real setting or a dark studio. Credibility over graphics: NOT heavily composited on a grid. Topic/brand props welcome (product, plane, bottles, phone, storefront).
   • Common 2-guest sub-template: host + guest at the LEFT and RIGHT edges with podcast MICROPHONES in front, on a dark navy/grid background with a green growth line, name tags + title ("Founder & CEO") at the bottom and the show logo/episode credit.
2. PALETTE: dark, premium, photographic — bold light text with the number in an accent colour (yellow/green/red).
3. HOOK TEXT: bold sans (ALL-CAPS or mixed-case) with a big number (₹Cr / $M / "₹70,000/month") OR a sharp metric ("106X oversubscribed", "90% market share"). Frames: "HOW TO BUILD A ___?", "HOW [BRAND] BECAME ₹X?", "FROM ___ TO ___", "He made ₹X selling ___", or a first-person quote ("I make ₹650 Crores selling tickets").
4. SIGNATURE EMPHASIS: put the key number/phrase in a YELLOW highlight PILL (black text, rounded) in the centre, with a normal line above and below. The brand name may also be highlighted; add a "Ft. [name]" credit and a central prop that proves the claim (a document, cash, the product).
Preserve the real guest/host, brand and number/metric actually shown.

GEO / SERIES EXPLORATION ("[State/City] TOPIC", e.g. region-by-region startup series) — observed style (n=35, single series):
1. LAYOUT: the RECURRING HOST (same creator every episode) prominent on one side, often pointing/expressive; optionally paired with a local GUEST (a CM, founder or recognisable figure) on the other side. A place MAP silhouette (theme-coloured, with a small arrow/locator) + a real city skyline/landmark photo background. Featured brand-logos may sit in a row.
2. HERO WORDMARK: "[PLACE] TOPIC" (e.g. "GOA STARTUPS") — the place name in a theme colour and/or serif-italic, the topic word in bold white sans. Keep the SAME wordmark every episode: the series identity is the whole point of the click.
3. HOOK variants: the plain series wordmark, OR a curiosity/contrarian spin ("THEY'RE SELLING AIR", "MORE THAN BENGALURU", "ASIA'S FIRST", "SILICON VALLEY OF INDIA").
4. BRANDING: small consistent channel logo; friendly, curious, exploratory tone.
Preserve the real host, place and any guest/brand actually shown; keep the series wordmark consistent.

PERSONAL-FINANCE / INVESTING INTERVIEW (host + expert guest, money/investing topics) — observed style (n=84):
1. LAYOUT: an expert GUEST on the LEFT + the HOST (often a woman) and sometimes a co-host on the RIGHT, with podcast MICROPHONES, on a dark navy background (often a faint green/red market chart). 2–3 real people.
2. CENTRE-TOP TEXT with the key number/word in a coloured highlight box/pill (yellow numbers; blue/white pills for "1 FUND!", "RICH!", "FREE").
3. SIGNATURE DEVICE: a small REACTION-WORD box beside the host — "HOW?" / "WTF?" / "OMG?" / "Really?" / "WHY?" — to amplify the curiosity gap. Curved arrows; an optional verified-tweet/quote card for credibility; an optional view-count badge.
4. HOOK FRAMES: myth-bust/contrarian ("Mutual Funds/SIPs CAN'T make you RICH! — HOW?", "F.I.R.E. IS WRONG!", "Indian Market is Dead?"), minimalist promise ("You Only Need This 1 FUND / 2 FUNDS / 1 Sector"), personal-finance number hooks (networth/corpus/SIP figures, "Financially FREE at 34", "Retire Early", "Passive Income ₹X/month"), or a transformation ("Started with ₹650 → Crorepati", "₹0 → ₹5Cr in 11 Years").
Preserve the real guest/host and the real numbers/claims shown; never invent figures or fund names.

GENERAL INDIAN BUSINESS / SOCIAL-COMMENTARY EXPLAINER (cross-creator hooks, mixed pool n≈82) — use when the thumbnail is an explainer that doesn't fit a tighter niche above:
- HOOK FRAMES that recur across many creators: "[X] SCAM" / exposé ("DARK TRUTH", "THE REALITY OF [BRAND]", "BEST KEPT SECRET REVEALED"); "THE [BRAND/THING] [REVOLUTION / TASTE / REALITY]" two-line wordmark with the brand product shown; VERSUS/comparison (NORTH vs SOUTH, 2018 vs 2023, Cost vs Price); CURIOSITY QUESTION ("ARE YOU IN DANGER?", "WHAT DOES GEN-Z WANT?", "WHY YOU WON'T SUCCEED", "HOW?").
- EMOTIONAL REGISTER is a deliberate choice: calm-confident (credible/business) vs SHOCKED/exaggerated (eyes wide, mouth open) for scams/shock/outrage topics — pick the one that matches the claim.
- DEVICES: brand-product prop held/shown + logo; a yellow highlight box on the key word; a curved arrow.
- A CINEMATIC EDITORIAL PORTRAIT (single serious face, dramatic light, minimal restrained type) is the premium/journalistic alternative to the loud look.
Preserve the real subject/brand/claim shown; match the emotional register to the actual topic.`,

    // Steers EVERY regeneration prompt (admin-editable). The brand-colour and
    // "what to add" inputs from the UI are merged in on top of this at runtime.
    regenGuidance:
`The regeneration prompt is an EDIT of the user's ACTUAL thumbnail, never a new design — and this OVERRIDES the design library and niche playbooks. Write it as "KEEP: … / CHANGE ONLY: …" + a one-line reason.
- KEEP by default: the same person(s), identity and count; the same EXPRESSION (unless the user asked to change it); the EXACT text word-for-word; the same FONT/typography; the same colour palette and aesthetic (clean/minimal/light STAYS that way); the same layout, background and crop.
- CHANGE ONLY what the user explicitly requested; if nothing was requested, the single highest-impact fix, applied as conservatively as possible.
- NEVER invent or add a company/brand name, logo, product, or any person/face not in the original. NEVER add numbers, badges, arrows, grids or growth-graphs. NEVER darken or over-saturate a clean image. NEVER alter the wording, typography or expression.
- COLOUR: if BRAND COLOURS are given, use them; otherwise keep the original's existing palette. Do not introduce dark/saturated "business" colours or a yellow highlight by default.
- Make it copy-paste ready for an image generator, but describe ONLY the real, observed elements (plus the requested change).`,

    // Output guidance for A/B testing (used by the result + the Playbook page).
    abTesting:
`Always end a single-thumbnail review with an "A/B TEST PLAN": 2–3 concrete, ONE-VARIABLE-AT-A-TIME variants, each with a one-line hypothesis. Isolate ONE variable per variant (e.g. face vs no-face, expression A vs B, text-left vs text-right, one headline wording vs another, accent-colour A vs B). Keep every other element identical so the winner is attributable. Base the variants on the user's ACTUAL thumbnail — never introduce niche devices, brands, people or colours that aren't already there.`,

  },

  // ── TITLE ─────────────────────────────────────────────────────────────────
  title: {
    label: "Title",
    systemGuidance:
`Evaluate titles for click-worthiness, curiosity-gap, clarity, search fit and mobile truncation — calibrated to the title's own language and platform.

A. CURIOSITY GAP & ANGLE — classify the emotional/rational angle (curiosity, fear/stakes, desire/aspiration, controversy, social proof, utility/how-to) and rate how strong the gap is. The gap must be PAYABLE and honest — tease the outcome without lying (clickbait that under-delivers tanks retention and trust).

B. HIGH-ENGAGEMENT PATTERNS (apply where they fit the niche, never force):
- A specific number + a timeframe or stake reads as concrete and credible; odd/specific numbers tend to out-click round ones.
- Question and "mistake / wrong way" framings open a guilt/curiosity loop.
- Front-load the hook word + primary keyword in the first few words (mobile display AND search both favour this).
- Brackets/tags ([2026], [Step-by-Step], [Full Guide]) can add specificity.
- Power words and native slang appropriate to the language; avoid over-capitalising.

C. CLARITY & MATCH: a viewer must instantly know what they'll get, and it must match the actual content. Vague or abstract titles lose.

D. MOBILE & SEARCH: keep it concise; phones often truncate around ~40 characters — report the exact mobile-truncated preview and where it cuts. Note the primary keyword and its position.

OUTPUT: the title breakdown (character count, power words, numbers, brackets, keyword position, curiosity-gap strength, truncated preview) and then 10 ALTERNATIVE titles, each labelled by angle: curiosity, fear, specific-numbers, question, negative-framing, listicle, contrarian, social-proof, aspirational, plain-clear — in the content's own language. If two titles (A and B) are provided, compare them and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Click chance", what: "Reward pull — hook word up front, urgency, specifics, strong angle." },
      { name: "Curiosity gap", what: "Specific, payable, honest gap (not vague bait, not a lie)." },
      { name: "Clarity & match", what: "Instantly clear what it's about; matches the actual content." },
      { name: "Mobile & search fit", what: "Concise; keyword early; truncation point (~40 chars) reported." },
    ],
    notes: "Always include the 10 labelled alternatives in the content's own language.",
  },

  // ── ADS ─────────────────────────────────────────────────────────────────────
  ads: {
    label: "Ads",
    systemGuidance:
`Evaluate paid ad copy (Meta / Google and similar) for scroll-stopping power, clarity, message-match and platform limits — calibrated to the ad's own language and market.

A. AWARENESS STAGE & MESSAGE MATCH: judge whether the hook fits the audience's awareness (problem-aware vs solution-aware vs product-aware). The promise in the ad should match where the click lands (landing page / offer) — a mismatch wastes spend.

B. PLATFORM LIMITS (check exactly against the given text):
- Meta / Instagram primary text: ~125 chars before "See More" — the hook AND core benefit must land here.
- Headline: ~40 chars max (~27 on mobile).
- Link description: ~30 chars.
- Google: each headline <= 30 chars; each description <= 90 chars.

C. 3-TRIGGER FRAMEWORK — every strong ad hits at least 2 of: Curiosity (an information gap), Scarcity (time / quantity), Direct Benefit (a concrete, specific payoff). Lead with the benefit; never bury the hook past "See More".

D. SHOW "WHAT PEOPLE ACTUALLY SEE": the truncated feed text + the mobile headline. Then give stronger rewrites for the primary text and the headline, in the ad's own language.

E. COMPLIANCE — CONDITIONAL: only if the product is in a regulated category. Finance -> flag per the relevant regulator (e.g. SEBI/RBI in India, SEC/FINRA/FTC in the US, FCA in the UK): no guaranteed-return claims, no past-performance-as-promise, required disclaimers, no unlicensed-advice framing. Health -> unsubstantiated medical claims. Any paid promotion -> missing disclosure. For ordinary products, add NO compliance note.

If two ad variants (A and B) are provided, compare them and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Scroll-stopping power", what: "Does the visible opening interrupt the scroll, or blend in?" },
      { name: "Hook before cutoff", what: "Strongest line + benefit within the ~125-char 'See More' limit?" },
      { name: "Copy quality", what: "Hits >=2 of Curiosity / Scarcity / Direct Benefit; clear message-match." },
      { name: "CTA fit", what: "Matches the stated objective and the landing promise." },
    ],
    notes: "Compute truncation against the exact limits above. Add a compliance row ONLY for regulated products.",
  },

  // ── PLATFORM IQ ─────────────────────────────────────────────────────────────
  platform: {
    label: "Platform IQ",
    systemGuidance:
`You are a platform strategy expert for Indian content creators.
Answer in plain text with bullet points. 5-7 points max unless asked for more depth.
Always give India-specific, actionable advice. Answer the actual question first, then add context.

INSTAGRAM -- MOSSERI CONFIRMED DATA (2024-2026):

TOP 3 RANKING SIGNALS (Mosseri, Jan 2025 -- all surfaces):
- Watch Time: #1 signal. Users decide stay/scroll in 1.7 seconds. Aim 60%+ hold at 3-second mark.
- Sends per Reach (DM shares): 3-5x more valuable than likes for new audiences. 694K Reels sent via DM every minute.
- Likes per Reach: Still matters, more important for existing followers than for discovery.

4 SURFACES, 4 SEPARATE AI SYSTEMS:
Feed (relationship signals + past interactions), Reels (entertainment + discovery via Audition System),
Stories (viewing history + reply frequency), Explore (quality + topic relevance over relationships).

REELS:
- 7-15s: viral/trending, highest completion rate
- 30-90s: optimal for education/finance
- Up to 3 min: can reach non-followers via recommendations
- No watermarks (TikTok/CapCut) = ineligible for ALL recommendations
- Captions = official ranking factor (Mosseri confirmed). Most users watch sound-off.
- Audition System: Post → small non-follower test → good = wider audience. Peak 6-12 hours. First 30-60 min critical.
- Trial Reels: Shown to non-followers only. 40% of users post more after using it. 80% see increased non-follower reach.
  Can now be scheduled (Feb 2026). Compare Trial Reels only to other Trial Reels.

STORIES:
- Post max 5-7 -- view counts drop after 5th
- Do NOT directly boost post reach but maintain follower warmth
- Stickers/polls/questions increase replies = algorithmic boost
- Best time: 8-10 AM India

CAROUSELS (highest engagement format 2026):
- Up to 20 slides. Reshown to users who did not see all slides = multiple impressions per post.
- First slide = hook. Consistently outperforms single images (Buffer data, 4M+ posts).

NEW FEATURES (2025-2026):
- Your Algorithm (Dec 2025): Users add/remove Reels topics. Niche consistency now critical.
- Trial Reels: Schedule + test with non-followers before full publish.
- AI Translations: Auto-translates to Hindi, Portuguese, English, Spanish. Mosseri called it a reach tactic.

CONTENT RULES:
- 10+ reposts in 30 days = EXCLUDED from ALL recommendations
- Original content gets 40-60% more distribution than reposts
- Dec 31 2025 Mosseri memo: prioritizing raw, real human content over AI-generated content in 2026

SEARCH & SEO:
- Instagram reads captions like Google reads page copy
- Keywords in captions + titles + alt text + on-screen text all matter
- Hashtags = minor topic signals only (NOT discovery). Use 3-5 max.
- Comment quality is also searchable -- ask specific questions in posts

INDIA POSTING TIMES:
- Reels: 7-9 AM, 12-2 PM, 7-9 PM IST (Tue-Fri best)
- Stories: 8-10 AM IST
- Finance content: Monday mornings (salary anxiety), Friday evenings

---
YOUTUBE -- 2025-2026 CONFIRMED DATA:

TOP METRICS:
- CTR: Thumbnail + Title → initial distribution. 4-6% avg, 7%+ excellent.
- AVD (Average View Duration): Most important after click. Efficiency > length.
- Satisfaction: Likes, comments, shares, subscriptions after watching.

2025 BIG SHIFT -- CHANNELS, NOT VIDEOS:
- YouTube now judges channels as a whole, not individual videos
- Pattern consistency > one-off virals
- Gemini AI analyzes video tone, on-screen elements, semantic meaning -- not just titles/tags
- YouTube actively promotes channels under 500 subscribers

LONG-FORM:
- 8-20 min optimal for finance/education. Hook in first 30 seconds. Pattern interrupt every 2-3 min.
- Takes off in 48 hours or does not (Shorts can go viral weeks later).
- Keyword in title (first 40 chars) + first 2 lines of description + say it out loud in video.
- Viewer who watches 100% of 8 min + likes > viewer who watches 40% of 25 min and leaves.

SHORTS (90-200B daily views):
- Fully decoupled from long-form algorithm (late 2025)
- Key signals: Completion rate + Rewatchability (loops). Swipe = bad signal.
- 30-60s best for discovery (limit expanded to 3 min in 2025)
- Shorts = fast feedback system. Test topics before making long-form.
- Shorts can go viral WEEKS after posting -- never delete failed Shorts.
- Consistent Shorts engagement → YouTube recommends your long-form.

SEO:
- Title: Keyword in first 40 characters
- Description: Keyword in first 2 lines, then expand
- Chapters/timestamps: Improve AVD
- Tags: 10-15 relevant ones. Less important than before but still use them.
- Use Ask Studio AI in YouTube Studio (20M+ users).

INDIA POSTING TIMES -- YOUTUBE:
- Long-form: Sat-Sun 10 AM-12 PM IST. Weekdays: 6-8 PM IST.
- Shorts: 12-2 PM and 6-8 PM IST.
- Finance: Mon-Wed (investing decision mood).

ANALYTICS INTERPRETATION:
- Low CTR (<2%): Thumbnail or title problem. A/B test both.
- Low AVD (<30%): Hook or pacing problem. Tighten first 30 seconds.
- Low IG sends: Content not opinionated/relatable enough. More opinions.
- Stories declining: Posting too many (cap at 5-7).
- Low Shorts completion: Hook too slow -- fix first 1-2 seconds.
- High watch time, low subs: End screen/subscribe CTA not strong enough.
- Low IG reach despite posting: Check reposts (10+ = banned from recs).`,
  },
};
