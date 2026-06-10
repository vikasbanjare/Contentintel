# Vikas Banjare — Portfolio

A single-page, award-style portfolio: smooth scrolling (Lenis), GSAP scroll
animations, preloader counter, custom cursor, magnetic buttons, floating
project previews, marquee, word-by-word about reveal, and a full-screen case
view for each project.

**Live preview locally:** run `npm run dev` in the repo root, then open
`http://127.0.0.1:4173/portfolio/`.

## Make it yours — edit ONE file: `data.js`

Everything on the page (name, bio, projects, services, links, photo) is read
from `data.js`. Open it — instructions are at the top. The highlights:

### 1. Add your photo
```js
photo: "me.jpg",          // drop me.jpg into this folder
// or
photo: "https://media.licdn.com/....jpg",   // a hosted image URL
```

### 2. Add your Behance projects
For each entry in `projects`:

| Field | What to paste |
|---|---|
| `cover` | Right-click an image on Behance → *Copy image address* — shows in the hover preview |
| `images` | More image URLs — shown in the full case view |
| `videoEmbed` | `https://www.youtube.com/embed/VIDEO_ID` or `https://player.vimeo.com/video/VIDEO_ID` |
| `behanceProjectId` | The number from `behance.net/gallery/123456789/Name` — embeds the **whole live project** (all real images + videos) |
| `link` | The project's Behance URL |

### 3. Personalized share links
Send `your-site.com/portfolio/?for=Nike` and the hero greets them:
*“Hello Nike, this one's for you —”* (also works with `?company=`).

## Notes
- Fonts (Google Fonts), GSAP and Lenis load from CDNs; the page still renders
  fine without them (animations simply turn off).
- Respects `prefers-reduced-motion`.
- No build step — plain HTML/CSS/JS, deploys anywhere (Vercel serves `public/`).
