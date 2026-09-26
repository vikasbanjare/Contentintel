# Vendored — not our code

Upstream: https://github.com/sergebulaev/instagram-skills
Commit:   2919f0a6d8b148e101162713bb6ca9066cf739f6 (2026-09-17)
Vendored: 2026-09-26
Licence:  MIT (Sergey Bulaev) — see LICENSE

**Do not hand-edit anything in this directory.** To update, re-clone upstream and
re-copy. Local changes will be lost and make the next update painful. If something
here needs to behave differently for this repo, wrap it from a `/li-*` command or
a note in CLAUDE.md instead.

## What was copied

`SKILL.md` (the router), `skills/` (9 sub-skills), `references/`, `lib/`,
`requirements.txt`, `.env.example`, `README.md`, `LICENSE`.

## What was left out

- `.codex-marketplace/` — a byte-for-byte duplicate of the bundle for Codex
- `.github/` — upstream's own CI
- `assets/` — marketing images
- `scripts/` — upstream's repo-lint scripts, meaningless outside their CI

## Review notes (checked before installing)

- MIT licensed.
- Outbound calls go only to the three services it declares: `api.publora.com`
  (publishing), `api.apify.com` (reading public IG data), `api.pixfaro.com`
  (image generation). Other instagram.com URLs in the source are example strings
  and URL-parsing patterns, not requests.
- One `subprocess` call, in `lib/backend_selector.py`. It runs only the command
  you put in `INSTAGRAM_SKILLS_CUSTOM_POSTER`, uses `shlex.split`, and does not
  use `shell=True`. Unset by default.
- No `eval`, no `exec`, no `os.system`.
- Reads one env var directly (`APIFY_TOKEN`); the rest go through `lib/_env.py`.

## Setup

**None needed.** Tier 0 is the default: it drafts captions, hooks, hashtags and
slide plans, and hands them to you to post in the Instagram app.

Keys are only for auto-publishing (Publora), reading competitor data (Apify) and
generating images (Pixfaro). If you add them, put them in `.env` — `.gitignore`
already blocks it. Publora needs an Instagram **Business or Creator** account.

## Unlike the LinkedIn harness, this one can publish

`linkedin/` never posts anything. This bundle **can**, if you set
`PUBLORA_API_KEY`. It gates every publish behind an explicit approval step
(`lib/approval.py`), but the capability exists, which the LinkedIn side
deliberately does not have. Worth knowing before you add a key.
