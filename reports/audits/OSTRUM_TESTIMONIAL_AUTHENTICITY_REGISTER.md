# OSTRUM Testimonial & Case Study Authenticity Register

**Audit Date:** 10 November 2026, 12:37 IST  
**Target Repository:** `Balashanmugam30/Ostrum`  
**Dataset Inspected:** `data/testimonials.ts`  
**Section Component:** `components/sections/OstrumTestimonialsSection.tsx`  

---

## 1. Regulatory Context & Platform Trust Compliance

Under Google’s Search Central Review Snippet Guidelines and the FTC’s 2024 Final Rule Banning Fake Reviews and Testimonials (16 CFR Part 465):
1. **No Fabricated Endorsements:** Businesses are strictly prohibited from generating, rewriting, or publishing fake customer feedback, inventing reviewer personas, or repurposing external customer reviews of client businesses as reviews of the engineering agency.
2. **No Unsubstantiated Star Ratings:** Aggregating five-star ratings or publishing self-serving review counts without verifiable, third-party consumer feedback violates search quality standards and risks search indexing penalties or FTC enforcement.
3. **Transparent Differentiation:** Case studies, project summaries, and technical deliverables must be clearly distinguished from consumer testimonial endorsements.

---

## 2. Source-of-Truth Dataset Audit (`data/testimonials.ts`)

| Card ID | Entity / Scope | Raw Record Status | Display Category Badge | Truthful Published Summary | Quotation Marks | Star Ratings |
|---|---|---|---|---|---|---|
| `tmr-ai-car-care` | TMR AI Car Care (Automotive Detailing Platform) | `contentType: 'project-highlight'`, `approved: false`, `isPlaceholder: true` | `PROJECT HIGHLIGHT` | "A digital platform bringing service discovery, customer enquiries and bookings together for an automotive care business." | **None** | **None** |
| `saraswati-driving-school` | Saraswati Driving School (Fleet & Lesson Dispatch) | `contentType: 'project-highlight'`, `approved: false`, `isPlaceholder: true` | `PROJECT HIGHLIGHT` | "A scheduling and booking platform supporting student lessons, training schedules and vehicle coordination." | **None** | **None** |
| `mnesa` | MNESA (OSTRUM Internal Venture) | `contentType: 'project-note'`, `approved: true`, `isPlaceholder: false` | `OSTRUM VENTURE` | "An OSTRUM venture exploring a simpler way to capture ideas, organise commitments and turn them into action." | **None** | **None** |

---

## 3. Section Title & Visual Nomenclature

- **Section Title:** Updated from `TESTIMONIALS` to `PROJECT HIGHLIGHTS`.
- **Accessible Name:** `aria-label="Project Highlights"`.
- **Monumental Background H2:** Renders `PROJECT HIGHLIGHTS` at responsive condensed scale (`clamp(2rem, 14vw, 220px)`), with zero horizontal overflow across mobile and desktop.
- **Card Selection Isolation:** User selection inside the card selects strictly the foreground project copy without inadvertently capturing the background monumental heading.

---

## 4. Criteria for Future Genuine Testimonials

Customer feedback will only be converted to genuine testimonial quotes when all six conditions are met:
1. Verbatim customer-written feedback received directly from the client.
2. Verified reviewer identity, official title, and organization.
3. Written permission and release to publish the name, corporate logo, and quotation.
4. Documented proof of project delivery by OSTRUM.
5. Verifiable rating score with authentic scale and date stamp.
6. Transparent disclosure of any material partnership or commercial arrangement.
