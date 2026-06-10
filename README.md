# ContentIntel — Pre-publish Checker

AI-powered pre-publish checker for creators, marketers and agencies. Script, thumbnail, title, ads — graded the way the algorithm grades them, fixed before they go live. Dark + light mode. Works in any language.

## The 9 tools

| Tab | What it does |
|-----|-------------|
| **Script** | Hook/retention/CTA scoring, attention curve, beat sheet, 3-tier hook rewrites, one-click apply + re-analyze, .docx upload |
| **Thumbnail** | Single or A/B/C compare, vision analysis, regenerate in ChatGPT (pre-filled) or Gemini (copied) |
| **Title** | Click chance, curiosity gap, mobile truncation, 10 labelled alternatives |
| **Ads** | Meta/Google limits, "See More" trap, CTR benchmarks, compliance (only when needed) |
| **Ask** | Research-grounded growth Q&A — Instagram SEO, algorithm, hashtags, pricing, any language |
| **Studio** | Thumbnail builder |
| **Platform IQ** | Platform-specific intelligence |
| **Playbook** | The proven-patterns library |
| **History** | Past checks, saved on-device |

## Deploy (GitHub Pages)

Upload ALL of these files to the repo root, `main` branch:

1. `index.html` — the entire app
2. `research.js` — base research + the additive merge engine
3. `research-2.js` — additive research
4. `research-3.js` — additive research
5. `research-4.js` — additive research (hook swipe file, mood map, Ask knowledge base…)
6. `.nojekyll` — REQUIRED (empty file; stops Jekyll from breaking the build)
7. `README.md` — this file

Then: Settings → Pages → Deploy from branch → main → / (root).

## Growing the research

NEVER edit research.js / -2 / -3 / -4. To add research, create `research-5.js`:

```js
window.addResearch({ script: { systemGuidance: `...new findings...` } });
```

…then add `<script src="research-5.js"></script>` after research-4 in index.html and upload both. Strings append, arrays concatenate — old research can never be lost.

## Keys

Your Anthropic API key lives only in your browser (localStorage) and goes directly to Anthropic. Admin research editor: open with `?admin=vikas-intel-2026`.
