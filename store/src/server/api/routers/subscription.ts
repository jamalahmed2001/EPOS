import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const subscriptionRouter = createTRPCRouter({
  // Get user's subscriptions
  getUserSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.db.subscription.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { position: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
          subscriptionPrice: item.product.subscriptionPrice ? Number(item.product.subscriptionPrice) : null,
        },
      })),
    }));
  }),

  // Get single subscription
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return subscription;
    }),

  // Create subscription
  create: protectedProcedure
    .input(
      z.object({
        interval: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate products and calculate total
      const products = await ctx.db.product.findMany({
        where: {
          id: { in: input.items.map((item) => item.productId) },
          isSubscribable: true,
        },
      });

      if (products.length !== input.items.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some products are not available for subscription",
        });
      }

      // Calculate next billing date based on interval
      const nextBillingDate = new Date();
      switch (input.interval) {
        case "WEEKLY":
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "QUARTERLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "YEARLY":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      const subscription = await ctx.db.subscription.create({
        data: {
          userId: ctx.session.user.id,
          interval: input.interval,
          nextBillingDate,
          items: {
            create: input.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.subscriptionPrice ?? product.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return subscription;
    }),

  // Pause subscription
  pause: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscription.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only active subscriptions can be paused",
        });
      }

      return ctx.db.subscription.update({
        where: { id: input.id },
        data: { status: "PAUSED" },
      });
    }),

  // Resume subscription
  resume: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscription.status !== "PAUSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only paused subscriptions can be resumed",
        });
      }

      // Calculate new next billing date
      const nextBillingDate = new Date();
      switch (subscription.interval) {
        case "WEEKLY":
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "QUARTERLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "YEARLY":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      return ctx.db.subscription.update({
        where: { id: input.id },
        data: {
          status: "ACTIVE",
          nextBillingDate,
        },
      });
    }),

  // Cancel subscription
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscription.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is already cancelled",
        });
      }

      return ctx.db.subscription.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  // Update subscription items
  updateItems: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      // Delete existing items and create new ones
      await ctx.db.subscriptionItem.deleteMany({
        where: { subscriptionId: input.id },
      });

      const products = await ctx.db.product.findMany({
        where: {
          id: { in: input.items.map((item) => item.productId) },
          isSubscribable: true,
        },
      });

      await ctx.db.subscriptionItem.createMany({
        data: input.items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            subscriptionId: input.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.subscriptionPrice ?? product.price,
          };
        }),
      });

      return ctx.db.subscription.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }),

  // Skip next delivery
  skipNextDelivery: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscription.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only skip delivery for active subscriptions",
        });
      }

      // Calculate next billing date after skip
      const nextBillingDate = new Date(subscription.nextBillingDate);
      switch (subscription.interval) {
        case "WEEKLY":
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case "MONTHLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "QUARTERLY":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "YEARLY":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      return ctx.db.subscription.update({
        where: { id: input.id },
        data: { nextBillingDate },
      });
    }),
}); 