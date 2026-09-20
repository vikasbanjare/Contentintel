---
name: linkedin-engagement
description: Decide what to reply to on LinkedIn and draft the replies. Handles two modes — triaging posts from the user's feed into REPLY/SKIP with drafted comments, and answering the comments on the user's own post. Use when the user pastes LinkedIn posts or comments, invokes /li-engage or /li-reply, or asks what to reply to.
---

# LinkedIn Engagement

Two modes. Detect which from what the user pasted:

- **Feed mode** — posts by other people. Triage and draft comments. (`/li-engage`)
- **Inbox mode** — comments on the user's own post. Draft replies. (`/li-reply`)

Always read `linkedin/engagement-rules.md` and `linkedin/voice.md` first. The rules
file is the decision authority; this skill is how to apply it well.

**The comment must sound like the user, not like a helpful assistant.** Same voice
rules as a post: plain words, first-hand, no generic praise, no enthusiasm inflation.

---

## Feed mode

The user pastes posts — text, screenshots, or URLs plus a summary. For each one:

### Decide

Score against `engagement-rules.md`. Output one of:

- **REPLY** — at least two "reply when" conditions hold and no skip condition does.
- **SKIP** — any hard-skip condition, or nothing genuine to add.
- **REACT ONLY** — worth acknowledging, but a comment from you would be filler.

Be honest about SKIP. A day where 9 of 12 posts are SKIP is a good day — it means
the filter works. Do not manufacture opinions to hit a quota. **If the user has
nothing first-hand to say about a post, SKIP is the correct answer**, even if the
post is in their pillar.

### Draft (REPLY only)

2–4 sentences, one of the shapes in `engagement-rules.md`:
specific counter · missing variable · receipt · honest question.

Requirements:
- Opens with substance, not with the author's name and not with agreement.
- Contains at least one concrete detail only this user could supply.
- Doesn't restate the post.
- Doesn't mention ContentIntel. Ever. If the natural comment is an advert,
  that's a SKIP.
- Ends in a way that invites a reply without an artificial question.

If drafting requires a fact you don't have, write the comment with
`[NEEDS: the number / which project]` inline rather than inventing it.

### Output

Write to `linkedin/daily/YYYY-MM-DD/engage.md`:

```markdown
# Engagement Queue — {date}
**{n} posts · {n} reply · {n} skip · {n} react**
Work top to bottom. Stop at 20 minutes.

## 1. REPLY — {author}, {age of post}
> {2-line quote of what they said}

**Why:** {which conditions matched — one line}
**Comment:**
```
{paste-ready text}
```
**If they push back on {X}:** {one line on how to hold it}

---

## 2. SKIP — {author}
> {1-line quote}

**Why:** {which skip condition}

---
{...}

## Not in the queue but worth it
{If a post deserves a DM instead of a comment, or a follow, say so here.}
```

Then in chat: the count, the top 3 to do first, and the file path. Nothing more.

---

## Inbox mode

The user pastes the comments on their own post. Order by the priority list in
`engagement-rules.md` — substantive and disagreement first, praise last.

For each, draft a reply that:
- **Extends the thread.** Adds information, doesn't just close politely.
- **Matches their length.** Three words in, one line back. A paragraph in, a
  paragraph back.
- Is **8+ words** — very short replies read as dismissive.
- Is **unique**. Never reuse a phrasing across replies in the same thread; it's
  visible in the comment section and it's the clearest bot tell there is.
- Uses their first name at most once.

### Special cases

| Case | Handling |
|---|---|
| Good-faith disagreement | Concede the specific part they're right about, in their words. Then hold the rest with a reason, not a restatement. |
| Hostile / bad faith | One short calm factual reply. Mark it **"reply once, then stop"**. Never draft a second. |
| Personal attack | Draft nothing. Recommend delete + report. Say so plainly. |
| "This is AI-written" | One plain denial if it isn't, no defensiveness, no explaining the process. |
| Real question you can't answer | Say you don't know and what you'd need to find out. Flag it as a candidate for a future post. |
| Factual correction, and they're right | Immediate correction, name them, thank them. Never a quiet edit. |
| Generic praise | Warm one-liner. Add a question only if you have a real one. Don't force it. |

### Output

Write to `linkedin/daily/YYYY-MM-DD/replies.md`, grouped by priority tier, each
reply in a paste-ready block, with the comment it answers quoted above it.

Flag any comment that should **not** get a reply, and say why.

---

## Rules that apply to both modes

- **No comment is better than a bad comment.** Every generic comment is a permanent
  public record of engaging without reading.
- **Never draft the same comment twice**, across posts or across days.
- **Vary the openers.** If three drafts in one queue start the same way, rewrite them.
- **Reciprocity is not a rule.** Someone commenting on the user's post does not
  oblige a comment back on theirs.
- **Time-box it.** If the queue would take more than ~20 minutes, cut the weakest
  entries rather than handing over a list they won't finish.
