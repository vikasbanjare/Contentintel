# ContentIntel — Go-Live Plan (Domain → Accounts → Pricing → Payments)

Everything needed to sell ContentIntel as a product. Read top to bottom; each
phase works without the next, so you can launch in stages.

---

## PHASE 1 — Domain (30 minutes, ~₹800/yr)

1. Buy the domain on **Cloudflare Registrar** (at-cost, no markup) or Namecheap.
   Ideas: `contentintel.in`, `getcontentintel.com`, `precheck.studio`.
2. In your GitHub repo: **Settings → Pages → Custom domain** → enter `www.yourdomain.com` → Save.
   GitHub creates a CNAME file in the repo — keep it.
3. In Cloudflare DNS add:
   - `CNAME  www  vikasbanjare.github.io` (Proxy ON)
   - `A  @  185.199.108.153` (+ .109/.110/.111 — GitHub Pages IPs)
4. Back in GitHub Pages: tick **Enforce HTTPS** (wait ~15 min for the cert).
Done — your site is live on your own domain, free hosting forever.

---

## PHASE 2 — The architecture that lets you charge

Today the app is 100% client-side with the visitor's own API key. To SELL it,
the key must become YOURS, hidden on a server, with per-user limits:

```
Visitor browser ──login──▶ Supabase Auth  (email+password, email confirmation)
       │                        │
       │  check request + JWT   ▼
       └──────────▶ Cloudflare Worker  ◀── YOUR Anthropic key (secret, server-side)
                        │  1. verify JWT with Supabase
                        │  2. read plan + usage from DB → reject if over quota
                        │  3. call Anthropic, return result
                        │  4. usage += 1
                        ▼
                   Supabase Postgres (profiles, plans, usage)
```

**Stack (all free tiers to start):**
| Piece | Service | Free tier | Why |
|---|---|---|---|
| Auth + DB | Supabase | 50K users | Email confirmation built-in, Postgres, row-level security |
| API proxy + limits | Cloudflare Worker | 100K req/day | Hides your key, enforces quotas, 0ms cold start |
| Hosting | GitHub Pages (already) | Unlimited | Static site stays where it is |
| Payments | Razorpay (India: UPI+cards+subscriptions) or Lemon Squeezy (global, handles GST/VAT for you) | pay per txn | Subscription billing without writing code |

**ONE API key or many? → ONE.** Your single Anthropic key lives ONLY as a
Cloudflare Worker secret. Never one key per user (impossible to manage, easy to
leak, no benefit). Per-user limits are rows in the database, enforced by the
worker. Keep a 2nd key as failover. Set a monthly spend limit in the Anthropic
console as a circuit breaker.

All the code is in the `saas/` folder: `worker.js` (the proxy), `schema.sql`
(database), `SETUP.md` (45-minute step-by-step). The app already detects the
config and switches from BYO-key to your worker automatically.

---

## PHASE 3 — Pricing (the real math)

**Your measured API cost (after the token-diet update): ~₹1.93 per check on
Sonnet, ~₹0.64 on Haiku** — prompt caching on, hard output caps in the report
format, and the worker routes Free/Starter to Haiku and Pro/Agency to Sonnet
automatically (the browser can't override it). Three optimizations did this:
1. Tighter report format — output tokens are 5x the price of input, so hard
   caps (3 sections, 6 graph points, one-sentence strings) cut cost ~25%
   while making reports MORE readable.
2. Lower max-token ceilings per check type (a cut-off safety net).
3. Plan-based model routing in the worker — Haiku is 3x cheaper and equally
   good at structured scoring; Sonnet stays for paying Pro/Agency users.

### Why 10% margin doesn't work
At cost+10%, a 250-check plan would sell for ₹685/mo. Payment fees alone are
2-3% + ₹3/txn; add refunds, failed payments, free-tier abuse, your time — you'd
LOSE money. AI SaaS standard is **70-90% gross margin**, and customers happily
pay it because one improved video is worth more than the subscription.
Price on VALUE (a better hook = thousands of extra views), not cost.

### The 3 tiers (Apple-style)

|  | **Starter** | **Creator Pro** ⭐ | **Agency** |
|---|---|---|---|
| Monthly | ₹499 | ₹1,299 | ₹3,999 |
| Annual (2 months free) | ₹4,990 (₹416/mo) | ₹12,990 (₹1,082/mo) | ₹39,990 (₹3,332/mo) |
| Credits / month | 150 | 750 | 3,000 |
| Engines (user picks per check) | Quick 1cr · Smart 3cr | + Max (Opus) 5cr | + Max (Opus) 5cr |
| Script + Title + Ads + Ask | ✓ | ✓ | ✓ |
| Thumbnail vision (A/B/C) | — | ✓ | ✓ |
| Hook-locked rewrites | — | ✓ | ✓ |
| Studio + Platform IQ | — | ✓ | ✓ |
| Team seats | 1 | 1 | 5 |
| History | 7 days | Full | Full + export |
| Support | Email | Priority | WhatsApp priority |
| Engine access (server-enforced) | Quick+Smart | All | All |
| **Your API cost (worst case)** | ₹32 | ₹481 | ₹1,925 |
| **Gross margin (worst case)** | 94% | 63% | 52% |
| **Gross margin (typical 35% usage)** | 98% | 87% | 83% |

### The Apple psychology (why this ladder is shaped this way)
1. **Decoy effect**: Starter is deliberately missing the emotional features
   (thumbnail vision, hook-lock). It exists to make Creator Pro look obvious.
   2.6x the price for "everything" feels like a steal.
2. **Anchoring**: show Agency on the page too — ₹3,999 makes ₹1,299 feel cheap.
   (iPhone Pro Max exists partly to sell the Pro.)
3. **Annual as default**: the toggle starts on Annual, showing "₹1,082/mo billed
   yearly" — the monthly price becomes the anchor you're discounting from.
   Annual = 12 months of cash up front + 12x lower churn.
4. **Charm pricing**: ₹499/₹1,299/₹3,999 — never round numbers.
5. **One badge**: "MOST POPULAR" on Creator Pro only. Never two badges.
6. **Free taste, not free tier**: 15 free credits on signup (email-confirmed),
   no card. Enough to feel the magic once — the report itself sells the plan.

### The credit system (the user picks the engine)
Plans grant CREDITS; every check burns credits by engine: **Quick (Haiku) = 1,
Smart (Sonnet) = 3, Max (Opus 4.8) = 5** — matching the real API price ratios,
so margins stay identical whatever users pick. Why this sells better than
flat checks: light users feel rich (150 credits = 150 quick checks), power
users self-upgrade to reach the Max engine, and "engine choice" is a visible
premium feature instead of a hidden cost control. New models (e.g. Fable)
slot in as another tier in `saas/worker.js` ENGINES once you confirm pricing
— one line of code. The worker enforces which plans can use which engine;
the browser cannot override it.

### Launch promo
"Founding member: 40% off the annual plan for the first 100 accounts, locked
for life." Urgency + lock-in + early revenue + testimonials.

---

## PHASE 4 — Security checklist (non-negotiable before charging)

- [x] Anthropic key ONLY in the Worker secret — never in any HTML/JS/repo
- [x] Email confirmation ON (Supabase Auth → enable "Confirm email")
- [x] Quota check happens in the WORKER (server), never trust the browser
- [ ] Rate limit: max 10 requests/min per user + per IP (in worker)
- [ ] CORS locked to your domain only (worker config)
- [ ] Anthropic console: set monthly spend cap (circuit breaker)
- [ ] Razorpay/LS webhook updates the plan in DB (never set plan from the browser)
- [ ] Privacy: scripts/thumbnails are NOT stored server-side — analysis passes
      through and only a usage counter is kept. Say this loudly on the pricing
      page; it's a selling point for agencies.
- [ ] Terms + Privacy + Refund pages (Razorpay requires them; templates: getterms.io)

## PHASE 5 — Launch checklist

1. [ ] Domain live (Phase 1)
2. [ ] Supabase project + schema.sql run + email confirmation on (saas/SETUP.md)
3. [ ] Worker deployed with secrets (saas/SETUP.md)
4. [ ] CI_SAAS config filled in index.html (2 lines) → login/profile appear
5. [ ] Razorpay payment links created (3 plans x monthly/annual = 6 links) → paste in ci-pricing.jsx
6. [ ] Webhook → Supabase edge function updates plan on payment
7. [ ] Test full loop: signup → confirm email → 5 free checks → hit limit → upgrade → unlocked
8. [ ] Announce: your Instagram audience IS the launch channel. "I built the tool I use for every reel."
