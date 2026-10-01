# Clarté Live Reference Forensics Report

> **Target Site:** https://clarte.page/  
> **Inspection Date:** October 2026  
> **Methodology:** Live Chrome DevTools / Playwright headless browser inspection, performance network trace, and DOM extraction.  
> **Status:** RATIFIED & GROUND TRUTH ESTABLISHED  

---

## 1. Concrete Visual & Spatial Observations

1. **Atmosphere & Palette:**
   - Background is deep obsidian `#000000` overlaid with a fixed fullscreen texture (`background-webgl -static`) rendering a dramatic red/crimson caustic light burst (`images/bg.webp`) with grain noise.
   - Text is stark optic white `#FFFFFF`, with muted secondary labels at `rgba(255, 255, 255, 0.75)` and micro-copy at `rgba(255, 255, 255, 0.5)`.
   - The palette is dark, luminous, and cinematic—not light-first.

2. **Hero Structure (`section.intro`):**
   - Occupies exactly `100svh` (`100% viewport height`).
   - The monumental display logo `CLARTÉ` is rendered as an inline SVG spanning `viewBox="0 0 1253 360"`.
   - Each letter (`C`, `L`, `A`, `R`, `T`, `É`) is wrapped in a `<g class="letter" data-scroll data-scroll-speed="...">` tag with subtle differential scroll parallax (speeds: `0.1`, `0.3`, `0.75`, `0.75`, `0.3`, `0.1`).
   - Beneath the logo, the narrative introduction block (`.intro-desc`) appears centered:
     *"A year ago, I was told I had a rare chronic blood cancer. Since then, I've been trying to see things more clearly."*
     - Font: `Neue Montreal`, `16px`, `line-height: 1.2`, `letter-spacing: -0.02em`.
   - At the bottom center (`bottom: 2.875rem` / `46px`), the primary CTA pill button is pinned:
     - Text: *"Get the book →"*
     - Micro-sublabel: *"Also available as a digital edition"* (`font-size: 11px`, `color: rgba(255, 255, 255, 0.75)`).

3. **Global Navigation (`header.header`):**
   - Fixed at `top: 1.5rem` (24px), `right: 1.5rem` (24px), width `calc(100% - 48px)`.
   - On the homepage hero, it displays only the language toggle (`EN — FR`) right-aligned.
   - When scrolled or when a logo is active, it spans `justify-content: space-between` with a mini `CLARTÉ` SVG wordmark (width: `6.25rem` / 100px).
   - Language switcher uses text buttons with `opacity: 0.5` on inactive and `opacity: 1` on active (`.active`).

4. **Artifact Showcase (`section.book-infos`):**
   - Exact `margin-top: 12.5rem` (`200px`) on desktop (`padding: 0 15vw`).
   - Layout is an asymmetrical two-column showcase:
     - **Left Column:** Hosts an interactive 3D WebGL Canvas (`.book-3d canvas`) rendering a physical 3D hardcover book model (`327px × 672px`) responding to cursor drag with rotational inertia, specular highlights, and surface normal mapping (`book_normal.webp`).
     - **Right Column (`.book-content`):**
       - Monumental H2: *"An experiential book"* in `Romie, serif` (`60.45px`, tight line-height `55.61px`).
       - Paragraph: *"This project takes the form of a book. A book to read, but also to experience. Each chapter extends into a digital experience."* (`16px`, `Neue Montreal`).
       - Action Button: *"Order the book →"*.
   - On mobile (`max-width: 440px`), stacks vertically with `margin-top: 7.5rem` (120px) and `padding: 0 1.5rem`.

5. **Experiential Gallery (`section.gallery`):**
   - Exact `margin-top: 12.5rem` (`200px`).
   - Centered header:
     - H2: *"The Experiences"* (`h1` display scale).
     - Subtitle: *"Each chapter opens a digital space. To explore, feel, generate."*
   - Below header: A full-width interactive Three.js 3D fan canvas (`.gallery-canvas canvas`) displaying 6 chapter spaces:
     01: *First Signs*
     02: *The Wait*
     03: *The Verdict*
     04: *The Body*
     05: *The Return*
     06: *Clarity*
   - Interactive hints: *"Move your mouse"* / *"Click and hold"* on desktop; *"Touch the screen"* on mobile.

6. **Footer Perspective Statement (`section.footer-cta`):**
   - High-impact editorial text block with embedded optical serif highlights:
     *"A year ago, on the other side of the <span class="highlight">ocean</span>, everything shifted into a <span class="highlight">new perspective</span>. This book <span class="highlight">was born</span> from that."*
   - `.highlight` spans are set in `Romie, serif` italics inside `Neue Montreal` body sans (`font-size: 32px`).
   - Inverted white button: `theme--white` with black text and sub-label *"Also available as a digital edition"*.

7. **Footer Epilogue (`footer.footer`):**
   - Displays a luminous glowing orange/amber floral flame image (`images/footer.webp`).
   - Navigation links: *"Instagram — Contact"* on the left, *"© 2026"* on the right.
   - A gigantic monumental `CLARTÉ` SVG wordmark spans across the bottom edge.
   - Pinned in the center of the giant wordmark is a magnetic rolling pill button: *"Get the book →"*.

---

## 2. Motion & Interactive Physics

1. **Rolling Pill Button (`.primary-btn`):**
   - Resting state: `background: #000; color: #fff; border-radius: 4px; padding: 1rem; gap: 4rem;`.
   - Hover state: A white fill layer (`.bg`) clips down (`clip-path: inset(0)`), text turns black (`color: #000`), `.text` translates up `-100%`, and `.text--clone` slides from `100%` to `0%`.
   - Timing: `0.4s cubic-bezier(0.38, 0.005, 0.215, 1)`.

2. **Line-by-Line Narrative Reveal:**
   - Headings and body copy have `.line-by-line` with initial `opacity: 0` that reveal sequentially with upward translation and stagger.
