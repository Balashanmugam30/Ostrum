# OSTRUM Technical SEO, GEO, AEO & AI Discovery Audit Report
**Audit Date:** 9 November 2026  
**Canonical Planned Domain:** `https://theostrum.com`  
**Primary Market:** India (`en_IN`), with global English-language accessibility  
**Target Search Platforms:** Google Search, Google AI Overviews / AI Mode, ChatGPT Search / OpenAI, Claude / Anthropic, Perplexity

---

## 1. Executive Summary
The technical SEO architecture of the OSTRUM website was calibrated to provide maximal crawlability, indexability, structured data clarity, and LLM search discovery while maintaining strict protection over proprietary brand code and preventing unauthorized bulk training scrapers.

- **On-Page Semantic Hierarchy:** Verified (Single `<h1>`, semantic `<h2>`/`<h3>`, no skip levels).
- **SSR Text Availability:** Verified (Hero, Panels, Capabilities, Selected Work, FAQ, Contact, and Legal content render in initial server HTML).
- **Structured Data Parity:** Verified (`Organization`, `WebSite`, and `FAQPage` schemas validated with 100% text parity to visible copy).
- **Crawler Architecture (`robots.txt`):** Calibrated to explicitly allow AI search engines while blocking training scrapers.
- **Indexable Sitemap:** Strictly lists 3 canonical public routes with accurate `lastModified` dates.

---

## 2. Crawler & AI Discovery Architecture (`robots.txt`)

Configured dynamically in [`app/robots.ts`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/app/robots.ts):

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
1. **Search Crawlers (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`):** Permitted to crawl and index all public pages so OSTRUM can be discovered and cited in conversational answers and generative search engines.
2. **User-Initiated Fetchers (`ChatGPT-User`, `Claude-User`):** Permitted so that when users paste `theostrum.com` into ChatGPT or Claude, the AI assistant can fetch the live page.
3. **Bulk Training Scrapers (`GPTBot`, `ClaudeBot`, `CCBot`):** Disallowed from crawling the site for foundation model training corpora.

---

## 3. Structured Data & JSON-LD Schemas

### 3.1 Organization & WebSite Schemas ([`app/layout.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/app/layout.tsx))
- `@type`: `Organization`
- `name`: `OSTRUM`
- `url`: `https://theostrum.com`
- `logo`: `https://theostrum.com/brand/ostrum-3d-symbol-master.png` (Resolved: points to an authentic, square 1024×1024 master symbol matching Google Image guidelines).
- `email`: `hello@theostrum.com`
- `sameAs`:
  - `https://github.com/Balashanmugam30/Ostrum`
  - `https://www.linkedin.com/company/ostrum/`

### 3.2 FAQPage Schema ([`app/page.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/app/page.tsx))
- All 10 FAQ questions and answers are injected into initial HTML via `application/ld+json`.
- 100% exact parity with visible accordion DOM text.
- 0 em-dashes (`\u2014`) in schema strings.

---

## 4. On-Page & Technical Indexing Verification

| Parameter | Route `/` | Route `/terms-and-conditions` | Route `/privacy-policy` |
|---|---|---|---|
| **Title** | `OSTRUM \| Custom Software, AI Systems & Digital Product Engineering` | `Terms & Conditions \| OSTRUM` | `Privacy Policy \| OSTRUM` |
| **Meta Description** | 168 chars, keyword-calibrated | Concise document summary | Concise DPDP/compliance summary |
| **Canonical URL** | `https://theostrum.com` | `https://theostrum.com/terms-and-conditions` | `https://theostrum.com/privacy-policy` |
| **Open Graph Card** | `1200 × 630` (`/images/ostrum-og.png`) | Standard large image card | Standard large image card |
| **Robots Directive** | `index: true, follow: true` | `index: true, follow: true` | `index: true, follow: true` |
| **Heading Hierarchy** | H1 (Statement) -> H2 (Sections) | H1 (Title) -> H2 (Clauses) | H1 (Title) -> H2 (Clauses) |
| **SSR Availability** | 100% of body text in raw HTML | 100% of body text in raw HTML | 100% of body text in raw HTML |

---

## 5. Post-Launch Google Search Console Strategy
1. **Domain Property Verification:** Once DNS is live on `theostrum.com`, add a Domain Property in Google Search Console via DNS TXT record.
2. **Sitemap Submission:** Submit `https://theostrum.com/sitemap.xml`.
3. **URL Inspection:** Request indexing for the homepage once crawl connectivity is verified.
4. **AI Overviews Control:** Verify Search Console's "Search generative AI" setting to ensure the studio is eligible for generative snippets.
5. **Honest Disclaimer:** Search ranking and AI citations cannot be guaranteed; they develop over time as legitimate off-site authority, client references, and crawl frequency accumulate.
