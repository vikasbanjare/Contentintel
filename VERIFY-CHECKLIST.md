# ContentIntel — Verification Checklist (r31 → r33)

Use this tomorrow to check every feature in a **real browser** (Chrome/Edge desktop recommended).
Open the app, or run it locally, then go feature by feature.

Legend: ✅ = auto-verified headlessly in this environment · 🔎 = needs your manual check (live data / GPU / real images)

---

## r31 — Caption tab + cross-tab handoff
- ✅ **SEO keyword chips** — type a video title; within ~1s, keyword chips appear. Click a chip → copies it.
- ✅ **Ctrl+Enter** — focus the title or transcript field, press Ctrl+Enter (Cmd+Enter on Mac) → triggers Generate.
- 🔎 **Audit → Script handoff** — run a Channel Audit, click **"→ Plan Scripts from This Audit"** → should jump to the Script tab pre-filled with the recommended video. (Needs a real audit, which needs an API key.)

## r32a — Universal PDF export
- ✅ **Download PDF** — on ANY report (Title/Script/Audit/Caption/Comments), click **"⬇ Download PDF"** → a multi-page PDF downloads. (Verified: produces a real PDF blob.)
- 🔎 Confirm the PDF looks right with a full, long report (page slicing across A4).

## r32b — Language + readability (Caption tab)
- ✅ **Language badge** — type a title in English → "🌐 English" badge appears near the keywords. Try Hindi/Spanish text to see it switch.
- ✅ **Readability badge** — type a paragraph in "Key points / summary" → "📖 Easy/Fairly/Hard to read · Flesch NN · grade N".

## r32c — Comment sentiment (Comments tab)
- ✅ **Audience Mood bar** — switch to "Paste manually", paste 3+ comments separated by `---` on their own line → a stacked positive/neutral/negative bar with % appears.
- 🔎 Try the "Fetch from YouTube" path with a real video (needs YouTube or RapidAPI key).

## r32d — Thumbnail face detection (Builder / "Check & fix my thumbnail")
- 🔎 **Face detection** — upload a thumbnail image with a face → "Face detection" panel should show face count + how much of the frame it fills + CTR advice.
  (Verified headlessly that the model loads and the detector runs end-to-end on WebGL; needs a **real photo with a face** to confirm it counts correctly. Requires WebGL — any normal desktop browser has it.)

## r32e — Posting calendar heatmap (Channel Audit)
- ✅ **Calendar heatmap** — after fetching a channel, a GitHub-style calendar appears, days colored by views. (Verified: ECharts renders the calendar canvas.)
- 🔎 Confirm with a real channel's data that the dates/colors look sensible. (Needs API key.)

## r32f — Local AI CTR predictor (Title tab) — ⚠️ HEAVY, OPT-IN
- 🔎 **WebLLM** — open "🧠 Local AI CTR Predictor", click **"Load model (~400 MB)"**. First load downloads ~400 MB (one time, cached). Then "⚡ Predict CTR" gives a 0–100 score.
  **COULD NOT auto-verify here** — needs a real GPU + WebGPU + the 400 MB download (blocked in the sandbox). Test in **desktop Chrome/Edge**. If WebGPU is missing, the button is disabled with a message (safe).

## r32g — Richer keyword/tag extraction (Caption tab)
- ✅ Keyword chips now include **multi-word phrases** (e.g. "index funds") + stopword-filtered tags. (Verified: 6 real keyword chips from a sample title.)

## r32h — RapidAPI alternative data source
- 🔎 **RapidAPI key** — Settings → Platform Data → paste a RapidAPI key (no Google key needed). Then Channel Audit / Comments should fetch via youtube-v31.
  **COULD NOT auto-verify here** — needs a real RapidAPI key + live network. Note: a browser key is visible to site visitors → personal use only.

## r33 — Batch Title Ranker (Title tab)
- ✅ **Batch ranking** — open "🏁 Batch Title Ranker", paste several titles (one per line) → instantly scored & ranked, winner gets 🏆, factor chips per title. (Verified: weak titles rank below strong ones.)

---

## Things I could NOT verify in the cloud sandbox (do these tomorrow)
1. **WebLLM** — 400 MB model + WebGPU (desktop Chrome/Edge).
2. **Live YouTube Data API** calls (Audit, Comments fetch, Competitor) — needs your Google API key.
3. **RapidAPI** fallback path — needs your RapidAPI key.
4. **Face detection accuracy** — needs real thumbnails with faces.
5. **Real Claude/Groq/OpenRouter analysis** output quality — needs your API keys.

## What WAS auto-verified (headless Chromium, libraries vendored, CDN intercepted)
All 8 library features ran end-to-end with real inputs: compromise keywords, franc-min language,
Flesch readability, wink-sentiment mood, jsPDF+html2canvas PDF, ECharts heatmap, Color Thief palette,
face-api detection (on WebGL). Plus the Batch Title Ranker. Build stamp: **2026-06-20-r33**.

## Note on pushing
All work is committed and pushed to the **`temp-main`** branch (draft PR #1).
To merge into `main`, review PR #1 on GitHub and mark it ready.
