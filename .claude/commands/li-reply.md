---
description: Comments on your own post → drafted replies, prioritised, thread-extending
argument-hint: [paste the comments]
allowed-tools: Read, Write, Edit, Glob, Grep, Skill
---

Comments on the user's own post:

<comments>
$ARGUMENTS
</comments>

Run the **`linkedin-engagement`** skill in **inbox mode**.

If `<comments>` is empty, ask them to paste the comments and stop.

Otherwise:
1. Read `linkedin/engagement-rules.md` and `linkedin/voice.md`. If there's a pack in
   `linkedin/daily/<today>/`, read `review.md` so replies are consistent with the post.
2. Sort into the priority tiers from `engagement-rules.md`: substantive and
   disagreement first, real questions next, people worth knowing, then praise.
3. Draft each reply — extends the thread, matches their length, 8+ words,
   phrased differently from every other reply in the batch.
4. Apply the special-case table: hostile → one calm reply then stop; personal
   attack → no reply, delete and report; correction where they're right →
   immediate public correction naming them.
5. Flag any comment that should get no reply, and say why.
6. Write `linkedin/daily/<today>/replies.md`, grouped by tier, each reply
   paste-ready with the comment quoted above it.

Report: how many need a reply, which one to answer first, and the file path.
