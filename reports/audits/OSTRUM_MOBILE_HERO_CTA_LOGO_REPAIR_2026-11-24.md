# Ostrum Mobile Defects Repair & Verification Report (2026-11-24)

**Date:** 2026-11-24  
**Scope:** Three verified defects on mobile:
1. Mobile hero 3D sculpture reverse-scroll reliability.
2. Mobile CTA curtain reveal speed and termination.
3. Top-left OSTRUM header logo persistence and contrast safety.

---

## 1. Executive Summary & Verified Outcomes

All three items were resolved, verified against a production build across multiple mobile viewports (`390×844` iPhone 14, `360×800` Android compact) and validated against desktop regression (`1440×900`):

| Scope Item | Root Cause Identified | Remediation Applied | Automated Playwright Verification Result |
| :--- | :--- | :--- | :--- |
| **1. Hero 3D Sculpture Reverse-Scroll Return** | Active scroll path in `syncAnimation()` was resetting `isInitialized = false` on every touch event, causing fragile re-initialization and pose drift when flinging back to hero. | Removed active-path `isInitialized = false`. Maintained uninitialized flag reset only when paused outside story range (`scrollY > exitBoundary`). Added wrapper opacity lock and guaranteed deterministic pose lock at `scrollY <= 30 && currentPhase === 'complete'`. | **PASSED (100%):** 5 consecutive top-to-bottom-to-top cycles on `390×844`. In all 5 cycles: `modelRoot.visible === true`, `rotation.y === 0`, `containerOpacity === 1`, `canvasAttached === true`. |
| **2. Mobile CTA Curtain Reveal Speed & Termination** | Dynamic trigger `end` with unpinned container had insufficient natural scroll travel in document flow, stopping curtain prematurely and leaving an unfinished reveal or black void. | Dynamic `extraTravel = Math.max(0, getLiftDistance() - naturalTravel)` calculated on `onRefreshInit` and applied as `marginTop` to stage. Set trigger `end: () => "+=" + getLiftDistance()` and `scrub: 0.6`. | **PASSED (100%):** At `390×844`, 844 CSS px of travel produces 844px lift (1:1 steady reveal matching desktop). At max scroll: `stProgress === 1.0`, `visibility === 'hidden'`, `pointerEvents === 'none'`, `voidAfterFooter === 0px`. At `360×800`, 800px travel produces 800px lift with 0px void. |
| **3. Persistent & Contrast-Safe Header Logo** | `<header>` was hidden (`opacity-0`) whenever `inFooter` or `isCinematic` was true; `checkContrast()` used brittle inline-style string matching; Testimonials stage lacked surface markers. | Kept `<header>` visible after intro reveal (`!isRevealed ? 'opacity-0' : 'opacity-100'`). Kept brand logo button permanently visible (`opacity-100 translate-y-0 pointer-events-auto`). Only hide `mobile-menu-toggle` in footer/cinematic. Replaced inline-style matching with explicit `data-selection-surface` and `data-theme` contract. Ensured `#161514` on light and `#FFF8F3` on dark surfaces. Mobile drawer logo updated to `#FFF8F3`. | **PASSED (100%):** Brand logo verified visible across all 8 tested sections (Hero, Capabilities, Engine, Testimonials, FAQ, Energy Narrative, Contact, Footer). Computed text colors match expected theme contracts exactly. |

---

## 2. Detailed Technical Implementations

### Item 1: Mobile Hero 3D Sculpture Reliability
- **File:** `components/visuals/OstrumContinuousJourney.tsx`
- **Changes:**
  - Removed redundant `if (isMobile) isInitialized = false;` from active scroll handling in `syncAnimation()`.
  - Kept uninitialized flag reset strictly on exit-range pause (`scrollY > exitBoundary`).
  - Guaranteed wrapper `opacity = '1'` on re-entry before scheduling new `requestAnimationFrame`.
  - Strengthened hero lock in `animate()` for `scrollY <= 30 && currentPhase === 'complete'`:
    ```ts
    if (scrollY <= 30 && currentPhase === 'complete') {
      currentX = targetWorld.x;
      currentY = targetWorld.y;
      currentScale = targetScale;
      currentRotationY = 0;
      currentEnergy = 0;
      modelRoot.visible = true;
      material.opacity = 1;
      ribbonGroup.visible = false;
      if (container.style.opacity !== '1') {
        container.style.opacity = '1';
      }
    }
    ```

### Item 2: Mobile CTA Curtain Reveal Speed & Termination
- **File:** `components/sections/OstrumFooterReveal.tsx`
- **Changes:**
  - Kept unpinned in normal document flow (no `pin: container` or `pinSpacing: true`).
  - Added `updateExtraTravel` helper executed both on initialization and on GSAP ScrollTrigger's `onRefreshInit`:
    ```ts
    const getLiftDistance = () => curtain.offsetHeight || window.innerHeight;
    const updateExtraTravel = () => {
      const naturalTravel = Math.max(0, stage.offsetHeight - window.innerHeight);
      const extraTravel = Math.max(0, getLiftDistance() - naturalTravel);
      stage.style.marginTop = `${extraTravel}px`;
    };
    updateExtraTravel();
    ```
  - Configured ScrollTrigger with `start: 'top top'`, `end: () => "+=" + getLiftDistance()`, `scrub: 0.6`, `invalidateOnRefresh: true`, and `onRefreshInit: updateExtraTravel`.
  - At bottom of scroll, curtain is fully translated by `-getLiftDistance()`, `onLeave` sets `visibility: hidden` and `pointerEvents: none`, and the footer stage sits flush with document bottom with 0px void.

### Item 3: Top-Left OSTRUM Header Logo Persistence & Contrast
- **Files:** `components/navigation/Header.tsx`, `components/sections/OstrumTestimonialsSection.tsx`, `components/sections/OstrumCapabilitiesSection.tsx`, `components/sections/OstrumContactSection.tsx`
- **Changes:**
  - Re-architected `checkContrast()` in `Header.tsx` to sample beneath the logo anchor (`x = min(60, max(24, 8% vw))`, `y = 36`) and header center, querying `targetEl.closest('[data-selection-surface], [data-theme], #capabilities, #testimonials, #faq')`.
  - Added `data-selection-surface="light"` to `OstrumTestimonialsSection.tsx` section root and stage container.
  - Added `data-selection-surface="dark"` to `OstrumContactSection.tsx` section root.
  - Set `<header>` class to `!isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'`.
  - Set brand logo `<button>` to `pointer-events-auto transition-all duration-500 cursor-pointer ${textColorClass} opacity-100 translate-y-0`.
  - Restricted conditional disappearance in footer and cinematic sections to `mobile-menu-toggle` only:
    `${inFooter || isCinematic ? 'opacity-0 pointer-events-none' : (scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-90 pointer-events-auto')}`.
  - Updated mobile drawer dialog logo to `text-[#FFF8F3]` against the dark `#0A0104/96` backdrop.

---

## 3. Playwright Verification Evidence

### Mobile 390×844: 5 Full Top-to-Bottom-to-Top Cycles
```
Cycle 1: Bottom ST Progress = 1.0000, Curtain Vis = hidden, Journey Opacity = 0.0165; Return y=0: Model Visible = true, Opacity = 1, RotY = 0
Cycle 2: Bottom ST Progress = 1.0000, Curtain Vis = hidden, Journey Opacity = 0.0165; Return y=0: Model Visible = true, Opacity = 1, RotY = 0
Cycle 3: Bottom ST Progress = 1.0000, Curtain Vis = hidden, Journey Opacity = 0.0165; Return y=0: Model Visible = true, Opacity = 1, RotY = 0
Cycle 4: Bottom ST Progress = 1.0000, Curtain Vis = hidden, Journey Opacity = 0.0165; Return y=0: Model Visible = true, Opacity = 1, RotY = 0
Cycle 5: Bottom ST Progress = 1.0000, Curtain Vis = hidden, Journey Opacity = 0.0165; Return y=0: Model Visible = true, Opacity = 1, RotY = 0
```

### CTA Reveal Metrics & Termination Geometry
- **iPhone 14 (390×844):**
  - `stStart`: 19,300px
  - `stEnd`: 20,144px
  - `scrollTravel`: 844px
  - `liftDistance`: 844px
  - `travelRatio`: 1.000
  - `stProgress` at max scroll: 1.0000
  - `curtainVisibility`: `hidden`
  - `curtainPointerEvents`: `none`
  - `emailLinkClickable`: `auto`
  - `voidAfterFooter`: 0px
- **Android Compact (360×800):**
  - `stStart`: 19,292px
  - `stEnd`: 20,092px
  - `scrollTravel`: 800px
  - `liftDistance`: 800px
  - `travelRatio`: 1.000
  - `voidAfterFooter`: 0px

### Header Logo Contrast & Visibility Checks
```
Section Hero                        : Visible = true, Color = rgb(255, 248, 243)   (Match: true)
Section Capabilities                : Visible = true, Color = rgb(22, 21, 20)      (Match: true)
Section Engine                      : Visible = true, Color = rgb(255, 248, 243)   (Match: true)
Section Testimonials                : Visible = true, Color = rgb(22, 21, 20)      (Match: true)
Section FAQ                         : Visible = true, Color = rgb(22, 21, 20)      (Match: true)
Section Energy Narrative (Cinematic): Visible = true, Color = rgb(255, 248, 243)   (Match: true)
Section Contact                     : Visible = true, Color = rgb(255, 248, 243)   (Match: true)
Section Footer                      : Visible = true, Color = rgb(255, 248, 243)   (Match: true)
Mobile Drawer Logo                  : Open = true, Color = rgb(255, 248, 243)      (Match: true)
```

### Desktop Regression (1440×900)
- `desktopCurtainStExists`: `true` (pinned CTA curtain intact)
- `capabilitiesStExists`: `true` (pinned Capabilities intact)
- `rotYAtHero`: 0
- `consoleErrors`: `[]` (0 errors)
