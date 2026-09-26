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
/li-idea <thought>    two-second capture into linkedin/ideas.md
/li-mine [7d]         mine git history for post angles; writes to ideas.md
/li-week              plan the week's 3-5 posts from the bank, balanced
/li-daily <thought>   raw idea → review pack (3 variants, hooks, critique, risk check)
/li-engage            paste feed posts → REPLY/SKIP triage + drafted comments
/li-reply             your post's comments → drafted replies
/li-image             post → image, PDF carousel, chart or diagram, built here
/li-prompt            post → paste-ready design prompts for claude.ai / ChatGPT
/li-image check <p>   check a design made elsewhere before it goes out
/li-log               record what you posted + numbers (feeds the learning loop)
/li-repurpose         a post that worked → carousel, thread, newsletter
/li-profile           one-time pass on headline, About, featured, banner
/li-voice             recalibrate voice.md from real posts
```

State files: `ideas.md` (the bank), `people.md` (relationship memory),
`log/posts.jsonl` (append-only outcomes), `weeks/` (plans).
`/li-engage` reads and updates `people.md` — a reply that references real history
beats any cold comment, and the `open` field is what makes that possible.

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
- **Words are set in HTML; art comes from an image model.** Never emit a prompt
  asking an image model to render a headline, quote, stat or label — it returns
  *nearly* right text and the error survives to the feed. Needs both → image model
  makes a plate with no text, type goes on top in HTML. Routing and templates live
  in `linkedin/design-prompts.md`.
- Fonts must come from `linkedin/assets/fonts.css` (base64-embedded). Headless
  Chromium here does not reliably fetch Google Fonts and silently falls back.
  Regenerate with `python3 scripts/fetch-fonts.py`.

## 3. Instagram — `.claude/skills/instagram-marketing/`

Vendored third-party bundle from https://github.com/sergebulaev/instagram-skills
(MIT). Nine sub-skills behind one router skill, `instagram-marketing`: caption
writing, carousel planning, hook extraction, hashtag sizing, AI-tell removal,
weekly planning, repurposing, profile audit, audience insights.

- **Do not hand-edit it.** Re-clone upstream to update. See `VENDORED.md` in that
  directory for provenance, what was excluded, and the pre-install review.
- **It works with no API keys** (Tier 0: drafts only, you post in the app).
- **It CAN publish** if `PUBLORA_API_KEY` is set — unlike `linkedin/`, which never
  posts. Every publish is gated behind `lib/approval.py`, but the capability is
  real. `.env` is gitignored; never commit a key.
- `ig-repurposer` takes a LinkedIn post and adapts it into a native Instagram
  carousel or caption, so it pairs directly with `/li-repurpose` and the packs in
  `linkedin/daily/`.
- Its `references/voice-profile.md` and `voice-rules.md` are the bundle's own and
  are Instagram-specific. For anything that will carry Vikas's name,
  `linkedin/voice.md` still wins on register, banned phrases and hard rules.

## Conventions

- No build system beyond the two Python scripts. No npm, no bundler. Keep it that way.
- Python 3 standard library only for **our** scripts in `scripts/` — no pip installs.
  The vendored `instagram-marketing` bundle is exempt: it needs `requests` and
  `python-dotenv`, and only when you actually enable a backend. Tier 0 needs neither.
