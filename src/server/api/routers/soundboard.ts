import { Prisma } from "@prisma/client";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const soundboardRouter = createTRPCRouter({
  getSoundboardSounds: publicProcedure.query(({ ctx }) =>
    ctx.prisma.soundboardSound.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    })
  ),
  getSoundboardSound: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.soundboardSound.findUnique({
        select: {
          id: true,
          name: true,
          url: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          id: input.id,
        },
      })
    ),
  insertSoundboardSound: adminProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.create({
        data: {
          name: input.name,
          url: input.url,
        },
      });
    }),
  updateSoundboardSound: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          url: input.url,
        },
      });
    }),
  deleteSoundboardSound: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
