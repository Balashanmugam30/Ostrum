# Release checklist

## Source and code

- [ ] Source ref and branch identity captured
- [ ] Changes isolated in a dedicated branch
- [ ] Full diff reviewed
- [ ] Current supported framework version verified against official advisories
- [ ] Lockfile install and dependency audits pass
- [ ] No committed secrets; exposed keys rotated
- [ ] Server-side validation and request-size limits tested
- [ ] Production rate limiting has an actual shared/edge control
- [ ] Security headers and CSP tested on production build
- [ ] Typecheck, lint, tests and production build pass

## Product behaviour

- [ ] All primary links/buttons work
- [ ] Contact form reaches the real receiving mailbox
- [ ] Provider failures do not return false success
- [ ] Oversized/malformed/invalid submissions are rejected
- [ ] No placeholders, dead social links or fake reviews
- [ ] 404 and error states behave correctly

## Privacy, legal and assets

- [ ] Actual collection/storage/tracking inventory completed
- [ ] Privacy Policy matches actual practices
- [ ] Terms match the real business and engagement model
- [ ] Cookie consent decision based on actual trackers and jurisdictions
- [ ] Contact form notice is clear; marketing opt-in is separate
- [ ] Legal identity and grievance details owner-confirmed
- [ ] Third-party asset licenses and public attribution checked

## Accessibility and performance

- [ ] Keyboard-only walkthrough completed
- [ ] Forms/errors/success states accessible
- [ ] Meaningful image alt text present
- [ ] Contrast and reduced-motion behaviour checked
- [ ] Mobile reflow and 200% zoom checked
- [ ] Lighthouse/PSI performed on production build
- [ ] CWV field status distinguished from lab scores
- [ ] WebGL/low-end mobile/fallback checked where relevant

## SEO and AI search

- [ ] Route-level titles, descriptions, canonicals checked
- [ ] Robots and sitemap fetch correctly on the live domain
- [ ] OAI-SearchBot allowed if owner wants ChatGPT search eligibility
- [ ] CDN/WAF does not unintentionally block search crawlers
- [ ] Organization/Website schema matches verified facts
- [ ] Google Search Console verified and sitemap submitted
- [ ] Local Business Profile used only if eligible

## Owner and deployment

- [ ] Domain/DNS/TLS verified
- [ ] Production secrets entered into host secret manager
- [ ] SPF/DKIM/DMARC and sender domain verified
- [ ] Shared rate-limit service or WAF rule configured
- [ ] Cloudflare/Vercel edge decision confirmed
- [ ] Monitoring/alerts configured
- [ ] Rollback deployment identified and tested
- [ ] Production owner and approver confirmed
- [ ] Merge/deploy explicitly approved
