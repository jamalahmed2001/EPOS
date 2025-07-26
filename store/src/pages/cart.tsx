import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

const CartPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cart, isPending: isLoading } = api.cart.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: summary } = api.cart.getSummary.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const utils = api.useUtils();

  const updateQuantity = api.cart.updateQuantity.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.getSummary.invalidate();
    },
  });

  const removeItem = api.cart.removeItem.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.getSummary.invalidate();
    },
  });

  const clearCart = api.cart.clear.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.getSummary.invalidate();
    },
  });

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateQuantity.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate({ itemId });
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    // TODO: Implement checkout flow
    void router.push("/checkout");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Please sign in to view your cart
            </h1>
            <Link
              href="/auth/signin"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items ?? [];

  return (
    <>
      <Head>
        <title>Shopping Cart - Ministry of Vapes</title>
        <meta name="description" content="View and manage your shopping cart" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-2 text-muted-foreground">
                Add some products to get started
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <svg
                              className="h-8 w-8"
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

                      <div className="flex flex-1 flex-col">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            £{Number(item.product.price)} each
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-input">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              disabled={updateQuantity.isPending}
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 py-1">{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                updateQuantity.isPending ||
                                (item.product.trackInventory &&
                                  item.quantity >= item.product.stock)
                              }
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold text-foreground">
                              £{(Number(item.product.price) * item.quantity)}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removeItem.isPending}
                              className="text-danger hover:text-danger/80 disabled:opacity-50"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <Link
                    href="/products"
                    className="text-primary hover:underline"
                  >
                    ← Continue Shopping
                  </Link>
                  <button
                    onClick={() => clearCart.mutate()}
                    disabled={clearCart.isPending}
                    className="text-danger hover:underline disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Order Summary
                  </h2>

                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="text-foreground">
                        £{summary?.subtotal ?? "0.00"}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Tax (VAT 20%)</dt>
                      <dd className="text-foreground">
                        £{summary?.tax ?? "0.00"}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="text-foreground">
                        {summary?.shipping === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          `£${summary?.shipping ?? "0.00"}`
                        )}
                      </dd>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <dt className="text-base font-semibold text-foreground">
                          Total
                        </dt>
                        <dd className="text-base font-semibold text-foreground">
                          £{summary?.total ?? "0.00"}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                    className="mt-6 w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Proceed to Checkout"}
                  </button>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Free shipping on orders over £50
                  </p>

                  {/* Loyalty Reminder */}
                  {summary && summary.itemCount >= 10 && (
                    <div className="mt-4 rounded-lg bg-accent/10 p-3">
                      <p className="text-sm text-accent-foreground">
                        🎉 You qualify for 20% off on orders over £20!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage; 