# Claude Code master prompt: Ostrum agent skills and tool integration

Copy everything between the following markers into Claude Code while its working directory is the existing Ostrum repository. This is for incremental setup and project awareness; it is not a request to redesign the site.

---

You are working in the existing Ostrum website repository. First read `AGENTS.md`, `DESIGN.md`, `.claude/CLAUDE.md`, `docs/OSTRUM_PROJECT_HANDOFF.md`, and `skills-lock.json`. Do not recreate the application, copy a starter template over it, run a broad redesign, or alter production settings as part of this skills setup.

## Goal

Make the existing project understandable and safely extensible by Claude Code. Inspect what already exists, identify capabilities precisely, reuse installed local skills, and install only missing, relevant items using official/current installation instructions. Keep an auditable status table. The project’s source of truth remains its actual code, package manifests and tests.

## Hard rules

- Inspect `.agents/skills/`, `.claude/skills/`, `skills-lock.json`, `.claude/CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, package manifests, component registries, and any existing MCP configs before changing anything.
- Never overwrite a healthy config, duplicate a skill, create a fake MCP endpoint/package, or claim an integration works without checking discovery and making a real harmless test call.
- Keep categories separate: agent skills/instructions, MCP servers, component registries, runtime dependencies, and reference-only sites/repositories.
- Verify each current installation command against the official upstream source first. Prefer project-local installation. Do not install software globally or write secrets to the repo.
- Do not install Spline. Do not install `@21st-dev/magic` (retired), Barba.js, or duplicate browser/Motion/21st/Stitch/Vercel MCPs. Keep the existing Next.js App Router and animation architecture.
- Do not add runtime dependencies during the skills-only setup. Do not edit website code or deploy.
- The cybersecurity source contains mixed offensive/defensive material. Install/use only relevant defensive application-security skills; never test external systems without explicit authorization.
- Do not print `.env` values, API keys, OAuth tokens, or Vercel/Redis secrets.

## Project facts

This is Next.js 15 App Router, React 19, TypeScript, Tailwind, npm. Existing runtime libraries include GSAP/ScrollTrigger, Lenis, Three.js and Resend. The mobile Capabilities section must stay a normal vertical list with six unique cards; desktop retains its existing horizontal storytelling. See the handoff and design files for mail, Redis, SEO, domain, and performance facts. Lighthouse performance was still only 43–44/100 in the latest local production audits, so do not claim performance is solved.

## Existing skill inventory to verify, not reinstall

The local catalogs currently contain approximately 53 Antigravity/project skills and 50 Claude project skills, with exact file counts changing as the project evolves. The Skills CLI lock currently records 42 entries. The existing skill families include:

- Addy Osmani: code review/quality, TDD, spec-driven and incremental work, security/hardening, accessibility, browser testing/DevTools, performance, CI/CD, code simplification, documentation and engineering process.
- UI/UX Pro Max, Taste (`design-taste-frontend`), Anthropic `frontend-design` (Antigravity catalog), GSAP core/performance/React/ScrollTrigger, Vercel React best practices/composition/view transitions/web design guidelines, Stitch design extraction/code-to-design/React component guidance, Vercel `find-skills`.
- PDF starter-kit skills copied into project-local catalogs: `skill-creator`, `webapp-testing`, and `universal-code-review`.
- Project skills that already exist include `ostrum-launchops` and `security-audit` in Antigravity’s catalog.
- A defensive web application vulnerability triage skill was selected from the broad cybersecurity source. Do not install hundreds of unrelated/offensive skills.

The Claude catalog may not contain every Antigravity-only item yet. Compare exact skill names and SKILL.md contents; install only missing approved skills with the official Skills CLI using `--agent claude-code --copy --yes`. Candidate sources, if a skill is actually missing and current official docs still confirm them, are:

- `anthropics/skills` skill `frontend-design`
- `addyosmani/agent-skills` (select relevant currently existing skill names)
- `Leonxlnx/taste-skill` skill `design-taste-frontend`
- `greensock/gsap-skills` (select relevant current skills)
- `vercel-labs/agent-skills` skills `vercel-react-best-practices`, `web-design-guidelines`, `vercel-react-view-transitions`, `vercel-composition-patterns`
- `google-labs-code/stitch-skills` (use only skills the source currently lists)
- `vercel-labs/skills` skill `find-skills`
- `mukul975/Anthropic-Cybersecurity-Skills` only a relevant defensive skill

Use a command only after verifying its current syntax, for example:

```powershell
npx --yes skills add <official-source> --skill <verified-skill-name> --agent claude-code --copy --yes
```

Do not use wildcard installation if it would add irrelevant skills. If UI/UX Pro Max is missing from Claude’s catalog, check the official CLI docs and initialize it for Claude Code only once; do not overwrite current skill files.

## MCP verification

The existing Antigravity environment was reported to have Playwright, Vercel, GitHub, Resend, Motion, 21st, Lightswind, Ponytail, Graphify, Stitch, Context7, shadcn/Magic UI and other integrations. That is historical inventory, not proof of Claude Code connectivity. For Claude Code:

1. Inspect Claude Code’s actual MCP discovery/configuration and list connected servers.
2. Separate Claude’s MCP config from Antigravity’s configuration. Do not copy the Antigravity file over it.
3. Reuse a currently connected server only if the tools appear and one harmless discovery call succeeds.
4. For absent capabilities, inspect official docs and verify the official transport, endpoint/command, authentication, supported client and exact config before proposing additions. Use browser OAuth where required; do not store credentials in source.
5. Do not duplicate functionality already provided by an official/current connected plugin or built-in tool.
6. Do not install browser software or MCP packages globally for the user.

The project’s npm Playwright dependency allows local Playwright tests but does not by itself mean Playwright MCP is installed. Lighthouse CLI use via `npx` is not Chrome DevTools MCP. Vercel access through a connector does not imply Vercel `agent-browser` is available. Report these distinctions.

## Registries and reference sources

Inspect `components.json` and project configuration before adding a registry. There was no `components.json` at the last check. Do not initialize shadcn or add registry aliases without a real component need and current official docs. Treat these as optional component/reference sources only where officially supported: 21st.dev, Lightswind, Motion Primitives, React Bits, KokonutUI, Bklit, Dotmatrix, Uiverse, Aceternity, Magic UI, Mobbin, Stitch and Coolors. Do not present a website or registry as an MCP unless its official docs establish a real MCP implementation. Verify license and accessibility before reusing code.

## Routing for future UI work

1. Read product request, `AGENTS.md`, `DESIGN.md`, and current code.
2. Search existing components and tests; use project graph/context only if actually connected.
3. Apply UI/UX Pro Max to system/UX decisions, frontend-design/Taste to a distinctive visual direction, and the existing design tokens to implementation.
4. Search real UI references or a component registry only when it solves a specific need. Adapt rather than paste demo styling.
5. Use GSAP for the existing cinematic/pinned scenes; use Motion only for appropriate component-level behavior. Avoid redundant animation libraries controlling the same element.
6. Implement minimal focused changes and protect reduced motion, keyboard use, mobile scroll, and the site’s existing identity.
7. Run tests and use Playwright/browser tools actually available. If performance is in scope, run Lighthouse and report exact metrics, not a subjective rating.

## Report format

At completion, provide a concise but specific report with these headings:

### Detected before changes
Exact project skill counts, key skill names, current MCP/tool discovery, registries, runtime libraries, and config files. Mark each as directly verified or historical.

### Installed or updated
Exact missing skills and source, official command actually run, target directory, and discovery result. Report skipped/redundant items.

### MCP status
For each MCP: configured, connected, tool-discovered, harmless call result, auth status, or not available. Never infer connection from a package or prior report.

### Registries and packages
List actual registries and runtime packages changed. If none changed, say none.

### Files changed
List every file path and why. Preserve all prior instructions.

### Verification and limitations
Show `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm audit`, and `npm run build` only if executed. State which browser checks actually ran. Note Search Console requires authenticated access; basic SEO score is not proof of indexing.

### Next step
Stop after the skills/integration setup. Do not start a redesign or deployment.

---

Use this prompt incrementally and only for setup. Existing installed skills and source files are the authoritative inventory; do not reinstall them because this prompt lists them.
