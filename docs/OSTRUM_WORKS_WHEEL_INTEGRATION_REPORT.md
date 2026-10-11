# Ostrum Works Wheel Integration Report

**Engineering Architecture & Verification Report**  
*Date: 11 October 2026*  
*Target Environment: Next.js 15 Production Build (`http://localhost:3000`)*  
*Component: `@crafterui/components/works-wheel` (21st.dev ID: 28371)*  
*Files: `components/ui/works-wheel.tsx`, `components/sections/OstrumWorksWheelSection.tsx`, `app/page.tsx`*

---

## 1. Executive Summary

This report documents the integration of the exact **Works Wheel** template by CrafterUI retrieved directly from 21st.dev (`@crafterui/components/works-wheel`) into the Ostrum digital studio homepage.

The original template's geometry, constants, 3D perspective transforms, rAF rendering loop, and interactions (wheel, drag, keyboard, and index selection) have been faithfully implemented without simplification, alteration, or substitution with standard carousels.

### Key Deliverables & Criteria Met
1. **Exact 21st.dev Template Implementation:** Created [`components/ui/works-wheel.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/components/ui/works-wheel.tsx) preserving all original geometric and animation constants (`CARD_H`, `CARD_MAX_W`, `CARD_RATIO`, `STEP`, `DRUM`, `LENS`, `RING_R`, `BOW`, `TITLE`, `INDEX`, `CULL`, `WHEEL_UNITS`, `DRAG_UNITS`, `SETTLE`, `EASE`).
2. **Ring-to-Drum Transformation:** The circular ring arrangement around the centre label at rest opens smoothly into a vertical 3D perspective drum upon scrolling or dragging, with the front card flat and full size while neighbouring cards rotate away into 3D space with left-arc bowing.
3. **Two Authentic Real Projects Connected:**
   - **Project 1: TMR AI Car Care**
     - Live URL: `https://tmraicarcare.com/`
     - Asset: `/images/tmr-ai-car-care.jpg` (captured from the live website)
   - **Project 2: Saraswati Driving School**
     - Live URL: `https://saraswati-driving-school.vercel.app/`
     - Asset: `/images/saraswati-driving-school.jpg` (captured from the live website)
4. **Preserved 7 Demo Entries:** Retained all seven original CrafterUI demo entries (`Neon Portal`, `Red Ribbon`, `Celestial`, `Uplight`, `Indigo Marble`, `Launch Window`, `Cosmic Wave`) using the original `ART()` function and CDN paths.
5. **Layered Covering Transition:** As the visitor continues scrolling past the cinematic narrative, the Works Wheel section rises from below at `z-[20]` and physically covers the stationary 3D Möbius sculpture and Beat 05 text together without independent drift or jumping.
6. **Natural Scrolling at Boundaries:** The wheel listener permits natural page scrolling when at the ends of its range (top/ring and bottom/last card).
7. **Reverse-Scroll Parity:** Reverse-scrolling from the Works Wheel cleanly lowers the section and uncovers the settled 3D sculpture and Beat 05 text in reverse without visual jumps.
8. **Automated Playwright Certification:** All 19 test checkpoints passed across 5 viewports with 0 console errors and solid 60 FPS scroll execution.

---

## 2. Component Retrieval & Source Integrity

The original component source was retrieved from 21st.dev using the 21st MCP server:
- **Catalog Item:** Works Wheel (`@crafterui/components/works-wheel`)
- **Item ID:** `28371`
- **Author:** `crafterui`
- **Install Command:** `npx shadcn@latest add "https://21st.dev/r/crafterui/works-wheel"`

### Original Constants Preserved

```typescript
const CARD_H = 0.38;     // front card height, of the stage
const CARD_MAX_W = 0.34; // never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40;         // degrees between cards on the drum
const DRUM = 2.22;       // drum radius, in card heights
const LENS = 2.7;        // perspective distance
const RING_R = 1.14;     // ring radius
const BOW = 1.82;        // horizontal left-arc bowing radius
const TITLE = 0.124;     // ring label and front-card title scale
const INDEX = 0.04;      // right-hand index scale
const CULL = 1.6;        // card distance culling threshold
const WHEEL_UNITS = 900; // wheel sensitivity
const DRAG_UNITS = 420;  // drag sensitivity
const SETTLE = 140;      // debounce quiet time in ms
const EASE = 0.12;       // smoothing fraction per rAF tick
```

### Minimal Framework Compatibility Enhancements
1. **Lenis Scroll Harmony:** When the wheel is actively scrubbing between cards (`isTrapped = next > 0 && next < last + 1`), `stageRef` sets `data-lenis-prevent="true"` and calls `event.preventDefault()`. When at the boundaries (`next <= 0` or `next >= last + 1`) or when the section is still scrolling into view, `data-lenis-prevent` is removed, allowing Lenis and the browser to scroll the page naturally without trapping the reader.
2. **External Link Safety:** External project links (`href.startsWith('http')`) include `target="_blank"` and `rel="noopener noreferrer"`.
3. **Tailwind Tokens:** Added `background`, `foreground`, `muted`, and `muted-foreground` to `tailwind.config.ts` so all shadcn/ui classes in the template compile with high-contrast obsidian-dark styling.

---

## 3. Project Dataset Configuration

```typescript
export const OSTRUM_WORKS: WorksWheelItem[] = [
  {
    title: "TMR AI Car Care",
    image: "/images/tmr-ai-car-care.jpg",
    href: "https://tmraicarcare.com/",
  },
  {
    title: "Saraswati Driving School",
    image: "/images/saraswati-driving-school.jpg",
    href: "https://saraswati-driving-school.vercel.app/",
  },
  {
    title: "Neon Portal",
    image: ART("neon-cave-portal-silhouette"),
    href: "#neon-portal",
  },
  {
    title: "Red Ribbon",
    image: ART("red-ribbon-typography"),
    href: "#red-ribbon",
  },
  {
    title: "Celestial",
    image: ART("celestial-light-figure"),
    href: "#celestial",
  },
  {
    title: "Uplight",
    image: ART("neon-portrait-uplight"),
    href: "#uplight",
  },
  {
    title: "Indigo Marble",
    image: ART("indigo-liquid-marble"),
    href: "#indigo-marble",
  },
  {
    title: "Launch Window",
    image: ART("rocket-launch-gradient"),
    href: "#launch-window",
  },
  {
    title: "Cosmic Wave",
    image: ART("astronaut-cosmic-wave"),
    href: "#cosmic-wave",
  },
];
```

---

## 4. Section-Transition & Stacking Architecture

The layout coordinates seamlessly with the preceding cinematic 3D energy narrative:

```
┌───────────────────────────────────────────────────────────────┐
│ DOM Layer                           z-index     Position      │
├───────────────────────────────────────────────────────────────┤
│ BackgroundCaustics                  z-0         Fixed inset-0 │
│ IntroHero & Section 02 Content      z-10        Relative      │
│ OstrumContinuousJourney (Three.js)  z-[12]      Fixed inset-0 │
│ OstrumEnergyNarrativeSection        z-[15]      Relative      │
│ OstrumWorksWheelSection             z-[20]      Relative      │
└───────────────────────────────────────────────────────────────┘
```

- When the cinematic narrative reaches its final hold (`progress = 1.0`), the 3D Möbius sculpture is locked at `(0.50 * innerWidth, 0.50 * innerHeight)` in its fully illuminated resting orientation (`targetRotY = 4π`, `targetEnergyLevel = 1.0`).
- `#selected-work` begins directly below the pinned narrative at `z-[20]` with an opaque `#000000` background.
- As the user scrolls down, the Works Wheel section rises and covers the 3D canvas (`z-[12]`) and Beat 05 text (`z-[15]`) together.
- The 3D sculpture is culled only after the incoming section has achieved 100% viewport coverage (`exitY = energyEnd + window.innerHeight`).
- Once established at `rect.top <= 0`, the Works Wheel stage is fully interactive.

---

## 5. Playwright Verification Results

The automated certification suite in [`scripts/verify_works_wheel.js`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/scripts/verify_works_wheel.js) verified all criteria against the live production build (`http://localhost:3000`).

### Test Results Summary: 19 / 19 Tests Passed (0 Failed)

| Test Item | Verification Criteria | Status |
| :--- | :--- | :--- |
| **State 1** | Final cinematic state intact (Beat 05 visible, sculpture at center rest pose) | **PASS** |
| **State 2** | Initial entry of Works Wheel panel from bottom viewport edge | **PASS** |
| **State 3** | Halfway covering transition: z-[20] surface covers sculpture and text together | **PASS** |
| **State 4** | Works Wheel panel achieves 100% viewport coverage | **PASS** |
| **State 5** | Circular ring arrangement of 9 cards formed around center label `"Works '26"` | **PASS** |
| **State 6** | Item 0 (TMR AI Car Care) rotates to front, links to `https://tmraicarcare.com/` | **PASS** |
| **State 7** | Item 1 (Saraswati Driving School) rotates to front, links to live Vercel URL | **PASS** |
| **State 8** | 7 CrafterUI demo entries preserved with original artwork paths and `#...` hrefs | **PASS** |
| **State 9** | Keyboard navigation (ArrowDown / ArrowUp) updates target smoothly | **PASS** |
| **State 10** | Pointer drag interaction updates turn position | **PASS** |
| **State 11** | Scrolling past wheel boundary reaches studio conversation closure prompt | **PASS** |
| **State 12** | Reverse scrolling smoothly uncovers 3D sculpture and Beat 05 text without jumps | **PASS** |
| **Performance** | Main-thread scroll execution: `0.08ms` avg (0.5% of 16.67ms frame budget), 60 FPS | **PASS** |
| **VP 1440×900** | Zero horizontal scroll overflow | **PASS** |
| **VP 1280×800** | Zero horizontal scroll overflow | **PASS** |
| **VP 1024×768** | Zero horizontal scroll overflow | **PASS** |
| **VP 390×844** | Zero horizontal scroll overflow | **PASS** |
| **VP 375×812** | Zero horizontal scroll overflow | **PASS** |
| **Console** | Zero runtime errors or unhandled exceptions logged | **PASS** |

---

## 6. Generated Visual Artifacts

The following screenshot evidence was captured during automated verification and stored in the artifacts directory:
- `wheel-01-cinematic-final-state.png`: Cinematic Beat 05 with centered resting 3D sculpture.
- `wheel-02-initial-panel-entry.png`: Works Wheel panel beginning entrance from bottom edge.
- `wheel-03-halfway-covering-transition.png`: Halfway occlusion covering sculpture and text together.
- `wheel-04-full-viewport-coverage.png`: Complete viewport coverage by Works Wheel background.
- `wheel-05-initial-circular-ring.png`: Circular ring arrangement at rest around `"Works '26"`.
- `wheel-06-drum-item-0-tmr.png`: 3D perspective drum with TMR AI Car Care front card.
- `wheel-07-drum-item-1-saraswati.png`: 3D perspective drum with Saraswati Driving School front card.
- `wheel-08-drag-interaction.png`: Interactive drum rotation via pointer dragging.
- `wheel-09-footer-closure.png`: Clean scroll continuation into footer action prompt.
- `wheel-10-reverse-restoration.png`: Reverse scroll restoring 3D sculpture and Beat 05 text.
- `wheel-vp-*.png`: Responsive layouts across all 5 audited viewports.
