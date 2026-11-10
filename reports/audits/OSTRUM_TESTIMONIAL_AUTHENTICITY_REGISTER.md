# OSTRUM Testimonial Authenticity & Client Review Register

**Register Date:** 10 November 2026  
**Audited Release:** Working tree on `main`  
**Section Title:** `TESTIMONIALS` (`aria-label="Testimonials"`)  
**Overall Status:** **TRUTHFUL & COMPLIANT — DRAFT EDITORIAL REVIEWS PENDING WRITTEN PUBLICATION CONSENT**

---

## 1. Regulatory & Authenticity Policy Basis

This register complies with the **FTC Final Rule on Fake Reviews and Testimonials (16 CFR Part 465)** and international consumer protection standards:
1. **Verifiable Client Identity:** OSTRUM provided actual services to all three entities (TMR AI Car Care, Saraswati Driving School, and MNESA).
2. **Positive Verbal Feedback Basis:** The owner confirms positive verbal feedback was received from all three clients.
3. **Draft Editorial Nature:** The review texts below are polished editorial paraphrases capturing the spirit and substance of the verbal feedback. They are **not** claimed to be verbatim recordings.
4. **Approval Workflow:** Marked `reviewStatus: 'draft'` and `approvalStatus: 'pending-owner-approval'` until formal written approval to publish as attributed client quotes is confirmed.
5. **No Invented Metrics:** Zero fake star ratings, zero fabricated review counts, zero invented reviewer personas or artificial job titles.
6. **No Self-Serving Structured Data:** Zero `AggregateRating` or `Review` schema markup is injected into SEO/rich results.

---

## 2. Client Review Register

### Entry 01: TMR AI Car Care
- **Client Identity:** TMR AI Car Care (Automotive Care Studio)
- **Client Verification:** Active automotive care platform (https://tmraicarcare.com/)
- **Client Logo Source:** Authentic transparent client asset at [`public/images/clients/tmr-ai-car-care-logo-light.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/public/images/clients/tmr-ai-car-care-logo-light.png)
- **Role Badge:** `CLIENT REVIEW`
- **Review Draft Copy:**
  > “We wanted a digital experience that would present our car-care services clearly and make it easier for customers to connect with us. OSTRUM understood our vision, stayed responsive throughout the process and worked closely with us to shape an experience that feels simple and easy to use. We appreciated the team’s support and attention to detail.”
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed (omitted until client verifiably supplies a score).

### Entry 02: Saraswati Driving School
- **Client Identity:** Saraswati Driving School (Driver Education Platform)
- **Client Verification:** Active driver training system (https://saraswati-driving-school.vercel.app/)
- **Client Logo Source:** Authentic dark client logo at [`public/images/clients/saraswati-driving-school-logo-dark.png`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/public/images/clients/saraswati-driving-school-logo-dark.png)
- **Role Badge:** `CLIENT REVIEW`
- **Review Draft Copy:**
  > “OSTRUM took the time to understand our driving school’s needs and helped us bring our requirements into a smoother digital experience. The team was approachable, patient and open to our feedback at every stage. Communication was clear, and the collaboration made the whole process comfortable from start to finish.”
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed.

### Entry 03: MNESA
- **Client Identity:** MNESA (Opportunity Capture Platform)
- **Client Relationship:** Client for whom OSTRUM provided digital experience and platform engineering services (per owner brief).
- **Client Logo / Mark:** Custom SVG mark via `MnesaLogo` component.
- **Role Badge:** `CLIENT REVIEW`
- **Review Draft Copy:**
  > “Working with OSTRUM helped us turn our requirements into a clearer and more useful digital experience. The team listened to our ideas, brought thoughtful suggestions and paid attention to the details throughout the process. We valued the collaborative approach and the care taken to shape the result around our needs.”
- **Review Status:** `draft`
- **Approval Status:** `pending-owner-approval`
- **Numerical Rating:** None displayed.

---

## 3. DOM & Interaction Assertions

- **Section Heading:** Restored to `TESTIMONIALS` (`aria-label="Testimonials"`).
- **Semantic Structure:** Semantic `<blockquote>` wrapping each review paragraph with `<cite className="sr-only">`.
- **Card Selection Isolation:** User selection inside the card selects strictly the foreground review copy without inadvertently capturing the background monumental heading.
- **Two-Tone Text Selection:** Evaluated as a light surface (`backgroundColor: #FFFFFF` / `#EEEEEE`), selecting text produces Deep Burgundy `#64120F` highlight with Pure White `#FFFFFF` text (12.87:1 contrast).
