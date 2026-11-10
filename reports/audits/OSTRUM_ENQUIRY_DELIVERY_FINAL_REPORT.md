# OSTRUM Enquiry Delivery & Rate Limiting Final Report

**Audit Date:** 10 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Authoritative Verdict:** **PASS ✓ (HARDENED & VERIFIED)**

---

## 1. Architecture Truthfulness & Zero-PII Invariant

The OSTRUM enquiry system is strictly a **stateless transactional notification pipeline** powered by Resend:
- **Zero Database:** There is no database (PostgreSQL, MongoDB, Supabase, Firestore), no CRM, no dashboard, and no local disk storage.
- **Immediate Forwarding:** Submissions are validated, HTML/text sanitized, and dispatched directly to the studio email inbox (`OSTRUM_ENQUIRY_TO` / `hello@theostrum.com`).
- **Zero PII Leakage:** The API endpoint (`/api/enquiry`) never reflects visitor details back in the response. All errors return generic user-friendly messages.
- **Reply-To Integrity:** The visitor's verified email is passed as the `replyTo` parameter, allowing one-click reply directly from the studio inbox.

---

## 2. Production Rate Limiting & Fail-Closed Hardening

### The Vulnerability Addressed
Previously, when running in production:
1. If `ENQUIRY_SALT` was absent, the server fell back to a per-process random UUID. In a serverless environment (Vercel), cold boots generated distinct UUIDs, causing client IP HMAC hashes to diverge across instances.
2. If Upstash Redis credentials (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) were unconfigured or failed, the system silently downgraded to an in-memory `Map`. On serverless instances, this permitted distributed brute-force attacks across separate containers.

### Hardened Implementation in `lib/email/enquiry-mailer.ts`
1. **Mandatory High-Entropy Salt:**
   - In production (`process.env.NODE_ENV === 'production'`), `ENQUIRY_SALT` is strictly required with a minimum length of 16 characters.
   - If missing, `getEnquirySalt()` returns `null`, and `checkRateLimitAsync()` immediately returns:
     ```json
     {
       "allowed": false,
       "provider": "distributed_redis",
       "errorCategory": "rate_limit_unavailable"
     }
     ```
2. **Mandatory Distributed Upstash Redis Store:**
   - In production, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` must be present.
   - Atomic fixed-window counters via Upstash REST pipeline (`INCR` + `EXPIRE NX` + `TTL`) enforce a strict window of **5 requests per 10 minutes** per hashed client IP.
   - If Redis credentials are missing or if the Redis HTTP request returns non-200 / times out, production **fails closed** and returns `rate_limit_unavailable`.
   - In-memory rate limiting is strictly prohibited in production and enabled only in development and automated testing (`process.env.NODE_ENV !== 'production'`).
3. **Controlled 503 Service Unavailable Response:**
   - In `app/api/enquiry/route.ts`, if `rate_limit_unavailable` is detected, the API returns HTTP 503:
     ```json
     {
       "success": false,
       "error": "Enquiry service is temporarily unavailable. Please email us directly at hello@theostrum.com."
     }
     ```
     with `Retry-After: 60`.

---

## 3. Test Coverage & Verification

In `tests/enquiry.test.mjs`, comprehensive unit and integration tests verify:
1. `production fails closed with rate_limit_unavailable when ENQUIRY_SALT is missing` — **PASS ✓**
2. `production fails closed with rate_limit_unavailable when Upstash credentials are missing` — **PASS ✓**
3. `production fails closed with rate_limit_unavailable when Upstash Redis store errors` — **PASS ✓**
4. `production operates distributed rate limiting with mock Upstash Redis store` (5 requests allowed, 6th blocked) — **PASS ✓**
5. `getEnquirySalt returns null in production when missing or too short, returns value when valid` — **PASS ✓**
6. Local development and test in-memory rate limiting — **PASS ✓**
7. 29/29 total tests passing across all suites.
