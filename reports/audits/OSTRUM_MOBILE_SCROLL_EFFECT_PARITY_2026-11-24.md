# OSTRUM Mobile Scroll Effect Parity Audit

**Date:** 2026-11-24  
**Scope:** Mobile scroll effects and reverse-scroll recovery, with desktop regression checks.  
**Source recordings:** the supplied 2026-11-23 Chrome desktop capture and WhatsApp mobile capture.  
**Production deployment:** Confirm the deployment for the publishing commit in Vercel; this report records local production-build verification.

## Recording comparison

The desktop recording was inspected at the beats the user identified:

- **00:04:** the central 3D sculpture spins into the darkened scene.
- **00:11:** the Selected Work wheel resolves into a full-size Capabilities section.
- **00:21:** the CTA curtain lifts to reveal the footer.

The mobile recording showed the same page sections without those effects, and the hero sculpture could remain missing after returning from the footer. The issue was scroll state, not a missing 3D asset: the phone hero letters retained a large parallax transform after fast reverse scrolling while the mobile 3D canvas was paused outside its storytelling range.

## Changes

- **Hero return:** `components/ui/OstrumLogo.tsx` samples the live mobile scroll offset, uses time-based smoothing while the page moves, and resets the per-letter parallax at the top. `components/visuals/OstrumContinuousJourney.tsx` invalidates a paused mobile pose and snaps the sculpture to its hero target at the top. Mobile scroll-linked animation resumes away from the top. Desktop interpolation and logo smoothing are unchanged.
- **Capabilities handoff:** `components/sections/OstrumCapabilitiesSection.tsx` now runs the existing shared-element reveal from the wheel on mobile. `app/globals.css` allows the temporary transition overlay, then the code releases it at full size so the six capability cards remain a normal vertical list.
- **CTA/footer:** `components/sections/OstrumFooterReveal.tsx` uses the existing CTA curtain on mobile and scrubs it upward through the CTA-to-footer interval without pinning the wrapper. Reverse scrolling restores the curtain. The desktop pinned transition is unchanged.
- **Dark scene:** the mobile darkening overlay now resolves to solid `#050505` at full opacity, matching the desktop black stage.

## Verification

### Local production build and quality gates

| Check | Result |
|---|---|
| `npm run lint` | Pass, no warnings or errors |
| `npm run typecheck` | Pass |
| `npm test` | Pass, 29/29 tests across 7 suites |
| `npm audit` | Pass, 0 vulnerabilities reported |
| `npm run build` | Pass, Next.js 15.5.29; all 10 routes generated |

### Playwright production build

The viewport matrix passed with no horizontal overflow, one Capabilities section, six cards, zero page errors and zero failed requests at every size:

`320×568`, `360×640`, `375×667`, `390×844`, `393×852`, `414×896`, `428×926`, `768×1024`, `820×1180`, `1024×768`, `1280×800`, `1440×900`, and `1648×928`.

Mobile checks on the production build:

- Four rapid full-page bottom-to-top cycles returned to `scrollY = 0`; the sculpture was visible with rotation `0`, and the O letter transform was reset to `translate3d(0px, 0px, 0px)`.
- Touch-emulated scroll completed 36 upward swipes from the footer to the hero and 36 downward swipes back to the footer. Final points were the page top and bottom; the page retained one Capabilities section, six cards, and one footer, with no page errors or failed requests.
- The wheel handoff displayed its temporary fixed container at transition progress `0.580`; completion returned the section to normal vertical flow. After handoff, the first two visible capability cards each mounted their live 3D canvas; the four offscreen cards retained optimized image fallbacks until approaching the viewport. All six cards remained in the vertical list.
- The mobile CTA uses `mobile-curtain-reveal-cta`, with no pinned wrapper. At the midpoint of a 390×844 viewport, the curtain was translated approximately `-375px`.
- At full darkening, the mobile overlay computed to `rgb(5, 5, 5)` with opacity `1`.

Desktop regression at 1440×900 confirmed the Capabilities stage remains sticky and the existing CTA curtain trigger remains pinned. Its midpoint translation was approximately `-429px`; there were no browser errors or horizontal overflow.

The Playwright runner used the project-installed package with headless Chromium against the local `next start` production server. The Codex session did not expose Playwright MCP, Chrome DevTools MCP or Vercel agent-browser tools; no MCP-only verification is claimed. Temporary scripts and screenshots are in ignored `scratch/video_compare/` and are not project source.

## Live production verification and service audit (2026-11-24)

### Production deployment
- **Vercel deployment ID:** `dpl_6EGmrg8q684Mt5bm3haFbF965JMu`
- **State:** `READY` (Promoted to Production)
- **Git Commit:** `4e912f9ef0c8b45eb0bb8ea8c5121f2f1d4c9ede`
- **Aliases:** `www.theostrum.tech`, `theostrum.tech`, `ostrum-delta.vercel.app`
- **Public URL:** `https://www.theostrum.tech/`

### Live browser and scroll parity verification
Audited directly against `https://www.theostrum.tech/` via Playwright Chromium automation:
- **Mobile Hero Return (390×844):** Initial load mounts central 3D canvas with sculpture in the O. After fast bottom-to-top reverse scroll (scrollY: 0), the model is visible, rotation is 0, and hero letter transform is reset (`translate3d(0px, 0px, 0px)`).
- **Mobile Capabilities Handoff:** Wheel shared-element expansion resolves cleanly without trapped horizontal scrubbing; section releases into exactly one `#capabilities` section with 6 vertical cards. The 2 visible cards mount active 3D canvases while 4 offscreen cards retain optimized image fallbacks until entering the viewport.
- **Mobile Dark Stage:** Darkening overlay computes to solid `#050505` (`rgb(5, 5, 5)`) at full opacity (`--bg-darken: 1.000`), matching desktop black stage parity.
- **Mobile CTA Curtain:** Uses `mobile-curtain-reveal-cta` with pinned wrapper (`start: 'top top'`) and elevated stacking context (`relative z-30`). The CTA section enters in normal document flow, remains fully visible without sliding beneath the contact form (`#faq-contact-field` z-20), pins at `top top`, and the curtain translates cleanly over 100svh (`-844px` on iPhone) into the footer.
- **Scroll Stress Test:** 3 rapid footer-to-hero cycles completed with 0 blank white screens, 0 duplicated sections, 0 overflow, 0 console errors, and 0 failed requests.

### Mobile Defect Resolution Audit (Follow-up)

#### 1. Issue 1 — CTA Stacking & Reveal Timing
- **Root Cause Diagnosed:**
  1. `#faq-contact-field` in `app/page.tsx` was configured with `relative z-20`, establishing an isolated stacking context.
  2. `#theatre-stage-wrapper` in `components/sections/OstrumFooterReveal.tsx` lacked an explicit z-index (`z-index: auto`), causing all positioned descendants (including `.theatre-curtain` at `z-20`) to paint beneath `#faq-contact-field`.
  3. The mobile ScrollTrigger started prematurely at `start: 'top bottom'`, translating the curtain upward (`y: -getLiftDistance()`) while the wrapper was still entering the viewport, physically sliding ~250px of the CTA behind the contact form.
- **Remediation:**
  1. Added `relative z-30` to `#theatre-stage-wrapper` and its reduced-motion container, giving it strict stacking precedence over `#faq-contact-field`.
  2. Aligned the mobile trigger to `start: 'top top'` with `pin: container` and `pinSpacing: true`. The CTA now enters the screen completely undisturbed in normal document flow. Once it settles at full viewport height (`top top`), the wrapper pins and the curtain lifts cleanly upward over 100svh to reveal `OstrumStudioFooter`.
- **Verification Across Viewports:**
  - `320×568` (iPhone SE): Crossing transform `matrix(1, 0, 0, 1, 0, 0)`; midpoint `-278.659px`; footer pointer-events `none`. Pass.
  - `360×640` (Android Small): Crossing transform `matrix(1, 0, 0, 1, 0, 0)`; midpoint `-314.17px`; footer pointer-events `none`. Pass.
  - `390×844` (iPhone 12/13/14): Crossing transform `matrix(1, 0, 0, 1, 0, 0)`; midpoint `-414.555px`; footer pointer-events `none`. Pass.
  - `428×926` (iPhone Pro Max): Crossing transform `matrix(1, 0, 0, 1, 0, 0)`; midpoint `-454.699px`; footer pointer-events `none`. Pass.

#### 2. Issue 2 — Hero 3D Sculpture Reverse Scroll Lifecycle
- **3D Asset & Loader Path Confirmed:**
  - Mobile Asset: `/models/monyedre-360-mobile.glb` (`public/models/monyedre-360-mobile.glb`, 684,848 bytes).
  - Desktop Asset: `/models/monyedre-360.glb` (`public/models/monyedre-360.glb`, 2,872,140 bytes).
  - Loader: `THREE.GLTFLoader` in `components/visuals/OstrumContinuousJourney.tsx` line 334.
- **Root Cause Diagnosed:**
  1. When scrolling past `exitBoundary`, the mobile canvas paused (`container.style.opacity = '0'` and `cancelAnimationFrame(animId)`).
  2. The wake listener (`syncAnimation`) was only registered on `window.onscroll` and `ScrollTrigger.refresh`. On touch devices where momentum flings or `normalizeScroll` suppress or coalesce native scroll events, reverse fling momentum could stop at the top without triggering `syncAnimation`, leaving the canvas paused at `opacity: 0`.
  3. The snap reset threshold was overly strict (`scrollY <= 12`), missing cases where reverse scrolling stopped within the hero rest zone (`scrollY <= 30`), while `OstrumLogo`'s reset was set to `<= 2`.
- **Remediation:**
  1. Expanded wake listeners in `components/visuals/OstrumContinuousJourney.tsx` to include `scrollend`, `ScrollTrigger.scrollStart`, `ScrollTrigger.scrollEnd`, `ScrollTrigger.refresh`, and `document.visibilitychange`.
  2. In `syncAnimation`, ensured `container.style.opacity = '1'` and restarted `animId = requestAnimationFrame(animate)` whenever `scrollY <= exitBoundary`.
  3. Expanded hero reset zone to `scrollY <= 30` (matching `IntroHero` `isScrolled` threshold) to lock the sculpture precisely into the O counter with 0 rotation and proper scale, and updated `OstrumLogo` reset to `targetScrollY <= 8`.
- **Verification Across 3 Reverse Scroll Cycles (390×844):**
  - Initial load: Canvas mounted, opacity `1`, sculpture visible, rotation `0`, scale `0.057158`.
  - Cycle 1 (return from 20574 to 0): Opacity `1`, visible `true`, rotation `0`, screen position `(56.76, 325.02)` centered in O. Pass.
  - Cycle 2 (return from 20574 to 0): Opacity `1`, visible `true`, rotation `0`, screen position `(56.76, 325.84)` centered in O. Pass.
  - Cycle 3 (return from 20574 to 0): Opacity `1`, visible `true`, rotation `0`, screen position `(56.76, 325.08)` centered in O. Pass.
  - Re-scroll downward to 600: Rotation resumed smoothly to `3.550 rad`, scale `0.265`. Pass.

#### 3. Desktop Regression Verification (1440×900)
- Desktop Hero Canvas: Present and responsive.
- Capabilities Stage: Pinned horizontal showcase operating normally.
- Desktop CTA Curtain: Pinned at `start: 'top top'`, translates `-450px` at midpoint. Pass.
- Errors: 0 console errors, 0 failed requests. Pass.
- **Desktop Regression (1440×900):** Capabilities stage remains sticky; CTA curtain trigger remains pinned (`matrix(1, 0, 0, 1, 0, -900)`); 0 horizontal overflow, 0 console errors, 0 failed requests.
- **Viewport Matrix (0px Overflow):** Verified passing across `320×568`, `360×640`, `375×667`, `390×844`, `768×1024`, and `1440×900`.

### Live sitemap, robots, metadata and structured data
- **Sitemap (`/sitemap.xml`):** HTTP 200 OK (`application/xml`). Contains 3 canonical URLs: `https://www.theostrum.tech/` (priority 1.0), `https://www.theostrum.tech/terms-and-conditions` (0.5), `https://www.theostrum.tech/privacy-policy` (0.5).
- **Robots (`/robots.txt`):** HTTP 200 OK (`text/plain`). Allows public indexing, allows AI search engine crawlers (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`), blocks bulk scraping bots (`GPTBot`, `Bytespider`), points to canonical sitemap.
- **Canonical & Open Graph:** Canonical tag points to `https://www.theostrum.tech`. Full Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:locale en_IN`) present.
- **JSON-LD Structured Data:** 2 valid schema blocks verified:
  1. `Organization` and `WebSite` (`@graph` format) specifying Ostrum Tech branding, contact email, and social profiles.
  2. `FAQPage` containing all 10 FAQ question-and-answer pairs.
- **Google Verification:** `<meta name="google-site-verification" content="Cto_uunwjqVSnOUCc6aGf9kRAM3GH8r2BwAQO_MPpWA" />` verified live. (Google Search Console API was not directly queried as no Search Console connector is provisioned in the agent environment).

### Live analytics consent and data flow
- **Default State:** In a clean browser session with no stored consent, zero Google Analytics or GTM network requests occur.
- **Consent Banner:** Appears correctly on mobile and desktop (`aria-label="Analytics cookie preferences"`).
- **Reject Analytics:** Clicking "Reject analytics" stores `'rejected'` in localStorage, dismisses the banner, and sends 0 GA requests.
- **Accept Analytics:** Clicking "Accept analytics" stores `'accepted'` in localStorage, immediately triggers script `https://www.googletagmanager.com/gtag/js?id=G-Z8VEVVW4GY`, and updates consent mode (`analytics_storage: 'granted'`).
- **Privacy Signals:** Respects `globalPrivacyControl` and `doNotTrack` by automatically setting consent to `'rejected'`.

### Launch services and rate limiting
- **Upstash Redis:** Replacement database `ostrum-redis` (`store_VJSmeeRXdCRIGkXE`) is connected to project `ostrum` across Production, Preview, and Development on the $0 Free plan. Safe REST ping executed against the active endpoint: HTTP 200 `{"result":"PONG"}`. Distributed rate limiter prerequisites are fully satisfied.
- **Resend Outbound Mail:** Domain `theostrum.tech` is verified and sending is enabled. All 4 DNS records (DKIM TXT, send MX, send TXT, rsend CNAME) verified.
- **Vercel Environment Variables:** Verified presence of `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `ENQUIRY_SALT`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL` (`https://www.theostrum.tech`), `OSTRUM_ENQUIRY_TO` (`hello@theostrum.tech`), and `OSTRUM_ENQUIRY_FROM` (`notifications@theostrum.tech`). Zero secret values exposed.

### Fresh live Lighthouse audit (2026-11-24)
Conducted with Lighthouse 13.6.0 in headless Chromium against `https://www.theostrum.tech/`:

| Metric / Setting | Mobile Audit | Desktop Audit |
| :--- | :---: | :---: |
| **Fetch Timestamp** | 2026-11-23 19:08:45 UTC | 2026-11-23 19:09:33 UTC |
| **Device Preset** | Simulated mobile (150ms RTT, 1.6 Mbps, 4x CPU slowdown) | Desktop (40ms RTT, 10 Mbps, 1x CPU) |
| **Performance** | **44** | **47** |
| **Accessibility** | **100** | **100** |
| **Best Practices** | **100** | **100** |
| **SEO** | **100** | **100** |
| **First Contentful Paint (FCP)** | 1.1 s | 0.5 s |
| **Largest Contentful Paint (LCP)** | 5.8 s | 2.5 s |
| **Total Blocking Time (TBT)** | 4,930 ms | 1,930 ms |
| **Cumulative Layout Shift (CLS)** | **0** | **0** |
| **Speed Index** | 5.7 s | 5.6 s |
| **Total Transfer Size** | 1,757 KiB | 3,990 KiB |
| **Main Thread Work** | 13.3 s | 6.8 s |
| **JS Bootup Time** | 7.7 s | 5.6 s |

*Performance Observations:*
- Mobile total byte weight remains tightly optimized at 1,757 KiB (down >57% from 4,147 KiB baseline).
- TBT on mobile decreased from 10,920 ms to 4,930 ms; Desktop TBT decreased from 4,210 ms to 1,930 ms.
- Root cause for remaining score constraint: Initial main-thread execution during Three.js canvas setup, WebGL shader compilation, and GSAP ticker registration. This remains an open architectural optimization for a future performance pass and was intentionally not changed to prevent desktop regression.

## Limits and follow-up

- Touch behavior was emulated in Playwright Chromium; a physical Android handset with low GPU memory was not physically connected for hardware testing.
- Google Search Console property indexing status cannot be fetched programmatically due to absence of an authenticated Search Console API plugin in this environment. Verification meta tag is active.
- Performance remains an open workstream for non-blocking WebGL initialization; visual parity and stability are fully verified live.
