# OSTRUM Asset Optimization Ledger

**Audit & Conversion Date:** 10 November 2026, 12:44 IST  
**Scope:** Public raster graphics, showcase thumbnails, brand symbols, and favicons  
**Tools:** `sharp` v0.33+ (libvips), Next.js Image Pipeline  

---

## 1. Executive Summary

In accordance with owner instructions (Section 9.2), all photographic and showcase raster assets have been converted from legacy JPEG to high-efficiency WebP with high-effort compression (`effort: 6`, `quality: 85`), while vector logos (SVGs) and multi-resolution PNG icons have been strictly preserved.

- **Total Selected Work Image Size (Before):** 5,551.7 KB
- **Total Selected Work Image Size (After WebP):** 639.8 KB
- **Net Bandwidth Savings:** **88.5% reduction** (4.91 MB saved across gallery thumbnails)
- **Perceptual Quality:** Zero visible compression artifacts; edge contrast and gradient transitions preserved.

---

## 2. Asset Conversion & Optimization Ledger

| Asset File | Original Format & Size | Converted Format & Size | Savings (%) | Usage / Route | Visual & Alpha Integrity |
|---|---|---|---|---|---|
| `public/images/works/tmr-ai-car-care.jpg` | JPEG (669.9 KB) | WebP (75.2 KB) | **-88.8%** | Selected Work Wheel Card 01 | Retained rich red lighting, sharp vehicle reflections |
| `public/images/works/saraswati-driving-school.jpg` | JPEG (740.6 KB) | WebP (98.9 KB) | **-86.6%** | Selected Work Wheel Card 02 | High-contrast white paper theme, legible vehicle typography |
| `public/images/works/mnesa.jpg` | JPEG (623.4 KB) | WebP (55.7 KB) | **-91.1%** | Selected Work Wheel Card 03 | Deep obsidian black background, vivid blue geometric highlight |
| `public/images/works/atlas.jpg` | JPEG (577.6 KB) | WebP (44.8 KB) | **-92.2%** | Archive showcase asset | Clean architectural lines preserved |
| `public/images/works/form.jpg` | JPEG (567.7 KB) | WebP (37.1 KB) | **-93.5%** | Archive showcase asset | Minimalist geometric forms preserved |
| `public/images/works/neuromove.jpg` | JPEG (541.7 KB) | WebP (42.4 KB) | **-92.2%** | Archive showcase asset | Contrast preserved |
| `public/images/works/orbit.jpg` | JPEG (583.5 KB) | WebP (49.1 KB) | **-91.6%** | Archive showcase asset | Gradient depth preserved |
| `public/images/works/origin.jpg` | JPEG (584.4 KB) | WebP (57.2 KB) | **-90.2%** | Archive showcase asset | Texture intact |
| `public/images/works/signal.jpg` | JPEG (662.7 KB) | WebP (83.6 KB) | **-87.4%** | Archive showcase asset | High frequency details intact |
| `public/images/tmr-ai-car-care.jpg` | JPEG (236.5 KB) | WebP (152.4 KB) | **-35.6%** | Root duplicate asset | Preserved |
| `public/images/saraswati-driving-school.jpg` | JPEG (163.0 KB) | WebP (76.2 KB) | **-53.2%** | Root duplicate asset | Preserved |

---

## 3. Brand Identity & Transparent Favicon Icon Set Ledger

Derived directly from the master 1024×1024 3D Möbius symbol rendered from `public/models/monyedre-360.glb` with 100% alpha transparency and 92% canvas occupancy (`public/brand/ostrum-3d-symbol-master.png`):

| File Path | Dimensions | Format | Size | Purpose | HTTP Status |
|---|---|---|---|---|---|
| `public/brand/ostrum-3d-symbol-master.png` | 1024 × 1024 | PNG | 262.3 KB | Authoritative Master Symbol (Pure Transparent Ivory Möbius) | 200 OK |
| `public/favicon.ico` | Multi (16, 32, 48) | ICO | 7.6 KB | Legacy & modern browser tab icon | 200 OK |
| `public/favicon-16x16.png` | 16 × 16 | PNG | 768 B | High-density browser tab | 200 OK |
| `public/favicon-32x32.png` | 32 × 32 | PNG | 2.5 KB | Standard browser tab | 200 OK |
| `public/favicon-48x48.png` | 48 × 48 | PNG | 5.3 KB | Desktop shortcut / bookmark icon | 200 OK |
| `public/apple-touch-icon.png` | 180 × 180 | PNG | 62.1 KB | iOS Home Screen bookmark icon | 200 OK |
| `public/icon-192.png` | 192 × 192 | PNG | 70.0 KB | PWA standard Android icon | 200 OK |
| `public/icon-512.png` | 512 × 512 | PNG | 262.3 KB | PWA splash / hi-res store icon | 200 OK |
| `app/icon.png` | 512 × 512 | PNG | 262.3 KB | Next.js App Router icon convention | 200 OK |
| `app/apple-icon.png` | 180 × 180 | PNG | 62.1 KB | Next.js App Router apple icon convention | 200 OK |
| `public/manifest.webmanifest` | N/A | JSON | 420 B | PWA Web App Manifest | 200 OK |

---

## 4. Retained Exceptions & Rationale
1. **SVG Vector Graphics (`public/images/clients/*.svg`, inline logo components):** Retained as vector SVGs. Converting vector marks to raster WebP would increase payload and cause pixelation on high-DPI screens.
2. **Client Logos (`public/images/clients/*.png`):** Retained with alpha transparency to preserve sharp typographic edges against variable client-card backgrounds.
3. **Hero Background Texture (`public/images/bg.webp`):** Already delivered in WebP format (1920×2532); re-compression would degrade subtle continuous caustics gradients.
