# Clarté Reference Website Reverse-Engineering & Experience Analysis

> **Reference URL:** https://clarte.page/  
> **Project:** "CLARTÉ — When Illness Becomes Light"  
> **Inspection Date:** October 2026 (Live DevTools & Playwright DOM Extraction)  
> **Objective:** Concrete, empirical reverse-engineering of Clarté's experiential language, layout logic, typographic scale, motion mechanics, and spatial rhythm to govern the Next.js architectural recreation for Ostrum.

---

## 1. Concrete Structural Observation & Macro Hierarchy

Clarté is built as a single, continuous, long-scroll experiential journey with massive vertical pauses and cinematic focus. It eschews traditional card grids in favor of spatial purity:

### Live DOM Inspection Matrix (Viewport 1440 × 900)

| Sequence # | Selector / Class | Measured Dimensions | Layout & CSS Box Model | Content & Functional Role |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `header.header` | `width: 1068px`, `height: 16px`, `top: 24px` | `position: fixed`, `display: flex`, `justify-content: space-between`, `align-items: center` | Minimalist fixed global header, floating 24px from top. Contains language switcher (`EN — FR`) with zero borders, minimalist typographic presence. |
| **02** | `section.intro` | `width: 1116px`, `height: 732px`, `top: 0px` | `position: relative`, `display: flex`, `flex-direction: column`, `justify-content: flex-end`, `padding-bottom: 48px` | Hero narrative statement. Asymmetrical editorial statement with line-by-line reveal; primary rolling CTA button with 11px sub-label. Fullscreen WebGL caustics canvas sits behind. |
| **03** | `section.book-infos` | `width: 1116px`, `height: 521px`, `top: 932px` | `position: static`, `margin-top: 200px`, `display: flex`, `justify-content: space-between`, `align-items: center` | Core artifact showcase. **Exact 200px margin-top**. 40/60 Asymmetric split: Left column features massive 60.45px serif heading (`Romie`) + 16px body copy; Right column hosts interactive 3D WebGL Canvas (`391px × 521px` client / `488px × 651px` internal). |
| **04** | `section.gallery` | `width: 1116px`, `height: 876px`, `top: 1641px` | `position: relative`, `margin-top: 200px`, `display: block` | Interactive digital spaces. **Exact 200px margin-top**. Full-width interactive WebGL canvas (`1116px × 732px` client / `1395px × 915px` internal) with chapter title, subtitle, and dynamic state transitions. |
| **05** | `section.footer-cta` | `width: 1116px`, `height: 586px`, `top: 2517px` | `position: static`, `padding-top: 120px`, `padding-bottom: 120px`, `display: flex`, `flex-direction: column`, `align-items: center` | Climactic perspective statement. 32px typographic statement with optical serif highlights (`<span class="highlight">`), high-contrast inverted white rolling button (`theme--white`). |
| **06** | `footer.footer` | `width: 1116px`, `height: 732px`, `top: 3103px` | `position: relative`, `display: block`, `padding: 40px 0` | Quiet navigation links (`Instagram — Contact`), copyright notice (`© 2026`), secondary rolling action trigger. |

---

## 2. Empirical Typographic Measurements

Extracted directly from computed styles in browser memory:

### Font Families
- **Display Serif:** `Romie, serif` (High-contrast French Renaissance optical serif with tight tracking and acute vertical stress).
- **Body & Structural Sans:** `"Neue Montreal", sans-serif` (Clean, contemporary grotesque with tight aperture and geometric balance).

### Computed Typographic Scale

| Selector / Role | Font Family | Computed Size | Font Weight | Computed Line Height | Computed Letter Spacing | Case & Character |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 / Intro Text** (`.intro h1`) | `Neue Montreal` | **16px** | 400 | **19.2px** (1.2) | **-0.32px** (-0.02em) | Sentence case, quiet narrative opening |
| **H2 Section Display** (`.book-infos h2`) | `Romie, serif` | **60.45px** | 400 | **55.61px** (0.92!) | **-1.56px** (-0.026em) | Ultra-tight leading, monumental literary impact |
| **Typographic Highlight** (`span.highlight`) | `Romie, serif` | **32px** | 400 | **32px** (1.0) | **-0.32px** | Embedded italic accent inside sans sentences |
| **Body Paragraph** (`.book-infos p`) | `Neue Montreal` | **16px** | 400 | **20px** (1.25) | **-0.32px** (-0.02em) | Sentence case, high readability |
| **Footer Statement H2** (`.footer-cta h2`) | `Neue Montreal` | **32px** | 400 | **32px** (1.0) | **-0.32px** | Balanced narrative synthesis |
| **Primary Action Button** (`.primary-btn`) | `Neue Montreal` | **14px** | 500 | **14px** (1.0) | **-0.32px** | `padding: 16px`, `border-radius: 4px` |
| **Sub-Button Micro-Label** (`.primary-btn-sub`) | `Neue Montreal` | **11px** | 500 | **11px** (1.0) | Normal | Subtle metadata below CTA |

---

## 3. WebGL Canvas Architecture & Shader Telemetry

Clarté deploys three dedicated WebGL canvases:
1. **Atmospheric Mesh Canvas (`.background-webgl`):**
   - Canvas Dimensions: `1395 × 915` (DPR scaled to client `1116 × 732`).
   - Function: Renders real-time caustic light refraction, fluid distortion, and refractive dispersion.
2. **Interactive 3D Physical Artifact (`.book-3d`):**
   - Canvas Dimensions: `488 × 651` (client `391 × 521`).
   - Function: A 3D physical object with smooth orbital rotation upon mouse drag, inertial friction, and light reflections.
3. **Experiential Gallery Canvas (`.gallery-canvas`):**
   - Canvas Dimensions: `1395 × 915` (client `1116 × 732`).
   - Function: Renders atmospheric chapters, interactive particle fields, and experiential visual transitions.

---

## 4. Micro-Interactions & Physics Engine

### 1. Dual-Layer Rolling Action Pill (`.primary-btn`)
- **Structure:**
  ```html
  <button class="primary-btn">
    <span class="text-wrapper">
      <span class="text">Get the book</span>
      <span class="text text--clone">Get the book</span>
    </span>
    <span class="arrow-wrapper">
      <span class="arrow">→</span>
      <span class="arrow arrow--clone">→</span>
    </span>
  </button>
  ```
- **Motion Spec:**
  - Resting: `.text` is at `transform: translateY(0%)`; `.text--clone` is at `transform: translateY(100%)`.
  - Hover: `.text` translates to `translateY(-100%)`; `.text--clone` translates to `translateY(0%)`.
  - Arrow: Synchronous diagonal shift (`translateX(100%) translateY(-100%)` -> `translateX(0%) translateY(0%)`).
  - Cubic Bezier: `cubic-bezier(0.16, 1, 0.3, 1)` with `0.4s` duration.
  - Geometry: `border-radius: 4px` (refined architectural pill rather than bubble round).

### 2. Embedded Optical Accent Highlights
- Embedded words within running sentences use `<span class="highlight">` styled with `font-family: Romie, serif; font-style: italic`.
- Provides an immediate literary, high-craft editorial cadence.

### 3. Spatial Breathing Room (The 200px Rule)
- Sections have explicit `margin-top: 200px` on desktop.
- Sections do not crowd or compete; each chapter commands the full viewport with monumental quietness.

---

## 5. Architectural Translation to Ostrum

| Clarté Reference (Dark/Poetic) | Ostrum Production Equivalent (Light-First Architectural Studio) |
| :--- | :--- |
| Black background (`rgb(0, 0, 0)`) | **Warm Alabaster Linen (`#FAF7F2`)**, **Pearl Porcelain (`#FCFAF7`)**, **Misty Slate (`#F3F5F7`)** |
| White light dispersion shaders | **Optical prism refractions**, subtle champagne mesh gradients, and warm caustics |
| Book 3D model (`391 × 521`) | **Interactive 3D Ostrum Architecture Polyhedron / Engine** with pointer rotation & inertia |
| Romie Display Serif | **Instrument Serif** (Google Fonts, SIL OFL 1.1) |
| Neue Montreal Sans | **Plus Jakarta Sans / Inter** (tight tracking `-0.02em`, 400/500 weights) |
| 200px vertical section margin | **`clamp(120px, 14vw, 220px)`** vertical breathing room across all 17 chapters |
| Rolling action button with clone layer | **Dual-layer rolling action pill** with micro-descriptor sub-label |
| Unverified metrics / fake stats | **Strictly banned.** Only honest architectural outcomes and transparent scopes |
