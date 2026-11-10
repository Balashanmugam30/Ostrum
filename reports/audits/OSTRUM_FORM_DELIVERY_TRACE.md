# OSTRUM Enquiry Form End-to-End Delivery Trace

**Audit Date:** 10 November 2026, 12:38 IST  
**Component:** `components/sections/OstrumContactSection.tsx`  
**API Route:** `app/api/enquiry/route.ts`  
**Mailer Library:** `lib/email/enquiry-mailer.ts`  
**Test Suite:** `tests/enquiry.test.mjs` (24/24 passing)  

---

## 1. Architectural Architecture & Destination Reality

> **Critical Architecture Note for Owner:**  
> The OSTRUM contact form does **not** persist enquiry submissions into a database, CRM, dashboard, Supabase, or Firebase store. There is no admin inbox portal in the codebase.  
> The enquiry flow is an **ephemeral transactional email workflow**. Submissions are validated server-side and dispatched immediately via Resend to the studio notification inbox (`hello@theostrum.com`).

---

## 2. Field-by-Field Data Flow Matrix

| UI Input Name | JSON Payload Key | Server Validation Rule | HTML Email Field | Destination Header |
|---|---|---|---|---|
| **Full Name** | `name` | String, trimmed, 2–100 chars, single-line sanitized, HTML escaped | Header & Sender Info | Used in Subject: `[OSTRUM Enquiry] New project enquiry from {name}` |
| **Work Email** | `email` | RFC 5322 regex, max 254 chars, single-line sanitized, HTML escaped | Sender Information | **`replyTo` Header** (clicking Reply in mail client replies directly to submitter) |
| **Company** | `company` | Optional string, max 120 chars, single-line sanitized (defaults to "Not specified") | Sender Information | Subject (if provided) & body |
| **Project Type** | `projectType` | Strict allowlist of 9 approved service categories | Project Classification | Email body table |
| **Phone** | `phone` | Optional string, max 50 chars, single-line sanitized (defaults to "Not provided") | Sender Information | Email body table |
| **Message / Brief** | `message` | String, trimmed, 10–5000 chars, HTML escaped with `<br />` breaks | Project Description & Scope | Email body main container |
| **Honeypot 1** | `website_url` | Must be empty. If filled, rejected with generic success/silent block | *Not included* | *Dropped* |
| **Honeypot 2** | `hp_check` | Must be empty. If filled, rejected with generic success/silent block | *Not included* | *Dropped* |

---

## 3. Server Security & Abuse Controls

1. **Hard Size Limit:** Pre-read `content-length` check and chunked streaming byte counter capped strictly at 64 KB (`65,536 bytes`). Submissions exceeding 64 KB return HTTP 413 immediately.
2. **Streaming Read:** Body parsed via `request.body.getReader()` with chunk accumulation to prevent heap exhaustion.
3. **JSON Validation:** Rejects malformed JSON and non-plain-object payloads (arrays, primitives) with HTTP 400.
4. **Rate Limiting:**
   - Production Distributed Store: Atomic fixed-window counter via Upstash Redis REST API (`INCR`, `EXPIRE NX 600`, `TTL`). Client IP is hashed via SHA-256 (`crypto.createHash('sha256')`) so raw IPs are never stored in Redis.
   - Development & Offline Fallback: In-memory sliding-window circuit breaker (5 requests per 10 minutes per IP).
   - Rate limit exceeded returns HTTP 429 with `Retry-After: 600` header.
5. **Correlation ID:** Generated using cryptographic randomness (`node:crypto` `randomUUID().substring(0, 8)`). Zero `Math.random()` in security-sensitive paths.
6. **Zero-PII Logging:** Server logs record only correlation ID, ISO timestamp, result category, and provider message ID. Submitter name, email, phone, company, and message text are never logged.

---

## 4. Production Mail Delivery Environment Configuration

The following environment variables must be configured in Vercel Production Settings:

| Environment Variable | Scope | Status | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | Production Server-Only | **Pending Owner Action** | Sensitive API key provisioned from resend.com |
| `OSTRUM_ENQUIRY_TO` | Production Server-Only | Defaults to `hello@theostrum.com` | Destination inbox for studio partners |
| `OSTRUM_ENQUIRY_FROM` | Production Server-Only | Defaults to `OSTRUM Website <website@theostrum.com>` | Verified sender address on `theostrum.com` |
| `UPSTASH_REDIS_REST_URL` | Production Server-Only | Optional / Recommended | Upstash Redis REST endpoint for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Production Server-Only | Optional / Recommended | Upstash Redis REST authorization token |
| `RESEND_MOCK` | Development Only | **Strictly Prohibited in Production** | Rejection with HTTP 500 enforced if set to true in production |
