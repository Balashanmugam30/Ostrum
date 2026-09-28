# Ostrum — Visual Design Direction & System Aesthetics

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Core Aesthetic:** Swiss Architectural Minimalism • High-Contrast Editorial Rigor • Restrained Modernism  

---

## 1. Visual Philosophy: The Architectonic Studio

Ostrum's visual identity reflects its foundational business promise: we do not build superficial decorative websites; we build **interconnected digital ecosystems**. 

The design language is informed by **International Typographic Style (Swiss Style)**, modern architectural publications, and precision digital instruments. It is light, spacious, intellectually confident, and meticulously structured. Every line, gap, and typographical jump serves a cognitive purpose: guiding the visitor through complex systems with effortless clarity.

---

## 2. Intentional Rejections (What Ostrum Will Never Be)

To maintain an unmistakable, high-craft brand identity, the following visual clichés are strictly prohibited across all touchpoints:

| Rejected Visual Trope | Why It Is Rejected | What Ostrum Uses Instead |
| :--- | :--- | :--- |
| **Dark-Mode "Hacker" Theme** | Conveys underground, experimental, or unvetted software; alienates enterprise executives. | **Light-First Architectural Canvas** (`#FBFBFC`) communicating transparency and permanence. |
| **Neon Purple / Cyan Glow Overload** | The defining cliché of 2023–2024 AI wrappers; signals low-effort template design. | **Deep Obsidian Ink** (`#0E1017`) accented with **Precision Cobalt** (`#0A4DDE`). |
| **Excessive Floating Glassmorphism** | Heavy blur filters degrade rendering performance and reduce contrast legibility. | **Crisp 1px Hairline Borders** (`#E4E5EA`) and solid, tactile paper elevations. |
| **Generic Stock Photography** | Corporate people pointing at glass screens or shaking hands kills trust immediately. | **High-Fidelity Interface Captures**, architectural system flowcharts, and real product artifacts. |
| **Random 3D Floating Shapes** | Irrelevant chrome donuts or floating metallic spheres create visual noise without conveying information. | **Mathematical Topology Visualizations** representing real data flow between Brand, ERP, CRM, and AI. |
| **Canva / Generic SaaS Card Sprawl** | Walls of identical rounded cards create cognitive fatigue and boring layouts. | **Asymmetric Editorial Layouts**, split-studio sections, and stacked scroll-driven canvases. |

---

## 3. The Light-First Color System

The Ostrum palette is rooted in high-luminance, architectural paper tones with deep obsidian ink and selective mathematical accents. All color pairs strictly exceed **WCAG 2.2 Level AA** contrast requirements, with core body and headline typography achieving **Level AAA** compliance (> 17:1 contrast).

### The Master Palette Table

```text
┌─────────────────┬───────────┬─────────────┬────────────────────────────────────────────────────────┐
│ TOKEN NAME      │ HEX VALUE │ RGB / HSL   │ SEMANTIC ROLE & CONTEXT                                │
├─────────────────┼───────────┼─────────────┼────────────────────────────────────────────────────────┤
│ canvas-base     │ #FBFBFC   │ 251,251,252 │ Primary page background; soft architectural paper.     │
│ surface-card    │ #FFFFFF   │ 255,255,255 │ Elevated component surface; cards, modals, popovers.   │
│ surface-muted   │ #F4F4F6   │ 244,244,246 │ Secondary canvas; code blocks, tag grounds, table rows.│
│ surface-hover   │ #EBECEF   │ 235,236,239 │ Interactive hover state for muted controls and pills.  │
├─────────────────┼───────────┼─────────────┼────────────────────────────────────────────────────────┤
│ border-subtle   │ #E4E5EA   │ 228,229,234 │ Structural hairline dividers (1px solid); cards, grid. │
│ border-strong   │ #D0D2DA   │ 208,210,218 │ Focused states, active tabs, prominent separators.     │
├─────────────────┼───────────┼─────────────┼────────────────────────────────────────────────────────┤
│ text-obsidian   │ #0E1017   │ 14,16,23    │ Primary headlines, display text, prominent labels.     │
│ text-slate      │ #525866   │ 82,88,102   │ Body paragraphs, descriptive copy, primary nav links.  │
│ text-muted      │ #868C98   │ 134,140,152 │ Captions, metadata tags, footnotes, index numbers.     │
├─────────────────┼───────────┼─────────────┼────────────────────────────────────────────────────────┤
│ accent-cobalt   │ #0A4DDE   │ 10,77,222   │ Signature brand accent; primary CTAs, active states.   │
│ accent-cobalt-lt│ #EFF4FE   │ 239,244,254 │ Cobalt tint surface; active badge grounds, highlights. │
│ signal-warm     │ #E35A27   │ 227,90,39   │ Secondary alert signal; live warnings, pending status. │
│ signal-emerald  │ #059669   │ 5,150,105   │ Operational health signal; live status dot, 99.9% badge│
└─────────────────┴───────────┴─────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Typography System: Editorial Meets Engineering

The typographic system creates an intellectual tension between **Swiss geometric authority**, **bespoke editorial warmth**, and **engineering precision**.

### A. The Selected Typeface Family

1. **Display & Primary Headers: `Plus Jakarta Sans`**
   - **Characteristics:** Geometric neo-grotesque with clean cuts, tall x-height, and architectural curves.
   - **Styling Directives:** Set in SemiBold (600) and Bold (700) with tight tracking (`letter-spacing: -0.035em`) and compact line-heights (`1.05` to `1.15`).
   
2. **Editorial Accent: `Newsreader`**
   - **Characteristics:** High-contrast, literary optical serif.
   - **Styling Directives:** Set exclusively in Italic Regular (400) for one or two deliberate emphasis words inside display statements (e.g., *"We engineer **connected** digital ecosystems"*).

3. **Body & Interface: `Inter`**
   - **Characteristics:** The benchmark for digital readability. Crisp apertures, neutral geometry, excellent rendering at micro-scales.
   - **Styling Directives:** Set in Regular (400) and Medium (500) with standard tracking (`0em`) and generous line-heights (`1.55` to `1.65`).

4. **Technical & Systems Monospace: `JetBrains Mono`**
   - **Characteristics:** Highly legible code face with distinctive zero and clear operators.
   - **Styling Directives:** Used for chapter indexes (`01 // BRAND`), system node telemetry (`LATENCY: 24MS`), API endpoints, and data tables.

### B. Typographic Scale & Hierarchy

```text
┌───────────────┬────────────┬─────────────┬─────────┬──────────────┬─────────────────────────┐
│ LEVEL / ROLE  │ FONT       │ SIZE (PX)   │ WEIGHT  │ LINE HEIGHT  │ TRACKING                │
├───────────────┼────────────┼─────────────┼─────────┼──────────────┼─────────────────────────┤
│ Display Giant │ Jakarta    │ 76px–96px   │ 700     │ 1.05 (100px) │ -0.04em (-3.8px)        │
│ Editorial H1  │ Newsreader │ 76px–96px   │ 400 It  │ 1.05 (100px) │ -0.01em (-0.9px)        │
│ Heading H1    │ Jakarta    │ 48px–64px   │ 700     │ 1.10 (60px)  │ -0.03em (-1.8px)        │
│ Heading H2    │ Jakarta    │ 32px–40px   │ 600     │ 1.20 (44px)  │ -0.025em (-1.0px)       │
│ Heading H3    │ Jakarta    │ 24px–28px   │ 600     │ 1.25 (32px)  │ -0.02em (-0.5px)        │
│ Subhead / Lead│ Inter      │ 18px–20px   │ 400/500 │ 1.50 (28px)  │ -0.01em (-0.2px)        │
│ Body Regular  │ Inter      │ 15px–16px   │ 400     │ 1.60 (25px)  │ 0.00em (0px)            │
│ Body Medium   │ Inter      │ 14px–15px   │ 500     │ 1.55 (22px)  │ 0.00em (0px)            │
│ Caption / Meta│ Inter      │ 12px–13px   │ 500     │ 1.40 (18px)  │ +0.01em (+0.1px)        │
│ Technical Mono│ JetBrains  │ 12px–13px   │ 400/500 │ 1.45 (18px)  │ +0.02em (+0.25px)       │
└───────────────┴────────────┴─────────────┴─────────┴──────────────┴─────────────────────────┘
```

---

## 5. Grid, Layout & Spatial Principles

1. **The 12-Column Swiss Grid:** All desktop layouts align to a strict 12-column mathematical grid with `24px` gutters and a maximum content width of `1280px` (`max-w-7xl`), centered within the viewport.
2. **Hairline Structural Framing:** Rather than floating borderless cards, sections and cards are framed with crisp `1px solid #E4E5EA` borders. This reinforces an architectural, blueprint-like foundation.
3. **The 40/60 Asymmetry Rule:** Key sections leverage deliberate asymmetry. For instance, the section title and narrative statement sit in the left 40% (columns 1–5), while interactive visuals, diagrams, or cards populate the right 60% (columns 6–12).
4. **Generous Vertical Pacing:** Standard section vertical padding is `96px` to `128px` on desktop and `64px` to `80px` on mobile. White space is treated as an active structural element, not empty canvas waiting to be filled.

---

## 6. Radius, Shadow & Material Language

### Border Radius Language
- **Structural Cards & Panels:** `12px` (subtle soft geometry, avoiding childish ultra-rounded corners).
- **Interactive Form Inputs:** `8px` (architectural, clean).
- **Action Buttons & Pill Tags:** `9999px` (full pill geometry for clear clickability and tactile feel).
- **Internal Micro-Elements (Badges, Dots):** `4px` or circular.

### Shadow & Elevation Language
Ostrum uses **flat, tactile elevation** rather than fuzzy dark shadows:
- **Default Card Elevation:** Flat with `1px solid #E4E5EA`. Zero shadow.
- **Card Hover Elevation:**
  ```css
  box-shadow: 0 8px 24px -4px rgba(14, 16, 23, 0.06), 0 2px 6px -2px rgba(14, 16, 23, 0.04);
  ```
- **Floating Modals / Drawers:**
  ```css
  box-shadow: 0 24px 48px -12px rgba(14, 16, 23, 0.12);
  ```

---

## 7. Imagery, Iconography & Systems Visualization

1. **Product UI Imagery:** Screen captures are presented with razor-sharp fidelity, subtle 1px internal framing, and contextual device bezels only when functionally necessary.
2. **Iconography:** Handled via clean `1.5px` stroke vector icons (Lucide Icons set), styled in obsidian `#0E1017` or slate `#525866`. Never colorful 3D emoji icons.
3. **System Visualizations:** Abstract illustrations are built as **functional node topologies**—clean vector lines connecting labeled modules (e.g., `Brand Token` ──> `Web Store` ──> `ERP Inventory` ──> `WhatsApp Agent`).

---

## 8. Originality Test Checklist

Every design decision in Phase 01 and beyond must pass this three-question test:

1. **The Logo Removal Test:** *If the Ostrum wordmark is removed, could this page be mistaken for a generic AI landing page or dark-mode agency clone?* (If yes: strip decorative effects, sharpen the Swiss grid, elevate the typography).
2. **The Functional Clarity Test:** *Does this visual element or animation explain how Ostrum connects business systems?* (If no: remove it).
3. **The Light-Mode Integrity Test:** *Does the layout look exceptionally clean, bright, and legible in broad daylight on a mobile phone?* (If no: increase contrast, adjust white balance).
