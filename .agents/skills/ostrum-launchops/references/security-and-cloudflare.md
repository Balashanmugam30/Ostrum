# Web application security and Cloudflare playbook

## 1. Dependency and framework review

- Inspect the lockfile-resolved versions, not only semver ranges in `package.json`.
- Query official framework/security advisories and release notes using the audit date.
- Review direct and transitive packages, including `next`, `react`, `react-dom`, `eslint-config-next`, image tooling and server/runtime dependencies.
- Run the package manager's full audit (including dev dependencies) and production-only audit; explain each remaining issue and whether it reaches production.
- Inspect `overrides`/`resolutions` one by one. Record which advisory each override addresses, the parent dependency path, compatibility, engine requirements and test evidence. Do not apply arbitrary major-version overrides or `npm audit fix --force` just to obtain a zero count.
- Run a clean lockfile install and all build/test checks after dependency changes.

## 2. Secrets and repository hygiene

- Scan tracked files, Git history, CI workflows, build artefacts, source maps, public assets, container images and logs for credentials.
- `.env.example` may contain variable names and placeholders only.
- Never print secret values in the report. Record the secret name and location only.
- If a real key was ever committed, rotate/revoke it; deleting the line is not sufficient.
- Configure secrets in the production host's secret store, separately for development/preview/production.
- Check repository/environment access roles, MFA, stale tokens and deployment permissions.

## 3. Public enquiry/API route

For each exposed form/API route verify:

- maximum body bytes, enforced while streaming before JSON parsing;
- content-type and valid JSON object shape;
- schema validation with field types and explicit maximum lengths;
- enumerated fields use the same exact allowlist on client and server;
- HTML escaping and header-injection protection for emails;
- no secret, PII, body, raw IP or full provider response in logs;
- correlation IDs generated with a cryptographically suitable UUID API;
- rate limit at the edge or a shared atomic store, with documented fail-open/fail-closed behaviour;
- only trusted proxy headers are used for client identity;
- request timeout and exception handling avoid unhandled rejections;
- success is returned only when the upstream provider accepted the send, and UX does not imply guaranteed inbox delivery;
- honeypot controls do not trap screen readers or keyboard users.

Do not trust `X-Forwarded-For` merely because it is syntactically a valid IP. The origin must be reachable only through trusted proxies, or the platform must provide a verified client-IP API. A spoofable fallback to `127.0.0.1` can put unrelated clients into one rate-limit bucket.

A process-local Map is not a distributed limiter: it resets with cold starts and does not coordinate regions/instances. A memory fallback can be documented as best-effort, but production should have a shared store or edge/WAF control for a public endpoint. Test both normal and limiter-outage behaviour.

## 4. Security headers and CSP

Evaluate:

- `Strict-Transport-Security` (only after domain/TLS readiness; carefully evaluate `includeSubDomains` and `preload`);
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy` appropriate to the site;
- `X-Frame-Options` or CSP `frame-ancestors`;
- `Permissions-Policy` only for features the site does not need;
- CSP built from the actual script/style/image/font/connect/worker/media needs.

For CSP:

1. inventory scripts, Next bootstrap, inline JSON-LD, animation dependencies, WebGL textures, fonts, image origins and network connections;
2. start with `Content-Security-Policy-Report-Only` where practical;
3. exercise every page, route and critical journey against a production build;
4. inspect browser console and CSP reports;
5. remove broad allowances where feasible; use nonces/hashes when architecture supports them;
6. enforce only when the policy has no unexplained breakage.

Do not blindly add `unsafe-inline`/`unsafe-eval` or a restrictive `default-src 'self'` that silently breaks the site. Avoid deprecated `X-XSS-Protection` as a substitute for output encoding/CSP.

HSTS with a two-year `includeSubDomains; preload` policy is not a harmless checkbox. First verify every covered web subdomain is HTTPS-ready and the owner wants the irreversible/long-lived browser policy. Preload submission is a separate step.

## 5. Cloudflare Security Audit skill

Official repository: https://github.com/cloudflare/security-audit-skill  
Install command:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
```

License: MIT. Keep its source separate from OSTRUM LaunchOps and include its copyright/license notices if redistributing its files.

The Cloudflare skill is a source-first, six-phase security audit workflow. It requires:

- tool-using agent with parallel sub-agent capability;
- Node.js for its validators;
- OS-enforced sandbox, no external network for target-controlled execution, allowlisted environment, read-only target/toolchain, isolated scratch paths and resource/time limits;
- local/dummy test identities only;
- no production/shared infrastructure probing.

If the host cannot satisfy these requirements, do not run its full workflow. Do a safe source review, state which sandbox/sub-agent controls are missing and leave execution-dependent candidates as `NEEDS VALIDATION`.

## 6. Cloudflare WAF is separate

The skill does not configure a Cloudflare zone. WAF, bot controls, rate limiting, DNS proxying, TLS, origin rules and firewall events require Cloudflare account access and deliberate owner approval.

For an enquiry API, a targeted edge rate-limit rule can be useful (for example on `/api/enquiry` with a conservative threshold). Test it against legitimate repeated submissions, NAT/mobile carrier behaviour, retries and email provider failure. Do not rate-limit static assets or search bots accidentally. Cloudflare rate limits can have enforcement delay and request counters can be scoped; do not promise an exact number of requests will never reach origin.

If the app is hosted on Vercel, compare Vercel Firewall/Deployment Protection with Cloudflare in front of Vercel. Before proxying through Cloudflare, validate DNS, TLS mode, origin reachability, canonical redirects, forwarded IP trust, caching exclusions for dynamic API routes, WebGL/static asset delivery and rollback. Do not change nameservers or orange-cloud proxy state without owner approval.

## 7. Safe testing

- Static review is safe by default.
- Run ZAP baseline/active scans, Nmap, sqlmap, fuzzers and load tools only on owned staging targets under an explicit test scope/window.
- Never test a third-party customer system, client website, public origin, shared WAF or live production without specific authorization.
- Do not use real credentials or real user records; use dummy data.
- Stop at the minimum proof needed; do not persist, exfiltrate or damage.

## Official sources

- Cloudflare security-audit-skill: https://github.com/cloudflare/security-audit-skill
- Cloudflare WAF: https://developers.cloudflare.com/waf/
- Cloudflare rate limiting: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Cloudflare managed rules: https://developers.cloudflare.com/waf/managed-rules/
- Cloudflare security headers: https://developers.cloudflare.com/workers/examples/security-headers/
- Vercel production checklist: https://vercel.com/docs/production-checklist
- OWASP ASVS: https://asvs.owasp.org/
- OWASP HTTP headers cheat sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- OWASP input validation cheat sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- MDN CSP guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
