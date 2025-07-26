import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type OrderStatus, Prisma, type TransactionType } from "@prisma/client";

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const posRouter = createTRPCRouter({
  // Get available stores
  getStores: protectedProcedure.query(async ({ ctx }) => {
    // Check permissions
    if (ctx.session.user.role === "CUSTOMER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Get all active stores
    const stores = await ctx.db.store.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    return stores;
  }),

  // Search products for POS
  searchCustomers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permissions
      if (ctx.session.user.role === "CUSTOMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const customers = await ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { email: { contains: input.query, mode: "insensitive" } },
            { referralCode: input.query }, // QR code lookup
          ],
        },
        include: {
          loyaltyAccount: true,
          _count: {
            select: { orders: true },
          },
        },
        take: 10,
      });

      return customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyAccount?.points ?? 0,
        lifetimePoints: customer.loyaltyAccount?.lifetimePoints ?? 0,
        completedOrders: customer.loyaltyAccount?.completedOrders ?? 0,
        tier: customer.loyaltyAccount?.tier ?? "BRONZE",
        referralCode: customer.referralCode,
        orderCount: customer._count.orders,
      }));
    }),

  // Create POS order
  createOrder: protectedProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        storeId: z.string(),
        orderLatitude: z.number(),
        orderLongitude: z.number(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          })
        ),
        discount: z.number().min(0).default(0),
        discountType: z.enum(["percentage", "fixed"]).default("percentage"),
        paymentMethod: z.enum(["cash", "card", "terminal"]),
        amountReceived: z.number().optional(), // For cash payments
        promoCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (ctx.session.user.role === "CUSTOMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Verify store exists and is active
      const store = await ctx.db.store.findUnique({
        where: { id: input.storeId },
      });

      if (!store || store.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or inactive store",
        });
      }

      // Calculate distance from store to verify location
      const distance = calculateDistance(
        input.orderLatitude,
        input.orderLongitude,
        store.latitude,
        store.longitude
      );

      // Allow up to 500 meters from store location
      const MAX_DISTANCE_METERS = 500;
      if (distance > MAX_DISTANCE_METERS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You must be within ${MAX_DISTANCE_METERS} meters of the store to process POS orders. Current distance: ${Math.round(distance)} meters`,
        });
      }

      // Fetch products with stock check from store inventory
      const storeInventory = await ctx.db.storeInventory.findMany({
        where: {
          storeId: input.storeId,
          productId: { in: input.items.map((item) => item.productId) },
        },
        include: { product: true },
      });

      if (storeInventory.length !== input.items.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more products not found in store inventory",
        });
      }

      // Check stock availability in store
      for (const item of input.items) {
        const inventoryItem = storeInventory.find((inv) => inv.productId === item.productId);
        if (!inventoryItem) continue;

        if (inventoryItem.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for ${inventoryItem.product.name} in this store`,
          });
        }
      }

      // Calculate totals
      const itemsWithPrices = input.items.map((item) => {
        const inventoryItem = storeInventory.find((inv) => inv.productId === item.productId)!;
        return {
          ...item,
          price: inventoryItem.product.price,
          total: Number(inventoryItem.product.price) * item.quantity,
        };
      });

      const subtotal = itemsWithPrices.reduce((sum, item) => sum + item.total, 0);
      
      // Apply discount
      const discountAmount = input.discountType === "percentage"
        ? (subtotal * input.discount) / 100
        : input.discount;

      // Check promo code
      let promoCodeDiscount = 0;
      if (input.promoCode) {
        const promo = await ctx.db.promoCode.findUnique({
          where: { code: input.promoCode, active: true },
        });

        if (promo && (!promo.validTo || promo.validTo > new Date())) {
          if (promo.discountType === "PERCENTAGE") {
            promoCodeDiscount = (subtotal * promo.discountValue.toNumber()) / 100;
          } else {
            promoCodeDiscount = promo.discountValue.toNumber();
          }
        }
      }

      // Check loyalty discount (20% off after 10 orders over £20)
      let loyaltyDiscount = 0;
      if (input.customerId) {
        const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
          where: { userId: input.customerId },
        });

        if (loyaltyAccount && loyaltyAccount.completedOrders >= 10 && subtotal > 20) {
          loyaltyDiscount = subtotal * 0.2;
        }
      }

      // Use the highest discount
      const totalDiscount = Math.max(discountAmount, promoCodeDiscount, loyaltyDiscount);
      const tax = (subtotal - totalDiscount) * 0.2; // 20% VAT
      const total = subtotal - totalDiscount + tax;

      // For cash payments, calculate change
      const change = input.paymentMethod === "cash" && input.amountReceived
        ? input.amountReceived - total
        : 0;

      // Create order
      const order = await ctx.db.order.create({
        data: {
          userId: input.customerId,
          staffId: ctx.session.user.id,
          storeId: input.storeId,
          customerEmail: input.customerId 
            ? (await ctx.db.user.findUnique({ where: { id: input.customerId } }))?.email ?? ""
            : "",
          customerName: input.customerId
            ? (await ctx.db.user.findUnique({ where: { id: input.customerId } }))?.name ?? ""
            : "Walk-in Customer",
          subtotal,
          tax,
          shipping: 0, // No shipping for in-store
          discount: totalDiscount,
          total,
          status: "COMPLETED" as OrderStatus,
          paymentStatus: "PAID",
          fulfillmentStatus: "FULFILLED",
          channel: "POS",
          promoCode: input.promoCode,
          metadata: {
            paymentMethod: input.paymentMethod,
            amountReceived: input.amountReceived,
            change,
            posTerminal: "main",
            orderLocation: {
              latitude: input.orderLatitude,
              longitude: input.orderLongitude,
              distance: Math.round(distance),
            },
          },
          items: {
            create: itemsWithPrices.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          store: true,
        },
      });

      // Update store inventory
      for (const item of input.items) {
        await ctx.db.storeInventory.update({
          where: {
            storeId_productId: {
              storeId: input.storeId,
              productId: item.productId,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Also update global product stock
        await ctx.db.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update loyalty points if customer
      if (input.customerId) {
        const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
          where: { userId: input.customerId },
        });

        if (loyaltyAccount) {
          const points = Math.floor(total);
          await ctx.db.loyaltyAccount.update({
            where: { id: loyaltyAccount.id },
            data: {
              points: loyaltyAccount.points + points,
              lifetimePoints: loyaltyAccount.lifetimePoints + points,
              completedOrders: loyaltyAccount.completedOrders + 1,
            },
          });

          await ctx.db.loyaltyTransaction.create({
            data: {
              accountId: loyaltyAccount.id,
              type: "EARNED",
              points,
              orderId: order.id,
              description: `Points earned from in-store purchase at ${store.name}`,
            },
          });
        }
      }

      return {
        order,
        change,
      };
    }),

  // Register new customer from POS
  registerCustomer: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        enrollInLoyalty: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (ctx.session.user.role === "CUSTOMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check if email already exists
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Customer with this email already exists",
        });
      }

      // Generate referral code
      const referralCode = `MOV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create user
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: "CUSTOMER",
          referralCode,
          // Create loyalty account if enrolled
          ...(input.enrollInLoyalty && {
            loyaltyAccount: {
              create: {
                points: 100, // Welcome bonus
                lifetimePoints: 100,
              },
            },
          }),
        },
        include: {
          loyaltyAccount: true,
        },
      });

      // Create welcome bonus transaction
      if (user.loyaltyAccount) {
        await ctx.db.loyaltyTransaction.create({
          data: {
            accountId: user.loyaltyAccount.id,
            type: "BONUS" as TransactionType,
            points: 100,
            description: "Welcome bonus",
          },
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        loyaltyPoints: user.loyaltyAccount?.points ?? 0,
      };
    }),

  // Get today's POS statistics
  getTodayStats: protectedProcedure.query(async ({ ctx }) => {
    // Check permissions
    if (ctx.session.user.role === "CUSTOMER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [orders, totalRevenue, productsSold] = await Promise.all([
      // Today's orders
      ctx.db.order.findMany({
        where: {
          channel: "POS",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      // Total revenue
      ctx.db.order.aggregate({
        where: {
          channel: "POS",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          paymentStatus: "PAID",
        },
        _sum: {
          total: true,
        },
      }),
      // Products sold
      ctx.db.orderItem.aggregate({
        where: {
          order: {
            channel: "POS",
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            paymentStatus: "PAID",
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      orderCount: orders.length,
      totalRevenue: totalRevenue._sum.total?.toNumber() ?? 0,
      productsSold: productsSold._sum.quantity ?? 0,
      recentOrders: orders.slice(0, 5),
    };
  }),
}); 