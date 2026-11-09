# Release operations and owner handoff

## 1. Source control and branch safety

- Record default branch SHA, working branch, uncommitted files, upstream branch and ahead/behind counts.
- Never overwrite uncommitted user work.
- Keep hardening changes in a dedicated branch and review the full diff against the default branch.
- A local commit is not a GitHub branch. Verify `git ls-remote`, GitHub branch listing or PR visibility.
- Push only with owner-authorised credentials; no force push. If the remote branch is absent, push it normally and set upstream.
- Create a draft PR for review if authorised. Do not merge automatically.

## 2. Code-level release gates

Adapt commands to the actual package manager/framework. For a Node/Next project, typical checks:

```bash
npm ci
npm audit
npm audit --omit=dev
npm ls next react react-dom eslint-config-next
npm run typecheck
npm run lint
npm test
npm run build
```

Run route/browser tests on the actual production build. Test negative cases: oversized body, malformed JSON, wrong content type, primitive/array JSON, unknown enum, spam trap, provider timeout/error, limiter outage and double submission.

For UI-heavy sites test all important routes at realistic viewports, plus keyboard, reduced-motion, no-WebGL and low-end mobile conditions.

## 3. Live owner tasks

Before launch, owners may need to:

- buy/verify the domain and set DNS records;
- choose apex vs `www` canonical host and test one-hop redirects;
- verify TLS certificate, renewal and SSL configuration;
- configure Vercel/hosting production environment variables;
- verify the sender domain, SPF, DKIM and DMARC for transactional email;
- provision a mailbox that can receive replies;
- configure a shared rate-limit store or edge WAF rule;
- decide whether Cloudflare is only DNS/WAF or the actual hosting edge;
- configure production monitoring, error alerts and uptime checks;
- verify Google Search Console and submit sitemap;
- confirm social profiles and public contact details;
- confirm legal entity and policy wording with counsel;
- ensure owner controls domain, GitHub, Vercel, Cloudflare and email accounts with MFA and least privilege.

Never ask the user to paste API keys into chat. Enter them into the provider's secret manager.

## 4. WAF and bot controls

The site owner must decide whether to use Vercel Firewall, Cloudflare WAF or another edge provider. Configure targeted rules for public API routes, not blanket challenges that block all bots or all non-browser clients. Keep search crawlers working and exclude static assets from inappropriate rate limits.

Before Cloudflare proxy activation in front of Vercel, test origin reachability/lockdown, redirects, TLS mode, cache exclusions, client IP propagation, form API behaviour, WebGL/image requests and rollback. Do not combine WAF changes and DNS cutover without a maintenance/verification plan.

## 5. Email verification

A browser “success” state does not prove an email reached the recipient's inbox. Test:

- actual production API key and verified sending domain;
- SPF/DKIM/DMARC alignment;
- recipient delivery and spam folder;
- reply-to and sender identity;
- provider accepted/rejected/bounced/suppressed outcomes;
- graceful error if secret is missing;
- no mock email success in production.

## 6. SEO launch

After the domain is live:

- verify canonical HTTPS host and redirect;
- fetch `/robots.txt` and `/sitemap.xml` publicly;
- confirm all sitemap URLs return expected status and canonical;
- verify Google Search Console by DNS and submit the sitemap;
- inspect the homepage and key legal/service URLs;
- verify OAI-SearchBot is not disallowed and network controls allow it if ChatGPT search eligibility is desired;
- check OG preview and social profile destinations.

Sitemap submission and crawler permission do not guarantee indexing or rankings.

## 7. Rollback and monitoring

- Record the known-good production deployment and source SHA.
- Confirm how to roll back in the host dashboard before release.
- Keep an owner for form/email delivery monitoring during the first launch window.
- Enable appropriate deployment/error/uptime alerts without collecting unnecessary personal data.
- Define who can pause the form or revert a broken release.
- Preserve logs only as long as needed and avoid PII in application logs.

## 8. Decision

- **GO:** all release-blocking code checks and owner/live checks are verified; rollback exists.
- **CONDITIONAL GO:** code is ready, only explicitly listed low-risk owner actions remain, and there is a safe workaround. State what is blocked and whether public launch should be limited.
- **NO-GO:** any P0/P1 failure, unavailable critical form/email, exposed secret, wrong domain/canonical, missing essential access control, broken security policy, or unknown owner of production infrastructure.

## Official sources

- Vercel production checklist: https://vercel.com/docs/production-checklist
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel Firewall: https://vercel.com/docs/vercel-firewall
- Google sitemap submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
