import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'

/**
 * EXAMPLE tRPC router. tRPC is scaffolded but optional (see STACK_BOILERPLATE.md
 * section 10) — the primary data path is REST via `apiFetch`. This trivial
 * `hello` procedure proves the wiring (superjson transformer, the `/api/trpc`
 * fetch handler, and the typed client). Add real procedures here, or delete the
 * tRPC integration if you do not need it.
 */
const exampleRouter = {
  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return { greeting: `Hello, ${input.name ?? 'world'}!` }
  }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  example: exampleRouter,
})
export type TRPCRouter = typeof trpcRouter
