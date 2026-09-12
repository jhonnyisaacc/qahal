# Architecture Overview

## Scope

Qahal is a serverless Telegram Mini App built with a Bun workspace monorepo.

## Packages

- apps/miniapp: React 19 frontend rendered inside Telegram WebView.
- apps/worker: Hono API on Cloudflare Workers.
- packages/shared: shared schemas and DTOs.

## Runtime Boundaries

- Frontend handles list-based Local/Online congregation discovery, profile and contextual management UI, and Telegram WebApp client APIs. Map modules remain legacy and are not rendered by active navigation.
- Worker handles auth validation, data persistence, and API contracts.
- Shared package ensures request and response schema consistency.

## Data Layer

Cloudflare D1 is the primary database for users and location records.

## Storage Layer

R2 and KV are reserved for future file and cache workloads.

## Deployment

- Frontend deploy target: Cloudflare Pages
- Backend deploy target: Cloudflare Workers
