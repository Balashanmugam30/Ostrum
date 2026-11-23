# Ostrum design system notes

## Point of view

Ostrum should feel like a confident digital product engineering studio: cinematic, tactile and editorial, with restrained technical detail. The visual world uses deep black/obsidian and burgundy atmospheres, warm ivory type, a sculptural Möbius mark, and deliberate red accents. Keep the existing identity rather than introducing generic landing-page patterns.

## Layout and hierarchy

- Desktop uses large editorial typography, cinematic spacing, and carefully choreographed pinned sections. Keep the existing desktop Capabilities horizontal interaction unless the task explicitly redesigns it.
- Mobile uses readable, left-aligned copy where the content calls for it, touch-sized controls, and normal vertical document flow. Do not pin the six-card Capabilities list or trap touch scrolling in a horizontal scrub.
- Keep `01 / 06` through `06 / 06` in order and render each capability once.
- Give Engine’s “01 / For Business” and “02 / For What’s Next” copy readable space around its sculpture on compact screens.
- Use the light header color over light panels (Capabilities, Testimonials and FAQ), and ivory over dark visual sections. Header contrast must be checked from the underlying section, not the header’s own controls.

## Typography, color and assets

- Preserve the project’s existing font imports, size scale and CSS variables in `app/globals.css` and Tailwind configuration. Avoid introducing a new font without a brand reason.
- Use the established ivory, near-black, burgundy and restrained coral/red accent palette. Prefer existing variables/classes over repeated one-off values.
- The favicon/app icon must remain legible at small sizes and use an opaque burgundy field behind the ivory mark.
- Optimize mobile-specific images/models without deleting or altering the full-quality desktop originals. Keep source licenses and required attribution in `THIRD_PARTY_NOTICES.md`.

## Motion and accessibility

- Motion must explain state, hierarchy or spatial storytelling. Respect `prefers-reduced-motion`, keyboard navigation and focus visibility.
- GSAP/ScrollTrigger is the existing owner of pinned narrative sequences; Lenis is already synchronized with its ticker. Avoid scroll hijacking on mobile.
- Avoid animation on every element, high-frequency forced layout, decorative effects that block content, and mobile WebGL where a static visual communicates the same thing.
- Keep semantics, labels, touch targets, contrast, alt text and loading/error states intact.
