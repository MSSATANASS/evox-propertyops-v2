import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { propertyOpsRouter } from "./routers/propertyOps";
import { tourRunRouter } from "./routers/tourRun";
import { turnoverRouter } from "./routers/turnover";
import { vendorRouter } from "./routers/vendor";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  propertyOps: propertyOpsRouter,
  tourRun: tourRunRouter,
  turnover: turnoverRouter,
  vendor: vendorRouter,
});

export type AppRouter = typeof appRouter;
