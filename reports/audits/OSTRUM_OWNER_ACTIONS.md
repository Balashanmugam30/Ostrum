# OSTRUM Mandatory Owner Launch Actions

**Audit Date:** 10 November 2026, 12:50 IST  
**Target Domain:** `https://theostrum.com`  
**Hosting Destination:** Vercel  
**Status:** Codebase 100% Ready on `main` — Pending Owner-Side External Integrations  

---

## 1. Domain Registration & Vercel Linking
1. **Domain Purchase & DNS Ownership:**
   - Confirm ownership and registration of `theostrum.com` with your domain registrar.
2. **Link GitHub Repository in Vercel:**
   - In the Vercel dashboard, click **Add New...** -> **Project**.
   - Import `Balashanmugam30/Ostrum` with production branch set to `main`.
3. **Assign Custom Domain in Vercel:**
   - Go to **Project Settings** -> **Domains**.
   - Add `theostrum.com` and `www.theostrum.com`.
   - Configure DNS records (A record `@` to `76.76.21.21` and CNAME `www` to `cname.vercel-dns.com`).

---

## 2. Inbound Contact Mailbox Setup
*Resend delivers outgoing notification emails; you must provision a real mailbox to receive them.*
1. Provision the primary studio inbox `hello@theostrum.com` on your chosen email host (Google Workspace, Zoho Mail, Fastmail, or Proton).
2. Ensure inbound MX records for that email provider are active in DNS so external emails reach the mailbox.
3. Verify that `hello@theostrum.com` can receive inbound messages by sending a test email from a personal account.

---

## 3. Resend Sender Domain Verification & API Key
1. Sign in to [Resend](https://resend.com) and add the sending domain `theostrum.com`.
2. Add the generated DKIM, SPF, and return-path DNS records to your DNS provider without deleting existing MX records.
3. Once verified, generate a restricted Sending API key (`re_...`).
4. Add the following environment variables to your Vercel project (Production scope):
   - `RESEND_API_KEY`: Your Resend API key (`re_...`)
   - `OSTRUM_ENQUIRY_TO`: `hello@theostrum.com`
   - `OSTRUM_ENQUIRY_FROM`: `OSTRUM Website <website@theostrum.com>`
   - `NEXT_PUBLIC_SITE_URL`: `https://theostrum.com`

---

## 4. Google Search Console Setup
Once the domain is serving traffic over HTTPS:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **Domain Property** for `theostrum.com`.
3. Verify ownership via the TXT DNS record provided by Google.
4. Submit sitemap: `https://theostrum.com/sitemap.xml`.
5. Under Search Console settings, review the **Search generative AI** control to confirm AI Overviews and AI Mode inclusion preference.

---

## 5. LinkedIn Company Page Verification
1. Claim or administer the official company page at [`https://www.linkedin.com/company/ostrum/`](https://www.linkedin.com/company/ostrum/).
2. Upload the new master brand icon (`public/brand/ostrum-3d-symbol-master.png`) as the official LinkedIn profile photo.
3. Update the company tagline and website URL to `https://theostrum.com`.
