---
description: Log what you posted and how it did — this is what makes the machine learn
argument-hint: [what you posted / the numbers, or leave empty for prompts]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

<entry>
$ARGUMENTS
</entry>

Append a record to `linkedin/log/posts.jsonl`. This file is the machine's memory —
`linkedin-post` reads it before every draft, and `/li-voice` learns from it.

## Gather

From `<entry>` plus today's `linkedin/daily/<today>/` folder. Ask only for what you
genuinely can't work out, and ask for it all in **one** message — never a
back-and-forth interrogation.

The two fields that matter most for learning are `edits` and `outcome_note`.
Everything else is bookkeeping.

- **Which variant** did they post, and **what did they change**? If they rewrote a
  line, record the before and after — that's the strongest voice signal there is.
- **Numbers**, if they have them. It's fine to log a post with no metrics and add
  them later — say so rather than nagging.

## Schema

One JSON object per line, no trailing commas, no pretty-printing:

```json
{
  "date": "2026-09-20",
  "pillar": "building|ai|design|industry",
  "format": "autopsy|number|reversal|teardown|build-log|question|constraint|carousel|short",
  "variant": "a|b|c|own",
  "hook": "first line as posted",
  "chars": 1240,
  "visual": "none|image|carousel|chart|screenshot",
  "posted_at": "2026-09-20T09:15+05:30",
  "edits": "what the user changed from the draft, and the before→after if it was a line",
  "metrics": { "impressions": 0, "reactions": 0, "comments": 0, "reposts": 0, "profile_views": 0, "followers": 0 },
  "metrics_age_h": 24,
  "outcome_note": "what seemed to drive it, in the user's own words",
  "rating": 4
}
```

`rating` is the user's own 1–5 on the post, independent of the numbers. A post that
did badly but said the right thing still rates high — track both.

## Then

1. Create `linkedin/log/posts.jsonl` if it doesn't exist. **Append only** — never
   rewrite or reorder existing lines.
2. Validate the line parses as JSON before writing. If a metric is unknown, use
   `null`, not a guess.
3. If this is an update to an existing post's metrics (e.g. 72h numbers on
   something logged at 24h), append a new line with the same `date` and `hook`
   and the higher `metrics_age_h` — don't edit the old line.
4. Once there are **10+ entries**, tell the user `/li-voice` is worth running.

## Report

Three lines: what was logged, how it compares to their median post so far, and the
one pattern worth noticing if a real one has emerged. **Don't invent a trend from
four data points** — say "not enough data yet" when that's the truth.
