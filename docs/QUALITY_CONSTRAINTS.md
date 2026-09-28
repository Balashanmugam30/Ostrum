# Ostrum — Quality Constraints & Operational Quality Contract

> **Status:** RATIFIED & ENFORCED (Phase 00 Foundation)  
> **Applicability:** All subsequent implementation phases (Phase 01 through Phase 10)  
> **Enforcement:** Automated CI Quality Gates • Pre-Commit Hooks • Peer Review  

---

## 1. The Quality Contract Overview

This document represents an **unbreakable quality contract** for the engineering and design of the Ostrum digital platform. No future implementation phase is permitted to weaken, bypass, or comment-out these constraints to achieve rapid completion. Any pull request violating these directives will be rejected.

---

## 2. Category Constraints Matrix

### A. User Experience (UX) Constraints
1. **Unambiguous Primary CTA:** The primary conversion action (`Start a Project ↗`) must remain discoverable within 1 viewport height at all times across all screen widths.
2. **Predictable Navigation:** Navigation structures must never trap focus, hijack scroll coordinates unexpectedly, or obscure content behind un-dismissable overlays.
3. **Mobile Parity:** Mobile users must have access to the exact same information hierarchy, capability definitions, and contact mechanisms as desktop users. No critical content may be "hidden on mobile."
4. **Instant Form Feedback:** Every form control must provide immediate, accessible visual feedback on focus, input, validation error, and submission progress.

### B. Visual Design Constraints
1. **Strict Light-First Paradigm:** All primary layouts must be built on the approved light architectural palette (`#FBFBFC` canvas, `#FFFFFF` surfaces, `#0E1017` obsidian text). Dark mode, if implemented later, must never be the default landing experience.
2. **Absolute Ban on Cyberpunk & Neon Overload:** Neon purple, electric cyan, glowing wireframes, matrix code rain, and faux-hacker terminals are strictly prohibited.
3. **No Uncalibrated Gradients:** Gradients are restricted to subtle atmospheric background vignettes with opacities under 8%. No rainbow or high-saturation gradient fills on buttons or cards.
4. **Token Consistency:** Hardcoded hex values or arbitrary pixel spacing values in component files are forbidden. Every color, gap, padding, and border radius must reference an established design token.

### C. Motion & Animation Constraints
1. **Zero Layout Shifts:** No animation may alter document flow or cause Cumulative Layout Shift (CLS target: `< 0.05`). All motion must animate compositor-friendly properties (`transform`, `opacity`, `clip-path`).
2. **No Perpetual Distraction:** Infinite looping animations are restricted exclusively to slow, low-contrast background tickers. No flashing, pulsing, or rotating elements in the main reading view.
3. **Strict Reduced-Motion Adherence:** If `@media (prefers-reduced-motion: reduce)` is active, all transitions and animations must collapse to instantaneous static displays (`duration: 0.01ms`).
4. **Scroll Sanity:** Scroll animations must never interfere with standard OS momentum scrolling, spacebar navigation, or page down/up keys.

### D. Accessibility Constraints (WCAG 2.2 Level AA Standard)
1. **Minimum Contrast Standards:**
   - Normal text (< 18px / < 14px bold): Minimum **4.5:1** contrast ratio (Ostrum target: > 6:1).
   - Large text (≥ 18px / ≥ 14px bold): Minimum **3:1** contrast ratio.
   - Interactive components and borders: Minimum **3:1** contrast against adjacent canvas.
2. **Keyboard Operability:** Every interactive element (links, buttons, pills, toggles, form fields) must be fully navigable and operable via standard keyboard controls (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow Keys`).
3. **High-Visibility Focus Rings:** Focusable elements must display a crisp, high-contrast focus indicator (`2px solid #0A4DDE` with `2px offset`). CSS rules containing `outline: none` without an accompanying `:focus-visible` replacement are banned.
4. **Touch Target Size:** Interactive elements on touchscreens must maintain a minimum touch target bounding box of **44px x 44px**.
5. **Semantic Hierarchy:** Pages must use correct HTML5 landmarks (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`) with exactly one `<h1>` per route and logical sequential heading increments (`<h2>` followed by `<h3>`, never skipping levels).

### E. Performance Constraints
1. **Core Web Vitals Thresholds:**
   - **LCP (Largest Contentful Paint):** `< 1.2 seconds` on 4G mobile.
   - **INP (Interaction to Next Paint):** `< 100 milliseconds`.
   - **CLS (Cumulative Layout Shift):** `< 0.05`.
2. **JavaScript Payload Budget:** Initial gzip JavaScript bundle size must not exceed **90 KB**. Heavy libraries (3D canvas engines, complex charting suites) must be dynamically imported via `next/dynamic` only when scrolled into view.
3. **Image Optimization:** All photographic assets must be served via `next/image` in modern WebP or AVIF formats with explicit `width`, `height`, and responsive `sizes` attributes. Vector graphics must be optimized SVG.
4. **Font Loading Hygiene:** Web fonts (`Plus Jakarta Sans`, `Inter`, `Newsreader`, `JetBrains Mono`) must use `next/font/google` with `display: swap` and preconnect directives to eliminate layout shift and flash of invisible text (FOIT).

### F. Engineering & Code Integrity Constraints
1. **Strict TypeScript:** No `@ts-ignore`, `@ts-expect-error` (without an accompanying issue link), or indiscriminate `any` types. TypeScript must compile under `strict: true`.
2. **Zero Hardcoded Secrets:** API keys, database connection strings, webhook secrets, and private tokens must never be committed to Git. All secrets reside in `.env.local` (git-ignored) and production environment vaults.
3. **Dependency Discipline:** No new external npm package may be introduced without written justification in the pull request. Prefer platform-native APIs and composable lightweight primitives.
4. **Component Modularization:** Any component file exceeding 250 lines of code must be refactored into smaller, composable sub-components.

### G. Content & Brand Integrity Constraints
1. **Zero Fabricated Social Proof:** Never publish invented client logos, stock-photo testimonials, synthetic review stars, or fabricated metric statistics.
2. **Truthful Placeholders:** Until verified client case studies are formally cleared for release, use clearly designated architectural benchmarks and capability models.
3. **No Agency Buzzword Fluff:** Banned phrases (*disruptive synergy, passionate innovators, one-stop shop*) must be caught in editorial code reviews.
