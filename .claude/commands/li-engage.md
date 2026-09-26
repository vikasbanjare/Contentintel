---
description: Paste posts from your feed → REPLY/SKIP triage with the replies drafted
argument-hint: [paste posts, or leave empty and paste next]
allowed-tools: Read, Write, Edit, Glob, Grep, Skill
---

Posts from the user's LinkedIn feed:

<feed>
$ARGUMENTS
</feed>

Run the **`linkedin-engagement`** skill in **feed mode**.

If `<feed>` is empty, ask them to paste the posts — text, screenshots, or a URL
plus a one-line summary each — and stop there.

Otherwise:
1. Read `linkedin/engagement-rules.md` and `linkedin/voice.md`.
2. Triage every post: REPLY / SKIP / REACT ONLY, with the reason.
3. Draft a paste-ready comment for each REPLY. 2–4 sentences, first-hand,
   in the user's voice, never generic praise, never mentioning ContentIntel.
4. Check drafted comments against `linkedin/daily/*/engage.md` from the last week —
   if a comment repeats a line or an opener they've already used, rewrite it.
5. Write `linkedin/daily/<today>/engage.md`.

Be willing to SKIP most of the list. A short honest queue beats a long padded one.
If the user has nothing genuinely first-hand to add to a post, that's a SKIP even
if the topic is in their pillars.

Report: the counts, the top 3 to do first, and the file path.
