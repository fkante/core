import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  out: "./",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
  strict: true,
  verbose: true,
  introspect: {
    casing: "camel",
  },
});
