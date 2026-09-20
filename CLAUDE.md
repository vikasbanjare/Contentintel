# CLAUDE.md

Two things live in this repo.

## 1. ContentIntel — the web app

A pre-publish checker for creators. Static site (GitHub Pages) + a Cloudflare Worker
API + Supabase.

- `index.html` is **generated**. Edit sources in `src-v2/`, then `python3 build-v2.py`.
  Never hand-edit `index.html`.
- `worker.js` — Cloudflare Worker: Anthropic proxy, auth, plan limits, research.
- `schema.sql` — Supabase schema. Safe to re-run.
- `SETUP.md` — deploy steps. `README.md` — file manifest and the research system.
- Research files are additive. **Never edit an existing `research-N.js`** — add the
  next number and merge via `window.addResearch({...})`.

## 2. The LinkedIn Machine — `linkedin/` + `.claude/`

An agentic harness that turns one raw opinion a day into a reviewed LinkedIn post,
plus a daily engagement queue. Start at `linkedin/README.md`.

```
/li-daily <thought>   raw idea → review pack (3 variants, hooks, critique, risk check)
/li-engage            paste feed posts → REPLY/SKIP triage + drafted comments
/li-reply             your post's comments → drafted replies
/li-image             post → image, PDF carousel, chart or diagram
/li-log               record what you posted + numbers (feeds the learning loop)
/li-voice             recalibrate voice.md from real posts
```

Skills: `linkedin-post`, `linkedin-engagement`, `linkedin-visual`.
Adversarial reviewer subagent: `li-critic`.

### Rules when working on LinkedIn content

- **Never post to LinkedIn.** Nothing here is authorised to publish. Every output is
  a draft for Vikas to paste himself. See "Why no auto-posting" in `linkedin/README.md`.
- **Never invent a fact.** No numbers, users, timeframes or outcomes he didn't supply.
  Write `[NEEDS: …]` inline instead. A fabricated statistic on his real profile is the
  worst failure mode in this repo.
- **`linkedin/voice.md` overrides every other style instinct**, including yours.
- Always run the `anti-ai-writing` skill as the final pass on any draft.
- Carousels: build HTML from `linkedin/assets/carousel-template.html`, render with
  `python3 scripts/render-carousel.py <file.html> --png`, then **look at the PNG**
  before calling it done.
- Fonts must come from `linkedin/assets/fonts.css` (base64-embedded). Headless
  Chromium here does not reliably fetch Google Fonts and silently falls back.
  Regenerate with `python3 scripts/fetch-fonts.py`.

## Conventions

- No build system beyond the two Python scripts. No npm, no bundler. Keep it that way.
- Python 3 standard library only — no pip installs for the render scripts.
