import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";

export const authRouter = createTRPCRouter({
  // Get current user profile with loyalty info
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        loyaltyAccount: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      loyaltyAccount: user.loyaltyAccount
        ? {
            points: user.loyaltyAccount.points,
            lifetimePoints: user.loyaltyAccount.lifetimePoints,
            tier: user.loyaltyAccount.tier,
            completedOrders: user.loyaltyAccount.completedOrders,
          }
        : null,
    };
  }),

  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        });
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Generate referral code
      const referralCode = `MOV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create user with loyalty account in a transaction
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          referralCode,
          loyaltyAccount: {
            create: {
              points: 100, // Welcome bonus
              lifetimePoints: 100,
              completedOrders: 0,
              tier: "BRONZE",
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          loyaltyAccount: {
            select: {
              id: true,
              points: true,
            },
          },
        },
      });

      // Create welcome bonus transaction
      if (user.loyaltyAccount) {
        await ctx.db.loyaltyTransaction.create({
          data: {
            accountId: user.loyaltyAccount.id,
            type: "BONUS",
            points: 100,
            description: "Welcome bonus for joining Ministry of Vapes",
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email is already taken by another user
      if (input.email !== ctx.session.user.email) {
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already in use",
          });
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      };
    }),

  // Update password
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await compare(input.currentPassword, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password and update
      const hashedPassword = await hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Delete account
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // Soft delete by anonymizing the user data
    const timestamp = Date.now();
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        email: `deleted-${ctx.session.user.id}@deleted.com`,
        name: "Deleted User",
        phone: null,
        password: null,
        emailVerified: null,
        image: null,
        referralCode: `deleted-${ctx.session.user.id}-${timestamp}`,
      },
    });

    // In production, you might want to:
    // - Cancel active subscriptions
    // - Archive orders
    // - Delete payment methods
    // - Send confirmation email

    return { success: true };
  }),
}); 