import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) =>
    ctx.prisma.game.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailURL: true,
        width: true,
        height: true,
        embedURL: true,
      },
      orderBy: {
        releaseDate: Prisma.SortOrder.desc,
      },
    })
  ),
});
