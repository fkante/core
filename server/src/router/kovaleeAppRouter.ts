import { publicProcedure, router } from "../trpc";

import { appsClient } from "../integrations/apps";
import { z } from "zod";

export const kovaleeAppRouter = router({
  getApps: publicProcedure.query(async () => {
    const apps = await appsClient.fetchSignedApps();
    return apps;
  }),

  getAppByCode: publicProcedure.input(z.object({
    code: z.string(),
  })).query(async ({ input }) => {
    const app = await appsClient.fetchAppByCode(input.code);
    return app;
  }),
});
