import { publicProcedure, router } from "../trpc";

import { briefsTable } from "../db/schema/briefs";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const briefRouter = router({
  // TODO: Add relations to shots, visuals, meta.
  getBriefs: publicProcedure.query(async () => {
    const briefs = await db.select().from(briefsTable);
    return briefs;
  }),

  getBriefById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const brief = await db
        .select()
        .from(briefsTable)
        .where(eq(briefsTable.id, input.id))
        .limit(1);
      return brief[0];
    }),

  // createBrief: protectedProcedure.input(...).mutation(async ({ ctx, input }) => { ... })
  // updateBrief: protectedProcedure.input(...).mutation(async ({ ctx, input }) => { ... })
  // deleteBrief: protectedProcedure.input(...).mutation(async ({ ctx, input }) => { ... })
});
