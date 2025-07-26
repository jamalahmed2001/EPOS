import { useState } from "react";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "@/server/api/root";
import { db } from "@/server/db";

interface ProductDetailPageProps {
  slug: string;
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ slug }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: product, isPending: isLoading } = api.product.getBySlug.useQuery({ slug });
  const utils = api.useUtils();

  const addToCart = api.cart.addItem.useMutation({
    onSuccess: async () => {
      await utils.cart.get.invalidate();
      setIsAddingToCart(false);
      // Show success message or redirect to cart
    },
    onError: () => {
      setIsAddingToCart(false);
      // Show error message
    },
  });

  const handleAddToCart = () => {
    if (!session) {
      void router.push("/auth/signin");
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    addToCart.mutate({
      productId: product.id,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
            <Link href="/products" className="mt-4 text-primary hover:underline">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `https://ministryofvapes.com/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Ministry of Vapes",
      },
    },
    aggregateRating: product.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <>
      <Head>
        <title>{product.metaTitle || `${product.name} - Ministry of Vapes`}</title>
        <meta 
          name="description" 
          content={product.metaDescription || product.shortDescription || product.description} 
        />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.shortDescription || product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={product.images[0]?.url} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content={product.currency} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/products" className="hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div>
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                {product.images[selectedImageIndex] ? (
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.images[selectedImageIndex].alt || product.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 ${
                        selectedImageIndex === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
              
              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(product.averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-foreground">
                    £{product.price}
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-xl text-muted-foreground line-through">
                      £{product.compareAtPrice}
                    </p>
                  )}
                </div>
                {product.isSubscribable && product.subscriptionPrice && (
                  <p className="mt-1 text-sm text-success">
                    Subscribe & Save: £{product.subscriptionPrice}/month
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
              </div>

              {/* Add to Cart */}
              <div className="mt-8">
                {product.stock > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label htmlFor="quantity" className="text-sm font-medium text-foreground">
                        Quantity
                      </label>
                      <div className="flex items-center rounded-lg border border-input">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-muted"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 border-0 text-center focus:outline-none"
                          min="1"
                          max={product.stock}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-3 py-2 hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                      {product.trackInventory && (
                        <span className="text-sm text-muted-foreground">
                          {product.stock} in stock
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addToCart.isPending}
                      className="w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isAddingToCart || addToCart.isPending ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="font-semibold text-foreground">Out of Stock</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This product is currently unavailable
                    </p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="mt-8 border-t pt-8">
                <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">SKU</dt>
                    <dd className="text-foreground">{product.sku}</dd>
                  </div>
                  {product.barcode && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Barcode</dt>
                      <dd className="text-foreground">{product.barcode}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="text-foreground">{product.category.name}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews.length > 0 && (
            <div className="mt-16 border-t pt-16">
              <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
              <div className="mt-8 space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-medium text-foreground">
                          {review.user.name || "Anonymous"}
                        </span>
                        {review.verified && (
                          <span className="text-xs text-success">Verified Purchase</span>
                        )}
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {review.title && (
                      <h3 className="mt-2 font-semibold text-foreground">{review.title}</h3>
                    )}
                    {review.comment && (
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await db.product.findMany({
    select: { slug: true },
    where: { active: true },
  });

  return {
    paths: products.map((product) => ({
      params: { slug: product.slug },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ProductDetailPageProps> = async (context) => {
  const slug = context.params?.slug as string;

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: null,
      db,
    },
    transformer: superjson,
  });

  await ssg.product.getBySlug.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
    revalidate: 60, // Revalidate every minute
  };
};

export default ProductDetailPage; 