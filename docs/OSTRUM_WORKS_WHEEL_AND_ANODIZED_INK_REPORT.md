# Ostrum Works Wheel Redesign & Anodized Ink Certification Report

**Session Date:** October 11, 2026  
**Component:** `components/ui/works-wheel.tsx` · `components/ui/anodized-ink.tsx` · `components/sections/OstrumWorksWheelSection.tsx`  
**Test Suite:** `scripts/verify_anodized_works_wheel.js`  
**Status:** Certified & Production-Ready (13/13 Checks Passed · 0 Errors)

---

## 1. Executive Summary

This release completes the final redesign and engineering hardening of the Ostrum Selected Work section. Based on the 21st.dev Works Wheel perspective drum architecture (`@crafterui/components/works-wheel`) and the 21st.dev Anodized Ink WebGL2 shader component (`@kedhareswer/anodized-ink`, Component ID: 35254), the showcase now presents a bold, editorial, and mechanically unified experience.

### Key Architecture Upgrades:
1. **Initial Circular Ring Scale & Fit:** The ring occupies 72.2% of viewport height (target: 68–76%), perfectly centered with 14.5% top margin and 13.2% bottom margin, preventing card clipping.
2. **Restrained Center Label:** The minimal label **`Selected Work`** is placed directly in the center of the ring with zero overlap onto cards. It fades smoothly as the drum opens.
3. **Elimination of Clutter:** The right-hand `<ol>` project index, duplicate floating labels, and arbitrary classification badges (`[VERIFIED CLIENT]`, `[CONCEPT]`) have been completely eliminated.
4. **Drum Mode — Large Two-Column Presentation:**
   - **RIGHT COLUMN:** The active project card displays as a large, cinematic thumbnail (42.4% viewport width, 46.7% viewport height, center shifted to 1000px on 1440px desktop), creating an editorial focus.
   - **LEFT COLUMN:** Clean, commanding display typography for project title (e.g. `TMR AI Car Care`, `Saraswati Driving School`), editorial description, and subtle destination link (`Visit Platform ↗`) for verified platforms.
5. **Single Persistent Anodized Ink Background:** One WebGL2 crimson metallic ink shader canvas runs persistently behind the entire section (`preset="crimson"`, `#030000`, `#d1001c`, `#c9c9c9`, `speed=0.65`, `turbulence=0.85`, `scale=0.9`, `interactive=true`, `maxDpr=1.25`). All per-project pastel background switching has been removed.
6. **Stationary Cinematic Handoff:** Beat 05 ("Ready for what's next? / OSTRUM") and the 3D Möbius sculpture remain 100% stationary in their viewport rest positions as `#selected-work` rises from the bottom and smoothly covers them.
7. **Bespoke Editorial Thumbnails & Real Navigation:** All 9 projects feature high-resolution bespoke imagery stored locally under `public/images/works/*.jpg`. Click interactions (<7px movement) on real projects (`https://tmraicarcare.com/` and `https://saraswati-driving-school.vercel.app/`) open their live platforms in new tabs. Drag gestures (>7px movement) smoothly rotate the drum without triggering links.

---

## 2. Quantitative Verification Results

Automated Playwright verification script `scripts/verify_anodized_works_wheel.js` verified the implementation against the running production server:

| Test Area | Metric / Requirement | Measured Value | Status |
| :--- | :--- | :--- | :--- |
| **Test 1: Stationary Handoff** | Beat 05 Y Delta during incoming rise | 0px delta (Beat top = 0, work rose 900px → 0px) | **PASS** |
| **Test 2: Anodized Ink Shader** | WebGL2 canvas presence & full-bleed | `canvas.getContext('webgl2') !== null` (1440×900) | **PASS** |
| **Test 3: Ring Sizing & Center Label** | Ring height / viewport height (68–76%) | **72.2%** (650px / 900px), 14.5% top / 13.2% bottom | **PASS** |
| **Test 3: Clean Architecture** | Right `<ol>` index & status badges | Completely removed (0 instances found) | **PASS** |
| **Test 4: Drum Two-Column Layout** | Active card width ratio (40–50%) | **42.4%** (610px width), height **46.7%** (421px) | **PASS** |
| **Test 4: Right-Shifted Center** | Active card Center X (>55% of width) | **1000px** (69.4% of 1440px viewport) | **PASS** |
| **Test 4: Left Details Panel** | Clean title, description, live link | Verified present, badges absent | **PASS** |
| **Test 5: Project Sync Advance** | Synchronous title/art change on turn | `Saraswati Driving School` & `Signal` sync confirmed | **PASS** |
| **Test 6: Bespoke Editorial Images** | 9 custom artworks loading (HTTP 200) | 9/9 loaded with naturalWidth > 0 | **PASS** |
| **Test 7: Click vs Drag Separation** | Genuine click (<7px) triggers navigation | TMR -> `tmraicarcare.com`, Saraswati -> `vercel.app` | **PASS** |
| **Test 7: Drag Gesture Safety** | Drag gesture (>7px) prevents link click | Drag rotated wheel with 0 false navigation events | **PASS** |
| **Test 8: Cross-Device Viewports** | 6 viewports: 1920, 1440, 1280, 1024, 390, 375 | 0 horizontal overflow, 0 console errors | **PASS** |

---

## 3. WebGL2 Anodized Ink Shader Architecture

File: `components/ui/anodized-ink.tsx`  
Component ID: `35254` (`@kedhareswer/anodized-ink`)

### Mathematical Foundation:
- **Iterated Sine Flow:** 4 octaves of multi-frequency vector sine domain warping generating organic metallic ink filaments:
  ```glsl
  vec2 p = uv * uScale;
  p += 0.28 * sin(p.yx * 2.8 + uTime * uSpeed * 0.45);
  p += 0.16 * sin(p.yx * 5.4 - uTime * uSpeed * 0.35);
  p += 0.08 * sin(p.yx * 9.8 + uTime * uSpeed * 0.55);
  ```
- **Finite-Difference Surface Normals:** Calculates real-time pseudo-normals:
  ```glsl
  vec3 normal = normalize(vec3(-(hR - hL), -(hU - hD), 2.0 / uTurbulence));
  ```
- **Thin-Film Anodized Sheen:** Specular reflections modulated by Fresnel term and multi-color gradient ramp:
  ```glsl
  vec3 ink = mix(uColor1, uColor2, smoothstep(-0.6, 0.7, height));
  ink = mix(ink, uColor3, pow(fresnel, 2.2) * uSheen);
  ```
- **Interactive Pointer & Ripple Physics:** Mouse velocity inputs generate dynamic swirling light; clicks propagate decaying wave rings through uniform arrays.
- **Resource Management:** Clamped `maxDpr = 1.25`, WebGL2 context loss listeners, and requestAnimationFrame loop pause when hidden.

---

## 4. Drum Mode Two-Column Geometry & Sizing

File: `components/ui/works-wheel.tsx`

```ts
const cardW = isDesktop
  ? Math.min(w * 0.44, h * 0.54 * CARD_RATIO)
  : isTablet
  ? Math.min(w * 0.58, h * 0.48 * CARD_RATIO)
  : Math.min(w * 0.82, 340);

const cardH = cardW / CARD_RATIO;
const drumShiftX = isDesktop ? w * 0.20 : 0;
```

### Visual Layout:
- **Center X on Desktop (1440px):** Screen center (720px) + `drumShiftX` (288px) = `1008px` (leaves ~115px right viewport margin).
- **Left Column Area:** Occupies `left: 8%` to `44%`, providing a dedicated column for project headlines (`text-4xl md:text-5xl lg:text-6xl`), editorial summaries, and interactive links.
- **Ring Scale (At Rest, m = 0):** `ringScale = 0.28`, visible ring diameter = `72.2%` of viewport height.
- **Drum Scale (In Motion, m = 1):** Active front card scale = `1.0`, full `610px × 421px` thumbnail.
- **Demand-Driven rAF Loop:** Runs only while animating; sleeps when settled on an integer item index.

---

## 5. Visual Artifacts Catalog

The automated Playwright certification generated the following visual evidence in the artifact directory:

1. `anodized-01-beat05-rest.png`: Beat 05 ("Ready for what's next? / OSTRUM") and 3D sculpture at resting position.
2. `anodized-02-handoff-rising.png`: Selected Work section rising midway over Beat 05 with 0px shift of the underlying scene.
3. `anodized-03-handoff-covered.png`: Selected Work section completely covering Beat 05.
4. `anodized-04-ring-rest.png`: Circular catalogue ring at 72.2% viewport height with minimal `Selected Work` center label.
5. `anodized-05-drum-tmr-layout.png`: Two-column drum mode displaying TMR AI Car Care on the left and large artwork on the right.
6. `anodized-06-drum-saraswati.png`: Drum scrolled to Saraswati Driving School with updated title and fleet logistics artwork.
7. `anodized-07-drum-signal.png`: Drum scrolled to Signal concept project with clean title and real-time market art.
8. `anodized-vp-desktop-1920x1080.png`: Full desktop 1920×1080 responsive verification (0 overflow).
9. `anodized-vp-desktop-1440x900.png`: Standard desktop 1440×900 responsive verification (0 overflow).
10. `anodized-vp-laptop-1280x800.png`: Laptop 1280×800 responsive verification (0 overflow).
11. `anodized-vp-tablet-1024x768.png`: Tablet 1024×768 responsive verification (0 overflow).
12. `anodized-vp-mobile-390x844.png`: Mobile 390×844 responsive verification (0 overflow).
13. `anodized-vp-mobile-375x812.png`: Compact mobile 375×812 responsive verification (0 overflow).

---

## 6. Verification Summary

- **Total Test Suites:** 8
- **Total Assertions:** 13
- **Passed:** 13 (100%)
- **Failed:** 0
- **Console Errors:** 0
- **Build Status:** Next.js Production Build Succeeded (`0` warnings/errors)
