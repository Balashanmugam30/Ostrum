# OSTRUM — Production Hardening & Security Audit Report

**Audit Date:** 9 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Target Branch:** `fix/production-hardening-and-security`  
**Base Commit:** `54d510f44a40c6740f98974516a6fefa384350c2` (`main`)  
**Verdict:** **LAUNCH READY / CONDITIONAL GO** (Pending owner-side Resend API key provisioning and DNS activation on `theostrum.com`)

---

## 1. Executive Summary

In response to the Independent Production Readiness Audit dated 8 November 2026, an exhaustive, multi-axis production hardening pass was conducted across dependencies, runtime API security, HTTP security headers, legal/privacy disclosures, WebGL rendering efficiency, and form accessibility.

All critical (P0) and secondary (P1/P2) items identified in the audit have been engineered, validated, and verified without degrading the visual identity, 3D WebGL Möbius sculpture, GSAP scroll choreography, WorksWheel catalogue, or theatre-curtain footer reveal.

### Status Summary Table

| Category | Finding in 8 Nov Audit | Status | Resolution Summary |
|---|---|---|---|
| **Dependency Security** | Next.js 15.5.27 vulnerable to GHSA-2464-fhr4-w9xw & GHSA-p3m5-59mp-jv5r | **RESOLVED (P0)** | Upgraded to official security backport `next@15.5.29`; pinned overrides for `postcss`, `postcss-selector-parser`, and `minimatch`. Lockfile has **0 vulnerabilities**. |
| **Enquiry API Security** | Process-only rate limiter; no payload byte limit before parse; loose type validation; potential PII leakage | **RESOLVED (P0)** | Implemented distributed Upstash/Vercel KV adapter with memory circuit breaker; 64 KB hard streaming byte limit before JSON parse; plain object validation; project-type allowlist; zero-PII logging. |
| **HTTP Security Headers** | Missing CSP, HSTS, Permissions-Policy, X-Frame-Options in inspectable root config | **RESOLVED (P0)** | Configured comprehensive headers in `next.config.mjs`: HSTS (2 years, preloaded), `nosniff`, `DENY`, `frame-ancestors 'none'`, `Permissions-Policy`, and calibrated CSP. |
| **Legal & Privacy Factuality** | Absolute 24-month deletion guarantee; unqualified TLS 1.3 / container claims; unqualified DPDP/GDPR applicability | **RESOLVED (P1)** | Updated `app/privacy-policy/page.tsx` with operational retention review policy, standard TLS/HTTPS encryption claims, DPDP Act phased rollout note, and EU/UK GDPR scope. |
| **SEO & Entity Schema** | Unverified `legalName: 'Ostrum'` claimed in Organization JSON-LD | **RESOLVED (P1)** | Removed `legalName: 'Ostrum'` from `app/layout.tsx` schema graph to prevent claiming an unregistered corporate entity. |
| **Performance** | WebGL render loop runs when tab is backgrounded; WorksWheel cards loaded eagerly | **RESOLVED (P2)** | Attached `visibilitychange` listener in `OstrumCore3D` to halt render loop when `document.hidden`; set `loading="lazy"` on off-front cards in `WorksWheel`. |
| **Accessibility** | Form error alert not programmatically connected to input fields | **RESOLVED (P2)** | Connected `aria-invalid` and `aria-describedby="contact-form-error"` to inputs; confirmed honeypot screen-reader isolation. |
| **Quality Gates** | Regressions across viewports, typography, or console errors | **VERIFIED** | 23/23 unit tests pass; `tsc --noEmit` clean; `next lint` clean; `next build` clean; Playwright verification 0px overflow across 8 viewports, 0 console errors, 0 dashes. |

---

## 2. Phase-by-Phase Technical Verification

### Phase 1: Dependency Security & Lockfile Audit
- **Package Updates:**
  - `next`: `15.5.27` -> `15.5.29` (official security patch resolving Server Actions DoS and SVG RCE).
  - `eslint-config-next`: `15.5.27` -> `15.5.29`.
  - Added npm `overrides` in `package.json` for:
    - `"postcss": "^8.5.32"` (eliminates GHSA-qx2v-qp2m-jg93 & GHSA-6g55-p6wh-862q).
    - `"postcss-selector-parser": "^6.1.5"` (eliminates GHSA-rj75-hqrm-r3gf).
    - `"minimatch": "^11.0.5"` (eliminates GHSA-g3hv-75wg-m249).
- **Vulnerability Audit:**
  - `npm audit --omit=dev`: **0 vulnerabilities**.
  - `npm audit`: **0 vulnerabilities** across all 378 packages in tree.

### Phase 2: Enquiry API Security & Distributed Rate Limiting
- **Location:** `lib/email/enquiry-mailer.ts`, `lib/email/rate-limiter.ts`, `app/api/enquiry/route.ts`.
- **Architectural Enhancements:**
  1. **Distributed + Memory Hybrid Rate Limiting:**
     - Connects directly to Upstash / Vercel KV REST API via atomic `INCR` + `EXPIRE` pipeline when `UPSTASH_REDIS_REST_URL` or `KV_REST_API_URL` credentials are provided.
     - Automatically falls back to an in-memory sliding-window circuit breaker (5 submissions per 10 minutes per IP) with automatic expired-key garbage collection.
  2. **Hard Payload Byte Limit:**
     - Pre-checks `Content-Length` header against `64 * 1024` (64 KB).
     - Consumes request body via a `ReadableStreamDefaultReader` with a running byte counter, immediately aborting stream reading and returning HTTP 413 if the payload exceeds 64 KB.
  3. **Strict Payload Structure Validation:**
     - Validates that the parsed JSON is a non-null plain object (rejecting arrays, strings, numbers, booleans, and null).
  4. **Strict Project Type Allowlist:**
     - Validates submitted `projectType` against `ALLOWED_PROJECT_TYPES` (9 options).
     - Case-insensitive matching; defaults omitted project type to `'Other / Not Sure Yet'`.
  5. **Edge IP Extraction Hierarchy:**
     - Evaluates `x-vercel-forwarded-for` -> `cf-connecting-ip` -> `x-real-ip` -> `x-forwarded-for`.
     - Validates IP syntax against strict IPv4 and IPv6 syntax regex, safely falling back to `127.0.0.1` upon detecting malformed or spoofed inputs.
  6. **Zero-PII Logging:**
     - Server logs contain only `correlationId` (generated via `crypto.randomUUID()`), timestamp, error codes, and delivery status. Visitor email addresses, names, and phone numbers are never printed to console logs.

### Phase 3: Security Headers Implementation
- **Location:** `next.config.mjs`.
- **Headers Verified on Live Production Server (`http://localhost:3000`):**
  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com; worker-src 'self' blob:; media-src 'self' data: blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  ```
- **Information Disclosure:** `X-Powered-By` header is disabled via `poweredByHeader: false`.

### Phase 4: SEO, GEO & Schema Review
- **Location:** `app/layout.tsx`.
- **Action:** Removed `legalName: 'Ostrum'` from the Organization JSON-LD graph.
- **Verification:** Organization and WebSite schema graphs remain valid, pointing to canonical `https://theostrum.com`.

### Phase 5: Privacy Policy Legal Factuality Alignment
- **Location:** `app/privacy-policy/page.tsx`.
- **Section 06:** Replaced absolute 24-month deletion claim with periodic operational review policy ("reviewed periodically and securely deleted or anonymized in accordance with our operational review cycle, typically within 24 months of our last communication, or sooner upon verified request").
- **Section 10:** Qualified technical security claims to standard modern TLS/HTTPS encryption, role-based access, and managed cloud runtime protections.
- **Section 11:** Clarified DPDP Act phased statutory rollout schedule and explicitly scoped GDPR rights to visitors located in the European Union and the United Kingdom.
- **Copy Standard:** Zero em-dashes (`—`) or en-dashes (`–`) introduced.

### Phase 6: Performance Hardening
- **WebGL Background Loop:** In `components/visuals/OstrumCore3D.tsx`, attached a `visibilitychange` listener. Rendering halts whenever `document.hidden` is true, eliminating idle GPU utilization when the browser tab is in the background.
- **WorksWheel Catalogue Images:** In `components/ui/works-wheel.tsx`, front active card receives `loading="eager"`, while non-front cards receive `loading="lazy"`.

### Phase 7: Accessibility Hardening
- **Location:** `components/sections/OstrumContactSection.tsx`.
- Form error alert given `id="contact-form-error"` with `role="alert"` and `aria-live="polite"`.
- Form inputs (`contact-name`, `contact-email`, `contact-message`) receive `aria-invalid={!!errorMessage}` and `aria-describedby={errorMessage ? "contact-form-error" : undefined}`.
- Honeypot input verified isolated with `tabIndex={-1}`, `aria-hidden="true"`, and `autoComplete="off"`.

---

## 3. Automated Quality Gate Results

### Unit & Integration Tests (`npm test`)
```
TAP version 13
1. Input Sanitization & HTML Escaping: 3/3 pass
2. Payload Validation & Honeypot Protection: 8/8 pass
3. Template Generation & Content Security: 2/2 pass
4. Resend Mailer Dispatch & Mock Integration: 4/4 pass
5. Rate Limiting Protection & Distributed Resilience: 2/2 pass
6. Trusted Client IP Extraction & Validation: 3/3 pass
7. LinkedIn Strict Validation & Placeholder Handling: 1/1 pass
Result: 23 passed, 0 failed, duration: 253ms.
```

### Type Checking & Linting
- `npx tsc --noEmit`: **0 errors** (code 0).
- `npm run lint`: **0 errors** (code 0).

### Production Build (`npm run build`)
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    24.8 kB         354 kB
├ ○ /_not-found                            136 B         103 kB
├ ƒ /api/enquiry                           136 B         103 kB
├ ○ /fr                                  1.34 kB         160 kB
├ ○ /preview/ostrum-core                 6.29 kB         270 kB
├ ○ /privacy-policy                      2.08 kB         173 kB
├ ○ /robots.txt                            136 B         103 kB
├ ○ /sitemap.xml                           136 B         103 kB
└ ○ /terms-and-conditions                2.08 kB         173 kB
+ First Load JS shared by all             103 kB
Result: All 10 routes compiled successfully.
```

### Playwright Master Release Verification (`scripts/verify_master_release.mjs`)
- **Dash Scan:**
  - Homepage: 0 em-dashes, 0 en-dashes
  - Terms & Conditions: 0 em-dashes, 0 en-dashes
  - Privacy Policy: 0 em-dashes, 0 en-dashes
- **Text Selection:** 100% selectable across all sections.
- **Wordmark Hop:** Verified (40.4px hop delta).
- **Curtain Reveal:** Verified (32.0px breathing space).
- **Selected Work Artwork Assets:** All 3 assets HTTP 200 (~650-750 KB).
- **8-Device Horizontal Overflow Matrix:** 0px overflow across all 8 devices (1920x1080 down to 360x800).
- **Console Errors:** 0 errors recorded.

---

## 4. Owner Launch Checklist (External Dependencies)

| Task | Owner Action Required |
|---|---|
| **Resend API Key** | Create production API key in Resend dashboard; add `RESEND_API_KEY` to Vercel production environment variables. |
| **Resend Domain Verification** | Add DNS TXT/MX records for `theostrum.com` in domain registrar; verify domain sending status in Resend. |
| **Distributed Cache (Optional)** | If cross-serverless-region rate limiting is desired, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or Vercel KV) in production environment variables. Otherwise, local process sliding-window protection operates automatically. |
| **Merge & Deploy** | Review changes on branch `fix/production-hardening-and-security`, merge to `main`, and trigger production deployment. |
