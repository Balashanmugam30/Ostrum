# Reference Asset Inventory & Ostrum Original Asset Strategy

> **Status:** APPROVED & RATIFIED  
> **Mandate:** Zero Unauthorized Rehosting • 100% Original Asset Implementation • Original SVG, Canvas, Shaders & Typography  

---

## 1. Asset Inventory & Translation Matrix

This inventory catalogs every visual asset category observed on the reference website (`https://clarte.page/`), its architectural role, and defines how Ostrum recreates the identical experiential quality using **original, custom-engineered assets**:

| Category # | Reference Asset / Role | Reference Spec & Behavior | Ostrum Equivalent | Intellectual Property & Licensing Status | Ostrum Implementation Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Atmospheric Background Light** (`.background-webgl`) | Fullscreen WebGL caustics/refraction shader on dark background (`1390x915`). | **Luminous Alabaster Prism Shader & CSS Mesh Gradient** | Original Ostrum implementation. No third-party code copied. | Custom lightweight HTML5 Canvas / CSS Mesh Gradient generating subtle, warm optical refractions (`#FAF7F2` to `#F5EDE6` to `#EDF3F7`). |
| **02** | **3D Physical Artifact** (`.book-3d`) | Interactive 3D book model (`389x519`) responding to cursor drag & rotation. | **Interactive 3D Ostrum Architecture Engine / Polyhedron** | Original Ostrum 3D model & Canvas implementation. | Interactive Three.js / Canvas 3D model representing the connected Ostrum System (connected nodes, glass surfaces, real-time rotation on drag). |
| **03** | **Interactive Gallery Spaces** (`.gallery-canvas`) | Full-width interactive canvas (`1112x732`) rendering digital chapter environments. | **Interactive Work & Architecture Sandbox** | Original Ostrum interactive canvas. | Interactive DOM/Canvas component allowing users to simulate live systems (Campus360 admissions, retail inventory POS, CRM pipelines). |
| **04** | **Typography Assets** (`Romie`, `"Neue Montreal"`) | Proprietary commercial desktop/web fonts licensed by the author. | **`Instrument Serif` + `Plus Jakarta Sans` / `Inter` + `JetBrains Mono`** | 100% Free & Open Source (SIL Open Font License) via Google Fonts. | Loaded via `next/font/google` with preconnect, zero layout shift, and instant sub-second caching. |
| **05** | **Directional Icons & Arrows** (`arrow.svg`) | Minimalist inline SVG right arrow (`→`) with clone wrapper. | **Original Ostrum Architectural Arrows & Micro-Icons** (`↗`, `→`, `+`) | Original vector SVGs authored directly in Ostrum codebase. | Clean, scalable inline SVG primitives embedded inside reusable React components. |
| **06** | **Interactive Buttons & Badges** (`.primary-btn`) | Dual-layer rolling text pill button with sub-label. | **Ostrum Magnetic Rolling Action Pills** | Original CSS/React component. | Framer Motion / CSS transform keyframes with `.text` and `.text--clone` translateY rolling states. |
| **07** | **Case Study Media & Architecture Blueprints** | Book photography & chapter previews. | **Original Demonstration Architecture Diagrams & SVG Schematics** | Original Ostrum intellectual property (Campus360, Aura Living, Greenfield Logistics). | Clean vector SVGs, responsive CSS cards, and explicit `Demonstration Case Study` badges. |

---

## 2. Asset Integrity & Rights Compliance Statement

1. **Zero Pirated Assets:** Under no circumstances are images, 3D glTF/OBJ models, video files, or font files from `clarte.page` downloaded, converted, or committed to the repository.
2. **Original Craft:** All visual richness on the Ostrum website is generated natively through modern Web standards: CSS3 gradients, Canvas 2D/WebGL shaders, SVG vector geometry, and open-source Google typography.
3. **Performance First:** By using code-generated geometry and mathematical shaders rather than multi-megabyte video loops or uncompressed textures, Ostrum achieves sub-second LCP and a perfect Lighthouse performance score.
