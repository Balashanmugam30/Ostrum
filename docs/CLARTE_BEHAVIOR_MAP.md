# Clarté Reference Interaction & Behavior Map

> **Reference URL:** https://clarte.page/  
> **Inspection Date:** October 2026  
> **Purpose:** Exhaustive behavioral specification of reference interactions, motion curves, scroll dynamics, and event handling, paired with Ostrum's production implementation rules.

---

## 1. Section-by-Section Behavioral Breakdown

### Chapter 01: Global Navigation (`header.header`)
- **Visual Presentation:** Fixed floating bar at `top: 24px`, width `1068px` (centered in 1440px viewport).
- **DOM Hierarchy:** Flex container with left-aligned brand indicator / language switcher (`EN — FR`) and right-aligned action trigger.
- **Scroll Behavior:** Remains fixed or fades out gently on downward scroll, reappearing on upward scroll.
- **Backdrop:** Completely transparent at scroll top; accumulates subtle glass blur (`backdrop-filter: blur(12px)`) once scrolled.
- **Ostrum Implementation:** Translucent architectural navigation bar with warm alabaster glass (`rgba(250, 247, 242, 0.85)`), live availability indicator (`● ACCEPTING SELECT ENGAGEMENTS`), direct link triggers, and high-contrast rolling action pill.

---

### Chapter 02: The Hero Statement (`section.intro`)
- **Visual Presentation:** Fullscreen opening sequence (`1116 × 732px`).
- **Background Layer:** Fullscreen WebGL caustics mesh shader continuously calculating fluid optical distortion.
- **Typography:** Sentence-case narrative opening in structural sans (`16px`, `line-height: 1.2`, `letter-spacing: -0.02em`).
- **Entrance Animation:** Line-by-line reveal where copy lines emerge sequentially with a subtle `translateY(12px)` and opacity fade-in over `0.8s` with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Primary CTA:** Centered or left-aligned rolling pill button with an 11px micro-descriptor positioned beneath (`margin-top: 8px`).
- **Ostrum Implementation:** Art-directed studio hero with optical prism caustics canvas, monumental headline with embedded `Instrument Serif` optical accent word, dual-layer rolling CTA pill (`Start a Project`), and micro-descriptor (`Direct Founder & Technical Lead Consultation`).

---

### Chapter 03: The Artifact Stage (`section.book-infos`)
- **Vertical Spacing:** **`margin-top: 200px`** — an uncompromising spatial pause that establishes dramatic focus.
- **Layout Architecture:** 40 / 60 Asymmetrical Split:
  - **Left Column (40%):**
    - Chapter label (`font-size: 14px`, uppercase or sentence case).
    - Monumental display heading in serif (`font-size: 60.45px`, `line-height: 0.92`, `letter-spacing: -1.56px`).
    - Body paragraph in neutral sans (`16px`, `line-height: 1.25`, `letter-spacing: -0.02em`).
    - Dedicated rolling action trigger (`Order the book →`).
  - **Right Column (60%):**
    - Interactive 3D WebGL viewport (`391 × 521px`).
    - Interactive behavior: Responds to pointer down + drag across X/Y axes with natural inertia and friction decay (`friction = 0.92`).
    - Hover behavior: Subtle floating bob (`sin(t * 0.002) * 8px`) when idle.
- **Ostrum Implementation:** Architecture Core stage (`ThreeDArtifact.tsx`) featuring an interactive 3D mathematical polyhedron representing the interconnected Ostrum System (Design · Engineering · AI · Operations) rotating smoothly with pointer drag and touch support.

---

### Chapter 04: The Experiential Space (`section.gallery`)
- **Vertical Spacing:** **`margin-top: 200px`**.
- **Layout Architecture:** Wide-aspect interactive canvas (`1116 × 732px`) framed by chapter headline and contextual description.
- **Behavior:** Interactive exploration canvas allowing visitors to switch between different project contexts or digital environments.
- **Ostrum Implementation:** Systems Architecture Sandbox (`SystemSandbox.tsx`) where visitors test live simulated workflows (School Admissions, Retail Inventory POS, B2B Deal Pipelines) with live event triggers, visual workflow paths, and real-time event logs.

---

### Chapter 05: The Climactic Perspective Statement (`section.footer-cta`)
- **Vertical Spacing:** `padding-top: 120px`, `padding-bottom: 120px`.
- **Typography:** Large-scale narrative synthesis (`32px`, `line-height: 1.0`, `letter-spacing: -0.32px`).
- **Embedded Optical Serif:** Key emotive phrases are wrapped in `<span class="highlight">` styled with high-contrast serif italics (`Romie` -> `Instrument Serif`).
- **Action Inversion:** High-contrast inverted rolling pill button (`theme--white` on dark, or deep charcoal `#161514` on warm alabaster linen) with sub-label.
- **Ostrum Implementation:** Monumental studio invitation (*“Ready to build software that makes your business run smoother?”*) with optical serif italics, direct interactive Project Brief intake, and direct founder contact.

---

### Chapter 06: Epilogue & Minimalist Footer (`footer.footer`)
- **Vertical Spacing:** Quiet bottom anchor.
- **Content:** Minimalist links (`Instagram — Contact — Privacy — Terms`), copyright notice (`© 2026 Ostrum Studio`), and secondary rolling action trigger.
- **Ostrum Implementation:** Architectural footer with clean grid alignment, legal guarantees (100% IP ownership, zero lock-in), social links, and live local studio time indicator.

---

## 2. Micro-Interaction Physics Specification

| Interaction | Trigger | Target Properties | Timing Function | Duration | Resting Value | Active / Hover Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rolling Button Text** | Mouse Enter | `transform: translateY` | `cubic-bezier(0.16, 1, 0.3, 1)` | `0.4s` | `.text`: `0%`<br>`.text--clone`: `100%` | `.text`: `-100%`<br>`.text--clone`: `0%` |
| **Rolling Button Arrow** | Mouse Enter | `transform: translate(x, y)` | `cubic-bezier(0.16, 1, 0.3, 1)` | `0.4s` | `.arrow`: `(0, 0)`<br>`.arrow--clone`: `(-100%, 100%)` | `.arrow`: `(100%, -100%)`<br>`.arrow--clone`: `(0, 0)` |
| **3D Artifact Drag** | Pointer Move (Down) | `rotationX, rotationY` | Direct tracking + inertial decay | Real-time | Orbiting slowly at `0.003 rad/frame` | Drag velocity added to momentum; decay factor `0.94` |
| **Line Reveal** | Intersection Observer (`threshold: 0.15`) | `opacity, transform` | `cubic-bezier(0.16, 1, 0.3, 1)` | `0.75s` | `opacity: 0, translateY(16px)` | `opacity: 1, translateY(0px)` |
| **Glass Card Hover** | Pointer Enter | `box-shadow, border-color, transform` | `cubic-bezier(0.16, 1, 0.3, 1)` | `0.35s` | `border: rgba(0,0,0,0.06)`, `y: 0` | `border: rgba(0,0,0,0.14)`, `y: -3px` |
