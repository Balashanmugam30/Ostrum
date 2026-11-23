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

## Limits and follow-up

- Touch behavior was emulated in Chromium; the exact physical Android device/browser from the recording was not available for a live test. The supplied blank white screen was not reproduced in this pass.
- No new Lighthouse run was taken. The previous low Lighthouse performance score remains an open performance investigation; this visual repair does not claim to improve it.
- Verify the production deployment and public site against the publishing commit after release. The build/test results above are local production-build evidence, not proof of Google indexing, Analytics traffic, or physical-device behavior.
