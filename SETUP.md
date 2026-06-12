# SaaS setup — 45 minutes, start to finish

## 1. Supabase (15 min)
1. supabase.com → New project (free) → pick a region near your users (Mumbai).
2. SQL Editor → paste `schema.sql` → Run.
3. Authentication → Providers → Email: ON. Settings → "Confirm email": ON.
4. Authentication → URL config → Site URL = https://www.yourdomain.com
5. Copy: Project URL + anon key (Settings → API) + service_role key (keep secret).

## 2. Cloudflare Worker (15 min)
1. dash.cloudflare.com → Workers → Create → paste `worker.js` → Deploy.
2. Settings → Variables:
   - Secrets: ANTHROPIC_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
   - Variable: ALLOWED_ORIGIN = https://www.yourdomain.com
3. Copy the worker URL (e.g. https://contentintel-api.you.workers.dev).

## 3. Connect the app (2 min)
In index.html find `window.CI_SAAS = {` and fill:
```js
window.CI_SAAS = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJ…',
  workerUrl: 'https://contentintel-api.you.workers.dev',
};
```
Upload index.html. Login/Profile appear automatically; checks now run through
YOUR key with plan limits — visitors no longer need their own key.

## 4. Payments (Razorpay, 15 min)
1. razorpay.com → KYC → Payment Pages or Payment Links: create 6 links
   (Starter/Pro/Agency x monthly/annual).
2. Paste the 6 URLs into `src-v2/ci-pricing.jsx` (PAY constant) → rebuild → upload.
3. On payment webhook → for now, manually set the user's plan in Supabase
   (Table editor → profiles → plan = 'pro'). Later: a Supabase Edge Function
   on the Razorpay webhook does this automatically — ask Claude to write it
   when you have ~20 customers.
