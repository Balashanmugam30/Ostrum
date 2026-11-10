# OSTRUM Pre-Launch Owner Action Checklist

**Date:** 10 November 2026  
**Target Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Planned Canonical Domain:** `https://theostrum.com`  
**Production Verdict:** **CONDITIONAL PRODUCTION GO**

---

All technical code changes, security hardening, dual-theme favicon conflict fixes, rate limiting, and Playwright automated tests have passed. To launch the site to public production traffic, the owner must complete the following 4 external configuration steps:

---

### Action 1: Import Repository to Vercel
1. Log into your account at [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select the GitHub repository: `Balashanmugam30/Ostrum`.
4. Framework Preset: **Next.js** (auto-detected).
5. Root Directory: `./`.
6. Production Branch: `main`.

---

### Action 2: Configure Production Environment Variables in Vercel
In the Vercel project settings (**Settings** -> **Environment Variables**), add the following variables for the **Production** environment:

| Variable Name | Required Value / Source |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://theostrum.com` |
| `RESEND_API_KEY` | Your live production API key from [Resend](https://resend.com/api-keys) (starts with `re_...`). |
| `OSTRUM_ENQUIRY_FROM` | `OSTRUM Notifications <notifications@theostrum.com>` (requires verified domain in Resend). |
| `OSTRUM_ENQUIRY_TO` | `hello@theostrum.com` (or your studio inbox). |
| `ENQUIRY_SALT` | A random high-entropy secret string at least 16 characters long (e.g. run `openssl rand -hex 24` or generate in password manager). |
| `UPSTASH_REDIS_REST_URL` | Your Redis REST URL from [Upstash Console](https://console.upstash.com). |
| `UPSTASH_REDIS_REST_TOKEN` | Your Redis REST token from [Upstash Console](https://console.upstash.com). |

*(Note: In production, the enquiry API requires `ENQUIRY_SALT` and Upstash Redis. If unconfigured, the endpoint safely returns HTTP 503 rather than failing insecurely).*

---

### Action 3: Configure Domain & DNS Records (`theostrum.com`)
1. Purchase domain `theostrum.com` (if not already purchased).
2. Add domain in Vercel (**Settings** -> **Domains**): `theostrum.com` and `www.theostrum.com`.
3. In your DNS provider (e.g. Cloudflare, Namecheap, GoDaddy):
   - **A Record:** `@` -> `76.76.21.21` (or Vercel apex IP).
   - **CNAME Record:** `www` -> `cname.vercel-dns.com`.
4. In Resend (**Domains** -> **Add Domain** -> `theostrum.com`):
   - Add the DKIM TXT record, SPF TXT record, and MX record supplied by Resend to your DNS.
   - Click **Verify Domain** in Resend.

---

### Action 4: Confirm Client Testimonial Publication
- Confirm final approval with the 3 clients (TMR AI Car Care, Saraswati Driving School, and MNESA) for public display of the concise review quotes on the homepage.
