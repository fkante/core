import * as schema from "./schema";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env";

const pool = new Pool({
  connectionString: env.DB_URL,
  ssl: env.DB_SSL,
});

export const db = drizzle(pool, { schema });

export * as schema from "./schema";
