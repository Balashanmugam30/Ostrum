# Ostrum — Motion Blueprint & Animation Architecture

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Motion Character:** Kinetic Architectural Rigor • Physical Damp Springs • Zero Gratuitous Novelty  

---

## 1. Motion Philosophy: Purposeful Physics

Motion at Ostrum is not decorative garnish; it is an **informational instrument**. 
Every animation serves one of three architectural functions:
1. **Pacing & Comprehension:** Guiding the eye through multi-step operational logic (e.g., word-by-word scroll reveal).
2. **Systemic Connection:** Demonstrating how isolated nodes connect into unified pipelines (e.g., reactive topology lines).
3. **Tactile Feedback:** Providing physical, spring-damped confirmation of user intent (e.g., button presses, card elevations).

### Banned Motion Anti-Patterns
- ❌ Constant background particle storms or floating geometric debris.
- ❌ Endless looping 3D rotations that consume mobile GPU memory.
- ❌ Animations that shift layout or cause Cumulative Layout Shift (CLS).
- ❌ Animations that block keyboard navigation or trap user scrolling.

---

## 2. Master Animation Inventory Matrix

| Component / Layer | Trigger | Animated Properties | Start State | End State | Duration / Scrub | Easing Curve | Desktop | Mobile | Reduced Motion | Performance Risk | Implementation Candidate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Typography Reveal** | Page Mount | `opacity`, `translateY` | `0`, `30px` | `1`, `0px` | 0.8s (stagger 0.12s) | Spring (stiffness: 120, damping: 18) | Full stagger | Simultaneous fade | Instant display (`opacity: 1`) | Minimal | Motion (`motion/react`) |
| **Hero System Topology** | Pointer / Scroll | `rotateX`, `rotateY`, `scale` | `0deg`, `0deg`, `1.0` | `±8deg`, `±8deg`, `0.94` | Scrubbed / Smooth lerp | Fluid damp lerp | 3D Perspective tilt | 2D scale only | Static 2D diagram | Low | SVG Canvas / CSS `transform` |
| **Tech Stack Ticker** | Mount (Continuous) | `translateX` | `0%` | `-50%` | 32s (infinite linear) | `linear` | Continuous loop | Continuous loop | Static scrollable row | Minimal | Native CSS Keyframes |
| **Problem Word Reveal** | Scroll Depth | `color`, `opacity` | `#868C98`, `0.4` | `#0E1017`, `1.0` | Scrubbed across 200px scroll | Linear scroll scrub | Word-by-word reveal | Word-by-word reveal | Static high-contrast text | Low | CSS View Timeline / Motion `useScroll` |
| **Ostrum System Cards** | Pinned Scroll | `translateY`, `scale`, `filter` | `100%`, `1.0`, `blur(0)` | `0%`, `0.92`, `blur(0)` | Scrubbed (100vh pin per card) | Linear scrub | Sticky card stack | Vertical accordion | Standard stacked layout | Medium (tested) | Motion `useScroll` + `useTransform` |
| **Selected Project Reveal**| Viewport Entry | `clipPath`, `scale` | `inset(0 0 100% 0)`, `1.08` | `inset(0 0 0% 0)`, `1.00` | 0.9s | `cubic-bezier(0.16, 1, 0.3, 1)` | Curtain expansion | Curtain expansion | Instant reveal (`clip-path: none`) | Low | CSS View Timeline / Motion |
| **AI Agent Terminal Log** | Scenario Click | `opacity`, `translateY`, text | `0`, `12px` | `1`, `0px` (typewriter) | 0.3s per step sequence | Spring (stiffness: 200, damping: 22) | Sequential badge pop | Sequential badge pop | Instant full log printout | Minimal | React State Sequence |
| **Stack Builder Connections**| Pill Toggle | SVG `strokeDashoffset`, `scale`| Offset `100%`, `0.98` | Offset `0%`, `1.02` | 0.4s | Spring (stiffness: 300, damping: 25) | Reactive wire pulse | Static selection count | Instant color switch | Minimal | SVG Path Transition |
| **Sticky Footer Uncover** | Page Bottom Scroll| `translateY`, `opacity` | `-20%`, `0.6` | `0%`, `1.0` | Scrubbed (bottom 300px) | Linear scrub | Parallax uncover | Standard static block | Standard static block | Low | CSS Sticky Positioning |

---

## 3. Spring Physics Specifications

Rather than arbitrary ease-in-out curves, all interactive feedback utilizes **damped harmonic springs**:

```typescript
// Master Spring Presets for Motion (motion/react)
export const MOTION_SPRINGS = {
  // Tactile micro-interactions (buttons, pills, toggles)
  snappy: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  },
  // Structural component reveals (cards, drawers, modals)
  gentle: {
    type: "spring",
    stiffness: 180,
    damping: 24,
    mass: 1.0,
  },
  // Narrative camera & scroll-scrubbed transforms
  cinematic: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
} as const;
```

---

## 4. Scroll Physics & Native CSS Fallbacks

### Dual-Layer Animation Architecture

To guarantee both **60/120 FPS compositor performance** in modern browsers and **rock-solid reliability** across older or unsupported platforms:

1. **Native CSS Layer (Chrome 115+, Safari 26+, Edge 115+):**
   - Simple view-linked fades and image clip-path reveals use native CSS `@supports ((animation-timeline: view()) and (animation-range: entry))`.
   - Runs off the main browser thread directly on the GPU compositor.

2. **JavaScript Motion Layer (Motion for React):**
   - Complex coordinated scenes (such as the 5-layer Ostrum System pinned stack and the Interactive Stack Builder) utilize Motion’s `useScroll` with `useTransform`.
   - Ensures seamless coordinate math, Firefox compatibility, and graceful fallbacks.

---

## 5. Strict Reduced-Motion Architecture

Users with vestibular disorders or explicit system preferences (`prefers-reduced-motion: reduce`) receive a dignified, instant, static experience:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Disable sticky pinning to prevent scroll trapping */
  .motion-sticky-scene {
    position: static !important;
    transform: none !important;
  }
}
```
In React components:
```typescript
import { useReducedMotion } from "motion/react";

export function SystemCard() {
  const shouldReduceMotion = useReducedMotion();
  const animateState = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  // ...
}
```
