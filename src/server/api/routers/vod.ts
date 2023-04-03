import { adminProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";

export const vodRouter = createTRPCRouter({
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
