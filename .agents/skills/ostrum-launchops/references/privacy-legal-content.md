# Privacy, legal factuality, consent and content truth

## 1. Start from actual processing

Create a data-flow table:

| Data / storage | Collected by | Purpose | Sent to / stored at | Retention | Legal basis / notice | Evidence state |
|---|---|---|---|---|---|---|

Inspect source and actual deployed behaviour for:

- contact fields (including optional fields);
- server and edge logs, IP addresses, user-agent, referrer and timestamps;
- cookies, `sessionStorage`, `localStorage`, IndexedDB and service workers;
- analytics, advertising, A/B testing, session replay, chat, maps, videos, social embeds and third-party scripts;
- email/CRM providers and delivery logs;
- error monitoring and uptime services.

Do not claim anonymisation unless IP or identifier handling actually achieves it. Do not claim a specific TLS version, encryption-at-rest setting, containerisation, least-privilege process, data deletion timeline or automated audit unless the hosting/provider configuration proves it.

## 2. Cookie banner decision

A banner is not an automatic decoration. Decide from:

1. which cookies or device-storage mechanisms exist;
2. which are strictly necessary to deliver a requested service;
3. whether analytics/advertising/third-party tracking is present;
4. target audience/jurisdictions and their current laws;
5. whether consent is required before storing/accessing the information.

A `sessionStorage` flag is not an HTTP cookie, but should still be documented if relevant. A banner that is not connected to script blocking/preferences is misleading. If non-essential analytics or marketing scripts are added later, revisit the consent design before enabling them.

## 3. Contact form notice

Use data minimisation. If name, email and message are sufficient to respond, do not require phone or company. Show optional fields clearly and enforce optionality on the server.

Before submission, state in plain language that submitted details will be used to review and respond to the enquiry, and link to the Privacy Policy. If marketing messages may be sent, use a separate, optional, unchecked opt-in with a distinct purpose. Do not bundle marketing consent into the enquiry submission.

Whether to add a mandatory checkbox for enquiry processing is a legal-basis decision. Do not invent a checkbox merely to look compliant. Have counsel confirm the basis under applicable law; if explicit consent is used, capture the right version/timestamp and provide a withdrawal route as applicable.

## 4. India privacy review

Use the official Act, Rules and commencement notifications current on the review date. The DPDP Act/Rules have phased commencement; do not claim every substantive provision is already operative solely because Rules have been notified. As of the package date (9 November 2026), a commencement step at one year after 13 November 2025 is imminent, while the 18-month tranche falls on 13 May 2027. Recheck the Gazette and official notices whenever this skill is run.

Review:

- correct legal entity / Data Fiduciary identity, not a guessed corporate name;
- concise, accessible notice describing data and purposes;
- lawful basis for each purpose;
- data minimisation and retention/deletion schedule;
- third-party processors, transfers and hosting regions;
- user rights/grievance process and the correct contact role/details;
- child-data rules if the product is directed to or likely to attract children;
- breach response and incident records.

Do not use broad “GDPR-compliant” or “DPDP-compliant” wording without an applicable legal review and operational evidence. Do not transplant GDPR rights such as data portability or restriction into a statement that labels them all DPDP statutory rights without checking the law.

## 5. Website legal pages by business model

For a studio/portfolio/contact site, normally relevant:

- Privacy Policy reflecting real processing;
- Website Terms describing use, IP, external links and non-binding project enquiry status;
- a Cookie Policy/preferences only when the tracking/storage footprint and jurisdiction make it useful/required;
- an accessibility statement only when the owner can describe actual conformance and a contact/feedback path.

Usually not relevant without transactions/features:

- refund/return/exchange/shipping policies;
- billing, subscriptions, cancellations, payment pending/failed pages;
- login, registration, account reset/session-expired pages;
- DPA/Acceptable Use/Community Guidelines for a public showcase with no SaaS customer data environment.

A signed MSA/SOW remains the correct place for project scope, fees, milestones, client IP, confidentiality, warranty and dispute terms. Website Terms do not replace the commercial contract. Legal templates require qualified review.

## 6. Copyright and asset permissions

For every non-original source asset record:

- creator and asset title;
- original source URL;
- exact license/version at the time obtained;
- commercial-use permission;
- attribution/link requirements;
- whether it was modified;
- where the attribution is visible on the live site;
- any brand/trademark restrictions.

Check photographs, client logos, testimonials, fonts, icon packs, UI components, 3D models, shaders, stock imagery, generated images and embedded media separately. Do not assume AI-generated means rights-free. Do not declare all code/artwork exclusively owned by the studio if there are licensed third-party components; say “owned by OSTRUM or used under applicable license” where accurate.

## 7. Content truth / “AI slop” filter

Flag copy that is abstract, interchangeable or unprovable. Replace phrases like “operational clarity”, “high-conviction internal ventures”, “intelligent systems”, “engineered for impact” or “ambitious businesses” only when a more concrete phrase is supported by facts. These expressions are not automatically wrong; the problem is lack of a clear service, deliverable, buyer or proof.

Check every claim, quote, metric, technology, client name, launch status, response-time promise, review and location. Classify as:

- verified live fact;
- verified completed project;
- in-progress/internal venture;
- opinion/positioning;
- owner confirmation required.

Never convert an internal project note into a client testimonial. Never publish a client's quote/logo/screenshots without permission. Don't fabricate a company address, CIN, GSTIN, legal name or local telephone number.

## Official sources

- India DPDP Act: https://www.indiacode.nic.in/bitstream/123456789/22037/1/a2023-22.pdf
- DPDP commencement Gazette (13 Nov 2025): https://egazette.gov.in/WriteReadData/2025/267647.pdf
- MeitY / PIB DPDP Rules release: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014
- GDPR text: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- ICO cookies guidance: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/
- Creative Commons BY 4.0: https://creativecommons.org/licenses/by/4.0/
