# LinkedIn Mechanics — Operating Assumptions

LinkedIn does not publish its ranking algorithm. Everything here is an operating
assumption drawn from platform statements, creator-community consensus, and
observable behaviour. Each item is labelled by how much weight to put on it.

**[SOLID]** — LinkedIn has said it, or it's trivially observable.
**[CONSENSUS]** — widely reported by creators, consistent with observed reach, not confirmed.
**[CONTESTED]** — commonly repeated, evidence is weak or mixed. Don't build habits on these.

Update this file when your own `log/posts.jsonl` contradicts something here.
**Your own data beats everything below.**

---

## Distribution

- **[SOLID]** The feed is relevance-ranked, not chronological. What your network
  engages with drives what they see.
- **[CONSENSUS]** Early engagement matters disproportionately. The first 60–90
  minutes shape how far a post travels. Post when your audience is awake and
  be available to reply during that window.
- **[CONSENSUS]** Dwell time — how long someone stops on the post — is weighted
  heavily. This is why longer text posts, carousels, and documents outperform
  one-liners even at equal like counts.
- **[CONSENSUS]** Comments > reposts > likes, by a wide margin. A substantive
  comment (more than a few words) is worth many likes.
- **[CONSENSUS]** Your replies to comments count as engagement and extend the
  post's life. Replying properly is half the work of posting.
- **[SOLID]** LinkedIn actively demotes engagement bait — explicit asks for likes,
  comments, or follows. Don't.

## Links

- **[CONSENSUS]** An external link in the post body reduces reach. LinkedIn wants
  people to stay on-platform.
- **Practice:** put the link in the first comment. Reference it in the post as
  "link in the comments" only if it genuinely adds something.
- **[CONTESTED]** Editing a post to add the link afterwards "resets" reach. Evidence
  is thin, but the cost of just putting it in a comment is zero, so do that.

## Formats, roughly best to worst for reach

1. **Document / carousel (PDF)** — highest dwell, people swipe. Best for teaching.
2. **Text-only with a strong hook** — the workhorse. Nothing to load, nothing to distract.
3. **Single native image** — good when the image *is* the argument (before/after,
   chart, screenshot). Bad as decoration.
4. **Native video** — strong when it's a real face or a real screen recording.
   Needs captions; most people watch muted.
5. **Poll** — cheap reach, low-quality audience signal. Use sparingly, at most monthly.
6. **Repost with no comment** — near-zero value. Always add your own take instead.

**[CONSENSUS]** Images should be uploaded natively, no watermarks, no visible
third-party branding. Text in the image should be readable at thumbnail size.

## Cadence

- **[CONSENSUS]** 3–5 posts a week beats 7. Consistency of quality beats frequency.
- **[CONSENSUS]** Two posts within ~18 hours split each other's reach. One a day, max.
- Weekday mornings in your audience's timezone are the default. Tue–Thu strongest,
  Fri good for reflective/"shipped this week" posts, weekends weak for B2B.
- **[CONTESTED]** Exact "best time to post" lists. Your own log will beat any
  generic table within a month — check `log/posts.jsonl`.

## The truncation line

- **[SOLID]** The feed truncates the post behind "…see more".
- The cut lands around **140–210 characters** on mobile, and moves with device,
  font size, and whether a link preview is attached. **Treat ~140 characters as
  the safe budget** for everything that must be visible.
- Line breaks eat into the visible area. Two short lines before the cut, not three.
- Everything before the cut has one job: make the click worth it. No context, no
  throat-clearing, no "I've been thinking about…".

## Hashtags and tagging

- **[CONSENSUS]** Hashtags provide a weak topical signal now. 3 relevant ones at
  the end. More than 5 looks spammy and helps nothing.
- **[CONSENSUS]** Tagging people who then don't engage is a negative signal.
  Tag only when the person is genuinely in the post and likely to respond.
- Never tag more than 2–3 people. Never tag for reach.

## Profile hygiene (do once, affects every post)

- Headline says what you do for whom, not a job title.
- Banner and featured section point at ContentIntel.
- "Creator mode" / follow-primary so people can follow without connecting.
- First 2 lines of your About section follow the same hook rules as a post.

---

## Things that reliably cost you

- Posting and leaving. If you can't reply for the first hour, post later.
- Comment pods and reciprocal-engagement groups — the platform detects the pattern,
  and the audience it brings never converts.
- Reposting your own post within a few days.
- AI-obvious writing. The audience on this platform is unusually good at spotting it
  now, and calling it out in the comments costs more than the post gained.
- Arguing in your own comment section. One calm reply, then stop.
