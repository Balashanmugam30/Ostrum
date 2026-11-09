# SEO, GEO, AEO and local discovery playbook

## 1. Technical SEO fundamentals

Audit each indexable URL, not every visual section. For each route check:

- unique, descriptive `<title>` and a useful meta description;
- one primary H1 and a sensible H2/H3 hierarchy;
- canonical URL points to the preferred final HTTPS host;
- crawlable `<a href>` internal links, not click handlers alone;
- useful main content is rendered in server HTML or otherwise reliably rendered for crawlers;
- correct index/follow directives and no accidental `noindex`;
- valid `robots.txt` and a sitemap listing canonical, public, indexable routes;
- useful image alt text and appropriate Open Graph metadata;
- correct HTTP statuses (real 404/410 where applicable) and no redirect chains;
- structured data matching visible, verified content.

For a long single-page portfolio, the homepage has one title and description. Its `#capabilities`, `#selected-work` and FAQ sections do not need separate meta descriptions. Create a separate service route only when it adds unique, substantial information that helps a visitor make a decision.

`meta keywords` is not a useful modern Google ranking field. Do not add it. Do not add hidden duplicate FAQ answers to improve extraction.

## 2. GEO / AI search

### Google AI features

Google's published guidance says the normal SEO foundations apply to AI Overviews and AI Mode; there are no additional special technical requirements. Build helpful, reliable, people-first content. AI-assisted writing itself is not the problem; scaled, unoriginal, thin content created primarily to manipulate search is.

Useful content structure:

- state what the organisation does in specific, ordinary language;
- identify the actual customer/problem and service/deliverable;
- answer likely buyer questions directly;
- use accurate project examples and first-hand details;
- explain limitations or scope where important;
- cite primary sources for technical claims;
- keep information consistent across site, business profiles and public directories.

Avoid claims that AI crawlers “love” bullets, that a secret GEO tag guarantees visibility, or that an `llms.txt` file is required for Google. Do not manufacture FAQ pages, city pages, “AI answer blocks” or schema solely to influence extraction.

### ChatGPT search

If the owner wants public content eligible for ChatGPT search:

- permit `OAI-SearchBot` in robots rules;
- ensure the CDN/WAF/origin firewall accepts OpenAI's published searchbot IP ranges;
- do not conflate `OAI-SearchBot` (search inclusion) with `GPTBot` (training-related crawl policy) or `ChatGPT-User` (user-initiated page fetches);
- check the current official crawler documentation before changing policies.

A broad `User-agent: *` allow rule generally also permits OAI-SearchBot unless another rule or network control blocks it. An explicit OAI-SearchBot block is not acceptable when the owner wants inclusion. Allowing the bot creates eligibility, not guaranteed rankings or citations.

## 3. Structured data

- `Organization` and `WebSite` are suitable for a verified company/studio identity.
- `legalName` must be the actual registered legal name, not a brand alias or guessed company type.
- `sameAs` should include only authentic profiles controlled by the organisation.
- `LocalBusiness` should only be used for an eligible, real business location/service area with correct information.
- Do not create fabricated `Review` or `AggregateRating` schema. A project highlight is not a testimonial.
- Breadcrumbs are a useful navigation pattern for deeper route hierarchies, not a mandatory launch feature for a three-route site.

Structured data clarifies entities and may create eligibility for particular result features; it does not guarantee a rich result or ranking lift.

## 4. Local SEO: prove eligibility first

Google Business Profile requires in-person customer contact during stated hours. A qualifying service-area business may visit customers; an online-only business is not eligible. Never list:

- a virtual office, PO box or mailbox as a staffed storefront;
- a client's address as the agency's own location;
- an unstaffed coworking desk as an office;
- invented opening hours or local phone numbers.

Before creating or editing a profile, confirm the real operating model, address eligibility, signage/staffing, service area, ownership and ability to meet customers in person. If not eligible, do not create one. A brand's mere existence online is not enough.

The formula `service + city` is a useful query research seed, not an instruction to stuff every page. Use local phrases only when the studio genuinely serves that area and can provide useful local detail. Do not publish near-duplicate pages for 20 cities.

NAP consistency is useful when a real address and phone are public. Do not list OSTRUM on directories such as Justdial, Sulekha or IndiaMART unless the listing is appropriate, accurate and authorised. Directory submission volume is not a ranking guarantee.

## 5. Reviews and case studies

- Ask clients for genuine feedback without incentives or review gating.
- Publish client names, logos, screenshots, metrics and quotes only with the correct permission.
- Keep a case study factual: what was delivered, what was in scope, what is live, what is measurable, and when.
- Distinguish a client project from a studio experiment or internal venture.
- Never invent a star rating, quote, conversion metric, revenue lift, “top-rated” label or review count.

## 6. Search measurement

After the final domain is live:

1. verify the domain property in Google Search Console using DNS;
2. submit the sitemap;
3. inspect the home and legal URLs;
4. review indexing, crawl stats, enhancements and manual actions;
5. use actual Search Console query/impression/click data to refine content;
6. if relevant, add Bing Webmaster Tools and verify OAI-SearchBot access;
7. distinguish impressions, clicks, average position, branded search and leads.

A sitemap is a crawl-discovery hint, not a promise of indexing. Indexing is not a ranking guarantee.

## Official sources

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies / scaled content abuse: https://developers.google.com/search/docs/essentials/spam-policies
- Google title links: https://developers.google.com/search/docs/appearance/title-link
- Google sitemap submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Organization schema: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google Business Profile eligibility: https://support.google.com/business/answer/13763036
- OpenAI crawler documentation: https://developers.openai.com/api/docs/bots
- OpenAI publisher FAQ: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
