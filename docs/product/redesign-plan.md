# Qahal redesign: controlled access and list-based discovery

Product and access decisions below are historical implementation intent. Current visual policy is [DESIGN.md](../../DESIGN.md) v2.1; draft screens are [`design/qahal.pen`](../../design/qahal.pen).

## Decisions

- Telegram Mini App identity remains the only production sign-in, validated on the Worker.
- `INVITE_GATE_ENABLED` gates every non-admitted account, including previously onboarded users. Turning it off never disables authentication.
- Operators issue shared codes to approved leaders: 128-bit minimum entropy, hash-only storage, 30-day expiry, 100 unique admissions, revocation and replacement. Redemption is atomic, idempotent per Telegram account, and persistently throttled by account and IP. Admission grants neither membership nor leadership.
- Before admission, only health, authentication, access status and redemption are available. Enforce this on both API URL aliases. Identity/demo bypasses are local/test-only.
- Encrypt names, usernames, doctrine answers and private meeting details with AES-256-GCM, unique 96-bit nonces, record/field authenticated context, and versioned environment-specific Worker secret keys. Preserve username lookup through a separately keyed normalized HMAC index.
- Retain necessary identity/authorization metadata and coarse discovery indexes outside field encryption; document that exposure. Keep only the current user area, rounded to 0.05-degree cells. Never return another person's coordinates.
- Migrate additively, enable encrypted writes, backfill resumably, verify, then remove plaintext. Document rotation/recovery and prohibit rollback to plaintext-writing code after cutover.
- Community types are `in_person` and `online`; existing communities become in-person. Hybrid is out of scope. Online communities need no coordinates. Private meeting links remain member-only.
- Home defaults to Local, with approximate radius choices 10/25/50/100 km (25 default), and a separate paginated Online tab. Use Telegram location permission with manual city fallback.
- Only a successful empty Local search falls back to opted-in Emunah people within the radius. Discoverability defaults off. Exclude self; expose only display name, area and consented Telegram contact. Online results do not suppress fallback. Request errors are retry states.
- Remove map flows and entity pictures from UI, API, storage and fixtures; retain the app Qof brandmark. Preserve join/manage authorization, themes, translations, accessibility and Telegram safe areas. Update DESIGN.md.

Current working branch: `feat/new-redesign` (renamed at user request after the documentation commit).

## Implementation sequence

1. Documentation-only first commit on `codex/redesign-plan`: this plan and the issue draft. Commit message: `docs: define gated-access and list-discovery redesign`. Leave `design/advance1-en.png` untouched. Check for a matching issue before publishing to `edyhvh/qahal`.
2. Shared access contracts, D1 admission/code/throttle migration, operator command, Telegram enforcement, and onboarding gate.
3. Encryption service, protected field integrations, migration/backfill/verification and rotation/recovery documentation.
4. Shared community/discovery/consent contracts, migration and authorized discovery APIs.
5. Local/Online list UI, entity-picture removal, design documentation and updated fixtures.
6. Automated checks, bundle review, staged rollout and real Telegram WebView QA.

## Contracts

Define in `packages/shared` first: access status/redemption; type-dependent community create/manage fields; radius and paginated discovery; discoverability preferences and minimal person summaries; photo-free DTOs.

## Acceptance and rollout

- Test invalid/stale Telegram data, identity mismatch, direct API and alias bypasses, code expiry/revocation/capacity/concurrency/idempotency, and flag changes.
- Test encryption tampering/context binding, missing keys, rotation, migration retries and plaintext removal.
- Test community separation, radius boundaries, opt-in/self-exclusion, empty/error states, pagination, no pictures/maps and retained branding.
- From `/Users/jhonny/qahal`: `bun install`, `bun run check`, `bun run test`, `bun run build`. Review initial gzip bundle against 250 KB and baseline.
- Before merge, verify startup, permissions, theme, safe areas and performance in a real Telegram WebView. Desktop checks cannot substitute for this.
- Documentation-only first commit requires diff/link review, not application tests. No production migration or deployment is implied by local implementation.

## Security references

- [Workers Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [D1 data security](https://developers.cloudflare.com/d1/reference/data-security/)

Server-side encryption allows the authorized Worker to decrypt. It does not hide data from the running application or encrypt relational metadata end-to-end.
