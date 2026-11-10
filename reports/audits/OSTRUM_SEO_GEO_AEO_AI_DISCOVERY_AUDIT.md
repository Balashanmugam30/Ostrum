# OSTRUM Technical SEO, GEO, AEO & AI Discovery Audit Report

**Audit Date:** 10 November 2026, 12:42 IST  
**Canonical Planned Domain:** `https://theostrum.com`  
**Primary Market:** India (`en_IN`), with global English-language accessibility  
**Target Search Platforms:** Google Search, Google AI Overviews / AI Mode, ChatGPT Search / OpenAI, Claude / Anthropic, Perplexity  

---

## 1. Executive Summary & Legal Realism

The technical SEO architecture of the OSTRUM website was calibrated to provide maximal crawlability, indexability, structured data clarity, and LLM search discovery while maintaining strict protection over proprietary brand code and preventing unauthorized bulk training scrapers.

> **Owner Disclaimer on Rankings & AI Citations:**  
> Technical eligibility, crawler access, schema markup, and high-performance server-rendered HTML provide optimal discovery conditions. However, search engines and AI models select citations dynamically based on query relevance, domain age, authority, and user intent. No engineering team or agency can guarantee a #1 Google rank or guaranteed AI citation.

- **On-Page Semantic Hierarchy:** Verified (Single `<h1>` in Hero, semantic `<h2>`/`<h3>` for Engine, Capabilities, Project Highlights, FAQ, and Contact).
- **SSR Text Availability:** Verified (Hero, Panels, Capabilities, Project Highlights, FAQ, Contact, and Legal content render in initial server HTML).
- **Structured Data Parity:** Verified (`Organization`, `WebSite`, and `FAQPage` schemas validated with 100% text parity to visible copy).
- **Organization Logo Path:** Updated to `${SITE_CONFIG.baseUrl}/brand/ostrum-3d-symbol-master.png` (high-res 1024×1024 master symbol).
- **Crawler Architecture (`robots.txt`):** Calibrated to explicitly allow AI search engines while blocking bulk training scrapers.
- **Indexable Sitemap:** Strictly lists 3 canonical public routes (`/`, `/terms-and-conditions`, `/privacy-policy`) with accurate `lastModified` dates.

---

## 2. Crawler & AI Discovery Architecture (`robots.txt`)

Configured dynamically in `app/robots.ts`:

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /preview/

# AI Search & Retrieval (Allowed for discovery, indexing & citations)
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /preview/

# AI Model Training Scrapers (Disallowed to protect proprietary assets)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Bytespider
Disallow: /

Sitemap: https://theostrum.com/sitemap.xml
```

### Discovery vs. Training Distinction
- **Allowed Search Bots:** OpenAI (`OAI-SearchBot`, `ChatGPT-User`), Anthropic (`Claude-SearchBot`, `Claude-User`), and Perplexity (`PerplexityBot`) are explicitly allowed access to index site text for answering live user search queries.
- **Restricted Scrapers:** Bulk offline model training bots (`GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`) are restricted to protect proprietary engineering studio brand assets and design choreography.
- **Private Route Protection:** Disallowed `/api/` (API routes) and `/preview/` (internal dev route).

---

## 3. Structured Data Parity & Schema.org Validation

1. **Organization (`schema.org/Organization`):**
   - Name: `OSTRUM`
   - URL: `https://theostrum.com`
   - Logo: `https://theostrum.com/brand/ostrum-3d-symbol-master.png`
   - Contact: `hello@theostrum.com`
   - SameAs: `https://www.linkedin.com/company/ostrum/`
2. **WebSite (`schema.org/WebSite`):**
   - In-language: `en-IN`
   - Canonical URL: `https://theostrum.com`
3. **FAQPage (`schema.org/FAQPage`):**
   - 10 Question & Answer entities exactly mirroring the raw server-rendered HTML in `data/faq.ts`. Zero text divergence between visible copy and JSON-LD markup.
4. **No Self-Serving Review Schema:**
   - In compliance with Google Search Central guidelines, no `AggregateRating` or fabricated `Review` schema is included.

---

## 4. Post-Launch Owner Actions
1. Register and verify `theostrum.com` in Google Search Console using a DNS TXT record.
2. Submit `https://theostrum.com/sitemap.xml` directly in Search Console.
3. Monitor Index Coverage report after 7–14 days.
