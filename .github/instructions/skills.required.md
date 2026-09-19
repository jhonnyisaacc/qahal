# Required Skills and Competencies

## Purpose

This document defines the capabilities needed to build and maintain this Telegram Mini App with high quality, security, and long-term sustainability.

## Core Technical Skills (Must Have)

| Skill                      | Why It Matters in This Project                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Bun ecosystem proficiency  | Bun is mandatory for install, run, and build workflows across the repo.                   |
| TypeScript (advanced)      | Shared contracts between frontend and worker depend on strong typing and maintainability. |
| React 19 architecture      | Core frontend implementation uses React 19 patterns and modular components.               |
| Tailwind CSS system design | Fast, consistent implementation of design tokens and responsive UI behavior.              |
| TelegramUI component usage | Ensures native Telegram look and behavior with AppRoot and official primitives.           |
| Hono + Cloudflare Workers  | Backend API and auth run serverlessly on Workers using Hono routing/middleware.           |
| D1 schema and query design | User and location data integrity depends on correct D1 modeling and migration discipline. |
| API contract design        | Stable frontend-backend integration requires explicit contracts and version strategy.     |

## Important Nice-to-Have Skills

| Skill                        | Why It Helps                                                            |
| ---------------------------- | ----------------------------------------------------------------------- |
| Drizzle ORM experience       | Improves D1/SQL maintainability and migration workflows.                |
| Performance profiling tools  | Helps enforce WebView startup and interaction targets.                  |
| Lightweight state management | Useful as app complexity grows (for example, Zustand or equivalent).    |
| i18n and RTL implementation  | Needed for English, Spanish, Hebrew, and future locale expansion.       |
| Observability/logging design | Improves reliability and issue triage in distributed edge environments. |

## Telegram-Specific Knowledge

| Competency                           | Why It Is Required                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Telegram Web Apps lifecycle          | Correct startup depends on ready, expand, theme, safe-area, and button APIs.  |
| initData signature validation        | Core authentication and trust boundary for user identity.                     |
| Telegram client constraints          | UX and performance decisions must respect mobile WebView limitations.         |
| Haptic, location, and permissions UX | Native-feel interactions and permission handling improve trust and usability. |

## Cloudflare and Serverless Expertise

| Competency                      | Why It Is Required                                                     |
| ------------------------------- | ---------------------------------------------------------------------- |
| Workers runtime model           | Needed for request lifecycle, edge execution, and middleware patterns. |
| D1 operations and migrations    | Critical for reliable schema evolution and data safety.                |
| KV and R2 integration           | Supports caching and file storage without introducing server overhead. |
| Deployment with Pages + Workers | End-to-end release pipeline depends on this delivery model.            |
| Cost-aware architecture         | Keeps the project free-tier friendly while scaling responsibly.        |

## UI/UX and Design Translation Skills

| Skill                           | Why It Is Required                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Paper-to-code decomposition     | Converts static designs into reusable, testable component systems.                  |
| Component contract thinking     | Prevents ad-hoc UI and accelerates iteration across many screens.                   |
| Mobile-first interaction design | Core audience uses Telegram mobile WebView first.                                   |
| Visual QA discipline            | Maintains fidelity between approved Pen screens in design/qahal.pen and production. |
| Design token consistency        | Preserves coherent brand and interaction language across features.                  |

## Soft Skills and Workflow Skills

| Skill                           | Why It Matters                                                           |
| ------------------------------- | ------------------------------------------------------------------------ |
| Structured communication        | Keeps product, design, and engineering aligned during fast iterations.   |
| Requirement clarification       | Reduces rework and prevents scope drift.                                 |
| Incremental delivery discipline | Enables vertical slices and measurable progress.                         |
| Security mindset                | Protects user data and avoids risky shortcuts in auth and storage flows. |
| Documentation hygiene           | Instruction files and runbooks must stay current and actionable.         |

## Recommended Learning Resources

- Telegram Mini Apps official docs: https://core.telegram.org/bots/webapps
- TelegramUI overview and usage guidance: https://docs.ton.org/ecosystem/tma/telegram-ui/overview
- Cloudflare Workers and D1 official docs
- Hono documentation and edge runtime examples
- Bun runtime and workspace documentation

## How These Skills Are Used in Paper-to-Code Phase

1. Translate each paper artboard into a component contract (props, states, events).
2. Build TelegramUI-first screen shells and verify native interaction expectations.
3. Apply Tailwind design tokens and spacing system for visual consistency.
4. Connect worker APIs with typed shared contracts.
5. Validate performance and behavior in real Telegram WebView.
6. Iterate screen-by-screen with visual parity checkpoints.

## Team Readiness Checklist

- Can the team validate initData securely on backend?
- Can the team deliver TelegramUI-based screens with AppRoot and safe-area correctness?
- Can the team deploy and operate Pages + Workers + D1 reliably?
- Can the team maintain design-code sync from MCP paper to production components?
- Can the team keep performance and bundle size within mobile WebView targets?

## Next Steps

1. Assess current team capability against each Must Have skill.
2. Assign ownership for frontend, worker, data, and Telegram compliance.
3. Fill gaps with focused onboarding before feature expansion.
4. Start implementation with a base vertical slice from Paper-to-Code workflow.

If the user says: start developing the basic base, use this skills matrix to assign and sequence the first implementation tasks.

## Design workflow authority

Paper terminology in this capability checklist is historical. Follow DESIGN.md and docs/product/paper-to-code.md for current Pen preparation, visual approval and implementation; this checklist does not define a second visual system.
