# OSTRUM — CINEMATIC 3D ENERGY SCROLL EXPERIENCE REPORT

**Date:** October 10, 2026  
**Subject:** Replacement of "The Experiences" Card Gallery with a Unified Scroll-Driven 3D Energy Narrative  
**Repository:** `Balashanmugam30/Ostrum`  
**Commit Branch:** `main`  
**Status:** COMPLETE & VERIFIED (20/20 Automated Tests Passed)

---

## 1. EXECUTIVE SUMMARY & MISSION OBJECTIVES

The legacy "The Experiences" section—which previously featured static introductory text and a 3D tilted fan card gallery running a redundant WebGL renderer—has been completely removed. In its place, we engineered a continuous, cinematic scroll-driven 3D experience inspired by the Ignite Agency design principles.

This transformation was achieved without creating duplicate WebGL canvases or loading redundant 3D assets. The established Three.js Möbius sculpture (`monyedre-360.glb`) now seamlessly navigates three consecutive phases:
1. **Hero Wordmark:** Precision alignment inside the Romie serif 'O'.
2. **Section 02 (Ostrum Engine):** Glides into the centerpiece between "01 · FOR BUSINESS" and "02 · FOR WHAT'S NEXT", with an editorial pinned hold.
3. **Section 03 (The Energy Continuum):** Seamlessly expands into a majestic focal centerpiece in a deepening obsidian burgundy atmosphere, accompanied by real-time glowing energy filaments, glossy ruby/champagne materials, and three scroll-synchronized narrative beats.

---

## 2. PREVIOUS ASSETS & COMPONENTS REMOVED (3.5 MB Payload Savings)

Before implementation, an exhaustive codebase reference search was conducted to identify obsolete assets and orphan code. The following were permanently eliminated:

| Removed Item | Type | Size / Lines | Rationale |
|---|---|---|---|
| `components/canvas/GalleryCanvas.tsx` | Redundant WebGL Renderer | 425 lines | Legacy tilted-card fan canvas with duplicate animation loop and orthographic camera. |
| `components/sections/GallerySection.tsx` | Deprecated Component | 40 lines | Replaced by `OstrumEnergyNarrativeSection.tsx`. |
| `public/images/teaser/xp-1.webp` | Image Asset | 831 KB | Only utilized by old card gallery. |
| `public/images/teaser/xp-2.webp` | Image Asset | 126 KB | Only utilized by old card gallery. |
| `public/images/teaser/xp-3.webp` | Image Asset | 740 KB | Only utilized by old card gallery. |
| `public/images/teaser/xp-4.webp` | Image Asset | 138 KB | Only utilized by old card gallery. |
| `public/images/teaser/xp-5.webp` | Image Asset | 1,210 KB | Only utilized by old card gallery. |
| `public/images/teaser/xp-6.webp` | Image Asset | 464 KB | Only utilized by old card gallery. |

**Net Reduction:** 3.51 MB of unneeded image payloads and over 460 lines of deprecated code removed.

---

## 3. ARCHITECTURE & IMPLEMENTATION DETAILS

### 3.1 Single Continuous 3D Object Architecture
Rather than mounting a second canvas in Section 03, the authoritative `OstrumContinuousJourney.tsx` full-screen canvas (`fixed inset-0 z-[12]`) manages the continuous journey across all three sections:
- **Zero Canvas Teleportation:** The single Three.js instance tracks the page scroll state continuously.
- **Dynamic Anchor Tracking:** Measures DOM targets `#section02-sculpture-slot` and `#section03-sculpture-slot` dynamically to maintain exact alignment across responsive resize events.

### 3.2 Premium Material & Lighting Evolution
The original Möbius sculpture geometry is preserved while dynamically transitioning its physical shader properties as it enters Section 03:
- **Base Color & Subsurface:** Smoothly lerps from ivory porcelain (`#f7eee8`) into rich champagne-ruby (`#d98a8a`) with deep crimson shadows (`#2c060a`).
- **Surface Polish & Clearcoat:** Roughness drops from `0.26` to `0.16` (liquid-glass specular reflection), while clearcoat increases from `0.58` to `0.96` with `clearcoatRoughness: 0.12`.
- **Sheen & Emissive Accent:** Sheen color shifts from soft rose (`#ffdcd8`) to vibrant scarlet (`#ff2a3e`), while emissive ember glow lerps from `#000000` to `#550b12` with intensity `1.4`.
- **Internal Energy Point Lights:**
  - `energyRubyLight`: A `#ff1e2e` point light positioned in the central cavity of the Möbius loop, casting radiant crimson glow onto inner surfaces.
  - `energyAmberLight`: A `#ff9933` point light casting warm amber/copper reflections along the outer ribbon edges.

### 3.3 Luminous Energy Filaments (Electrical Geometry)
To convey controlled electrical energy without resorting to heavy particle systems or cartoon lightning bolts:
- **Parametric 3D Splines:** Created three mathematical 3D curves orbiting and threading through the Möbius loop:
  1. *Scarlet Core Trace:* Closed curve ($r = 1.62 + 0.22\cos(2t)$) interweaving through the center cavity.
  2. *Warm Amber Orbital Arc:* Slightly tilted ribbon embrace ($r = 1.72 - 0.18\sin(2t)$).
  3. *Ivory Lightning Filament:* Delicate high-frequency trace ($y = 2.08\sin(t-1.2)(1+0.12\cos(2t))$).
- **Additive Blending:** Rendered with lightweight `THREE.TubeGeometry` using `THREE.AdditiveBlending`, `depthWrite: false`, and opacity modulated by Section 03 energy progress.
- **Scroll Synchronization:** Opacities ramp from `0.0` outside Section 03 to `0.85` inside, flowing and orbiting gently with scroll velocity.

---

## 4. CINEMATIC NARRATIVE BEATS & SCROLL CHOREOGRAPHY

The section is driven by a pinned GSAP ScrollTrigger timeline (`#energy-narrative-pin`, 2200px scroll duration on desktop, 1400px on mobile):

```
+-----------------------------------------------------------------------------+
| STAGE 1: ENTRY & TRANSITION (dockEnd -> energyStart)                        |
| - Section 02 unpins and scrolls away.                                       |
| - Sculpture glides into Section 03 center; scale expands from 0.42 -> 0.62.  |
| - Background begins darkening: uDarken transitions 0.0 -> 0.25.             |
+-----------------------------------------------------------------------------+
| BEAT 01: SYSTEMS ARCHITECTURE (p = 0.00 - 0.32)                             |
| - Primary: "Complexity, made coherent."                                     |
| - Supporting: "We connect technology, people and operations into systems..." |
| - Rotation advances to 2.75π; scarlet filaments illuminate.                 |
+-----------------------------------------------------------------------------+
| BEAT 02: APPLIED INTELLIGENCE (p = 0.33 - 0.64)                             |
| - Primary: "Intelligence, put to work."                                     |
| - Supporting: "We turn ambitious ideas into useful software, automation..." |
| - Rotation advances to 3.40π; amber reflections sweep across glossy surface. |
+-----------------------------------------------------------------------------+
| BEAT 03: WHAT COMES NEXT (p = 0.65 - 1.00)                                  |
| - Primary: "We build what doesn't exist yet."                               |
| - Supporting: "We discover unmet needs and create original products..."     |
| - Rotation settles at 4.0π; balanced glossy resting state achieved.         |
+-----------------------------------------------------------------------------+
| SETTLED EXIT (scrollY > energyEnd)                                          |
| - Final pose holds motionless; no endless spin or jitter.                   |
| - Sculpture scrolls naturally upward with section exit toward Footer.       |
| - Background uDarken returns smoothly to 0.0.                               |
+-----------------------------------------------------------------------------+
```

---

## 5. BACKGROUND ATMOSPHERE DARKENING

In `BackgroundCaustics.tsx`:
- Added uniform `uDarken: { value: 0 }` to the WebGL fragment shader.
- Implemented real-time event listener `ostrum:bg-darken` with buttery-smooth RAF lerping.
- **Shader Compositing:**
  - When `uDarken > 0`, the background caustics smoothly blend into deep obsidian burgundy (`color * vec3(0.24, 0.05, 0.08) + vec3(0.018, 0.004, 0.008)`).
  - A concentrated central radiant spotlight (`vec3(0.62, 0.07, 0.03)`) illuminates directly behind the sculpture (`(0.5, 0.5)` screen space), preserving dramatic backlighting and high contrast for typography.
  - The flowing water distortion and film grain remain subtly active underneath.
  - 100% reversible when scrolling backward.

---

## 6. CUSTOM OSTRUM CIRCULAR CURSOR

Created `components/ui/CustomCursor.tsx` mounted globally in `app/layout.tsx`:
- **Visual Design:**
  - Outer Ring: 28px diameter thin warm-ivory circle (`border: 1px solid rgba(247, 238, 232, 0.65)`) with subtle crimson shadow.
  - Center Dot: 6px diameter precision point with crimson ember glow (`#ff4d3a`, `box-shadow: 0 0 8px rgba(255, 77, 58, 0.85)`).
- **Interaction Mechanics:**
  - Hovering over interactive targets (`a`, `button`, inputs, `[role="button"]`) expands the ring to 44px with a soft crimson wash (`rgba(255, 77, 58, 0.08)`).
  - Clicking produces a subtle tactile compress scale effect (`scale(0.85)` / `scale(1.3)`).
- **Performance & Accessibility:**
  - Updated purely via `requestAnimationFrame` and CSS `translate3d(x, y, 0)` on DOM refs; **0 React re-renders on mousemove**.
  - `pointer-events: none` ensures native clicks, drag, and browser focus are 100% unaffected.
  - Conditioned on `@media (hover: hover) and (pointer: fine)`; completely disabled on touch devices.
  - Respects `prefers-reduced-motion: reduce`.

---

## 7. AUTOMATED PLAYWRIGHT VALIDATION RESULTS

An automated end-to-end test suite (`scripts/verify_energy_experience.js`) was executed against the production Next.js build.

### Summary Metrics:
- **Total Tests Executed:** 20
- **Passed:** 20
- **Failed:** 0
- **Console Errors:** 0
- **Horizontal Overflow:** None detected on any device.

### Detailed Viewport Verification:

| Viewport | Resolution | Device Type | Result | Verified Details |
|---|---|---|---|---|
| `desktop-1440x900` | 1440 × 900 | Standard Desktop | **PASS** | Centered sculpture, side editorial typography, cursor tracking active |
| `desktop-1280x800` | 1280 × 800 | Compact Desktop | **PASS** | Balanced proportions, zero collision with header or footer |
| `tablet-1024x768` | 1024 × 768 | iPad Landscape | **PASS** | Responsive scale compensation, zero horizontal scrollbar |
| `tablet-768x1024` | 768 × 1024 | iPad Portrait | **PASS** | Vertical stacking of narrative beats below sculpture |
| `mobile-390x844` | 390 × 844 | iPhone 14 | **PASS** | Top clearance below header (`pt-24`), stacked editorial cards, touch scroll |
| `mobile-375x812` | 375 × 812 | iPhone X | **PASS** | Compact scale, clean typography, 0 layout shifts |

---

## 8. BUILD AND VERIFICATION CHECKLIST

- [x] Old "The Experiences" card gallery and canvas completely removed.
- [x] Featured-project section below preserved.
- [x] Existing Möbius sculpture (`monyedre-360.glb`) retained as authoritative model.
- [x] Single WebGL canvas and renderer shared from Hero through Section 03 (0 duplicates).
- [x] Liquid glass ruby/porcelain material and luminous energy filaments active in Section 03.
- [x] Background caustics darken progressively and reversibly.
- [x] Three narrative beats transition smoothly according to scroll position.
- [x] Rotation is controlled, reversible, and settles into an intentional final pose.
- [x] Custom circular cursor active on desktop fine pointers.
- [x] Clean production build (`next build`) with 0 errors and 0 warnings.
