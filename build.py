#!/usr/bin/env python3
"""Build self-contained ContentIntel.html + index.html from the modular sources.

research.js is intentionally loaded as an EXTERNAL <script> (not inlined) so the
owner can edit research and redeploy without rebuilding the app.
"""
import shutil, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
PROJ = ROOT / "project"

CSS_FILES = ["styles.css", "contentintel.css"]
# Load order matters: ui defines MOODS/primitives before ci-engine consumes them.
JSX_FILES = [
    "tweaks-panel.jsx",
    "ui.jsx",
    "ci-engine.jsx",
    "ci-shell.jsx",
    "ci-results.jsx",
    "ci-script.jsx",
    "ci-tabs.jsx",
    "ci-research.jsx",
    "ci-app.jsx",
]

def read(p):
    return (PROJ / p).read_text(encoding="utf-8")

css = "\n\n".join(f"/* ===== {f} ===== */\n{read(f)}" for f in CSS_FILES)
jsx = "\n".join(
    f'<script type="text/babel" data-presets="react">\n/* ===== {f} ===== */\n{read(f)}\n</script>'
    for f in JSX_FILES
)

HTML = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ContentIntel — Pre-publish checker</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="Pre-publish checker for creators — grade your script, thumbnail, title and ads before you hit publish. Runs on your own Anthropic API key." />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Bricolage+Grotesque:wght@600;700;800&display=swap" rel="stylesheet">

  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>

  <style>
    :root {{
      --font-display: 'Space Grotesk', system-ui, sans-serif;
      --font-ui: 'Manrope', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --display-tracking: -0.025em;
      --display-case: none;
      --ui-size: 14px;
    }}
    html, body {{ margin: 0; padding: 0; background: #07090E; color: #f2f4fa; min-height: 100%; }}
    body {{ font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }}
{css}
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- RESEARCH DATA — external on purpose. Edit research.js + redeploy; the app
       below never needs to change. -->
  <script src="research.js"></script>

{jsx}
</body>
</html>
"""

for out in ["ContentIntel.html", "index.html"]:
    (ROOT / out).write_text(HTML, encoding="utf-8")
    print("wrote", out, f"({len(HTML):,} bytes)")

shutil.copyfile(PROJ / "research.js", ROOT / "research.js")
print("copied research.js to repo root")
