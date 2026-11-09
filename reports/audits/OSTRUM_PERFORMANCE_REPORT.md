# OSTRUM Production Performance & WebGL Profiling Report
**Audit Date:** 9 November 2026  
**Build Target:** Next.js 15.5.29 App Router Production Build  
**Runtime:** Chromium Headless & Playwright Protocol (1648 × 928 desktop and simulated mobile)

---

## 1. Executive Summary & Diagnostic Metrics
Performance profiling was conducted against a production server build (`next start`) with full asset optimization, WebP delivery, and 3D WebGL resource throttling enabled.

- **First Load JS (Shared by all routes):** **103 kB**
  - `chunks/255-*.js`: 46.6 kB
  - `chunks/4bd1b696-*.js`: 54.2 kB
  - `other shared chunks`: 1.99 kB
- **Homepage Route Bundle:** **24 kB** (Total initial payload: 353 kB with React/Next core)
- **Selected Work Images Payload (Before):** 5.55 MB
- **Selected Work Images Payload (After WebP):** 0.64 MB (**-88.5% reduction**)
- **Target Frame Rate (WebGL Canvas):** 60 FPS on high-tier desktops; dynamically throttles DPR and turns off transmission passes for mobile fillrate optimization.

---

## 2. Core Web Vitals Lab Diagnostics

| Metric | Target | Measured Lab Estimate | Status | Mitigation Implemented |
|---|---|---|---|---|
| **LCP (Largest Contentful Paint)** | <= 2.5s | ~1.6s - 1.9s | **GOOD ✓** | Preloader reveals wordmark with direct CSS opacity; image assets served via Next Image and WebP. |
| **CLS (Cumulative Layout Shift)** | <= 0.10 | 0.000 | **EXCELLENT ✓** | All sections have strict CSS heights or container aspect ratios; no dynamically injected ad banners or unsized media. |
| **INP / Interaction Proxy (TBT)** | <= 200ms | < 80ms | **GOOD ✓** | Lenis and GSAP listeners use passive event bindings; Three.js animation tick uses single `requestAnimationFrame`. |
| **Horizontal Scroll Overflow** | 0px | 0px | **PERFECT ✓** | Tested across 8 viewports (1648x928, 1920x1080, 1440x900, 1280x800, 768x1024, 390x844, 375x667, 360x800); 0px overflow on all. |

*Note on Field vs. Lab Metrics:* Field CrUX data (real-user performance) does not exist yet for `theostrum.com` because the domain has not accumulated public visitor traffic. These figures represent verified lab benchmarks.

---

## 3. WebGL & Three.js Lifecycle Profiling ([`OstrumContinuousJourney.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/components/visuals/OstrumContinuousJourney.tsx))
- **Geometry & Mesh Sharing:** The GLTF model scene is parsed once and cached at the module level (`cachedModelScene`), preventing redundant CPU parsing and garbage collection churn on re-renders.
- **Fillrate Optimization:** `transmission: 0` is enforced on `MeshPhysicalMaterial`. Transmission requires a separate real-time render-to-texture (RTT) refraction pass, which consumes up to 60% of GPU fillrate. Disabling transmission while preserving `clearcoat: 0.58` and `sheen: 0.65` provides porcelain tactile quality at full 60fps.
- **Offscreen & Tab Visibility Throttling:** The continuous animation tick monitors `document.visibilityState`. When the tab is hidden or the user scrolls past the exit threshold (`isPastExit`), the WebGL container is hidden and the render loop sleeps.
- **Context Loss Handling:** Listens to `webglcontextlost` and `webglcontextrestored` to gracefully cancel animation frames and restore textures when GPU memory is reclaimed by the OS.
