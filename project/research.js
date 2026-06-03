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
  meta: { version: 3, updated: "2026-06-03", owner: "you" },

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
  · Hindi / Hinglish for an Indian audience -> cricket, Bollywood, festivals, ₹ specifics, Reels-first, code-switching.
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
6) COMPLIANCE IS CONDITIONAL: raise regulatory / disclaimer issues ONLY when the topic genuinely requires it — e.g. financial advice (SEBI/RBI in India, SEC/FINRA/FTC in the US, FCA in the UK, etc.), health / medical claims, legal, gambling, or paid-promotion disclosure. For ordinary, non-regulated content, do NOT add any compliance note.
7) For A/B comparisons, always name a clear winner and explain why in one specific sentence.`,

  // ── SCRIPT ────────────────────────────────────────────────────────────────
  script: {
    label: "Script",
    systemGuidance:
`Evaluate short-form video scripts for retention & engagement using the universal science above, calibrated to the script's own language, niche and platform.

FIRST FEW SECONDS = the critical window. Identify the hook type and its reward pull:
- Question hook (medium-high): poses a gap the viewer needs closed.
- Shock / stat hook (high): a surprising, specific fact or number.
- Result-first hook (very high): leads with the outcome, then the how.
- Story hook (medium): a personal/relatable opening tension.
- Challenge / contrarian hook (high): takes a stance that demands a reaction.
Prefer result-first / shock / challenge for higher reward activation. A weak or slow hook is the #1 failure mode.

HOOK ARCHITECTURE — grade each stage in the first ~3 seconds:
1) Pattern interrupt — an unexpected visual / sound / statement that breaks the scroll.
2) Micro-commitment — the viewer mentally nods "this is for me".
3) Relevance proof — evidence the next 30s is worth it.
4) Payoff promise — what they get by the end.

ALSO ASSESS:
- Curiosity loops & payoff timing — open loops must close at the right moment; never leave a loop unpaid.
- Emotion per line — curiosity, surprise, excitement, trust, humour, inspiration; flag flat zones (4+ lines with no shift = drop-off risk).
- Value delivery % — information vs filler; deliver the first real value by ~30% of runtime.
- Pacing — words-per-minute appropriate to the language; too slow or too fast both hurt.
- Power-word & specificity density — concrete numbers beat round ones (47,382 > 50,000); native power words and slang appropriate to the language; avoid overusing ALL-CAPS.

End with ONE specific call-to-action tied to a payoff. Quote the user's actual lines; every criticism gets a copy-ready rewrite in the script's own language.
If a Version B is provided, compare both versions and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Opening hook", what: "First-seconds reward activation — hook type + the 3s architecture. Slow/generic start = fail." },
      { name: "Will they stay", what: "Flat zones / drop-off risk through the middle; pacing." },
      { name: "Will they engage", what: "One specific CTA tied to a payoff; save / share / comment trigger." },
      { name: "Curiosity & payoff", what: "Open loops that close; no unpaid loops." },
      { name: "Audience fit", what: "Authentic to the content's own language, audience and platform; avoids avoidance-triggers." },
    ],
    notes: "Map emotion line-by-line and predict the exact lines where viewers will drop off.",
  },

  // ── THUMBNAIL ───────────────────────────────────────────────────────────────
  thumbnail: {
    label: "Thumbnail",
    systemGuidance:
`Judge whether the thumbnail will EARN THE CLICK in a crowded feed — mobile-first, ~120px, often muted. Read it the way the feed renders it, not as art.
If an image is attached, judge the image directly. If only a TEXT DESCRIPTION is given (no vision available), judge rigorously from that description and say you're working from the description.

THUMBNAIL SCIENCE (assess each; report 0-100 overall and per dimension):
- Subject clarity — is the main subject instantly identifiable?
- Mobile legibility at ~120px — is any text readable at thumbnail size? Keep first-glance words to a few.
- Contrast / pop — does the foreground stand out in a sea of similar thumbnails?
- Safe zones — platform UI covers parts of the frame (timestamps, captions, the right edge on Shorts/Reels). Penalise key text/elements placed there.
- Text coverage — ideally under ~30% of the frame.
- Face & emotion — a clearly emotive human face usually lifts click-through; its absence is often the single highest-impact fix (but not for every niche — judge by what suits the topic).
- Element count — more than ~3 competing elements = clutter penalty.

Thumb + title must combine into ONE promise with a curiosity gap — don't reveal the full answer. Give 1-2 concrete image-generation prompts (in the content's own context) for a stronger version.
If two thumbnails (A and B) are described/attached, compare them and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Subject clarity", what: "Instantly obvious what it's about?" },
      { name: "Mobile legibility", what: "Readable at ~120px on a phone?" },
      { name: "Contrast / pop", what: "Stands out against the feed?" },
      { name: "Face & emotion", what: "Emotive focal point where the niche benefits from one." },
      { name: "Text amount", what: "Under ~30% coverage, few words, clear of safe zones?" },
      { name: "Curiosity gap", what: "Thumb + title pose a question without giving the answer." },
    ],
    notes: "Use the provided title to judge whether thumb + title work as one promise.",
  },

  // ── TITLE ─────────────────────────────────────────────────────────────────
  title: {
    label: "Title",
    systemGuidance:
`Evaluate titles for click-worthiness, curiosity-gap, clarity, search fit and mobile truncation — calibrated to the title's own language and platform.

HIGH-ENGAGEMENT PATTERNS (apply where they fit the niche):
- A specific number + a timeframe or stake reads as concrete and credible.
- Odd / specific numbers tend to out-click round ones.
- Question hooks open a curiosity gap; "mistake / wrong way" framing drives a guilt-loop click.
- Front-load the hook word + primary keyword in the first few words (both mobile display and search favour this).
- Keep it concise; mobile often truncates around ~40 characters — report exactly where it truncates.

TITLE BREAKDOWN to report: character count, power words, numbers (specific vs round), brackets (e.g. [2026] / [Step-by-Step]), keyword position, curiosity-gap strength, and the mobile-truncated preview (~40 chars).

Match the promise to the actual content — a mismatch tanks retention and trust. Then produce 10 ALTERNATIVE titles, each labelled by angle: curiosity, fear, specific-numbers, question, negative-framing, listicle, contrarian, social-proof, aspirational, plain-clear. Write them in the content's own language.
If two titles (A and B) are provided, compare them and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Click chance", what: "Reward pull — hook word up front, urgency, specifics." },
      { name: "Curiosity gap", what: "Specific, payable gap (not vague bait)." },
      { name: "Clarity", what: "Instantly clear what it's about; matches the content." },
      { name: "Mobile fit", what: "Concise; keyword early; where it truncates (~40 chars)." },
    ],
    notes: "Always include the 10 labelled alternatives in the content's own language.",
  },

  // ── ADS ─────────────────────────────────────────────────────────────────────
  ads: {
    label: "Ads",
    systemGuidance:
`Evaluate paid ad copy (Meta / Google and similar) for scroll-stopping power, clarity and platform limits — calibrated to the ad's own language and market.

PLATFORM LIMITS (check exactly against the given text):
- Meta / Instagram primary text: ~125 chars before "See More" — the hook AND core benefit must land here.
- Headline: ~40 chars max (~27 on mobile).
- Link description: ~30 chars.
- Google: each headline <= 30 chars; each description <= 90 chars.

3-TRIGGER FRAMEWORK — every strong ad hits at least 2 of: Curiosity (an information gap), Scarcity (time / quantity), Direct Benefit (a concrete, specific payoff). Lead with the benefit; never bury the hook past "See More".

Show "what people actually see" (the truncated feed text + the mobile headline). Give stronger rewrites for the primary text and the headline, in the ad's own language.

COMPLIANCE — CONDITIONAL: only if the product is in a regulated category. For finance, flag without lecturing per the relevant regulator (e.g. SEBI/RBI in India, SEC/FINRA/FTC in the US, FCA in the UK): no guaranteed-return claims, no past-performance-as-promise, required disclaimers, no unlicensed-advice framing. For health, flag unsubstantiated medical claims; for any paid promotion, flag missing disclosure. For ordinary products, add NO compliance note.
If two ad variants (A and B) are provided, compare them and fill the "winner" field with the stronger one and why.`,
    rubric: [
      { name: "Scroll-stopping power", what: "Does the visible opening interrupt the scroll, or blend in?" },
      { name: "Hook before cutoff", what: "Is the strongest line + benefit within the ~125-char 'See More' limit?" },
      { name: "Copy quality", what: "Hits >=2 of Curiosity / Scarcity / Direct Benefit." },
      { name: "CTA fit", what: "Matches the stated objective." },
    ],
    notes: "Compute truncation against the exact limits above. Add a compliance row ONLY for regulated products.",
  },
};
