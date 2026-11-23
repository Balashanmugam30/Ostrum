# Ostrum project instructions

Read this file and [DESIGN.md](DESIGN.md) before changing the application. The current source and product behavior are authoritative; use reports in `reports/audits/` as dated evidence, not as a substitute for checking the live code.

## Project map

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS; npm and `package-lock.json` are the package source of truth.
- `app/`: routes, root metadata, sitemap, robots and enquiry API.
- `components/`: page sections, navigation, global visuals, UI and canvas.
- `context/PreloaderContext.tsx`: intro/reveal lifecycle.
- `lib/site-config.ts`: canonical domain, business email and shared brand configuration.
- `lib/email/enquiry-mailer.ts`: Resend notifications and Redis-backed abuse rate limit.
- `public/models/`: licensed 3D artwork; see `THIRD_PARTY_NOTICES.md` and `docs/OSTRUM_THIRD_PARTY_ASSETS.md` before replacing or redistributing assets.
- `.agents/skills/` and `.claude/skills/`: project-local agent skills. `skills-lock.json` records skills installed through the Skills CLI.
- `docs/OSTRUM_PROJECT_HANDOFF.md`: architecture, integrations, operational facts and known limitations.
- `docs/OSTRUM_CLAUDE_CODE_SKILLS_MASTER_PROMPT.md`: future Claude Code skill/integration prompt.

## Requirements and safety

1. Preserve current site behavior and desktop art while solving mobile problems. Inspect the existing implementation and recordings/evidence before changing the design.
2. The canonical URL is `https://www.theostrum.tech/`; the apex domain redirects to `www`. Contact email is `hello@theostrum.tech`.
3. The enquiry form sends an email through Resend. Do not persist form contents in Redis or another database. Redis is only for rate-limit counters keyed by a one-way client identifier and expiring data.
4. Do not print, commit, or expose `.env*` values, Vercel secrets, tokens, or connection strings. Report only variable names and configured/missing status.
5. Do not send a real production form submission during tests. Use local mocks or a non-delivery path.
6. Do not change DNS, Google properties, Vercel environment variables, Git history, or production deployment unless the user explicitly requests that operation. Once explicitly requested, verify its scope and report the exact result.
7. Do not install machine-global software, MCP servers, or unrelated skills. Reuse repository-local skills and existing tooling; verify official sources and licenses before adding anything.
8. Never claim a connector, MCP, skill, Google Console action, or test is working unless its discovery/result was observed. Clearly separate installed/configured capabilities from tests actually executed.

## Design and implementation routing

Follow product requirements, existing architecture, `DESIGN.md`, accessibility/correctness, then relevant skills and component/reference sources. Do not use all tools on every task.

For UI changes: inspect existing components, reuse and adapt before creating; preserve the site’s intentional visual identity; check keyboard behavior, reduced motion, responsive layouts and lower-powered devices. Do not add runtime libraries simply because a registry lists them.

Motion ownership: GSAP/ScrollTrigger drive complex pinned storytelling; Lenis integrates with the GSAP ticker where enabled; Three.js renders the existing 3D journey. Do not have multiple animation systems control one interaction. Honor `prefers-reduced-motion`. Mobile Capabilities must stay in normal vertical document flow, show six cards once, and avoid desktop-style pinned horizontal scrubbing or unnecessary card WebGL canvases.

## Verification

Run relevant checks after changes. Available project commands:

```powershell
npm run lint
npx tsc --noEmit
npm test
npm audit
npm run build
```

For visual changes, verify a local production build in a browser at the 13 viewport sizes recorded in the current repair report. Check mobile scroll all the way to the footer, Capabilities card count, nav open/close and Escape, the light/dark header contrast, console errors, and failed requests. Check desktop pinned Capabilities separately. Include actual Lighthouse metrics where performance is in scope; do not infer performance from a successful build or zero overflow.

SEO checks should inspect rendered canonical/metadata/JSON-LD and HTTP responses from `/sitemap.xml` and `/robots.txt`. A valid sitemap response does not prove Search Console indexing. Analytics is consent-gated; do not bypass consent to generate telemetry.
