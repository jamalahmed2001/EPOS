import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const addressRouter = createTRPCRouter({
  // Get user's addresses
  getUserAddresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.address.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }),

  // Create address
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().min(1),
        country: z.string().default("GB"),
        phone: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db.address.updateMany({
          where: { userId: ctx.session.user.id },
          data: { isDefault: false },
        });
      }

      return ctx.db.address.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update address
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().min(1),
        country: z.string(),
        phone: z.string().optional(),
        isDefault: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify address belongs to user
      const address = await ctx.db.address.findFirst({
        where: { id, userId: ctx.session.user.id },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If setting as default, unset other defaults
      if (data.isDefault && !address.isDefault) {
        await ctx.db.address.updateMany({
          where: { userId: ctx.session.user.id, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return ctx.db.address.update({
        where: { id },
        data,
      });
    }),

  // Delete address
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify address belongs to user and is not default
      const address = await ctx.db.address.findFirst({
        where: { 
          id: input.id, 
          userId: ctx.session.user.id,
        },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      if (address.isDefault) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete default address",
        });
      }

      return ctx.db.address.delete({
        where: { id: input.id },
      });
    }),

  // Set default address
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify address belongs to user
      const address = await ctx.db.address.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // Unset other defaults
      await ctx.db.address.updateMany({
        where: { userId: ctx.session.user.id, id: { not: input.id } },
        data: { isDefault: false },
      });

      // Set new default
      return ctx.db.address.update({
        where: { id: input.id },
        data: { isDefault: true },
      });
    }),
}); 