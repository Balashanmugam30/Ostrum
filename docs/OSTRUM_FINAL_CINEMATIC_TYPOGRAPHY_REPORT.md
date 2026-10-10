# Ostrum Final Cinematic Typography, Compact Line Spacing, Client-Focused Copy & Sequential Reveal

**Delivery Report & Quality Certification**  
*Date: 11 October 2026*  
*Target Environment: Next.js 15 Production Build (`http://localhost:3000`)*

---

## 1. Executive Summary

This engineering release completes the final typography and narrative choreography refinements for the Ostrum cinematic 3D scroll experience, directly adhering to the [Ignite Agency](https://igniteagency.com/) visual reference and user specifications:

1. **One Commanding Message Per Beat:** Eliminated the competing secondary paragraphs across Beats 01 to 04. Each beat now presents a single, confident, client-focused statement alone with the central 3D Möbius sculpture.
2. **Compact Vertical Rhythm & Tight Leading:** Evaluated and implemented a compact line-height ratio of **1.08** (`leading-[1.08]`) with zero margin between wrapped lines (`my-0`). Wrapped lines now read as one tight, unified typographic block without awkward vertical stretching or glyph collisions.
3. **Wider Responsive Composition (~88vw):** Expanded the text container to `w-[88vw] max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8` (measured at exactly **1451px / 88.0%** of available viewport width at 1649px display width).
4. **Three-Line Desktop Ceiling with Balanced Breaks:** Enabled CSS `text-wrap: balance` in the offscreen layout detection engine, producing perfectly balanced multi-line statements. On desktop:
   - Beat 01: 1 line ("Your business should work better.")
   - Beat 02: 1 line ("Your tools should work together.")
   - Beat 03: 2 lines ("We build websites, software and" / "automation that work together.")
   - Beat 04: 1 line ("Got a problem existing products cannot solve?")
   - Beat 05: 1 main line ("Ready for what comes next?") + 1 subline ("Build it with OSTRUM.")
   Every statement easily satisfies the $\le 3$ desktop lines limit.
5. **Authentic Deep Crimson Accent on OSTRUM Only:** In the final supporting line, ONLY the brand word `OSTRUM` receives the deep crimson accent (`#C01832`, RGB: 192, 24, 50), removing the previous saturated coral-orange and drop shadow glow. All other words and earlier beats remain pure white (`#ffffff`).
6. **Sequential Letter-by-Letter Reveal:** Line 1 reveals character-by-character from left to right $\to$ reaches 100% $\to$ Line 2 begins revealing letter-by-letter $\to$ completes $\to$ intentional reading hold $\to$ dissolve. Reverse scrolling reverses the exact sequence smoothly.

---

## 2. Narrative Copy & Structure

| Beat | Index | Statement Copy | Supporting Line | Typography Style |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `01` | **Your business should work better.** | *(None)* | Display Sans 500, `62px`, leading `1.08` |
| **02** | `02` | **Your tools should work together.** | *(None)* | Display Sans 500, `62px`, leading `1.08` |
| **03** | `03` | **We build websites, software and**<br/>**automation that work together.** | *(None)* | Display Sans 500, `62px`, leading `1.08` |
| **04** | `04` | **Got a problem existing products cannot solve?** | *(None)* | Display Sans 500, `62px`, leading `1.08` |
| **05** | `05` | **Ready for what comes next?** | **Build it with <span style="color:#C01832">OSTRUM</span>.** | Main: `62px`, Sub: `24px` (only OSTRUM crimson) |

---

## 3. Technical Architecture & Line Splitting

### A. Layout Engine Synchronization (`text-wrap: balance` + Normalized Padding)
In responsive layouts, differences between offscreen calculation containers and visible DOM containers can create discrepancies. We synchronized both containers:
- Offscreen container: `w-[88vw] max-w-[1540px] px-4 sm:px-6 md:px-8` with `style={{ textWrap: 'balance' }}`.
- Pinned stage: `overflow-hidden` with zero redundant horizontal padding.
- Inner card: `w-[88vw] max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8`.
- Rendered visual line containers: `whitespace-nowrap inline-block my-0`.

When `document.fonts.ready` completes (and upon debounced resize), the browser computes the exact word groupings based on element `offsetTop`. With `text-wrap: balance`, Beat 03 splits into:
- Line 1: `We build websites, software and` (31 characters)
- Line 2: `automation that work together.` (30 characters)

### B. Dual-Layer Line Rendering & Clip Mask
Each line is rendered with:
1. **Base Layer:** Muted grey (`rgba(255, 255, 255, 0.30)`, `text-white/30`).
2. **Fill Overlay:** Identical typography with `clipPath: inset(0 100% 0 0)`.
3. In Beat 05 supporting line:
   - "Build it with " renders with class `text-white`.
   - "OSTRUM" renders with class `text-[#C01832]`.

### C. Sequential Timeline Slicing Mathematics
For a beat with $M$ lines active over $[T_{revealStart}, T_{revealEnd}]$:
$$\Delta t_{slice} = \frac{T_{revealEnd} - T_{revealStart}}{M}$$
Line $k$ animates its clip-path from `inset(0 100% 0 0)` to `inset(0 0% 0 0)` over $[T_{revealStart} + k \Delta t, T_{revealStart} + (k + 1) \Delta t]$. Line $k+1$ remains strictly at 0% revealed until line $k$ reaches 100%.

---

## 4. Playwright Verification Results

The automated audit suite [`scripts/verify_cinematic_typography.js`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/scripts/verify_cinematic_typography.js) tested 26 assertions across 7 viewports against the live production build (`http://localhost:3000`).

### Test Summary
- **Total Tests:** 26
- **Passed:** 26
- **Failed:** 0
- **Console Errors:** 0

### Measured Metrics

| Metric | Target | Measured Value | Status |
| :--- | :--- | :--- | :--- |
| **Container Width** | $84\text{--}90\text{vw}$ | `1451px` on 1649px width (**88.0%**) | **PASS** |
| **Primary Font Size** | Display clamp | `62.0px` (desktop) | **PASS** |
| **Primary Font Weight** | Medium (500) | `500` across all 6 lines | **PASS** |
| **Primary Line Height** | Tight ($1.0\text{--}1.1$) | `66.96px` (ratio **1.08**) | **PASS** |
| **Beat 01 Line Count** | $\le 3$ lines | **1 line** | **PASS** |
| **Beat 02 Line Count** | $\le 3$ lines | **1 line** | **PASS** |
| **Beat 03 Line Count** | $\le 3$ lines | **2 lines** | **PASS** |
| **Beat 04 Line Count** | $\le 3$ lines | **1 line** | **PASS** |
| **Beat 05 Line Count** | $\le 3$ lines | **1 line main + 1 line sub** | **PASS** |
| **Supporting Lines in 01--04** | 0 supporting | **0 lines** | **PASS** |
| **Supporting Lines in 05** | 1 supporting | **1 line ("Build it with OSTRUM.")** | **PASS** |
| **Crimson Accent Word** | Only `OSTRUM` | `OSTRUM` (**6 chars in #C01832**) | **PASS** |
| **Non-white chars in 01--04**| 0 colored | **0 chars** (100% white) | **PASS** |
| **Beat 03 Sequential Slicing**| Line 2 at 0% while Line 1 fills | Line 1: `38.9%`, Line 2: `0.0%` | **PASS** |
| **Beat 03 Line 1 Finish** | Line 1 100%, Line 2 starts | Line 1: `100.0%`, Line 2: `0.0%` | **PASS** |
| **Beat 03 Line 2 Fill** | Line 2 fills after Line 1 | Line 1: `100.0%`, Line 2: `49.6%` | **PASS** |
| **Beat 05 Sequential Slicing**| Main statement finishes before sub | Main: `98.2%`, Sub: `0.0%` | **PASS** |
| **Final Beat Reading Hold** | Holds at 100% through 1.00 | **100% fill held through 1.00** | **PASS** |
| **Reverse Scroll Smoothness** | Reverses fill progress | Reverses smoothly back to 0% | **PASS** |

### Multi-Viewport Responsiveness (7 Device Viewports)

| Viewport | Dimensions | Container Width | Ratio | Font Size | Overflow | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop Large** | 1920 × 1080 | 1540px | 80.2% (max) | 62.0px | False | **PASS** |
| **Desktop Target** | 1649 × 926 | 1451px | 88.0% | 62.0px | False | **PASS** |
| **Desktop Standard**| 1440 × 900 | 1267px | 88.0% | 54.7px | False | **PASS** |
| **Small Laptop** | 1280 × 800 | 1126px | 88.0% | 48.6px | False | **PASS** |
| **Tablet Landscape**| 1024 × 768 | 901px | 88.0% | 38.9px | False | **PASS** |
| **Mobile Large** | 390 × 844 | 343px | 88.0% | 28.0px | False | **PASS** |
| **Mobile Small** | 375 × 812 | 330px | 88.0% | 28.0px | False | **PASS** |

---

## 5. Verification Screenshots & Evidence

The following visual audit artifacts are generated and preserved:
- `chk-cine-01-beat01-initial.png`: Beat 01 entering in muted grey.
- `chk-cine-02-beat01-midway.png`: Beat 01 line 1 midway through letter reveal.
- `chk-cine-03-beat01-complete.png`: Beat 01 fully filled in solid white.
- `chk-cine-04-beat02-tools.png`: Beat 02 fully filled single statement.
- `chk-cine-05-beat03-line1-midway-line2-zero.png`: Beat 03 line 1 midway while line 2 is strictly 0%.
- `chk-cine-06-beat03-line1-complete-line2-zero.png`: Beat 03 line 1 complete while line 2 is at 0%.
- `chk-cine-07-beat03-line2-midway.png`: Beat 03 line 2 revealing sequentially.
- `chk-cine-08-beat03-all-lines-filled.png`: Beat 03 fully filled with balanced lines.
- `chk-cine-09-beat04-problem-products.png`: Beat 04 fully filled single statement.
- `chk-cine-10-beat05-main-complete-supporting-zero.png`: Beat 05 main statement complete while supporting line is at 0%.
- `chk-cine-11-beat05-supporting-crimson-ostrum.png`: Beat 05 completed with deep crimson `#C01832` on `OSTRUM`.
- `chk-cine-12-reading-hold.png`: Final reading hold.
- `chk-cine-13-reverse-scroll-midway.png`: Reverse scroll midway restoration.
- `chk-cine-14-reverse-scroll-stage0.png`: Full reversal back to Stage 0 black void.
- `vp-cine-*.png`: Responsive viewport captures from 375px to 1920px.

---

## 6. Certification

The Ostrum cinematic 3D scroll narrative now delivers a focused, high-contrast, commanding presentation. Each message communicates clearly to prospective clients with tight vertical rhythm, balanced line wrapping, strictly serialized letter reveals, and a deep crimson accent on `OSTRUM`.
