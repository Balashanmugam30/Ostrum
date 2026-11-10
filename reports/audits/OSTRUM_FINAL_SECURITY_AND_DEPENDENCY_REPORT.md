# OSTRUM Final Security & Dependency Audit Report

**Audit Date:** 10 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Security Status:** **HARDENED & SECURE (0 Vulnerabilities, 0 Exposed Secrets)**

---

## 1. Dependency Security & Vulnerability Scan

- **NPM Audit Result:**
  ```text
  found 0 vulnerabilities
  ```
- **Next.js Version:** `15.5.29` (patched against known SSR/middleware bypass advisories).
- **Three.js & Sharp:** Pinned to secure modern releases with zero reported CVEs.

---

## 2. Secrets & Credential Quarantine

- **Git Secret Scan:**
  - Zero private keys, tokens, or plaintext credentials committed to Git.
  - `.env`, `.env.local`, `.env.production` are strictly tracked in `.gitignore`.
  - All sensitive integration tokens (`RESEND_API_KEY`, `ENQUIRY_SALT`, `UPSTASH_REDIS_REST_TOKEN`) are accessed exclusively via server-side `process.env`.

---

## 3. Serverless Security & Rate Limiting Hardening

- **Fail-Closed Security Posture:**
  - When `process.env.NODE_ENV === 'production'`, the enquiry API enforces strict distributed rate limiting.
  - Missing `ENQUIRY_SALT` or Upstash Redis credentials fails closed immediately with HTTP 503 instead of falling back to insecure in-memory or random UUID logic.
- **Client IP Masking (HMAC SHA-256):**
  - Raw visitor IPs are never stored in Redis.
  - IPs are keyed with HMAC SHA-256 using `ENQUIRY_SALT` and truncated to a 16-hex key: `ostrum:rl:enquiry:<hashed_ip>`.
- **Payload & Stream Protection:**
  - Hard 64KB body limit enforced both via `content-length` and a streaming byte counter.
  - Strict honeypot protection (`website` field) drops bot submissions silently.
  - HTML escaping (`&`, `<`, `>`, `"`, `'`) protects against XSS/HTML injection in email templates.

---

## 4. Security Headers (configured in `next.config.mjs`)

- `Content-Security-Policy`: Modern CSP allowing required script/style/font/model sources while blocking untrusted scripts.
- `X-Frame-Options`: `DENY` (prevents clickjacking).
- `X-Content-Type-Options`: `nosniff`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `Permissions-Policy`: Camera, microphone, and geolocation disabled.
