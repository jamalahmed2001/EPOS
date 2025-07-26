import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";

const Home: NextPage = () => {
  const { data: productsData, isPending: isLoading } = api.product.getAll.useQuery({
    featured: true,
    limit: 8,
  });

  return (
    <>
      <Head>
        <title>Ministry of Vapes - Premium Vaping Products</title>
        <meta name="description" content="Discover premium vaping products at Ministry of Vapes. Quality e-liquids, devices, and accessories with fast UK delivery." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-background px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Welcome to Ministry of Vapes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Your trusted source for premium vaping products. Quality, authenticity, and exceptional service.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-md bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover our hand-picked selection of premium vaping products
            </p>

            {isLoading ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {productsData?.products.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
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
                    <h3 className="mt-4 text-sm font-medium text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      £{product.price}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {productsData?.products.length === 0 && (
              <p className="mt-8 text-center text-muted-foreground">
                No featured products available at the moment.
              </p>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-primary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Authentic Products</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  100% genuine products from trusted manufacturers
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-primary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Fast Delivery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Next-day delivery available across the UK
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-primary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Loyalty Rewards</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Earn points with every purchase and save
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-primary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Expert Support</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Knowledgeable staff ready to help you
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
