---
description: Build the visual for today's post — image, PDF carousel, chart, or diagram
argument-hint: [carousel|image|chart|diagram] [or describe what you want]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, Agent
---

Request:

<request>
$ARGUMENTS
</request>

Run the **`linkedin-visual`** skill.

1. Find today's post. Look in `linkedin/daily/<today>/` for `review.md` and the
   variant the user picked. If there's no pack and `<request>` doesn't describe
   the post, ask which post this is for and stop.
2. **Decide whether a visual helps at all.** Use the decision table in the skill.
   If the honest answer is "text-only", say so in one line and stop — that's a
   correct outcome, not a failure.
3. If `<request>` names a type, build that. Otherwise pick per the table.
4. Read `linkedin/brand.md` and follow it. Copy first, design second.
5. For a carousel: write `carousel.html`, then
   `python3 scripts/render-carousel.py linkedin/daily/<today>/carousel.html --png`
6. **Look at what you rendered.** Read page 1 back as an image and check the
   headline fits, nothing is clipped, and it's legible at thumbnail size.
   Fix and re-render if not.
7. Write `visual-notes.md` with the alt text and one line on why this visual.

Show the user the result and give them the file path.
