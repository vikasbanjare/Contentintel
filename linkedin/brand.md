# Visual Brand — LinkedIn

Pulled from the live ContentIntel app (`src-v2/styles.css`) so carousels and images
look like the product, not like a template. If the app's tokens change, update this.

## Colour

**Dark (default for LinkedIn — stands out in a white feed)**

| Token | Hex | Use |
|---|---|---|
| Background | `#07090E` | Page base |
| Surface | `#0B0E14` | Raised panels |
| Text primary | `#F2F4FA` | Headlines, body |
| Text muted | `rgba(242,244,250,0.62)` | Supporting lines, captions |
| Hairline | `rgba(255,255,255,0.07)` | Dividers, card edges |
| Accent | `#4D7CFE` | One element per page, maximum |
| Accent gradient | `#4D7CFE → #FF4D8D` | Page 1 only, or a single rule |

**Light (use when the post is warm, personal, or a teardown of someone else's work)**

| Token | Hex |
|---|---|
| Background | `#F4F6FB` |
| Surface | `#FFFFFF` |
| Text primary | `#0E1119` |
| Accent | `#4D7CFE` |

Pick one mode per carousel. Never mix.

## Type

| Role | Family | Weight | Size (on 1080×1350) |
|---|---|---|---|
| Page-1 headline | Space Grotesk | 700 | 96–128px |
| Page headline | Space Grotesk | 700 | 64–80px |
| Supporting line | Manrope | 500 | 34–40px |
| Caption / label | Manrope | 600, uppercase, `letter-spacing: .08em` | 22px |
| Code, numbers, metrics | JetBrains Mono | 600 | 40–72px |

**Load fonts from `linkedin/assets/fonts.css`, never from Google Fonts.**
Headless Chromium doesn't reliably fetch webfonts at render time here — it silently
falls back to DejaVu Sans and the carousel comes out looking generic. `fonts.css`
has the faces base64-embedded, so the render never touches the network.

```html
<link rel="stylesheet" href="../../assets/fonts.css">
```

(Path is relative to `linkedin/daily/YYYY-MM-DD/`. To add a family:
`python3 scripts/fetch-fonts.py "Space Grotesk:wght@500;700" "Newface:wght@700"` —
it rewrites the whole file, so list every family you want.)

Line height: 1.05 for headlines, 1.45 for body. Headlines never exceed 3 lines.

## Layout — 1080×1350

- Margin: **80px** all sides. Nothing crosses it.
- Bottom-right **160×80px is reserved** — LinkedIn draws the page counter there.
- One idea per page. If a page needs two paragraphs, it's two pages.
- Anchor headlines to the **upper-left**, not centred. Centred everything reads
  like a quote-card account.
- Page 1 has no logo, no name, no handle. Just the promise, as large as it fits.
- Page 10 carries the identity line, small, in muted text.

## Starter CSS

```css
@page { size: 1080px 1350px; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #07090E; }
.page {
  width: 1080px; height: 1350px; break-after: page; overflow: hidden;
  padding: 80px; display: flex; flex-direction: column; justify-content: flex-end;
  background: #07090E; color: #F2F4FA;
  font-family: 'Manrope', system-ui, sans-serif;
  position: relative;
}
.page:last-child { break-after: auto; }
.kicker {
  font-size: 22px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: rgba(242,244,250,.55); margin-bottom: 28px;
}
h1, h2 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; line-height: 1.05; letter-spacing: -0.02em;
}
h1 { font-size: 112px; }
h2 { font-size: 72px; }
.sub { font-size: 36px; line-height: 1.45; color: rgba(242,244,250,.72); margin-top: 32px; max-width: 820px; }
.metric { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 72px; color: #4D7CFE; }
.rule { height: 4px; width: 120px; margin-bottom: 40px;
        background: linear-gradient(90deg, #4D7CFE, #FF4D8D); }
```

## Rules

- **One accent element per page.** A blue rule *or* a blue number, not both.
- **No gradients on text.** They render badly at thumbnail size.
- **No drop shadows, no glows, no glass.** They're for screens, not for a feed thumbnail.
- **No stock photography.** Screenshots of real work, type, and data only.
- **Test at 25%.** Open the rendered page 1 at thumbnail size. If the headline isn't
  readable, it's too small — go bigger, not smaller.
