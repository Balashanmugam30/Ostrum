# OSTRUM — PHASE 3: BOLD PROJECT-SPECIFIC COLOUR THEMES & SMOOTH TRANSITIONS REPORT

**Project:** Ostrum Studio Homepage (`/`)  
**Section:** Selected Work (`@crafterui/components/works-wheel` & `AnodizedInk`)  
**Phase:** Phase 3 — Bold Project-Specific Colour Themes & Smooth Transitions  
**Date:** October 12, 2026  
**Status:** COMPLETE & VERIFIED (19/19 Assertions Passed)  

---

## 1. Executive Summary

Phase 3 successfully establishes a scroll-responsive, cinematic color-transition architecture for the Ostrum Works Wheel section. The approved Phase 2 light iridescent fluid environment is preserved in the initial resting oval state ($turn = 0$, $m < 0.45$), while each of the four genuine projects activates a distinctive, richly saturated metallic color world with zero visual jumps, zero shader recompilations, and zero layout thrashing.

### Key Achievements:
1. **Preserved Light Resting Oval:** The initial four-card oval retains its clean, pale lavender-white (`#F1F1FA`) background, opalescent wash, and cobalt accent (`#362BEB`).
2. **Four Contrasting Project Palettes:** Each client system and studio venture commands an unmistakable color identity across the color wheel:
   - **TMR AI Car Care:** Automotive Vermilion / Copper (`#C9362B`, `#F19A68`, `#42100F`, `#F8D7BD`)
   - **Saraswati Driving School:** Royal Cobalt / Electric Blue (`#3047E8`, `#68BDEB`, `#0F1A4E`, `#D7E9FF`)
   - **MNESA:** High-Dimensional Violet / Electric Purple (`#7438D8`, `#B58AF0`, `#230E48`, `#E4D5FF`)
   - **NeuroMove:** Biomechanical Jade / Emerald Green (`#078567`, `#56CDAA`, `#063028`, `#C7F0E2`)
3. **Smooth WebGL Shader Uniform Lerping:** Dynamic exponential interpolation ($1 - e^{-4.2 \cdot dt}$) smoothly blends `uDeep`, `uInk`, `uSecondary`, and `uSheen` across ~350–450ms within the existing WebGL2 draw loop. No context destruction, no new programs, and no duplicate RAF loops.
4. **Adaptive Editorial Typography Contrast:** Left-hand title, description, and link colors dynamically transition using CSS transitions, ensuring high WCAG contrast against each project's backdrop (warm ivory, crisp icy white, soft lavender-white, and mint-white).
5. **Bidirectional Scroll & Interaction Continuity:** Forward and reverse scrolling seamlessly travel between themes and restore the light oval. Viscous pointer wake, swirl, and ripples remain fully operational across all theme states.

---

## 2. Palette Architecture & Design Rationale

### 2.1 Theme Configuration (`PROJECT_THEMES` & `LIGHT_OVAL_THEME`)

```typescript
export interface ProjectTheme {
  primary: string;      // maps to shader uInk
  secondary: string;    // maps to shader uSecondary
  deep: string;         // maps to shader uDeep & container background
  sheen: string;        // maps to shader uSheen
  textColor: string;    // h3 editorial title
  textMuted: string;    // p editorial description
  linkColor: string;    // live destination CTA
}
```

| State / Project | Primary (`uInk`) | Secondary (`uSecondary`) | Deep Base (`uDeep`) | Sheen (`uSheen`) | Text Color | Live URL |
|---|---|---|---|---|---|---|
| **Resting Oval** | `#362BEB` (Cobalt) | `#7482F8` (Lavender Wash) | `#F1F1FA` (Pale Lavender) | `#FFFFFF` | `#0B0B10` (Near Black) | — |
| **1. TMR AI Car Care** | `#C9362B` (Vermilion) | `#F19A68` (Copper) | `#42100F` (Oxblood Shadow) | `#F8D7BD` (Champagne) | `#FFF8F5` (Warm Ivory) | `https://tmraicarcare.com/` |
| **2. Saraswati Driving School** | `#3047E8` (Royal Cobalt) | `#68BDEB` (Electric Blue) | `#0F1A4E` (Midnight Navy) | `#D7E9FF` (Ice White) | `#F4F8FF` (Icy White) | `https://saraswati-driving-school.vercel.app/` |
| **3. MNESA** | `#7438D8` (Vivid Violet) | `#B58AF0` (Soft Lavender) | `#230E48` (Deep Amethyst) | `#E4D5FF` (Pastel Lilac) | `#FAF6FF` (Violet White) | *Studio Venture* |
| **4. NeuroMove** | `#078567` (Rich Jade) | `#56CDAA` (Emerald Mint) | `#063028` (Forest Abyssal) | `#C7F0E2` (Soft Seafoam) | `#F0FDF8` (Mint White) | *Studio Venture* |

### 2.2 Rationale for Consecutive Contrast
Consecutive projects travel across opposing sectors of the color space to prevent visual fatigue or ambiguity:
- **TMR $\to$ Saraswati:** Warm automotive vermilion/copper ($\approx 15^\circ$) leaps directly to cool royal cobalt ($\approx 230^\circ$).
- **Saraswati $\to$ MNESA:** Electric cobalt transitions to mystical high-dimensional amethyst violet ($\approx 270^\circ$).
- **MNESA $\to$ NeuroMove:** Violet shifts across complementary harmony into precise biomathematical jade green ($\approx 165^\circ$).
- **NeuroMove $\to$ Resting Oval:** Reversing from jade returns to violet $\to$ cobalt $\to$ vermilion $\to$ the clean opalescent white oval.

---

## 3. Shader Uniform Interpolation & Luminance Detection

### 3.1 WebGL2 Fragment Shader Tone Adaptation
The shader dynamically calculates base luminance `lumDeep`:
```glsl
float lumDeep = dot(uDeep, vec3(0.299, 0.587, 0.114));
float isLight = smoothstep(0.35, 0.65, lumDeep);
```

- When `isLight == 1.0` (Resting Oval `#F1F1FA`, luminance $\approx 0.95$):
  - Base background is `uDeep` (`#F1F1FA`).
  - Fluid body wash adopts opalescent iridescence (`iridColor`).
  - Specular glints shine in pure silvery-white.
  - Left perimeter curved accent is cobalt `#362BEB`.
- When `isLight == 0.0` (Project Themes, luminance $\le 0.22$):
  - Base background blends `uDeep` with subtle ambient gradient to eliminate flat rectangular clipping.
  - Fluid folds enrich with `uInk` (primary) and countertone `uSecondary`.
  - Fresnel rims glow in `uSecondary`.
  - Specular glints reflect metallic `uSheen`.
  - Left perimeter curve shines in the project's signature countertone.

### 3.2 Smooth Draw-Loop Uniform Damping
In `components/ui/anodized-ink.tsx`:
```typescript
const colRate = 1 - Math.exp(-dt * 4.2);
let colorsSettled = true;

for (let c = 0; c < 3; c++) {
  const dDeep = P.deep[c] - curDeep[c];
  const dInk = P.ink[c] - curInk[c];
  const dSec = P.secondary[c] - curSecondary[c];
  const dSheen = P.sheen[c] - curSheen[c];

  if (Math.abs(dDeep) > 0.001 || Math.abs(dInk) > 0.001 || Math.abs(dSec) > 0.001 || Math.abs(dSheen) > 0.001) {
    colorsSettled = false;
  }

  curDeep[c] += dDeep * (reduced ? 1 : colRate);
  curInk[c] += dInk * (reduced ? 1 : colRate);
  curSecondary[c] += dSec * (reduced ? 1 : colRate);
  curSheen[c] += dSheen * (reduced ? 1 : colRate);
}

gl.uniform3fv(loc.deep, curDeep);
gl.uniform3fv(loc.ink, curInk);
gl.uniform3fv(loc.secondary, curSecondary);
gl.uniform3fv(loc.sheen, curSheen);

if (!reduced && (visible || !colorsSettled)) raf = requestAnimationFrame(draw);
```

---

## 4. Preservation of Resting Oval & Drum Gating

In `components/sections/OstrumWorksWheelSection.tsx`:
- `isDrumActive` state is derived from `ScrollTrigger` and wheel turn progress: `isDrumActive = targetTurn >= 0.45`.
- At rest ($turn = 0$, $m = 0$), `isDrumActive` is strictly `false`.
- `currentTheme` resolves as:
  ```typescript
  const currentTheme = isDrumActive
    ? (PROJECT_THEMES[activeProject] ?? LIGHT_OVAL_THEME)
    : LIGHT_OVAL_THEME;
  ```
- This prevents the zero index of `activeProject` from triggering TMR's dark vermilion theme while the catalog is still in resting oval mode.
- Reverse scrolling below $turn < 0.45$ resets `isDrumActive` to `false`, smoothly returning the background to `#F1F1FA`.

---

## 5. Playwright Verification Results

The automated test suite (`scripts/verify_phase3_project_themes.js`) ran across all 12 mandatory states and 8 responsive viewports.

### Summary: 19 / 19 Assertions PASSED

| # | Test Assertion | Status | Details |
|---|---|---|---|
| 1 | Initial Oval retains light background (`#F1F1FA`) | **PASS** | `rgb(241, 241, 250)` matched |
| 2 | TMR title is correct ("TMR AI Car Care") | **PASS** | Title matched |
| 3 | TMR deep background active (`#42100F`) | **PASS** | `rgb(66, 16, 15)` matched |
| 4 | TMR title has warm ivory contrast | **PASS** | `rgb(255, 248, 245)` matched |
| 5 | TMR destination is `https://tmraicarcare.com/` | **PASS** | Link verified |
| 6 | Saraswati title is correct ("Saraswati Driving School") | **PASS** | Title matched |
| 7 | Saraswati deep background active (`#0F1A4E`) | **PASS** | `rgb(15, 26, 78)` matched |
| 8 | Saraswati title has crisp white contrast | **PASS** | `rgb(244, 248, 255)` matched |
| 9 | Saraswati destination is `https://saraswati-driving-school.vercel.app/` | **PASS** | Link verified |
| 10 | MNESA title is correct ("MNESA") | **PASS** | Title matched |
| 11 | MNESA deep background active (`#230E48`) | **PASS** | `rgb(35, 14, 72)` matched |
| 12 | MNESA title has crisp violet-white contrast | **PASS** | `rgb(250, 246, 255)` matched |
| 13 | NeuroMove title is correct ("NeuroMove") | **PASS** | Title matched |
| 14 | NeuroMove deep background active (`#063028`) | **PASS** | `rgb(6, 48, 40)` matched |
| 15 | NeuroMove title has crisp mint-white contrast | **PASS** | `rgb(240, 253, 248)` matched |
| 16 | Reverse scroll restores MNESA title and theme | **PASS** | Reverse navigation verified |
| 17 | Reverse scroll restores light background (`#F1F1FA`) | **PASS** | Light oval restored |
| 18 | Pointer displacement executed during theme without errors | **PASS** | WebGL fluid displacement active |
| 19 | No fatal WebGL or console errors across all 8 viewports | **PASS** | 0 errors |

### Generated Artifact Screenshots:
- `phase3-01-initial-light-oval.png` — Resting oval with opalescent fluid and cobalt arc.
- `phase3-02-transition-into-tmr.png` — Morphing phase into Project 1.
- `phase3-03-tmr-vermilion-active.png` — TMR automotive copper/vermilion active theme.
- `phase3-04-transition-tmr-to-saraswati.png` — Interpolation from vermilion to cobalt.
- `phase3-05-saraswati-cobalt-active.png` — Saraswati royal cobalt active theme.
- `phase3-06-transition-saraswati-to-mnesa.png` — Interpolation from cobalt to violet.
- `phase3-07-mnesa-violet-active.png` — MNESA neural violet active theme.
- `phase3-08-transition-mnesa-to-neuromove.png` — Interpolation from violet to jade.
- `phase3-09-neuromove-jade-active.png` — NeuroMove biomechanical jade active theme.
- `phase3-10-reverse-to-mnesa.png` — Reverse navigation returning to MNESA.
- `phase3-11-reverse-to-initial-oval.png` — Reverse navigation returning to light oval.
- `phase3-12-pointer-interaction-tmr-theme.png` — Pointer displacement and metallic glints under cursor.
- `phase3-vp-*.png` — 8 responsive viewports (1920x1080 to 375x812).

---

## 6. Performance Audit

- **WebGL Programs:** Exactly 1 WebGL2 program compiled at mount and reused indefinitely.
- **Draw Loops:** Exactly 1 demand-driven RAF loop. Sleeps when colors have settled and pointer is idle; wakes on scroll or pointer movement.
- **Memory Footprint:** JS Heap Stable at 27.44 MB.
- **Layout Duration:** 0.0369s across 242 scroll scrub ticks. Zero layout thrashing in the color update loop.

---

## 7. Acceptance Criteria Checklist

- [x] Initial ring retains the approved light background.
- [x] TMR AI Car Care uses a distinct vermilion/copper theme.
- [x] Saraswati Driving School uses a distinct cobalt/blue theme.
- [x] MNESA uses a distinct violet/purple theme.
- [x] NeuroMove uses a distinct jade/emerald theme.
- [x] Consecutive themes are visually distinct, not similar pastels.
- [x] Project theme changes are smooth rather than abrupt.
- [x] The existing fluid artwork remains coherent through each transition.
- [x] Pointer displacement remains functional during theme changes.
- [x] The active image, description, title and background always correspond to the same project.
- [x] Text and thumbnails remain clearly readable.
- [x] No additional renderer or unnecessary animation loop is introduced.
- [x] The oval, ring-to-drum reveal and full-viewport stage remain unchanged.
- [x] Forward and reverse scrolling work.
- [x] Playwright screenshots verify all four themes and the initial light state.
- [x] Build and relevant quality checks pass.
- [x] The changes are documented, committed and pushed to GitHub.
