# OSTRUM Logo & Dual-Theme Favicon Master Architecture Report

**Audit Date:** 10 November 2026  
**Target Repository:** `Balashanmugam30/Ostrum`  
**Master Assets:**  
- `public/brand/ostrum-3d-symbol-dark.png` (Ivory / Soft Silver on 100% Transparent Alpha)  
- `public/brand/ostrum-3d-symbol-light.png` (Deep OSTRUM Burgundy on 100% Transparent Alpha)  
- `public/brand/ostrum-3d-symbol-master.png` (1024×1024 Master)  
**Proof Artifacts:**  
- `reports/audits/artifacts/favicon-visual-proof-sheet.png`  
- `reports/audits/artifacts/playwright/favicon-dual-theme-proof.png`  

---

## 1. Problem Analysis & Owner Findings

In previous revisions:
1. The favicon symbol was deemed too small (occupying only 92% of canvas with loose borders).
2. On light-themed operating systems and browser tabs (e.g. Chrome Light Mode with `#F1F3F4` tab bar), the ivory/white symbol lost contrast against the pale chrome.
3. The owner requested:
   - **Dark browser theme:** Bright ivory, porcelain, or soft-silver sculpture on a 100% transparent background.
   - **Light browser theme:** Deep OSTRUM burgundy / oxblood sculpture on a 100% transparent background.
   - **Tighter framing:** Object silhouette filling **~96% of canvas** with safe antialiasing padding.
   - **Next.js Metadata Integration:** Native `(prefers-color-scheme: dark)` and `(prefers-color-scheme: light)` media declarations.

---

## 2. Definitive Solution: Dual-Theme Deterministic 3D WebGL Renders

### 2.1 Authoritative 3D Source Asset
Both variants are generated directly from the identical production 3D asset powering the hero:
- **Geometry Asset:** `public/models/monyedre-360.glb` (116,726 triangles, 61,238 vertices).
- **Exact Camera & Orientation:**
  - `pivotGroup.rotation.x = 0.20`, `pivotGroup.rotation.z = -0.05`, `pivotGroup.rotation.y = 0.0` (Hero 'O' docking rotation).
  - Perspective camera with `fov: 34`, framed tightly for **96.0% pixel occupancy** (`trimmed: 929x829` scaled to 96% of 1024px canvas).
  - WebGL `alpha: true`, `setClearColor(0x000000, 0)` (100% transparent alpha, zero opaque plates or background boxes).

### 2.2 Dark Theme Variant (Bright Ivory on Transparent)
- **Shader Material:** Ivory/Porcelain Physical Material (`color: #f7eee8`, `roughness: 0.24`, `metalness: 0.06`, `clearcoat: 0.60`, `sheenColor: #ffdcd8`, `specularColor: #ffffff`).
- **Lighting Rig:** Key light (`#fff7ee`, 2.5), Ambient (`#fdeddc` / `#220404`), Ruby rim (`#ff4d30`, 2.0), Fill (`#ffebd8`, 0.55).
- **Tab Target:** Dark OS / browser chrome (`#1F1F1F`). Shines crisply with clean luminous highlights.

### 2.3 Light Theme Variant (Deep Burgundy on Transparent)
- **Shader Material:** Deep OSTRUM Oxblood/Burgundy Physical Material (`color: #580f0c`, `roughness: 0.28`, `metalness: 0.14`, `clearcoat: 0.72`, `sheenColor: #8a1e1a`, `specularColor: #ffffff`).
- **Lighting Rig:** Key light (`#fff5f2`, 3.0), Ambient (`#ffded8` / `#2b0404`, 1.2), Accent rim (`#ff765e`, 2.8), Warm fill (`#e09088`, 0.85).
- **Tab Target:** Light OS / browser chrome (`#F1F3F4` / `#FFFFFF`). Stands out with bold burgundy silhouette and defined 3D sculptural folds.

---

## 3. Theme-Aware Next.js Metadata Integration

In `app/layout.tsx`, icons are configured with browser-standard media queries:

```ts
icons: {
  icon: [
    { url: '/favicon-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
    { url: '/favicon-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}
```

Generated HTML `<head>` tags:
- `<link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" type="image/png" />`
- `<link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" type="image/png" />`
- `<link rel="icon" href="/favicon.ico" sizes="any" />`

---

## 4. Complete Derivative Asset Inventory

| Asset Path | Theme / Format / Size | Purpose | HTTP Status |
|---|---|---|---|
| `public/brand/ostrum-3d-symbol-dark.png` | Dark / PNG 1024×1024 | Master Ivory 3D render (96% occupancy) | 200 OK |
| `public/brand/ostrum-3d-symbol-light.png` | Light / PNG 1024×1024 | Master Burgundy 3D render (96% occupancy) | 200 OK |
| `public/brand/ostrum-3d-symbol-master.png` | Neutral / PNG 1024×1024 | Authoritative brand symbol master | 200 OK |
| `public/favicon-dark.png` | Dark / PNG 32×32 | Tab icon for dark browser chrome | 200 OK |
| `public/favicon-light.png` | Light / PNG 32×32 | Tab icon for light browser chrome | 200 OK |
| `public/favicon-dark-16x16.png` | Dark / PNG 16×16 | Standard DPI dark tab icon | 200 OK |
| `public/favicon-light-16x16.png` | Light / PNG 16×16 | Standard DPI light tab icon | 200 OK |
| `public/favicon-dark-32x32.png` | Dark / PNG 32×32 | Retina dark tab icon | 200 OK |
| `public/favicon-light-32x32.png` | Light / PNG 32×32 | Retina light tab icon | 200 OK |
| `public/favicon.ico` | Multi-res ICO (16/32/48) | Fallback for legacy browsers/bookmarks | 200 OK |
| `public/apple-touch-icon.png` | PNG 180×180 | Apple iOS home screen icon | 200 OK |
| `public/icon-192.png` | PNG 192×192 | Android PWA icon | 200 OK |
| `public/icon-512.png` | PNG 512×512 | PWA splash icon | 200 OK |
| `public/manifest.webmanifest` | JSON Manifest | PWA application manifest | 200 OK |

---

## 5. Visual Proof Sheet Verification

The visual proof sheet at `reports/audits/artifacts/favicon-visual-proof-sheet.png` confirms:
1. **Dark Browser Chrome (`#1F1F1F`):** Tested at 16px, 32px, 48px, 96px, 180px. Ivory physical material provides immediate luminous definition.
2. **Light Browser Chrome (`#F1F3F4`):** Tested at 16px, 32px, 48px, 96px, 180px. Deep burgundy material contrasts sharply against light backgrounds.
3. **96% Silhouette Occupancy:** Negative margins trimmed cleanly, maximizing visual prominence in browser tabs without clipping antialiased edges.
