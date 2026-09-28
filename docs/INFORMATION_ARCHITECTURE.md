# Ostrum — Information Architecture & Sitemap Blueprint

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Scope:** Full Website Sitemap, Routing Hierarchy, User Journeys, and Navigation Logic  

---

## 1. Architectural Strategy: The Hybrid Narrative Model

Ostrum utilizes a **Hybrid Narrative Architecture**:
- **The Homepage (`/`)** functions as a complete, single-scroll persuasion engine. A visitor can understand Ostrum's positioning, experience the connected system model, explore capabilities, view selected work, configure an interactive stack, and initiate contact without leaving the page.
- **Deep Dedicated Routes (`/work`, `/insights`, `/contact`)** provide proof, case-study depth, thought leadership, and friction-free inquiry flows for visitors seeking deeper verification or immediate project kickoff.

This model avoids the trap of trapping everything inside a single endless page, while also eliminating the fragmentation of forcing visitors to click through 12 separate empty subpages just to understand what Ostrum builds.

---

## 2. Complete Sitemap & Route Tree

```text
/
├── (Home: 15-Stage Scroll Narrative)
│
├── /work
│   ├── (Work Index: Categorized, Sector-Filtered, Outcome-Driven)
│   └── /work/[slug]
│       └── (Dedicated Case Study: Problem, Architecture, Systems, Outcomes)
│
├── /insights
│   ├── (Insights & Experiments Index: AI, Architecture, Operations, Brand)
│   └── /insights/[slug]
│       └── (Long-Form Technical Essay / Industry Teardown)
│
├── /contact
│   └── (Interactive Project Qualifier & Consultation Booking Flow)
│
├── /privacy
│   └── (Data Governance, GDPR/DPDP Compliance, AI Usage Disclosure)
│
└── /terms
    └── (Master Services Agreement & Website Terms)
```

---

## 3. Route Specifications & Hierarchy

### 1. `/` (Homepage)
- **Primary Goal:** Convert executive skepticism into conviction by demonstrating how Ostrum unifies brand, experiences, business systems, and AI automation.
- **Narrative Stages:** 15 progressive scroll chapters (detailed in `HOMEPAGE_WIREFRAME.md`).
- **Primary CTA:** `Start a Project ↗` (opens docked drawer or navigates to `/contact`).
- **Secondary CTA:** `Explore Selected Work ↓` (smooth scrolls to Work chapter).

### 2. `/work` (Work & Case Study Index)
- **Primary Goal:** Provide undeniable proof of craft, technical execution, and business impact.
- **Structure:**
  - Hero: Editorial statement on systemic engineering + filter pills (`All Work`, `Enterprise & ERP`, `Digital Products`, `AI & Automation`, `Education Systems`, `Commerce`).
  - View Toggle: `Editorial View` (large visual case cards with architecture callouts) vs. `Index View` (compact tabular matrix showing client, sector, stack, and deliverables).
  - Selected Case Studies (initial curated set of 4–6 anchor studies).
  - Bottom Banner: Callout to configure a custom stack via `/contact`.

### 3. `/work/[slug]` (Deep Modular Case Study)
- **Primary Goal:** Demonstrate end-to-end thinking: how Ostrum discovered the problem, designed the brand/UI, engineered the systems, and automated operations.
- **Standardized Sections:**
  1. Executive Meta: Client name, industry, timeline, core services, live link (if public).
  2. The Challenge: The operational fragmentation or market gap faced.
  3. The Strategy & System Architecture: Interactive or high-res system diagram showing how frontend, backend, CRM, and AI connect.
  4. Brand Craft & Experience Design: Typography, UI components, interface design.
  5. The Technical Build: Tech stack choices, database architecture, edge performance.
  6. Automation & AI in Action: Live workflow walkthrough (e.g., WhatsApp lead capture to ERP inventory dispatch).
  7. Verifiable Outcomes: Truthful business metrics or architectural milestones achieved.
  8. Next Project Link + Direct Inquiry CTA.

### 4. `/insights` (Ostrum Lab & Thought Leadership)
- **Primary Goal:** Establish technical authority in the AI and digital transformation ecosystem.
- **Topics:**
  - "Why Modern Enterprises Need Unified System Architectures Over Fragmented SaaS."
  - "Designing Autonomous Voice & WhatsApp Agents That Don't Frustrate Customers."
  - "Next-Gen Campus ERP: Modernizing Admissions, Fee Reconciliation, and Student Portals."
  - "The Death of Generic Agency Design: Why Craft & Systems Win in 2026."

### 5. `/insights/[slug]` (Long-Form Article)
- **Format:** High-legibility editorial reading layout with reading progress bar, table of contents, technical callout blocks, code/diagram snippets, author attribution, and related articles.

### 6. `/contact` (Interactive Project Inquiry & Consultation)
- **Primary Goal:** Collect high-quality, pre-qualified inquiries without intimidating the user with a tedious 20-field form.
- **Flow:**
  - Stage 1: "What are you looking to build?" (Multi-select capability pills: New Web Product, Custom ERP/CRM, AI Agents, Rebrand, Campus System, Growth Engine).
  - Stage 2: "Where are you in the journey?" (New Venture / Existing Organization / Modernizing Legacy Infrastructure).
  - Stage 3: Scope, Timeline & Approximate Investment Tier.
  - Stage 4: Contact Information (Name, Email, Phone/WhatsApp, Organization URL, Project Details).
  - Alternative Path: Direct calendar link to book a 30-minute discovery call with an Ostrum partner.

### 7. `/privacy` & `/terms` (Legal & Governance)
- **Format:** Clean, single-column legal typography adhering to international privacy standards (GDPR, California CCPA, India DPDP Act), explicit disclosures regarding client data isolation, and ethical AI usage guidelines.

---

## 4. Key User Journeys

### User Journey 1: The Frustrated Founder / COO
```text
Arrives via Referral or Search 
  → Lands on Homepage Hero
  → Scrolls through "Business Problem / Fragmentation" (Immediate resonance)
  → Interacts with "The Ostrum System" diagram (Understands the 5-layer model)
  → Explores "Build Your Digital Stack" interactive tool (Selects Web App + CRM + AI Agent)
  → Clicks "Review Stack & Inquire"
  → Landed on Pre-filled Contact Qualifier with selections saved
  → Submits inquiry and receives instant confirmation
```

### User Journey 2: The Higher-Ed Trustee / School Administrator
```text
Arrives on Homepage via Education Systems search
  → Notices "Education Systems for Schools & Colleges" capability
  → Clicks through to `/work` → Filters by "Education Systems"
  → Reads Campus ERP Case Study (Explores admission funnel + fee portal diagrams)
  → Verifies role-based security, parent portal UX, and WhatsApp attendance alerts
  → Clicks "Schedule Campus Systems Consultation"
  → Selects preferred time slot on calendar
```

### User Journey 3: The Design-Obsessed Scale-Up CMO
```text
Arrives seeking award-level rebrand and web experience
  → Observes light-first, architectural typography and kinetic motion
  → Validates aesthetic rigor (No cyberpunk clichés, Swiss editorial precision)
  → Reads Insights article on "Brand Systems Inside Digital Products"
  → Navigates to `/work/[slug]` to examine visual identity guidelines and web apps
  → Clicks floating `Start a Project ↗` CTA to submit RFP details
```

---

## 5. Navigation & Persistent Shell Behavior

### Primary Header (Desktop)
- **Height:** 72px (fixed/sticky with subtle backdrop blur `rgba(251, 251, 252, 0.85)`).
- **Left:** Ostrum Wordmark (Vector SVG, obsidian `#0E1017`, 20px height) + subtle live status dot (`● Available for Q4 2026`).
- **Center:** Main Links:
  - `Work` (`/work`)
  - `Capabilities` (`/#capabilities` on home, or smooth anchor)
  - `System` (`/#system`)
  - `Insights` (`/insights`)
- **Right:** Primary Action: Pill button `Start a Project ↗` (Cobalt fill `#0A4DDE`, white text, 40px height).

### Mobile Navigation (Under 768px)
- **Header:** Ostrum logo left, clean hamburger toggle right (`48px x 48px` tap target).
- **Mobile Menu Overlay:** Fullscreen light-first sheet (`#FBFBFC`), oversized display typography for routes, contact information, social links, and an prominent `Start a Project` button at bottom.
