import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.game.findMany({
      orderBy: {
        releaseDate: Prisma.SortOrder.desc,
      },
    });
  }),
});
