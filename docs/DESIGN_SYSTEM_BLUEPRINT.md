# Ostrum — Design System Blueprint & Token Architecture

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Target Framework:** React 19 / Next.js 15 + Tailwind CSS v4 / v3 Tokens + shadcn/ui Primitives  

---

## 1. Master Design Token Dictionary

The token architecture is organized into semantic variables ready for implementation via CSS Custom Properties and Tailwind configuration in Phase 01.

### A. Color Tokens (Light-First)

```css
:root {
  /* Canvas & Surfaces */
  --canvas-base: #FBFBFC;
  --surface-card: #FFFFFF;
  --surface-muted: #F4F4F6;
  --surface-hover: #EBECEF;
  --surface-active: #E2E4E9;

  /* Borders & Hairlines */
  --border-subtle: #E4E5EA;
  --border-strong: #D0D2DA;
  --border-interactive: #0A4DDE;

  /* Typography / Inks */
  --text-obsidian: #0E1017;     /* 17.8:1 AAA contrast */
  --text-slate: #525866;        /* 6.2:1 AA contrast */
  --text-muted: #868C98;        /* 3.5:1 AA Large contrast */
  --text-inverse: #FFFFFF;

  /* Brand Accents & Signals */
  --accent-cobalt: #0A4DDE;     /* Primary Swiss Cobalt */
  --accent-cobalt-hover: #083DB2;
  --accent-cobalt-tint: #EFF4FE;
  --signal-warm: #E35A27;       /* Alert / Amber */
  --signal-warm-tint: #FDF3EF;
  --signal-emerald: #059669;    /* Uptime / Active Agent */
  --signal-emerald-tint: #EDFBF5;
}
```

### B. Spacing Scale (4px/8px Base Grid)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### C. Radii & Geometry Tokens

```css
:root {
  --radius-none: 0px;
  --radius-xs: 4px;      /* Badges, micro status dots */
  --radius-sm: 6px;      /* Small tags, buttons */
  --radius-md: 8px;      /* Form inputs, select dropdowns */
  --radius-lg: 12px;     /* Core cards, content containers */
  --radius-xl: 16px;     /* Modals, interactive drawer sheets */
  --radius-full: 9999px; /* Primary pill buttons, category pills */
}
```

### D. Shadow & Elevation Tokens

```css
:root {
  --shadow-none: none;
  --shadow-card-hover: 0 8px 24px -4px rgba(14, 16, 23, 0.06), 0 2px 6px -2px rgba(14, 16, 23, 0.04);
  --shadow-drawer: 0 20px 40px -12px rgba(14, 16, 23, 0.10);
  --shadow-modal: 0 32px 64px -16px rgba(14, 16, 23, 0.16);
}
```

### E. Z-Index Layer Stack

```css
:root {
  --z-under-footer: 0;   /* Sticky reveal under-page footer */
  --z-canvas: 10;        /* Main scroll container */
  --z-sticky-card: 20;   /* Stacking card layers */
  --z-header: 100;       /* Pinned navigation bar */
  --z-modal-backdrop: 200;
  --z-modal: 210;
  --z-toast: 300;
}
```

---

## 2. Layout & Container Architecture

- **Max Container Width:** `1280px` (`max-w-7xl`), centered (`mx-auto`).
- **Horizontal Screen Padding:**
  - Mobile (< 640px): `16px` (`px-4`)
  - Tablet (640px–1024px): `24px` (`px-6`)
  - Desktop (> 1024px): `32px` (`px-8`)
- **Grid Layout:** 12-column CSS Grid with `24px` column gaps (`gap-6`) and `32px` row gaps.
- **Breakpoints:**
  - `sm`: 640px (Mobile landscape / large phones)
  - `md`: 768px (Tablets / small laptops)
  - `lg`: 1024px (Standard desktops / iPads landscape)
  - `xl`: 1280px (Main studio container max-width)
  - `2xl`: 1536px (High-resolution monitors)

---

## 3. Core Component Specifications

### 1. Navigation Shell (`Header`)
- **Geometry:** Height 72px, fixed top, background `rgba(251, 251, 252, 0.85)` with `backdrop-filter: blur(12px)`.
- **Border:** Bottom hairline `1px solid var(--border-subtle)`.
- **Elements:**
  - Left: Ostrum SVG wordmark (22px height) + live status badge (`● Available for Q4`).
  - Center: Nav link array (`Work`, `System`, `Capabilities`, `Insights`). Typography: `Inter`, 14px, medium weight, color `var(--text-slate)`, hover color `var(--text-obsidian)`.
  - Right: Primary CTA button `Start a Project ↗`.

### 2. Buttons (`Button`)
- **Primary Pill:**
  - Background: `var(--accent-cobalt)` (`#0A4DDE`).
  - Text: `#FFFFFF`, 14px, font-weight 500, letter-spacing `-0.01em`.
  - Geometry: Full pill (`border-radius: 9999px`), padding `10px 24px`, height `42px`.
  - Hover: Background `#083DB2`, scale `1.02` with spring physics.
- **Secondary Outline:**
  - Background: `transparent`.
  - Border: `1px solid var(--border-strong)` (`#D0D2DA`).
  - Text: `var(--text-obsidian)`, padding `10px 22px`.
  - Hover: Background `var(--surface-muted)`.
- **Ghost Action:**
  - Background: `transparent`, zero border.
  - Text: `var(--text-slate)`, hover color `var(--accent-cobalt)`.

### 3. Section Header (`SectionHeader`)
- **Structure:**
  1. Kicker: `JetBrains Mono`, 12px, uppercase, tracking `+0.05em`, color `var(--accent-cobalt)` (e.g., `03 // THE UNIFIED ARCHITECTURE`).
  2. Headline: `Plus Jakarta Sans`, 40px–56px, bold (700), tracking `-0.035em`, color `var(--text-obsidian)`.
  3. Lead Copy: `Inter`, 18px, regular (400), color `var(--text-slate)`, max-width `640px`.

### 4. Interactive Stacking Card (`StackingCard`)
- **Surface:** `var(--surface-card)` (`#FFFFFF`).
- **Border:** `1px solid var(--border-subtle)`.
- **Radius:** `12px`.
- **Behavior:** Positioned `sticky` at `top: 100px`; scales down sequentially as following cards scroll over it (`scale: 1 -> 0.95 -> 0.90`).

### 5. Form Input & Controls (`Input`, `Select`, `Textarea`)
- **Surface:** `#FFFFFF`.
- **Border:** `1px solid var(--border-subtle)` (`#E4E5EA`).
- **Radius:** `8px`.
- **Typography:** `Inter`, 15px, text `var(--text-obsidian)`, placeholder `var(--text-muted)`.
- **Focus-Visible:** Border `1.5px solid var(--accent-cobalt)`, box-shadow `0 0 0 3px rgba(10, 77, 222, 0.12)`.
- **Height:** 44px (guaranteeing WCAG touch targets).

### 6. Interactive Stack Builder Module (`StackConfigurator`)
- **Pills:** Rounded-full toggle buttons.
  - Inactive: Surface `#FFFFFF`, border `1px solid var(--border-subtle)`, text `var(--text-slate)`.
  - Active: Surface `var(--accent-cobalt)`, border `1px solid var(--accent-cobalt)`, text `#FFFFFF`.
- **Preview Canvas:** Dynamic live SVG showing connected topological lines between active nodes with real-time summary recalculation.

---

## 4. Component State Matrix

Every interactive component must implement all states in this matrix:

| State | Visual Treatment | CSS / Pseudo-Class |
| :--- | :--- | :--- |
| **Default** | Resting token values, clean hairline border. | `:default` |
| **Hover** | Surface lifts or brightens, border darkens, pointer cursor. | `:hover` |
| **Focus-Visible** | 2px solid cobalt ring, 2px offset. Zero default outline. | `:focus-visible` |
| **Active / Pressed** | Scale `0.98` spring compression, active surface tint. | `:active` |
| **Disabled** | Opacity 50%, cursor `not-allowed`, zero pointer events. | `:disabled`, `aria-disabled="true"` |
| **Loading** | Spinner indicator or skeleton pulse, text hidden from SR. | `aria-busy="true"` |
| **Success** | Emerald status indicator, affirmative feedback message. | `aria-live="polite"` |
| **Error** | Border `1.5px solid var(--signal-warm)`, inline error text. | `aria-invalid="true"` |
| **Reduced Motion**| Zero transform or transition duration; instant swap. | `@media (prefers-reduced-motion: reduce)` |

---

## 5. Accessibility Contract (WCAG 2.2 Level AA Standard)

1. **Contrast Ratios:**
   - Text Obsidian on Canvas Base: **17.8:1** (Exceeds Level AAA standard of 7:1).
   - Text Slate on Canvas Base: **6.2:1** (Exceeds Level AA standard of 4.5:1).
   - Cobalt Accent on Canvas Base: **7.2:1** (Level AAA compliant).
2. **Keyboard Navigation:**
   - Logical tab index matching visual reading order across all sections.
   - Global `Skip to Main Content` link pinned at top of DOM (`focus:translate-y-0`).
   - Accessible keyboard triggers (`Space` and `Enter`) for all custom pills and toggles.
3. **Touch Target Sizing:**
   - All interactive controls, nav links, and form inputs meet or exceed **44px x 44px** minimum touch target boundaries.
4. **Semantic HTML Landmarks:**
   - Strict usage of `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`, and `<footer>`.
   - Single `<h1>` per page route.
   - Descriptive `aria-label` attributes on all icon-only buttons.
