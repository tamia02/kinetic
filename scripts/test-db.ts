import { Client } from 'pg';

async function test(host: string, port: number, user: string, password: string, label: string) {
  const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres?sslmode=require`;
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log(`[TRY] ${label} (${host}:${port})`);
    await client.connect();
    console.log(`[OK] ${label} - Connected Successfully!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAIL] ${label} - ${(err as Error).message}`);
    return false;
  }
}

async function run() {
  const directHost = "db.wldwzqnwjmdfesxindkh.supabase.co";
  const poolHost = "aws-1-ap-southeast-1.pooler.supabase.com";

  const password = "@Kinetic1402a";

  console.log("--- Testing with @Kinetic1402a ---");
  await test(directHost, 5432, "postgres", password, "Direct + postgres");
  await test(poolHost, 5432, "postgres.wldwzqnwjmdfesxindkh", password, "Pool5432 + prefixed");
  await test(poolHost, 6543, "postgres.wldwzqnwjmdfesxindkh", password, "Pool6543 + prefixed");

  const simplePass = "Kinetic1402a";
  console.log("\n--- Testing with Kinetic1402a (no @) ---");
  await test(directHost, 5432, "postgres", simplePass, "Direct + postgres");
  await test(poolHost, 5432, "postgres.wldwzqnwjmdfesxindkh", simplePass, "Pool5432 + prefixed");
}

run();
