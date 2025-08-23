import { Prisma } from "@prisma/client";
import {
  adminProcedure,
  createTRPCRouter,
  privilegedProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { z } from "zod";

export const soundboardRouter = createTRPCRouter({
  getSoundboardSounds: publicProcedure.query(({ ctx }) =>
    ctx.prisma.soundboardSound.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        emoji: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    })
  ),
  getSoundboardSoundsWithUserPins: protectedProcedure.query(async ({ ctx }) => {
    const sounds = await ctx.prisma.soundboardSound.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        emoji: true,
        createdAt: true,
        updatedAt: true,
        userPins: {
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    });

    // Transform the data to include a simple isPinned boolean and sort by pinned status
    const soundsWithPinStatus = sounds.map((sound) => ({
      id: sound.id,
      name: sound.name,
      url: sound.url,
      emoji: sound.emoji,
      createdAt: sound.createdAt,
      updatedAt: sound.updatedAt,
      isPinned: sound.userPins.length > 0,
    }));

    // Sort by pinned status first, then by name
    return soundsWithPinStatus.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }),
  getSoundboardSound: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.soundboardSound.findUnique({
        select: {
          id: true,
          name: true,
          url: true,
          emoji: true,
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
        emoji: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.create({
        data: {
          name: input.name,
          url: input.url,
          emoji: input.emoji,
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
  updateSoundboardSoundEmoji: privilegedProcedure
    .input(
      z.object({
        id: z.string(),
        emoji: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.update({
        where: {
          id: input.id,
        },
        data: {
          emoji: input.emoji,
        },
      });
    }),
  renameSoundboardSound: privilegedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundboardSound.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
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
  pinSoundForUser: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use upsert to avoid duplicate key errors
      await ctx.prisma.userSoundPin.upsert({
        where: {
          userId_soundId: {
            userId: ctx.session.user.id,
            soundId: input.soundId,
          },
        },
        update: {},
        create: {
          userId: ctx.session.user.id,
          soundId: input.soundId,
        },
      });
    }),
  unpinSoundForUser: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userSoundPin.deleteMany({
        where: {
          userId: ctx.session.user.id,
          soundId: input.soundId,
        },
      });
    }),
  toggleSoundPinForUser: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
        isPinned: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.isPinned) {
        // Unpin the sound
        await ctx.prisma.userSoundPin.deleteMany({
          where: {
            userId: ctx.session.user.id,
            soundId: input.soundId,
          },
        });
      } else {
        // Pin the sound
        await ctx.prisma.userSoundPin.upsert({
          where: {
            userId_soundId: {
              userId: ctx.session.user.id,
              soundId: input.soundId,
            },
          },
          update: {},
          create: {
            userId: ctx.session.user.id,
            soundId: input.soundId,
          },
        });
      }
    }),
});
