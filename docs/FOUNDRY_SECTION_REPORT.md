# OSTRUM — SECTION 02: OSTRUM FOUNDRY
## 2.5D Artifact Experience & Venture Studio Model Report

**Date:** October 8, 2026  
**Section Under Test:** `02 / OSTRUM FOUNDRY` (First section immediately following the Hero)  
**Status:** Complete, Audited & Verified  

---

## 1. Section Purpose & Business Architecture

This section is **not a conventional "About" page**. It introduces the second pillar of Ostrum's dual identity:

1. **Enterprise Technology Partner:** Ostrum engineers high-leverage software, automation, and digital infrastructure for existing ambitious companies to help them grow.
2. **Venture Studio & Product Lab (Ostrum Foundry):** When a critical solution does not exist in the real world, Ostrum identifies the problem, explores the opportunity, designs the experience, engineers the technology, validates with users, and launches independent products and ventures. Promising initiatives may receive dedicated studio operating and development backing from Ostrum.

### Core Manifesto:
> *"Ostrum builds for businesses. Ostrum also builds what doesn't exist yet."*

---

## 2. Rendered Copy (English & French)

### English (`content/messages.ts`):
- **Index & Kicker:** `02 / OSTRUM FOUNDRY` · `TECHNOLOGY · DESIGN · VENTURES`
- **Headline:**
  - Line 1: `We don't only build for businesses.`
  - Line 2: `We build what *doesn't exist yet.*` *(featuring Romie italic serif highlight)*
- **Supporting Statement:**
  > *"We partner with ambitious companies to solve complex operational challenges. And when a critical solution doesn't yet exist in the market, we build it ourselves — taking original ideas from first observation to production software and independent ventures."*
- **The 5-Step Foundry Model:**
  - `01 FIND` — Real problems worth solving.
  - `02 VALIDATE` — Talk to people. Test the need before building.
  - `03 BUILD` — Design the product. Engineer the technology.
  - `04 LAUNCH` — Put it in the real world with immediate feedback loops.
  - `05 BACK` — Support promising ideas with product, people, and operating depth. Selected initiatives may receive dedicated studio backing.
- **CTA & Micro-Label:**
  - Button: `Explore the studio →` (with magnetic hover mechanics)
  - Sublabel: `ORIGINAL VENTURES & COLLABORATIVE LABS`
  - Flip Hint: `(Inspect dossier back)`

### French (`fr`):
- **Index & Kicker:** `02 / OSTRUM FOUNDRY` · `TECHNOLOGIE · DESIGN · VENTURES`
- **Headline:**
  - `Nous ne construisons pas seulement pour les entreprises.`
  - `Nous concevons ce qui *n'existe pas encore.*`
- **Supporting Statement:**
  > *"Nous accompagnons les entreprises ambitieuses dans leurs défis technologiques. Et lorsqu'une solution essentielle n'existe pas sur le marché, nous la construisons nous-mêmes — de l'idée originelle jusqu'au produit déployé et aux ventures indépendantes."*
- **The 5-Step Foundry Model:**
  - `01 TROUVER` — Des problèmes réels qui méritent d'être résolus.
  - `02 VALIDER` — Échanger avec les usagers. Valider le besoin avant de construire.
  - `03 CONSTRUIRE` — Concevoir le produit. Développer une technologie robuste.
  - `04 LANCER` — Mettre le produit dans le monde réel avec des boucles de retour.
  - `05 SOUTENIR` — Apporter compétences produit, équipe et exécution. Les initiatives sélectionnées peuvent recevoir un soutien direct d'Ostrum.
- **CTA:** `Découvrir le studio →`

---

## 3. Artifact Concept & 2.5D Physical Illusion (Zero 3D Engine)

Per instructions, **no Three.js, React Three Fiber, WebGL, or GLTF packages were used for this artifact**. The physical publication is rendered via an advanced multi-layered 2.5D CSS perspective architecture (`components/ui/Dossier25D.tsx`).

### Asset Creation:
1. **Front Cover Artwork (`/images/foundry-dossier-front.webp`, fallback `.png`):**
   - Deep obsidian hardcover linen texture.
   - Hot-foil debossed crimson `OSTRUM` and cream `FOUNDRY`.
   - Subtitle: `VENTURE DOSSIER · VOL 01`.
   - Fine architectural blueprint grid debossed across the lower half.
   - Micro-sequence: `PROBLEM · IDEA · BUILD · LAUNCH`.
2. **Back Cover Artwork (`/images/foundry-dossier-back.webp`, fallback `.png`):**
   - Matching obsidian linen texture.
   - Hot-foil debossed: `POWERED BY OSTRUM` in crisp white and `TECHNOLOGY · DESIGN · VENTURE STUDIO` in crimson.
   - Intricate sacred geometry & technical diagram.
   - Epilogue: `INDEPENDENT LABS & COLLABORATIVE VENTURES`.

### 2.5D Layer Stack & Physics:
1. **Front Cover (`translateZ(11px)`):** Includes specular sheen gradient reflection that dynamically sweeps across the linen fabric as angle changes.
2. **Volumetric Slices (`7 layers`):** Spaced between `-9px` and `+8px` with tone darkening (`#101014` to `#141418`) to form a physical paper block interior.
3. **Left Spine Plane (Physical 3D Plane):** `22px` wide, rotated `-90deg` around Y, textured with leather/linen gradient and debossed horizontal binding bands.
4. **Right Pages Edge (Physical 3D Plane):** `22px` wide, rotated `+90deg` around Y, textured with ribbed parchment paper gradient (`repeating-linear-gradient`).
5. **Top & Bottom Paper Edges:** `22px` high, rotated `±90deg` around X.
6. **Back Cover (`rotateY(180deg) translateZ(11px)`):** Reverse face showing `POWERED BY OSTRUM`.
7. **Dynamic Floor Shadow:** Realistic floor contact ellipse that dynamically skews, scales, and shifts opacity as the dossier rotates.
8. **Ambient Caustic Wash:** Diffused crimson glow (`rgba(215,35,35,0.18)`) centered behind the folio.

---

## 4. Interaction Engine

### Scroll-Driven Rotation:
Using an efficient `requestAnimationFrame` lerp loop with damped interpolation (`lerpFactor = 0.085`):
- **Entry (`progress 0.0 – 0.35`):** Starts in an editorial 3/4 perspective (`rotateY: -22°` to `-8°`, `rotateX: 4°` to `2°`).
- **Primary Reading Zone (`progress 0.35 – 0.65`):** Smoothly transitions to front-facing (`rotateY: -8°` to `+2°`), ensuring pristine legibility of all title and metadata typography.
- **Process Review (`progress 0.65 – 0.90`):** Rotates to reveal depth and thickness (`rotateY: +2°` to `+24°`, `rotateX: 0°` to `-3°`).
- **Exit (`progress 0.90 – 1.0`):** Settles gracefully toward `14°`.

### Interactive Direct Flip:
- Visitors can click the folio or tap the interactive pill button (`[ ↺ 01 FRONT · OSTRUM FOUNDRY | 02 BACK · POWERED BY OSTRUM ]`).
- This adds `+180°` to the Y rotation, smoothly turning the dossier around in 3D space to expose the back cover.

### Desktop Pointer Tracking:
- Subtle mouse tilt contribution: `±3.5°` on Y axis and `±2.5°` on X axis.
- Damped with the RAF loop; automatically disabled on touch/mobile devices (`pointer: coarse`).

### Accessibility & Reduced Motion:
- Fully compliant with `prefers-reduced-motion: reduce`: locks the artifact into a static, elegant 3/4 perspective (`rotateY: -14deg, rotateX: 2deg`) with zero scroll or pointer animation.
- All artifact DOM nodes have `role="button"` and `aria-label="Ostrum Foundry Dossier folio. Click or tap to inspect reverse."`.
- All textual and process content is semantic HTML (`h2`, `p`, `button`).

---

## 5. Playwright Cross-Viewport Audit Matrix

Every target viewport was audited with automated headless Playwright checks for rendering, scroll transforms, 3D flip mechanics, and horizontal overflow:

| Viewport | Dimensions | Dossier 2.5D | Flip Test | Horizontal Overflow | Console Errors | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop 1440** | 1440 × 900 | Active, 3D lerp | Rotated 180° | Free (`1440px / 1440px`) | 0 | **PASS** |
| **Desktop 1280** | 1280 × 800 | Active, 3D lerp | Passed | Free (`1280px / 1280px`) | 0 | **PASS** |
| **Desktop 1024** | 1024 × 768 | Active, 3D lerp | Passed | Free (`1024px / 1024px`) | 0 | **PASS** |
| **Tablet 768** | 768 × 1024 | Stacked layout | Passed | Free (`768px / 768px`) | 0 | **PASS** |
| **Mobile 390** | 390 × 844 | Stacked, large folio | Passed | Free (`390px / 390px`) | 0 | **PASS** |
| **Mobile 375** | 375 × 812 | Stacked, no clipping | Passed | Free (`375px / 375px`) | 0 | **PASS** |
| **Reduced Motion** | 1440 × 900 | Static 3/4 view | Supported | Free (`1440px / 1440px`) | 0 | **PASS** |

### Verified Screenshots:
- `rebuild-capture/desktop/ostrum-1440-foundry.png`
- `rebuild-capture/desktop/ostrum-1440-foundry-flipped.png`
- `rebuild-capture/tablet/ostrum-768-foundry.png`
- `rebuild-capture/mobile/ostrum-390-foundry.png`

---

## 6. Definition of Done Checklist

- [x] Hero section remains completely untouched.
- [x] Section follows the reference visual composition philosophy.
- [x] No actual 3D engine is used (Zero Three.js/WebGL in this section).
- [x] PNG/WebP is used as the primary physical artifact.
- [x] Artifact visually reads as a physical object with realistic thickness.
- [x] Depth created with 7 stacked offset layers, 3D spine, and parchment page blocks.
- [x] Front / Back illusion works seamlessly (`OSTRUM FOUNDRY` & `POWERED BY OSTRUM`).
- [x] Scroll controls rotation smoothly via RAF lerp loop.
- [x] Pointer interaction is subtle and desktop-only.
- [x] Mobile layout stacks cleanly with prominent artifact and zero clipping.
- [x] `prefers-reduced-motion` locks to static 3/4 view.
- [x] Zero horizontal overflow across all viewports (`1440` down to `375`).
- [x] Section introduces `02 / OSTRUM FOUNDRY`.
- [x] Both sides of Ostrum clearly explained (business infrastructure + venture creation).
- [x] 5-step model (`FIND`, `VALIDATE`, `BUILD`, `LAUNCH`, `BACK`) rendered editorially.
- [x] Funding/support language is future-safe and accurate.
- [x] No reference branding or unauthorized reference assets reused.
- [x] Headless Playwright QA passes across 6 viewports with 0 errors.
- [x] Next.js production build (`npm run build`) passes cleanly.
- [x] Changes committed to git and pushed to `origin/main`.
- [x] Working tree clean.

**STOPPED AFTER SECTION 02 AS INSTRUCTED.**
