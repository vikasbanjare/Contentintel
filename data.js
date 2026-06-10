/* ==========================================================================
   VIKAS BANJARE — PORTFOLIO CONTENT
   This is the ONLY file you need to edit. Every section of the site
   reads from here.

   ALL 11 PROJECTS BELOW ARE YOUR REAL BEHANCE PROJECTS — opening a card
   shows the full live project (all its images & videos) via Behance's
   official embed.

   COVERS: each card is pre-wired to a base name like "cover-website".
   Upload an image named cover-website.png / .jpg / .jpeg (any of them)
   next to index.html and it appears automatically — the site tries all
   extensions. Missing images fall back to typographic covers.

   PHOTO: pre-wired to "me" — me.jpg / me.jpeg / me.png all work.
   ========================================================================== */

window.PORTFOLIO = {

  profile: {
    firstName: "VIKAS",
    lastName: "BANJARE",
    tagline: "Design Studio Lead",
    location: "Mumbai, India",
    availability: "Open to projects",
    email: "vikas.banjare@gmail.com",
    behance: "https://www.behance.net/vikas-banjare",
    linkedin: "https://www.linkedin.com/in/vikasbanjare/",
    photo: "me",
    // Words wrapped in *asterisks* render as accent italic serif.
    about:
      "I'm Vikas — designer, editor and *storyteller* with 7 years across video, design and digital content. Today I lead the design studio at Mirae Asset; before that I scaled creative at Wealthy and Unacademy — 2000+ videos, 100+ YouTube channels and *1M+* subscribers gained in a single month. I make work that moves, converts and gets *remembered*.",
  },

  // Rotating roles in the hero
  roles: ["VIDEO PRODUCTION", "GRAPHIC DESIGN", "UI / UX", "YOUTUBE GROWTH", "AI WORKFLOWS"],

  // The slanted marquee strips
  marquee: ["VIDEO", "DESIGN", "PODCASTS", "YOUTUBE", "UI / UX", "MOTION", "AI"],

  // Quick stats in About (straight from the resume)
  stats: [
    { value: "7+", label: "Years of experience" },
    { value: "2000+", label: "Videos produced" },
    { value: "1M+", label: "Subscribers gained" },
    { value: "100+", label: "Channels managed" },
  ],

  /* ------------------------------------------------------------------
     SELECTED WORK — real Behance projects.
     behanceProjectId powers the official live embed in the case view.
     ------------------------------------------------------------------ */
  projects: [
    {
      title: "Website Design",
      category: "UI / UX",
      year: "2026",
      description: "Conversion-focused website design — user flows, wireframes and pixel-perfect visual design built for real business goals.",
      cover: "cover-website",
      images: [],
      videoEmbed: "",
      behanceProjectId: "250550681",
      link: "https://www.behance.net/gallery/250550681/Website-Design",
    },
    {
      title: "Creative Designs",
      category: "Graphic Design",
      year: "2026",
      description: "A collection of bold graphic explorations — key visuals, campaign creatives and design experiments.",
      cover: "cover-creative",
      images: [],
      videoEmbed: "",
      behanceProjectId: "250526649",
      link: "https://www.behance.net/gallery/250526649/Creative-Designs",
    },
    {
      title: "AI Website",
      category: "AI × Web",
      year: "2026",
      description: "A website concept designed and built with AI-assisted workflows — from ideation to polished interface.",
      cover: "cover-ai-website",
      images: [],
      videoEmbed: "",
      behanceProjectId: "250495271",
      link: "https://www.behance.net/gallery/250495271/AI-Website",
    },
    {
      title: "Emailer Design",
      category: "Email Marketing",
      year: "2026",
      description: "Email newsletters with strong visual hierarchy — designed to be opened, read and clicked.",
      cover: "cover-emailer",
      images: [],
      videoEmbed: "",
      behanceProjectId: "250525969",
      link: "https://www.behance.net/gallery/250525969/Emailer-Design",
    },
    {
      title: "AI YT Thumbnails",
      category: "YouTube · AI",
      year: "2025",
      description: "Click-worthy YouTube thumbnails crafted with AI tools — built on 7 years of YouTube growth instincts.",
      cover: "cover-thumbnails",
      images: [],
      videoEmbed: "",
      behanceProjectId: "232938571",
      link: "https://www.behance.net/gallery/232938571/AI-YT-Thumbnails-design",
    },
    {
      title: "AI Videos",
      category: "AI Video",
      year: "2025",
      description: "Video generation and editing experiments with Runway, HeyGen and friends — scaling creative output with AI.",
      cover: "cover-ai-videos",
      images: [],
      videoEmbed: "",
      behanceProjectId: "232940741",
      link: "https://www.behance.net/gallery/232940741/AI-Videos",
    },
    {
      title: "Wealthy YT Ads",
      category: "Ad Campaign",
      year: "2025",
      description: "Performance marketing video campaign for Wealthy — hooks, CTAs and edits optimized for YouTube ads.",
      cover: "cover-wealthy",
      images: [],
      videoEmbed: "",
      behanceProjectId: "232522589",
      link: "https://www.behance.net/gallery/232522589/Wealthy-YT-Ads-CAMPAIGN-Videos",
    },
    {
      title: "Social Media Designs",
      category: "Social Media",
      year: "2024",
      description: "Daily and campaign-based social creatives across Instagram, LinkedIn and more — cohesive, on-brand, scroll-stopping.",
      cover: "cover-social",
      images: [],
      videoEmbed: "",
      behanceProjectId: "218001529",
      link: "https://www.behance.net/gallery/218001529/Social-Media-Designs",
    },
    {
      title: "Podcast Videos",
      category: "Video Production",
      year: "2024",
      description: "Podcast production from concept to execution — shooting, editing and short-form clips for social.",
      cover: "cover-podcast",
      images: [],
      videoEmbed: "",
      behanceProjectId: "218001379",
      link: "https://www.behance.net/gallery/218001379/Podcast-Videos",
    },
    {
      title: "Trailer Video",
      category: "Video · Edit",
      year: "2024",
      description: "High-energy trailer edit — pacing, sound design and story compressed into seconds.",
      cover: "cover-trailer",
      images: [],
      videoEmbed: "",
      behanceProjectId: "217989345",
      link: "https://www.behance.net/gallery/217989345/Trailer-Video",
    },
    {
      title: "Motion Graphic",
      category: "Motion Design",
      year: "2024",
      description: "Motion graphics that bring static brands to life — After Effects experiments and client work.",
      cover: "cover-motion",
      images: [],
      videoEmbed: "",
      behanceProjectId: "218106207",
      link: "https://www.behance.net/gallery/218106207/Motion-Graphic",
    },
  ],

  /* ------------------------------------------------------------------
     HERO STORY — a 4-scene character journey pinned to the first scroll.
     Upload files named story-1, story-2, story-3, story-4 next to
     index.html — each can be a VIDEO (.mp4 / .webm — e.g. your own
     After Effects renders) or an image (.png/.jpg/.gif). The stage
     stays completely hidden until at least one file exists.
     Scene idea: at the desk → laptop on fire → working on a cloud →
     free-falling (last scene reacts to scroll speed & direction).
     ------------------------------------------------------------------ */
  story: [
    { media: "story-1", caption: "9 AM — designing things that convert" },
    { media: "story-2", caption: "Deadline mode: laptop on fire" },
    { media: "story-3", caption: "Head in the clouds — best ideas live up here" },
    { media: "story-4", caption: "Free-falling into the next big idea" },
  ],

  /* ------------------------------------------------------------------
     SHOWREEL — the video section. Visitors click a title to load and
     play it on the big stage. For each item use ONE of:
       youtubeId:        "dQw4w9WgXcQ"  ← from youtube.com/watch?v=XXXX
       behanceProjectId: "232522589"    ← plays that Behance project
     YouTube plays fullscreen 16:9 and looks best — paste IDs when ready.
     ------------------------------------------------------------------ */
  showreel: [
    { title: "Wealthy YT Ads Campaign", label: "Ad Films",   cover: "cover-wealthy",   youtubeId: "", behanceProjectId: "232522589" },
    { title: "Podcast Videos",          label: "Production", cover: "cover-podcast",   youtubeId: "", behanceProjectId: "218001379" },
    { title: "Trailer Video",           label: "Edit",       cover: "cover-trailer",   youtubeId: "", behanceProjectId: "217989345" },
    { title: "AI Videos",               label: "AI",         cover: "cover-ai-videos", youtubeId: "", behanceProjectId: "232940741" },
    { title: "Motion Graphic",          label: "Motion",     cover: "cover-motion",    youtubeId: "", behanceProjectId: "218106207" },
  ],

  /* ------------------------------------------------------------------
     CAREER SHORTS — your resume as tappable phone stories.
     Tap right side = next chapter, left = back. Auto-advances.
     ------------------------------------------------------------------ */
  shorts: [
    {
      emoji: "🎬", company: "MIRAE ASSET", role: "Design Studio Lead", period: "OCT 2025 — NOW",
      points: ["Lead the end-to-end creative studio", "Brand films · podcasts · landing pages", "AI-powered design & video workflows"],
    },
    {
      emoji: "🚀", company: "WEALTHY", role: "Associate Creative Head", period: "2022 — 2025",
      points: ["Cross-platform content leadership", "Launched Bulls Eye & ran Welocity", "UX/UI for the internal CRM"],
    },
    {
      emoji: "📺", company: "UNACADEMY", role: "Studio Operations Specialist", period: "2019 — 2022",
      points: ["2000+ educational videos produced", "+1M subscribers in a single month", "20+ studios built · 100+ channels"],
    },
    {
      emoji: "🎓", company: "CSVTU BHILAI", role: "Bachelor of Engineering", period: "2013 — 2020",
      points: ["Engineer turned storyteller", "Fell in love with visual storytelling", "7 years of design ever since"],
    },
  ],

  // The flashlight TOOLBOX wall — your real stack (move the light to reveal)
  toolbox: [
    "Premiere Pro", "After Effects", "Photoshop", "Illustrator", "Lightroom",
    "DaVinci Resolve", "Final Cut Pro", "Figma", "Canva", "OBS Studio",
    "YouTube Studio", "Meta Business", "Notion", "Runway ML", "MidJourney",
    "HeyGen", "ChatGPT", "Veed.io", "ElevenLabs", "Trello",
  ],

  // Services accordion (straight from the resume)
  services: [
    {
      title: "Video Production",
      description: "End-to-end video: in-house and on-location shoots, brand films, podcasts, trailers and edits — cameras, lighting, sound and story all handled.",
      tags: ["Shoots", "Editing", "Podcasts", "Brand films", "Premiere Pro", "DaVinci"],
    },
    {
      title: "Graphic Design",
      description: "Social media creatives, YouTube thumbnails, emailers and campaign visuals with strong hierarchy and stronger hooks.",
      tags: ["Social media", "Thumbnails", "Emailers", "Campaigns", "Photoshop", "Illustrator"],
    },
    {
      title: "UI / UX & Web",
      description: "User flows, wireframes and conversion-focused landing pages — plus design systems that keep brands consistent everywhere.",
      tags: ["User flows", "Wireframes", "Landing pages", "Design systems", "Figma"],
    },
    {
      title: "AI-Powered Content",
      description: "Scaling creative output with AI — faster edits and variants, script and caption generation, ideation and motion experiments.",
      tags: ["Runway ML", "MidJourney", "HeyGen", "ChatGPT", "Veed.io"],
    },
  ],
};
