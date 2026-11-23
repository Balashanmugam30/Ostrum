# Ostrum project handoff

**Updated:** 2026-11-23
**Purpose:** Durable starting point for future engineers and coding agents.

## Product and production identity

- Public site: [https://www.theostrum.tech/](https://www.theostrum.tech/)
- Canonical host: `https://www.theostrum.tech/`; apex `theostrum.tech` redirects to `www`.
- Contact inbox: `hello@theostrum.tech`.
- Primary source: GitHub `Balashanmugam30/Ostrum`, branch `main`.
- Hosting: Vercel project `ostrum`.
- Resend authenticates outbound mail for `theostrum.tech`. This does not prove that inbound mail to `hello@theostrum.tech` is working; the mailbox is Zoho-hosted and must be tested as inbound mail before `isMailboxVerified` can be true.

## Technical architecture

- Next.js 15 App Router / React 19 / TypeScript / Tailwind CSS.
- Routes include `/`, `/fr`, `/terms-and-conditions`, `/privacy-policy`, `/api/enquiry`, `/sitemap.xml`, and `/robots.txt`.
- `app/layout.tsx` provides root metadata, canonical URL, Organization/WebSite JSON-LD, Google site-verification metadata, consent analytics and global visuals.
- `lib/site-config.ts` owns base URL, contact email and brand links.
- `app/sitemap.ts` emits the home page and two legal routes. `app/robots.ts` allows public indexing, disallows API/preview paths and references the sitemap.
- `components/sections/OstrumCapabilitiesSection.tsx` keeps desktop’s animated horizontal gallery and uses a six-card vertical list on mobile. Mobile cards use static optimized artwork instead of six WebGL accents.
- `components/visuals/OstrumContinuousJourney.tsx` and `components/sections/OstrumEngineSection.tsx` contain the Three.js visuals; GSAP/ScrollTrigger owns the pinned storytelling; Lenis is synchronized with the GSAP ticker in `components/providers/SmoothScroll.tsx`.
- Mobile uses `public/images/bg-mobile.webp` and `public/models/monyedre-360-mobile.glb`; desktop retains the full background and original full-detail model.
- The contact endpoint validates/sanitizes fields, applies a distributed rate limiter, and sends a Resend notification. Form contents are sent by email and are not stored in Redis. Redis stores rate-limit counters/expiry only.

## Current visual/product decisions

- Desktop cinematic/pinned layout remains the design reference.
- Mobile prioritizes normal vertical scrolling, readable alignment and one-pass content. Do not reintroduce a pinned horizontal Capabilities loop on phones.
- The intro cinematic remains on larger screens. On viewports below 768px it fast-reveals the content to avoid hiding the page behind a long 3D count.
- Header text is ivory on dark areas and near-black on light sections.
- Favicon and app icons use an opaque burgundy background so the mark remains visible on mobile launchers and browser chrome.
- Third-party model credit: Print3dburton / Monyédre 360 Möbius Art Ribbon, CC BY 4.0; see `THIRD_PARTY_NOTICES.md` and `docs/OSTRUM_THIRD_PARTY_ASSETS.md`.

## Cloud/service state last verified

- Vercel project domains include `theostrum.tech` redirecting to `www.theostrum.tech` and `www.theostrum.tech` as the production canonical host.
- `NEXT_PUBLIC_BASE_URL`, `OSTRUM_ENQUIRY_TO` and `OSTRUM_ENQUIRY_FROM` point to the `.tech` domain/inbox. `RESEND_API_KEY` and `ENQUIRY_SALT` were present; secret values were not read or printed.
- Upstash database `ostrum-redis` is active and connected to the `ostrum` project for Production, Preview and Development without a custom variable prefix. Its injected variable names include `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which the rate limiter accepts as fallbacks. The old `upstash-kv-indigo-drawer` instance was archived/uninstalled; do not reconnect it.
- Redis is required for production rate limiting because the endpoint fails closed when unavailable. Verify connectivity without logging or returning credentials.
- Resend domain status was reported verified and sending enabled. DNS is hosted at the registrar shown in the domain account; do not assume a different provider.
- Google Analytics is wired through the consent-gated `AnalyticsConsent` component with the existing GA4 measurement ID. It should not load until consent. A Lighthouse run before the current repair showed only the basic SEO score, which does not establish that GA reports are receiving traffic.
- Google Search Console property `https://www.theostrum.tech/` and sitemap submission were previously reported as present/successful with three discovered URLs; indexing was still processing. Re-check the authenticated Search Console view before claiming indexed pages. This Codex environment has no Search Console connector.

## Agent resources and tool boundaries

- Start with `AGENTS.md` and `DESIGN.md`.
- Antigravity-compatible skills are installed in this worktree under `.agents/skills/`; Claude-compatible skills are installed under `.claude/skills/`. Their downloaded upstream payloads remain local and are excluded from Git to avoid vendoring roughly 81 MB of third-party skill material. `skills-lock.json` records 42 entries for reproducible discovery; other pre-existing/project-specific skills may not be in that lock file. After a fresh clone, use the master prompt and lockfile to install the desired skills locally.
- `.claude/CLAUDE.md` is the Claude Code project entrypoint. The future installation prompt is `docs/OSTRUM_CLAUDE_CODE_SKILLS_MASTER_PROMPT.md`.
- Current app runtime libraries are visible in `package.json`: `gsap`, `lenis`, `three`, `lucide-react`, Next, React and Resend. No new runtime npm dependency was added by the 2026-11-23 repair.
- Current environment verified local Playwright via the project npm dependency and Lighthouse CLI via `npx`; 13 viewport/scroll checks and Lighthouse runs were executed. Chrome DevTools MCP and Vercel `agent-browser` were not exposed as tools in this Codex session. A locally installed test package does not imply its MCP server is connected.
- The Antigravity MCP list was reported in an earlier Antigravity run; it was not independently re-discovered here. Do not label a remote MCP connected based on an old report.

## Development and verification

```powershell
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm audit
npm run build
npm start
```

Responsive regression sizes used on the repair: `320×568`, `360×640`, `375×667`, `390×844`, `393×852`, `414×896`, `428×926`, `768×1024`, `820×1180`, `1024×768`, `1280×800`, `1440×900`, `1648×928`.

## Known limitation to carry forward

The mobile layout/repetition defect is fixed and the mobile payload was reduced substantially, but Lighthouse performance remains weak in the local production audit. The 2026-11-23 local runs scored 43–44/100 performance (Accessibility, Best Practices and basic SEO each scored 100). The largest remaining costs are first-load JavaScript execution and a long main-thread block. In one audit Lighthouse selected the analytics-consent description as the LCP element, making LCP noisy; do not compare one run’s score as a stable benchmark. Keep performance as an open workstream and profile JavaScript/3D startup before broad visual rewrites.
