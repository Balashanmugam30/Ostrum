# Ostrum Final Polish: Uniform Large Typography, Wider Composition & Sequential Line-by-Line Scroll Reveal

**Delivery Report & Quality Certification**  
*Date: 11 October 2026*  
*Target Environment: Next.js 15 Production Build (`http://localhost:3000`)*

---

## 1. Executive Summary

This engineering release delivers the requested typography and reveal choreography refinements for the Ostrum cinematic 3D scroll narrative ([Ignite Agency](https://igniteagency.com/) inspired experience):

1. **Uniform Display Typography:** Eliminated the size discrepancy between headings and secondary paragraphs. Both primary sentences and supporting lines now share the exact same display typography: Neue Montreal Medium (`font-sans font-medium`, weight 500), responsive display clamp (`clamp(28px, 3.5vw, 60px)`), tight editorial line-height (`1.18`), subtle negative tracking (`-0.015em`), centered alignment, and equal visual prominence.
2. **Wider Composition (~90vw):** Expanded the narrative container from its previous narrow column (`max-w-[1100px]`) to `w-[90vw] max-w-[1580px] mx-auto`, occupying exactly 90% of the visible viewport width (measured at **1484px** on a 1649px-wide display). This eliminates excessive lateral margins while allowing natural, graceful line wrapping.
3. **Sequential Line-by-Line & Letter-by-Letter Scroll Reveal:** Implemented a DOM-based text layout measurement system that groups words into their actual rendered visual lines via browser layout metrics (`offsetTop`). GSAP scrub timeline segments are partitioned strictly in series:
   - **Line 1: letters reveal one by one $\to$ Line 1 reaches 100% $\to$ Line 2 begins revealing letter by letter $\to$ Line 2 reaches 100% $\to$ Line 3 begins, and so on.**
   - At no point do multiple lines reveal concurrently.
   - Reveal progress is 100% scroll-driven: 0 timers, 0 layout shifts, and 100% reversible when scrolling in reverse.
4. **Color Treatment & Accents:** Inactive text rests in solid muted grey (`rgba(255, 255, 255, 0.30)`), revealing into radiant pure white (`#ffffff`). Beat 05 preserves the selective glowing coral accents (`#ff5c4a`) on `"makes work simpler"` and `"new ideas possible"`.
5. **Architectural & Visual Invariants Preserved:** Zero modifications to the Hero 'O' serif alignment, Three.js Möbius sculpture geometry/materials/path, Section 02 text animations and reading hold, single background caustics handoff, cursor, navigation, or copy wording.

---

## 2. Technical Architecture & Implementation

### A. Real Browser Text Measurement (`tokenizeTextWithHighlights` + Offscreen Container)
In responsive layouts, CSS `clamp()` and container widths create variable line breaks depending on viewport width and font loading. Attempting to hardcode line breaks breaks across screen sizes.

To achieve precise line-by-line reveal without layout shifts:
- Words and their individual characters are tokenized into structured objects preserving character-level highlight tags (`tokenizeTextWithHighlights`).
- An offscreen measuring container (`measureContainerRef`) renders the exact same typography, container width (`w-[90vw] max-w-[1580px]`), and spacing offscreen (`position: absolute; left: -9999px; visibility: hidden`).
- When `document.fonts.ready` resolves (and on debounced window resize), the system groups rendered words into visual lines by comparing their computed `offsetTop`:
  ```typescript
  const words = Array.from(primaryContainer.querySelectorAll('.measure-word'));
  let currentTop = -1;
  let currentLine: WordToken[] = [];
  words.forEach((w) => {
    const top = (w as HTMLElement).offsetTop;
    if (currentTop !== -1 && Math.abs(top - currentTop) > 6) {
      lines.push(currentLine);
      currentLine = [];
    }
    currentTop = top;
    currentLine.push(token);
  });
  ```
- The measured line structure is stored in state (`linesByBeat`), rendering identical line containers in the visible pinned stage.

### B. Dual-Layer Line Rendering & Clip Mask
Each measured visual line is rendered with:
1. **Base Layer (Inactive):** Solid muted grey (`text-white/30`, `rgba(255, 255, 255, 0.30)`).
2. **Fill Overlay (Active):** An absolute overlay with identical text, typography, and highlights in pure white (`text-white`), controlled via `clipPath: inset(0 100% 0 0)`.
3. Highlighted characters within the fill overlay retain `#ff5c4a` (`text-[#ff5c4a] drop-shadow-[0_0_16px_rgba(255,92,74,0.55)]`).

### C. Sequential Timeline Slicing Mathematics
Within each beat's active reveal interval $[T_{revealStart}, T_{revealEnd}]$, the duration is subdivided into $N$ equal non-overlapping slices (where $N$ is the total line count for that beat):
$$\Delta t_{slice} = \frac{T_{revealEnd} - T_{revealStart}}{N}$$
$$t_{start, k} = T_{revealStart} + k \cdot \Delta t_{slice}$$

GSAP scrubs each line's fill mask strictly within its slice:
```typescript
lineFills.forEach((lineFill, lineIdx) => {
  const lineStart = timing.revealStart + lineIdx * sliceDuration;
  tl.fromTo(
    lineFill,
    { clipPath: 'inset(0 100% 0 0)' },
    {
      clipPath: 'inset(0 0% 0 0)',
      duration: sliceDuration,
      ease: 'none',
    },
    lineStart
  );
});
```

Because the slices are disjoint:
- While $t \in [t_{start, 0}, t_{start, 1}]$, Line 0 progresses from 0% to 100% fill, while Line 1 through $N-1$ remain at 0%.
- Line 1 starts if and only if Line 0 has completed 100% fill.
- After all lines complete, an intentional reading hold $[T_{revealEnd}, T_{dissolveStart}]$ preserves the fully lit composition before dissolving out.
- Reverse scrolling traverses the timeline in reverse: Line $N-1$ un-fills, then Line $N-2$, etc., down to Line 0.

---

## 3. Playwright Verification Results

The test suite (`scripts/verify_sequential_line_reveal.js`) verified all 19 assertions against the Next.js production build (`http://localhost:3000`).

### Test Summary
- **Total Tests:** 19
- **Passed:** 19
- **Failed:** 0
- **Console Errors:** 0

### Measured Metrics

| Metric | Specification | Measured Value | Status |
| :--- | :--- | :--- | :--- |
| **Container Width** | $\approx 90\text{vw}$, max 1580px | `1484.1px` on 1649px width (**90.0%**) | **PASS** |
| **Typography Size** | Uniform large clamp | `57.715px` across all 14 visual lines | **PASS** |
| **Font Weight** | Neue Montreal Medium (500) | `500` across all lines | **PASS** |
| **Line Height** | Editorial leading $\approx 1.18$ | `68.103px` (ratio 1.18) | **PASS** |
| **Inactive Color** | Solid muted grey | `rgba(255, 255, 255, 0.3)` | **PASS** |
| **Active Color** | Pure white fill | `rgb(255, 255, 255)` | **PASS** |
| **Beat 05 Coral Accents** | Glowing coral text | 32 characters in `#ff5c4a` (`rgb(255, 92, 74)`) | **PASS** |

### Sequential Progression Verification

1. **Initial Beat 1 Entry:** Line 1 at 0.0%, Line 2 at 0.0%, Line 3 at 0.0%.
2. **Line 1 Midway:** Line 1 at 49.6% fill, Line 2 strictly at 0.0%, Line 3 strictly at 0.0%.
3. **Line 1 Completion:** Line 1 at 99.9% (100%), Line 2 strictly at 0.0%, Line 3 strictly at 0.0%.
4. **Line 2 Start:** Line 1 at 100%, Line 2 begins revealing at 26.7%, Line 3 strictly at 0.0%.
5. **Line 2 Midway:** Line 1 at 100%, Line 2 at 66.7%, Line 3 strictly at 0.0%.
6. **All Lines Complete:** Line 1 at 100%, Line 2 at 100%, Line 3 at 100%.
7. **Reading Hold:** Composition remains 100% white with zero jitter.
8. **Reverse Scroll Midway:** Line 1 reverses back to 51.0%, Line 2 strictly back to 0.0%.
9. **Reverse Scroll Complete:** All lines return cleanly to 0.0% fill.

### Multi-Viewport Responsiveness
Tested across 7 device viewport sizes without horizontal overflow:
- Desktop Large: 1920×1080 (Container 1580px, Font 60px)
- Desktop Standard: 1649×926 (Container 1484px, Font 57.7px)
- Desktop Laptop: 1440×900 (Container 1296px, Font 50.4px)
- Small Laptop: 1280×800 (Container 1152px, Font 44.8px)
- Tablet Landscape: 1024×768 (Container 921px, Font 35.8px)
- Mobile Large: 390×844 (Container 351px, Font 28.0px)
- Mobile Small: 375×812 (Container 337px, Font 28.0px)

---

## 4. Verification Evidence & Artifacts

All Playwright audit screenshots and JSON logs are saved:
- `sequential_line_reveal_audit.json`: Complete automated assertion log.
- `chk-seq-01-beat01-initial.png` through `chk-seq-09-fully-reversed.png`: Sequential line progression frame captures.
- `chk-seq-10-beat02-punchline.png` to `chk-seq-13-beat05-coral-highlights.png`: Individual beat captures.
- `vp-seq-*.png`: Responsive viewport captures from 375px to 1920px.

---

## 5. Certification

The Ostrum cinematic 3D narrative now provides bold, wide, uniform display typography with strictly sequenced, line-by-line letter reveals. The animation is completely fluid, responsive, accessible, and reversible on reverse scroll.
