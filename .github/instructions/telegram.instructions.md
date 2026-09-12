# Telegram Mini App Development & UX/UI Rules

## Scope and Authority

This document is the single source of truth for Telegram Mini App compliance in this project.

Primary references:

- Development: https://core.telegram.org/bots/webapps
- UX/UI baseline: https://docs.ton.org/ecosystem/tma/telegram-ui/overview

If more recent official Telegram or TelegramUI guidance is published, update this file immediately.

## Required Script Loading and Initialization

### Script Loading

- Load the official Telegram WebApp script from Telegram domain only.
- Keep the script version current as recommended by official docs.
- Do not replace official script behavior with custom polyfills unless strictly necessary.

Recommended include:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### Initialization Sequence

Execute this startup order on app boot:

1. Initialize UI root and critical shell.
2. Call Telegram WebApp ready signal as soon as the core UI is interactive.
3. Apply theme params and safe-area values before rendering sensitive layouts.
4. Expand app when full-height UX is intended.

## initData Validation Rules (Strict)

Never trust client-only Telegram user data.

### Mandatory Rules

- Validate initData on backend (Cloudflare Worker) for every authenticated session start.
- Verify hash/signature using bot token according to official algorithm.
- Validate auth_date freshness to reduce replay risk.
- Reject requests with invalid or expired payloads.
- Do not grant user session based on initDataUnsafe alone.

### Backend Security Checklist

- Input canonicalization before hash validation.
- Constant-time comparison for signature checks.
- Centralized middleware for auth gate.
- Structured security logs without leaking secrets.

## Required Telegram WebApp Features

Implement and standardize these behaviors:

- ready(): call once app shell is interactive.
- expand(): use for primary full-height flows.
- Theme support: listen and react to theme updates.
- Safe areas: respect content and device insets.
- Haptic feedback: apply meaningful haptics for key actions.
- LocationManager: use official location flows and permission handling.
- MainButton/BackButton controls: only when interaction model needs it.

## Newer API Adoption Policy (2025-2026+)

When available and stable, evaluate and adopt:

- Fullscreen controls.
- DeviceStorage and SecureStorage capabilities.
- Any newly released Telegram Mini App APIs relevant to UX, security, or performance.

Adoption criteria:

- Production readiness in official docs.
- Backward compatibility for older Telegram clients.
- Clear user value and measurable UX/performance impact.

## UX/UI Rules for Native Telegram Feel

### Design Principles

- Mobile-first layouts only.
- Native Telegram interaction rhythm and visual hierarchy.
- Fast, clear, low-friction flows.
- Keep copy concise and action-oriented.

### TelegramUI Usage Rules

- Use @telegram-apps/telegram-ui as primary UI foundation.
- Wrap app in AppRoot.
- Use component primitives before custom building equivalents.
- Extend with Tailwind carefully without breaking native feel.

### Motion and Interaction

- Target smooth interactions with stable frame pacing.
- Keep animations short and purposeful.
- Avoid heavy transition stacks in map and list screens.

### Accessibility and Readability

- Ensure contrast and tap target sizes for one-handed mobile use.
- Respect dynamic theme and user context.
- Avoid hidden critical actions behind gestures only.

## WebView Performance Best Practices

Telegram WebView has tighter constraints than full browser contexts.

### Rules

- Prioritize initial route speed and low memory usage.
- Lazy-load non-critical modules.
- Defer heavy map and media logic until needed.
- Keep startup JavaScript small and deterministic.
- Avoid unnecessary re-renders during scrolling and map movement.

### Operational Targets

- Fast startup on mid-tier mobile devices.
- Stable map interactions without dropped frames in common scenarios.
- No blocking network waterfalls at boot.

## Security and Privacy Requirements

- Treat user location and profile data as sensitive.
- Minimize stored personal data.
- Use server-side authorization checks for protected operations.
- Do not expose bot token or privileged credentials to frontend.
- Add audit logs for auth and critical state changes.

## Testing and Compliance Checklist

Before release:

- Validate auth and session bootstrap with real Telegram launch context.
- Verify theme switching and safe-area behavior.
- Verify permission-denied flows (location, storage).
- Confirm startup and interaction performance on real mobile devices.
- Run regression checks for worker auth and D1 access paths.

## Design-to-Code Workflow (Telegram Compliant)

Follow DESIGN.md and docs/product/paper-to-code.md for approved Pen visuals and implementation. Keep AppRoot, safe areas, ready/expand, theme subscriptions, haptics, location permissions and real Telegram WebView QA. Code remains authoritative for accessibility behavior and API contracts. Phase 1 is foundations only.

## Change Management and Flexibility

This file must stay flexible and updated.

- Review Telegram docs periodically or before each release milestone.
- Add a changelog section when introducing or deprecating Telegram features.
- Mark requirements by status: Required, Recommended, Optional.

## How to Start Development

When beginning base implementation, follow this order:

1. Integrate official Telegram script and SDK bootstrap.
2. Implement backend initData validation middleware in worker.
3. Implement app boot lifecycle: ready, expand, theme, safe-area.
4. Build first TelegramUI-compliant shell screens.
5. Add location capability and permission flows.
6. Validate on real Telegram WebView before expanding features.

If the user says: start developing the basic base, start from these steps directly.
