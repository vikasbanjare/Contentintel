/* ============================================================================
   research-3.js — ADDITIVE: thumbnail generation-prompt quality + CTR science.
   Deploy: upload this file + index.html to GitHub. Never edit research.js or
   research-2.js -- just keep adding numbered files.
   ============================================================================ */
window.addResearch({

  thumbnail: {
    systemGuidance:
`GENERATION-READY PROMPT RULES (all 3 upgrade prompts in the JSON must follow this):
Each upgrade prompt will be used TWO ways: (1) pasted into ChatGPT/Gemini where the user attaches their photo, AND (2) sent directly to an AI image generator (Gemini Imagen, DALL-E 3) WITHOUT the original image. So every prompt must work as a COMPLETE STANDALONE VISUAL SPECIFICATION.

REQUIRED STRUCTURE (use for all 3 tiers):
"[Subject: who, position in frame, expression, rough appearance]. [Text overlay: exact words in quotes, font weight/size, color, background area]. [Background: specific color, scene, or pattern]. [Composition: rule of thirds, lighting]. Photo quality: ultra-sharp, vibrant saturated colors, cinematic professional lighting, 1280×720 YouTube thumbnail."

FORBIDDEN phrases: "KEEP:", "CHANGE ONLY:", "preserve", "maintain", "same as the original" — these don't work in text-to-image generators. Replace with the specific visual description of the FINISHED result.

SPECIFIC QUALITY BOOSTERS (add these to prompts when relevant):
- For faces: "large in frame, direct eye contact, clear exaggerated [emotion: shocked/excited/intense], sharp facial details, well-lit with separation from background"
- For text legibility: "ultra-bold [color] text '[exact words]', [font size descriptor], high contrast against [background], readable at 120px"
- For composition: "one clear focal point, strong figure-ground separation, rule of thirds, generous negative space"
- For CTR impact: "scroll-stopping at thumbnail size, bold contrasting palette, designed to pop against competing videos on YouTube"

HIGH-CTR PROMPT ENDING (append to every tier's prompt):
"Commercial photography quality, ultra-sharp, vibrant saturated colors, cinematic studio lighting, photorealistic detail. Designed for maximum click-through rate as a YouTube thumbnail."`,

    notes:
`OUTPUT PRIORITY: (1) the 3 upgrade prompts must each be a complete image-gen-ready visual specification — not an editing instruction. (2) Each tier must differ SHARPLY in scope: Tier 1 is a refined version of the same concept; Tier 2 is a new layout with the same subject and text; Tier 3 is a bold creative reinvention. (3) Every prompt ends with the standard quality footer above.`,
  },

  // Shared CTR science additions -- injected into every check.
  core:
`THUMBNAIL HIGH-CTR FORMULA (2025 data — use when evaluating or generating thumbnail prompts):
Ranked by CTR impact (highest first):
1. FACE SIZE & EMOTION: a face that fills ≥30% of the frame with a clear, exaggerated emotion (shocked, excited, intense) lifts CTR ~30-40%. Direct eye contact outperforms eyes-closed. Neutral expressions are the single biggest opportunity cost.
2. TEXT: ≤4 bold words, readable at 120px (that's 2" on a phone). Light text on dark (or dark on light), always with an outline or shadow. Keywords/numbers beat generic phrases. Yellow or white are the highest-visibility colors in thumbnails.
3. CONTRAST & COLOR: high-saturation, complementary palette (teal/orange, blue/yellow, purple/yellow). One dominant accent color. Thumbnails that match the YouTube UI red/white blend in and disappear.
4. SINGLE FOCAL POINT: the "squint test" — blur your eyes and there should be ONE thing you look at. Every element beyond that is cognitive load.
5. CURIOSITY GAP: the thumbnail should tease the answer, not give it. "I tried X" > "X is good". The viewer needs a reason to click to find out.
6. PATTERN INTERRUPT: if every thumbnail in the niche is dark/blue, go bright/warm. If they all have big text, try a close-up face with no text. Visible difference = click.`,

});
