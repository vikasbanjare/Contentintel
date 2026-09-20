---
description: Recalibrate voice.md from your real posts and logged results
argument-hint: [paste 10-20 of your real LinkedIn posts, or leave empty to learn from the log]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

<real_posts>
$ARGUMENTS
</real_posts>

Retune `linkedin/voice.md` so drafts sound more like the user and less like a model.

## Sources, best first

1. **`<real_posts>`** — posts they actually wrote themselves. Strongest signal by far.
2. **`edits` fields in `linkedin/log/posts.jsonl`** — every time they changed a
   drafted line, that's them correcting the voice. Mine these hard.
3. **`metrics` + `rating` in the log** — what landed, by format and pillar.

If all three are empty, say so and ask them to paste 10–20 of their own posts.
Don't guess at a voice from nothing.

## Analyse

Work from evidence in the text, not impressions. For each finding, keep the quote
that supports it.

- **Sentence length** — actual distribution. Do they write short, or do they write
  long and break the lines?
- **Openers** — how do their real posts start? Collect the actual first lines.
- **Words they reach for**, and words they never use.
- **Punctuation habits** — em-dashes, colons, ellipses, question marks, lowercase.
- **How they hedge** — "I think", "probably", "in my experience", or not at all.
- **How they close** — question, flat statement, or just stop.
- **Emoji, hashtags, formatting** — what they actually do, not best practice.
- **From `edits`:** what do they consistently cut? Consistently add? That's the
  gap between the draft voice and the real voice — name it explicitly.

## Update `linkedin/voice.md`

- Rewrite the **register, rhythm, and words-that-sound-like-you** sections from the
  evidence. Replace the seeded guesses.
- Add any new banned phrase the edits show they always remove.
- Set **Calibration status** to `CALIBRATED from {n} real posts + {n} logged edits,
  {date}`.
- Replace the block between `<!-- LEARNED:START -->` and `<!-- LEARNED:END -->` with
  what the log shows about performance — by format, by pillar, by hook pattern, by
  posting time. Only include a pattern that appears **three or more times**. Write
  "not enough data" for anything thinner. Never present a coincidence as a finding.

**Preserve their hand edits.** If they've written something into `voice.md`
themselves, keep it — you're adding evidence, not overwriting their judgement.

## Report

- The 3 biggest gaps between how the machine writes and how they write
- Any new banned phrase, with the evidence
- What the log says is working, or that it's too early to say
