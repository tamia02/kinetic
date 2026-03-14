import { Client } from 'pg';

async function verify() {
  const password = "Kinetic1402a"; // NO @
  const user = "postgres";
  const host = "db.wldwzqnwjmdfesxindkh.supabase.co";
  const port = 5432;
  const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres?sslmode=require`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log("Connecting to direct host with simple password...");
    await client.connect();
    console.log("SUCCESS");
    await client.end();
  } catch (err: any) {
    console.error("FAILURE", err.message);
  }
}

verify();
