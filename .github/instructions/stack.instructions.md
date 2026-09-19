# Project Stack & Architecture Instructions

## Final Stack (Do Not Change Unless Explicitly Told)

- Package Manager: Bun (used for install, dev server, build - everywhere)
- Frontend: React 19 + TypeScript + Tailwind CSS + @telegram-apps/telegram-ui (AppRoot as main wrapper) + Leaflet + react-leaflet
- Telegram Integration: Official script https://telegram.org/js/telegram-web-app.js (latest version) + @twa.js/sdk
- Backend: Hono + Cloudflare Workers (fully serverless)
- Database: Cloudflare D1 (SQLite on the edge) as primary database
- Storage: Cloudflare R2 + KV when needed
- Deploy: Cloudflare Pages (frontend) + Cloudflare Workers (backend)

## Why This Stack Was Chosen

### Serverless by Default

- No always-on servers to manage.
- Scales automatically with traffic spikes.
- Fast global delivery from Cloudflare edge locations.

### Free-Tier Friendly

- Cloudflare Pages, Workers, and D1 cover MVP and early growth without fixed monthly infrastructure costs.
- Cost increases are usage-based and predictable.

### Telegram WebView Performance

- React 19 and TelegramUI accelerate development while preserving native Telegram feel.
- Tailwind supports fast, consistent UI iteration.
- Leaflet is light enough for mobile WebView constraints.
- Bun keeps install, dev, and build cycles very fast.

## Recommended Monorepo Folder Structure

Use a single repository with clear ownership boundaries between frontend and worker:

```text
qahal/
  .github/
    instructions/
      bun.instructions.md
      qahal.instructions.md
      stack.instructions.md
      telegram.instructions.md
      skills.required.md
  apps/
    miniapp/
      public/
      src/
        app/
        components/
        features/
        lib/
        styles/
      index.html
      package.json
      tailwind.config.ts
      tsconfig.json
    worker/
      src/
        index.ts
        routes/
        middleware/
        services/
        db/
        types/
      migrations/
      wrangler.toml
      package.json
      tsconfig.json
  packages/
    shared/
      src/
        schemas/
        constants/
        telegram/
      package.json
      tsconfig.json
  docs/
    architecture/
    product/
```

### Boundary Rules

- apps/miniapp: UI, Telegram WebApp runtime hooks, map rendering, user interactions.
- apps/worker: API routes, auth validation, business logic, D1 access.
- packages/shared: shared DTOs, Zod schemas, constants, reusable Telegram helpers.

## Stack Flexibility Strategy (Future-Proofing)

Design now so replacements are low-risk later:

- D1 -> Neon/Postgres: keep data access behind repository/service interfaces.
- React -> Svelte: keep domain logic in framework-agnostic services and shared packages.
- Add real-time later: isolate event transport behind a messaging abstraction (KV polling, Durable Objects, WebSockets).
- Swap map provider: wrap Leaflet integration behind a map adapter interface.

### Flexibility Rules

- Keep business rules out of UI components.
- Define API contracts in shared schemas first.
- Version API routes when introducing breaking changes.
- Avoid framework-specific types in core domain modules.

## Bundle Optimization Rules and Performance Goals

Telegram Mini Apps run inside a constrained WebView. Treat performance as a product requirement.

### Rules

- Lazy-load feature routes and map-heavy modules.
- Defer non-critical scripts until after first meaningful render.
- Use dynamic imports for optional UI flows.
- Keep dependency count minimal and audited.
- Prefer SVG and compressed assets over heavy image payloads.
- Eliminate dead code and unused CSS in every release build.

### Performance Targets

- First meaningful UI: <= 1.5s on mid-tier mobile network.
- JS bundle (initial route): target <= 250KB gzip.
- Time to interactive: <= 2.5s on common Telegram in-app devices.
- 60fps for core gestures and map pan/zoom interactions.

### Build and Quality Gate

Before merge to main:

- Run Bun install/build/test checks.
- Confirm no regression in initial bundle size.
- Verify startup behavior in Telegram WebView, not only desktop browser.

## Design-to-Code Workflow

DESIGN.md v2.1 defines the system and screen inventory. design/qahal.pen holds the draft phones and component library. Follow docs/product/paper-to-code.md for Pen work, visual approval and implementation. Its historical filename does not imply Paper authority. Code owns behavior and accessibility; approved Pen screens own visual intent. Preserve AppRoot, shared contracts and the file conventions in AGENTS.md.

## How to Start Development

When asked to start building the basic base, follow this exact order:

1. Scaffold monorepo folders and Bun workspaces.
2. Create miniapp with React 19, TypeScript, Tailwind, TelegramUI AppRoot integration.
3. Create worker with Hono and Cloudflare Worker entrypoint.
4. Implement Telegram initData validation endpoint in worker.
5. Add D1 schema and migrations for users and location entities.
6. Connect miniapp boot sequence to Telegram script and SDK lifecycle.
7. Implement first end-to-end vertical slice:
   - Home shell
   - Telegram auth handshake
   - Fetch current user from worker
8. Add first map screen with Leaflet and static markers.
9. Add CI checks for build, lint, tests, and bundle guardrails.
10. Start feature-by-feature implementation using the canonical design-to-code workflow.

If the user says: start developing the basic base, execute these steps immediately in this sequence.
