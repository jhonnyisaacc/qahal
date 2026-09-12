# Qahal — Agent Coding Guide

> **Qahal** (קהל — "assembly") is a Telegram Mini App that helps people find physical Emunah communities and believers near them for real-life prayer, study, and fellowship.
>
> **Primary instruction:** Follow this document for all code changes. Deeper `AGENTS.md` files in subdirectories take precedence over this root file.

---

## 1. Runtime & Commands

**Bun is the only runtime and package manager.**

| Do this               | Never do this                         |
| --------------------- | ------------------------------------- |
| `bun install`         | `npm install`, `yarn`, `pnpm install` |
| `bun run dev`         | `npm run dev`, `yarn dev`, `pnpm dev` |
| `bun run build`       | `npm run build`                       |
| `bunx <command>`      | `npx <command>`                       |
| `bun test`            | `node --test`, `jest`                 |
| `bun --env-file=.env` | `dotenv` CLI helpers                  |

- When suggesting commands, give the **exact** command and the **exact** directory to run it from.
- Do not generate fake terminal output or assume success/failure.
- Wait for real output before continuing analysis.

---

## 2. Locked Tech Stack

| Layer                     | Technology                                                    |
| ------------------------- | ------------------------------------------------------------- |
| Package manager / runtime | Bun                                                           |
| Frontend framework        | React 19 + TypeScript                                         |
| Styling                   | Tailwind CSS                                                  |
| Telegram UI primitives    | `@telegram-apps/telegram-ui` (AppRoot as root wrapper)        |
| Maps                      | Leaflet + `react-leaflet`                                     |
| Telegram integration      | `https://telegram.org/js/telegram-web-app.js` + `@twa.js/sdk` |
| Backend                   | Hono + Cloudflare Workers                                     |
| Database                  | Cloudflare D1 (SQLite on the edge)                            |
| Storage (when needed)     | Cloudflare R2 + KV                                            |
| Frontend deploy           | Cloudflare Pages                                              |
| Backend deploy            | Cloudflare Workers                                            |

**Do not swap these unless explicitly told.**

---

## 3. Monorepo Boundaries

```text
qahal/
  apps/
    miniapp/   ← UI, Telegram WebApp hooks, maps, user interactions
    worker/    ← API routes, auth, business logic, D1 access
  packages/
    shared/    ← Zod schemas, DTOs, constants, Telegram helpers
```

- `apps/miniapp` **never** talks to D1 directly. It calls `apps/worker` APIs.
- `apps/worker` **never** imports React or DOM code.
- `packages/shared` stays framework-agnostic: no React types, no Hono types in core domain modules.
- Define API contracts in `packages/shared` schemas first.

---

## 4. Telegram Mini App Compliance

This is **non-negotiable**. Read `docs/product/cloudflare-go-live.md` for deploy steps.

### Required Boot Sequence

1. Initialize UI root and critical shell.
2. Call `Telegram.WebApp.ready()` as soon as the core UI is interactive.
3. Apply theme params and safe-area values before rendering sensitive layouts.
4. Call `Telegram.WebApp.expand()` when full-height UX is intended.

### initData Validation (Strict)

- **Always** validate initData on the backend (Cloudflare Worker) for every authenticated session start.
- Verify hash/signature using the bot token per the official algorithm.
- Validate `auth_date` freshness to reduce replay risk.
- Use constant-time comparison for signature checks.
- Reject requests with invalid or expired payloads.
- Never grant sessions based on `initDataUnsafe` alone.

### Required Behaviors

| Feature                 | Rule                                                |
| ----------------------- | --------------------------------------------------- |
| `ready()`               | Call once the app shell is interactive              |
| `expand()`              | Use for primary full-height flows                   |
| Theme support           | Listen and react to theme updates                   |
| Safe areas              | Respect content and device insets                   |
| Haptic feedback         | Apply meaningful haptics for key actions            |
| LocationManager         | Use official location flows and permission handling |
| MainButton / BackButton | Only when the interaction model needs it            |

### Performance Rules for WebView

- Lazy-load feature routes and map-heavy modules.
- Defer non-critical scripts until after first meaningful render.
- Keep startup JavaScript small and deterministic.
- Avoid unnecessary re-renders during scrolling and map movement.

---

## 5. Design System

**DESIGN.md is the canonical design policy and inventory.** CSS tokens implement it. Once a screen is approved in Pen, Pen is its visual source of truth; code owns behavior, data, accessibility behavior and architecture.

- Always consult DESIGN.md for UI, styling or branding changes.
- Use Manrope and Qahal Purple/Ink/Paper. Playfair/Inter and nautical parchment directions are superseded.
- Follow the light/dark, Hebrew, token and accessibility requirements in DESIGN.md.
- Phase 1 establishes foundations only; Pen materialization requires the separately requested next phase.

---

## 7. File Naming Conventions

| Type               | Pattern                                     | Example             |
| ------------------ | ------------------------------------------- | ------------------- |
| Screens            | `FeaturePurposeScreen.tsx`                  | `HomeScreen.tsx`    |
| Reusable blocks    | `FeatureNameCard.tsx`, `FeatureNameRow.tsx` | `CommunityCard.tsx` |
| Hooks              | `useFeatureName.ts`                         | `useAuth.ts`        |
| Services           | `featureNameService.ts`                     | `authService.ts`    |
| API route handlers | `feature-name.ts`                           | `auth.ts`           |

---

## 8. Performance Targets

| Metric                    | Target                            |
| ------------------------- | --------------------------------- |
| First meaningful UI       | ≤ 1.5s on mid-tier mobile         |
| JS bundle (initial route) | ≤ 250KB gzip                      |
| Time to interactive       | ≤ 2.5s on common Telegram devices |
| Map pan/zoom              | 60fps                             |

---

## 9. Quality Gate (before merge to `main`)

1. `bun install` passes.
2. `bun run check` passes (TypeScript typecheck across workspaces).
3. `bun run build` passes.
4. No regression in initial bundle size.
5. Verify startup behavior in real Telegram WebView, not only desktop browser.

---

## 10. Design-to-Code Workflow

Follow the canonical workflow in [docs/product/paper-to-code.md](docs/product/paper-to-code.md). The historical filename now documents Pen preparation, approval and implementation. Do not treat old Paper artboard IDs as approved Pen specifications. Preserve AppRoot, feature boundaries and Telegram QA requirements.

---

## 11. Security & Privacy

- Treat user location and profile data as sensitive.
- Minimize stored personal data.
- Use server-side authorization checks for protected operations.
- Do not expose bot token or privileged credentials to the frontend.
- Keep databases private even though the repository is public/open source.

---

## 12. Useful Reference

- Telegram Mini Apps docs: https://core.telegram.org/bots/webapps
- TelegramUI docs: https://docs.ton.org/ecosystem/tma/telegram-ui/overview
- Cloudflare Workers + D1 docs: https://developers.cloudflare.com/workers/
- Hono docs: https://hono.dev
- Bun docs: https://bun.sh/docs
