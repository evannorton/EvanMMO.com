import { Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import vodsPerPage from "../../../constants/vodsPerPage";

export const vodRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.vod.findMany({
        select: {
          id: true,
          streamDate: true,
          pieces: {
            select: {
              id: true,
              mp4URL: true,
              jsonURL: true,
            },
          },
        },
        orderBy: {
          streamDate: Prisma.SortOrder.desc,
        },
        skip: input.page * vodsPerPage,
        take: vodsPerPage,
      })
    ),
  getCount: publicProcedure.query(({ ctx }) => ctx.prisma.vod.count()),
  insertVOD: adminProcedure
    .input(
      z.object({
        streamDate: z.date(),
        pieces: z.array(
          z.object({
            jsonURL: z.string().nullable(),
            mp4URL: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vod = await ctx.prisma.vod.create({
        data: {
          streamDate: input.streamDate,
        },
      });
      for (const piece of input.pieces) {
        await ctx.prisma.vodPiece.create({
          data: {
            jsonURL: piece.jsonURL,
            mp4URL: piece.mp4URL,
            vod: {
              connect: {
                id: vod.id,
              },
            },
          },
        });
      }
    }),
});
