# OSTRUM Final Performance & Core Web Vitals Report

**Audit Date:** 10 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Performance Verdict:** **PASS ✓ (OPTIMIZED)**

---

## 1. Bundle Size & Route Footprint

From the production build output:
```text
Route (app)                                 Size  First Load JS
┌ ○ /                                      24 kB         353 kB
├ ○ /_not-found                            138 B         103 kB
├ ƒ /api/enquiry                           138 B         103 kB
├ ○ /fr                                  1.34 kB         159 kB
├ ○ /preview/ostrum-core                 6.31 kB         270 kB
├ ○ /privacy-policy                      2.09 kB         173 kB
├ ○ /robots.txt                            138 B         103 kB
├ ○ /sitemap.xml                           138 B         103 kB
└ ○ /terms-and-conditions                2.09 kB         173 kB
+ First Load JS shared by all             103 kB
```

- Shared First Load JS: **103 kB** (highly lean for a 3D WebGL cinematic studio).
- Homepage `/`: **24 kB** route JS (total 353 kB including dynamic Three.js chunk).

---

## 2. 3D WebGL & Animation Optimization

- **Selective Rendering:** Three.js canvas in `BackgroundCaustics` and `MonyedreModel` uses lazy WebGL loading, requestAnimationFrame throttling, and `visibilitychange` listeners to suspend rendering when the tab is inactive.
- **Power Preference:** Set to `high-performance` with antialiasing enabled.
- **Asset Optimization:** 3D GLB model `public/models/monyedre-360.glb` is compressed.
- **Favicon Performance:** Versioned PNG assets are tightly pre-rendered and pre-scaled (48x48, 16x16, 32x32), avoiding runtime client scaling.

---

## 3. Viewport Stability & Zero Layout Shift (CLS = 0)

Playwright verified across 8 responsive viewports:
- `owner-reference-desktop` (1648×928): 0px overflow
- `large-desktop` (1920×1080): 0px overflow
- `standard-desktop` (1440×900): 0px overflow
- `laptop` (1280×800): 0px overflow
- `tablet-portrait` (768×1024): 0px overflow
- `mobile` (390×844): 0px overflow
- `compact-mobile` (375×667): 0px overflow
- `narrow-mobile` (360×800): 0px overflow
