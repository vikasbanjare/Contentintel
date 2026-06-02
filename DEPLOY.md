# ContentIntel — deploy & maintain

A pre-publish checker (Script · Thumbnail · Title · Ads) that grades content
using **the visitor's own Anthropic API key**. Fully static — no backend.

## Files

| File | What it is |
|---|---|
| `index.html` / `ContentIntel.html` | The built app (identical; `index.html` is the deploy entry). **Generated — don't hand-edit.** |
| `research.js` | **The one file you edit day-to-day.** Your methodology, fed to Claude as the system prompt for each check. |
| `project/*.jsx`, `project/*.css` | Modular source of the app. |
| `build.py` | Rebuilds `index.html` + `ContentIntel.html` from `project/` and copies `research.js` to the root. |

## Deploy (Vercel / Netlify / any static host)

1. Push this repo.
2. Point the host at the repo root. **No build command needed** — it's static
   HTML. (Output dir = repo root; framework = "Other".)
3. Done. `index.html` is served by default.

> The app loads React + Babel from unpkg at runtime, so the host needs no build step.

## How users run checks (BYO key)

- Click **Add API key** (top-right) → paste an Anthropic key (`sk-ant-…`) → pick a model.
- The key is stored **only in their browser** (localStorage) and sent **directly**
  to `api.anthropic.com` with the `anthropic-dangerous-direct-browser-access` header.
  It never touches a server of ours.
- With no key, every tab still shows a **sample report** so the product is demoable.
- Each **Analyze** button shows an **estimated token count** before running, and
  the **actual tokens + approximate cost** after.

Model list and (approximate) pricing live at the top of
`project/ci-engine.jsx` (`CI_MODELS`). Update prices there if Anthropic's change,
then `python3 build.py`.

## Your private research section

There's an editor that **only you** can see. Other people you share the link with
never see the Research tab or the lock icon.

**Unlock it (once per browser):** open the site with `?admin=contentintel`. The app
remembers it on that browser, so the lock icon appears top-right from then on.
(`Lock & exit` in the editor hides it again — handy on shared screens.)

**Two save modes:**
- **Save (private to this browser)** — your edits persist in *your* browser
  (localStorage) and are used in *your own* analyses immediately. They never reach
  other visitors. Use this to keep adding findings day-to-day with zero redeploy.
- **Download research.js (publish to all)** — when you want everyone to benefit,
  download the file, replace the repo's `research.js`, commit, and redeploy.

You can also edit `research.js` by hand (schema at the top of the file). Either way
the app code is untouched — you never "rebuild the whole website."

**The data:** `research.js` has a shared `core` (your neuroforecasting + Indian-context
foundation, injected into *every* check) plus per-check `systemGuidance` + `rubric`.

> ⚠️ Honest limit: a static site ships `research.js` to the browser, so *published*
> research is readable by anyone who inspects the page. The lock keeps the **editor**
> private and the **private-draft** layer never ships — but don't put secrets/credentials
> in research. It's evaluation methodology. True server-side privacy needs a backend.

### Change the admin passphrase
Edit `ADMIN_PASS` in `project/ci-engine.jsx`, then `python3 build.py`.

## Rebuilding the app after editing `project/`

```bash
python3 build.py
```

Regenerates `index.html` and `ContentIntel.html` and copies `research.js` to root.
