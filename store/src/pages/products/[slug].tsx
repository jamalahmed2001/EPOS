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
  const [selectedTab, setSelectedTab] = useState<'description' | 'reviews' | 'specifications' | 'faq'>('description');
  const [isSubscription, setIsSubscription] = useState(false);

  const { data: product, isPending: isLoading } = api.product.getBySlug.useQuery({ slug });
  const { data: relatedProducts } = api.product.getAll.useQuery({
    categoryId: product?.category.id,
    limit: 4,
  }, {
    enabled: !!product?.category.id
  });

  const utils = api.useUtils();

  const addToCart = api.cart.addItem.useMutation({
    onSuccess: async () => {
      await utils.cart.get.invalidate();
      setIsAddingToCart(false);
      // Show success message
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

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } else if (product) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Generate FAQ schema from product information
  const faqSchema = product ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.description
        }
      },
      {
        "@type": "Question", 
        name: "What nicotine strength is available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This product is available in various nicotine strengths. Please check the product title for the specific strength of this item."
        }
      },
      {
        "@type": "Question",
        name: "Is this product age-restricted?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you must be 18 or over to purchase vaping products. Age verification is required at checkout."
        }
      },
      ...(product.isSubscribable ? [{
        "@type": "Question",
        name: "Can I subscribe to this product?",
        acceptedAnswer: {
          "@type": "Answer", 
          text: `Yes, you can subscribe to ${product.name} for regular deliveries at a discounted price of £${product.subscriptionPrice?.toFixed(2) || 'N/A'} per delivery.`
        }
      }] : [])
    ]
  } : null;

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
            <p className="mt-2 text-muted-foreground">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <Link href="/products" className="mt-4 inline-flex items-center text-primary hover:underline">
              ← Back to all products
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
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: "Ministry of Vapes"
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: `https://ministryofvapes.com/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Ministry of Vapes",
        url: "https://ministryofvapes.com"
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "GBP"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue", 
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY"
          }
        }
      }
    },
    aggregateRating: product.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    review: product.reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      author: {
        "@type": "Person",
        name: review.user.name || "Anonymous"
      },
      reviewBody: review.comment,
      datePublished: review.createdAt
    })),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Age Restriction",
        value: "18+"
      },
      {
        "@type": "PropertyValue", 
        name: "Category",
        value: product.category.name
      },
      ...(product.isSubscribable ? [{
        "@type": "PropertyValue",
        name: "Subscription Available",
        value: "Yes"
      }] : [])
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ministryofvapes.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products", 
        item: "https://ministryofvapes.com/products"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `https://ministryofvapes.com/products?category=${product.category.slug}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `https://ministryofvapes.com/products/${product.slug}`
      }
    ]
  };

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <Head>
        <title>{product.metaTitle || `${product.name} - Premium Vape Products | Ministry of Vapes`}</title>
        <meta 
          name="description" 
          content={product.metaDescription || `${product.shortDescription || product.description} ✓ ${product.stock > 0 ? 'In Stock' : 'Out of Stock'} ✓ Fast UK Delivery ✓ ${product.isSubscribable ? 'Subscription Available' : ''} ${product.compareAtPrice ? `Save ${discountPercentage}%` : ''}`}
        />
        <meta name="keywords" content={`${product.name}, ${product.category.name}, vape, e-liquid, Ministry of Vapes, ${product.sku}`} />
        <meta property="og:title" content={`${product.name} - Ministry of Vapes`} />
        <meta property="og:description" content={product.shortDescription || product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://ministryofvapes.com/products/${product.slug}`} />
        <meta property="og:image" content={product.images[0]?.url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content={product.currency} />
        <meta property="product:availability" content={product.stock > 0 ? "in stock" : "out of stock"} />
        <meta property="product:brand" content="Ministry of Vapes" />
        <meta property="product:condition" content="new" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} - Ministry of Vapes`} />
        <meta name="twitter:description" content={product.shortDescription || product.description} />
        <meta name="twitter:image" content={product.images[0]?.url} />
        <link rel="canonical" href={`https://ministryofvapes.com/products/${product.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
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
              <li className="text-foreground font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div>
              <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.featured && (
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                      Featured
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="inline-flex items-center rounded-full bg-success px-3 py-1 text-sm font-medium text-success-foreground">
                      Save {discountPercentage}%
                    </span>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="inline-flex items-center rounded-full bg-warning px-3 py-1 text-sm font-medium text-warning-foreground">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
                  aria-label="Share product"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>

                {product.images[selectedImageIndex] ? (
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.images[selectedImageIndex].alt || product.name}
                    className="h-full w-full object-cover object-center"
                    width={600}
                    height={600}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Image Gallery */}
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                        width={150}
                        height={150}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                {product.name}
              </h1>
              
              {/* Rating and Reviews */}
              {product.reviewCount > 0 && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1">
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
                    <span className="ml-2 text-sm font-medium text-foreground">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTab('reviews')}
                    className="text-sm text-primary hover:underline"
                  >
                    {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-foreground">
                    £{(isSubscription && product.subscriptionPrice) ? product.subscriptionPrice.toFixed(2) : product.price.toFixed(2)}
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-xl text-muted-foreground line-through">
                      £{product.compareAtPrice.toFixed(2)}
                    </p>
                  )}
                  {discountPercentage > 0 && (
                    <span className="inline-flex items-center rounded-full bg-success px-2 py-1 text-sm font-medium text-success-foreground">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
                
                {/* Subscription Option */}
                {product.isSubscribable && product.subscriptionPrice && (
                  <div className="mt-4 rounded-lg border border-success/20 bg-success/5 p-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSubscription}
                        onChange={(e) => setIsSubscription(e.target.checked)}
                        className="rounded border-input text-success focus:ring-success"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          Subscribe & Save
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Get regular deliveries at £{product.subscriptionPrice.toFixed(2)} each 
                          (Save £{(product.price - product.subscriptionPrice).toFixed(2)})
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div className="mt-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-success">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      {product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
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
                          className="px-3 py-2 hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 border-0 text-center focus:outline-none bg-transparent"
                          min="1"
                          max={product.stock}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-3 py-2 hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      {product.trackInventory && (
                        <span className="text-sm text-muted-foreground">
                          {product.stock} available
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addToCart.isPending}
                      className="w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isAddingToCart || addToCart.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Adding to Cart...
                        </span>
                      ) : (
                        `Add to Cart - £${((isSubscription && product.subscriptionPrice) ? product.subscriptionPrice * quantity : product.price * quantity).toFixed(2)}`
                      )}
                    </button>

                    {/* Age Verification Notice */}
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <div className="flex items-start gap-2">
                        <svg className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Age Restricted Product
                          </p>
                          <p className="text-xs text-muted-foreground">
                            You must be 18+ to purchase this product. Age verification required at checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-6 text-center">
                    <p className="font-semibold text-foreground">Currently Unavailable</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This product is currently out of stock. Check back soon for availability.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="mt-8 border-t pt-8">
                <h2 className="text-lg font-semibold text-foreground">Quick Details</h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
                    <dd className="text-sm text-foreground">{product.sku}</dd>
                  </div>
                  {product.barcode && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Barcode</dt>
                      <dd className="text-sm text-foreground">{product.barcode}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                    <dd className="text-sm text-foreground">
                      <Link href={`/products?category=${product.category.slug}`} className="text-primary hover:underline">
                        {product.category.name}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                    <dd className="text-sm text-foreground">
                      {product.weight ? `${product.weight}${product.weightUnit}` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                  { id: 'faq', label: 'FAQ' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {selectedTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {selectedTab === 'specifications' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Product Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">SKU</dt>
                        <dd className="text-sm text-foreground">{product.sku}</dd>
                      </div>
                      {product.barcode && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">Barcode</dt>
                          <dd className="text-sm text-foreground">{product.barcode}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Category</dt>
                        <dd className="text-sm text-foreground">{product.category.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Weight</dt>
                        <dd className="text-sm text-foreground">
                          {product.weight ? `${product.weight}${product.weightUnit}` : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Availability</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Stock Status</dt>
                        <dd className={`text-sm font-medium ${product.stock > 0 ? 'text-success' : 'text-destructive'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </dd>
                      </div>
                      {product.trackInventory && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">Quantity Available</dt>
                          <dd className="text-sm text-foreground">{product.stock}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Subscription</dt>
                        <dd className="text-sm text-foreground">
                          {product.isSubscribable ? 'Available' : 'Not Available'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Pricing</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Price</dt>
                        <dd className="text-sm text-foreground">£{product.price.toFixed(2)}</dd>
                      </div>
                      {product.compareAtPrice && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">RRP</dt>
                          <dd className="text-sm text-muted-foreground line-through">£{product.compareAtPrice.toFixed(2)}</dd>
                        </div>
                      )}
                      {product.subscriptionPrice && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">Subscription Price</dt>
                          <dd className="text-sm text-success">£{product.subscriptionPrice.toFixed(2)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div>
                  {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
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
                              <div>
                                <span className="font-medium text-foreground">
                                  {review.user.name || "Anonymous"}
                                </span>
                                {review.verified && (
                                  <span className="ml-2 text-xs text-success">✓ Verified Purchase</span>
                                )}
                              </div>
                            </div>
                            <time className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </time>
                          </div>
                          {review.title && (
                            <h3 className="mt-2 font-semibold text-foreground">{review.title}</h3>
                          )}
                          {review.comment && (
                            <p className="mt-2 text-muted-foreground leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'faq' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is {product.name}?</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What nicotine strength is available?</h3>
                    <p className="text-muted-foreground">
                      This product is available in various nicotine strengths. Please check the product title for the specific strength of this item.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Is this product age-restricted?</h3>
                    <p className="text-muted-foreground">
                      Yes, you must be 18 or over to purchase vaping products. Age verification is required at checkout.
                    </p>
                  </div>

                  {product.isSubscribable && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Can I subscribe to this product?</h3>
                      <p className="text-muted-foreground">
                        Yes, you can subscribe to {product.name} for regular deliveries at a discounted price of £{product.subscriptionPrice?.toFixed(2) || 'N/A'} per delivery.
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">How fast is delivery?</h3>
                    <p className="text-muted-foreground">
                      We offer fast UK delivery with orders processed within 1-2 business days and delivered within 1-3 business days.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What's your return policy?</h3>
                    <p className="text-muted-foreground">
                      We accept returns within 30 days of purchase for unused products in original packaging. Vaping products cannot be returned once opened for health and safety reasons.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.products.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.products.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-muted">
                        {relatedProduct.images[0] ? (
                          <img
                            src={relatedProduct.images[0].url}
                            alt={relatedProduct.images[0].alt || relatedProduct.name}
                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            width={250}
                            height={250}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold text-foreground">
                            £{relatedProduct.price.toFixed(2)}
                          </p>
                          {relatedProduct.compareAtPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              £{relatedProduct.compareAtPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
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
    take: 100, // Limit for build performance
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

  try {
    await ssg.product.getBySlug.prefetch({ slug });
  } catch (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
    revalidate: 300, // Revalidate every 5 minutes
  };
};

export default ProductDetailPage; 