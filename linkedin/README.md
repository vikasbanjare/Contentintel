# The LinkedIn Machine

An agentic harness that turns one raw opinion a day into a reviewed, ready-to-paste
LinkedIn post — plus a daily engagement list telling you what to reply to and what
to leave alone.

**It never posts for you.** Every output lands in a review pack you approve by hand.
See "Why no auto-posting" at the bottom.

---

## The loop

```
ANY TIME  you:  /li-idea "half-thought you'd otherwise lose"
                ↑ this is the habit that makes the rest work. Ten seconds.

SUNDAY    you:  /li-mine 7d      ← angles from what you actually shipped
          you:  /li-week         ← picks 3-5 posts, balanced across pillars
```

### Then each posting day (5 minutes of your time)

```
morning   you:  /li-daily "raw thought, half-formed, typed badly — doesn't matter"
                (or just /li-daily — it pulls from the bank)
          it:   → linkedin/daily/YYYY-MM-DD/review.md
                  3 post variants · hook options · truncation preview
                  risk check · image brief · first-comment · reply prep

you:            read review.md, pick a variant, tweak a line, paste into LinkedIn

          you:  /li-engage   (paste 5–15 posts from your feed)
          it:   → engage.md — REPLY / SKIP per post, with the reply drafted

evening   you:  /li-log      (what you posted + how it did)
          it:   appends to linkedin/log/posts.jsonl, updates what's working
```

Weekly: `/li-voice` re-reads your last 20 real posts and re-tunes `voice.md`
so the drafts sound more like you and less like a language model.

---

## Commands

| Command | What it does |
|---|---|
| `/li-idea <thought>` | Two-second capture. Use this ten times a day. |
| `/li-mine [7d]` | Read your git history → post angles from what you shipped. |
| `/li-week` | Plan the week's 3–5 posts from the bank, balanced across pillars. |
| `/li-daily <your thought>` | The main one. Raw idea → full review pack. |
| `/li-engage` | Paste feed posts → reply/skip triage + drafted replies. |
| `/li-reply` | Your own post's comments → replies that extend the thread. |
| `/li-image` | Post text → image, carousel, or diagram, built here. |
| `/li-prompt` | Paste-ready design prompts for claude.ai and ChatGPT. |
| `/li-image check <path>` | Check a design you made elsewhere before posting it. |
| `/li-log` | Record what you posted and its numbers. Feeds the learning loop. |
| `/li-repurpose` | A post that worked → carousel, thread, or newsletter. |
| `/li-profile` | One-time pass on headline, About, featured, banner. |
| `/li-voice` | Recalibrate `voice.md` from your real posts. |

## Skills (auto-invoked, or call directly)

| Skill | Owns |
|---|---|
| `linkedin-post` | Raw thought → post variants + the review pack. |
| `linkedin-engagement` | Reply/skip decisions and comment craft. |
| `linkedin-visual` | Image, carousel and diagram briefs + generation. |

Subagent `li-critic` runs an adversarial pass on every draft before it reaches you.

---

## Files you own and should edit

| File | What it holds | Edit it when |
|---|---|---|
| `voice.md` | How you sound. Banned phrases. Rhythm. | A draft sounds wrong. |
| `pillars.md` | The 4 things you post about + angle bank. | Your focus shifts. |
| `engagement-rules.md` | Who you reply to, who you ignore. | You reply to something you regret. |
| `playbook.md` | LinkedIn mechanics and operating assumptions. | You learn something new about reach. |
| `ideas.md` | The idea bank. Fuel for every draft. | Constantly — via `/li-idea`. |
| `people.md` | Who you're actually building relationships with. | `/li-engage` maintains it. |
| `formats.md` | Post shapes that work (story, teardown, list…). | You find a format you like. |
| `design-prompts.md` | Routing + prompt templates for designing in Claude/ChatGPT. | A prompt keeps producing the wrong thing. |

`log/posts.jsonl` is append-only machine memory — don't hand-edit it.
`daily/` is scratch space, one folder per day.

---

## Why no auto-posting

Three separate reasons, in order of how much they'd cost you:

1. **Reading your feed and auto-commenting is not available.** LinkedIn's public API
   has no endpoint for it. The only way is browser automation or scraping, which
   violates the User Agreement. Accounts doing it get restricted or permanently
   banned — and it's your real professional identity on the line.
2. **Posting to your own profile *is* possible** via the `w_member_social` scope, but
   it needs an approved LinkedIn app. If you later want that, it's a small addition
   to `worker.js` — ask for it. It's the one piece of this that's legitimately
   automatable.
3. **Auto-replies read as auto-replies.** The whole value here is that you sound like
   a person with opinions. A queue you approve in 90 seconds gets you the leverage
   without the tell.

The harness is built so that step 2 can be bolted on later without touching anything
else: the review pack already emits a clean `post.txt` per day.
