import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { env } from "./env";
import appRouter from "./router";
import authRouter from "./router/authRoutes";

export const ALLOWED_ORIGINS =
  env.NODE_ENV === "production"
    ? [env.CLIENT_URL]
    : [
        "http://localhost:4321",
        "http://localhost:3000",
        "http://localhost:5001",
      ];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders:
    "content-type, authorization, x-auth-return-redirect, x-csrf-token, set-cookie", // Allow necessary headers
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  exposedHeaders: [
    "content-type",
    "set-cookie",
    "content-disposition",
    "authorization",
    "x-auth-return-redirect",
    "x-csrf-token",
  ],
};

/**
 * CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

const app = express();

app.set("trust proxy", true);
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

app.use(
  "/trpc",
  //@ts-expect-error - trpcExpress.createExpressMiddleware is not typed
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error("Unhandled Express Error:", err.stack || err);
  next(err);
});

export default app;
export { createContext };
