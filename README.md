# ContentIntel — Pre-publish Checker

AI-powered pre-publish checker for creators, marketers and agencies. Script, thumbnail, title, ads — graded the way the algorithm grades them, fixed before they go live. Dark + light mode, animated UI, works in any language.

## Deploy (GitHub Pages) — upload ALL of these to the repo root, main branch

| # | File | Why it matters |
|---|------|----------------|
| 1 | `index.html` | The entire app |
| 2 | `research.js` | Base research + the additive merge engine |
| 3 | `research-2.js` | Hook patterns + CTA examples |
| 4 | `research-3.js` | Generation-ready thumbnail prompt rules |
| 5 | `research-4.js` | Hook swipe file, mood map, Ask knowledge base, CTR benchmarks |
| 6 | `research-5.js` | Anti-cringe hooks, creator-slides originals, Studio design research |
| 7 | `research-6.js` | **Thumbnail aesthetics: realistic faces, pro typography, colour science** |
| 8 | `.nojekyll` | Empty file — REQUIRED or GitHub Pages fails to build |
| 9 | `README.md` | This file |

**⚠ If a research-N.js file is missing, the app still runs but silently loses that
research.** Upload every one of them.

Settings → Pages → Deploy from branch → main → / (root).

## The 9 tools
Script (hook/retention/CTA + hook-locked rewrites) · Thumbnail (A/B/C + ChatGPT/Gemini regen) · Title · Ads · Ask (growth Q&A) · Studio · Platform IQ · Playbook · History (full saved reports).

## Growing the research
NEVER edit existing research files. Create `research-7.js`:
```js
window.addResearch({ script: { systemGuidance: `...new findings...` } });
```
…then add `<script src="research-7.js"></script>` after research-6 in index.html and upload both. Strings append, arrays concatenate — nothing is ever lost.

## Rebuilding the app
`python3 build-v2.py` regenerates index.html from `src-v2/` sources.

## Keys
Anthropic API key lives only in the visitor's browser (localStorage), sent directly to Anthropic. Admin research editor: `?admin=vikas-intel-2026`.
