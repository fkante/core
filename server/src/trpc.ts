import { ZodError } from "zod";
import { createContext } from "./app";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const publicProcedure = t.procedure.use(timingMiddleware);
const mergeRouters = t.mergeRouters;
const router = t.router;

/**
 * Create a server-side caller. ???
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
// const createCallerFactory = t.createCallerFactory;

export { mergeRouters, publicProcedure, router, t };
export type { Context };
