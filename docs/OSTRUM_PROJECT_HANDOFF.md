# Ostrum project handoff

**Updated:** 2026-11-24
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
- `components/sections/OstrumCapabilitiesSection.tsx` keeps desktop’s animated horizontal gallery and uses a six-card vertical list on mobile. Mobile mounts real Three.js artwork as each art frame approaches the viewport and falls back to optimized images offscreen, limiting concurrent mobile canvases; the cards reveal with IntersectionObserver and honor reduced motion.
- `components/visuals/OstrumContinuousJourney.tsx` and `components/sections/OstrumEngineSection.tsx` contain the Three.js visuals; GSAP/ScrollTrigger owns the pinned storytelling; Lenis is synchronized with the GSAP ticker in `components/providers/SmoothScroll.tsx`.
- Mobile uses `public/images/bg-mobile.webp` and `public/models/monyedre-360-mobile.glb`; desktop retains the full background and original full-detail model.
- The contact endpoint validates/sanitizes fields, applies a distributed rate limiter, and sends a Resend notification. Form contents are sent by email and are not stored in Redis. Redis stores rate-limit counters/expiry only.

## Current visual/product decisions

- Desktop cinematic/pinned layout remains the design reference.
- Mobile prioritizes normal vertical scrolling, readable alignment and one-pass content. Do not reintroduce a pinned horizontal Capabilities loop on phones.
- The intro cinematic remains on larger screens. On viewports below 768px it fast-reveals the content to avoid hiding the page behind a long 3D count.
- Header text is ivory on dark areas and near-black on light sections.
- Browser favicons use the existing transparent light/dark assets selected by system color scheme; Apple touch and PWA icons keep their platform-specific artwork.
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

The mobile layout/repetition defect is fixed and the mobile payload was reduced substantially, but Lighthouse performance remains weak in the local production audit. The 2026-11-23 local runs scored 43–44/100 performance (Accessibility, Best Practices and basic SEO each scored 100). The largest remaining costs are first-load JavaScript execution and a long main-thread block. In one audit Lighthouse selected the analytics-consent description as the LCP element, making LCP noisy; do not compare one run’s score as a stable benchmark. A follow-up also fixed mobile Capabilities reveal/artwork and touch-scroll handoff; the new release has not yet been measured with Lighthouse. Keep performance as an open workstream and profile JavaScript/3D startup before broad visual rewrites.

## Latest mobile-only follow-up (2026-11-23)

- Scope: mobile scrolling/reflow, mobile CTA-to-footer reveal, mobile testimonial sizing, and mobile Selected Work text placement. Desktop breakpoint behavior was explicitly checked and preserved.
- `app/globals.css` keeps `#capabilities` and the CTA/footer wrapper in normal phone document flow and applies `overscroll-behavior-y: none` below 768px. This prevents a stale pinned section from visually reappearing beyond the footer.
- Mobile footer reveal travels up to 38vh (capped at 320px) with scroll-linked opacity; the desktop pinned curtain is unchanged.
- Mobile testimonial cards use a 260px stack, maximum 360px width, tighter padding, and 14px quotes. The desktop card stack remains 345px.
- Mobile Selected Work descriptions begin at 60% of the stage; desktop remains at 50% (`sm:top-1/2`).
- Local production-build checks passed: lint, typecheck, 29 tests, production dependency audit, build, all 13 responsive sizes, capability reveal/3D, footer scrub, and mobile scroll cycles. The latest reverse-scroll follow-up is recorded below.
- The 13-size test includes desktop widths as regression checks; all had zero horizontal overflow. A Playwright desktop check confirmed the pinned desktop footer and unchanged desktop testimonial stack.
- No physical Android browser, new Lighthouse run, or blank-page reproduction was available during this follow-up.

### Production release evidence

Commit `76c2a99c68fa0d1fb6c404680d81bf7690df5d87` is deployed as Vercel production deployment `dpl_6sxvucVWrXm36Hokp4PrdnFwfyJ9` (`READY`) with `www.theostrum.tech` and `theostrum.tech` aliases. Live mobile Playwright tests passed the 13 viewport sizes, repeated scroll stress, capability reveal/3D, and footer reveal. Live desktop regression confirms 345px testimonial stack and the pinned desktop curtain. See `reports/audits/OSTRUM_2026-11-23_REPAIR_REPORT.md` for exact metrics and limitations.

## Latest mobile touch and reverse-scroll follow-up (2026-11-23)

- `components/providers/SmoothScroll.tsx` normalizes GSAP ScrollTrigger scroll only on coarse-pointer phones; Lenis remains disabled for touch, and desktop smooth scrolling is unchanged.
- `components/sections/OstrumFaqSection.tsx` ignores hover-preview events from touch devices so a tap expands the FAQ instead of being toggled closed by the synthetic enter event.
- `components/sections/OstrumFooterReveal.tsx` gives the mobile CTA/footer stage a visible scroll-linked reveal (up to 38vh, capped at 320px). The desktop pinned curtain remains unchanged.
- `components/ui/liquid-sculpture-hero.tsx` forwards touch pointer-move events to the particle canvas even when the browser reports zero pressure/buttons.
- Local Playwright passed: lint, typecheck, 29 tests, production build; FAQ touch expansion; CTA canvas touch movement; mobile reveal progress 0/0.5/1; desktop 1440px regression (345px testimonial stack and pinned curtain).
- Full reverse touch scroll started at the settled footer and reached the hero in 23 swipes, with monotonic scroll, stable 21,418px document height, one Capabilities section, one footer, and no page/request errors.
- The supplied white blank-screen image was not reproduced in browser emulation. A physical Android run is still needed to confirm behavior on the exact device/browser. No new Lighthouse run was taken; mobile performance remains an open follow-up.
- See `reports/audits/OSTRUM_2026-11-23_REPAIR_REPORT.md` for measurements and the release record.

### Latest production release

- Mobile source commit `1c07dbfc4f6580c1db793a7582aecde975ccecb3` is deployed on Vercel as `dpl_Fv7417qiwRLhL8daYuwncde3sHkz` (`READY`) with `www.theostrum.tech` and `theostrum.tech` aliases.
- Live mobile Playwright smoke confirms HTTP 200, hydrated sections, one Capabilities section/footer, and touch FAQ expansion. The complete reverse-scroll stress and CTA particle/reveal measurements passed on the local production build; the extended combined live WebGL/scroll run exceeded its test window and is not reported as passed.
- The exact blank-screen screenshot was not reproduced; a physical Android device check and new Lighthouse measurement remain outstanding.

## Mobile scroll-effect parity follow-up (2026-11-24)

- The supplied desktop/mobile recordings were compared at the desktop beats around 00:04 (sculpture spin and dark stage), 00:11 (Selected Work wheel expanding into Capabilities), and 00:21 (CTA curtain lifting into the footer). The mobile capture also showed the sculpture missing after fast reverse scroll.
- Root causes: the mobile Capabilities handler skipped the shared wheel-to-section transition; mobile CSS forced the transition container back into normal flow; the phone CTA used a simple footer fade instead of the existing curtain; the mobile dark overlay remained a red radial gradient; and the hero letter parallax could retain a large stale offset after a fast touch fling while the 3D canvas was paused offscreen.
- `components/sections/OstrumCapabilitiesSection.tsx` now allows the existing wheel shared-element expansion on phones and releases it at full size, then returns to the six-card vertical list. `app/globals.css` scopes the normal-flow override so it does not suppress the temporary reveal.
- `components/sections/OstrumFooterReveal.tsx` now uses the existing CTA curtain on phones in a scroll-scrubbed lift interval without pinning the wrapper. Reverse scrolling restores it; the desktop pinned curtain path is unchanged.
- The phone background darkening layer now reaches solid `#050505` at full opacity.
- `components/ui/OstrumLogo.tsx` samples live mobile scroll position, uses time-based smoothing while moving, and clears letter parallax at the top. `components/visuals/OstrumContinuousJourney.tsx` invalidates the paused mobile pose and snaps the model back into the hero O at the top; scroll-driven motion resumes after leaving the hero. The desktop parallax and sculpture interpolation remain unchanged.
- Optimized local production build checks passed: lint, TypeScript, all 29 unit tests, `npm audit` (0 vulnerabilities), and Next.js build.
- Playwright production browser matrix: the 13 documented viewport sizes had zero horizontal overflow, exactly one Capabilities section and six cards, with zero page errors or failed requests.
- Touch emulation on the production build completed 36 upward swipes from the footer to the hero and 36 downward swipes back to the footer. At the hero the model was visible, rotation was `0`, the O letter transform was `translate3d(0px, 0px, 0px)`, and the page retained one Capabilities section/six cards/footer. No page errors or failed requests were observed.
- The mobile wheel reveal was observed at normalized transition progress `0.580` with the temporary container fixed, then released to normal flow at completion. The CTA curtain had a mobile, unpinned ScrollTrigger and lifted about 375px at midpoint on a 390×844 viewport. Full mobile darkening was `#050505` at opacity `1`.
- Desktop regression at 1440×900 retained the sticky Capabilities stage and the pinned `theatre-curtain-reveal-cta` trigger. The desktop curtain was translated about 429px at midpoint. No desktop overflow or browser errors were observed.
- Evidence and commands are in `reports/audits/OSTRUM_MOBILE_SCROLL_EFFECT_PARITY_2026-11-24.md`. The supplied exact blank-page screenshot was not reproduced, and no physical Android device or new Lighthouse run was available in this pass. The previously measured low Lighthouse performance remains a separate open performance task.
