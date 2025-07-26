import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useState } from "react";

const SubscriptionsPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // Mock data - in production, this would come from the API
  const mockSubscriptions = [
    {
      id: "sub_1",
      status: "ACTIVE",
      interval: "MONTHLY",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: "item_1",
          product: {
            name: "Premium E-Liquid Bundle",
            image: "/products/eliquid-bundle.jpg",
          },
          quantity: 3,
          price: 29.99,
        },
      ],
      total: 89.97,
      discount: 10,
    },
  ];

  const pauseSubscription = api.subscription.pause.useMutation({
    onSuccess: () => {
      // Handle success
    },
  });

  const cancelSubscription = api.subscription.cancel.useMutation({
    onSuccess: () => {
      // Handle success
    },
  });

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.push("/auth/signin");
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIntervalText = (interval: string) => {
    switch (interval) {
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "QUARTERLY":
        return "Quarterly";
      case "YEARLY":
        return "Yearly";
      default:
        return interval;
    }
  };

  return (
    <>
      <Head>
        <title>My Subscriptions - Ministry of Vapes</title>
        <meta name="description" content="Manage your recurring orders and subscriptions" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mb-4">
            <Link href="/account" className="text-primary hover:underline">
              ← Back to Account
            </Link>
          </nav>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Subscriptions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your recurring orders and delivery schedules
          </p>
        </div>

        {mockSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-foreground">No active subscriptions</h3>
            <p className="mt-1 text-muted-foreground">
              Subscribe to your favorite products for regular deliveries and save!
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {mockSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getIntervalText(subscription.interval)} Subscription
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {subscription.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next delivery: {subscription.nextBillingDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        £{subscription.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">per delivery</p>
                      {subscription.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Save {subscription.discount}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subscription Items */}
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Items</h4>
                    <div className="space-y-3">
                      {subscription.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-muted rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × £{item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              £{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                    <button
                      onClick={() => setSelectedSubscription(subscription.id)}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                    >
                      Manage Items
                    </button>
                    <button
                      onClick={() => setSelectedSubscription(subscription.id)}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                    >
                      Change Schedule
                    </button>
                    <button
                      onClick={() => setSelectedSubscription(subscription.id)}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                    >
                      Skip Next Delivery
                    </button>
                    {subscription.status === "ACTIVE" ? (
                      <button
                        onClick={() => pauseSubscription.mutate({ id: subscription.id })}
                        className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
                      >
                        Pause Subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Resume subscription
                        }}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                      >
                        Resume Subscription
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this subscription?")) {
                          cancelSubscription.mutate({ id: subscription.id });
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-12 bg-primary/5 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Subscription Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground">Save up to 15%</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Exclusive subscriber discounts on all subscription items
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground">Priority Shipping</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Free next-day delivery on all subscription orders
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground">Flexible Schedule</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Skip, pause, or cancel anytime with no penalties
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionsPage; 