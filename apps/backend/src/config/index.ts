import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.number().default(3000),
		HOST: z.string().default("0.0.0.0"),
		DATABASE_URL: z.string().optional(),
		LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
		CORS_ORIGIN: z.string().default("http://localhost:5173"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

export const config = {
	nodeEnv: env.NODE_ENV,
	port: env.PORT,
	host: env.HOST,
	database: {
		url: env.DATABASE_URL,
	},
	logging: {
		level: env.LOG_LEVEL,
	},
	cors: {
		origin: env.CORS_ORIGIN,
	},
} as const;
