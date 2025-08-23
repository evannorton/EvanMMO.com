import { createTRPCRouter } from "./trpc";
import { gameRouter } from "./routers/game";
import { soundboardRouter } from "./routers/soundboard";
import { twitchRouter } from "./routers/twitch";
import { vodRouter } from "./routers/vod";
import { youtubeRouter } from "./routers/youtube";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  soundboard: soundboardRouter,
  twitch: twitchRouter,
  vod: vodRouter,
  youtube: youtubeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
