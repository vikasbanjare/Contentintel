---
description: Plan the coming week's posts from the idea bank, balanced across pillars
argument-hint: [anything you already know you want to post this week]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

<constraints>
$ARGUMENTS
</constraints>

Plan the week. This beats daily improvisation for one reason: **posting from a plan
gives you a mix, posting from today's mood gives you four build-logs in a row.**

## Read

- `linkedin/ideas.md` — the bank. `ready` first, then `raw` worth promoting.
- `linkedin/pillars.md` — the target mix (building 40 · ai 30 · design 20 · industry 10).
- `linkedin/log/posts.jsonl` — what's been posted recently. **What ran last week
  constrains this week** — don't repeat a pillar or a format two weeks running.
- `linkedin/playbook.md` — cadence and timing.
- `linkedin/people.md` — anything `open` that a post would serve better than a comment.

## Decide

Pick **3–5 posts**, not 7. The playbook is explicit that 3–5 good beats 7 filler,
and the plan should reflect that rather than filling slots.

For each: the day, the idea, the pillar, the format, and one line on why it earns a
slot. Vary the **format** as hard as the pillar — three autopsies in a week reads as
a man having a bad month.

Rules:
- **Never schedule an idea with no evidence.** If the bank has only `raw` ideas,
  plan fewer posts and say what's missing. A four-post week with real material beats
  five where two are padding.
- Respect `<constraints>` — anything the user already committed to goes in first.
- Leave one slot deliberately empty if the week is thin. An honest four-post plan is
  a better artifact than a padded five.
- Friday suits "shipped this week" — which means running `/li-mine` on Thursday.

## Write

`linkedin/weeks/<YYYY>-W<ww>.md`:

```markdown
# Week of {date}

**Mix:** {n} building · {n} ai · {n} design · {n} industry
**Last week ran:** {pillars and formats, so the contrast is visible}

| Day | Idea | Pillar | Format | Why now |
|---|---|---|---|---|
| Tue | … | building | autopsy | … |

## Prep needed
- {idea} needs {the number / screenshot / permission} before it can be drafted

## Not this week
- {idea} — {why it's waiting}

## Engagement
- {anyone in people.md with an `open` item, and which day to close it}
```

Mark the chosen ideas in `linkedin/ideas.md` with `planned <date>` so `/li-daily`
knows they're spoken for. Don't move them to `used` — that happens at `/li-log`.

## Report

The mix, the strongest post of the week, and anything that needs prep before it can
be written. Under 8 lines.
