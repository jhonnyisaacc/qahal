/** Run with Bun. Credentials come from the operator environment, never from the browser. */
import { hashCode } from '../src/services/access';
import { privateMigration } from '../src/services/privateMigration';
import type { Bindings } from '../src/types/env';
const [command, argument] = Bun.argv.slice(2);
if (
  !['issue', 'revoke', 'approve-leader', 'backfill', 'verify', 'rotate'].includes(command ?? '')
) {
  console.error(
    'Usage: bun run scripts/operator.ts issue <leaderId> | revoke <codeId> | approve-leader <telegramId> | backfill | verify | rotate',
  );
  process.exit(1);
}
const {
  CLOUDFLARE_ACCOUNT_ID: account,
  QAHAL_DATABASE_ID: databaseId,
  CLOUDFLARE_API_TOKEN: token,
} = process.env;
if (!account || !databaseId || !token)
  throw new Error('Set CLOUDFLARE_ACCOUNT_ID, QAHAL_DATABASE_ID, CLOUDFLARE_API_TOKEN');
const env = {
  DB: null,
  DATA_KEYS: process.env.DATA_KEYS,
  DATA_KEY_ID: process.env.DATA_KEY_ID,
  LOOKUP_KEY: process.env.LOOKUP_KEY,
} satisfies Bindings;
async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    },
  );
  const data = (await response.json()) as {
    success: boolean;
    result?: { success: boolean; results: T[] }[];
  };
  if (!response.ok || !data.success || !data.result?.[0]?.success)
    throw new Error('D1 operation failed; sensitive response suppressed');
  return data.result[0].results;
}
if (command === 'approve-leader') {
  const id = Number(argument);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid Telegram ID');
  await query(
    "INSERT INTO users(telegram_id, emunah_state, emunah_level_approved) VALUES (?, 'leader', 1) ON CONFLICT(telegram_id) DO UPDATE SET emunah_state = 'leader', emunah_level_approved = 1",
    [id],
  );
  console.log(
    'Leader approved. Issue a code and provide it through your existing trusted channel.',
  );
} else if (command === 'issue') {
  const leader = Number(argument);
  const code = Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
    n.toString(16).padStart(2, '0'),
  )
    .join('')
    .toUpperCase();
  const id = crypto.randomUUID();
  const result = await query(
    `INSERT INTO access_codes(id, code_hash, leader_telegram_id, expires_at, max_uses)
    SELECT ?, ?, telegram_id, ?, 100 FROM users WHERE telegram_id = ? AND emunah_state = 'leader' AND emunah_level_approved = 1 RETURNING id`,
    [id, await hashCode(code), Math.floor(Date.now() / 1000) + 30 * 86400, leader],
  );
  if (!result.length) throw new Error('Leader is not approved');
  // This is the only intentional disclosure; do not run issuance in logged CI.
  console.log(`Code ID: ${id}\nCode (shown once): ${code.match(/.{4}/g)!.join('-')}`);
} else if (command === 'revoke') {
  const result = await query('UPDATE access_codes SET revoked = 1 WHERE id = ? RETURNING id', [
    argument,
  ]);
  if (!result.length) throw new Error('Unknown code ID');
  console.log('Code revoked. Existing admissions retained.');
} else {
  const migration = privateMigration(env, query);
  if (command === 'backfill') await migration.backfill();
  else await migration.verify(command === 'rotate');
  console.log('Operation completed. Run verify before cutover or retiring old keys.');
}
