import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const OrderHistoryPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.push("/auth/signin?callbackUrl=/account/orders");
    return null;
  }

  const { data, isLoading } = api.order.getUserOrders.useQuery({});

  return (
    <>
      <Head>
        <title>Order History - Ministry of Vapes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/account"
              className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
            >
              ← Back to Account
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Order History</h1>
            <p className="mt-2 text-muted-foreground">
              View and track your past orders
            </p>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : data?.orders && data.orders.length > 0 ? (
            <div className="space-y-4">
              {data.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                        order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                                              {order.items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex-shrink-0">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} • Total: 
                      <span className="font-semibold text-foreground ml-1">
                        £{order.total.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="mt-3 sm:mt-0 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      {selectedOrder === order.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {/* Expanded Order Details */}
                  {selectedOrder === order.id && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Items */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-4">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-4">
                                {item.product.images?.[0] && (
                                  <img
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {item.product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × £{item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                  £{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Delivery Address</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress ? (
                                <>
                                  {order.shippingAddress.name}<br />
                                  {order.shippingAddress.line1}<br />
                                  {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </>
                              ) : (
                                "No address information available"
                              )}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Order Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">£{order.subtotal.toFixed(2)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount</span>
                                  <span>-£{order.discount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-foreground">£{order.shipping.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-foreground">£{order.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span className="text-foreground">Total</span>
                                <span className="text-foreground">£{order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-4">
                            <Link
                              href={`/products/${order.items[0]?.product.slug}`}
                              className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                              Order Again
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistoryPage; 