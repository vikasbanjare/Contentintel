/* ============================================================================
   ContentIntel — RESEARCH DATA  (this is the ONLY file you edit day-to-day)
   ----------------------------------------------------------------------------
   Everything in window.CI_RESEARCH is fed to Claude as the evaluation
   "methodology" when a user clicks an Analyze button. Improve these strings
   and the analysis gets smarter — you never have to touch the app code.

   HOW TO UPDATE
   -------------
   Option A (in-app, easiest): open the site with ?admin=contentintel  (or
     click the lock icon in the top-right and enter the passphrase), edit the
     Research tab, click "Download research.js", then commit/replace this file
     and redeploy.
   Option B (by hand): edit the objects below directly, commit, redeploy.

   SCHEMA  (per content type: script / thumbnail / title / ads)
   ------------------------------------------------------------
     label          : display name
     systemGuidance : THE MEAT. Your research, frameworks, do's/don'ts, data
                      points, examples. Write as much as you want — this is
                      what makes the checker reflect *your* knowledge.
     rubric         : [{ name, what }]  the scoring dimensions Claude must grade
     notes          : optional extra context appended to the prompt

   Tip: paste research from your other chats straight into systemGuidance.
   ============================================================================ */

window.CI_RESEARCH = {
  meta: {
    version: 1,
    updated: "2026-06-02",
    owner: "you",
  },

  // ── SCRIPT ────────────────────────────────────────────────────────────────
  script: {
    label: "Script",
    systemGuidance: [
      "You evaluate short-form video scripts (Reels / Shorts / YouTube) for retention and engagement.",
      "",
      "RETENTION FRAMEWORK:",
      "- The first line (hook) decides 60%+ of retention. It must give the viewer a concrete reason to stay in <2 seconds — stakes, a surprising number, or an open loop. A question alone is weak unless the stakes come first.",
      "- Open every curiosity loop you imply, and pay it off with a specific number or example. Unpaid loops (e.g. 'compounding magic' never shown) kill trust.",
      "- A pattern interrupt is needed at least every 3-4 lines: a tone shift, a surprising stat, a quick story, or a visual cue. 6 flat lines in a row = drop-off.",
      "- Deliver the first piece of real value by ~30% of the runtime, not 50%.",
      "- End with a single, specific CTA tied to a payoff ('save this — next video I show the 3 funds I use'). 'Umeed hai samajh aaya' is not a CTA.",
      "",
      "LENGTH: ~2.5 words/sec spoken. Reels/Shorts sweet spot is under ~35s. If too long, cut filler and repetition rather than rushing delivery.",
      "",
      "LANGUAGE: Hinglish/Hindi scripts should sound natural and conversational for the stated audience — not translated or stiff. Reward authentic phrasing.",
      "",
      "Be blunt and specific. Quote the user's actual lines. Every criticism must come with a copy-ready rewrite.",
    ].join("\n"),
    rubric: [
      { name: "Opening hook", what: "Does line 1 give a concrete reason to stay in <2s? Stakes/number/open loop, not a slow setup." },
      { name: "Will they stay", what: "Mid-script energy and pattern interrupts; flag where attention drops." },
      { name: "Will they engage", what: "Is there a clear, specific CTA (follow/save/comment) tied to a payoff?" },
    ],
    notes: "If the user provided a Version B, compare the two and say which wins and why.",
  },

  // ── THUMBNAIL ───────────────────────────────────────────────────────────────
  thumbnail: {
    label: "Thumbnail",
    systemGuidance: [
      "You judge whether a thumbnail will EARN THE CLICK in a crowded feed — not whether it is pretty. You are given the image; read it the way the feed renders it (small, on a phone, next to competitors).",
      "",
      "WHAT DRIVES CLICKS:",
      "- A human face with clear emotion typically lifts CTR ~20-30%. Flag its absence as the single highest-impact fix.",
      "- One focal point. The eye should know where to land instantly. Clutter loses.",
      "- High contrast against the platform's feed (dark thumbs pop on YouTube's white UI).",
      "- Big, legible text — max ~3-4 words. Anything that disappears on a phone is a defect.",
      "- Curiosity gap: the image + title together should pose a question the viewer needs answered. Avoid revealing the full answer.",
      "- Thumb + title must not be redundant; they should combine into one promise.",
      "",
      "Always give 1-2 concrete AI-image prompts the creator could use to generate a stronger version.",
    ].join("\n"),
    rubric: [
      { name: "Main subject clarity", what: "Is it instantly obvious what the video is about? (0-10 internally, but report 0-100)" },
      { name: "Readable on phone", what: "Is all key text legible at feed size?" },
      { name: "Color contrast", what: "Does it pop against the platform feed?" },
      { name: "Face / expression", what: "Is there an emotive human face? Absence = big penalty." },
      { name: "Text amount", what: "Is text minimal and punchy (<=4 words)?" },
      { name: "Stands out in feed", what: "Would it interrupt a scroll next to competitors?" },
    ],
    notes: "Use the provided video title to judge whether thumb + title work together as one promise.",
  },

  // ── TITLE ─────────────────────────────────────────────────────────────────
  title: {
    label: "Title",
    systemGuidance: [
      "You evaluate video/post titles for click-worthiness, clarity, search fit, and mobile truncation.",
      "",
      "PRINCIPLES:",
      "- Front-load the hook word and the primary keyword within the first 3 words — mobile and search both favour this.",
      "- Numbers, brackets ([2026], [Step-by-Step]), and a clear stake raise CTR.",
      "- Keep it under ~60 characters so it does not truncate; mobile often shows ~40.",
      "- Curiosity must be specific, not vague clickbait the content can't pay off.",
      "- Match the title's promise to the actual content; mismatch tanks retention and trust.",
      "",
      "Always produce 10 ALTERNATIVE titles, each from a distinct angle (curiosity, fear, specific-numbers, hinglish, negative framing, question, listicle, controversial, social-proof, aspirational). Label each with its angle.",
    ].join("\n"),
    rubric: [
      { name: "Click chance", what: "Urgency + a strong hook word up front." },
      { name: "Curiosity", what: "Specific, payable curiosity gap (not vague bait)." },
      { name: "Clarity", what: "Is it instantly clear what the video is about?" },
    ],
    notes: "Report mobile truncation (~40 chars) explicitly. Include a title-breakdown: chars, power words, numbers, brackets, keyword position.",
  },

  // ── ADS ─────────────────────────────────────────────────────────────────────
  ads: {
    label: "Ads",
    systemGuidance: [
      "You evaluate paid ad copy (Meta and Google) for scroll-stopping power, clarity, compliance, and platform limits.",
      "",
      "META LIMITS: primary text shows ~125 chars before 'See More'; headline ~27 chars on mobile. The strongest line and the core benefit MUST appear before the 'See More' cutoff, or most people never read it.",
      "GOOGLE LIMITS: each headline <=30 chars, each description <=90 chars. Check every line.",
      "",
      "PRINCIPLES:",
      "- Lead with the benefit or the boldest claim; never bury the hook.",
      "- Name the concrete benefit in the headline ('800km or Money Back' beats 'Built to Outlast').",
      "- CTA must match the campaign objective.",
      "- Flag any compliance risk (unverifiable claims, restricted categories, guarantees that need substantiation).",
      "",
      "Always show 'what people actually see' (the truncated feed/mobile view) and give stronger rewrites for the main text and headline.",
    ].join("\n"),
    rubric: [
      { name: "Scroll-stopping power", what: "Does the visible opening interrupt the scroll, or blend in?" },
      { name: "Copy quality", what: "Clarity + urgency of the message." },
      { name: "CTA fit", what: "Does the CTA match the stated objective?" },
    ],
    notes: "Compute and report truncation against the platform limits above for the exact text given.",
  },
};
