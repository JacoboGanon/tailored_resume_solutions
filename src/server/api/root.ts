import { atsRouter } from "~/server/api/routers/ats";
import { portfolioRouter } from "~/server/api/routers/portfolio";
import { postRouter } from "~/server/api/routers/post";
import { resumeRouter } from "~/server/api/routers/resume";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	portfolio: portfolioRouter,
	resume: resumeRouter,
	ats: atsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
