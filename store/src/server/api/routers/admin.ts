import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type OrderStatus, type OrderChannel } from "@prisma/client";
import { type LoyaltyTier } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  // Get dashboard statistics
  getDashboardStats: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["today", "week", "month"]).default("today"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      switch (input.dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - 1);
          previousEndDate = new Date(startDate);
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          previousEndDate = new Date(startDate);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          previousEndDate = new Date(startDate);
          break;
      }

      // Get current period stats
      const [orders, onlineOrders, posOrders, newCustomers] = await Promise.all([
        // All orders
        ctx.db.order.findMany({
          where: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
          },
          select: {
            id: true,
            total: true,
            channel: true,
          },
        }),
        // Online orders
        ctx.db.order.aggregate({
          where: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
            channel: "ONLINE",
          },
          _sum: { total: true },
          _count: true,
        }),
        // POS orders
        ctx.db.order.aggregate({
          where: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
            channel: "POS",
          },
          _sum: { total: true },
          _count: true,
        }),
        // New customers
        ctx.db.user.count({
          where: {
            createdAt: { gte: startDate },
            role: "CUSTOMER",
          },
        }),
      ]);

      // Calculate totals
      const totalRevenue = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const onlineRevenue = onlineOrders._sum.total?.toNumber() ?? 0;
      const posRevenue = posOrders._sum.total?.toNumber() ?? 0;

      // Get previous period stats for comparison
      const previousOrders = await ctx.db.order.findMany({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
          paymentStatus: "PAID",
        },
        select: {
          total: true,
        },
      });

      const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total.toNumber(), 0);
      const previousOrderCount = previousOrders.length;
      const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

      const previousNewCustomers = await ctx.db.user.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
          role: "CUSTOMER",
        },
      });

      // Calculate changes
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      const ordersChange = previousOrderCount > 0 
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
        : 0;
      const aovChange = previousAOV > 0 
        ? ((avgOrderValue - previousAOV) / previousAOV) * 100 
        : 0;
      const customersChange = previousNewCustomers > 0 
        ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 
        : 0;

      // Get top products
      const topProductsData = await ctx.db.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: startDate },
            paymentStatus: "PAID",
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            total: "desc",
          },
        },
        take: 5,
      });

      const topProducts = await Promise.all(
        topProductsData.map(async (item) => {
          const product = await ctx.db.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true },
          });
          return {
            id: product?.id ?? "",
            name: product?.name ?? "Unknown Product",
            soldCount: item._sum.quantity ?? 0,
            revenue: item._sum.total?.toNumber() ?? 0,
          };
        })
      );

      // Get recent orders
      const recentOrders = await ctx.db.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          channel: true,
          status: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      return {
        totalRevenue,
        totalOrders,
        newCustomers,
        avgOrderValue,
        onlineRevenue,
        posRevenue,
        revenueChange: Math.round(revenueChange),
        ordersChange: Math.round(ordersChange),
        aovChange: Math.round(aovChange),
        customersChange: Math.round(customersChange),
        topProducts,
        recentOrders: recentOrders.map(order => ({
          ...order,
          total: order.total.toNumber(),
        })),
      };
    }),

  // Get inventory statistics
  getInventoryStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
        ctx.db.product.count({
          where: { active: true },
        }),
        ctx.db.product.findMany({
          where: {
            active: true,
            trackInventory: true,
            stock: {
              gt: 0,
              lte: 10, // Low stock threshold
            },
          },
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            price: true,
          },
          orderBy: {
            stock: "asc",
          },
          take: 10,
        }),
        ctx.db.product.count({
          where: {
            active: true,
            trackInventory: true,
            stock: 0,
          },
        }),
      ]);

      // Calculate total stock value
      const allProducts = await ctx.db.product.findMany({
        where: {
          active: true,
          trackInventory: true,
          stock: { gt: 0 },
        },
        select: {
          stock: true,
          price: true,
        },
      });

      const totalStockValue = allProducts.reduce(
        (sum, product) => sum + (product.stock * product.price.toNumber()),
        0
      );

      return {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts,
        totalStockValue,
        lowStockProducts: lowStockProducts.map(p => ({
          ...p,
          price: p.price.toNumber(),
        })),
      };
    }),

  // Get customer statistics
  getCustomerStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [totalCustomers, loyaltyMembers] = await Promise.all([
        ctx.db.user.count({
          where: { role: "CUSTOMER" },
        }),
        ctx.db.loyaltyAccount.count(),
      ]);

      // Get top customers by spend
      const topCustomersData = await ctx.db.order.groupBy({
        by: ["userId"],
        where: {
          paymentStatus: "PAID",
          userId: { not: null },
        },
        _sum: {
          total: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            total: "desc",
          },
        },
        take: 10,
      });

      const topCustomers = await Promise.all(
        topCustomersData.map(async (customer) => {
          const user = await ctx.db.user.findUnique({
            where: { id: customer.userId! },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });
          return {
            id: user?.id ?? "",
            name: user?.name ?? "Unknown",
            email: user?.email ?? "",
            totalSpent: customer._sum.total?.toNumber() ?? 0,
            orderCount: customer._count,
          };
        })
      );

      // Calculate average lifetime value
      const totalRevenue = topCustomersData.reduce(
        (sum, customer) => sum + (customer._sum.total?.toNumber() ?? 0),
        0
      );
      const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Calculate repeat rate
      const customersWithOrders = await ctx.db.user.count({
        where: {
          role: "CUSTOMER",
          orders: {
            some: {
              paymentStatus: "PAID",
            },
          },
        },
      });

      // For repeat customers, we need to query differently
      const repeatCustomersData = await ctx.db.user.findMany({
        where: {
          role: "CUSTOMER",
        },
        select: {
          id: true,
          _count: {
            select: {
              orders: {
                where: {
                  paymentStatus: "PAID",
                },
              },
            },
          },
        },
      });

      const repeatCustomers = repeatCustomersData.filter(
        customer => customer._count.orders >= 2
      ).length;

      const repeatRate = customersWithOrders > 0
        ? Math.round((repeatCustomers / customersWithOrders) * 100)
        : 0;

      // Get loyalty tier distribution
      const tierCounts = await ctx.db.loyaltyAccount.groupBy({
        by: ["tier"],
        _count: true,
      });

      const tierDistribution = tierCounts.map(tier => ({
        tier: tier.tier,
        count: tier._count,
        percentage: loyaltyMembers > 0
          ? Math.round((tier._count / loyaltyMembers) * 100)
          : 0,
      }));

      return {
        totalCustomers,
        loyaltyMembers,
        avgLifetimeValue,
        repeatRate,
        topCustomers,
        tierDistribution,
      };
    }),

  // Get marketing statistics
  getMarketingStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const now = new Date();

      // Get active promo codes
      const activePromoCodes = await ctx.db.promoCode.count({
        where: {
          active: true,
          OR: [
            { validTo: null },
            { validTo: { gte: now } },
          ],
        },
      });

      // Calculate promo usage rate
      const [totalPromoCodes, usedPromoCodes] = await Promise.all([
        ctx.db.promoCode.count(),
        ctx.db.promoCode.count({
          where: {
            usedCount: {
              gt: 0,
            },
          },
        }),
      ]);

      const promoUsageRate = totalPromoCodes > 0
        ? Math.round((usedPromoCodes / totalPromoCodes) * 100)
        : 0;

      // Get referral conversions
      const referralConversions = await ctx.db.user.count({
        where: {
          referralCodeUsed: { not: null },
        },
      });

      // Get email subscribers (users who have opted in)
      const emailSubscribers = await ctx.db.user.count({
        where: {
          emailVerified: { not: null },
          role: "CUSTOMER",
        },
      });

      // Get recent campaign performance (promo codes as campaigns)
      const campaigns = await ctx.db.promoCode.findMany({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 3, 1), // Last 3 months
          },
        },
        select: {
          id: true,
          code: true,
          createdAt: true,
          validTo: true,
          usedCount: true,
          discountValue: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      // For now, we'll estimate revenue based on discount value and usage
      const campaignData = campaigns.map(campaign => ({
        id: campaign.id,
        name: `Promo: ${campaign.code}`,
        startDate: campaign.createdAt.toLocaleDateString(),
        endDate: campaign.validTo?.toLocaleDateString() ?? "No expiry",
        orders: campaign.usedCount,
        revenue: campaign.usedCount * campaign.discountValue.toNumber() * 10, // Rough estimate
      }));

      return {
        activePromoCodes,
        promoUsageRate,
        referralConversions,
        emailSubscribers,
        campaigns: campaignData,
      };
    }),

  // Get orders with filters
  getOrders: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        channel: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { status, channel, search, limit, cursor } = input;

      const orders = await ctx.db.order.findMany({
        where: {
          ...(status && { status: status as OrderStatus }),
          ...(channel && { channel: channel as OrderChannel }),
          ...(search && {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" as const } },
              { customerName: { contains: search, mode: "insensitive" as const } },
              { customerEmail: { contains: search, mode: "insensitive" as const } },
            ],
          }),
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        itemCount: order.items.length,
        total: order.total.toNumber(),
        subtotal: order.subtotal.toNumber(),
        tax: order.tax.toNumber(),
        discount: order.discount.toNumber(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        channel: order.channel,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        userId: order.userId,
        nextCursor,
      }));
    }),

  // Update order status
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { orderId, status } = input;

      // Update order status
      const updatedOrder = await ctx.db.order.update({
        where: { id: orderId },
        data: { 
          status,
          // Update fulfillment status based on order status
          ...(status === "SHIPPED" && { fulfillmentStatus: "PARTIALLY_FULFILLED" as const }),
          ...(status === "DELIVERED" && { fulfillmentStatus: "FULFILLED" as const }),
          ...(status === "CANCELLED" && { fulfillmentStatus: "UNFULFILLED" as const }),
        },
      });

      return updatedOrder;
    }),

  // Get customers with filters
  getCustomers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tier: z.string().optional(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { search, tier, limit, cursor } = input;

      // Get customers
      const customers = await ctx.db.user.findMany({
        where: {
          role: "CUSTOMER",
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }),
          ...(tier && {
            loyaltyAccount: {
              tier: tier as LoyaltyTier,
            },
          }),
        },
        include: {
          loyaltyAccount: true,
          orders: {
            where: { paymentStatus: "PAID" },
            select: {
              total: true,
            },
          },
          _count: {
            select: {
              orders: {
                where: { paymentStatus: "PAID" },
              },
            },
          },
        },
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (customers.length > limit) {
        const nextItem = customers.pop();
        nextCursor = nextItem!.id;
      }

      // Calculate stats
      const totalCount = await ctx.db.user.count({
        where: { role: "CUSTOMER" },
      });

      const loyaltyCount = await ctx.db.loyaltyAccount.count();

      const totalRevenueData = await ctx.db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      });
      const totalRevenue = totalRevenueData._sum.total?.toNumber() ?? 0;
      const avgLifetimeValue = totalCount > 0 ? totalRevenue / totalCount : 0;

      return {
        customers: customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image: customer.image,
          emailVerified: customer.emailVerified,
          createdAt: customer.createdAt,
          loyaltyTier: customer.loyaltyAccount?.tier ?? null,
          loyaltyPoints: customer.loyaltyAccount?.points ?? 0,
          orderCount: customer._count.orders,
          lifetimeValue: customer.orders.reduce(
            (sum, order) => sum + order.total.toNumber(),
            0
          ),
        })),
        totalCount,
        loyaltyCount,
        totalRevenue,
        avgLifetimeValue,
        nextCursor,
      };
    }),

  // Category Management
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    // Check admin/manager access
    if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const categories = await ctx.db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check if slug already exists
      const existing = await ctx.db.category.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists",
        });
      }

      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          parentId: input.parentId || null,
        },
      });

      return category;
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check if slug already exists (excluding current category)
      const existing = await ctx.db.category.findFirst({
        where: {
          slug: input.slug,
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists",
        });
      }

      const category = await ctx.db.category.update({
        where: { id: input.id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          parentId: input.parentId || null,
        },
      });

      return category;
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check if category has products
      const productsCount = await ctx.db.product.count({
        where: { categoryId: input.id },
      });

      if (productsCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete category with products",
        });
      }

      // Check if category has subcategories
      const subcategoriesCount = await ctx.db.category.count({
        where: { parentId: input.id },
      });

      if (subcategoriesCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete category with subcategories",
        });
      }

      await ctx.db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Promo Code Management
  getPromoCodes: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "expired", "all"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const now = new Date();
      let where = {};

      if (input.status === "active") {
        where = {
          active: true,
          OR: [
            { validTo: null },
            { validTo: { gte: now } },
          ],
        };
      } else if (input.status === "expired") {
        where = {
          OR: [
            { active: false },
            { validTo: { lt: now } },
          ],
        };
      }

      const promoCodes = await ctx.db.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return promoCodes.map(code => ({
        ...code,
        discountValue: code.discountValue.toNumber(),
        minOrderValue: code.minOrderValue?.toNumber() || null,
        currentUsage: code.usedCount,
        usageLimit: code.maxUses,
        expiresAt: code.validTo,
        isActive: code.active,
      }));
    }),

  createPromoCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20).toUpperCase(),
        description: z.string().optional(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discountValue: z.number().positive(),
        minOrderValue: z.number().min(0).optional(),
        maxDiscount: z.number().positive().optional(),
        usageLimit: z.number().int().positive().optional(),
        expiresAt: z.string().optional(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and manager users can create promo codes",
        });
      }

      // Check if code already exists
      const existingCode = await ctx.db.promoCode.findUnique({
        where: { code: input.code },
      });

      if (existingCode) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A promo code with this code already exists",
        });
      }

      return ctx.db.promoCode.create({
        data: {
          code: input.code,
          description: input.description,
          discountType: input.discountType,
          discountValue: input.discountValue,
          minOrderValue: input.minOrderValue,
          maxUses: input.usageLimit,
          validTo: input.expiresAt ? new Date(input.expiresAt) : null,
          active: input.isActive,
        },
      });
    }),

  updatePromoCode: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(3).max(20).toUpperCase(),
        description: z.string().optional(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discountValue: z.number().positive(),
        minOrderValue: z.number().min(0).optional(),
        maxDiscount: z.number().positive().optional(),
        usageLimit: z.number().int().positive().optional(),
        expiresAt: z.string().optional(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and manager users can update promo codes",
        });
      }

      // Check if code already exists (excluding current promo code)
      const existingCode = await ctx.db.promoCode.findFirst({
        where: {
          code: input.code,
          NOT: { id: input.id },
        },
      });

      if (existingCode) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A promo code with this code already exists",
        });
      }

      const { id, expiresAt, isActive, usageLimit, maxDiscount, ...data } = input;

      return ctx.db.promoCode.update({
        where: { id },
        data: {
          ...data,
          maxUses: usageLimit,
          validTo: expiresAt ? new Date(expiresAt) : null,
          active: isActive,
        },
      });
    }),

  deletePromoCode: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and manager users can delete promo codes",
        });
      }

      return ctx.db.promoCode.delete({
        where: { id: input.id },
      });
    }),

  // Store management
  getStores: protectedProcedure.query(async ({ ctx }) => {
    // Check admin/manager access
    if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const stores = await ctx.db.store.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return stores;
  }),

  getStoreById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const store = await ctx.db.store.findUnique({
        where: { id: input.id },
        include: {
          manager: true,
          staff: true,
          orders: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          inventory: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      return store;
    }),

  createStore: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().default("GB"),
        phone: z.string().min(1),
        email: z.string().email(),
        latitude: z.number(),
        longitude: z.number(),
        managerId: z.string().optional(),
        operatingHours: z.record(
          z.object({
            open: z.string(),
            close: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create stores",
        });
      }

      // Check if slug is unique
      const existing = await ctx.db.store.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A store with this slug already exists",
        });
      }

      const store = await ctx.db.store.create({
        data: {
          ...input,
          status: "ACTIVE",
        },
      });

      return store;
    }),

  updateStore: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        postalCode: z.string().min(1).optional(),
        country: z.string().optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).optional(),
        managerId: z.string().nullable().optional(),
        operatingHours: z.record(
          z.object({
            open: z.string(),
            close: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { id, ...data } = input;

      const store = await ctx.db.store.update({
        where: { id },
        data,
      });

      return store;
    }),

  getStoreStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        dateRange: z.enum(["today", "week", "month", "year"]).default("month"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const now = new Date();
      let startDate: Date;

      switch (input.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      // Get orders for the store
      const orders = await ctx.db.order.findMany({
        where: {
          storeId: input.storeId,
          createdAt: { gte: startDate },
        },
      });

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get inventory value
      const inventory = await ctx.db.storeInventory.findMany({
        where: { storeId: input.storeId },
        include: { product: true },
      });

      const inventoryValue = inventory.reduce(
        (sum, item) => sum + item.stock * item.product.price.toNumber(),
        0
      );

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        inventoryValue,
        lowStockItems: inventory.filter(item => item.stock < 10).length,
      };
    }),

  adjustStoreInventory: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string(),
        adjustment: z.number(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Get current inventory
      const inventory = await ctx.db.storeInventory.findUnique({
        where: {
          storeId_productId: {
            storeId: input.storeId,
            productId: input.productId,
          },
        },
      });

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found in store inventory",
        });
      }

      const newStock = inventory.stock + input.adjustment;
      if (newStock < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stock cannot be negative",
        });
      }

      // Update inventory
      const updated = await ctx.db.storeInventory.update({
        where: {
          storeId_productId: {
            storeId: input.storeId,
            productId: input.productId,
          },
        },
        data: {
          stock: newStock,
        },
      });

      // Log the adjustment (in production, you might want to create an audit log table)
      console.log(`Stock adjustment: Store ${input.storeId}, Product ${input.productId}, Adjustment ${input.adjustment}, Reason: ${input.reason}, User: ${ctx.session.user.id}`);

      return updated;
    }),

  // Staff management
  getAvailableStaff: protectedProcedure
    .input(
      z.object({
        excludeStoreId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage staff",
        });
      }

      // Get staff members not assigned to any store (or excluding a specific store)
      const staff = await ctx.db.user.findMany({
        where: {
          role: { in: ["STAFF", "MANAGER"] },
          OR: [
            { workingStoreId: null },
            input.excludeStoreId ? { workingStoreId: { not: input.excludeStoreId } } : {},
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });

      return staff;
    }),

  assignStaffToStore: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage staff",
        });
      }

      // Update user's working store
      await ctx.db.user.update({
        where: { id: input.userId },
        data: { workingStoreId: input.storeId },
      });

      return { success: true };
    }),

  removeStaffFromStore: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage staff",
        });
      }

      // Check if this user is a manager of any store
      const managedStore = await ctx.db.store.findFirst({
        where: { managerId: input.userId },
      });

      if (managedStore) {
        // Remove them as manager first
        await ctx.db.store.update({
          where: { id: managedStore.id },
          data: { managerId: null },
        });
      }

      // Remove from store
      await ctx.db.user.update({
        where: { id: input.userId },
        data: { workingStoreId: null },
      });

      return { success: true };
    }),

  // Store sales data
  getStoreSalesData: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        dateRange: z.enum(["today", "week", "month", "year"]),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // This would fetch actual sales data in production
      // For now, return mock data
      return {
        daily: [
          { date: "Mon", sales: 1200 },
          { date: "Tue", sales: 1500 },
          { date: "Wed", sales: 1300 },
          { date: "Thu", sales: 1800 },
          { date: "Fri", sales: 2200 },
          { date: "Sat", sales: 2500 },
          { date: "Sun", sales: 1900 },
        ],
        byCategory: [
          { category: "E-Liquids", percentage: 45 },
          { category: "Devices", percentage: 30 },
          { category: "Accessories", percentage: 25 },
        ],
      };
    }),

  getStoreTopProducts: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        dateRange: z.enum(["today", "week", "month", "year"]),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin/manager access
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const now = new Date();
      let startDate: Date;

      switch (input.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      // Get top products by revenue for the store
      const orders = await ctx.db.order.findMany({
        where: {
          storeId: input.storeId,
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Aggregate product sales
      const productSales = new Map<string, { name: string; unitsSold: number; revenue: number }>();

      for (const order of orders) {
        for (const item of order.items) {
          const existing = productSales.get(item.productId) || {
            name: item.product.name,
            unitsSold: 0,
            revenue: 0,
          };
          
          productSales.set(item.productId, {
            name: item.product.name,
            unitsSold: existing.unitsSold + item.quantity,
            revenue: existing.revenue + item.total.toNumber(),
          });
        }
      }

      // Sort by revenue and take top N
      const topProducts = Array.from(productSales.entries())
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, input.limit);

      return topProducts;
    }),

  transferStoreStock: protectedProcedure
    .input(
      z.object({
        fromStoreId: z.string(),
        toStoreId: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().positive(),
          })
        ),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can transfer stock between stores",
        });
      }

      // Verify both stores exist
      const [fromStore, toStore] = await Promise.all([
        ctx.db.store.findUnique({ where: { id: input.fromStoreId } }),
        ctx.db.store.findUnique({ where: { id: input.toStoreId } }),
      ]);

      if (!fromStore || !toStore) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or both stores not found",
        });
      }

      // Process each item transfer
      for (const item of input.items) {
        // Get current inventory for both stores
        const [fromInventory, toInventory] = await Promise.all([
          ctx.db.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: input.fromStoreId,
                productId: item.productId,
              },
            },
          }),
          ctx.db.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: input.toStoreId,
                productId: item.productId,
              },
            },
          }),
        ]);

        if (!fromInventory || fromInventory.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for product ${item.productId}`,
          });
        }

        // Update inventories
        await Promise.all([
          // Decrease from source store
          ctx.db.storeInventory.update({
            where: {
              storeId_productId: {
                storeId: input.fromStoreId,
                productId: item.productId,
              },
            },
            data: {
              stock: fromInventory.stock - item.quantity,
            },
          }),
          // Increase or create in destination store
          toInventory
            ? ctx.db.storeInventory.update({
                where: {
                  storeId_productId: {
                    storeId: input.toStoreId,
                    productId: item.productId,
                  },
                },
                data: {
                  stock: toInventory.stock + item.quantity,
                },
              })
            : ctx.db.storeInventory.create({
                data: {
                  storeId: input.toStoreId,
                  productId: item.productId,
                  stock: item.quantity,
                },
              }),
        ]);
      }

      // Log the transfer (in production, you might want to create a transfer log table)
      console.log(`Stock transfer: From ${input.fromStoreId} to ${input.toStoreId}, Items: ${input.items.length}, Reason: ${input.reason}, User: ${ctx.session.user.id}`);

      return { success: true };
    }),
}); 