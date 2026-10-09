# Ostrum — 3D Signature Object Material Refinement Report

**Preview URL:** `http://localhost:3000/preview/ostrum-core`  
**Model:** Monyédre 360 Möbius Art Ribbon by Print3dburton (CC BY 4.0)  
**Status:** Preview Stage Complete &mdash; Awaiting Approval (Zero Section 02 Integration)

---

## 1. Executive Summary

This report documents the refinement of the 3D signature object at `/preview/ostrum-core`. The objective was to transform the raw/generic 3D Möbius ribbon into a bespoke, art-directed gallery sculpture specifically engineered for Ostrum's crimson atmospheric caustic environment.

Three distinct visual hypotheses were implemented and evaluated without touching the production homepage or Section 02:
1. **Variation A — Ostrum Pearl** (Timeless architectural alabaster porcelain)
2. **Variation B — Crimson Porcelain** (Bespoke blush/crimson ceramic glaze &mdash; *Recommended*)
3. **Variation C — Sculptural Satin** (Understated tactile limestone/sandstone)

---

## 2. MCPs and Skills Applied

| Tool / Skill | Application in This Session |
| :--- | :--- |
| **Context7 MCP** (`resolve-library-id`, `query-docs`) | Resolved official Three.js r186 docs for `MeshPhysicalMaterial`, tuning transmission, sheen, clearcoat, attenuation color, and ACESFilmic tone mapping. |
| **Playwright MCP** (`browser_navigate`, `browser_evaluate`, etc.) | Automated rendering across 3 variations, 7 rotation angles ($0^\circ, 45^\circ, 90^\circ, 135^\circ, 180^\circ, 270^\circ, 360^\circ$), close-up camera framing, and responsive viewport checks (1440px, 1024px, 390px). |
| **21st.dev MCP** & **Inspo MCP** | Researched editorial 3D studio portfolio presentation patterns and lighting separation against rich atmospheric backdrops. |
| **Frontend UI Engineering Skill** | Built accessible comparison UI with keyboard focus rings, ARIA labels, clean presentation mode, and zero developer controls covering the sculpture. |
| **Modern Web Guidance Skill** | Optimized WebGL canvas memory lifecycle, procedural micro-noise texture generation, and zero layout shift. |
| **Code Review & Quality Skill** | Verified that Hero, Section 02, and all downstream production components remain 100% untouched. |

---

## 3. The Three Material Variations: Technical Specification

```typescript
// Summary of material and lighting differences

// VARIATION A: Ostrum Pearl
{
  baseColor: '#f6f0e4',
  roughness: 0.34,
  clearcoat: 0.40,
  transmission: 0.22,
  sheenColor: '#fcecd4', // Champagne edge highlights
  keyLight: '#fff7ee' (2.2),
  rimLight: '#ff4d30' (1.8), // Restrained red rim separation
  hemiBounce: '#220404'
}

// VARIATION B: Crimson Porcelain (Recommended)
{
  baseColor: '#f7eee8',
  roughness: 0.26,
  clearcoat: 0.58, // Polished ceramic glaze
  transmission: 0.18,
  iridescence: 0.16, // Mother-of-pearl lustre
  sheenColor: '#ff755d', // Muted crimson grazing angle scatter
  keyLight: '#fff5ed' (2.3),
  rimLight: '#ff3b20' (2.4), // Rich crimson edge definition
  hemiBounce: '#360505',
  ambientFill: '#ff9c50' (0.55) // Gentle warm fold definition
}

// VARIATION C: Sculptural Satin
{
  baseColor: '#ede3d4',
  roughness: 0.46, // Matte stone response
  clearcoat: 0.15,
  transmission: 0.08,
  sheenColor: '#eedbc2', // Sandstone edge
  keyLight: '#fff2e2' (2.1),
  rimLight: '#ff5a3c' (1.5),
  hemiBounce: '#1c0303'
}
```

---

## 4. Key Improvements from Previous Version

1. **Eliminated the Sci-Fi Glowing Core**:
   - The artificial point light at `(0, 0, 0)` that made the sculpture look like a glowing reactor orb was replaced by an art-directed studio lighting rig (Directional Key Light from upper left, soft Hemisphere ground bounce from the crimson floor, and a crisp Rim Light behind-right).
2. **Eliminated Flat Plastic Look**:
   - Injected a procedural 128×128 micro-noise texture into the `roughnessMap`, giving the surface realistic microscopic roughness variation.
3. **True Environmental Belonging**:
   - The grazing sheen and rim lights now inherit Ostrum's signature crimson tones (`#ff755d` / `#ff3b20`), making the object feel naturally embedded in the crimson caustics rather than pasted on top.
4. **100% Transparent Canvas & Zero Black Box**:
   - Canvas renders with `alpha: true`, `clearColor: 0x000000, 0`, seamlessly revealing the continuous background caustics.
5. **Clean Presentation Mode**:
   - Added a one-click toggle to hide all studio controls, letting the sculpture stand completely unobstructed.

---

## 5. Visual Artifacts & Screenshot Registry

All captured artifacts are stored in `rebuild-capture/ostrum-core-materials/`:

- **Side-by-Side Composite**: `side-by-side-comparison.png`
- **Clean Presentation Mode**: `presentation-mode-clean.png`
- **Variation A (Ostrum Pearl)**:
  - Full Stage: `var-a-full-stage.png`
  - Front ($0^\circ$): `var-a-front-0deg.png`
  - 3/4 View ($45^\circ$): `var-a-three-quarter-45deg.png`
  - Side Profile ($90^\circ$): `var-a-side-90deg.png`
  - 3/4 Reverse ($135^\circ$): `var-a-three-quarter-rev-135deg.png`
  - Back View ($180^\circ$): `var-a-back-180deg.png`
  - Opposite Profile ($270^\circ$): `var-a-opp-side-270deg.png`
  - Full Loop ($360^\circ$): `var-a-loop-360deg.png`
  - Close-Up: `var-a-close-up.png`
- **Variation B (Crimson Porcelain)**:
  - Full Stage: `var-b-full-stage.png`
  - Front ($0^\circ$): `var-b-front-0deg.png`
  - 3/4 View ($45^\circ$): `var-b-three-quarter-45deg.png`
  - Side Profile ($90^\circ$): `var-b-side-90deg.png`
  - 3/4 Reverse ($135^\circ$): `var-b-three-quarter-rev-135deg.png`
  - Back View ($180^\circ$): `var-b-back-180deg.png`
  - Opposite Profile ($270^\circ$): `var-b-opp-side-270deg.png`
  - Full Loop ($360^\circ$): `var-b-loop-360deg.png`
  - Close-Up: `var-b-close-up.png`
- **Variation C (Sculptural Satin)**:
  - Full Stage: `var-c-full-stage.png`
  - Front ($0^\circ$): `var-c-front-0deg.png`
  - 3/4 View ($45^\circ$): `var-c-three-quarter-45deg.png`
  - Side Profile ($90^\circ$): `var-c-side-90deg.png`
  - 3/4 Reverse ($135^\circ$): `var-c-three-quarter-rev-135deg.png`
  - Back View ($180^\circ$): `var-c-back-180deg.png`
  - Opposite Profile ($270^\circ$): `var-c-opp-side-270deg.png`
  - Full Loop ($360^\circ$): `var-c-loop-360deg.png`
  - Close-Up: `var-c-close-up.png`
- **Responsive Viewports**:
  - Desktop 1440×900: `viewport-desktop-1440.png`
  - Tablet 1024×768: `viewport-tablet-1024.png`
  - Mobile 390×844: `viewport-mobile-390.png`

---

## 6. Build & Browser Test Results

- **Next.js Production Build (`npm run build`)**: Pass (0 errors, 0 warnings, static routes 6/6 compiled).
- **Playwright Navigation & Console Audit**: Pass (0 console errors, 0 console warnings).
- **Responsive Viewport Verification**:
  - Desktop (1440px): 0 horizontal overflow, centered 3D stage, accessible controls.
  - Tablet (1024px): 0 horizontal overflow, fluid scaling.
  - Mobile (390px): Clean header clearance below fixed navbar, touch-safe controls, pointer tilt automatically disabled.

---

## 7. Strict Scope Confirmation

- **Hero Section**: Untouched.
- **Section 02 (The Ostrum Engine)**: Untouched.
- **Section 03+ and downstream pages**: Untouched.
- **Production Homepage (`app/page.tsx`)**: Untouched.
- **Global Theme & Typography**: Untouched.
- **Integration Status**: Zero integration has occurred. Everything remains isolated within `/preview/ostrum-core`.

---

## 8. Final Success Criteria Checklist

- [x] Three material variations rendered.
- [x] Original ribbon geometry preserved.
- [x] Materials fit Ostrum's crimson theme.
- [x] No black backdrop or unwanted overlay.
- [x] No gothic or generic AI-orb appearance.
- [x] Silhouette remains identifiable throughout rotation.
- [x] Preview controls work (angles, scrubbing, framing, clean mode).
- [x] Desktop and mobile inspected.
- [x] Production homepage remains untouched.
- [x] Screenshots and comparison report created.
- [x] **No integration has occurred. Awaiting user approval.**
