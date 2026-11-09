# OSTRUM LaunchOps

**Website Launch & Growth Engineering Skill for Claude and Antigravity**

A practical operating system for taking an existing website from “it builds” to an evidence-backed release. OSTRUM LaunchOps guides a coding agent through repository reconnaissance, risk-based security review, performance and accessibility testing, technical SEO and AI-search discoverability, privacy and content truth checks, and a controlled release decision.

This is not a prompt collection that blindly adds every fashionable component. It adapts the review to the actual product. A studio portfolio does not need login hardening or database indexes; a SaaS application does. The skill asks for proof before recommending changes and keeps visual identity and existing behaviour intact.

## What is included

- `ostrum-launchops/SKILL.md` — the agent's operating instructions and workflow router.
- `ostrum-launchops/references/` — detailed playbooks for evidence-led audits, SEO/GEO/local search, application security and Cloudflare, performance/accessibility, privacy/legal/content truth, and release operations.
- `ostrum-launchops/templates/` — an evidence-based audit report, owner-input sheet, and launch checklist.

## Core capabilities

1. **Repo-first launch audit** — maps the stack, routes, APIs, data flows, dependencies, hosting, environment variables and actual user journeys.
2. **Security review** — checks dependency advisories, secrets, server-side validation, request limits, rate limiting, trusted proxy/IP handling, security headers, CSP, third-party code and deployment controls.
3. **Cloudflare-aware hardening** — distinguishes the Cloudflare Security Audit coding-agent skill from Cloudflare WAF/DNS configuration. It can install and invoke Cloudflare's official security-audit skill as a separate tool.
4. **Performance engineering** — measures real bottlenecks rather than imposing arbitrary bundle-size or image-format rules; covers Core Web Vitals, images, route bundles, fonts, WebGL and animation-heavy pages.
5. **SEO + GEO/AEO** — technical crawlability, per-URL metadata, semantic content, schema accuracy, sitemap, robots, Search Console handoff and AI-search crawler access without ranking gimmicks.
6. **Local SEO reality checks** — prevents fake addresses, ineligible Google Business Profiles, thin city pages, paid/incentivised reviews and unsupported ranking claims.
7. **Privacy and legal factuality** — maps actual data collection, browser storage, analytics, embeds, service providers, consent notices, retention and jurisdiction-specific owner review.
8. **Accessibility and UX quality** — keyboard operation, focus, form semantics, alt text, contrast, reduced motion, zoom and error/success states.
9. **Release discipline** — branch isolation, evidence ledger, owner actions, rollback plan and GO / CONDITIONAL GO / NO-GO decision.

## Install

### Antigravity (workspace-specific)

Copy the `ostrum-launchops` folder into the repository at:

```text
<repo>/.agents/skills/ostrum-launchops/SKILL.md
```

Keep the `references/` and `templates/` folders beside `SKILL.md`. Restart or refresh Antigravity's skill discovery, then invoke `/ostrum-launchops` or ask it to perform a pre-launch audit.

### Claude Code (project-specific)

Copy the same folder to:

```text
<repo>/.claude/skills/ostrum-launchops/SKILL.md
```

Then invoke `/ostrum-launchops` or describe the task in natural language.

### Claude.ai

Upload the `ostrum-launchops` folder as a custom skill ZIP through Claude's skill management interface. The archive for this package contains the skill folder and its supporting references/templates.

### Skills CLI (after publishing to a Git repository)

Once OSTRUM publishes this skill in a repository, it can be installed with the Skills CLI using the repository URL and skill name, for example:

```bash
npx skills add https://github.com/<ORG>/<REPO> --skill ostrum-launchops
```

Check the CLI's current agent-selection options before installing. For Antigravity, verify that the result lands in the workspace `.agents/skills/` location.

## Optional companion: Cloudflare Security Audit

The official Cloudflare skill is a separate MIT-licensed project. Do not merge its source into this product or present it as OSTRUM-authored. Install it separately:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
```

Its full audit workflow requires isolated agents and an OS-enforced sandbox. If the host cannot enforce its stated execution controls, the agent must keep executable checks as `NEEDS VALIDATION` and perform only the safe source review it can support.

## Product positioning

**Product name:** OSTRUM LaunchOps  
**Descriptor:** Website Launch & Growth Engineering Skill  
**Tagline:** From code that builds to a launch you can prove.  
**Who it serves:** indie founders, agencies, freelance developers, studio teams and AI-assisted builders shipping Next.js or other modern websites.

**Why it is more than a checklist:** It adapts the checklist to the product type, asks the agent to cite file/line evidence, separates code fixes from hosting/account tasks, uses current official sources for time-sensitive advisories, and prevents “all green” claims where live or owner-side verification is missing.

## Important boundaries

- This skill is an engineering workflow, not a guarantee of security, rankings, legal compliance or sales outcomes.
- It is not a substitute for qualified legal advice or a professional penetration test.
- It must not run active scanners against production or third-party systems without explicit authorization and an agreed test window.
- It must not register domains, edit DNS, expose secrets, change production settings, merge to the default branch or deploy without explicit owner approval.
- It must not invent customer quotes, locations, legal entities, metrics, certifications, ratings, keywords search volumes or business facts.

## Rights and licensing

© 2026 OSTRUM. All rights reserved. This is an original OSTRUM-branded skill package. No third-party skill source code is bundled in this package. The Cloudflare skill is referenced as an optional companion and remains governed by its own MIT license. Set commercial distribution terms, update policy and support scope before selling copies; do not imply legal, security or ranking guarantees.

## Official references

- Anthropic, creating custom skills: https://support.claude.com/en/articles/12512198-how-to-create-custom-skills
- Anthropic skills repository: https://github.com/anthropics/skills
- Antigravity skills documentation: https://antigravity.google/docs/skills?app=cli
- Cloudflare security-audit-skill: https://github.com/cloudflare/security-audit-skill
- Google Search Central AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Vercel production checklist: https://vercel.com/docs/production-checklist
- OWASP ASVS 5.0: https://asvs.owasp.org/
