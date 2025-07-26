import { addressRouter } from "@/server/api/routers/address";
import { adminRouter } from "@/server/api/routers/admin";
import { authRouter } from "@/server/api/routers/auth";
import { cartRouter } from "@/server/api/routers/cart";
import { checkoutRouter } from "@/server/api/routers/checkout";
import { contactRouter } from "@/server/api/routers/contact";
import { loyaltyRouter } from "@/server/api/routers/loyalty";
import { orderRouter } from "@/server/api/routers/order";
import { posRouter } from "@/server/api/routers/pos";
import { postRouter } from "@/server/api/routers/post";
import { productRouter } from "@/server/api/routers/product";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  address: addressRouter,
  admin: adminRouter,
  auth: authRouter,
  cart: cartRouter,
  checkout: checkoutRouter,
  contact: contactRouter,
  loyalty: loyaltyRouter,
  order: orderRouter,
  pos: posRouter,
  post: postRouter,
  product: productRouter,
  subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);