# Ostrum — Page-by-Page Wireframes & Route Specifications

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Scope:** Deep Routes, Case Study Template, Article Template, and Interactive Contact Flow  

---

## 1. Route: `/work` (Work & Case Study Index)

### Purpose & User Intent
Provide undeniable proof of technical craft, systemic thinking, and measurable client outcomes. Visitors arrive looking to verify whether Ostrum has solved problems of equal or greater complexity than their own.

### Information Hierarchy & ASCII Layout
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [HEADER NAV]                                                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   INDEX // SELECTED WORK                                               │
│                                                                        │
│   ARCHITECTURAL RIGOR.                                                 │
│   MEASURABLE IMPACT.                                                   │
│                                                                        │
│   Explore how we engineer connected digital ecosystems across brand,   │
│   software, enterprise business systems, and autonomous automation.    │
│                                                                        │
│   [ ALL WORK ]  [ ENTERPRISE & ERP ]  [ DIGITAL PRODUCTS ]             │
│   [ AI & AUTOMATION ]  [ HIGHER-ED / CAMPUS ]  [ COMMERCE ]            │
│                                                                        │
│   VIEW: [● EDITORIAL GRID]  [○ TABULAR INDEX]                          │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│   FEATURED 01 // HIGHER EDUCATION ERP & ADMISSIONS                     │
│   ┌───────────────────────────────────┬────────────────────────────┐   │
│   │ [ HIGH-RES SCREENSHOT / VIDEO ]   │ CLIENT: Campus360          │   │
│   │ Modern Parent Portal & Admissions │ SECTOR: Education Systems  │   │
│   │ Workflow Dashboard                │ TIMELINE: 14 Weeks         │   │
│   │                                   │ STACK: Next.js, Postgres,  │   │
│   │                                   │        WhatsApp AI Agent   │   │
│   │                                   ├────────────────────────────┤   │
│   │                                   │ DELIVERABLES:              │   │
│   │                                   │ • Admissions Funnel CRM    │   │
│   │                                   │ • Student & Parent Portal  │   │
│   │                                   │ • Automated Fee Engine     │   │
│   │                                   │ • WhatsApp Notification Bot│   │
│   │                                   ├────────────────────────────┤   │
│   │                                   │ [READ CASE STUDY ↗]        │   │
│   └───────────────────────────────────┴────────────────────────────┘   │
│                                                                        │
│   FEATURED 02 // HEADLESS COMMERCE & OMNICHANNEL INVENTORY             │
│   ┌───────────────────────────────────┬────────────────────────────┐   │
│   │ [ HIGH-RES SCREENSHOT ]           │ CLIENT: Aura Luxe          │   │
│   │ Sub-second Headless Storefront    │ SECTOR: Luxury Retail      │   │
│   └───────────────────────────────────┴────────────────────────────┘   │
├────────────────────────────────────────────────────────────────────────┤
│   CAN'T FIND YOUR EXACT ARCHITECTURE?                                  │
│   We engineer custom systems for complex operational requirements.     │
│   [ BUILD YOUR CUSTOM STACK ↗ ]                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [STICKY FOOTER]                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Primary CTA:** `Read Case Study ↗` (opens `/work/[slug]`).
- **Secondary CTA:** `Build Your Custom Stack ↗` (navigates to `/contact`).
- **Dynamic Content:** List of projects fetched via CMS (Sanity / Markdown MDX), reactive filtering by sector tag.
- **Reusable Components:** `Header`, `ProjectCard`, `FilterPills`, `TabularProjectRow`, `CtaBanner`, `Footer`.
- **Interactions:** Sector pill filtering with layout spring animation; view toggle switches between rich visual cards and dense Swiss tabular matrix.
- **Mobile Adaptation:** View toggle hidden on mobile (defaults to stacked single-column editorial cards).
- **SEO Intent:** Primary keyword target: "Digital transformation case studies", "Enterprise ERP and AI agency portfolio".

---

## 2. Route: `/work/[slug]` (Modular Case Study Template)

### Purpose & User Intent
Deconstruct an individual project with absolute transparency. Visitors evaluate Ostrum's discovery process, system architecture, UX decisions, technical stack, and verifiable business outcomes.

### The 8-Module Case Study Architecture
```text
┌────────────────────────────────────────────────────────────────────────┐
│ MODULE 01: HERO & METADATA OVERVIEW                                    │
│ Title: Campus360 — Integrated School ERP & Autonomous Admissions       │
│ Client: Leading South Asian Educational Foundation (5,000+ Students)   │
│ Sector: Higher Ed / K-12 • Deliverables: Rebrand, ERP, Portal, AI     │
│ Tech: Next.js 15, FastAPI, PostgreSQL, Redis, WhatsApp Cloud API       │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 02: THE OPERATIONAL CHALLENGE                                   │
│ Problem: Admissions trapped across 4 legacy software platforms.        │
│ Manual phone calls created 48-hour inquiry response delays.            │
│ Fee collection reconciliation required 3 full-time accounting staff.   │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 03: THE CONNECTED SYSTEM ARCHITECTURE                           │
│ [INTERACTIVE ARCHITECTURE TOPOLOGY DIAGRAM]                            │
│ Parent WhatsApp ──> Webhook ──> AI Agent ──> Postgres DB ──> Staff ERP │
│ Parents receive prospectus PDF in 10s; staff receives auto-scored lead │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 04: BRAND IDENTITY & DESIGN SYSTEM                              │
│ Visual language, color tokens, parent portal UI component library,     │
│ accessible typography meeting WCAG 2.2 AA standards.                   │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 05: THE ENGINEERING BUILD                                       │
│ Database schema design, role-based access control (RBAC), multi-tenant │
│ security model, and sub-100ms API response latency.                    │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 06: AGENTIC AUTOMATION IN ACTION                                │
│ Video walkthrough / interactive log playback of the WhatsApp AI agent   │
│ qualifying inquiries and scheduling campus tours in real time.         │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 07: VERIFIABLE BUSINESS OUTCOMES                                │
│ • 100% Digital Fee Reconciliation (Zero paper receipts)                │
│ • 85% Inbound Inquiries Qualified Autonomously in < 30 Seconds         │
│ • 140+ Administrative Hours Saved Monthly                              │
├────────────────────────────────────────────────────────────────────────┤
│ MODULE 08: EXPLORE NEXT CASE STUDY / INITIATE SIMILAR PROJECT          │
│ [Next Project: Aura Luxe Headless Store ↗]                             │
│ [Start a Similar Enterprise Engagement ↗]                              │
└────────────────────────────────────────────────────────────────────────┘
```

- **Primary CTA:** `Start a Similar Project ↗` (opens pre-qualified contact flow with project context attached).
- **Secondary CTA:** `Next Case Study ↗`.
- **Dynamic Content:** Full case study markdown/MDX with interactive diagrams and embedded media.
- **Reusable Components:** `CaseMetaHeader`, `SystemDiagram`, `ImageShowcase`, `CodeSnippetBlock`, `MetricsGrid`, `NextProjectFooter`.
- **SEO Intent:** Long-tail case study discoverability, structured `Project` and `CaseStudy` Schema markup.

---

## 3. Route: `/insights` (Insights & Thought Leadership)

### Purpose & User Intent
Establish industry-leading authority on systems engineering, brand longevity, and pragmatic AI adoption. Read by CTOs, CMOs, and venture-backed founders looking for nuanced perspectives rather than superficial hype.

### Information Hierarchy & ASCII Layout
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [HEADER NAV]                                                           │
├────────────────────────────────────────────────────────────────────────┤
│   INSIGHTS & EXPERIMENTS // OSTRUM LAB                                 │
│                                                                        │
│   SYSTEMIC THINKING                                                    │
│   FOR THE AGENTIC ERA.                                                 │
│                                                                        │
│   Essays, technical teardowns, and operational frameworks from the     │
│   engineers and designers at Ostrum.                                   │
│                                                                        │
│   [ ALL TOPICS ]  [ AI & AGENTS ]  [ ENTERPRISE SYSTEMS ]  [ DESIGN ]  │
├────────────────────────────────────────────────────────────────────────┤
│   FEATURED ESSAY                                                       │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ AI & AUTOMATION // ESSAY 01                                  │     │
│   │ Why Customer Chatbots Fail, and How Autonomous Multi-Step    │     │
│   │ Agents Solve Real Business Work                              │     │
│   │                                                              │     │
│   │ Most customer bots are glorified search bars. When an agent  │     │
│   │ can query an inventory database, update a CRM pipeline, and  │     │
│   │ issue a refund via API, the ROI becomes undeniable.          │     │
│   │                                                              │     │
│   │ 7 MIN READ • SEPT 28, 2026 • BY OSTRUM ARCHITECTURE TEAM     │     │
│   │ [READ ESSAY ↗]                                               │     │
│   └──────────────────────────────────────────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│   RECENT ESSAYS & TEARDOWNS                                            │
│   ┌─────────────────────────────┐ ┌───────────────────────────────────┐│
│   │ ENTERPRISE ARCHITECTURE     │ │ DESIGN & CRAFT                    ││
│   │ The Hidden Cost of 12 SaaS  │ │ The Death of Generic Agency UI:   ││
│   │ Subscriptions vs. 1 Custom  │ │ Why Swiss Rigor & Light Aesthetics││
│   │ Integrated Business ERP     │ │ Win in 2026                       ││
│   │                             │ │                                   ││
│   │ 9 MIN READ • AUG 2026       │ │ 5 MIN READ • JUL 2026             ││
│   └─────────────────────────────┘ └───────────────────────────────────┘│
├────────────────────────────────────────────────────────────────────────┤
│ [STICKY FOOTER]                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Primary CTA:** `Read Essay ↗` (opens `/insights/[slug]`).
- **Dynamic Content:** MDX articles loaded from CMS with category filtering, reading time estimation, and author metadata.
- **Interactions:** Topic filter pills, article card hover lifts (`translateY(-4px)`).
- **SEO Intent:** High-intent informational keywords: "custom ERP vs SaaS", "autonomous AI agent architecture".

---

## 4. Route: `/insights/[slug]` (Long-Form Article Template)

### Purpose & User Intent
Deliver a deep, distraction-free reading experience that commands intellectual respect.

### Page Hierarchy
1. **Reading Progress Bar:** Top hairline indicator (`2px solid #0A4DDE`) tracking scroll depth.
2. **Article Header:** Category pill, publication date, reading time, author, and large display headline (`Plus Jakarta Sans`).
3. **Executive Summary Box:** Crisp gray card (`#F4F4F6`) summarizing core findings in 3 bullet points.
4. **Body Content:**
   - 680px optimal reading column width.
   - 18px body font (`Inter`) with 1.7 line height for effortless reading.
   - High-contrast callout quotes with editorial italic serif (`Newsreader`).
   - Monospace architecture diagrams and code blocks (`JetBrains Mono`).
5. **Author & Editorial Review Byline:** Clear human practitioner credentials.
6. **Related Articles Grid:** Two recommended essays on adjacent topics.
7. **Contextual In-Article CTA:** "Facing this exact architectural challenge in your organization? [Consult with our systems team ↗]".

---

## 5. Route: `/contact` (Interactive Project Qualifier & Consultation)

### Purpose & User Intent
Convert high-conviction visitors into qualified client engagements. The experience avoids generic, cold 1-field forms while eliminating the fatigue of endless question loops.

### Information Hierarchy & ASCII Layout
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [HEADER NAV]                                                           │
├────────────────────────────────────────────────────────────────────────┤
│   INITIATE // START A PROJECT                                          │
│                                                                        │
│   LET'S BUILD YOUR CONNECTED SYSTEM.                                   │
│   Tell us about your organization and what you are looking to achieve. │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │ STEP 1: WHAT CAN WE HELP YOU BUILD? (SELECT ALL THAT APPLY)      │ │
│   │ [ ] Brand & Identity System       [ ] High-Performance Web App   │ │
│   │ [ ] Custom ERP & Business System  [ ] CRM Pipeline Architecture  │ │
│   │ [ ] Autonomous AI Agent System    [ ] WhatsApp Automation Engine │ │
│   │ [ ] Higher-Ed / Campus Management [ ] Headless Commerce Store    │ │
│   ├──────────────────────────────────────────────────────────────────┤ │
│   │ STEP 2: WHERE IS YOUR ORGANIZATION TODAY?                        │ │
│   │ ( ) New Venture / Launching Soon                                 │ │
│   │ ( ) Established Business Modernizing Fragmented Tools            │ │
│   │ ( ) Rapid Scale-up Requiring Custom Operational Infrastructure   │ │
│   ├──────────────────────────────────────────────────────────────────┤ │
│   │ STEP 3: INVESTMENT TIER & TIMELINE                               │ │
│   │ Target Launch: [Within 30 Days] [60–90 Days] [Flexible / Q4 2026]│ │
│   ├──────────────────────────────────────────────────────────────────┤ │
│   │ STEP 4: YOUR DETAILS                                             │ │
│   │ Name: [ John Doe              ] Organization: [ Acme Corp       ]│ │
│   │ Email:[ john@acme.com         ] WhatsApp:    [ +91 98765 43210  ]│ │
│   │ Existing Website / Systems:   [ https://acme.com                ]│ │
│   │ Project Overview / Goals:     [ Tell us about the bottleneck... ]│ │
│   │                                                                  │ │
│   │ [ SUBMIT PROJECT INQUIRY ↗ ]                                     │ │
│   │ (We review and respond within 24 business hours)                 │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│   PREFER AN IMMEDIATE CONVERSATION?                                    │
│   [ BOOK A 30-MIN DISCOVERY CALL ON OUR CALENDAR ↗ ]                   │
├────────────────────────────────────────────────────────────────────────┤
│ [STICKY FOOTER]                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Primary Action:** `Submit Project Inquiry ↗` (posts JSON payload to `/api/inquiry` edge route; verifies CSRF, validates schema, sends instant Telegram/Slack alert to partners, triggers automated CRM lead creation).
- **Secondary Action:** Direct calendar integration for immediate executive scheduling.
- **Form States:**
  - `Default`: High-contrast, clean input borders (`#E4E5EA`).
  - `Focused`: Cobalt hairline border (`2px solid #0A4DDE`), zero browser outline offset.
  - `Submitting`: Button shows spinner with disabled state.
  - `Success`: Replaced with an elegant confirmation panel displaying inquiry reference number and next steps.
  - `Error`: Inline field validation errors with clear remediation text.

---

## 6. AI Concierge & Voice Assistant Specification

### Architectural Placement
- **Location:** Embedded within the **AI & Automation Lab** on the homepage and available as a docked interactive drawer on `/contact`.
- **Purpose:** Serve as a live demonstration of Ostrum’s AI agent capabilities—answering questions about services, qualifying visitor needs, and recommending an initial system architecture.

### Interaction Guardrails & Behavior Rules
1. **Scope Boundaries:**
   - The concierge can answer questions about Ostrum’s capabilities, tech stack, engagement model, pricing philosophy, and case studies.
   - The concierge **cannot** generate arbitrary code, hallucinate fabricated client outcomes, or discuss unrelated external topics.
2. **Tone:** Courteous, architecturally knowledgeable, concise, and focused on scheduling a real human partner consultation.
3. **Escalation Path:** If the visitor expresses high intent (e.g., "I need an ERP for my 2,000-student school"), the agent summarizes the requirement and offers a one-click button: `Connect with an Ostrum Partner ↗`.
4. **Data Isolation:** Zero personal identifiable information is shared with public model training; all sessions are ephemeral.

---

## 7. Legal Pages: `/privacy` & `/terms`

- **Typography:** Standard single-column document layout (720px width) using `Inter`.
- **Key Disclosures in Privacy Policy:**
  - Transparent data collection policies regarding inquiry forms and analytics.
  - Strict non-disclosure of client proprietary business data.
  - Explicit compliance with international data privacy frameworks (EU GDPR, California CCPA, India DPDP Act 2023).
  - Explicit statement that client data processed by Ostrum AI agents is never used for general LLM foundation model training.
- **Key Clauses in Terms of Service:**
  - Intellectual property assignment upon final project milestone payment.
  - Standard service level agreements (SLAs) for technology support retainers.
  - Security vulnerability responsible disclosure policies.
