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

## Updating your research (no rebuild of the app)

Two ways — both only change `research.js`:

**A. In-app editor (recommended)**
1. Open the site with `?admin=contentintel` (or click the **lock icon** top-right
   and enter the passphrase).
2. Edit the methodology / rubric per check in the **Research** tab.
3. Click **Apply for this session** to test it live with a real analysis.
4. Click **Download research.js**, replace the repo's `research.js`, commit, redeploy.

**B. By hand** — edit `research.js` directly (schema documented at the top of the file), commit, redeploy.

Either way the app code is untouched — you never "rebuild the whole website."

### Change the admin passphrase
Edit `ADMIN_PASS` in `project/ci-engine.jsx`, then `python3 build.py`.

> ⚠️ **Honest security note:** this is a static site, so the admin gate is
> obscurity-level — the passphrase is visible to anyone who reads the source.
> The *real* protection is that the live site only changes when **you commit
> `research.js`** — a visitor toggling the editor can't alter what others see.
> If you need true private editing/auth, that requires a backend.

## Rebuilding the app after editing `project/`

```bash
python3 build.py
```

Regenerates `index.html` and `ContentIntel.html` and copies `research.js` to root.
