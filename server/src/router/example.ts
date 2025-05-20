import { publicProcedure, router } from "../trpc";

import { z } from "zod";

const exampleRouter = router({
  exampleWithArgs: publicProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation((req) => {
      return { info: req.input.message, newNumber: 42 };
    }),

  example: publicProcedure.query(async () => {
    return { info: 42 };
  }),
});

export default exampleRouter;
