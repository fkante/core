import { briefRouter } from "./briefRoutes";
import exampleRouter from "./example";
import { kovaleeAppRouter } from "./kovaleeAppRouter";
import { kwartzRouter } from "./kwartzRouter";
import { mergeRouters } from "../trpc";

const appRouter = mergeRouters(exampleRouter, briefRouter, kovaleeAppRouter, kwartzRouter);

export type AppRouter = typeof appRouter;
export default appRouter;
