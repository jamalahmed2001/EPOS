import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 9.99, label: "Under £10" },
  { min: 10, max: 24.99, label: "£10 - £25" },
  { min: 25, max: 49.99, label: "£25 - £50" },
  { min: 50, max: 999999, label: "Over £50" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "featured", label: "Featured" },
];

const ProductsPage: NextPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  
  // Get categories
  const { data: categories } = api.product.getCategories.useQuery();
  
  // Get products with infinite query - now using server-side filtering and sorting
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isLoading,
  } = api.product.getAll.useInfiniteQuery(
    {
      categoryId: selectedCategory || undefined,
      search: search || undefined,
      featured: showFeaturedOnly ? true : undefined,
      minPrice: selectedPriceRange?.min,
      maxPrice: selectedPriceRange?.max !== 999999 ? selectedPriceRange?.max : undefined,
      inStockOnly: showInStockOnly,
      sortBy: sortBy as "newest" | "price-low" | "price-high" | "name" | "featured",
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const products = data?.pages.flatMap((page) => page.products) ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive through the query
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedPriceRange(null);
    setShowFeaturedOnly(false);
    setShowInStockOnly(false);
    setSearch("");
    setSortBy("newest");
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedPriceRange,
    showFeaturedOnly,
    showInStockOnly,
    search,
  ].filter(Boolean).length;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Products - Ministry of Vapes",
    description: "Browse our complete collection of premium vaping products including e-liquids, devices, and accessories.",
    url: "https://ministryofvapes.com/products",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        "@type": "Product",
        position: index + 1,
        name: product.name,
        description: product.shortDescription || product.description,
        image: product.images[0]?.url,
        url: `https://ministryofvapes.com/products/${product.slug}`,
        sku: product.sku,
        offers: {
          "@type": "Offer",
          priceCurrency: product.currency,
          price: product.price,
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Ministry of Vapes",
          },
        },
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://ministryofvapes.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://ministryofvapes.com/products",
        },
      ],
    },
  };

  return (
    <>
      <Head>
        <title>
          {selectedCategory 
            ? `${categories?.find(c => c.id === selectedCategory)?.name} Products - Ministry of Vapes`
            : "All Products - Ministry of Vapes | Premium Vaping Products"
          }
        </title>
        <meta 
          name="description" 
          content={`Browse our ${selectedCategory ? categories?.find(c => c.id === selectedCategory)?.name.toLowerCase() + ' ' : ''}collection of premium vaping products. E-liquids, devices, and accessories with fast UK delivery. ${products.length} products available.`}
        />
        <meta name="keywords" content="vape products, e-liquids, vaping devices, vape accessories, UK vape shop, Ministry of Vapes" />
        <meta property="og:title" content="Premium Vaping Products - Ministry of Vapes" />
        <meta property="og:description" content="Browse our complete collection of vaping products. Premium e-liquids, devices, and accessories with fast UK delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ministryofvapes.com/products" />
        <meta property="og:image" content={products[0]?.images[0]?.url || "/og-image.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Vaping Products - Ministry of Vapes" />
        <meta name="twitter:description" content="Browse our complete collection of premium vaping products." />
        <link rel="canonical" href="https://ministryofvapes.com/products" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-4">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">Products</li>
              {selectedCategory && (
                <>
                  <li>/</li>
                  <li className="text-foreground">
                    {categories?.find(c => c.id === selectedCategory)?.name}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Page Header */}
          <div className="py-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {selectedCategory 
                ? categories?.find(c => c.id === selectedCategory)?.name
                : "All Products"
              }
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {selectedCategory 
                ? categories?.find(c => c.id === selectedCategory)?.description
                : "Browse our complete collection of premium vaping products"
              }
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{products.length} products{hasNextPage ? "+" : ""}</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Clear all filters ({activeFiltersCount})
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <label htmlFor="search" className="sr-only">
                    Search products
                  </label>
                  <div className="relative">
                    <input
                      type="search"
                      id="search"
                      name="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === ""
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      All Products
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {category.name}
                        <span className="ml-1 text-xs opacity-70">
                          ({category._count.products})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedPriceRange(null)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        !selectedPriceRange
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      All Prices
                    </button>
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(range)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedPriceRange?.label === range.label
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Filters
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Featured only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={(e) => setShowInStockOnly(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">In stock only</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {/* Sort and View Options */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-foreground">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709M15 3H9a2 2 0 00-2 2v1.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 000 1.414l6.414 6.414a1 1 0 00.707.293H15a2 2 0 002-2V3z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-foreground">No products found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group"
                      >
                        <article className="overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="aspect-square overflow-hidden bg-muted relative">
                            {product.featured && (
                              <div className="absolute top-2 left-2 z-10">
                                <span className="inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                  Featured
                                </span>
                              </div>
                            )}
                            {product.stock <= 5 && product.trackInventory && product.stock > 0 && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="inline-flex items-center rounded-full bg-warning px-2 py-1 text-xs font-medium text-warning-foreground">
                                  Low Stock
                                </span>
                              </div>
                            )}
                            {product.stock === 0 && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                                <span className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            {product.images[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                width={300}
                                height={300}
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
                              {product.name}
                            </h3>
                            {product.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {product.shortDescription}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-semibold text-foreground">
                                  £{product.price.toFixed(2)}
                                </p>
                                {product.compareAtPrice && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    £{product.compareAtPrice.toFixed(2)}
                                  </p>
                                )}
                                {product.isSubscribable && product.subscriptionPrice && (
                                  <p className="text-xs text-success">
                                    Subscribe: £{product.subscriptionPrice.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              {product.stock <= 5 && product.trackInventory && product.stock > 0 && (
                                <span className="text-xs text-warning">
                                  Only {product.stock} left
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasNextPage && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => void fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading more products...
                          </>
                        ) : (
                          "Load More Products"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage; 