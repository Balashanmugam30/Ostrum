# Clarté Full-Page Reconstruction Structure Map

> **Reference URL:** https://clarte.page/  
> **Status:** RATIFIED & GROUND TRUTH ESTABLISHED  

---

## Complete Scene-by-Scene Architectural Map

```text
REFERENCE: Clarté
↓
SECTION 01: Global Floating Header (`header.header`)
↓
PURPOSE: Minimalist persistent navigation and language toggle (`EN — FR`)
↓
LAYOUT: `position: fixed; top: 1.5rem; right: 1.5rem; width: calc(100% - 48px); z-index: 50; display: flex; justify-content: flex-end;` (switches to `space-between` with logo when scrolled)
↓
MEDIA: Minimalist SVG wordmark `CLARTÉ`
↓
TYPOGRAPHY: `Neue Montreal` 14px / 16px, uppercase language codes with opacity toggle (0.5 inactive, 1.0 active)
↓
MOTION: Smooth opacity and color transition, mix-blend-mode difference on white surfaces
↓
INTERACTION: Clicking `FR` or `EN` triggers full site language switch via reactive state
↓
TRANSITION: Seamless sticky persistence with zero layout shift
```

```text
REFERENCE: Clarté
↓
SECTION 02: Monumental Hero Narrative (`section.intro`)
↓
PURPOSE: Establish cinematic emotional focus and introduce the core literary statement
↓
LAYOUT: `display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100svh; position: relative; width: 100%;`
↓
MEDIA: Fullscreen fixed background caustics (`images/bg.webp` + WebGL); monumental SVG logo `CLARTÉ` (`viewBox="0 0 1253 360"`)
↓
TYPOGRAPHY:
- Giant SVG wordmark spanning 85vw
- Narrative subtitle: `Neue Montreal` 16px, line-height 1.2, tracking -0.02em, text-align center
- Button label: 14px medium, micro-sublabel 11px
↓
MOTION:
- Differential letter parallax: `C` (0.1), `L` (0.3), `A` (0.75), `R` (0.75), `T` (0.3), `É` (0.1)
- Line-by-line reveal of introductory text
- Dual-layer rolling button on hover (0.4s cubic-bezier(0.38, 0.005, 0.215, 1))
↓
INTERACTION: Primary CTA button opens book order modal / smooth scrolls; hover rolls text and clips white background
↓
TRANSITION: Natural downward scroll into Section 03 with 200px breathing space
```

```text
REFERENCE: Clarté
↓
SECTION 03: The Artifact Showcase (`section.book-infos`)
↓
PURPOSE: Introduce the physical book object through an interactive 3D WebGL model
↓
LAYOUT: `display: flex; justify-content: space-between; gap: 5rem; margin-top: 12.5rem (200px); padding: 0 15vw;` (stacks on mobile with `margin-top: 7.5rem; padding: 0 1.5rem;`)
↓
MEDIA: Interactive 3D WebGL Canvas (`.book-3d canvas`, Three.js r172, 327px × 672px)
↓
TYPOGRAPHY:
- Display H2: `Romie, serif` 60.45px, line-height 55.61px (0.92 ratio), tracking -1.56px
- Body: `Neue Montreal` 16px, line-height 20px, tracking -0.32px
- Action Button: `Neue Montreal` 14px
↓
MOTION:
- 3D physical book rotates smoothly on pointer drag across X and Y axes with rotational inertia and friction decay
- Floating gentle vertical bobbing when idle
- Line-by-line reveal on text when scrolled into viewport
↓
INTERACTION: Pointer down + drag orbits book in 3D space; click "Order the book →" triggers purchase flow
↓
TRANSITION: 200px vertical breathing room before Section 04
```

```text
REFERENCE: Clarté
↓
SECTION 04: The Experiential Space (`section.gallery`)
↓
PURPOSE: Showcase the 6 digital generative experiences extending the book
↓
LAYOUT: `position: relative; margin-top: 12.5rem (200px); width: 100%;`
↓
MEDIA: Full-width interactive 3D WebGL fan canvas (`.gallery-canvas canvas`, Three.js r172) displaying 6 interactive digital cards
↓
TYPOGRAPHY:
- Section H2: `Neue Montreal` / Display serif 32px–44px
- Subtitle: 16px, line-height 1.2
- Interactive hint: 11px uppercase monospace / sans
↓
MOTION:
- 3D fan cards curve, tilt, and fan out in perspective based on mouse cursor coordinate or touch scroll
- Active experience card elevates on hover/focus
↓
INTERACTION: Hovering across the canvas shifts perspective; clicking a chapter focuses the digital experience
↓
TRANSITION: Seamless vertical scroll into Section 05
```

```text
REFERENCE: Clarté
↓
SECTION 05: Climactic Perspective Statement (`section.footer-cta`)
↓
PURPOSE: Deliver the narrative synthesis and emotional conclusion
↓
LAYOUT: `display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 7.5rem 0;`
↓
MEDIA: Dark luminous backdrop with subtle ambient light gradient
↓
TYPOGRAPHY:
- Monumental statement H2: 32px (desktop) / 24px (mobile), centered
- Optical serif highlights: `<span class="highlight">` in `Romie, serif` italics inside `Neue Montreal` sans
- Micro-sublabel: 11px
↓
MOTION: High-contrast white rolling button (`theme--white`) reverses hover colors (white to black text) with rolling clone layers
↓
INTERACTION: Direct click triggers modal order checkout
↓
TRANSITION: Leads directly into the footer visual monument
```

```text
REFERENCE: Clarté
↓
SECTION 06: Epilogue & Monumental Footer (`footer.footer`)
↓
PURPOSE: Atmospheric closure, social links, and grand visual finale
↓
LAYOUT: `position: relative; width: 100%; min-height: 732px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;`
↓
MEDIA:
- Glowing center floral flame image (`images/footer.webp`)
- Monumental SVG wordmark `CLARTÉ` spanning the full bottom width
↓
TYPOGRAPHY:
- Navigation: `Instagram — Contact` (14px)
- Copyright: `© 2026` (14px)
- Colossal vector logo spanning 100vw
↓
MOTION: Floating magnetic button pinned inside the center of the giant logo
↓
INTERACTION: Links open external channels; rolling button triggers order
↓
TRANSITION: Page terminal boundary
```
