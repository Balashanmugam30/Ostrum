# OSTRUM — INTERNAL PRODUCTION & LEGAL LAUNCH CHECKLIST

> **CONFIDENTIAL — INTERNAL STUDIO USE ONLY**  
> **Document Version:** 1.0.0  
> **Effective Date:** 19 October 2026  
> **Repository:** `Balashanmugam30/Ostrum`

---

## 1. Domain Acquisition & DNS Readiness

- [ ] **Domain Registration (`theostrum.com`):**
  - Verify formal acquisition/purchase of `theostrum.com` via chosen registrar (e.g. Cloudflare Registrar, Namecheap, Google Domains/Squarespace).
  - Enable WHOIS privacy protection and registrar lock.
  - Enable Multi-Factor Authentication (MFA) on registrar account.
- [ ] **DNS Records Provisioning:**
  - `A` / `AAAA` records configured for apex domain (`theostrum.com`).
  - `CNAME` record configured for `www.theostrum.com`.
  - Canonical redirect established: `theostrum.com` $\to$ `www.theostrum.com` (or vice-versa).
  - Vercel/Hosting domain verification completed.
- [ ] **SSL / TLS Certificate:**
  - Automated TLS 1.3 certificate generated and auto-renewing.
  - HSTS (HTTP Strict Transport Security) header enabled.
- [ ] **Environment Configuration:**
  - Update production environment variable: `NEXT_PUBLIC_SITE_URL="https://theostrum.com"`.
  - Update `SITE_CONFIG.isDomainVerified = true` in `lib/site-config.ts`.

---

## 2. Mailbox & Email Authentication Readiness

- [ ] **Business Mailbox Setup (`hello@theostrum.com`):**
  - Provision Google Workspace, Fastmail, or Proton for Business account for `theostrum.com`.
  - Verify receipt of test emails to `hello@theostrum.com`.
  - Configure forwarding / triage distribution list to studio principals.
- [ ] **Mail Server DNS Records (SPF, DKIM, DMARC):**
  - **MX Records:** Primary and backup MX records configured with registrar.
  - **SPF:** TXT record matching provider (e.g. `v=spf1 include:_spf.google.com ~all`).
  - **DKIM:** 2048-bit DKIM key generated in email console and published via TXT DNS record.
  - **DMARC:** TXT record published at `_dmarc.theostrum.com` with enforcement policy (`v=DMARC1; p=reject; rua=mailto:dmarc-reports@theostrum.com`).
- [ ] **Inquiry Route (`/api/enquiry`):**
  - Configure production transactional mail provider (e.g. Resend, Postmark, AWS SES) API key in environment variables:
    - `RESEND_API_KEY` or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.
  - Set `SITE_CONFIG.isMailboxVerified = true` in `lib/site-config.ts`.

---

## 3. Corporate Formalities & Legal Entity Compliance

- [ ] **Entity Formation & Official Name:**
  - Confirm formal corporate registration name (e.g. *Ostrum Technologies Private Limited*, *Ostrum Studio LLP*, or registered enterprise).
  - Record official Corporate Identity Number (CIN) or LLPIN.
- [ ] **Tax & Invoicing Compliance (India):**
  - Confirm Goods and Services Tax Identification Number (GSTIN).
  - Confirm Permanent Account Number (PAN) associated with the entity.
  - Verify compliant tax invoice template for client billing and Statements of Work (SOW).
- [ ] **Registered Office Address:**
  - Establish formal physical address for official service of legal notices.
  - Update official notices address in contracts and non-public records.
- [ ] **DPDP Act 2023 Statutory Officer:**
  - Designate Data Protection / Grievance Officer in compliance with the Digital Personal Data Protection Act, 2023.
  - Maintain grievance logging and statutory 30-day resolution procedures.

---

## 4. Brand & Social Verification

- [ ] **Company LinkedIn Page:**
  - Create official company page on LinkedIn: `https://www.linkedin.com/company/ostrum/` (or designated studio handle).
  - Add verified URL to environment variable: `NEXT_PUBLIC_OSTRUM_LINKEDIN_URL="https://www.linkedin.com/company/ostrum/"`.
  - Verify that the footer and contact sections automatically reflect the LinkedIn link once configured.
- [ ] **GitHub Organization & Repositories:**
  - Ensure public open-source repository `https://github.com/Balashanmugam30/mnesa` contains appropriate open-source license (MIT/Apache 2.0) and accurate description.
  - Maintain private or public status of `Balashanmugam30/Ostrum` according to studio deployment strategy.

---

## 5. Client Testimonial & Showcase Authorizations

- [ ] **TMR AI Car Care:**
  - Transmit formal review copy of case study summary and draft testimonial quote to client principal.
  - Obtain signed or written email authorization approving quotation publication.
  - Once written approval is received, update `data/testimonials.ts`:
    - `approved: true`
    - `isPlaceholder: false`
- [ ] **Saraswati Driving School:**
  - Transmit formal review copy of case study summary and draft testimonial quote to client principal.
  - Obtain signed or written email authorization approving quotation publication.
  - Once written approval is received, update `data/testimonials.ts`:
    - `approved: true`
    - `isPlaceholder: false`
- [ ] **MNESA (Internal Venture):**
  - Retain current verified configuration:
    - `contentType: 'project-note'`
    - `approved: true`
    - `isPlaceholder: false`
    - Live link pointing to `https://github.com/Balashanmugam30/mnesa`.

---

## 6. Pre-Launch Technical & Security Sign-Off

- [ ] Full Next.js production build completes without warnings or errors (`npm run build`).
- [ ] Automated Playwright test suite passes across desktop, tablet, and mobile viewports.
- [ ] Zero unverified claims, fabricated corporate entity registrations, or mock addresses in production code.
- [ ] Performance audit: CWV (LCP < 2.5s, CLS < 0.1, INP < 200ms) verified on production build.
