# Clarté Asset Forensics & Resource Inventory

> **Target Site:** https://clarte.page/  
> **Inspection Date:** October 2026  
> **Inspection Method:** Browser Performance Resource Timing & Network Inspection  

---

## 1. Network Asset Inventory

| Resource URI | Type | Role & Visual Usage | Dimensions / Size | Licensing Status | Ostrum Rebuild Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `images/bg.webp` | Image (WebP) | Fixed fullscreen dramatic red/crimson caustic light burst texture with grain noise | 1920 × 1080 (approx) | Protected visual artwork | Generate original high-resolution dark red/crimson radial caustic canvas texture with subtle grain and vignette |
| `images/book.webp` | Image (WebP) | Texture map for front cover of 3D physical book | 1024 × 1400 (approx) | Protected visual artwork | Original 3D book cover artwork featuring minimal typography and crimson flower burst |
| `images/book_normal.webp` | Image (WebP) | Normal bump map for Three.js 3D book cover lighting | 1024 × 1400 | Code texture | High-precision normal map calculated for 3D paper grain and emboss |
| `images/folder.webp` | Image (WebP) | Packaging sleeve / folder image for purchase modal | 800 × 1000 | Protected artwork | Clean original minimalist folder / packaging mockup |
| `images/teaser/xp-1.webp` to `xp-6.webp` | Images (WebP) | 6 generative chapter thumbnails displayed on the interactive 3D fan canvas | ~800 × 500 each | Protected artwork | 6 original digital art representations (red fluid wave, monochromatic light rays, crimson vortex, blue mist canvas, amber glow, luminous rebirth) |
| `images/footer.webp` | Image (WebP) | Centerpiece luminous glowing amber/coral lotus flower in footer | 1200 × 1200 | Protected photography | Original glowing atmospheric floral light graphic |
| `NeueMontreal-Regular.woff2` | Web Font | Primary UI, body copy, and structural grotesque sans | ~32 KB | Proprietary Pangram Foundry font | High-fidelity open-source equivalent (`Inter` / `Plus Jakarta Sans`) tuned with identical metrics (`-0.02em` tracking, 1.2 line height) |
| `NeueMontreal-Medium.woff2` | Web Font | Button labels and medium weights | ~32 KB | Proprietary Pangram Foundry font | Medium weight open-source sans equivalent |
| `RomieTrial-Regular.woff2` | Web Font | Display serif for titles and embedded optical highlights | ~35 KB | Proprietary Margot Lévêque font | Open-source `Instrument Serif` (Google Fonts SIL OFL) configured with identical vertical stress and tight tracking |
| `_i18n/.../en/messages.json` | JSON | Complete text strings, chapters, and button micro-copy | 4.5 KB | Site content | Extracted full content dictionary for 100% faithful reference experience reproduction |
| `_i18n/.../fr/messages.json` | JSON | Complete French translation dictionary | 4.8 KB | Site content | Extracted French content dictionary for functional language toggle |

---

## 2. Asset Integrity Policy

- Zero pirated code or decompiled commercial WebGL shaders.
- All 3D models and canvases are implemented natively using Three.js / Canvas 2D with original mathematical shaders.
- All typography loads via Next.js Google Fonts with zero licensing liability.
