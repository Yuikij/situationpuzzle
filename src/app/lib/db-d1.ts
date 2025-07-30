import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import { sql } from "drizzle-orm";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as d1Schema from "./schema/d1";

export const getD1Db = cache(() => {
  const { env } = getCloudflareContext();
  return drizzleD1(env.d1, { schema: d1Schema });
});

export const getD1DbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzleD1(env.d1, { schema: d1Schema });
});

export async function getD1Tables() {
  const db = await getD1DbAsync();
  try {
    // D1 uses sqlite, so we query sqlite_master
    const result: { name: string }[] = await db.all(sql`SELECT name FROM sqlite_master WHERE type = 'table'`);
    return result.map(row => row.name);
  } catch (error) {
    console.error("D1 query error:", error);
    throw error;
  }
} 