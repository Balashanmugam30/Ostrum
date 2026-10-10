# Ostrum Final Polish: Typography, Scroll Text Reveal, Single Background Transition & Section Timing

**Delivery Report & Quality Certification**  
*Date: 10 October 2026*  
*Target Environment: Next.js 15 Production Build (`http://localhost:3000`)*

---

## 1. Executive Summary

This engineering sprint delivered the final polish of the Ostrum cinematic 3D scroll experience, directly matching the typography, scale, and scroll-scrubbed text-fill choreography of the reference website ([Ignite Agency](https://igniteagency.com/)).

All four core defects identified in previous reviews have been resolved without redesigning the website, altering the approved hero 'O' alignment, or disrupting the Three.js Möbius sculpture:

1. **Reference-Matched Typography & Scale:** Replaced the previous light-weight serif narrative text with Neue Montreal Medium (`font-sans font-medium`, weight 500), achieving exactly 74.88px headline scale at 1920×1080 (line-height 89.86px, ratio 1.2), balanced line wrapping, and zero stroke outline.
2. **Genuine Scroll-Scrubbed Text-Fill Reveal:** Inactive narrative statements appear in solid muted grey (`rgba(255, 255, 255, 0.30)`), progressively filling into radiant pure white (`#ffffff`) as the visitor scrolls, followed by an intentional reading hold before dissolving out.
3. **Single Background Transition Architecture:** Completely eliminated duplicate background transitions. Removed the premature darkening event from Section 02's pinned timeline and established a single authoritative handoff controller in `BackgroundCaustics.tsx` that smoothly darkens only across the exact handoff interval between Section 02 unpin (`dockEnd`) and Section 03 pin (`energyStart`). Reversible on upward scroll.
4. **Section 02 Sculpture Timing & Hold:** Verified that the Möbius sculpture stays locked at rest in the center slot during the entire reading hold while "01 · FOR BUSINESS" and "02 · FOR WHAT'S NEXT" are 100% visible, departing only after the reading hold finishes.
5. **5 Client-Friendly Beats:** Implemented the approved narrative copy across 5 distinct beats with selective coral (`#ff5c4a`) highlights on Beat 05 and zero em dashes.

---

## 2. Detailed Technical Solutions

### A. Reference Typography & Scaling (`OstrumEnergyNarrativeSection.tsx`)
Live inspection of `https://igniteagency.com/` revealed that the reference uses:
- Font: Neue Montreal Medium (500 weight)
- Headline Size: ~75px at 1920×1080
- Inactive Color: `rgba(255, 255, 255, 0.30)` (solid muted grey, not stroke outline)
- Active Color: `#ffffff` (solid white)

We implemented a dual-layer architecture:
- **Base Semantic Layer:** Accessible `<h2>` and `<p>` elements rendered in `font-sans font-medium text-white/30 text-center text-wrap-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]`. Headings scale via `text-[clamp(34px,3.9vw,75px)] leading-[1.2] tracking-[-0.01em]` within a `max-w-[1080px]` container.
- **Scrubbed Fill Layer:** An absolute overlay (`aria-hidden="true"`) matching the exact layout and typography, rendered in solid `#ffffff` (`text-white`) with `clipPath: inset(0 calc((1 - fill) * 100%) 0 0)`.
- **Supporting Statements:** Scaled at `text-[clamp(17px,1.4vw,23px)] leading-[1.4]`, base `text-white/30`, filling to `text-white/90` with selective coral red (`#ff5c4a`) highlights on Beat 05.

### B. Single Authoritative Background Darkening (`BackgroundCaustics.tsx` & `OstrumEngineSection.tsx`)
- **Root Cause of Duplicate Darkening:** Section 02 had an `onUpdate` inside `holdTl` setting `targetDarken: 0 -> 1` starting at $p = 0.72$ of Section 02, while `BackgroundCaustics` simultaneously computed `targetDarken = 0.0` based on DOM bounding rects. This created competing updates and a jarring secondary darkening flash.
- **Resolution:**
  1. Removed `onUpdate` bg-darken dispatch from `OstrumEngineSection.tsx`.
  2. Registered `(window as any).ScrollTrigger = ScrollTrigger` across sections.
  3. In `BackgroundCaustics.tsx`, established a single mathematical formula on scroll:
     - $scrollY \le dockEnd$: `targetDarken = 0.0` (100% crimson caustics throughout Hero and Section 02 reading hold).
     - $dockEnd < scrollY < energyStart$: `targetDarken = (scrollY - dockEnd) / (energyStart - dockEnd)` (smooth continuous transition during the handoff).
     - $scrollY \ge energyStart$: `targetDarken = 1.0` (deep black throughout Section 03 and release spacer).
     - On reverse scroll, this function reverses continuously back to 0.0 without jumping or flashing.

### C. 5-Beat Narrative Choreography (`content/messages.ts` & `OstrumEnergyNarrativeSection.tsx`)
The narrative timeline spans `scrollDistance = 4600px` (desktop) / `3200px` (mobile), choreographed into:
- **Stage 0 ($p \in [0.00, 0.12]$):** Pure object-only stage. Sculpture sits alone in center against deep obsidian black void.
- **Beat 01 ($p \in [0.12, 0.28]$):** "Your tools don't work together." / "Your team wastes time switching between systems and repeating work."
- **Beat 02 ($p \in [0.29, 0.44]$):** "It shouldn't be this hard." (emphatic punchline, sculpture behind text).
- **Beat 03 ($p \in [0.45, 0.62]$):** "We make your business work better." / "We build websites, software and automation that connect your tools, simplify daily work and help your team move faster."
- **Beat 04 ($p \in [0.63, 0.80]$):** "Got a problem no product solves?" / "We turn real problems into useful software and original products."
- **Beat 05 ($p \in [0.81, 1.00]$):** "Ready to build what comes next?" / "From better business systems to original products, we build technology that makes work simpler and new ideas possible." (selective coral highlights on "makes work simpler" and "new ideas possible").

---

## 3. Playwright Verification Results

The automated audit suite (`scripts/verify_scroll_fill_and_reversal.js`) verified all 16 scroll checkpoints, 6 responsive viewports, and reverse-scrolling behaviour on the production server (`http://localhost:3000`).

### Test Results Summary:
- **Total Tests Passed:** 24 / 24
- **Tests Failed:** 0
- **Console Errors:** 0

### Checkpoint Execution Table:

| Checkpoint | ScrollY | Verified Visual Behavior | Status |
| :--- | :---: | :--- | :---: |
| **chk-01** | 1393 | Section 02 entrance; sculpture at center, side text entering | PASS |
| **chk-02** | 1553 | Section 02 side text partly revealed | PASS |
| **chk-03** | 1893 | **Section 02 Reading Hold:** Both blocks at 100% opacity, sculpture locked at rest, background 100% crimson | PASS |
| **chk-04** | 2523 | Departure begins only after Section 02 hold ends | PASS |
| **chk-05** | 3641 | **Stage 0:** Pure object-only stage; sculpture alone against obsidian black void | PASS |
| **chk-06** | 3986 | Beat 01 inactive muted grey lettering (`rgba(255,255,255,0.3)`) | PASS |
| **chk-07** | 4170 | Beat 01 progressive scrubbed fill (left-to-right white unmasking) | PASS |
| **chk-08** | 4446 | Beat 01 fully filled ivory/white reading hold | PASS |
| **chk-09** | 5113 | Beat 02 punchline completed ("It shouldn't be this hard.") | PASS |
| **chk-10** | 5895 | Beat 03 completed ("We make your business work better.") | PASS |
| **chk-11** | 6723 | Beat 04 completed ("Got a problem no product solves?") | PASS |
| **chk-12** | 7735 | **Beat 05:** Completed with coral highlights on "makes work simpler" & "new ideas possible" | PASS |
| **chk-13** | 8165 | Deep black background maintained in release spacer | PASS |
| **chk-14** | 2869 | Reverse scroll handoff smoothly restoring crimson caustics | PASS |
| **chk-15** | 1873 | Section 02 fully restored on reverse scroll (100% crimson caustics, blocks intact) | PASS |
| **chk-16** | 0 | Hero fully restored on reverse scroll (100% crimson caustics & cursor halo) | PASS |

### Viewport Responsiveness Audit:

| Viewport | Dimensions | Headline Font Size | Horizontal Overflow | Result |
| :--- | :---: | :---: | :---: | :---: |
| **Desktop 1080p** | 1920 × 1080 | **74.88px** (matches ~75px reference) | No | PASS |
| **Desktop Laptop** | 1440 × 900 | 56.16px | No | PASS |
| **Desktop Small** | 1280 × 800 | 49.92px | No | PASS |
| **Tablet** | 1024 × 768 | 39.94px | No | PASS |
| **Mobile Large** | 390 × 844 | 34.00px | No | PASS |
| **Mobile Standard** | 375 × 812 | 34.00px | No | PASS |

---

## 4. Deliverables Checklist

- [x] Reference-matched Neue Montreal Medium typography (~75px at 1920×1080).
- [x] Solid muted grey base (`rgba(255, 255, 255, 0.30)`) with scrubbed white fill (`#ffffff`).
- [x] Single authoritative background darkening controller (no duplicate transitions or flashes).
- [x] Section 02 sculpture locked at rest throughout the reading hold.
- [x] 5 client-friendly beats with selective coral highlights and zero em dashes.
- [x] 100% reversible reverse-scrolling restoring crimson caustics and Hero 'O'.
- [x] Verified production build (`next build`) and running server.
- [x] 16 audit screenshots and JSON metrics in artifact directory.
