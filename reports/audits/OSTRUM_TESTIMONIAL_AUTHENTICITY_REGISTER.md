# OSTRUM Testimonial Authenticity & Client Review Register

**Register Date:** 10 November 2026  
**Audited Release:** Working tree on `main`  
**Section Title:** `TESTIMONIALS` (`aria-label="Testimonials"`)  
**Design Reference:** Restored from commit `645722865bf95c81a088d276b0e1b296e4588cf2` (Monumental 395px background title, original card stack proportions `310/330/345px`)  
**Overall Status:** **TRUTHFUL & COMPLIANT — CONCISE DRAFT REVIEWS WITH SEMANTIC EMPHASIS PENDING WRITTEN PUBLICATION CONSENT**

---

## 1. Regulatory & Authenticity Policy Basis

This register complies with the **FTC Final Rule on Fake Reviews and Testimonials (16 CFR Part 465)** and international consumer protection standards:
1. **Verifiable Client Identity:** OSTRUM provided actual services to all three entities (TMR AI Car Care, Saraswati Driving School, and MNESA).
2. **Positive Verbal Feedback Basis:** The owner confirms positive verbal feedback was received from all three clients.
3. **Draft Editorial Nature:** The concise review texts below are natural agency-style paraphrases capturing the collaboration, communication, understanding of the brief, and delivered outcome. They are **not** claimed to be verbatim recordings.
4. **Approval Workflow:** Marked `reviewStatus: 'draft'` and `approvalStatus: 'pending-owner-approval'` until formal written approval to publish as attributed client quotes is confirmed.
5. **Semantic Emphasis:** Each review features exactly one subtly emphasized phrase rendered via semantic `<strong>` elements in the DOM (not markdown asterisks, not `dangerouslySetInnerHTML`).
6. **No Invented Metrics:** Zero fake star ratings, zero fabricated review counts, zero invented reviewer personas or artificial job titles.
7. **No Self-Serving Structured Data:** Zero `AggregateRating` or `Review` schema markup is injected into SEO/rich results.

---

## 2. Client Review Register

### Entry 01: TMR AI Car Care
- **Client Identity:** TMR AI Car Care (Automotive Care Studio)
- **Client Verification:** Active automotive care platform (https://tmraicarcare.com/)
- **Client Logo Source:** Authentic transparent client asset at `public/images/clients/tmr-ai-car-care-logo-light.png`
- **Role Badge:** `CLIENT REVIEW`
- **Review Copy:**
  > “We appreciated how OSTRUM **understood our vision**. The team was responsive, flexible and a pleasure to work with.”
- **Emphasis Target:** `understood our vision` (rendered as `<strong>understood our vision</strong>`)
- **Target Desktop Line Count:** ~2 desktop lines
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed (omitted until client verifiably supplies a score).

### Entry 02: Saraswati Driving School
- **Client Identity:** Saraswati Driving School (Driver Education Platform)
- **Client Verification:** Active driver training system (https://saraswati-driving-school.vercel.app/)
- **Client Logo Source:** Authentic dark client logo at `public/images/clients/saraswati-driving-school-logo-dark.png`
- **Role Badge:** `CLIENT REVIEW`
- **Review Copy:**
  > “They listened to our needs, kept communication **clear** and made the whole process feel smooth from start to finish.”
- **Emphasis Target:** `clear` (rendered as `<strong>clear</strong>`)
- **Target Desktop Line Count:** ~3 desktop lines
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed.

### Entry 03: MNESA
- **Client Identity:** MNESA (Opportunity Capture Platform)
- **Client Relationship:** Client for whom OSTRUM provided digital experience and platform engineering services (per owner brief).
- **Client Logo / Mark:** Custom SVG mark via `MnesaLogo` component.
- **Role Badge:** `CLIENT REVIEW`
- **Review Copy:**
  > “OSTRUM brought **clarity to our ideas** and offered thoughtful direction. Their attention to detail helped shape a practical product we feel good about.”
- **Emphasis Target:** `clarity to our ideas` (rendered as `<strong>clarity to our ideas</strong>`)
- **Target Desktop Line Count:** ~3–4 desktop lines
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed.

---

## 3. Visual & Interaction Assertions

- **Section Heading:** Restored to `TESTIMONIALS` (`aria-label="Testimonials"`).
- **Monumental Background Title:** Restored to `fontSize: 'clamp(3.2rem, 26vw, 395px)'` with `lineHeight: '0.85'`, `select-none`, and `pointer-events-none`.
- **Card Stack Proportions:** Restored to `h-[310px] sm:h-[330px] md:h-[345px]` matching commit `6457228`.
- **Semantic Structure:** Semantic `<blockquote>` wrapping each review paragraph with `<cite className="sr-only">`.
- **Card Selection Isolation:** User selection inside the card selects strictly the foreground review copy without inadvertently capturing the background monumental heading.
- **Two-Tone Text Selection:** Evaluated as a light surface (`backgroundColor: #FFFFFF` / `#EEEEEE`), selecting text produces Deep Burgundy `#64120F` highlight with Pure White `#FFFFFF` text (12.87:1 contrast).
