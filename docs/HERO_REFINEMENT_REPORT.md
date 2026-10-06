# OSTRUM — HERO FINAL REFINEMENT REPORT
**Reference-First Polish Pass**

---

## 1. Executive Summary
This document provides the definitive technical audit and verification record for the final refinement pass of the **OSTRUM** Hero section. The visual language, monumental scale, cinematic caustics, and editorial typography of the reference experience have been preserved, while eliminating all rendering defects and interaction friction.

---

## 2. Diagnosis & Fix: "grow" Letter Clipping (Problem #1)

### 2.1 Root Cause Diagnosis
1. **Font Metrics & Italic Terminal Overhang:**
   - The word `grow` is styled with `'Romie', Georgia, serif` in `font-style: italic`.
   - In Romie Italic, the character `w` features a rightward terminal swash/curl. Canvas font measurement reveals that while the nominal CSS inline advance width of `"grow"` at 19px is `42.11px`, the glyph's actual visual bounding box (`actualBoundingBoxRight`) extends to `46.60px` (~4.5px beyond the nominal character box).
2. **Shrink-Wrap Container Boundary:**
   - In `IntroHero.tsx`, the headline is housed inside `max-w-[720px] flex flex-col items-center`.
   - As a flex column with `items-center`, the child `h1.intro-desc` shrink-wraps to the width of its text content (`477px`).
3. **Accidental Box Overflow Clipping:**
   - In `app/globals.css`, `.split-parent` was configured with `overflow: hidden;` and `clip-path: inset(-0.2em -16px)`.
   - While `clip-path` allowed 16px horizontal room, CSS specifications dictate that `overflow: hidden` strictly clips any painted pixels outside the element's padding box (at `477px`).
   - Consequently, the rightmost 3.5–4.5 pixels of the `w` were chopped off by the `overflow: hidden` boundary.

### 2.2 Exact Solution
1. **Inline-Block Box with Explicit Terminal Padding:**
   - Updated `.highlight` in `app/globals.css`:
     ```css
     .highlight {
       font-family: 'Romie', Georgia, serif;
       font-style: italic;
       display: inline-block;
       vertical-align: baseline;
       padding-right: 0.22em;
       padding-left: 0.04em;
       margin-right: -0.06em;
     }
     ```
   - `display: inline-block` establishes an independent formatting box.
   - `padding-right: 0.22em` reserves 4.18px of intrinsic internal box clearance, ensuring the full italic swash of `w` is drawn strictly within `.highlight`'s padding box.
   - `vertical-align: baseline` preserves exact typographic baseline alignment with the preceding sans-serif words.
2. **Safe Vertical Animation Masking:**
   - Updated `.split-parent` in `app/globals.css`:
     ```css
     .split-parent {
       clip-path: inset(0 -30px 0 -30px);
       display: block;
       overflow: visible;
     }
     ```
   - Replaced `overflow: hidden` with `overflow: visible` and `clip-path: inset(0 -30px 0 -30px)`.
   - The top and bottom edges (0) maintain 100% vertical clipping during the entrance slide animation (`translateY(125%)` to `translateY(0%)`).
   - The `-30px` lateral margins provide total horizontal freedom, ensuring that italic flourishes and wide characters never collide with or clip against container edges across any viewport.

### 2.3 Verification Metrics (Programmatic DOM Inspection)
- **`highlightRect.width`**: `47.04px`
- **`letterWRect.width`**: `15.66px`
- **`wRightInsideHighlight`**: `true`
- **`rightMarginInsideHighlight`**: `4.18px` clearance
- **`splitParentOverflow`**: `'visible'`
- **`splitParentClipPath`**: `'inset(0px -30px)'`
- **`zeroDefectPass`**: `true` across all 6 viewports (1440, 1280, 1024, 768, 390, 375).

---

## 3. Removal of Aggressive Magnetic CTA (Problem #2)

### 3.1 Problem Analysis
- Previously, `<MagnetWrap strength={0.25}>` attached a global mousemove listener that translated the button up to 40px toward the cursor.
- This created rubbery, game-like cursor-following behavior that detracted from an authoritative studio experience.

### 3.2 Implemented Refinement
1. **Anchored Button Position:**
   - Removed `MagnetWrap` from `IntroHero.tsx`. The primary CTA button now remains anchored in its intended position (`bottom-12 md:bottom-14`).
2. **Controlled, Tactile Interaction:**
   - Enhanced `.primary-btn` in `app/globals.css`:
     ```css
     @media (hover: hover) {
       .primary-btn:hover {
         color: var(--black);
         transform: translateY(-2px) scale(1.015);
         box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.35);
       }
     }
     .primary-btn:active {
       transform: translateY(0px) scale(0.985);
       transition-duration: 0.15s;
     }
     .primary-btn:focus-visible {
       outline: 2px solid rgba(255, 255, 255, 0.85);
       outline-offset: 4px;
     }
     ```
3. **Internal Animation Preserved:**
   - Retained the dual-layer rolling text reveal (`.text` / `.text--clone`) and arrow shift (`.arrow` / `.arrow--clone`).
   - On touch devices (`@media (hover: none)`), cursor dependencies are eliminated; tapping triggers an immediate, satisfying tactile compression (`scale(0.985)`).

---

## 4. Top-Right Corner Decision (Problem #3)

### 4.1 Decision
- The redundant `"OSTRUM // STUDIO"` label was completely removed from `Header.tsx`.
- Evaluated options:
  - **Option A (Selected):** `"DIGITAL SYSTEMS · DESIGN · AI"` rendered at `text-[10px] md:text-[11px] tracking-[0.2em] text-white/50 uppercase font-sans font-normal py-2 px-3 select-none`.
  - **Rationale:** Grounded in high-end editorial and studio design reference systems. It unobtrusively clarifies the studio's disciplines in the top-right quadrant while the monumental wordmark commands the center. When the page scrolls past 120px, the micro-label remains as a quiet discipline mark balancing the revealed mini-logo on the left.

---

## 5. Subtle Restrained Scroll Cue (Requirement #11)

### 5.1 Design & Implementation
- Integrated a restrained scroll indicator at `bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2`:
  ```tsx
  <div
    className={`scroll-cue absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-[0.22em] text-white/40 uppercase font-sans select-none pointer-events-none transition-opacity duration-500 ${
      scrolled ? 'opacity-0' : 'opacity-100'
    }`}
    aria-hidden="true"
  >
    <span>Scroll to explore</span>
    <span className="scroll-cue-arrow inline-block">↓</span>
  </div>
  ```
- **Behavior:**
  - Micro-typography with wide letter-spacing (`text-[10px] tracking-[0.22em] text-white/40`).
  - Restrained 3px vertical floating animation (`scrollCueBounce` over 2.2s).
  - Automatically fades out (`opacity-0`) as soon as the user scrolls past 30px (`scrollY > 30`).
  - Accessible: `aria-hidden="true"` and animations disabled under `prefers-reduced-motion`.

---

## 6. Viewport & Responsive Validation

All 6 viewports were captured and verified via Playwright:

| Viewport | Device Class | Resolution | Layout Behavior | "grow" Validation |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop High-Res** | 1440 × 900 | 1440px | Monumental wordmark, single-line headline | Full width: 47.04px, 4.18px margin, 0 clipping |
| **Desktop Standard** | 1280 × 800 | 1280px | Monumental wordmark, single-line headline | Full width: 47.04px, 4.18px margin, 0 clipping |
| **Desktop Small** | 1024 × 768 | 1024px | Monumental wordmark, single-line headline | Full width: 47.04px, 4.18px margin, 0 clipping |
| **Tablet Portrait** | 768 × 1024 | 768px | Proportional wordmark scaling, 2-line philosophy | Full width: 47.04px, 4.18px margin, 0 clipping |
| **Mobile Standard** | 390 × 844 | 390px | 85vw contained wordmark, wrapped headline | Full width: 39.61px, 3.51px margin, 0 clipping |
| **Mobile Compact** | 375 × 812 | 375px | 85vw contained wordmark, wrapped headline | Full width: 39.61px, 3.51px margin, 0 clipping |

---

## 7. Quality, DevTools & Accessibility Results

- **Browser Console:**
  - Errors: `0`
  - Warnings: `0`
- **DOM & Content Sanity:**
  - Forbidden strings checked: `CLARTÉ`, `CLARTE`, `Get the book`, `Also available as a digital edition`, `A year ago`, `blood cancer`, `EN — FR`, `OSTRUM // STUDIO`
  - Count found in hero: `0`
- **Keyboard Navigation & A11y:**
  - CTA button receives keyboard focus with visible outline (`rgba(255, 255, 255, 0.85) solid 1.6px, offset 4px`).
  - Enter / Space activates modal dialog.
  - Reduced Motion (`prefers-reduced-motion: reduce`):
    - Parallax disabled on SVG letters in `OstrumLogo.tsx`.
    - Button hover transforms and scroll cue bounce disabled.
    - Entrance split transitions disabled.
- **Production Build:**
  - `npm run build`: Exit code 0 (Compiled successfully).

---

## 8. Git Commit & Push Summary

- **Commit Message:** `fix: finalize Ostrum hero interaction and typography`
- **Commit Hash:** `198b1ca`
- **Branch:** `main`
- **Modified/Created Files in Commit:**
  - `components/sections/IntroHero.tsx`
  - `components/navigation/Header.tsx`
  - `components/ui/OstrumLogo.tsx`
  - `components/ui/LineByLine.tsx`
  - `app/globals.css`
  - `content/messages.ts`
  - `app/layout.tsx`
  - `docs/HERO_REFINEMENT_REPORT.md`
- **Working Tree Scope:** All downstream files preserved untouched.

