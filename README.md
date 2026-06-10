# ContentIntel — Pre-publish Checker

AI-powered pre-publish checker for content creators. Paste your script, thumbnail, title or ad copy and get a scored analysis with specific fixes before you hit publish.

## What it does

- **Script check** — hook strength, retention curve, open loops, STEPPS shareability, CTA. Includes a rewriter that applies proven virality techniques to your specific weak spots, an 80-formula hook swipe file, and one-click "Apply + Re-analyze".
- **Thumbnail check** — squint test, composition, face/emotion, text legibility, feed pop, curiosity gap. Supports A/B/C 3-way comparison.
- **Title check** — curiosity gap, mobile truncation, 10 labelled alternatives.
- **Ads check** — platform char limits, scroll-stopping power, 3-trigger framework.

## How to use

1. Open `index.html` in a browser — or host it on GitHub Pages / Netlify
2. Add your Anthropic API key in Settings (top-right) — stored only in your browser
3. Paste your content and hit Analyze

Runs entirely client-side. No server, no backend; your key goes directly to Anthropic.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full app (self-contained) |
| `research.js` | Research data loaded at runtime — edit to improve analysis, no rebuild needed |
| `.nojekyll` | Required for GitHub Pages (stops Jekyll from breaking the build) |

All files must be in the same folder.

## Editing the research

Open `research.js` — every string you improve makes the analysis smarter. It includes the universal virality science, the 5 viral hook forces, saturation detection, the 7-day audience mood map, an 80-formula hook swipe file, and 10 thumbnail niche playbooks.
