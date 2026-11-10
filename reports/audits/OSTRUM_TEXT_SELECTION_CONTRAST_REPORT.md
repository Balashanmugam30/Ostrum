# OSTRUM Text Selection Contrast & Color System Audit Report

**Report Date:** 10 November 2026  
**Tested Baseline Commit:** Working tree on `main`  
**Test Suite:** Playwright Chromium (`scripts/verify_text_selection_contrast.mjs`)  
**Status:** **ALL 10 SURFACES PASS (GO) ✓**

---

## 1. Executive Summary & Defect Remediation

### The Defect
Previously, browser text selection across the website appeared in orange/terracotta (`#C9362B` / `#D24B2C`). On warm coral, orange, and red surfaces (such as the footer project card `bg-[#FF4D30]`), the text selection highlight blended into the background, rendering selected text illegible or invisible.

### The Remediation
Implemented a unified, mathematically validated **Two-Tone Text Selection System** rooted in OSTRUM's canonical architectural palette:
- **Light Surfaces** (white, ivory, stone, pale grey, pastel capability cards, and bright coral):
  - Selection Fill: Deep OSTRUM Burgundy `#64120F`
  - Selected Text: Pure White `#FFFFFF`
- **Dark Surfaces** (black, oxblood, deep burgundy, dark hero/footer panels):
  - Selection Fill: Pure White `#FFFFFF`
  - Selected Text: Deep OSTRUM Burgundy `#64120F`

Every surface across the website now provides striking contrast and pristine legibility.

---

## 2. Contrast Ratios & WCAG AAA Compliance

Contrast calculations are based on standard sRGB relative luminance formulas ($L = 0.2126R + 0.7152G + 0.0722B$):
- **White (`#FFFFFF`) Luminance:** $1.000$
- **Deep Burgundy (`#64120F`) Luminance:** $0.0316$
- **Coral Card Accent (`#FF4D30`) Luminance:** $0.2665$
- **Pure Black (`#050505`) Luminance:** $0.0015$

| Surface & Selection State | Background Color | Highlight Fill | Glyph Foreground | Contrast Ratio | WCAG Compliance |
|---|---|---|---|---|---|
| **Light Surfaces (White / Stone)** | `#FFFFFF` | `#64120F` | `#FFFFFF` | **12.87 : 1** | **Pass (WCAG AAA)** |
| **Dark Surfaces (Black / Oxblood)** | `#050505` | `#FFFFFF` | `#64120F` | **12.87 : 1** | **Pass (WCAG AAA)** |
| **Coral Project Tile (`#FF4D30`)** | `#FF4D30` | `#64120F` | `#FFFFFF` | **12.87 : 1** (glyph vs fill)<br>**3.88 : 1** (fill vs card) | **Pass (High Contrast)** |
| **Deep Burgundy Footer (`#64120F`)** | `#64120F` | `#FFFFFF` | `#64120F` | **12.87 : 1** | **Pass (WCAG AAA)** |

> [!TIP]
> On the coral project tile (`#FF4D30`), deep burgundy `#64120F` creates an unmistakable, bold boundary against the coral background, while the pure white text `#FFFFFF` shines at 12.87:1 contrast. The previous orange-on-orange invisibility defect is completely eliminated.

---

## 3. Central CSS Implementation & Tokens

Defined in [`app/globals.css`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/app/globals.css):

```css
:root {
  --ostrum-selection-on-light-bg: #64120F;
  --ostrum-selection-on-light-text: #FFFFFF;
  --ostrum-selection-on-dark-bg: #FFFFFF;
  --ostrum-selection-on-dark-text: #64120F;
}

/* Default Selection for all standard/light surfaces */
::selection {
  background-color: var(--ostrum-selection-on-light-bg) !important;
  color: var(--ostrum-selection-on-light-text) !important;
}

::-moz-selection {
  background-color: var(--ostrum-selection-on-light-bg) !important;
  color: var(--ostrum-selection-on-light-text) !important;
}

/* Explicit Dark Surfaces: white highlight on deep burgundy text */
[data-selection-surface="dark"] ::selection,
.selection-surface-dark ::selection {
  background-color: var(--ostrum-selection-on-dark-bg) !important;
  color: var(--ostrum-selection-on-dark-text) !important;
}

/* Explicit Light Surfaces & Coral Cards (including when nested inside dark containers) */
[data-selection-surface="light"] ::selection,
[data-selection-surface="coral"] ::selection,
[data-testid="contact-form-panel"] ::selection,
[data-selection-surface="dark"] [data-selection-surface="light"] ::selection,
[data-selection-surface="dark"] [data-selection-surface="coral"] ::selection,
[data-selection-surface="dark"] [data-testid="contact-form-panel"] ::selection {
  background-color: var(--ostrum-selection-on-light-bg) !important;
  color: var(--ostrum-selection-on-light-text) !important;
}
```

---

## 4. Playwright Automated Verification Matrix (10 Surfaces)

Automated verification executed via `node scripts/verify_text_selection_contrast.mjs` against the production build:

| ID | Surface Tested | Surface Type | Expected Highlight | Selection Text Snippet | Status | Screenshot Artifact |
|---|---|---|---|---|---|---|
| **01** | White Email Tile (Footer) | `light` | `#64120F` / `#FFFFFF` | `"Prefer mail?..."` | **PASS ✓** | [`01_footer_email_tile.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/01_footer_email_tile.png) |
| **02** | Coral Project Card (Footer) | `coral` | `#64120F` / `#FFFFFF` | `"Ready to build?..."` | **PASS ✓** | [`02_footer_coral_project_tile.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/02_footer_coral_project_tile.png) |
| **03** | Deep Burgundy Footer Base | `dark` | `#FFFFFF` / `#64120F` | `"Engine..."` | **PASS ✓** | [`03_footer_directory_base.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/03_footer_directory_base.png) |
| **04** | Dark Black CTA Section | `dark` | `#FFFFFF` / `#64120F` | `"LET’S BUILD WHAT’S NEXT...."` | **PASS ✓** | [`04_cta_headline.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/04_cta_headline.png) |
| **05** | Dark Hero Section | `dark` | `#FFFFFF` / `#64120F` | `"Custom systems for today..."` | **PASS ✓** | [`05_hero_narrative.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/05_hero_narrative.png) |
| **06** | Testimonial 01 (TMR AI Car Care) | `light` | `#64120F` / `#FFFFFF` | `"We wanted a digital experience..."` | **PASS ✓** | [`06_testimonial_card_tmr.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/06_testimonial_card_tmr.png) |
| **07** | Testimonial 02 (Saraswati Driving School) | `light` | `#64120F` / `#FFFFFF` | `"OSTRUM took the time to understand..."` | **PASS ✓** | [`07_testimonial_card_saraswati.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/07_testimonial_card_saraswati.png) |
| **08** | Testimonial 03 (MNESA) | `light` | `#64120F` / `#FFFFFF` | `"Working with OSTRUM helped us..."` | **PASS ✓** | [`08_testimonial_card_mnesa.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/08_testimonial_card_mnesa.png) |
| **09** | Contact Form Input (White Panel) | `light` | `#64120F` / `#FFFFFF` | `"Balashanmugam"` | **PASS ✓** | [`09_contact_form_input_selection.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/09_contact_form_input_selection.png) |
| **10** | Legal Documents (Terms / Privacy) | `light` | `#64120F` / `#FFFFFF` | Full paragraph selection | **PASS ✓** | [`10_legal_terms_selection.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/reports/audits/artifacts/playwright/selection/10_legal_terms_selection.png) |

---

## 5. Orange Selection Regression Assertion

- **Automated Check:** `scripts/verify_text_selection_contrast.mjs` scans `app/globals.css` and all component styles for any declaration matching `#C9362B` or `#D24B2C` under `::selection` or `::-moz-selection`.
- **Result:** **PASS ✓ (0 orange selection declarations)**.
- **Verification:** Any re-introduction of orange selection will immediately fail the release gate.

---

## 6. Testimonial Card Text Selection Isolation

- **Verification:** Selecting copy within any of the three testimonial cards selects exclusively the review text and client role, without accidentally capturing the background monumental `TESTIMONIALS` heading.
- **Implementation:** The background heading is rendered with `select-none` and `pointer-events-none` in a background layer (`z-10`), while the card stack operates on `z-20` with `select-text`.
