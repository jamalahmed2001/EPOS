import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const ProductsPage: NextPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Get categories
  const { data: categories } = api.product.getCategories.useQuery();
  
  // Get products with infinite query
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

  return (
    <>
      <Head>
        <title>All Products - Ministry of Vapes</title>
        <meta 
          name="description" 
          content="Browse our complete collection of vaping products. Premium e-liquids, devices, and accessories with fast UK delivery." 
        />
        <meta property="og:title" content="All Products - Ministry of Vapes" />
        <meta property="og:description" content="Browse our complete collection of vaping products." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="py-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              All Products
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse our complete collection of premium vaping products
            </p>
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
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
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

                {/* Price Range (placeholder for future) */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      Under £10
                    </button>
                    <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      £10 - £25
                    </button>
                    <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      £25 - £50
                    </button>
                    <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                      Over £50
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
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
                  <p className="text-muted-foreground">
                    No products found matching your criteria.
                  </p>
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
                        <div className="overflow-hidden rounded-lg bg-card shadow-sm transition-shadow hover:shadow-md">
                          <div className="aspect-square overflow-hidden bg-muted">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <svg
                                  className="h-12 w-12"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
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
                          <div className="p-4">
                            <h3 className="text-sm font-medium text-foreground line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="mt-2 flex items-center justify-between">
                              <div>
                                <p className="text-lg font-semibold text-foreground">
                                  £{product.price}
                                </p>
                                {product.compareAtPrice && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    £{product.compareAtPrice}
                                  </p>
                                )}
                              </div>
                              {product.stock <= 5 && product.trackInventory && (
                                <span className="text-xs text-warning">
                                  Only {product.stock} left
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                            <svg
                              className="mr-2 h-4 w-4 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          "Load More"
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