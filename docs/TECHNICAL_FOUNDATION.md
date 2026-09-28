# Ostrum — Technical Foundation & Systems Architecture

> **Status:** APPROVED (Phase 00 Foundation)  
> **Date:** September 2026  
> **Primary Stack:** Next.js 15 (App Router) • React 19 • TypeScript (Strict) • Tailwind CSS • Motion (`motion/react`)  

---

## 1. Architectural Principles

1. **Server-First by Default:** Maximize React Server Components (RSC) to keep JavaScript bundle sizes ultra-lean. Interactive client components (`'use client'`) are strictly isolated to interactive leaf nodes (e.g., Stack Builder, Tab switcher, Form inputs).
2. **Strict Type Safety:** Zero `@ts-ignore` or loose `any` types. All API payloads, CMS schemas, and component props are strictly typed and validated via **Zod**.
3. **Compositor-Only Animations:** Animations adhere to GPU-accelerated CSS properties (`transform`, `opacity`, `clip-path`) to maintain consistent 60/120 FPS frame rates without triggering browser layout recalculations.
4. **Zero Client Secrets:** All AI model keys, CRM webhooks, and database credentials remain strictly behind serverless edge route handlers.

---

## 2. Master System Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSERS                               │
│       Desktop / Tablet / Mobile (WCAG 2.2 AA • Responsive PWA)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3 / HTTP/3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                             │
│       Edge Caching • Brotli Compression • DDOS Shield • DNS Anycast    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 15 (APP ROUTER)                            │
│  ┌──────────────────────────────┐   ┌───────────────────────────────┐  │
│  │ REACT SERVER COMPONENTS (RSC)│   │ EDGE ROUTE HANDLERS (/api)    │  │
│  │ • Page Layouts & Typography  │   │ • /api/inquiry (Lead Qual)    │  │
│  │ • Static Editorial Content   │   │ • /api/concierge (AI Agent)   │  │
│  │ • SEO / OpenGraph Metadata   │   │ • /api/stack (Configurator)   │  │
│  └──────────────┬───────────────┘   └───────────────┬───────────────┘  │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│      CONTENT & STORAGE LAYER    │   │     INTEGRATIONS & AI LAYER      │
│ • Headless CMS (Sanity / MDX)   │   │ • Gemini / Anthropic API (Server)│
│ • Supabase / Postgres (Data)    │   │ • Upstash Redis (Rate Limiting)  │
│ • Cloudflare R2 / S3 (Media)    │   │ • CRM Webhooks (HubSpot/Custom)  │
│                                 │   │ • WhatsApp Cloud API Engine      │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 3. Technology Stack Selection & Rationale

| Layer | Selected Technology | Version | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 15.x | Server Components for instant LCP, streaming SSR, built-in image optimization. |
| **Language** | TypeScript | 5.x | Strict type safety, auto-generated schema types, high code maintainability. |
| **Styling** | Tailwind CSS + Tokens | 3.4 / 4.x | Tokenized atomic utility classes, zero runtime CSS injection, tree-shaken CSS. |
| **Component Primitives**| Radix UI / shadcn/ui | Latest | Headless, accessible primitives providing full keyboard navigation and ARIA attributes. |
| **Motion Physics** | Motion (`motion/react`) | 12.x | Physics-based spring animations, layout animations, rock-solid cross-browser scroll scrub. |
| **Native Web Scroll** | CSS View Timelines | W3C Level 1 | Off-thread GPU scroll animations where supported (`@supports`). |
| **Schema Validation** | Zod | 3.x | End-to-end runtime validation for all forms and edge API payloads. |
| **Icons** | Lucide React | Latest | Clean, lightweight SVG line icons matching the 1.5px architectural stroke standard. |
| **Deployment** | Vercel Edge Network | Global | Instant worldwide edge propagation, automated preview deploys, zero cold-starts. |

---

## 4. Frontend Component Architecture

Components follow strict atomic isolation:

```text
src/
├── app/                        # Next.js App Router routes
│   ├── layout.tsx              # Root shell: typography, metadata, smooth scroll
│   ├── page.tsx                # Homepage (15-chapter narrative container)
│   ├── work/
│   │   ├── page.tsx            # Work index
│   │   └── [slug]/page.tsx     # Deep case study template
│   ├── insights/
│   │   ├── page.tsx            # Insights index
│   │   └── [slug]/page.tsx     # Article template
│   ├── contact/
│   │   └── page.tsx            # Interactive project inquiry flow
│   ├── privacy/page.tsx        # Legal privacy page
│   └── terms/page.tsx          # Legal terms page
│
├── components/
│   ├── ui/                     # Primitives (Button, Input, Badge, Dialog)
│   ├── layout/                 # Shell components (Header, Footer, Container, Grid)
│   ├── sections/               # Homepage chapter sections (Hero, Problem, System...)
│   ├── interactive/            # Dynamic modules (StackBuilder, AICallSimulator)
│   └── shared/                 # SEO schema, SmoothScroll, ThemeProvider
│
├── content/                    # Static typography, capability JSONs, MDX files
├── lib/                        # Utilities (cn, motion-presets, validation)
└── styles/                     # Master design tokens & Tailwind directives
```

---

## 5. Backend & Edge API Boundaries

### 1. Route: `/api/inquiry` (Lead Capture & Qualification)
- **Method:** `POST`
- **Security:**
  - Strict CORS restriction (origin must match production domain).
  - Rate limiting via Upstash Redis (max 5 submissions per IP per 10 minutes).
  - Zod payload schema validation:
    ```typescript
    const InquirySchema = z.object({
      name: z.string().min(2).max(100),
      organization: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      selectedCapabilities: z.array(z.string()).min(1),
      stage: z.enum(['new_venture', 'modernizing', 'scaling']),
      timeline: z.string(),
      details: z.string().min(10).max(2000),
    });
    ```
- **Execution:**
  1. Validates payload.
  2. Stores encrypted record in database.
  3. Fires asynchronous webhook to internal CRM pipeline.
  4. Dispatches instant alert to partners via Slack/Telegram bot.
  5. Returns HTTP 200 with inquiry tracking token.

### 2. Route: `/api/concierge` (AI Agent Stream)
- **Method:** `POST`
- **Runtime:** Edge Runtime (`runtime = 'edge'`).
- **Functionality:** Streams conversational guidance using Google Gemini API (`gemini-2.0-flash`) or OpenAI. Uses strict system prompts and retrieval-augmented context (RAG) referencing Ostrum's public capabilities and case studies. Zero internal credentials or client data are accessible.

---

## 6. Security, Trust & Governance Baseline

1. **HTTP Security Headers:** Implemented via Next.js `headers()` configuration:
   - `Content-Security-Policy`: Disallows unsafe inline scripts; restricts script execution to trusted domains.
   - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`.
   - `X-Frame-Options`: `DENY` (prevents clickjacking).
   - `X-Content-Type-Options`: `nosniff`.
   - `Referrer-Policy`: `strict-origin-when-cross-origin`.
2. **Environment Variable Hygiene:**
   - Secret keys (`GEMINI_API_KEY`, `RESEND_API_KEY`, `DATABASE_URL`) never contain the `NEXT_PUBLIC_` prefix.
   - Checked via automated CI git pre-commit hooks to prevent credential leakage.

---

## 7. Performance Budget & Core Web Vitals Targets

| Metric | Target SLA | Strategy to Guarantee SLA |
| :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | **< 1.2s** | Zero heavy hero video; preloaded hero webfonts; pre-rendered Server Component HTML. |
| **Interaction to Next Paint (INP)** | **< 100ms** | Debounced client state; off-thread CSS animations; lightweight DOM hierarchy. |
| **Cumulative Layout Shift (CLS)** | **< 0.05** | Explicit image `width`/`height` attributes; font fallback size-adjust tuning; zero ad scripts. |
| **First Input Delay (FID)** | **< 50ms** | Minimal initial JavaScript payload (< 85KB gzip). |
| **Total Page Weight** | **< 850KB** | Next-gen AVIF/WebP image formats; SVG vector diagrams; tree-shaken Lucide icons. |
