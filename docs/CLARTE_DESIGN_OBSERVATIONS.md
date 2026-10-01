# Clarté Design System Observations & Experience Tokens

> **Reference URL:** https://clarte.page/  
> **Status:** RATIFIED & GROUND TRUTH ESTABLISHED  

---

## 1. Typography Architecture

### Font Families
- **Display Serif:** `Romie, serif` (Margot Lévêque) — Classical high-contrast literary serif with pronounced vertical axis, acute serifs, and sharp terminals.
  - Replaced in Ostrum by: `Instrument Serif` (Google Fonts, SIL OFL 1.1)
- **Body & Functional Sans:** `"Neue Montreal", sans-serif` (Pangram Pangram) — Neutral Swiss-style neo-grotesque sans with tight tracking, low contrast, and modern geometric curves.
  - Replaced in Ostrum by: `Inter` / `Plus Jakarta Sans` with `-0.02em` tracking.

### Computed Typographic Hierarchy

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Colossal Logo** | Custom Vector SVG | 1253 × 360 px | 400 | N/A | Variable | Uppercase |
| **Section H2 Display** | Display Serif | 60.45px | 400 | 55.61px (0.92!) | -1.56px (-0.026em) | Sentence case |
| **Statement H2** | Body Sans + Serif Highlight | 32px | 400 | 32px (1.0) | -0.32px | Sentence case |
| **Highlight Span** | Display Serif | 32px | 400 (italic) | 32px (1.0) | -0.32px | Embedded italics |
| **Intro / Body Copy** | Body Sans | 16px | 400 | 19.2px–20px (1.2–1.25) | -0.32px (-0.02em) | Sentence case |
| **Button Text** | Body Sans | 14px | 500 | 14px (1.0) | -0.32px | Sentence case |
| **Micro Sub-label** | Body Sans | 11px | 500 | 11px (1.0) | Normal | Sentence case |

---

## 2. Color, Lighting & Atmosphere

- **Primary Canvas Background:** `#000000` (Pure Obsidian Black)
- **Atmospheric Visual Texture:** Fixed background overlay with deep crimson/carmine caustic light burst radiating from center (`#A81815` through `#420807` to `#000000`) with high-frequency photographic grain.
- **Primary Ink:** `#FFFFFF` (Optic White)
- **Secondary Ink:** `rgba(255, 255, 255, 0.75)` (Muted Silver)
- **Tertiary Ink / Sub-labels:** `rgba(255, 255, 255, 0.50)`
- **Button Surfaces:**
  - Dark theme: `background: #000000; color: #FFFFFF;`
  - Inverted theme: `background: #FFFFFF; color: #000000;`
  - Hover fill (`.bg`): Clips in with `clip-path: inset(0)`
- **Footer Atmosphere:** Warm golden/coral luminescence radiating behind the center flower emblem (`#E67332` to `#1A0A05`).

---

## 3. Spatial Layout & Box Model

- **Macro Section Padding:**
  - Desktop: `margin-top: 12.5rem` (200px) between major scenes (`padding: 0 15vw`).
  - Mobile: `margin-top: 7.5rem` (120px) (`padding: 0 1.5rem`).
- **Container Geometry:** No traditional card containers with thick borders. Space is defined purely through negative space, typography scale, and 3D viewports.
- **Button Dimensions:** `padding: 1rem; border-radius: 0.25rem (4px); gap: 4rem;`.

---

## 4. Motion & Physical Animation Language

- **Rolling Pill Animation:**
  - Text wrapper height: `1.2em` overflow hidden.
  - Resting: `.text` at `translateY(0%)`, `.text--clone` at `translateY(100%)`.
  - Hover: `.text` translates to `translateY(-100%)`, `.text--clone` enters to `translateY(0%)`.
  - Bezier Curve: `cubic-bezier(0.38, 0.005, 0.215, 1)` with `0.4s` duration.
- **Parallax Scroll Speeds:** Letters in giant wordmarks float at differing velocities (`0.1` to `0.75`), creating spatial depth during vertical scroll.
- **3D Interactive Physics:**
  - Pointer drag tracks cursor delta with velocity decay factor `0.92`.
  - Normal-mapped specular sheen rotates dynamically with virtual directional light source.
