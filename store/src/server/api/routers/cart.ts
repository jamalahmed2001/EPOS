import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  // Get current user's cart
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.db.cart.findUnique({
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
    });

    if (!cart) {
      // Create cart if it doesn't exist
      return ctx.db.cart.create({
        data: {
          userId: ctx.session.user.id,
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
        },
      });
    }

    return cart;
  }),

  // Add item to cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if product exists and is active
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId, active: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check stock if tracking inventory
      if (product.trackInventory && product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      // Get or create cart
      let cart = await ctx.db.cart.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!cart) {
        cart = await ctx.db.cart.create({
          data: { userId: ctx.session.user.id },
        });
      }

      // Check if item already exists in cart
      const existingItem = await ctx.db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId,
          },
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + input.quantity;
        
        // Check stock for updated quantity
        if (product.trackInventory && product.stock < newQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient stock",
          });
        }

        return ctx.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
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
        });
      }

      // Create new cart item
      return ctx.db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        },
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
      });
    }),

  // Update item quantity
  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to user's cart
      const item = await ctx.db.cartItem.findFirst({
        where: {
          id: input.itemId,
          cart: { userId: ctx.session.user.id },
        },
        include: { product: true },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      // Check stock
      if (item.product.trackInventory && item.product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      return ctx.db.cartItem.update({
        where: { id: input.itemId },
        data: { quantity: input.quantity },
      });
    }),

  // Remove item from cart
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to user's cart
      const item = await ctx.db.cartItem.findFirst({
        where: {
          id: input.itemId,
          cart: { userId: ctx.session.user.id },
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      return ctx.db.cartItem.delete({
        where: { id: input.itemId },
      });
    }),

  // Clear cart
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await ctx.db.cart.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!cart) {
      return { count: 0 };
    }

    const deleted = await ctx.db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { count: deleted.count };
  }),

  // Get cart summary (totals, etc.)
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.db.cart.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Check for loyalty discount (20% off after 10 orders over £20)
    let discount = 0;
    const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (loyaltyAccount && loyaltyAccount.completedOrders >= 10 && subtotal > 20) {
      discount = subtotal * 0.2;
    }

    // Simple tax calculation (20% VAT)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.2;
    
    // Simple shipping calculation
    const shipping = subtotal >= 50 ? 0 : 5.99;

    const total = taxableAmount + tax + shipping;

    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };
  }),
}); 