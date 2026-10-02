# Redesign operations and recovery

Tracking issue: https://github.com/jhonnyisaacc/qahal/issues/3 (GitHub redirects the former `edyhvh/qahal` repository).

## Deployment order

Do not deploy the new Worker before provisioning keys and migrating D1. Test against a separate D1 database first. Never run operator commands against a database selected implicitly.

1. Pause application writes for migration. Capture a D1 recovery point/export and securely retain the old key ring. Keep the application unavailable during the backfill; do not serve partially migrated discovery.
2. Apply migrations 0009–0011 through the existing Wrangler migration commands. They add invitations, throttles, encrypted storage, privacy consent, current coarse locations, and online Qahals. They clear photo values and remove historical/precise locations. The community rebuild copies dependent records atomically.
3. Provision `DATA_KEYS` (JSON object from version IDs to base64-encoded random 32-byte keys), `DATA_KEY_ID` (active version), and `LOOKUP_KEY` (independent base64-encoded random 32-byte HMAC key) as environment-specific Worker secrets. Generate them with a cryptographic random source and store recovery copies in the operator's secret manager, never the repository or CI output.
4. Run `backfill`, then `verify` using the same keys. Deploy the encrypted-writing Worker and frontend, with `INVITE_GATE_ENABLED=true`. Leave `ALLOW_LEGACY_PLAINTEXT` absent/false; it exists only for an explicitly controlled transition.
5. Provision approved leaders and deliver codes through your existing trusted channel. Resume traffic only after authenticated smoke tests. Never enable demo identity on hosted staging.

From `/Users/jhonny/qahal/apps/worker`, the existing migration commands are `bun run cf:d1:migrate:test` and `bun run cf:d1:migrate:prod`. Choose only the intended environment. These commands mutate remote databases.

## Operator commands

Run from `/Users/jhonny/qahal/apps/worker`. Load `CLOUDFLARE_ACCOUNT_ID`, `QAHAL_DATABASE_ID`, and a least-privilege D1-edit `CLOUDFLARE_API_TOKEN` through the operator environment. For encryption commands also load `DATA_KEYS`, `DATA_KEY_ID`, and `LOOKUP_KEY`. The tool never prints D1 response bodies or private profile contents.

- `bun run scripts/operator.ts approve-leader <telegramId>` provisions or approves a leader. Verify the Telegram ID through your trusted leadership process first. This does not onboard or admit the leader.
- `bun run scripts/operator.ts issue <leaderId>` issues a 128-bit shared code with 30-day expiry and 100 admissions. It prints the code once; do not run in logged CI. Store only the returned code ID for revocation.
- `bun run scripts/operator.ts revoke <codeId>` blocks new admissions without invalidating existing ones. For replacement, revoke and then issue again.
- `bun run scripts/operator.ts backfill` encrypts legacy user fields/answers and meeting schedules in batches, verifies ciphertext before clearing plaintext, and safely resumes after interruption. Requires paused writes.
- `bun run scripts/operator.ts verify` decrypts every envelope and checks that legacy personal fields/answers/schedules are empty. A failure blocks cutover.
- `bun run scripts/operator.ts rotate` rewrites ciphertext using the active key with compare-and-swap to avoid overwriting concurrent edits. Repeat and verify before retiring old keys.

Existing code holders may redeem repeatedly without consuming another admission. Code revocation is not account suspension. The gate can be disabled with `INVITE_GATE_ENABLED=false`; Telegram authentication remains mandatory on hosted environments.

## Encryption boundary and retention

Names, usernames, birth dates, doctrine answers, meeting schedules and private meeting links are AES-256-GCM encrypted. Context and key version are authenticated; each encryption generates a fresh nonce. Authorized Worker code can decrypt these fields. This is not end-to-end encryption.

Telegram IDs, memberships, approval/badge state, admission records, code metadata, community names, language, city/area and coarse location indexes remain readable to database administrators. Username lookup uses a separately keyed HMAC. The public discovery DTO omits coordinates and doctrine answers. Only opted-in Emunah-badge holders with completed onboarding are discoverable. Contact visibility requires separate consent.

Only the current 0.05-degree area is retained per user. Radius calculations use cell centers and are approximate. A city selected manually uses its center. Codes are hash-only; redemption throttling retains hashed-IP/account buckets for at most the current 15-minute window plus idle time until the next redemption cleanup. Historical seed people are not exposed by active discovery APIs.

Null legacy columns remain for migration compatibility; photo-write triggers reject pictures. Backfill removes plaintext values, not copies in historical backups. Treat exports/recovery points as sensitive and expire them according to the chosen operational retention policy.

## Rotation and recovery

Add a new random key version to `DATA_KEYS` while retaining old versions, switch `DATA_KEY_ID`, and run `rotate`. Verify every current ciphertext uses the active version before removing an old key. Keep old keys for the lifetime of any backups encrypted under them. Loss of a required key makes its data unrecoverable.

Keep `LOOKUP_KEY` stable during data-key rotation. To rotate it separately, pause writes, deploy the replacement key consistently and rebuild all username indexes with `backfill` before resuming username-based management.

Restore a matching database recovery point and key ring in an isolated environment, run verification and migration as needed, then switch traffic. Never roll back to an application version that writes plaintext after cutover. On missing keys, corrupted ciphertext or database errors, the Worker fails closed rather than returning seed data or reporting an unpersisted success.

## Release validation

From `/Users/jhonny/qahal`: `bun install`, `bun run check`, `bun run test`, `bun run build`. Before merge/deployment, also verify real Telegram WebView startup, stale-session recovery, location denial/manual fallback, light/dark themes, Hebrew direction, safe areas and mobile performance. A desktop preview is not a substitute for this check.
