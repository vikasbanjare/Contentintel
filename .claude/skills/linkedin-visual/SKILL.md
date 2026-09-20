---
name: linkedin-visual
description: Create the visual for a LinkedIn post — a single image, a swipeable PDF carousel, a diagram, or a screenshot treatment. Decides whether a visual helps at all, then builds it at the right dimensions. Use when the user invokes /li-image, asks for an image or carousel for a post, or when a drafted post needs a visual.
---

# LinkedIn Visual

## First: does this post need a visual at all?

Answer honestly before making anything. A decorative image **costs** reach — it adds
a load, splits attention, and signals "marketing" to a reader who was about to read
a person's opinion.

| Post | Visual |
|---|---|
| Opinion, story, autopsy, reversal | **None.** Text-only. The writing is the artifact. |
| A claim about a number or trend | **Chart** — the data is the argument. |
| A before/after, a UI teardown | **Screenshot(s)** — the specific pixels are the point. |
| A process, architecture, or system | **Diagram** — only if it genuinely clarifies. |
| Teaching something in 5–9 steps | **Carousel** — highest dwell format on the platform. |
| Everything else | **None.** |

If the answer is none, say so in one line and stop. That's a successful run of this
skill. Do not talk yourself into a stock-photo-shaped image.

---

## Specs

| Type | Size | Notes |
|---|---|---|
| Single image | 1200×628 or 1200×1200 | Square wins more feed height on mobile. |
| Carousel (PDF) | 1080×1350 per page, 6–10 pages | Portrait. Uploaded as a *document* post. |
| Screenshot | Native, cropped tight | Add 40–60px padding on a flat background. |
| Chart | 1200×1200 | Load the `dataviz` skill before building any chart. |

**Non-negotiables**
- Readable at thumbnail size. Open it at 25% — if the headline is unreadable, redo it.
- No watermarks, no third-party branding, no stock photography of people in offices.
- Max ~12 words on any single frame.
- High contrast. Assume it's being read one-handed on a phone in daylight.
- Never put text in the bottom-right corner of a carousel page — the page counter sits there.

---

## Building a carousel

Carousels are a **PDF document post** on LinkedIn. Build them as HTML and render
locally — that gives full typographic control and is reproducible.

### Structure

```
Page 1   The promise. 6 words, huge. This is the thumbnail — it's 80% of the result.
Page 2   The problem, concretely.
Page 3-8 One idea per page. One headline + one supporting line. Nothing more.
Page 9   Summary — every point on one page, so people screenshot it.
Page 10  One line on who the user is. Soft. No hard CTA.
```

### Process

1. Write the copy first, as plain text, all pages. Check it against
   `linkedin/voice.md`. Bad copy in a beautiful template is still a bad carousel.
2. Build `carousel.html` in the day's folder — one `<section class="page">` per page,
   1080×1350 each. Inline all CSS and fonts. Follow `linkedin/brand.md`.
3. Render: `python3 scripts/render-carousel.py linkedin/daily/YYYY-MM-DD/carousel.html`
   → produces `carousel.pdf` alongside it, using the pre-installed Chromium.
4. Open page 1 as an image and **actually look at it** before handing it over.
   Check: does the headline fit? Is anything clipped? Readable small?

For the visual system, the **`brand-design-studio`** skill is available in this
session and handles fixed-canvas layout well — use it for the design decisions,
this skill for the LinkedIn-specific constraints above.

---

## Building a single image

Pick the cheapest tool that does the job:

- **Chart** → build with the `dataviz` skill, render to PNG. Never a generated image.
- **Diagram** → inline SVG, hand-authored. The `artifact-diagramming` skill covers
  the mechanics. Generated images cannot spell — never use one where text matters.
- **Screenshot treatment** → the user's real screenshot, cropped, padded, with at
  most one annotation. Do not restyle their actual product UI.
- **Conceptual / editorial image** → `mcp__higgsfield__generate_image`. Only when
  there is genuinely nothing real to show, which is rare. Put any text on top
  afterwards in HTML; do not ask an image model to render words.

---

## Output

Everything lands in `linkedin/daily/YYYY-MM-DD/`:

```
carousel.html · carousel.pdf      (carousel)
image.png                          (single image)
visual-notes.md                    (alt text, what it shows, why this and not text)
```

Always write the **alt text** — LinkedIn supports it, most people skip it, and it's
the accessible thing to do. One sentence describing what's actually in the image.

Then tell the user in chat: what you made, the file path, and one line on why this
visual rather than text-only. Show them the rendered result.

---

## Rules

- **Decorative is worse than nothing.** If you can't name what the image tells the
  reader that the text doesn't, don't make it.
- **Never fabricate data in a chart.** If the numbers aren't real, there's no chart.
- **Copy before design, always.**
- **Look at what you rendered.** Read the file back as an image before saying it's done.
