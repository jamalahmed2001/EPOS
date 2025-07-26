import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const loyaltyRouter = createTRPCRouter({
  // Get user's loyalty account
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!loyaltyAccount) {
      try {
        // Create account if it doesn't exist
        const newAccount = await ctx.db.loyaltyAccount.create({
          data: {
            userId: ctx.session.user.id,
            points: 0,
            lifetimePoints: 0,
            completedOrders: 0,
          },
        });
        return { ...newAccount, transactions: [] };
      } catch (error) {
        // If creation fails (e.g., due to race condition), try to fetch again
        const existingAccount = await ctx.db.loyaltyAccount.findUnique({
          where: { userId: ctx.session.user.id },
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });
        
        if (existingAccount) {
          return existingAccount;
        }
        
        // If still no account, throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or retrieve loyalty account",
        });
      }
    }

    return loyaltyAccount;
  }),

  // Get loyalty account by QR code
  getByQRCode: publicProcedure
    .input(z.object({ qrCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
        where: { qrCode: input.qrCode },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              orders: {
                where: { status: "COMPLETED" },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!loyaltyAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid QR code",
        });
      }

      return {
        ...loyaltyAccount,
        completedOrders: loyaltyAccount.user.orders.length,
      };
    }),

  // Credit points to account
  creditPoints: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        points: z.number().positive(),
        orderId: z.string().optional(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is staff/manager/admin
      if (!["STAFF", "MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can credit points",
        });
      }

      // Update account points
      const account = await ctx.db.loyaltyAccount.update({
        where: { id: input.accountId },
        data: {
          points: { increment: input.points },
          lifetimePoints: { increment: input.points },
        },
      });

      // Create transaction record
      await ctx.db.loyaltyTransaction.create({
        data: {
          accountId: input.accountId,
          type: "EARNED",
          points: input.points,
          orderId: input.orderId,
          description: input.description,
        },
      });

      // Check and update tier
      const newTier = calculateTier(account.lifetimePoints);
      if (newTier !== account.tier) {
        await ctx.db.loyaltyAccount.update({
          where: { id: input.accountId },
          data: { tier: newTier },
        });
      }

      return account;
    }),

  // Redeem points
  redeemPoints: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        points: z.number().positive(),
        orderId: z.string().optional(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.db.loyaltyAccount.findUnique({
        where: { id: input.accountId },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loyalty account not found",
        });
      }

      if (account.points < input.points) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient points",
        });
      }

      // Update account points
      const updatedAccount = await ctx.db.loyaltyAccount.update({
        where: { id: input.accountId },
        data: {
          points: { decrement: input.points },
        },
      });

      // Create transaction record
      await ctx.db.loyaltyTransaction.create({
        data: {
          accountId: input.accountId,
          type: "REDEEMED",
          points: -input.points,
          orderId: input.orderId,
          description: input.description,
        },
      });

      return updatedAccount;
    }),

  // Get loyalty stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.loyaltyAccount.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!account) {
      return {
        currentPoints: 0,
        lifetimePoints: 0,
        tier: "BRONZE",
        nextTier: "SILVER",
        pointsToNextTier: 500,
        completedOrders: 0,
      };
    }

    const completedOrders = await ctx.db.order.count({
      where: {
        userId: ctx.session.user.id,
        status: "COMPLETED",
      },
    });

    const nextTier = getNextTier(account.tier);
    const pointsToNextTier = getPointsToNextTier(account.lifetimePoints);

    return {
      currentPoints: account.points,
      lifetimePoints: account.lifetimePoints,
      tier: account.tier,
      nextTier,
      pointsToNextTier,
      completedOrders,
    };
  }),
});

// Helper functions
function calculateTier(lifetimePoints: number) {
  if (lifetimePoints >= 5000) return "PLATINUM";
  if (lifetimePoints >= 2500) return "GOLD";
  if (lifetimePoints >= 1000) return "SILVER";
  return "BRONZE";
}

function getNextTier(currentTier: string) {
  switch (currentTier) {
    case "BRONZE": return "SILVER";
    case "SILVER": return "GOLD";
    case "GOLD": return "PLATINUM";
    default: return null;
  }
}

function getPointsToNextTier(lifetimePoints: number) {
  if (lifetimePoints < 1000) return 1000 - lifetimePoints;
  if (lifetimePoints < 2500) return 2500 - lifetimePoints;
  if (lifetimePoints < 5000) return 5000 - lifetimePoints;
  return 0;
} 