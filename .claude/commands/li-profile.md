---
description: One-time pass on headline, About, featured and banner — the page every post sends people to
argument-hint: [paste your current headline / About]
allowed-tools: Read, Write, Edit, Glob, Grep, Skill
---

<current>
$ARGUMENTS
</current>

Rewrite the profile. This is the highest-leverage hour on LinkedIn and almost nobody
spends it: **every post that works sends people to this page**, and the page decides
whether they follow, ignore, or sign up.

Do it once properly, then leave it alone for six months.

## Input

If `<current>` is empty, ask them to paste their current headline and About section
and stop. Don't audit a profile you haven't read — and you can't fetch it, since
LinkedIn blocks that.

## Read first

`linkedin/voice.md`, `linkedin/pillars.md`, and `linkedin/playbook.md`
("Profile hygiene"). The profile is the same voice as the posts. A profile written
in corporate register under posts written like a person reads as two different people.

## Work each surface

### Headline (220 chars)
Shows up on every comment you leave, everywhere. It's the most-read text you own.

- **What you do, for whom, and the specific thing** — not a job title.
- "Founder" alone is a wasted line. So is a list of buzzwords separated by pipes.
- Searchable words matter — it's the main field LinkedIn's search reads.
- Give **3 options**: plainest, sharpest, and one that leads with the product.

### About (2,600 chars, first ~2 lines visible before "see more")
Same truncation rule as a post. Those two lines do all the work.

- Open with the specific thing you're doing now. No career retrospective.
- Second paragraph: what you've actually built and what it's for.
- Third: what you write about here, so a visitor knows what following gets them.
- End with how to reach you. Not "let's connect" — an actual reason.
- First person. Never third person; it reads like a press release.

### Featured
Three slots, in this order: ContentIntel itself, the best-performing post from
`linkedin/log/posts.jsonl`, and one thing that proves craft. If the log is empty,
say which slot to fill later.

### Banner
One line of text, readable at mobile size. What ContentIntel does, not a stock image
of a city skyline. Hand it to `/li-image` if they want it built.

### Settings
Follow-primary (so people can follow without connecting), custom URL, open-to tags
off unless they're genuinely looking.

## Output

`linkedin/profile.md` — each surface with the current version, the rewrite, and one
line on what changed and why. Paste-ready blocks, plain text, no markdown inside
them.

Flag anything you had to guess at rather than inventing credentials. **Never write a
claim about their experience they didn't give you** — this is the one page where a
fabrication is permanent and checkable.

## Report

The recommended headline, the two visible About lines, and the single highest-impact
change. Four lines.
