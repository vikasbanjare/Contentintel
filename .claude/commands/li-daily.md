---
description: Raw thought → full LinkedIn review pack (3 variants, hooks, critique, risk check, visual, reply prep)
argument-hint: <your raw opinion — messy is fine>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, Agent
---

Today's raw thought from the user:

<raw_thought>
$ARGUMENTS
</raw_thought>

Build the full review pack for this.

1. If `<raw_thought>` is empty, ask what's on their mind today and stop. One line.
2. Otherwise invoke the **`linkedin-post`** skill and follow it end to end:
   load the voice/pillar/format/playbook context, interrogate the thought,
   draft three variants in different formats, run `viral-hooks` on the hooks and
   `anti-ai-writing` as the final filter, put the drafts through the **`li-critic`**
   subagent, then write the pack to `linkedin/daily/<today>/`.
3. Call the **`linkedin-visual`** skill to decide whether this post needs a visual.
   If it does, write the brief into the pack — don't build it yet unless it's a
   chart or screenshot treatment, which are cheap. Tell them `/li-image` builds it.
4. Save the raw thought verbatim to `linkedin/daily/<today>/raw.md`.

Report back in under 8 lines: recommended variant, its hook, the one risk worth
knowing, and the path to `review.md`. Everything else lives in the file.

Do not post anything anywhere. This produces text for the user to paste themselves.
