# Qahal Cloudflare Go-Live Guide

This is the single source of truth for a full Cloudflare setup of all environments.

Use this document **top-to-bottom. Do not skip steps.**

Run all commands from `/Users/jhonny/qahal`.

---

## Target names and domains

| Resource      | Testing                     | Production      |
| ------------- | --------------------------- | --------------- |
| Worker name   | `qahal-dev`                 | `qahal`         |
| Pages project | `qahal-dev`                 | `qahal`         |
| API domain    | `api-development.qahal.xyz` | `api.qahal.xyz` |
| App domain    | `development.qahal.xyz`     | `app.qahal.xyz` |
| D1 database   | `qahal-db-test`             | `qahal-db-prod` |

---

## -1) Optional full reset

Run this **only** if you want to recreate everything from zero.

```bash
# Delete Workers
bunx wrangler delete qahal-dev --force || true
bunx wrangler delete qahal --force || true

# Delete Pages projects
bunx wrangler pages project delete qahal-dev --yes || true
bunx wrangler pages project delete qahal --yes || true
```

If you also want to recreate databases (**data will be lost**):

```bash
cd apps/worker && npx wrangler d1 delete qahal-db-test --yes || true
npx wrangler d1 delete qahal-db-prod --yes || true
```

---

## 0) Fill `.env`

Set these values in `.env` at the repository root:

```bash
# Worker secrets
TELEGRAM_BOT_TOKEN_TEST=...
TELEGRAM_BOT_TOKEN_PROD=...
INITDATA_MAX_AGE_SECONDS_TEST=300
INITDATA_MAX_AGE_SECONDS_PROD=300

# Mini App build-time vars (used by Pages build)
VITE_API_BASE_URL_TEST=https://api-development.qahal.xyz
VITE_API_BASE_URL_PROD=https://api.qahal.xyz
VITE_ENABLE_PROFILE_TESTING_TEST=true
VITE_ENABLE_PROFILE_TESTING_PROD=false
```

Verify they are not empty:

```bash
grep '^TELEGRAM_BOT_TOKEN_TEST=' .env
grep '^TELEGRAM_BOT_TOKEN_PROD=' .env
grep '^INITDATA_MAX_AGE_SECONDS_TEST=' .env
grep '^INITDATA_MAX_AGE_SECONDS_PROD=' .env
grep '^VITE_API_BASE_URL_TEST=' .env
grep '^VITE_API_BASE_URL_PROD=' .env
grep '^VITE_ENABLE_PROFILE_TESTING_TEST=' .env
grep '^VITE_ENABLE_PROFILE_TESTING_PROD=' .env
```

---

## 1) Install and validate

```bash
bun install
bun run check
bun run build
```

All three commands must pass before continuing. `bun run build` ensures `@qahal/shared` is built so the Worker and Mini App can bundle it.

---

## 2) Authenticate Cloudflare

```bash
bun run cf:login
bun run cf:whoami
```

Confirm this account owns `qahal.xyz`.

---

## 3) Ensure D1 databases exist

List existing D1 databases:

```bash
cd apps/worker && npx wrangler d1 list
```

You should see:

- `qahal-db-test`
- `qahal-db-prod`

If either is missing, create it:

```bash
bun run cf:d1:create:test
bun run cf:d1:create:prod
```

> **Important:** after creating a database, copy its `database_id` into `apps/worker/wrangler.toml` under the correct `[[d1_databases]]` or `[[env.production.d1_databases]]` block.

Verify the IDs in `wrangler.toml` match the live databases:

```bash
cd apps/worker && npx wrangler d1 list | grep -E "(qahal-db-test|qahal-db-prod)"
grep -A2 'database_name = "qahal-db-test"' wrangler.toml
grep -A2 'database_name = "qahal-db-prod"' wrangler.toml
```

---

## 4) Verify Worker config

Open `apps/worker/wrangler.toml` and confirm:

- Top-level `name = "qahal-dev"`
- Production `name = "qahal"`
- Testing route `api-development.qahal.xyz`
- Production route `api.qahal.xyz`
- Testing D1 binding uses `qahal-db-test` with the correct `database_id`
- Production D1 binding uses `qahal-db-prod` with the correct `database_id`
- `CORS_ALLOWED_ORIGINS` includes both `https://development.qahal.xyz` and `https://app.qahal.xyz`

---

## 5) Run D1 migrations

```bash
bun run cf:d1:migrate:test
bun run cf:d1:migrate:prod
```

Verify migrations applied:

```bash
cd apps/worker && npx wrangler d1 execute qahal-db-test --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
npx wrangler d1 execute qahal-db-prod --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see application tables (e.g. `users`, `communities`, etc.) in both outputs.

---

## 6) Upload Worker secrets from `.env`

```bash
bun run cf:secret:bot:test
bun run cf:secret:bot:prod
bun run cf:secret:initdata:test
bun run cf:secret:initdata:prod
```

Confirm secrets are set:

```bash
cd apps/worker && npx wrangler secret list
npx wrangler secret list --env production
```

You should see `TELEGRAM_BOT_TOKEN` and `INITDATA_MAX_AGE_SECONDS` in both environments.

---

## 7) Deploy Workers

```bash
bun run cf:deploy:test
bun run cf:deploy:prod
```

After deploy, verify the custom API domains respond:

```bash
curl -s -o /dev/null -w "%{http_code}" https://api-development.qahal.xyz/health || echo " (check manually)"
curl -s -o /dev/null -w "%{http_code}" https://api.qahal.xyz/health || echo " (check manually)"
```

If there is no `/health` route yet, verify the domain is attached in the Cloudflare dashboard under **Workers & Pages > qahal-dev / qahal > Triggers > Custom Domains**.

---

## 8) Create Pages projects

```bash
cd apps/worker && npx wrangler pages project create qahal-dev --production-branch main
npx wrangler pages project create qahal --production-branch main
```

If the projects already exist, this will fail safely — proceed to the next step.

---

## 9) Configure Pages build settings (dashboard)

For **both** `qahal-dev` and `qahal` in the Cloudflare Pages dashboard:

1. Go to **Settings > Build & deployments**
2. Set:
   - **Root directory:** `apps/miniapp`
   - **Build command:** `bun run build`
   - **Output directory:** `dist`
3. Save

> **Why `apps/miniapp`?** The Mini App is a Vite React app. It must build from its own directory so `vite.config.ts` and `index.html` are resolved correctly.

---

## 10) Set Pages environment variables

In the Cloudflare Pages dashboard, set **Production** environment variables for each project:

**Project `qahal-dev`:**

| Variable                      | Value                               |
| ----------------------------- | ----------------------------------- |
| `VITE_API_BASE_URL`           | `https://api-development.qahal.xyz` |
| `VITE_ENABLE_PROFILE_TESTING` | `true`                              |

**Project `qahal`:**

| Variable                      | Value                   |
| ----------------------------- | ----------------------- |
| `VITE_API_BASE_URL`           | `https://api.qahal.xyz` |
| `VITE_ENABLE_PROFILE_TESTING` | `false`                 |

> **Note:** `VITE_` vars are baked in at build time. They must be set in the Pages dashboard (or CI) — the Mini App does not read runtime secrets.

---

## 11) Deploy Pages (first time)

For the **first deploy** (or manual deploys), build locally and push with Wrangler:

### Testing

```bash
cd apps/miniapp && \
  VITE_API_BASE_URL=https://api-development.qahal.xyz \
  VITE_ENABLE_PROFILE_TESTING=true \
  bun run build
```

Then deploy from the repo root:

```bash
apps/worker/node_modules/.bin/wrangler pages deploy apps/miniapp/dist --project-name qahal-dev --branch main
```

### Production

```bash
cd apps/miniapp && \
  VITE_API_BASE_URL=https://api.qahal.xyz \
  VITE_ENABLE_PROFILE_TESTING=false \
  bun run build
```

Then deploy from the repo root:

```bash
apps/worker/node_modules/.bin/wrangler pages deploy apps/miniapp/dist --project-name qahal --branch main
```

After deploy, confirm the URLs are live:

```bash
curl -s -o /dev/null -w "%{http_code}" https://development.qahal.xyz
curl -s -o /dev/null -w "%{http_code}" https://app.qahal.xyz
```

---

## 12) Bind custom domains to Pages

In the Cloudflare Pages dashboard:

- Project `qahal-dev` → Custom domains → `development.qahal.xyz`
- Project `qahal` → Custom domains → `app.qahal.xyz`

Wait for the DNS records to provision (usually under 60 seconds).

Verify:

```bash
curl -sI https://development.qahal.xyz | head -1
curl -sI https://app.qahal.xyz | head -1
```

Both should return `200 OK`.

---

## 13) Configure BotFather URLs

Open [@BotFather](https://t.me/BotFather) and set the Mini App URL for each bot:

- **Testing bot** → `https://development.qahal.xyz`
- **Production bot** → `https://app.qahal.xyz`

Do **not** cross-link test and production URLs.

---

## 14) Smoke test in Telegram

For **both** testing and production bots:

1. Open the Mini App from the bot menu.
2. Confirm the app shell loads and expands to full screen.
3. Confirm auth succeeds (no `invalid_hash` error).
4. Complete onboarding.
5. Confirm map and communities load.
6. Confirm profile update works.

If any step fails, see **Troubleshooting** below.

---

## 15) Optional: connect GitHub for auto-deploy

To enable automatic deploys on every push:

1. In the Cloudflare dashboard, go to each Pages project.
2. Click **Set up Git** and connect the GitHub repository.
3. Select `main` as the production branch.
4. Ensure the build settings from Step 9 are still correct after connecting.

From this point on, every push to `main` will trigger a Pages build and deploy.

---

## 16) Configure GitHub Actions secrets

The CI/CD workflows require two secrets in your GitHub repository:

1. Go to **GitHub repo → Settings → Secrets and variables → Actions**
2. Click **New repository secret**

| Secret name             | Value                              | How to get it                                                                                                  |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Your Cloudflare API token          | **Cloudflare dashboard** → My Profile → API Tokens → Create Token → Use the "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | `ee926269d38fbdfc2103d2075f3546b0` | Run `bun run cf:whoami` or check the Cloudflare dashboard URL                                                  |

> **Token permissions needed:** Cloudflare Workers (Edit), Cloudflare Pages (Edit), D1 (Edit)

---

## Troubleshooting

| Symptom                                                     | Cause / Fix                                                                                                                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Invalid uuid` on Worker deploy                             | Wrong `database_id` in `apps/worker/wrangler.toml`. Run `bunx wrangler d1 list` and copy the correct IDs.                                                                                 |
| `Authentication error [code: 10000]`                        | Session expired. Run `bun run cf:login` and `bun run cf:whoami` again.                                                                                                                    |
| `Missing TELEGRAM_BOT_TOKEN_TEST in .env`                   | Token value is empty or missing in `.env`. Fill it and re-run the secret command.                                                                                                         |
| `invalid_hash` in Telegram Mini App                         | Wrong bot token for the bot that launched the Mini App. Check `TELEGRAM_BOT_TOKEN_TEST` vs `TELEGRAM_BOT_TOKEN_PROD` and the BotFather URL.                                               |
| CORS failures in browser                                    | Check `CORS_ALLOWED_ORIGINS` in `wrangler.toml` includes the exact Pages domain (`https://development.qahal.xyz` or `https://app.qahal.xyz`).                                             |
| Pages build fails with "Cannot find module `@qahal/shared`" | Run `bun run build:shared` from the repo root before building the Mini App.                                                                                                               |
| Mini App shows blank screen                                 | Check browser console for 404s on JS/CSS. Make sure the Pages **Output directory** is `dist` (not `build` or `dist/dist`).                                                                |
| Worker deploy from CI fails                                 | Ensure the deploy command runs from `apps/worker` or uses `--config apps/worker/wrangler.toml`.                                                                                           |
| Database tables missing                                     | Re-run `bun run cf:d1:migrate:test` / `bun run cf:d1:migrate:prod` and verify with `bunx wrangler d1 execute ... --remote --command "SELECT name FROM sqlite_master WHERE type='table';"` |

---

## Useful commands

```bash
# Stream live Worker logs
bun run cf:tail:test
bun run cf:tail:prod

# List all Pages projects
cd apps/worker && npx wrangler pages project list

# List all D1 databases
cd apps/worker && npx wrangler d1 list

# Quick local build check for the Mini App
cd apps/miniapp && VITE_API_BASE_URL=https://api-development.qahal.xyz VITE_ENABLE_PROFILE_TESTING=true bun run build

# Quick local build check for the Worker
cd apps/worker && bun run typecheck && bun run build
```
