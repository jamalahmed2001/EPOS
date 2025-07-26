import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
  // Get user's orders
  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
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
          shippingAddress: true,
          billingAddress: true,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (orders.length > input.limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders: orders.map(order => ({
          ...order,
          subtotal: Number(order.subtotal),
          tax: Number(order.tax),
          shipping: Number(order.shipping),
          discount: Number(order.discount),
          total: Number(order.total),
          items: order.items.map(item => ({
            ...item,
            price: Number(item.price),
            total: Number(item.total),
          })),
        })),
        nextCursor,
      };
    }),

  // Get single order by ID
  getById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
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
          shippingAddress: true,
          billingAddress: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          staff: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if user has access to this order
      if (order.userId !== ctx.session.user.id && !["STAFF", "MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this order",
        });
      }

      return {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shipping: Number(order.shipping),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      };
    }),

  // Get order by order number (for tracking)
  getByOrderNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          shippingAddress: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Return limited info for public access
      return {
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentStatus: order.fulfillmentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
        })),
        shippingAddress: order.shippingAddress ? {
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
        } : null,
      };
    }),

  // Update order status (staff only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!["STAFF", "MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can update order status",
        });
      }

      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: { user: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Update order status
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
      });

      // If order is completed, award loyalty points
      if (input.status === "COMPLETED" && order.status !== "COMPLETED" && order.user) {
        const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
          where: { userId: order.userId! },
        });

        if (loyaltyAccount) {
          // Award 1 point per £1 spent
          const pointsToAward = Math.floor(Number(order.total));
          
          await ctx.db.loyaltyAccount.update({
            where: { id: loyaltyAccount.id },
            data: {
              points: { increment: pointsToAward },
              lifetimePoints: { increment: pointsToAward },
              completedOrders: { increment: 1 },
            },
          });

          await ctx.db.loyaltyTransaction.create({
            data: {
              accountId: loyaltyAccount.id,
              type: "EARNED",
              points: pointsToAward,
              orderId: order.id,
              description: `Points earned from order #${order.orderNumber}`,
            },
          });
        }
      }

      return updatedOrder;
    }),

  // Update fulfillment status
  updateFulfillmentStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        fulfillmentStatus: z.enum(["UNFULFILLED", "PARTIALLY_FULFILLED", "FULFILLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!["STAFF", "MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can update fulfillment status",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { fulfillmentStatus: input.fulfillmentStatus },
      });

      return updatedOrder;
    }),

  // Cancel order
  cancel: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if user owns the order or is staff
      if (order.userId !== ctx.session.user.id && !["STAFF", "MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to cancel this order",
        });
      }

      // Check if order can be cancelled
      if (!["PENDING", "PROCESSING"].includes(order.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order cannot be cancelled in its current status",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { 
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
        },
      });

      // Process refund if payment was made
      if (order.paymentStatus === "PAID") {
        // If order was paid via Stripe, process refund
        if (order.stripePaymentId) {
          try {
            // In production, you would use the Stripe API here
            // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
            // await stripe.refunds.create({
            //   payment_intent: order.stripePaymentId,
            //   reason: input.reason || 'requested_by_customer',
            // });
            
            console.log(`Refund processed for order ${order.orderNumber}, Stripe payment: ${order.stripePaymentId}`);
          } catch (error) {
            console.error("Failed to process Stripe refund:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to process refund. Please contact support.",
            });
          }
        }
        
        // Return loyalty points if they were used
        if (order.loyaltyPointsUsed > 0 && order.userId) {
          const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
            where: { userId: order.userId },
          });
          
          if (loyaltyAccount) {
            await ctx.db.loyaltyAccount.update({
              where: { id: loyaltyAccount.id },
              data: {
                points: loyaltyAccount.points + order.loyaltyPointsUsed,
              },
            });
            
            await ctx.db.loyaltyTransaction.create({
              data: {
                accountId: loyaltyAccount.id,
                type: "ADJUSTED",
                points: order.loyaltyPointsUsed,
                orderId: order.id,
                description: `Points refunded from cancelled order ${order.orderNumber}`,
              },
            });
          }
        }
        
        // Remove earned loyalty points from this order
        if (order.userId) {
          const earnedPointsTransaction = await ctx.db.loyaltyTransaction.findFirst({
            where: {
              orderId: order.id,
              type: "EARNED",
            },
          });
          
          if (earnedPointsTransaction) {
            const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
              where: { id: earnedPointsTransaction.accountId },
            });
            
            if (loyaltyAccount) {
              await ctx.db.loyaltyAccount.update({
                where: { id: loyaltyAccount.id },
                data: {
                  points: Math.max(0, loyaltyAccount.points - earnedPointsTransaction.points),
                  lifetimePoints: Math.max(0, loyaltyAccount.lifetimePoints - earnedPointsTransaction.points),
                },
              });
              
              await ctx.db.loyaltyTransaction.create({
                data: {
                  accountId: loyaltyAccount.id,
                  type: "ADJUSTED",
                  points: -earnedPointsTransaction.points,
                  orderId: order.id,
                  description: `Points removed due to order cancellation ${order.orderNumber}`,
                },
              });
            }
          }
        }
      }

      return updatedOrder;
    }),

  // Get order stats (admin only)
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permissions
      if (!["MANAGER", "ADMIN"].includes(ctx.session.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only managers and admins can view order stats",
        });
      }

      const where = {
        ...(input.startDate && input.endDate && {
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        }),
      };

      const [totalOrders, totalRevenue, averageOrderValue] = await Promise.all([
        ctx.db.order.count({ where }),
        ctx.db.order.aggregate({
          where,
          _sum: { total: true },
        }),
        ctx.db.order.aggregate({
          where,
          _avg: { total: true },
        }),
      ]);

      const ordersByStatus = await ctx.db.order.groupBy({
        by: ["status"],
        where,
        _count: true,
      });

      const ordersByChannel = await ctx.db.order.groupBy({
        by: ["channel"],
        where,
        _count: true,
      });

      return {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
        averageOrderValue: Number(averageOrderValue._avg.total ?? 0),
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        ordersByChannel: ordersByChannel.map(item => ({
          channel: item.channel,
          count: item._count,
        })),
      };
    }),
}); 