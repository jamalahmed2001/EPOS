import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { env } from "@/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export const checkoutRouter = createTRPCRouter({
  // Create a Stripe checkout session
  createSession: protectedProcedure
    .input(
      z.object({
        shippingAddressId: z.string(),
        billingAddressId: z.string(),
        useShippingAsBilling: z.boolean(),
        promoCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get cart items
      const cart = await ctx.db.cart.findUnique({
        where: { userId },
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

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Get addresses
      const [shippingAddress, billingAddress] = await Promise.all([
        ctx.db.address.findUnique({
          where: { id: input.shippingAddressId, userId },
        }),
        input.useShippingAsBilling
          ? null
          : ctx.db.address.findUnique({
              where: { id: input.billingAddressId, userId },
            }),
      ]);

      if (!shippingAddress) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid shipping address",
        });
      }

      // Calculate totals
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price.toNumber(),
        0
      );
      const tax = subtotal * 0.2; // 20% VAT
      const shipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over £50
      const total = subtotal + tax + shipping;

      // Create line items for Stripe
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.product.name,
            description: item.product.description ?? undefined,
            images: item.product.images.length > 0 ? [item.product.images[0]!.url] : undefined,
          },
          unit_amount: Math.round(item.product.price.toNumber() * 100), // Convert to pence
        },
        quantity: item.quantity,
      }));

      // Add shipping as a line item if not free
      if (shipping > 0) {
        lineItems.push({
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Standard Shipping",
            },
            unit_amount: Math.round(shipping * 100),
          },
          quantity: 1,
        });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/checkout`,
        customer_email: ctx.session.user.email ?? undefined,
        metadata: {
          userId,
          shippingAddressId: shippingAddress.id,
          billingAddressId: input.useShippingAsBilling ? shippingAddress.id : billingAddress?.id || "",
          promoCode: input.promoCode || "",
        },
      });

      return { sessionId: session.id };
    }),

  // Create order
  createOrder: protectedProcedure
    .input(
      z.object({
        shippingAddress: z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string(),
        }),
        billingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string(),
        }),
        paymentMethod: z.enum(["card", "paypal"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get cart
      const cart = await ctx.db.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Calculate totals
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.product.price.toNumber() * item.quantity,
        0
      );
      const tax = subtotal * 0.2; // 20% VAT
      const shipping = subtotal > 50 ? 0 : 4.99;
      const total = subtotal + tax + shipping;

      // Create order
      const order = await ctx.db.order.create({
        data: {
          userId,
          customerEmail: input.shippingAddress.email,
          customerName: input.shippingAddress.name,
          customerPhone: input.shippingAddress.phone,
          subtotal,
          tax,
          shipping,
          total,
          status: "PENDING",
          paymentStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          channel: "ONLINE",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price.toNumber() * item.quantity,
            })),
          },
        },
      });

      // Clear cart
      await ctx.db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Update loyalty points
      const loyaltyAccount = await ctx.db.loyaltyAccount.findUnique({
        where: { userId: ctx.session.user.id },
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
            description: `Points earned from order ${order.orderNumber}`,
          },
        });
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
      };
    }),

  // Get user addresses
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.address.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { isDefault: "desc" },
    });
  }),

  // Create address
  createAddress: protectedProcedure
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
          userId: ctx.session.user.id
        },
      });
    }),

  // Create payment intent
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order || order.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total.toNumber() * 100), // Convert to pence
        currency: "gbp",
        metadata: {
          orderId: order.id,
          userId: ctx.session.user.id,
        },
      });

      // Update order with payment intent
      await ctx.db.order.update({
        where: { id: order.id },
        data: {
          stripePaymentId: paymentIntent.id,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
      };
    }),
}); 