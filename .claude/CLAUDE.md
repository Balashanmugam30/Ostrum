# Claude Code project entrypoint

Before making changes, read the repository-root `AGENTS.md`, `DESIGN.md`, and `docs/OSTRUM_PROJECT_HANDOFF.md`. These define the current app architecture, product decisions, security boundaries, test commands and known limitations.

Use the relevant skill from `.claude/skills/` for a task; do not run every skill or MCP on every request. Treat the installed skills as guidance, while project requirements and existing architecture take precedence. The project uses Next.js App Router, React, TypeScript, Tailwind, GSAP/ScrollTrigger, Lenis and Three.js. Inspect `package.json` and source before adding dependencies or changing animation ownership.

For mobile work, preserve normal vertical scrolling and verify that Capabilities renders exactly six unique cards and reaches the footer. Never report performance as fixed based only on passing layout checks: run and record Lighthouse when performance is requested.

Never expose secrets, submit real production enquiries in tests, or change DNS, cloud configuration, Git history or production deployment without explicit user authorization. Report observed facts and distinguish unavailable integrations from failed tests.
