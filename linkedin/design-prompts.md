# Designing in Claude & ChatGPT

The flow for when you want to make the carousel or single-page design **outside**
this repo — in claude.ai or ChatGPT — instead of rendering it locally.

`/li-prompt` fills these templates with today's actual copy and writes them to
`linkedin/daily/<date>/design-prompts.md`, ready to paste.

---

## The one rule that matters

**Never ask an image model to render your headline.**

ChatGPT, Gemini, Firefly, Midjourney — all of them produce text that is *nearly*
right. A dropped letter, a doubled word, kerning that drifts. You won't catch it
because you already know what it's supposed to say. Your audience will.

So the split is always the same:

```
Text  →  HTML  (Claude, or the local template)
Art   →  image model, with NO text in it
Both  →  image model makes the plate, HTML puts the text on top
```

---

## Routing

| What you need | Route | Why |
|---|---|---|
| Carousel with real copy | **Claude → HTML** or local template | Exact type, exact line breaks, editable. |
| Quote card, stat card, single text image | **Claude → HTML** | Same. |
| Chart from real numbers | **Local, `dataviz` skill** | An image model will invent the data. Never. |
| System or flow diagram | **Claude → inline SVG** | Precise, editable, scales. |
| Background plate behind text | **ChatGPT image** | Genuinely its strength. Text goes on top later. |
| Photoreal object, scene, editorial illustration | **ChatGPT image** | Its strength. |
| Screenshot of your own product | **Local, crop + pad** | Never restyle real UI. It becomes a lie. |

---

## Route A — Claude builds the HTML

Best default for anything with words in it. You get a self-contained file you can
screenshot, or drop into `linkedin/daily/<date>/` and render to PDF here.

### Prompt template

````
Build a LinkedIn carousel as a single self-contained HTML file.

CANVAS
- 10 slides max, each exactly 1080x1350px
- Each slide is <section class="page">
- CSS: @page { size: 1080px 1350px; margin: 0; }
  .page { break-after: page; overflow: hidden; padding: 80px; }
- Bottom-right 160x80px of every slide must stay empty (LinkedIn draws a page
  counter there)

TYPE
- Headlines: Space Grotesk 700, line-height 1.05, letter-spacing -0.02em
- Body: Manrope 500
- Numbers/metrics: JetBrains Mono 600
- Load from Google Fonts
- Slide 1 headline: 112px. Other headlines: 72px. Body: 36px.

COLOUR (dark)
- Background #07090E
- Text #F2F4FA, muted text rgba(242,244,250,0.72)
- Accent #4D7CFE, gradient accent #4D7CFE → #FF4D8D
- One accent element per slide, maximum

LAYOUT
- Headlines anchored bottom-left, not centred
- One idea per slide. If a slide needs two paragraphs, split it into two slides.
- Slide 1 has no logo and no name — just the headline, as large as it fits
- Second-to-last slide summarises every point on one screen (people screenshot it)
- Last slide: one quiet identity line

COPY — use this text EXACTLY. Do not rewrite, shorten, or "improve" it.
[paste the locked copy, slide by slide]

Output one HTML file. No external CSS, no JS, no build step.
````

### Then

Download the artifact → save as `linkedin/daily/<date>/carousel.html` → swap the
Google Fonts `<link>` for `<link rel="stylesheet" href="../../assets/fonts.css">`
→ `python3 scripts/render-carousel.py linkedin/daily/<date>/carousel.html --png`.

(The swap matters: headless Chromium here doesn't reliably fetch Google Fonts and
falls back to DejaVu Sans without erroring. In claude.ai's preview the CDN link is
fine — it's only the local render that needs the embedded file.)

---

## Route B — ChatGPT makes the image

Only for art. Never for type.

### Structure

Same convention as `research3.js` in this repo — the prompt must be a **complete
standalone visual specification**, not an editing instruction.

```
[Subject: what it is, position in frame, scale]. [Composition: where the empty
space sits and how much]. [Palette: specific colours, named or hex-described].
[Light: direction, quality, mood]. [Render style: photo / 3D / illustration /
abstract, and its finish]. [Format: aspect ratio and what it's for].
```

Then always append, for any plate that will carry text:

```
No text, no words, no letters, no numbers, no logos, no watermarks, no UI.
Leave the lower-left 60% visually quiet — flat enough for white type to sit on it.
Deep near-black background (#07090E), single blue accent (#4D7CFE).
```

### Forbidden phrasing

These don't work in text-to-image models — they describe an *edit*, and the model
has nothing to edit. Describe the finished result instead.

```
KEEP:        CHANGE ONLY:     preserve        maintain
same as the original          like before      but with
```

### Worked example

> A single cracked ceramic tile lying on a dark surface, shot from directly above,
> occupying the upper-right third of the frame. The lower-left 60% is empty dark
> floor. Palette: near-black #07090E, cool grey ceramic, one thin electric-blue
> #4D7CFE seam of light in the crack. Hard raking light from the upper right,
> deep shadow, high contrast. Photoreal macro photography, shallow depth of field,
> fine surface grain. Square 1:1.
>
> No text, no words, no letters, no numbers, no logos, no watermarks.
> Leave the lower-left 60% visually quiet — flat enough for white type to sit on it.

### Then

Save to `linkedin/daily/<date>/plate.png`, and either post it as-is (if it needs no
text) or reference it as a `background-image` in the HTML and set the type there.

---

## Route C — local, no external tool

Already built. `/li-image` handles it end to end using
`linkedin/assets/carousel-template.html` and the two scripts. Use this when the
design is type-only, which is most of the time.

---

## Bringing it back

Whichever route you took, run the same three checks before posting:

1. **Thumbnail test.** Open slide 1 at 25%. If the headline isn't readable, it's
   too small. Go bigger, not smaller.
2. **Text integrity.** If an image model touched anything with words in it, read
   every character. This is where the failure hides.
3. **Counter zone.** Bottom-right 160×80px of each slide clear.

`/li-image check <path>` runs these against a file you bring back.
