# OSTRUM — Owner Pre-Launch Action Register

**Date:** 9 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Target Release Branch:** `fix/predeployment-release-readiness`  
**Canonical Domain:** `https://theostrum.com`

This document details all external, legal, and operational actions that must be completed by the studio owner prior to and immediately following public production launch. All code, security headers, rate limiting, accessibility, and SEO optimizations have been completed and verified locally.

---

## 1. Domain Registration, DNS & Hosting Linkage

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **1.1** | **Acquire / Confirm Domain Ownership** | `OWNER ACTION REQUIRED` | Ensure `theostrum.com` is registered in your registrar account (e.g. Cloudflare Registrar, Namecheap, Porkbun). Enable 2FA on the registrar account. |
| **1.2** | **Point DNS to Vercel Production** | `OWNER ACTION REQUIRED` | In registrar DNS, point apex `@` and `www` to Vercel: A record `76.76.21.21` or CNAME `cname.vercel-dns.com`. Pick apex as canonical and redirect `www` to apex. |
| **1.3** | **Preserve Mail Records (MX)** | `OWNER ACTION REQUIRED` | Do not delete or overwrite root MX records when updating web DNS records. |

---

## 2. Transactional Email & Resend Setup

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **2.1** | **Create Resend Account** | `OWNER ACTION REQUIRED` | Sign in to [Resend](https://resend.com) with the studio administrative account. |
| **2.2** | **Provision Receiving Mailbox** | `OWNER ACTION REQUIRED` | Configure an inbound mailbox provider (Google Workspace, Zoho Mail, Microsoft 365, or Cloudflare Email Routing) to receive mail sent to `hello@theostrum.com`. Resend only handles outbound transactional email. |
| **2.3** | **Add & Verify Sending Domain** | `OWNER ACTION REQUIRED` | In Resend dashboard: Add domain `theostrum.com` (or dedicated sending subdomain such as `notify.theostrum.com`). Add supplied DKIM, SPF, and MX verification DNS records into your DNS provider. |
| **2.4** | **Establish DMARC Record** | `OWNER ACTION REQUIRED` | In DNS, create TXT record for `_dmarc.theostrum.com` starting conservatively with `v=DMARC1; p=none; rua=mailto:dmarc-reports@theostrum.com;`. Progress to `p=quarantine` or `p=reject` only after monitoring. |
| **2.5** | **Generate Restricted API Key** | `OWNER ACTION REQUIRED` | In Resend: Create API key `OSTRUM Production Enquiry` with **Sending access only**, restricted to `theostrum.com`. |
| **2.6** | **Set Vercel Environment Variables** | `OWNER ACTION REQUIRED` | In Vercel Project Settings -> Environment Variables (Production only, Sensitive/Secret):<br>• `RESEND_API_KEY`: [Your Resend API Key]<br>• `OSTRUM_ENQUIRY_TO`: `hello@theostrum.com`<br>• `OSTRUM_ENQUIRY_FROM`: `OSTRUM Website <website@theostrum.com>`<br>• `NEXT_PUBLIC_SITE_URL`: `https://theostrum.com`<br>• `NEXT_PUBLIC_OSTRUM_LINKEDIN_URL`: `https://www.linkedin.com/company/ostrum/` |

---

## 3. Distributed Rate Limiter (Upstash / Vercel KV)

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **3.1** | **Provision Upstash Redis / Vercel KV** | `OWNER ACTION REQUIRED` | For distributed rate limiting across serverless regions, create a free-tier Redis database at [Upstash](https://upstash.com) or Vercel Storage. |
| **3.2** | **Add Redis Credentials to Vercel** | `OWNER ACTION REQUIRED` | Add to Vercel Production Environment Variables:<br>• `UPSTASH_REDIS_REST_URL`: `https://[instance].upstash.io`<br>• `UPSTASH_REDIS_REST_TOKEN`: `[token]`<br>*(If omitted, the enquiry API automatically uses the local process-memory circuit breaker).* |

---

## 4. Search Engine Verification & Post-Launch Indexing

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **4.1** | **Google Search Console** | `OWNER ACTION REQUIRED` | Add a Domain property for `theostrum.com`. Verify via DNS TXT record. Submit sitemap: `https://theostrum.com/sitemap.xml`. |
| **4.2** | **Bing Webmaster Tools** | `OWNER ACTION REQUIRED` | Import Search Console verification or verify via DNS TXT. Submit sitemap. |
| **4.3** | **URL Inspection** | `OWNER ACTION REQUIRED` | Request indexing for `/`, `/terms-and-conditions`, and `/privacy-policy`. |

---

## 5. Legal, Trademark & Brand Clearance

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **5.1** | **Trademark Clearance Search** | `OWNER ACTION REQUIRED` | OSTRUM is currently used by Ostrum Asset Management in financial services. Consult a qualified trademark attorney to conduct an IP India trademark search under relevant technology classes (Class 9, Class 42) before large-scale commercial marketing. |
| **5.2** | **Statutory Business Details** | `OWNER ACTION REQUIRED` | Once company registration (CIN, LLPIN, or GSTIN) is completed, update legal pages and contract templates with registered entity details. |
| **5.3** | **Client Project Approval** | `OWNER ACTION REQUIRED` | Obtain written consent from TMR AI Car Care and Saraswati Driving School for public display of project highlights and trademarks. |

---

## 6. HSTS Preloading (Post-Launch)

| Step | Action Required | Status | Guidance & Notes |
|---|---|:---:|---|
| **6.1** | **Verify All Subdomains on HTTPS** | `OWNER ACTION REQUIRED` | Confirm that `theostrum.com` and all subdomains (`www`, `mail`, `notify`) operate with valid SSL/TLS certificates without mixed content. |
| **6.2** | **Submit to HSTS Preload List** | `OWNER ACTION REQUIRED` | Once confirmed, update `next.config.mjs` to include `; preload` in HSTS header and submit the apex domain to [hstspreload.org](https://hstspreload.org). |
