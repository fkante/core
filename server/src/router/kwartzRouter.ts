import { z } from "zod";
import { kwartzClient } from "../integrations/kwartz/kwartz.client";
import { publicProcedure, router } from "../trpc";

export const kwartzRouter = router({
  getKeyMessages: publicProcedure.input(z.object({
    appCode: z.string(),
  })).query(async ({ input }) => {
    const keyMessages = await kwartzClient.fetchKeyMessages(input.appCode);
    return keyMessages;
  }),
});