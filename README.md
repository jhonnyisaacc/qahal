# Qahal

Qahal is a Telegram Mini App focused on helping users connect with local Emunah communities in the physical world.

### Stack

- Package manager and runtime: Bun
- Frontend: React 19 + TypeScript + Tailwind + Leaflet
- Backend: Hono + Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2 and KV when needed

## Monorepo Structure

- apps/miniapp: Telegram Mini App frontend
- apps/worker: Cloudflare Worker backend
- packages/shared: shared types and schemas

## Setup

1. In /Users/jhonny/qahal run:

```bash
bun install
```

2. In /Users/jhonny/qahal run frontend and worker in parallel:

```bash
bun run dev
```

3. In /Users/jhonny/qahal run checks:

```bash
bun run check
```

4. In /Users/jhonny/qahal run builds:

```bash
bun run build
```

## Worker Environment

Set Worker secrets before deployment:

- TELEGRAM_BOT_TOKEN
- INITDATA_MAX_AGE_SECONDS (optional)

Configure D1 in apps/worker/wrangler.toml by setting database_id and database_name.

## Telegram + Web Architecture

The miniapp frontend is implemented as one shared React application that runs in two runtime targets:

- Telegram Mini App runtime (inside Telegram WebView)
- Standalone mobile web runtime (regular browser)

This keeps UI, state, and feature code unified while only runtime-specific behavior is adapted at the platform boundary.

### Local mobile-web preview

- Frontend dev server: http://localhost:3006
- Worker API (proxied by Vite): http://127.0.0.1:8787 via /api

To test mobile behavior in a desktop browser, open dev tools device emulation and visit http://localhost:3006.

## Design system and Pen workflow

[DESIGN.md](DESIGN.md) contains the canonical system, audit and screen inventory. The future Pen workflow is documented in [docs/product/paper-to-code.md](docs/product/paper-to-code.md). Phase 1 consolidates foundations; no Pen screens have been created or approved.
