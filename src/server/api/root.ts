import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { gameRouter } from "./routers/game";
import { twitchRouter } from "./routers/twitch";
import { youtubeRouter } from "./routers/youtube";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  game: gameRouter,
  twitch: twitchRouter,
  youtube: youtubeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
