# Clarté Reference Website Reverse-Engineering & Experience Analysis

> **Reference URL:** https://clarte.page/  
> **Project:** "CLARTÉ — When Illness Becomes Light"  
> **Analysis Date:** October 2026  
> **Objective:** Deconstruct the experience language, layout logic, typographic scale, motion mechanics, and spatial rhythm of Clarté to inform the Next.js architectural recreation for Ostrum.

---

## 1. Global Structure & Page Composition

Clarté is built as a single, continuous, long-scroll experiential journey that prioritizes poetic narrative pacing and spatial elegance over dense UI grids:

### Macro Section Sequence

| Sequence # | Section Class | Role / Content | DOM Dimensions (Desktop 1440) | Key Layout Logic |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `header.header` | Minimalist Floating Header | Height: ~16px, Top: 32px | Fixed/floating header with language switcher (`EN — FR`), minimalist brand presence. |
| **02** | `section.intro` | Hero Narrative Statement | Width: 1112px, Height: 732px | Center/asymmetrical editorial statement with line-by-line reveal; primary rolling CTA button with sub-label. |
| **03** | `section.book-infos` | The Core Artifact Showcase | Width: 1112px, Height: 519px | 40/60 Asymmetric split: Left column features massive serif heading (`Romie`) + description; Right column hosts interactive 3D WebGL Canvas (`.book-3d`). Top margin: `200px`. |
| **04** | `section.gallery` | The Interactive Experiences | Width: 1112px, Height: 875px | Full-width chapter canvas (`.gallery-canvas`) with chapter title, subtitle, and dynamic visual state shifts. Top margin: `200px`. |
| **05** | `section.footer-cta` | Climactic Perspective Statement | Width: 1112px, Height: 586px | Large-scale typographic statement with optical serif highlights (`<span class="highlight">`), high-contrast inverted action button. |
| **06** | `footer.footer` | Epilogue & Links | Width: 1112px, Height: ~120px | Quiet navigation links (`Instagram — Contact`), copyright notice, duplicate secondary rolling action trigger. |

---

## 2. Typographic Architecture & Font Pairings

Clarté's typographic strength comes from the deliberate dialogue between **an austere neo-grotesque Swiss sans** and **an expressive, high-contrast literary serif**:

### Font Families
- **Display Serif: `Romie, serif`** (High-contrast, lyrical optical serif with sharp terminals and vertical stress).
- **Body & Structural Sans: `"Neue Montreal", sans-serif`** (Clean, neutral neo-grotesque with tight tracking and balanced apertures).

### Typographic Scale & Hierarchy

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Case / Transform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Statement (H1)** | Neue Montreal | 16px | 400 | 19.2px (1.2) | -0.32px (-0.02em) | Sentence case |
| **Section Display (H2)** | Romie, serif | ~60px | 400 | 55.4px (0.92) | -1.56px (-0.026em) | Title case / tight line-height |
| **Typographic Highlight** | Romie, serif | 32px | 400 | 32px (1.0) | -0.32px | Italicized optical accent |
| **Body Paragraph** | Neue Montreal | 16px | 400 | 20px (1.25) | -0.32px | Sentence case |
| **Button Text** | Neue Montreal | 14px | 500 | 14px (1.0) | -0.32px | Title case |
| **Sub-Button Micro-Label** | Neue Montreal | 11px | 500 | 11px (1.0) | Normal | Sentence case, 75% opacity |

### The Optical Highlight System
A signature feature of Clarté is the typographic embedding of words inside sentences:
```html
A year ago, on the other side of the <span class="highlight">ocean</span>,
everything shifted into a <span class="highlight">new perspective</span>.
This book <span class="highlight">was born</span> from that.
```
This breaks visual monotony and adds immediate editorial authority.

---

## 3. Motion & Interaction Language

Clarté avoids gratuitous, flashy animations in favor of calibrated physical elegance:

### 1. Rolling Magnetic Buttons (`.primary-btn`)
Each button contains an internal dual-layer clone structure:
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
- **Resting state:** `.text` is at `translateY(0%)`, `.text--clone` is positioned at `translateY(100%)`.
- **Hover state:** `.text` slides up to `translateY(-100%)`, while `.text--clone` slides into view at `translateY(0%)`. The arrow performs an identical synchronized diagonal/horizontal translation.
- **Physics:** `transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`.

### 2. Line-by-Line Scroll Reveals (`.line-by-line`)
Headings and copy blocks are split into individual visual lines that reveal vertically with a slight rotation and opacity fade as the user scrolls into view.

### 3. Spatial WebGL Architecture
Clarté employs three distinct canvas viewports:
1. **Background Canvas (`.background-webgl`):** Fullscreen WebGL shader rendering fluid, caustic optical light refractions.
2. **Interactive 3D Object Canvas (`.book-3d`):** A physical 3D artifact in the viewport that rotates smoothly on user drag and cursor proximity.
3. **Experiential Gallery Canvas (`.gallery-canvas`):** Responsive viewport rendering interactive digital scenes.

---

## 4. Color, Lighting & Atmosphere

Clarté uses a dark backdrop (`rgb(0, 0, 0)`) with luminous light dispersion.  
**For Ostrum, this must be translated into an original LIGHT-FIRST world:**
- Instead of black with white light, Ostrum will use **Warm Alabaster Linen (`#FAF7F2`)**, **Pearl Porcelain (`#FCFAF7`)**, and **Misty Slate (`#F3F5F7`)** with **subtle warm optical refractions**, **terracotta ochre**, **nocturne indigo**, and **mountain sage** accents.
- Preserves the same luminous atmospheric depth without relying on dark mode or neon clichés.

---

## 5. Responsive Behavior

- **Desktop (1440px):** 1112px content container, 200px vertical gaps between sections, 40/60 asymmetrical splits.
- **Tablet (768px):** Containers scale fluidly to `padding: 0 40px`, section gaps reduce to 120px.
- **Mobile (375px–390px):**
  - Asymmetric columns stack vertically (3D canvas stacks below text).
  - Typography scales down fluidly (`clamp(32px, 7vw, 48px)` for display headings).
  - Touch-friendly tap targets (`min-height: 48px` on buttons).
  - Canvas render resolutions scale down to preserve 60fps on mobile GPUs.
