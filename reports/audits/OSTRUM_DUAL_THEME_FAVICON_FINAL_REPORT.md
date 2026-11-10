# OSTRUM Dual-Theme Favicon Final Audit & Resolution Report

**Audit Date:** 10 November 2026  
**Repository:** `Balashanmugam30/Ostrum`  
**Git Branch:** `main`  
**Authoritative Verdict:** **PASS ✓ (RESOLVED & VERIFIED)**

---

## 1. Executive Summary & Root Cause Diagnosis

### The Issue
In Google Chrome on Windows, the website favicon in the browser tab bar exhibited conflicting behavior:
1. Chrome previously rendered a dark circular emblem badge (`app/icon.png` / `icon-512.png`) or displayed an identical sculpture asset across both light and dark browser chrome themes, ignoring the media queries in `app/layout.tsx`.

### Root Cause Analysis
Two compounding mechanisms caused this conflict:
1. **Next.js File-Based Metadata Route Convention:** Next.js App Router automatically treats files named `app/icon.(png|ico|svg)` and `app/apple-icon.(png|ico)` as dynamic metadata route icons. It was injecting an unconditioned `<link rel="icon" href="/icon.png?<hash>" type="image/png" sizes="512x512">` directly into the document `<head>`.
2. **Generic Unconditioned Fallback Precedence:** In `app/layout.tsx`, `metadata.icons` included generic unconditioned fallbacks (`favicon.ico`, `favicon-32x32.png`, `icon-192.png`, `icon-512.png`). Because `/icon-512.png` had a declared size of `512x512` without a media restriction, Chromium's icon picker selected the highest-resolution unconditioned icon or cached it aggressively, overriding the theme-conditioned tags.

---

## 2. Implemented Resolution

1. **Eliminated Competing Unconditioned Icons:**
   - Deleted `app/icon.png` and `app/apple-icon.png` to stop Next.js from injecting unconditioned favicon tags into `<head>`.
   - Removed unconditional icons from `metadata.icons.icon` in `app/layout.tsx`.
   - Retained `/apple-touch-icon.png` exclusively in `icons.apple` and kept `/icon-192.png` / `/icon-512.png` exclusively inside `public/manifest.webmanifest` for PWA installation (preventing them from polluting `<head>` icon links).
2. **Versioned v3 Assets Generated from 3D Model:**
   - Script `scripts/render_hero_sculpture_favicon.mjs` re-rendered the 3D Möbius sculpture from `public/models/monyedre-360.glb` using Chromium WebGL with ACES Filmic tone mapping.
   - Tight trim and centered padding at exactly **96% silhouette occupancy** on transparent alpha backgrounds:
     - `public/favicon-light-v3.png`: 48×48 px, Deep Burgundy / Oxblood (`#580f0c`, RGB: 83, 13, 16).
     - `public/favicon-dark-v3.png`: 48×48 px, Bright Ivory / Champagne (`#f7eee8`, RGB: 204, 194, 186).
     - `public/favicon.ico`: multi-resolution static fallback (16, 32, 48) for legacy user agents hitting `/favicon.ico` directly.
3. **Strict Two-Tag Server `<head>` Emission:**
   - In `app/layout.tsx`:
     ```ts
     icons: {
       icon: [
         {
           url: '/favicon-light-v3.png',
           media: '(prefers-color-scheme: light)',
           type: 'image/png',
           sizes: '48x48',
         },
         {
           url: '/favicon-dark-v3.png',
           media: '(prefers-color-scheme: dark)',
           type: 'image/png',
           sizes: '48x48',
         },
       ],
       apple: [
         {
           url: '/apple-touch-icon.png',
           sizes: '180x180',
           type: 'image/png',
         },
       ],
     }
     ```
   - Emits exactly two versioned, media-conditioned icon links in the HTML `<head>`:
     ```html
     <link rel="icon" href="/favicon-light-v3.png" media="(prefers-color-scheme: light)" type="image/png" sizes="48x48"/>
     <link rel="icon" href="/favicon-dark-v3.png" media="(prefers-color-scheme: dark)" type="image/png" sizes="48x48"/>
     <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" type="image/png"/>
     ```

---

## 3. Automated Playwright Verification Evidence

Automated headless Chromium tests (`scripts/test_dual_theme_favicon_playwright.mjs` and `scripts/verify_authoritative_release.mjs`) verified:

| Test Gate | Condition | Active Asset | Non-Transparent Color | Verdict |
|---|---|---|---|---|
| Light Chrome Tab Bar | `colorScheme: 'light'` | `/favicon-light-v3.png` | `rgb(83, 13, 16)` (Deep Burgundy) | **PASS ✓** |
| Dark Chrome Tab Bar | `colorScheme: 'dark'` | `/favicon-dark-v3.png` | `rgb(204, 194, 186)` (Bright Ivory) | **PASS ✓** |
| DOM Icon Isolation | HTML `<head>` | 2 media links only | 0 unconditioned icon links | **PASS ✓** |
| Static Asset Availability | HTTP GET `/favicon-light-v3.png` | HTTP 200 `image/png` | 48×48 px | **PASS ✓** |
| Static Asset Availability | HTTP GET `/favicon-dark-v3.png` | HTTP 200 `image/png` | 48×48 px | **PASS ✓** |

### Visual Artifacts Generated
- `reports/audits/artifacts/playwright/simulated-chrome-tab-light.png`
- `reports/audits/artifacts/playwright/simulated-chrome-tab-dark.png`
- `reports/audits/artifacts/favicon-visual-proof-sheet.png`
