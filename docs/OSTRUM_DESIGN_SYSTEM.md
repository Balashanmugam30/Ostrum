# Ostrum — Comprehensive Design System Specification

> **Status:** RATIFIED & PRODUCTION READY  
> **Aesthetic Northstar:** Direction E (Art-Directed Future Editorial) + Clarté Reference Experience Quality  
> **Mandate:** Strictly Light-First • Architectural Precision • Tactile Alabaster Grounds • Multi-Color Harmonies • Zero Neon / Cyberpunk Clichés  

---

## 1. Color Palette & Canvas Surfaces

Ostrum operates on an organic, multi-tonal light architectural palette designed to eliminate digital harshness while providing rich visual depth:

```text
┌────────────────────────┬───────────┬──────────────┬────────────────────────────────────────────────────────┐
│ TOKEN NAME             │ HEX VALUE │ RGB / HSL    │ ROLE & MATERIAL MEANING                                │
├────────────────────────┼───────────┼──────────────┼────────────────────────────────────────────────────────┤
│ --canvas-warm (base)   │ #FAF7F2   │ 250,247,242  │ Warm Alabaster Linen. Default page ground.             │
│ --canvas-pearl         │ #FCFAF7   │ 252,250,247  │ Pearl Porcelain. Elevated bright reading sections.     │
│ --canvas-cool          │ #F3F5F7   │ 243,245,247  │ Misty Slate. Technical case studies & tooling matrix.  │
│ --surface-card         │ #FFFFFF   │ 255,255,255  │ Crisp Paper White. Floating cards, active panels.      │
│ --surface-bisque       │ #F2ECE4   │ 242,236,228  │ Warm Bisque Paper. Philosophy, FAQ & Project Brief.    │
│ --surface-slate        │ #EAEFF4   │ 234,239,244  │ Muted Slate Tint. System telemetry boxes.              │
├────────────────────────┼───────────┼──────────────┼────────────────────────────────────────────────────────┤
│ --text-ink             │ #161514   │ 22,21,20     │ Deep Charcoal Ink. Primary headings (18.1:1 AAA).      │
│ --text-slate           │ #50545C   │ 80,84,92     │ Warm Slate. Body narrative & descriptions (6.9:1 AA).  │
│ --text-muted           │ #84878E   │ 132,135,142  │ Chapter kickers, dates, micro-monospaced labels.       │
│ --text-inverse         │ #FFFFFF   │ 255,255,255  │ High-contrast labels on dark action pills.             │
├────────────────────────┼───────────┼──────────────┼────────────────────────────────────────────────────────┤
│ --accent-terracotta    │ #D24B2C   │ 210,75,44    │ Signature Terracotta Ochre. Creative warmth & CTAs.    │
│ --accent-terracotta-h  │ #B83D20   │ 184,61,32    │ Terracotta hover state.                                │
│ --accent-terracotta-t  │ #FDF4F1   │ 253,244,241  │ Soft terracotta tint for active badges & tags.         │
│ --accent-indigo        │ #182B49   │ 24,43,73     │ Deep Nocturne Indigo. Systems, links, focus rings.     │
│ --accent-indigo-t      │ #EEF3FA   │ 238,243,250  │ Soft indigo tint for technical badges.                 │
│ --accent-sage          │ #2B543D   │ 43,84,61     │ Mountain Sage. Live system indicators & verified proof.│
│ --accent-sage-t        │ #EDF6F1   │ 237,246,241  │ Soft sage tint for live telemetry boxes.               │
│ --accent-amber         │ #DE8E26   │ 222,142,38   │ Sunlit Amber. Warnings, highlights, metrics.           │
│ --accent-plum          │ #58354A   │ 88,53,74     │ Muted Vintage Plum. Editorial badges & subtle borders. │
├────────────────────────┼───────────┼──────────────┼────────────────────────────────────────────────────────┤
│ --border-subtle        │ #E8E3DA   │ 232,227,218  │ 1px architectural hairline dividers.                   │
│ --border-strong        │ #D5CEBF   │ 213,206,191  │ Active card borders, inputs, focused controls.         │
│ --border-focus         │ #D24B2C   │ 210,75,44    │ Accessible 2px focus ring indicator.                   │
└────────────────────────┴───────────┴──────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Atmospheric Gradient System

```css
:root {
  /* 01. Dawn Hero Atmosphere: Warm alabaster shifting into crisp morning sky mist */
  --gradient-dawn: linear-gradient(135deg, #FAF7F2 0%, #F5EDE6 45%, #EDF3F7 100%);

  /* 02. Warm Peach Glow: Gentle warmth for cards and CTA backdrops */
  --gradient-warm-peach: linear-gradient(135deg, rgba(253, 244, 238, 0.95) 0%, rgba(251, 238, 232, 0.5) 50%, rgba(250, 247, 242, 0) 100%);

  /* 03. Misty Sky Wash: Calm atmospheric tint for technical & system sections */
  --gradient-mist-sky: linear-gradient(135deg, rgba(235, 242, 249, 0.8) 0%, rgba(243, 247, 251, 0.4) 100%);

  /* 04. Sage Intelligence: Botanical wash for live automation states */
  --gradient-sage-glow: linear-gradient(135deg, rgba(237, 246, 241, 0.9) 0%, rgba(245, 250, 247, 0.35) 100%);

  /* 05. Tactile Ink Shimmer: High-contrast primary buttons with physical depth */
  --gradient-ink-shimmer: linear-gradient(180deg, #1C1B1A 0%, #111010 100%);
}
```

---

## 3. Typography Architecture & Hierarchy

### Typographic Trio
1. **`Plus Jakarta Sans` (600, 700, 800):** Contemporary geometric neo-grotesque display font.
2. **`Instrument Serif` (400, 400 Italic):** High-contrast literary optical serif for emotional keyword accents (`<span class="editorial-accent">`).
3. **`Inter` (400, 500, 600, 700):** Screen-reading benchmark for all body, forms, and cards.
4. **`JetBrains Mono` (400, 500):** Micro-kickers (`CHAPTER 05 // CAPABILITIES`), telemetry, and code snippets.

### Typographic Scale

| Level | Family | Size | Weight | Line Height | Tracking | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display XL** | Plus Jakarta Sans | 56px–72px | 800 | 1.05 | -0.04em | Master Hero Statement |
| **Display Serif** | Instrument Serif | 60px–78px | 400 Italic | 1.05 | -0.015em | Headline Keyword Accents |
| **Display H2** | Plus Jakarta Sans | 34px–48px | 700 | 1.12 | -0.03em | Chapter Titles |
| **Heading H3** | Plus Jakarta Sans | 22px–26px | 700 | 1.25 | -0.02em | Card & Feature Titles |
| **Body Large** | Inter | 18px–20px | 400 | 1.60 | -0.01em | Lead narrative paragraphs |
| **Body Regular** | Inter | 15px–16px | 400 | 1.65 | 0.00em | Descriptions & card content |
| **Micro Kicker** | JetBrains Mono | 11px–12px | 600 | 1.40 | +0.08em | Chapter indices & tags |

---

## 4. Spacing, Grid & Container Rules

- **Desktop Container:** `max-width: 1240px`, centered, padding `0 32px`.
- **Narrow Container (Editorial):** `max-width: 920px`, centered, padding `0 24px`.
- **Vertical Section Breathing Room:** `padding: clamp(80px, 10vw, 160px) 0` (inspired by Clarté's confident negative space).
- **Asymmetric Split:** 40% Left Narrative Column + 60% Right Visual / Interactive Stage.

---

## 5. UI Primitives & Interaction Patterns

### 1. Clarté-Inspired Rolling Action Button (`.rolling-btn`)
```html
<button class="rolling-btn btn-terracotta">
  <span class="rolling-text-wrap">
    <span class="rolling-text">Initiate Project Brief</span>
    <span class="rolling-text rolling-clone">Initiate Project Brief</span>
  </span>
  <span class="rolling-arrow-wrap">
    <span class="rolling-arrow">↗</span>
    <span class="rolling-arrow rolling-clone">↗</span>
  </span>
</button>
```
On hover, `.rolling-text` translates Y by -100%, and `.rolling-clone` smoothly slides into position.

### 2. The Synchronized Lattice & Corner Crosses (`+`)
Architectural cards feature fine 1px hairline borders (`var(--border-subtle)`) and corner crosshair markers (`+`) at coordinates `(-5px, -5px)`.

### 3. Accessible FAQ Disclosure Accordion
Built with semantic `<button>` triggers, `aria-expanded`, `aria-controls`, and smooth CSS grid height interpolation.

### 4. Interactive 4-Step Project Brief Selector
Includes multi-choice objective buttons, operational scale indicators, and sanitized contact form inputs.

---

## 6. Accessibility & Performance Contract

1. **WCAG 2.2 AA / AAA Compliance:** 18.1:1 AAA contrast on primary ink, 6.9:1 AA on body text.
2. **Keyboard Focus:** Visible 2px outline in signature Terracotta (`#D24B2C`) with 3px offset.
3. **Motion Sensitivity:** `@media (prefers-reduced-motion: reduce)` collapses all transforms, rolling effects, and auto-rotations into clean, static states.
4. **Performance Targets:** Sub-second LCP, zero CLS (cumulative layout shift), and zero heavy external uncompressed media.
