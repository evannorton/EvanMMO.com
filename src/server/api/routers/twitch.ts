import { createTRPCRouter, publicProcedure } from "../trpc";
import streamIsLive from "../../streamIsLive";

export const twitchRouter = createTRPCRouter({
  isLive: publicProcedure.query(() => {
    return streamIsLive();
  }),
});
