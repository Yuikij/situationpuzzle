import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";
import { sql } from "drizzle-orm";

const getClient = (connectionString: string) => postgres(connectionString, {
  max: 1,
});

export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  const connectionString = env.HYPERDRIVE.connectionString;
  const client = getClient(connectionString);
  return drizzle({ client });
});

export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const connectionString = env.HYPERDRIVE.connectionString;
  const client = getClient(connectionString);
  return drizzle({ client });
});

export async function getTablesWithRawSQL() {
  const db = await getDbAsync();
  
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      ORDER BY table_name;
    `);
    
    return (result as unknown as { table_name: string }[]).map((row) => row.table_name);
  } catch (error) {
    throw error;
  }
} 