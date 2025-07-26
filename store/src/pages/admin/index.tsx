import { useState, useMemo } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";

const AdminDashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("week");
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "customers" | "marketing">("overview");

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(() => ({
    enabled: status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  }), [status, session?.user?.role]);

  // Get dashboard stats with optimized queries
  const { data: stats } = api.admin.getDashboardStats.useQuery(
    { dateRange },
    {
      ...queryOptions,
      refetchInterval: 60000, // Refresh every minute
    }
  );
  
  const { data: inventoryStats } = api.admin.getInventoryStats.useQuery(
    undefined,
    {
      ...queryOptions,
      enabled: queryOptions.enabled && activeTab === "inventory",
    }
  );
  
  const { data: customerStats } = api.admin.getCustomerStats.useQuery(
    undefined,
    {
      ...queryOptions,
      enabled: queryOptions.enabled && activeTab === "customers",
    }
  );
  
  const { data: marketingStats } = api.admin.getMarketingStats.useQuery(
    undefined,
    {
      ...queryOptions,
      enabled: queryOptions.enabled && activeTab === "marketing",
    }
  );

  // Check admin/manager access
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER")) {
    void router.push("/");
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Ministry of Vapes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <nav className="hidden md:flex items-center gap-6">
                  {[
                    { key: "overview", label: "Overview" },
                    { key: "inventory", label: "Inventory" },
                    { key: "customers", label: "Customers" },
                    { key: "marketing", label: "Marketing" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? "text-primary border-b-2 border-primary pb-4"
                          : "text-muted-foreground hover:text-foreground pb-4"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Link
                  href="/pos"
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Open POS
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        £{stats?.totalRevenue.toFixed(2) ?? "0.00"}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className={(stats?.revenueChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                          {(stats?.revenueChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.revenueChange ?? 0)}%
                        </span>
                        <span className="text-muted-foreground"> from last period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {stats?.totalOrders ?? 0}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className={(stats?.ordersChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                          {(stats?.ordersChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.ordersChange ?? 0)}%
                        </span>
                        <span className="text-muted-foreground"> from last period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">New Customers</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {stats?.newCustomers ?? 0}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className={(stats?.customersChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                          {(stats?.customersChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.customersChange ?? 0)}%
                        </span>
                        <span className="text-muted-foreground"> from last period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        £{stats?.avgOrderValue.toFixed(2) ?? "0.00"}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className={(stats?.aovChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                          {(stats?.aovChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.aovChange ?? 0)}%
                        </span>
                        <span className="text-muted-foreground"> from last period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Analytics */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                {/* Sales by Channel */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Sales by Channel</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm font-medium text-foreground">Online Store</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          £{stats?.onlineRevenue.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              stats?.totalRevenue
                                ? (stats.onlineRevenue / stats.totalRevenue) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <span className="text-sm font-medium text-foreground">Point of Sale</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          £{stats?.posRevenue.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              stats?.totalRevenue
                                ? (stats.posRevenue / stats.totalRevenue) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Top Products</h2>
                  <div className="space-y-4">
                    {stats?.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                            index === 1 ? "bg-gray-100 text-gray-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.soldCount} units sold
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          £{product.revenue.toFixed(2)}
                        </span>
                      </div>
                    )) ?? (
                      <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {stats?.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            #{order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              order.channel === "ONLINE" 
                                ? "bg-primary/10 text-primary" 
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {order.channel === "ONLINE" ? (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              )}
                              {order.channel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                              order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                              order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                              order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                            £{order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )) ?? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            No recent orders
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {inventoryStats?.totalProducts ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    {inventoryStats?.lowStockCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {inventoryStats?.outOfStockCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Stock Value</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    £{inventoryStats?.totalStockValue.toFixed(2) ?? "0.00"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Inventory Management</h2>
                  <Link
                    href="/admin/products"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Manage Products →
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {inventoryStats?.lowStockProducts?.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-orange-600">{product.stock} left</p>
                          <p className="text-xs text-muted-foreground">Low stock alert</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {customerStats?.totalCustomers ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Loyalty Members</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {customerStats?.loyaltyMembers ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Avg Lifetime Value</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    £{customerStats?.avgLifetimeValue.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Repeat Rate</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {customerStats?.repeatRate ?? 0}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Top Customers</h2>
                  <div className="space-y-3">
                    {customerStats?.topCustomers?.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">£{customer.totalSpent.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Loyalty Tier Distribution</h2>
                  <div className="space-y-3">
                    {customerStats?.tierDistribution?.map((tier) => (
                      <div key={tier.tier}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{tier.tier}</span>
                          <span className="text-sm text-muted-foreground">{tier.count} members</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              tier.tier === "PLATINUM" ? "bg-purple-600" :
                              tier.tier === "GOLD" ? "bg-yellow-600" :
                              tier.tier === "SILVER" ? "bg-gray-600" :
                              "bg-orange-600"
                            }`}
                            style={{ width: `${tier.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Active Promo Codes</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {marketingStats?.activePromoCodes ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Promo Usage Rate</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {marketingStats?.promoUsageRate ?? 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Referral Conversions</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {marketingStats?.referralConversions ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">Email Subscribers</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {marketingStats?.emailSubscribers ?? 0}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h2>
                <div className="space-y-4">
                  {marketingStats?.campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.startDate} - {campaign.endDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">£{campaign.revenue.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{campaign.orders} orders</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/products"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Manage Products</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, or remove products from inventory
              </p>
            </Link>

            <Link
              href="/admin/categories"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200">
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Categories</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Organize products into categories
              </p>
            </Link>

            <Link
              href="/admin/orders"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Process Orders</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage customer orders
              </p>
            </Link>

            <Link
              href="/admin/customers"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Customer Insights</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View customer data and loyalty status
              </p>
            </Link>

            <Link
              href="/admin/staff"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Staff Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage staff accounts and permissions
              </p>
            </Link>

            <Link
              href="/admin/stores"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Store Locations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage store locations and inventory
              </p>
            </Link>

            <Link
              href="/admin/promotions"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Marketing Campaigns</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage promotions and track performance
              </p>
            </Link>

            <Link
              href="/admin/reports"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200">
                  <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Reports & Analytics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View detailed business analytics
              </p>
            </Link>

            <Link
              href="/admin/settings"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary">Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure store settings and preferences
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard; 