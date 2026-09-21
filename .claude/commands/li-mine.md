---
description: Read your recent git history and propose post angles from what you actually shipped
argument-hint: [7d|14d|30d, or a date — defaults to 7d]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Window: <window>$ARGUMENTS</window> (default `7d` if empty)

Mine the repo's own history for post material. You're building ContentIntel in this
repo — the deleted features, the reverts, the bugs and the constraints are pillar-1
content sitting in `git log` going unused.

## Gather

```bash
git log --since="<window>" --format="%h|%ad|%s" --date=short
git log --since="<window>" --stat --format="%h|%ad|%s"
```

**Commit messages here are unreliable.** Much of this history is
`Add files via upload` from the GitHub web UI. Where the message says nothing, read
the actual change — `git show --stat <sha>`, and `git show <sha> -- <file>` on the
interesting ones — and work out what happened from the diff. Where the message is
real (`worker: freshness guard makes any cron schedule quota-safe`), it's usually
the strongest signal in the window.

**Skip the generated files.** `index.html` is built by `build-v2.py` and is ~877 KB —
its diff is noise, and a one-line change there usually means a whole feature landed
in `src-v2/`. Read `src-v2/`, `worker.js`, `schema.sql` and `research*.js` instead.
Exclude the generated output from the stat:

```bash
git log --since="<window>" --stat --format="%h|%ad|%s" -- . ':(exclude)index.html' ':(exclude)project/'
```

Also worth reading for the same window:
- Files **deleted** — a removed feature is the best post shape there is.
- A file rewritten more than twice — something was hard, and hard is interesting.
- `schema.sql` changes — a data-model change usually means a wrong assumption.
- Reverts and their reasons.

## Judge

For each candidate, ask what makes a post, not what makes a changelog:

- **Was something believed and then disproved?** That's the strongest material.
- **Is there a number?** Latency, cost, size, count. Real ones only.
- **Would a stranger care, or only you?** "Refactored the builder" is a diary entry.
  "Deleted the builder because two users had ever opened it" is a post.
- **Is it specific?** A concrete detail beats a general lesson every time.

Reject ruthlessly. Five commits producing one real angle is a good week. Do not pad
the output — a list of weak angles trains the user to ignore this command.

## Write

Append accepted angles to `linkedin/ideas.md` as `ready` where evidence exists in
the diff, `raw` where it needs a number or a story the user has to supply.

Set `evidence` to the concrete artifact: the sha, the file, the line count, the
thing that was removed. **Never state a number the diff doesn't show** — if the post
needs "how much faster", that's a `needs`, not a claim.

Mark each with `source: git <sha>` so it's traceable.

## Report

- How many commits scanned, how many angles found
- The strongest one, with its hook in a single line
- If nothing in the window is postable, **say that plainly** and stop. A quiet
  week is a real answer; an invented angle is worse than none.
