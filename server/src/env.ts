import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DB_URL: z.string().url(),
    DB_SSL: z.coerce.boolean().default(false),
    API_GATEWAY_URL: z.string().url(),
    API_GATEWAY_TOKEN: z.string().min(1),
    PORT: z.coerce.number().default(5001),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    CLIENT_URL: z.string().url(),
    //The client ID of your Google OAuth application.
    GOOGLE_CLIENT_ID: z.string().min(1),
    //The client secret of your Google OAuth application.
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    // Secret for signing JWTs
    JWT_SECRET: z.string().min(1),
    // Optional: JWT expiration time (e.g., "1h", "7d")
    JWT_EXPIRES_IN: z.string().optional(),
    // SendGrid API key
    SEND_GRID_API_KEY: z.string().min(1),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
