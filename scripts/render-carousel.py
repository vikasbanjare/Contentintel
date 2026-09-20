#!/usr/bin/env python3
"""Render a LinkedIn carousel HTML file to a PDF document post.

Drives the pre-installed Chromium directly — no Python packages needed.
Never run `playwright install`; the browser is already on disk.

Each slide must be a top-level element sized exactly 1080x1350 with a page
break after it:

    <section class="page"> ... </section>

    .page { width: 1080px; height: 1350px; break-after: page; overflow: hidden; }
    @page { size: 1080px 1350px; margin: 0; }

Usage:
    python3 scripts/render-carousel.py linkedin/daily/2026-09-20/carousel.html
    python3 scripts/render-carousel.py <in.html> <out.pdf>   # explicit output
    python3 scripts/render-carousel.py <in.html> --png       # also shoot page 1 as PNG
"""
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

W, H = 1080, 1350

CANDIDATES = [
    "/opt/pw-browsers/chromium-*/chrome-linux/chrome",
    "/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell",
]


def find_chromium():
    if os.environ.get("CHROMIUM_BIN"):
        return os.environ["CHROMIUM_BIN"]
    root = pathlib.Path("/opt/pw-browsers")
    if root.is_dir():
        for pattern in ("chromium-*/chrome-linux/chrome",
                        "chromium_headless_shell-*/chrome-linux/headless_shell"):
            hits = sorted(root.glob(pattern))
            if hits:
                return str(hits[-1])
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    return None


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=180)


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    flags = {a for a in argv[1:] if a.startswith("--")}

    if not args:
        print(__doc__)
        return 2

    src = pathlib.Path(args[0]).resolve()
    if not src.is_file():
        print(f"error: no such file: {src}", file=sys.stderr)
        return 1

    out = pathlib.Path(args[1]).resolve() if len(args) > 1 else src.with_suffix(".pdf")

    chrome = find_chromium()
    if not chrome:
        print("error: no Chromium found. Set CHROMIUM_BIN=/path/to/chrome", file=sys.stderr)
        return 1

    slides = len(re.findall(r'class=["\'][^"\']*\bpage\b', src.read_text(encoding="utf-8")))

    base = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        # Let webfonts and any deferred layout settle before painting.
        "--virtual-time-budget=8000",
    ]

    with tempfile.TemporaryDirectory() as profile:
        base.append(f"--user-data-dir={profile}")

        r = run(base + ["--no-pdf-header-footer", f"--print-to-pdf={out}", src.as_uri()])
        if not out.is_file():
            print("error: Chromium produced no PDF.", file=sys.stderr)
            print((r.stderr or r.stdout or "").strip()[-1500:], file=sys.stderr)
            return 1

        if "--png" in flags:
            shot = out.with_name(f"{out.stem}-01.png")
            run(base + [f"--screenshot={shot}", f"--window-size={W},{H}", src.as_uri()])
            if shot.is_file():
                print(f"  {shot.name}  (page 1 — open it and check it reads small)")

    print(f"{out}  ({slides} slides, {out.stat().st_size / 1024:,.0f} KB)")
    if slides == 0:
        print("warning: no elements with class 'page' found — check the HTML.", file=sys.stderr)
    elif slides > 10:
        print(f"warning: {slides} slides. Carousels over 10 lose people.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
