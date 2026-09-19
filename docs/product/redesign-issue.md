## Title

Implement gated Telegram onboarding and list-based Qahal discovery

## Summary

Redesign Qahal around invitation-controlled access and Local/Online community lists. Add server-side protection for sensitive data and remove personal avatars and congregation logos.

## Scope / What to do

- Require shared leader-distributed codes behind a backend feature flag, including for existing users.
- Keep Telegram as the sole production sign-in method.
- Add operator-issued, expiring, usage-limited codes and atomic, throttled redemption.
- Encrypt sensitive fields with versioned keys and a documented migration/recovery process.
- Distinguish in-person and online Qahals.
- Replace maps with radius-based Local and separate Online lists.
- Show opted-in nearby Emunah people when no local Qahal exists.
- Remove entity pictures while retaining Qahal app branding.

## Current Problem / Root Cause

The current implementation includes map-oriented flows, photo-bearing user responses, plaintext application fields, and discovery paths that do not consistently require authentication. Community contracts do not distinguish online from in-person Qahals.

## Examples

- An existing user without admission must enter a valid leader code before accessing Home.
- A Local search with no Qahal within 25 km shows opted-in nearby people.
- Online Qahals remain discoverable regardless of location permission.

## Impact

Enables a controlled launch through congregation leaders, reduces exposed personal data, and simplifies community discovery.

## Proposed Solution / Recommended Fix

Implement in sequence: access gate and Telegram enforcement; encryption and migration; community types and discovery APIs; list UI and picture removal; staged rollout and Telegram QA.

Use the agreed defaults: operator-issued shared codes, 30-day expiry, 100 admissions, 25 km radius, approximate locations, and discoverability disabled until consent.

## Files / Locations Involved

`packages/shared`, `apps/worker`, `apps/miniapp`, and product/design documentation. Implementation decisions and test plan: `docs/product/redesign-plan.md`.

## Acceptance Criteria / How to know it's fixed

- All protected APIs enforce Telegram identity and admission when the flag is enabled.
- Code redemption is concurrency-safe, throttled, expiring, and revocable.
- Sensitive fields are encrypted and key rotation is tested.
- Local and Online lists use the correct community types.
- People appear only after a successful empty Local result and only with consent.
- Entity pictures and map navigation are removed.
- Required checks, bundle review, and real Telegram WebView QA pass.

## Related Issues / Context

Based on the agreed redesign plan. Tracking issue: https://github.com/jhonnyisaacc/qahal/issues/3 (the former repository URL redirects here).
