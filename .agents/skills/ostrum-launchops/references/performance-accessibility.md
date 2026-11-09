# Performance and accessibility playbook

## 1. Performance baseline

Measure a production build. Record the URL/route, commit, device profile, browser, network settings, cache state, test repetition, tool version and raw report path.

Core Web Vitals good thresholds at the 75th percentile:

- LCP: ≤ 2.5 seconds;
- INP: ≤ 200 milliseconds;
- CLS: ≤ 0.1.

Use Lighthouse/PageSpeed for lab diagnosis, and Search Console/CrUX/field telemetry for real-user status when enough traffic exists. A low-traffic new site may have no field data; state that instead of inventing a pass.

## 2. Images and visual assets

- Find the actual LCP image/element first.
- Use responsive image components with accurate `sizes` and width/height or aspect-ratio reservations.
- Give eager/priority loading only to the true above-the-fold LCP image where appropriate.
- Lazy-load non-critical below-fold images; do not lazy-load the LCP image.
- Check file weight, intrinsic dimensions, crop, compression artefacts and network transfer. Next/Image or host image optimisation may already negotiate modern formats; do not blindly convert every source file.
- Keep project artwork crisp; compare visual output before/after.
- Test on mobile network and low-memory devices.

## 3. JavaScript, animation and WebGL

- Profile initial route JavaScript, parse/compile/evaluate, long tasks and hydration cost.
- Use bundle analysis to find the largest chunks; do not set a universal 200 KB budget without a measurement definition.
- Defer non-critical below-fold modules only if the experience and scroll choreography remain correct.
- Test that WebGL render loops pause when the tab is hidden and, where safe, when the canvas is far offscreen.
- Handle missing WebGL, context loss, slow GPU and WebGL-disabled browser settings.
- Honour `prefers-reduced-motion`; offer useful static presentation without breaking content or navigation.
- Keep animation changes out of scope unless required for a performance/accessibility defect.

## 4. Layout stability and responsiveness

- Reserve space for images, video, embeds, fonts and asynchronous content.
- Test the minimum supported width and common mobile/tablet/desktop widths.
- Check sticky/fixed elements, safe areas, reduced viewport height, browser zoom and keyboard overlays.
- No horizontal overflow is useful, but is not a complete responsive/accessibility result.

## 5. Accessibility baseline

Automated:

- axe-core or equivalent for all important routes/states;
- HTML/ARIA validation;
- keyboard and focus regression tests;
- colour-contrast scan where reliable.

Manual:

- use the site with keyboard only (Tab, Shift+Tab, Enter, Space, Escape, arrow keys where expected);
- confirm visible focus and logical focus order;
- verify skip-to-content link and landmarks;
- confirm each form input has a persistent visible label, correct type/autocomplete and required/optional indicator;
- verify errors are announced and programmatically associated with fields; focus or announce the error summary appropriately;
- verify success feedback is announced and not only visual;
- check dialogs/menus for focus management and Escape behaviour;
- check useful alt text for meaningful images and empty alt for decorative images;
- check contrast for normal text (typically 4.5:1) and large text/UI components according to WCAG 2.2 AA;
- test 200% browser zoom and narrow reflow;
- verify reduced-motion behaviour and no flashing/strobing.

An axe pass is not a WCAG conformance certificate. A Playwright viewport matrix is not a manual keyboard or screen-reader audit.

## Official sources

- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- web.dev Web Vitals: https://web.dev/articles/vitals
- Next.js production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Next.js image component: https://nextjs.org/docs/app/api-reference/components/image
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- axe-core: https://github.com/dequelabs/axe-core
