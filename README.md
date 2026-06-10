# ContentIntel — Pre-publish Checker

AI-powered pre-publish checker for content creators. Paste your script, thumbnail, title or ad copy and get a scored analysis with specific fixes before you hit publish.

## What it does

- **Script check** — hook strength, retention curve, open loops, STEPPS shareability, CTA. Includes a rewriter that applies proven virality techniques to your specific weak spots.
- **Thumbnail check** — squint test, composition, face/emotion, text legibility, feed pop, curiosity gap.
- **Title check** — curiosity gap, mobile truncation, 10 labelled alternatives.
- **Ads check** — platform char limits, scroll-stopping power, 3-trigger framework.

## How to use

1. Open `index.html` in a browser — or host it anywhere (GitHub Pages, Netlify, etc.)
2. Add your Anthropic API key in Settings (top-right) — key is stored only in your browser
3. Paste your content and hit Analyze

The app runs entirely client-side. No server, no backend, no data sent anywhere except directly to Anthropic.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full app (self-contained) |
| `research.js` | Research data loaded at runtime — edit this to improve analysis without rebuilding |

Both files must be in the same folder / served from the same domain.

## Editing the research

Open `research.js` to improve what ContentIntel knows. Every string you update makes the analysis smarter — no code rebuild needed.

For private edits: open the site with `?admin=vikas-intel-2026` to unlock the Research tab in the browser.
