---
name: ostrum-launchops
description: Audit and prepare websites for launch across security, performance, accessibility, SEO/GEO, privacy, content and operations. Use for pre-launch reviews, fixes, audits and deployment sign-off.
---

# OSTRUM LaunchOps

**Website Launch & Growth Engineering**  
**Operating principle:** From code that builds to a launch you can prove.

## 1. Mission

Turn a website repository into an evidence-backed release decision. Inspect the actual product and deploy model first. Find material risks, recommend the smallest useful corrections, test the corrections, and separate code readiness from external owner actions.

This is a risk-based engineering workflow, not a generic “add every launch checklist item” generator. A brochure/portfolio website, a lead-generation site, an e-commerce store and a multi-tenant SaaS product have different attack surfaces and obligations. Never recommend controls for features that do not exist.

## 2. When to use

Use this skill when a user asks to:

- audit a website before launch or handover;
- review a Next.js/React or other web repository for security, performance, accessibility or technical SEO;
- prepare a pre-deployment checklist or release decision;
- review SEO, GEO, AEO, local search or AI-crawler readiness;
- assess cookies, analytics, privacy policy, form consent or legal pages;
- install or run a coding-agent security skill, including Cloudflare's security-audit skill;
- fix website launch blockers while preserving the existing design.

For a narrow question, use only the relevant reference. Do not run the full workflow unless the user requests a full audit, launch review or report.

## 3. Operating modes

### A. Audit-only (default)

Inspect and report. Do not edit files. Return findings with paths, line numbers, source evidence, risk, recommended minimal fix, and verification method. Ask before changing code unless the user has already asked for the fixes.

### B. Fix-approved

When the user explicitly requests implementation, work on a dedicated branch. Apply only approved, relevant fixes. Preserve the current visual system, content intent, responsive behaviour, animations, and working journeys unless a defect requires a minimal adjustment. Show or summarize each meaningful diff. Never introduce a new UI feature simply because a generic checklist mentions it.

### C. Release verification

Run the available quality gates and verify staging/live behaviour. Do not claim production verification from local tests. Deployment, DNS, secrets, paid services, merges and production changes require explicit owner approval.

## 4. Mandatory evidence labels

Every check must use one of these states:

- **PASS — SOURCE:** supported by code/config inspection only.
- **PASS — LOCAL:** actually executed and passed on the local production build or controlled local fixture.
- **PASS — STAGING:** actually tested against the named staging deployment.
- **PASS — LIVE:** actually tested against the public production URL.
- **FAIL:** a material defect is demonstrated by source or a reproducible test.
- **OWNER ACTION:** code is ready, but a domain, account, DNS record, secret, policy decision, email delivery, or other owner-side task remains.
- **NOT VERIFIED:** evidence is unavailable. State exactly what is missing and how to verify it.
- **NOT APPLICABLE:** the feature or risk does not exist in this product. Explain briefly.

Never convert an agent's narrative, green status, test count or report into independent evidence. Verify the commands, outputs, commit, lockfile and test artefacts directly where access permits. Label user-supplied results as **reported by the agent** until independently checked.

For each finding record:

1. ID and priority (`P0` to `P3`);
2. evidence state;
3. exact route/file/line or external setting;
4. affected principal, resource or user journey;
5. demonstrated impact or why it is a release risk;
6. smallest safe fix;
7. test that proves the fix;
8. owner dependency, if any.

Priority guidance:
- **P0:** exposed secret, demonstrated unauthorized access/data leak, exploitable critical vulnerability, remote code execution, destructive data-loss risk, or a false-success flow that silently loses important customer submissions.
- **P1:** high-likelihood abuse or privacy/security weakness on an exposed route, materially broken enquiry delivery, invalid canonical host/indexing configuration, or a serious accessibility barrier on a core journey.
- **P2:** important performance, metadata, UX or operational gap with a safe workaround.
- **P3:** optional polish or improvements that do not block a first release.

Do not inflate severity because a popular checklist labels an item “critical”. Severity requires an actual trust boundary and impact.

## 5. Start with repository reconnaissance

Before recommendations or changes:

1. Identify repository, owner, branch, `HEAD` SHA, upstream/default branch, dirty worktree and unpushed commits.
2. Inspect `package.json` and lockfile, framework/runtime versions, build scripts, dependency tree, app routes, API handlers, middleware/proxy, hosting config, CI workflows and environment variable names (never values).
3. Map actual data flows: browser → route/API → provider/database → logs/monitoring. Record what personal data is collected, where it goes and what third parties receive it.
4. Inventory user-facing journeys and product features: enquiry form, login, payments, uploads, search, booking, messaging, dashboard, etc.
5. Inspect design/performance architecture: image pipeline, fonts, client bundles, animation libraries, canvas/WebGL, embeds, third-party scripts and reduced-motion fallback.
6. Identify live domain and deployment provider only from verified configuration or owner confirmation. A production base URL in source is not proof that the domain is registered or live.
7. Search for existing audit documents and inspect their cited evidence. Do not blindly trust them.

### Product-type applicability gate

Classify the site before running feature-specific checks:

| Product type | Relevant checks | Usually not applicable unless present |
|---|---|---|
| Portfolio / studio / brochure | contact form, public pages, metadata, assets, email delivery, analytics, crawlability, content truth, accessibility | login, passwords, account lockout, database authorization, payments, refunds, shipping, pagination |
| Lead generation | portfolio checks plus form abuse, consent notice, CRM/email transfer, lead retention, attribution | password storage and user sessions unless there is an account area |
| SaaS / multi-tenant | auth, session, authorization/IDOR, tenant isolation, APIs, database policies, billing and lifecycle | nothing should be excluded without inspection |
| E-commerce | product/price integrity, checkout, payment provider, order data, returns/refunds/shipping, taxes, account security | do not invent these pages for a non-commerce site |

**OSTRUM profile at the reviewed public `main` commit `54d510f`:** Next.js 15 App Router, React 19, TypeScript, Tailwind, GSAP, Three.js/WebGL, Lenis and a Resend-backed enquiry form. The inspected app has a long-scroll studio homepage plus `/terms-and-conditions` and `/privacy-policy`, with `/api/enquiry`. No login, user account, database or payment flow appeared in the inspected dependency manifest/routes. Reconfirm the current branch before relying on this profile. The hardening branch and local commit reported as `b2e9de1` were not present on the inspected GitHub default branch at the time of packaging; treat those changes as unverified until pushed and reviewed.

For this OSTRUM site, prioritize the contact API, dependency patch state, trusted edge identity, real distributed rate limiting/WAF, CSP/header behaviour, WebGL cost, image loading, legal factuality, third-party asset attribution, SEO crawl access and deployment-owner tasks. Do not add authentication, database indexes, N+1 query fixes, pagination, checkout or refund pages without a newly verified feature that needs them.

## 6. Workflow order

Run only the parts that match the product and request. For a full pre-launch audit, use this order:

1. **Release identity and branch safety** — source ref, uncommitted changes, branch ancestry, remote visibility, CI status.
2. **Security and dependencies** — current advisories, secrets, API trust boundaries, request limits, validation, rate limiting, headers, external services.
3. **Functional integrity** — real contact submission, email delivery, error states, dead links, correct HTTP status codes, no fake success.
4. **Privacy and legal factuality** — data inventory, browser storage, trackers, disclosures, provider transfers, retention, policy scope, asset licences.
5. **Accessibility** — semantic structure, keyboard, labels/errors, focus, alt text, contrast, reduced motion, zoom and touch interaction.
6. **Performance** — production build, lab measurements, Core Web Vitals readiness, critical image/JS/WebGL cost and low-end device behaviour.
7. **SEO/GEO** — route-level metadata, crawl/index controls, canonical host, sitemap, schema, internal links, search bot access and genuine content usefulness.
8. **Owner-side deployment** — domain, DNS, TLS, mail, secrets, analytics choice, Search Console, WAF/monitoring and rollback.
9. **Decision and handoff** — GO / CONDITIONAL GO / NO-GO with blockers and evidence.

Detailed controls are in `references/`.

## 7. Security method

Use the current OWASP ASVS and framework/provider documentation as the verification baseline. Check the actual framework version against official security advisories as of the audit date. Do not rely on a single `npm audit` count; inspect direct/transitive packages, overrides, lockfile resolution, supported versions and runtime compatibility.

For public API/form routes, inspect:

- request body size limits enforced while reading the stream and before parsing;
- content type, schema, field types and maximum lengths;
- strict allowlists for enumerated values;
- output escaping for HTML/email/templates and CRLF protection;
- no raw PII, secrets, tokens or untrusted request payloads in logs;
- rate limiting shared across production instances, or an edge/WAF rule with verified enforcement;
- IP identity derived only from a trusted hosting/proxy boundary, not an arbitrary client-supplied forwarding header;
- bounded timeouts, safe error handling, retry semantics and provider acceptance vs inbox delivery;
- abuse controls that do not block legitimate search crawlers or customers.

Do not call a process-local Map a distributed limiter. A local fallback is best-effort only; label the residual production risk. Prefer an explicit shared store or edge WAF for a public production route. If the shared store fails, document whether the route fails open, fails closed, or falls back, and test that behaviour.

Treat CSP separately from generic headers. Begin with report-only when appropriate, test the real production build, review browser violation logs, and enforce only a policy that preserves required scripts, styles, fonts, image textures, WebGL and network connections. Do not paste a generic CSP into an animation-heavy site.

Only enable HSTS after the production domain serves a valid HTTPS certificate and every intended subdomain covered by `includeSubDomains` is HTTPS-ready. Do not add `preload` as decoration; verify preload requirements and owner intent. Preview/local hosts need separate consideration.

## 8. Cloudflare Security Audit companion

Cloudflare's `cloudflare/security-audit-skill` is a third-party, MIT-licensed companion. It is not an OSTRUM skill, does not itself enable Cloudflare WAF, and does not configure DNS or firewall rules.

When the user asks to install it:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
```

Verify the agent-specific installation location and read the installed `SKILL.md` before invoking it. Keep its files separate and unmodified. The upstream full-audit workflow requires isolated agents and an OS-enforced sandbox with no external network for target-controlled execution, an allowlisted environment, read-only source/toolchain and strict resource limits. It also prohibits probing production/shared infrastructure. If Antigravity cannot enforce these requirements, do not pretend to have completed the six-phase full audit; run a safe static/source-only review and mark execution-dependent items `NOT VERIFIED`.

Cloudflare WAF is an account/zone configuration, separate from the code-audit skill. Do not change DNS, proxy state, TLS mode, WAF, bot controls or origin access without owner approval. Confirm whether Vercel or Cloudflare is the intended edge. Avoid operating two partially configured proxies or exposing a bypassable origin. See `references/security-and-cloudflare.md`.

## 9. SEO, GEO and local discovery rules

- SEO metadata is per **indexable URL**, not per section inside one long-scroll route. A homepage with eight sections still has one title and one meta description. Add route-specific metadata only when a real, useful, indexable page exists.
- Use a concise, accurate title and human-readable description, one clear page H1, semantic headings, descriptive crawlable links, useful visible content, image alt text and canonical URLs.
- `robots.txt` controls crawling, not guaranteed indexing. A sitemap is a discovery hint, not an indexing or ranking guarantee.
- Allow `OAI-SearchBot` if the owner wants the site to be eligible for ChatGPT search. Also ensure the CDN/WAF/hosting firewall allows its published IP ranges; `robots.txt` alone cannot override a network block. GPTBot is a separate policy decision from OAI-SearchBot.
- Google says its AI features use foundational SEO; there are no special AI Overview technical requirements. Do not sell `llms.txt`, keyword stuffing, mass-generated city pages, “AI chunks”, hidden FAQ text or fake schema as ranking shortcuts.
- Use `Organization` and `WebSite` schema only with verified brand/entity details. Use `LocalBusiness` only when the organisation meets real eligibility criteria and facts are verified. Never invent a storefront, postal address, opening hours, phone number, registration name, reviews or `aggregateRating`.
- Google Business Profile is for businesses with in-person customer contact during stated hours, including qualifying service-area businesses. Online-only businesses are not eligible. A virtual office, coworking address or client location must not be presented as the studio's own storefront.
- City/service keywords are useful only when supported by actual service coverage and original locally relevant content. Avoid thin pages such as “web design in every city” with only the city name swapped.
- Do not repeat generic SEO CTR percentages, “7x more calls” statements or fixed review-count-to-ranking tables unless a relevant, current, credible study supports the exact context. Search position and CTR vary by query, feature layout, device, brand and market.
- Use honest project highlights, approved client quotes and demonstrable outcomes. No invented ratings, testimonial wording, client permissions, conversion results or performance claims.

## 10. Performance and accessibility rules

Measure before optimising. Use production builds and representative mobile settings. Core Web Vitals good thresholds are evaluated at the 75th percentile: LCP ≤ 2.5s, INP ≤ 200ms and CLS ≤ 0.1. Lighthouse is a lab diagnostic; it is not CrUX field data.

For image-heavy or animation-heavy pages:

- identify the actual LCP element and loading waterfall;
- prioritise only the real LCP/hero image and lazy-load below-fold imagery;
- use responsive dimensions/`sizes`, stable aspect ratios and image optimisation; convert formats only where measured size/quality justifies it;
- inspect initial route JS and long tasks; split/defer only expensive non-critical components where regression tests prove the interaction still works;
- pause render loops when hidden/offscreen where safe, support reduced motion and provide useful static fallback when WebGL is unavailable;
- test real mobile browsers, small viewport widths, low-end GPU/CPU, no-WebGL and context-loss conditions.

Accessibility testing must combine automation and manual checks: keyboard-only operation, skip link, heading order, labels, error associations, focus handling, screen-reader names, meaningful alt text, decorative image hiding, contrast, 200% zoom, reflow, touch target size and reduced-motion behaviour. An eight-viewport overflow test is not a WCAG audit.

Do not impose an arbitrary “initial JS must be under 200 KB” requirement without defining measurement method, browser, compression, route and product context. Use bundle analysis and actual user-perceived performance.

## 11. Privacy, legal and copy rules

Start with the actual data inventory, not a template. Record every field, browser storage key, cookie, analytics tool, embed, email provider, hosting log, monitoring SDK and data recipient. Minimise collection; optional fields must remain optional in both UI and server schema.

A cookie banner is not automatically required just because a website exists. Decide from actual cookies/browser storage, third-party scripts, tracking purpose, target jurisdictions and applicable law. `sessionStorage` and `localStorage` are not HTTP cookies, but still belong in an accurate storage inventory. If non-essential tracking is used in a jurisdiction requiring opt-in consent, prevent it from running until the correct consent is obtained and provide a working preference change path. Do not add a fake consent UI that does not control scripts.

For enquiries, make clear what is collected and that the information is used to respond. Keep any marketing opt-in separate, optional and unchecked. Do not use an obligatory bundled checkbox for unrelated promotional purposes. Record consent only where consent is the chosen legal basis and the applicable law requires/benefits from that record; otherwise use a plain-language notice and correct legal basis after owner/legal review.

Do not add refund, cancellation, shipping, returns, billing, login, password reset, child-age gate or DPA pages unless the business model or actual feature requires them. Website terms do not replace a signed MSA/SOW for paid client engagements.

For India, check the currently effective provisions and phased commencement of the DPDP Act/Rules on the audit date. Do not say “fully DPDP compliant” based only on a policy rewrite. Distinguish the Indian Data Fiduciary framework from GDPR controller/processor language where relevant. Have an Indian privacy lawyer review the actual entity, contact/grievance details, legal basis, notice, retention, rights process, processors and international transfers.

Use plain, specific business copy. Remove unsupported claims (“enterprise-grade”, “fully secure”, “autonomous”, “high-converting”, “guaranteed growth”) unless evidence exists. Replace abstract AI-generated phrases with actual services, deliverables, sectors, process and approved case-study details. Do not mass-publish generic pages for search traffic.

Check asset provenance and commercial permissions. Track source, creator, license, changes, attribution requirements, fonts, 3D models, stock photos, generated assets and code components. Make required attribution visible to site visitors when the license requires it; a notice buried in a private repository may not meet a public attribution obligation.

## 12. Fix and release discipline

When implementation is approved:

1. Preserve the current branch, dirty work and user files; do not overwrite them.
2. Create/use a dedicated fix branch. Never force-push or push to the default branch.
3. Fix P0/P1 items first; batch only closely related low-risk fixes.
4. Keep changes minimal. Do not redesign, add animations, add a cookie banner, add a dark-mode toggle, add a chatbot, rewrite all copy or add extra pages unless a verified requirement justifies it.
5. Add tests that prove the actual risk is addressed, including negative cases.
6. Run lockfile install (`npm ci` where applicable), dependency audit, typecheck, lint, unit tests, production build and relevant browser tests. Include exact commands and exit codes.
7. Push the branch and open a draft PR only if the user authorised GitHub writes and the required access exists. If not, provide the branch/commit and exact push instructions.
8. Verify staging separately; do not infer live headers, DNS, email delivery or crawler access from local code.
9. Require owner approval for merge/deployment, production secret entry, domain/DNS edits, Cloudflare proxy/WAF settings, mailbox sending or paid services.
10. Provide rollback target, changes, residual risks, owner checklist and decision.

## 13. Final answer format

Return:

1. **Executive verdict:** GO / CONDITIONAL GO / NO-GO.
2. **Scope and exact source ref:** repository, branch, commit, clean/dirty status.
3. **Evidence summary:** counts by PASS-SOURCE, PASS-LOCAL, PASS-STAGING, PASS-LIVE, FAIL, OWNER ACTION, NOT VERIFIED and NOT APPLICABLE.
4. **P0/P1 blockers:** each with source lines, impact, smallest fix and verification.
5. **Completed changes:** file paths and commit, not just a narrative.
6. **Performance/accessibility/SEO/privacy findings:** relevant only to this product.
7. **Owner actions:** exact Vercel/registrar/Resend/Cloudflare/Search Console actions and what cannot be completed in code.
8. **Residual risks and rollback.**
9. **What was not tested.**

Never use “100% secure”, “fully compliant”, “zero risk”, “ranking guaranteed” or “ready to deploy” when a live or owner-side gate remains unverified.

## 14. Reference routing

- Security, Cloudflare, Next advisories, CSP, WAF and API hardening: `references/security-and-cloudflare.md`
- SEO, GEO, OpenAI crawler, local keywords and Google Business Profile: `references/seo-geo-local.md`
- Core Web Vitals, WebGL, image bundles and WCAG: `references/performance-accessibility.md`
- India privacy, cookie/consent decision, legal text and asset credits: `references/privacy-legal-content.md`
- Evidence method, scope and severity: `references/audit-method.md`
- Deploy, staging, DNS, mail, Search Console and rollback: `references/release-operations.md`
- Report/checklist templates: `templates/`
