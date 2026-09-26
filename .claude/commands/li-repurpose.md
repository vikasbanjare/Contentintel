---
description: Turn one post that worked into a carousel, thread, or newsletter section
argument-hint: [date, hook, or paste the post] [→ carousel|thread|newsletter|short]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill
---

<request>
$ARGUMENTS
</request>

Turn a post that already worked into another format.

## Pick the source

From `<request>`, or if it's empty, read `linkedin/log/posts.jsonl` and propose the
**2–3 best candidates** — highest `rating`, or strong `metrics` relative to the
median. Then stop and let them choose.

**Only repurpose what earned it.** A post that underperformed doesn't get a second
run in another shape; it had its answer. If the log is empty, ask which post.

## Pick the target

| Target | When it works |
|---|---|
| **Carousel** | The post had 5+ discrete points, or a sequence. Not for a single story. |
| **X / thread** | The post's argument survives being cut to fragments. Most don't. |
| **Newsletter section** | There's more to say than the post had room for. |
| **Short post** | One line in the original outperformed everything around it. Cut to that. |

If the post doesn't fit any of these, **say so**. A story-shaped autopsy repurposed
into a listicle loses the only thing that made it work.

## Rules

- **Not a reformat — a re-argument.** Each format wants a different order and a
  different opening. Slicing paragraphs into slides produces something obviously
  recycled, and the audience overlaps.
- **Never repost near-identical text to LinkedIn.** Same audience, and the playbook
  is clear that it costs you. A carousel of the same argument is fine; the same
  words twice is not.
- **Wait at least 3 weeks** before the same idea returns to LinkedIn in any form.
  Say so if it's sooner.
- Re-read `linkedin/voice.md`. A format change is where drafts quietly slip back
  into generic-marketing register.
- Run `anti-ai-writing` on the result, as with any draft.

## Output

`linkedin/daily/<today>/repurpose-<target>.md` — the new piece, paste-ready, with
one line at the top naming the source post and what changed structurally and why.

For a carousel, hand off to `/li-image` or `/li-prompt` rather than building it here.

## Report

Source, target, and the one structural change you made. Three lines.
