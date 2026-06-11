/* ============================================================================
   research-6.js — ADDITIVE: THUMBNAIL AESTHETIC EXCELLENCE.
   High CTR is the floor, not the ceiling: every thumbnail must ALSO look like
   a top-tier designer made it. Realistic humans (no AI-face), professional
   typography, disciplined colour. These rules shape every analysis verdict
   AND every generated image prompt (thumbnail regen + Studio upgrades).
   NEVER edit earlier research files — next addition: research-7.js.
   ============================================================================ */
window.addResearch({

  thumbnail: {
    systemGuidance:
`THE DUAL BAR — CTR x AESTHETICS (both must pass; judge and generate to BOTH):
A thumbnail that stops the scroll but looks cheap damages the channel's brand and long-term trust; a beautiful thumbnail that nobody clicks is wallpaper. Score and design for BOTH: (1) the squint/CTR test, AND (2) the designer test — "would a top design studio ship this exact image?" When you write any issue or regeneration prompt, name which bar it serves.

REALISTIC HUMANS — KILL THE AI-FACE (apply to every prompt that includes a person):
Every image prompt with a face MUST include real photography language, because generators default to a waxy, symmetrical, dead-eyed "AI face" without it:
- Camera & lens: "shot on an 85mm portrait lens at f/2.8, shallow depth of field" (or 35mm for environmental shots).
- Skin: "natural skin texture with visible pores and fine lines, no skin smoothing, subtle facial asymmetry" — real faces are asymmetric; perfect symmetry reads as AI instantly.
- Light: "soft directional key light from one side, gentle shadow falloff, natural catchlights in the eyes" — flat even lighting is an AI tell.
- Expression: name a precise candid emotion with muscle detail — "genuine surprised laugh, eyes slightly squinted, head tilted a few degrees" beats "shocked face". Engaged eyes (not vacant stare).
- Grade: "Kodak Portra 400 film emulation, true-to-life skin tones" protects faces from the orange-plastic AI grade.
FORBIDDEN in face prompts (these CAUSE the AI look): "hyperrealistic", "8K", "ultra detailed", "perfect face", "flawless skin", "beautiful person", "stunning". They push generators toward the uncanny waxy default.

TYPOGRAPHY — THUMBNAILS ARE TYPE DESIGN (every prompt with text must specify):
- Name the typeface STYLE precisely: "ultra-bold condensed sans-serif in the style of Anton / Archivo Black / Bebas Neue" for impact text; "clean geometric sans like Montserrat ExtraBold" for modern/premium; a high-contrast serif (Didot/Playfair style) ONLY for luxury/editorial niches.
- Max TWO typefaces per thumbnail. One dominant size + one supporting size. Never three.
- Spec the treatment: exact words in quotes, case ("ALL CAPS"), fill colour, 2-4px contrast outline OR soft drop shadow (never both), tight letter-spacing for impact words.
- Text must be ~3-4 words max, legible at 120px, and the prompt must say "crisp clean vector-sharp lettering, professionally kerned" — otherwise generators produce melted letterforms.
- Integration: text sits ON a deliberate zone (clean background area, colour block, or subtle dark gradient band) — never floating over busy detail.

COLOUR DISCIPLINE — 60-30-10 FOR THUMBNAILS (name the palette in every prompt):
- 60% dominant field (one background colour/scene tone), 30% secondary (subject/clothing/panel), 10% accent (the ONE pop element: text highlight, arrow, prop). Max 4 deliberate colours total.
- Name real palette pairs by mood: drama/tech = deep navy #0D1B2A + electric cyan accent; trust/finance = navy + emerald/green-up; energy/entertainment = charcoal + saturated yellow #FFD400; warm lifestyle = cream #FAF3E0 + terracotta; premium = near-black #0A0A0A + gold; calm/health = sage + warm ivory.
- Cinematic grade beats raw saturation: "subtle teal-and-orange colour grade" (drama), "warm golden-hour grade" (lifestyle), "clean high-key grade" (education). NEVER "vibrant colourful" alone — that produces the rainbow AI mess.
- Skin tones are sacred: accents go AROUND people, never tint the face.
- Contrast is planned: subject-vs-background must be a value (light/dark) contrast, not only a hue contrast — check it survives grayscale.

COMPOSITION POLISH (the quiet difference between pro and amateur):
- One focal point on a rule-of-thirds intersection; eye-line or gesture leads to the text or payoff element.
- Negative space is a feature: ~20-30% of the frame stays calm so the focal point breathes.
- Depth: subject separated from background ("subject in sharp focus, background softly defocused with natural bokeh, gentle rim light separating shoulders from backdrop").
- Edges respected: nothing important within 5% of frame edges; no elements awkwardly cropped mid-limb.

AESTHETIC PROMPT CHECKLIST (run before outputting ANY image prompt):
1. Face: real-photo language present? AI-trigger words removed?
2. Text: typeface style + exact words + treatment specified? "professionally kerned, vector-sharp"?
3. Palette: named colours with 60-30-10 roles? Grade named? Max 4 colours?
4. Composition: focal point placed, negative space reserved, separation/depth described?
5. Finish: ends with a quality anchor — "professional YouTube thumbnail photographed and art-directed by a top creative studio, editorial photography quality, natural film grain".`,
  },

  studio: {
    systemGuidance:
`THUMBNAIL-SPECIFIC AESTHETIC ADDENDUM (applies to every upgrade prompt):
- Faces: always real-photography language (85mm f/2.8, natural skin texture with pores, subtle asymmetry, soft directional key light, Portra-400-style true skin tones, candid micro-expression). Never "hyperrealistic/8K/perfect/flawless" — those CREATE the AI look.
- Text: name the typeface style (Anton/Archivo-Black-style ultra-bold condensed for impact; Montserrat-ExtraBold-style geometric for premium), exact words in quotes, one outline OR one shadow, "professionally kerned, vector-sharp lettering". Max 2 typefaces.
- Colour: state the 60-30-10 palette with named hex values and a named grade (teal-orange / golden-hour / high-key). Max 4 colours; skin tones never tinted.
- End every prompt with: "professional thumbnail art-directed by a top creative studio, editorial photography quality, natural film grain — not an AI-generated look".`,
  },
});
