import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { after, before, describe, it } from "node:test";

import { Pool } from "pg";
import assert from "node:assert/strict";
import { env } from "../src/env";
import { usersTable } from "../src/db/schema/users";

let testPool: Pool;
let testDb: NodePgDatabase<Record<string, unknown>>;

before(async () => {
  testPool = new Pool({ connectionString: env.DB_URL });
  testDb = drizzle(testPool);
  console.log("Test database pool created.");
});

// Close connection after tests
after(async () => {
  if (testPool) {
    await testPool.end();
    console.log("Test database pool closed.");
  }
});

describe("Database Tests", () => {
  it("should fetch users from the test database", async () => {
    assert.ok(testDb, "Test database instance should exist");
    try {
      const users = await testDb.select().from(usersTable).limit(1);
      assert.ok(Array.isArray(users), "Result should be an array");
      console.log(`Fetched ${users.length} user(s) from test DB`);
      if (users.length > 0) {
        console.log("Sample user:", users[0]);
      }
    } catch (error) {
      console.error("Error fetching users from test DB:", error);
      assert.fail(`Test failed due to database error: ${error}`);
    }
  });

  // Add tests here
});
