import { exampleRouter } from "./routers/example";
import { gameRouter } from "./routers/game";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  game: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
