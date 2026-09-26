---
description: Capture a thought in two seconds before you lose it
argument-hint: <the thought, however messy>
allowed-tools: Read, Edit, Write, Glob, Grep
---

<thought>
$ARGUMENTS
</thought>

Append this to `linkedin/ideas.md`. **Be fast.** This command exists because the
user is mid-something-else and will not tolerate a conversation. No questions,
no drafting, no suggestions — capture and get out.

1. If `<thought>` is empty, ask for the thought in one line and stop.

2. Write an entry in the format at the bottom of `linkedin/ideas.md`:
   - **title** — restate the thought as a claim, one line. Don't embellish it.
   - **captured** — today.
   - **pillar** — best guess from `linkedin/pillars.md`. Guessing wrong is cheap.
   - **raw** — their words, **verbatim**. Never clean this up; the phrasing they
     used in the moment is voice evidence, and it's often better than anything
     written later at a desk.
   - **status** — `ready` only if the thought already names its own evidence
     (a number, a commit, a specific event). Otherwise `raw`, with `needs`
     saying what's missing.

3. Put it under the matching heading. Leave every other entry untouched — this
   file is append-mostly, and never reorder or rewrite someone else's words.

4. If it duplicates an existing entry, merge into that one instead of adding a
   second, and say which.

5. If the thought is on the do-not-post list in `pillars.md`, file it anyway but
   mark `status dead` with the reason. Don't lecture.

## Report

**One line.** The title, the pillar, and the status. Nothing else — no
encouragement, no "great idea", no offer to draft it.

If the bank now holds **5+ `ready` ideas**, add a second line saying `/li-week`
is worth running.
