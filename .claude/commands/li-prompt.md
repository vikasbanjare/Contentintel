---
description: Generate paste-ready design prompts for Claude and ChatGPT from today's post
argument-hint: [carousel|image|diagram|chart] [or describe the design you want]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill
---

Request:

<request>
$ARGUMENTS
</request>

Produce a paste-ready design prompt pack for building today's visual **outside this
repo** — in claude.ai or ChatGPT. Read `linkedin/design-prompts.md` first; it holds
the routing table and the templates.

## Steps

1. **Find the copy.** Look in `linkedin/daily/<today>/` for `review.md` and the
   chosen variant. If there's no pack and `<request>` doesn't supply the content,
   ask which post this is for and stop.

2. **Route it.** Use the routing table in `linkedin/design-prompts.md`.
   State the route and why in one line. If the honest answer is "text-only, no
   visual", say that and stop — that's a correct outcome.

   The split is not negotiable: **words → HTML, art → image model.** Never emit a
   prompt asking an image model to render a headline, a quote, a stat, or a label.

3. **Lock the copy.** Write the exact slide-by-slide text first, checked against
   `linkedin/voice.md`. This goes into the prompt verbatim with an explicit
   instruction not to rewrite it. An external model will happily "improve" the copy
   into generic marketing language if you don't forbid it.

4. **Fill the templates** from `linkedin/design-prompts.md`, substituting the real
   copy and the real brand values from `linkedin/brand.md` — never leave a
   placeholder in a prompt the user is meant to paste.

   - **Claude prompt** — the full HTML build spec with the locked copy inline.
   - **ChatGPT image prompt** — only if the design needs art. Complete standalone
     visual specification per the structure in `design-prompts.md`, ending with the
     no-text clause. No "KEEP:", "preserve", or "same as" phrasing.
   - **Local route** — the exact command, as the fallback.

5. **Write** `linkedin/daily/<today>/design-prompts.md`: each prompt in its own
   fenced block, nothing else inside the fences, so a single copy lands clean.
   Above each block, one line on what it's for. Below, what to do with the result.

6. **Include the round trip** — how to bring the output back: where to save it,
   the Google-Fonts-to-`fonts.css` swap for the local render, and the three checks
   (thumbnail test, text integrity, counter zone).

## Report

Which route, why, and the file path. If you emitted an image prompt, say in one
line what the image is carrying that type alone couldn't.
