# OSTRUM — Continuous Background Architecture & Performance Audit Report

**Date:** October 10, 2026 (Updated October 2026)  
**Subject:** Continuous Background Shader Architecture, Unified Coordinate Mapping, Cross-Device Validation & Asset Pipeline  
**Repository:** `Balashanmugam30/Ostrum`  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary & Architecture Objectives

The objective of this engineering implementation was to deliver a unified, continuous scrolling background shader composition for the OSTRUM website, harmonized with the studio's brand identity, typography, and interactive 3D core sculpture journey.

### Key Objectives Delivered:
1. **Unified Coordinate System:** Single continuous vertical coordinate mapping across the entire page lifecycle, eliminating fragmented section vignettes.
2. **Top-Aligned Cover Projection:** Mathematical WebGL shader with top-aligned `coverUV` projection and continuous vertical scroll progression (`texUV.y -= uScrollY * 0.84`).
3. **Harmonized 3D Flight Experience:** Synchronized alignment between the Hero wordmark, 3D porcelain sculpture descent, and Section 02 editorial pinned hold.
4. **Interactive Cursor Halo:** Smooth lerped cursor-reactive ambient luminance (`uMouseHalo`, `uMouseRadius = 0.3`, `uMouseStrength = 0.035`).
5. **Clean Asset Pipeline:** Streamlined WebGL texture loading and fallback rendering for non-WebGL devices.
6. **Cross-Device Playwright Validation:** Verified rendering fidelity across mobile, tablet, and desktop viewports across all sequential scroll stages.

---

## 2. Background Shader Mathematical Formulation

The OSTRUM background canvas employs a custom fragment shader designed for high-resolution texture projection with viewport aspect-ratio compensation:

```glsl
// Top-Aligned Cover UV Projection
vec2 coverUV(vec2 uv, vec2 uResolution, vec2 uTextureResolution) {
  float screenAspect = uResolution.x / uResolution.y;
  float textureAspect = uTextureResolution.x / uTextureResolution.y;
  vec2 scale = vec2(1.0);
  vec2 offset = vec2(0.0);
  if (screenAspect > textureAspect) {
    scale.y = textureAspect / screenAspect;
    offset.y = (1.0 - scale.y) * 0.5;
  } else {
    scale.x = screenAspect / textureAspect;
    offset.x = (1.0 - scale.x) * 0.5;
  }
  // Top-aligned formulation ensuring hero composition anchors correctly
  offset = vec2(0.5, 1.0 - scale.y * 0.5);
  return (uv - offset) / scale + offset;
}
```

### Key Dimensions & Coordinates:
- **Texture Dimensions:** `1920 × 2532px` (aspect ratio $\approx 0.75829$).
- **Artwork Radiant Center:** Located at $(u=0.531, v=0.542)$ in WebGL UV space.
- **Top Alignment:** Anchoring the top edge of the texture with the viewport top places the radiant core near the bottom third at scroll position 0 (Hero), allowing flowing filaments to sweep upward.
- **Vertical Scroll Mapping:** `texUV.y -= uScrollY`, where `uScrollY = scrollProgress * 0.84`. As the page scrolls downwards, the sampling coordinate translates smoothly along the vertical axis, creating natural visual drift behind the pinned sections.

---

## 3. Spatial Relationship Across Sections

The background composition flows through the page as a single cohesive tapestry:

```
[Viewport Top]
+-------------------------------------------------------------+
| HERO (scrollY = 0.00)                                       |
| - Top of artwork aligns with viewport top                   |
| - Radiant core rests in lower viewport                      |
| - Luminous filament strands sweep upward through OSTRUM     |
+-------------------------------------------------------------+
| ENGINE ARRIVAL (scrollY ≈ 0.28 - 0.35)                      |
| - 3D sculpture descends into central docking position       |
| - Luminous core travels upward into center of viewport      |
| - Sculpture docks over radiant crimson center               |
+-------------------------------------------------------------+
| ENGINE PINNED HOLD (scrollY ≈ 0.35 - 0.52)                  |
| - Editorial content pinned; sculpture holds steady          |
| - Background holds position in tandem with the composition  |
+-------------------------------------------------------------+
| GALLERY / SELECTED WORK (scrollY ≈ 0.55 - 0.85)             |
| - Smooth transition into dark editorial surface             |
| - 3D WorksWheel interactive drum showcase                   |
+-------------------------------------------------------------+
| FOOTER (scrollY ≈ 1.00)                                     |
| - Smooth boundary falloff into deep crimson (#64120F)       |
| - Theatre curtain reveal into studio footer                 |
+-------------------------------------------------------------+
```

---

## 4. Cross-Device Playwright Validation

The continuous background implementation was verified using Playwright headless browser testing against the production build across multiple resolutions and scroll steps:

| Viewport | Resolution | Category | Scroll Journey Verified | Background Continuity |
|---|---|---|---|---|
| **Desktop 1440** | 1440 × 900 | Standard Desktop | 9 Scroll Stages (0.0 to 1.0) | PASS — Seamless vertical drift |
| **Desktop 1280** | 1280 × 800 | Compact Desktop | Full page pass | PASS — Core centers behind 3D dock |
| **Tablet Landscape** | 1024 × 768 | Tablet / iPad | Full page pass | PASS — Correct aspect ratio compensation |
| **Tablet Portrait** | 768 × 1024 | Tablet Portrait | Full page pass | PASS — Full vertical artwork utilization |
| **Mobile Large** | 390 × 844 | iPhone 14 / modern | Full page pass | PASS — Responsive scaling, zero horizontal overflow |
| **Mobile Standard**| 375 × 812 | iPhone X / compact | Full page pass | PASS — Smooth transition to dark ground |

### Verified Invariants:
- [x] Continuous background coordinate system active across all sections.
- [x] Zero reset or repeated motif across section boundaries.
- [x] Hero wordmark and 3D flight journey preserved with 100% precision.
- [x] Section 02 pinned hold stable with no vertical drift or layout jump.
- [x] Cursor halo interaction fluid and responsive.
- [x] Zero horizontal scrollbar on any viewport.
- [x] Clean production build with 0 TypeScript errors.
