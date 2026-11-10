# OSTRUM Pre-Launch Owner Action Checklist

**Date:** 10 November 2026  
**Target Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Planned Canonical Domain:** `https://theostrum.com`  
**Live Preview Deployment:** `https://ostrum-delta.vercel.app`  
**Vercel Project ID:** `prj_iZmgHtsGRyrgl4ixdfCSCofGrpam`  
**Production Verdict:** **LIVE PREVIEW VERIFIED / PRODUCTION PENDING 2 OWNER EXTERNAL ACTIONS**

---

All technical code, security hardening, dual-theme favicon assets, Next.js build compilation, axe-core WCAG 2.1 AA accessibility (0 violations), 8-viewport responsiveness (0px overflow), and Vercel project linking have passed. 

The live preview is running at **`https://ostrum-delta.vercel.app`**.

To launch public production traffic on `theostrum.com`, the owner has only **2 external configuration actions**:

---

### Action 1: Register Domain & Enter DNS Records (`theostrum.com`)
1. Purchase domain `theostrum.com` at your preferred registrar (e.g. Cloudflare Registrar, Namecheap, GoDaddy).
2. In your domain registrar's DNS settings, add the following 6 records:
   - **Vercel Apex:** `A` record `@` -> `76.76.21.21`
   - **Vercel WWW:** `CNAME` record `www` -> `cname.vercel-dns.com`
   - **Resend DKIM:** `TXT` record `resend._domainkey` -> `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDtT0e0r+AT9ptqkuhllNpLkmtvfn1vnRdAqrmob2vIAFBZa0lUnQq7l0rx8b7jbFgIJFMkYX6ihpmukjzmfan4O5gHhGMWrgm5RudU0AiVTIsiEW9XczKYCcE3fheNOhXkGRxfz8yZb0SvxwMcPL0g7i3IUUWxJsI8A0XZLttoPwIDAQAB`
   - **Resend MX:** `MX` record `send` -> `feedback-smtp.us-east-1.amazonses.com` (Priority `10`)
   - **Resend SPF:** `TXT` record `send` -> `v=spf1 include:amazonses.com ~all`
   - **Resend CNAME:** `CNAME` record `rsend` -> `send.forge.rmta.net`
3. In Vercel Project Settings (`ostrum` -> **Settings** -> **Domains**), add `theostrum.com`.
4. In Resend (**Domains** -> `theostrum.com`), click **Verify Domain**.

---

### Action 2: Arm Upstash Redis Distributed Rate Limiter
1. Visit [console.upstash.com](https://console.upstash.com) (free tier, no credit card required).
2. Click **Create Database** -> Name: `ostrum-rate-limiter`.
3. Copy the REST credentials from the database details page:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. In Vercel Project Settings (`ostrum` -> **Settings** -> **Environment Variables**), add both variables for **Production** and **Preview**.
*(Note: As designed, the enquiry API currently returns HTTP 503 until Upstash credentials are configured to prevent serverless distributed spam attacks).*

---

### Progress Already Completed by Antigravity:
- [x] Vercel project `ostrum` created and connected to `Balashanmugam30/Ostrum` on `main`.
- [x] `NEXT_PUBLIC_BASE_URL` (`https://theostrum.com`) set in Vercel.
- [x] `OSTRUM_ENQUIRY_TO` (`hello@theostrum.com`) set in Vercel.
- [x] `OSTRUM_ENQUIRY_FROM` (`OSTRUM Notifications <notifications@theostrum.com>`) set in Vercel.
- [x] `ENQUIRY_SALT` (64-character cryptographic hex secret) generated and set in Vercel.
- [x] Resend API key created and set in Vercel (`RESEND_API_KEY`).
- [x] Resend domain `theostrum.com` registered (`e5c64cd1-4a4e-4a62-a562-93f5bedddda3`).
- [x] Live Preview deployed, smoke-tested, responsive on 8 viewports, and WCAG AA verified.
