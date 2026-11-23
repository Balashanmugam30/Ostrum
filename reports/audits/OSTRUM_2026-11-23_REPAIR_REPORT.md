# OSTRUM mobile, performance and SEO repair report

**Date:** 2026-11-23
**Local production URL tested:** `http://localhost:3102`
**Public canonical URL:** `https://www.theostrum.tech/`

## Executive summary

The mobile “Capabilities” repetition/freezing reported in the recording was caused by a long, pinned, scroll-scrubbed desktop gallery being applied on narrow screens. The mobile route now uses a normal vertical flow with six static-art cards, while the desktop gallery code path remains. Mobile background artwork and the shared 3D model were also optimized, favicon/app icon backgrounds were made opaque, and the floating header now samples the underlying page section to select a readable text color.

The repair is locally buildable and passes the listed code checks and responsive browser run. **Performance is not fully solved:** local Lighthouse performance remained 43–44/100. The first-load JavaScript/main-thread work needs a separate targeted profiling pass. This report does not represent that score as a pass.

## User-reported issue and evidence

- In the supplied mobile recording, the final `06 / 06` Capabilities card stayed pinned/repeated during successive swipes; desktop did not show this failure.
- Source review confirmed the mobile viewport was entering the long desktop pin/scrub path. The new mobile path renders the gallery in ordinary document flow.
- The desktop recording showed the “What’s Next” Engine copy and scene. A fresh mobile browser capture also shows “02 / For What’s Next” and its explanatory copy; the complete-dark background transition remains in the cinematic energy narrative farther down the page.
- Local measurements found the desktop GLB contained about 1.16 million triangle indices/primitive work and transferred 2.87 MB. A mobile-specific simplified copy is now 684,848 bytes; the original desktop model remains unchanged.

## Code and asset changes

- `components/sections/OstrumCapabilitiesSection.tsx`: normal vertical six-card mobile layout, no mobile pin/scrub transition, static artwork instead of card WebGL. Desktop horizontal gallery path retained.
- `context/PreloaderContext.tsx`: below 768px, completes the full-screen intro immediately so mobile content is not hidden behind the long cinematic count. Desktop intro remains unchanged.
- `components/visuals/OstrumContinuousJourney.tsx`: chooses the simplified mobile model below 768px and retains original desktop GLB.
- `public/models/monyedre-360-mobile.glb`: mobile mesh simplification from 2.87 MB to 684,848 bytes (about 76% reduction). Derived from the licensed original; required attribution preserved.
- `public/images/bg-mobile.webp` plus `app/globals.css` and `components/canvas/BackgroundCaustics.tsx`: phone-specific image path is approximately 18.9 KB versus the original background image at about 1.0 MB; desktop image and WebGL background remain.
- `components/navigation/Header.tsx`: contrast sampling excludes the floating header itself and samples the page under it. Verified near-black text on Capabilities/FAQ and ivory on Engine/Contact.
- `public/favicon-*.png`, `public/icon-*.png`, `public/apple-touch-icon.png`, `public/manifest.webmanifest`: opaque burgundy backing for small icons; manifest supports maskable usage.
- `components/sections/OstrumStudioFooter.tsx`, `THIRD_PARTY_NOTICES.md`: visible and written CC BY 4.0 attribution for the 3D artwork.
- `app/sitemap.ts`: lastmod aligned to 2026-11-23 content updates.
- Skills and future-agent guidance: `.agents/skills/`, `.claude/skills/`, `skills-lock.json`, `AGENTS.md`, `DESIGN.md`, `.claude/CLAUDE.md`, `docs/OSTRUM_PROJECT_HANDOFF.md`, and the Claude master skills prompt.

The skill payloads are installed in the current working copy but are not committed: together they contain about 81 MB across roughly 4,000 upstream files. `.gitignore` excludes those vendor payloads while retaining the Skills CLI lockfile, local project instructions, and the Claude reinstall prompt. This keeps the app repository focused and makes future setup reproducible.

## Verification results

### User-reported live Lighthouse baseline

The user's Lighthouse 13.5 captures from Nov 23 reported mobile Performance 44 (FCP 1.6 s, LCP 4.4 s, TBT 10,920 ms, CLS 0, Speed Index 17.2 s, about 4,147 KiB total transfer) and desktop Performance 59 (FCP 0.5 s, LCP 1.0 s, TBT 4,210 ms, CLS 0, Speed Index 8.1 s, about 4,932 KiB total transfer). These are the user's observed live results, not a controlled before/after benchmark.

### Code gates

| Check | Result |
|---|---|
| `npm run lint` | PASS; no ESLint warnings/errors (Next prints that `next lint` is deprecated for Next 16; current Next 15 command works) |
| `npx tsc --noEmit` | PASS |
| `npm test` | PASS; 29 tests across 7 suites |
| `npm audit --omit=dev` | PASS; 0 production vulnerabilities reported |
| `npm run build` | PASS; 10 routes compiled |

### Playwright production browser

- All 13 supplied viewport sizes tested. Each had zero horizontal overflow, exactly one `#capabilities` section, and six cards.
- Mobile touch-oriented scroll sampling reached the document bottom/CTA/footer region. Capabilities count remained one and all six card labels were unique.
- Header contrast at section positions: ivory on Engine and Contact; near-black on Capabilities and FAQ.
- Browser `pageerror`: zero. Failed network requests: zero.
- Mobile screenshot capture confirmed two complete cards and aligned text in Capabilities, and showed Engine’s “For Business” and “For What’s Next” content with the central sculpture. The screenshots are in the local temp folder and are not source assets.

### Lighthouse 13.6.0 local production build

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index | Transfer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Before model simplification | 40 | 100 | 100 | 100 | 1.1 s | 6.1 s | 4,360 ms | 0 | 8.2 s | 3,224 KiB |
| After mobile model optimization | 44 | 100 | 100 | 100 | 1.2 s | 9.9 s | 3,640 ms | 0 | 3.5 s | 1,764 KiB |
| Fast mobile reveal audit | 43 | 100 | 100 | 100 | 1.0 s | 9.5 s | 4,030 ms | 0 | 4.0 s | 1,764 KiB |

Lighthouse selected the analytics consent description as LCP in one run; simulated CPU/main-thread timing varied between runs. The byte reduction is repeatable, but the overall score is still below a good target. Mobile-model transfer improved by about 45% in total page bytes; first-load JS is still the dominant open cost.

## SEO / analytics checks

- Local `/sitemap.xml`: HTTP 200, three URLs, all on `https://www.theostrum.tech/`, lastmod `2026-11-23`.
- Local `/robots.txt`: HTTP 200, sitemap directive present; `/api/` and `/preview/` disallowed.
- Rendered canonical: `https://www.theostrum.tech`.
- Rendered HTML contains Google site-verification metadata and Organization/WebSite JSON-LD.
- Consent-gated GA measurement is absent from initial HTML by design; the analytics script is only loaded after the visitor accepts analytics. Never bypass consent to inflate analytics checks.
- Google Search Console property and a successful three-URL sitemap submission were previously reported, with indexing still processing. The current Codex tool inventory has no Search Console connector, so that authenticated state was not rechecked during this run. Public sitemap availability does not guarantee indexing.
- Lighthouse SEO score 100 covers only its basic automated checks. It does not verify ranking for “Ostrum Tech,” Search Console indexing, analytics event receipt, or structured data with Google’s external rich-results validator.

## Agent skills and integration inventory

| Resource | Type | Status in this worktree |
|---|---|---|
| Addy Osmani Agent Skills | Agent skills | 26 source skills installed for Antigravity and Claude Code using the Skills CLI |
| UI/UX Pro Max | Agent skill/toolkit | Initialized for Antigravity and Claude Code using its CLI |
| Taste (`design-taste-frontend`) | Agent skill | Installed for both agent targets |
| Anthropic `frontend-design` | Agent skill | Installed in the Antigravity catalog; the Claude master prompt checks/installs it if missing |
| Vercel React skills | Agent skills | Four selected skills installed: React best practices, web design guidelines, view transitions, composition patterns |
| GSAP skills | Agent skills | Four selected skills installed: core, performance, React and ScrollTrigger |
| Stitch skills | Agent skills | Three installed; the requested `stitch::shadcn-ui` alias returned “no matching skill” and was skipped |
| `find-skills` | Agent skill | Installed from Vercel Labs |
| Cybersecurity skill pack | Agent skill | One defensive web-application vulnerability triage skill selected; broad offensive content was not installed |
| PDF starter-kit | Agent skills | `skill-creator`, `webapp-testing`, `universal-code-review` copied to project-local Antigravity and Claude catalogs |
| Playwright | npm dev dependency / browser testing | Already present; direct Playwright browser checks executed. This does not mean Playwright MCP is connected here. |
| Lighthouse | CLI | Invoked temporarily with `npx`; no runtime dependency or lockfile entry added |
| GSAP, Lenis, Three.js | Runtime libraries | Already used by the application; no new runtime package added |
| MCP servers | External tools | No MCP server/configuration was installed or modified by this repair. Vercel and GitHub connectors were used here. Chrome DevTools MCP, Playwright MCP and Vercel agent-browser were not available as direct tools in this Codex session. |
| Component registries | Registry config | No `components.json` existed at inspection; no registry was added or initialized |

The agent skill payloads remain installed locally in the worktree but excluded from Git (about 81 MB across roughly 4,000 files). The lockfile, project agent guidance, and Claude reinstall/setup prompt are committed so future clones can install intentionally.

## Safety and publishing status

No production form was submitted during testing. Environment secret values were not read or printed. The database is used for rate limiting, not form content storage. Resend domain verification confirms outbound sender authentication, not inbox receipt. Cloud environment values were not changed during this repair report. Git push/deployment outcome will be appended after release verification.

## Remaining work / limits

1. Profile JavaScript execution and the long initial main-thread tasks; the score is still weak despite payload reduction.
2. Re-run Lighthouse on the deployed URL after publication on stable hardware/network settings, several times, and compare median metrics.
3. Authenticated Google Search Console inspection and structured-data Rich Results validation are not available from this session; verify those separately when the Google account connector is available.
4. Confirm inbound `hello@theostrum.tech` delivery with a real mailbox test before setting `isMailboxVerified: true`.

## Release verification addendum — 2026-11-23

- Repair commit `26c65cea5c4f14419687f6a5d7fd1d87f3b35e97` is on `main`; GitHub CI Quality Gate completed successfully.
- Vercel production deployment `dpl_76P5HHccLpJc513nDLCsadwSYHS4` is `READY`, targets `main` at that exact commit, and is aliased to `www.theostrum.tech` and `theostrum.tech`.
- Production browser verification completed at `https://www.theostrum.tech/` for 13 viewport sizes (320×568 through 1648×928): 0 horizontal overflow at every size; exactly one Capabilities section and six cards at each size. A mobile scroll reached the bottom with six unique project card labels. Header contrast switched to dark text over light sections and ivory text over dark sections. No browser console errors.
- The rapid-scroll browser run recorded three lazy-loaded project images as `net::ERR_ABORTED` while moving between sections. These are browser navigation/scroll aborts in the test, not uncaught page errors; do not treat this as proof of a clean zero-failed-request run. Recheck image delivery under a controlled scroll if investigating further.
- Public production checks: homepage HTTP 200 with canonical `https://www.theostrum.tech/`, Google site-verification metadata and Organization/WebSite structured data; `/sitemap.xml` HTTP 200 with three canonical `.tech` URLs; `/robots.txt` HTTP 200 with the sitemap URL; apex `https://theostrum.tech/` redirects with HTTP 308 to the `www` canonical.
- Lighthouse remains the main unresolved quality gap. The recorded local mobile/desktop runs scored in the low 40s and desktop ~59, driven mostly by long JavaScript/main-thread work. Changes reduced the mobile model/background asset weight and improved mobile layout, but do not claim a performance score target has been met. Run repeated Lighthouse tests on the live URL under fixed settings before calling performance resolved.
- Google Search Console property and sitemap submission were previously reported as configured, but authenticated Search Console state and indexing are not available to verify with the current connector set. Public sitemap availability does not prove indexing or ranking.
- Analytics remains consent-gated; do not bypass consent to send telemetry. Verify GA4 events after an explicit consent acceptance in a real browser/account.
- The enquiry database is used for rate limiting only; the form payload is not stored in Redis. No production enquiry was sent during browser testing. Resend verifies outbound sender authentication, not inbound Zoho mailbox delivery; keep `isMailboxVerified` false until a real inbox receipt is confirmed.
- No environment secret values were read or printed. No DNS changes were made during this release verification.

## Mobile interaction and branding follow-up — 2026-11-23

### Changes

- Removed the visible Print3dburton / CC BY 4.0 credit from the footer. Retained required asset attribution in `THIRD_PARTY_NOTICES.md`.
- Restored the existing transparent `/favicon-light.png` and `/favicon-dark.png` assets with `prefers-color-scheme` media rules. Kept the existing `.ico`, size-specific icons, Apple touch icon, and PWA icons intact.
- Added a mobile-only scroll-linked background fallback: the optimized background artwork moves on a compositor transform while scrolling and transitions to the dark burgundy/obsidian treatment through the energy narrative. Desktop continues using the existing WebGL shader.
- Disabled Lenis smooth scrolling for coarse/touch devices so native touch momentum does not compete with pinned GSAP sections.
- Changed the homepage CTA/footer transition on phones to normal document flow with a small reversible footer reveal, avoiding a mobile pin spacer. Desktop retains the pinned curtain animation. Legal-page curtain behavior remains pinned.
- Restyled analytics consent in the site's charcoal, ivory, and restrained coral palette with smaller type and touch-sized buttons.

### Verification

- `npm run lint`: passed (Next.js reports that `next lint` is deprecated for a future major version).
- `npx tsc --noEmit`: passed.
- `npm test`: 29/29 passed across 7 suites.
- `npm run build`: passed; all 10 routes generated.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Playwright production build at 13 viewports (320×568 through 1648×928): zero horizontal overflow at every viewport; one Capabilities section and six cards.
- Mobile rapid-scroll stress: eight alternating hero-to-footer and footer-to-hero cycles completed; page returned to top and bottom; background offset reset to `0px` and darkening reset to `0.000` at the top; exactly one footer and CTA; no page errors, console errors, or failed requests.
- Mobile footer was in normal flow (no pin spacer) and visible at the bottom. The consent banner at 390px viewport width measured 366×170px with no horizontal overflow.
- Desktop browser check at 1440×900: one WebGL background canvas, no page errors, and the footer curtain ScrollTrigger remained active and pinned during its reveal.
- Browser metadata links select `/favicon-light.png` for light system appearance and `/favicon-dark.png` for dark appearance. Both source assets are 32×32 PNGs with alpha transparency.
- The original artwork attribution remains in the third-party notices as required by its CC BY 4.0 license.

This follow-up has been verified locally and is deployed to production; the live deployment evidence is recorded below.

### Production verification — 2026-11-23

- Commit `46e8e96c2dec17b2ad3fc9488fc195096721f281` deployed as Vercel production deployment `dpl_FAD2yeQaZdhcGg5RBQ4L3vqCZCEt` with state `READY` and aliases `www.theostrum.tech` and `theostrum.tech`.
- Re-ran Playwright on the live site: mobile eight-cycle hero/footer scroll stress completed; no page errors or console errors; the mobile page reached its footer; background movement and darkening reset correctly at top.
- Live desktop browser check confirmed one WebGL background canvas, desktop CTA/footer ScrollTrigger pinned at progress 0.22, the restored light/dark favicon metadata links, and no page errors.
- Production browser checks were performed after publication; no production form submission or analytics consent acceptance was made.
