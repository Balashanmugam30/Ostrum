# Ostrum — Next.js Application Architecture

> **Stack:** Next.js 15+ (App Router) • React 19 • TypeScript (Strict) • Tailwind CSS • Motion (`framer-motion` / `motion`)  
> **Target Runtime:** Node.js / Vercel Edge Network  
> **Status:** APPROVED & SPECIFIED  

---

## 1. Directory & File Organization

The Ostrum application is architected around Next.js App Router conventions with strict separation between presentation, logic, content, and server boundaries:

```text
Ostrum/
│
├── app/
│   ├── layout.tsx             # Root layout: metadata, fonts, header, footer, skip-links
│   ├── page.tsx               # Homepage: 17-chapter long-scroll experiential sequence
│   ├── globals.css            # Design tokens, CSS variables, typography, reset, animations
│   ├── not-found.tsx          # Accessible, branded 404 page
│   ├── error.tsx              # React Error Boundary for resilient runtime recovery
│   │
│   ├── work/
│   │   ├── page.tsx           # Portfolio & demonstration case studies directory
│   │   └── [slug]/page.tsx    # In-depth architectural case study template
│   │
│   ├── services/
│   │   └── page.tsx           # Detailed capabilities & disciplines breakdown
│   │
│   ├── about/
│   │   └── page.tsx           # Studio genesis, founding principals, and philosophy
│   │
│   ├── insights/
│   │   ├── page.tsx           # Engineering field notes & business insights
│   │   └── [slug]/page.tsx    # Article reading template
│   │
│   ├── contact/
│   │   └── page.tsx           # Project brief & consultation inquiry page
│   │
│   ├── privacy/
│   │   └── page.tsx           # Privacy policy & data protection terms
│   │
│   └── terms/
│       └── page.tsx           # Terms of service & intellectual property guarantees
│
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx     # Translucent header with availability badge & navigation
│   │   ├── MobileNav.tsx      # Accessible full-screen mobile menu drawer
│   │   └── SiteFooter.tsx     # Architectural footer with live telemetry & copyright
│   │
│   ├── hero/
│   │   ├── HeroCanvas.tsx     # Atmospheric light background & layout stage
│   │   ├── ArchitectureDiagram.tsx # Connected multi-node SVG architecture visualizer
│   │   └── ThreeDArtifact.tsx # Interactive 3D Canvas / WebGL system core
│   │
│   ├── sections/
│   │   ├── MetricsBar.tsx     # 4-KPI performance proof bar
│   │   ├── PhilosophySection.tsx # Editorial statement with optical serif highlights
│   │   ├── CapabilitiesSection.tsx # Interactive 4-discipline tabbed switcher
│   │   ├── SelectedWorks.tsx  # Featured demonstration case study cards
│   │   ├── SystemSandbox.tsx  # Interactive live automation simulation console
│   │   ├── DeepDiveBlueprint.tsx # Campus360 architectural system breakdown
│   │   ├── ToolingStack.tsx   # 4-category modern infrastructure matrix
│   │   ├── WorkflowSection.tsx # 4-stage operational delivery progression
│   │   ├── StudioGenesis.tsx  # About Ostrum story & leadership principles
│   │   ├── ClientProof.tsx    # Cohort onboarding & verification framework
│   │   ├── EngagementModels.tsx # 3 transparent commercial tiers
│   │   ├── FieldNotes.tsx     # Editorial articles & insights
│   │   ├── FaqAccordion.tsx   # Accessible interactive disclosure accordion
│   │   └── ProjectBrief.tsx   # 4-step interactive project inquiry flow
│   │
│   └── ui/
│       ├── RollingButton.tsx  # High-craft magnetic dual-layer rolling action pill
│       ├── SectionKicker.tsx  # Monospaced architectural chapter tag
│       ├── CornerCrosses.tsx  # Architectural lattice corner crosses (+)
│       └── StatusBadge.tsx    # Live pulsing indicator node
│
├── content/                   # Structured static data (CMS ready)
│   ├── projects.ts            # Case studies metadata & architecture details
│   ├── capabilities.ts        # Service disciplines and outcome bullet points
│   ├── insights.ts            # Technical field notes articles
│   ├── faqs.ts                # Critical inquiries and honest answers
│   └── pricing.ts             # Commercial tiers and scope inclusions
│
├── lib/
│   └── utils.ts               # Shared utility functions (classNames, formatting)
│
├── public/                    # Static public assets
│   ├── images/                # Original illustrations and diagrams
│   └── icons/                 # Favicons and SVG markers
│
├── docs/                      # Architectural specifications and reports
├── package.json               # Modern dependencies and build scripts
├── tsconfig.json              # Strict TypeScript configuration
└── next.config.mjs            # Next.js production configuration
```

---

## 2. Server vs. Client Component Boundaries

To maximize performance, reduce JavaScript bundle size, and achieve near-instant First Contentful Paint:
- **Default to React Server Components (RSC):**
  - All page layouts (`layout.tsx`), static content sections, article templates, typography stages, and footers render on the server as lightweight, zero-JS HTML streams.
- **Client Components (`'use client'`):**
  - Reserved strictly for interactive widgets that require DOM events, local state, or animation hooks:
    1. `SiteHeader.tsx` (scroll listener for header backdrop and mobile toggle).
    2. `CapabilitiesSection.tsx` (active tab state switching).
    3. `SystemSandbox.tsx` (live scenario console simulation).
    4. `FaqAccordion.tsx` (accessible disclosure state and ARIA controls).
    5. `ProjectBrief.tsx` (interactive 4-step selection and form submission).
    6. `RollingButton.tsx` and `ThreeDArtifact.tsx` (interactive hover physics & WebGL canvas).

---

## 3. Data Flow & Future CMS Integration

All repeatable content (capabilities, projects, FAQs, pricing tiers, insights) is centralized inside typed TypeScript files under `/content`:
- In Phase 01B/02: Content is read directly at build time with type safety.
- In Phase 07 (CMS Integration): These content functions can be effortlessly swapped for headless CMS queries (e.g. Sanity, MDX, or Supabase) with zero changes to presentation components.

---

## 4. Animation & Motion Architecture

1. **Lightweight CSS-First Motion:** Hover states, rolling buttons, pulsing status badges, and smooth accordion transitions are implemented via native CSS transitions with hardware acceleration (`transform`, `opacity`).
2. **Intersection Observers / Scroll Reveals:** Sections use lightweight native `IntersectionObserver` or Motion hooks to trigger line-by-line reveals only when entering the viewport.
3. **Respects Reduced Motion:** Every animated component strictly honors `@media (prefers-reduced-motion: reduce)`, instantly falling back to clean static presentations.

---

## 5. Security & Form Handling

- **Zero Secret Exposure:** No API keys or database connection strings are bundled into client code.
- **Validated Input:** The Project Brief form validates email formats, lengths, and sanitizes input strings before dispatch.
- **HTTPS & Modern Headers:** Configured with strict security headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
