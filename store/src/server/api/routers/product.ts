import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  // Get all products with optional filters
  getAll: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, search, featured, limit, cursor } = input;

      const products = await ctx.db.product.findMany({
        where: {
          active: true,
          ...(categoryId && { categoryId }),
          ...(featured !== undefined && { featured }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          category: true,
          images: {
            orderBy: { position: "asc" },
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
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products: products.map(product => ({
          ...product,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice?.toNumber() ?? null,
          subscriptionPrice: product.subscriptionPrice?.toNumber() ?? null,
          cost: product.cost?.toNumber() ?? null,
        })),
        nextCursor,
      };
    }),

  // Get single product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { slug: input.slug, active: true },
        include: {
          category: true,
          images: {
            orderBy: { position: "asc" },
          },
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Calculate average rating
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;

      return {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice?.toNumber() ?? null,
        subscriptionPrice: product.subscriptionPrice?.toNumber() ?? null,
        cost: product.cost?.toNumber() ?? null,
        averageRating,
        reviewCount: product.reviews.length,
      };
    }),

  // Get categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Create a product (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        shortDescription: z.string().optional(),
        sku: z.string().min(1),
        barcode: z.string().optional(),
        price: z.number().positive(),
        compareAtPrice: z.number().positive().optional(),
        cost: z.number().positive().optional(),
        categoryId: z.string(),
        stock: z.number().int().min(0).default(0),
        trackInventory: z.boolean().default(true),
        active: z.boolean().default(true),
        featured: z.boolean().default(false),
        isSubscribable: z.boolean().default(false),
        subscriptionPrice: z.number().positive().optional(),
        images: z.array(
          z.object({
            url: z.string().url(),
            alt: z.string().optional(),
            position: z.number().int().min(0).default(0),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin/manager
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and manager users can create products",
        });
      }

      const { images, ...productData } = input;

      const product = await ctx.db.product.create({
        data: {
          ...productData,
          images: {
            create: images,
          },
        },
        include: {
          category: true,
          images: true,
        },
      });

      return {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice?.toNumber() ?? null,
        subscriptionPrice: product.subscriptionPrice?.toNumber() ?? null,
        cost: product.cost?.toNumber() ?? null,
      };
    }),
}); 