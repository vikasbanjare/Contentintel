#!/usr/bin/env python3
"""Build index.html for the v2 app from src-v2/ sources. New jsx files in
NEW_SECTIONS are inserted automatically. Research stays external."""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src-v2"
TPL = ROOT / "index.html"
RESEARCH_TAGS = []  # research now lives server-side in the Worker (not shipped to the browser)
# name -> insert before this existing section's script block
NEW_SECTIONS = {"ci-pricing.jsx": "ci-app.jsx", "ci-account.jsx": "ci-app.jsx", "ci-gate.jsx": "ci-app.jsx", "ci-feedback.jsx": "ci-app.jsx"}

def load(name):
    return SRC.joinpath(name).read_text(encoding="utf-8").rstrip("\n")

tpl = TPL.read_text(encoding="utf-8")
m = re.search(r"(<style>\n)([\s\S]*?)(\n\s*</style>)", tpl)
body = m.group(2)
head_css = body[: body.find("/* ===== styles.css ===== */")]
tpl = tpl[: m.start(2)] + (head_css + "/* ===== styles.css ===== */\n" + load("styles.css")
      + "\n\n/* ===== contentintel.css ===== */\n" + load("contentintel.css")) + tpl[m.end(2):]

out, pos, n = [], 0, 0
for m in re.finditer(r'(<script type="text/babel"[^>]*>)([\s\S]*?)(</script>)', tpl):
    out.append(tpl[pos:m.start(2)])
    nm = re.search(r"/\* ===== ([a-z-]+\.jsx) ===== \*/", m.group(2))
    if nm and SRC.joinpath(nm.group(1)).exists():
        out.append("\n/* ===== " + nm.group(1) + " ===== */\n" + load(nm.group(1)) + "\n"); n += 1
    else:
        out.append(m.group(2))
    pos = m.start(3)
out.append(tpl[pos:])
tpl = "".join(out)

for name, before in NEW_SECTIONS.items():
    if f"/* ===== {name} ===== */" in tpl or not SRC.joinpath(name).exists():
        continue
    anchor = tpl.find(f"/* ===== {before} ===== */")
    so = tpl.rfind('<script type="text/babel"', 0, anchor)
    block = '<script type="text/babel" data-presets="react">\n/* ===== ' + name + ' ===== */\n' + load(name) + '\n</script>\n'
    tpl = tpl[:so] + block + tpl[so:]
    n += 1

# Strip any research-N.js script tags — research is server-side now.
tpl = re.sub(r'\n?\s*<script src="research(?:-\d+)?\.js"></script>', '', tpl)

TPL.write_text(tpl, encoding="utf-8")
rt = 0
print(f"index.html: {len(tpl):,} bytes | {n} sections | scripts {tpl.count('<script')}/{tpl.count('</script>')} | research {rt}/6")
