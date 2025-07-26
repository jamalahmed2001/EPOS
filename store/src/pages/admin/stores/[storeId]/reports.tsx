import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";

const StoreReportsPage: NextPage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const { data: session, status } = useSession();
  
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "year">("month");

  // API queries
  const { data: store } = api.admin.getStoreById.useQuery(
    { id: storeId as string },
    { enabled: !!storeId }
  );

  const { data: stats } = api.admin.getStoreStats.useQuery(
    { storeId: storeId as string, dateRange },
    { enabled: !!storeId }
  );

  const { data: salesData } = api.admin.getStoreSalesData.useQuery(
    { storeId: storeId as string, dateRange },
    { enabled: !!storeId }
  );

  const { data: topProducts } = api.admin.getStoreTopProducts.useQuery(
    { storeId: storeId as string, dateRange, limit: 10 },
    { enabled: !!storeId }
  );

  // Check permissions
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

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store data...</p>
      </div>
    );
  }

  // Mock sales trend data
  const salesTrend = [
    { date: "Mon", sales: 1200 },
    { date: "Tue", sales: 1500 },
    { date: "Wed", sales: 1300 },
    { date: "Thu", sales: 1800 },
    { date: "Fri", sales: 2200 },
    { date: "Sat", sales: 2500 },
    { date: "Sun", sales: 1900 },
  ];

  const maxSales = Math.max(...salesTrend.map(d => d.sales));

  return (
    <>
      <Head>
        <title>{store.name} - Sales Reports</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/stores"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{store.name} - Reports</h1>
                  <p className="text-sm text-muted-foreground">{store.address}, {store.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                £{stats?.totalRevenue.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dateRange === "today" ? "Today" : 
                 dateRange === "week" ? "This week" :
                 dateRange === "month" ? "This month" : "This year"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                +12% from last period
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">
                £{stats?.avgOrderValue.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-green-600 mt-1">
                +5% from last period
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">68%</p>
              <p className="text-xs text-red-600 mt-1">
                -2% from last period
              </p>
            </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">Sales Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {salesTrend.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted rounded-t-md relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-primary transition-all duration-500"
                      style={{ height: `${(day.sales / maxSales) * 100}%` }}
                    />
                    <div className="relative h-48" />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                  <span className="text-xs font-medium text-foreground">£{day.sales}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Top Products</h2>
              <div className="space-y-3">
                {topProducts?.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.unitsSold} units</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      £{product.revenue.toFixed(2)}
                    </p>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sales data available for this period
                  </p>
                )}
              </div>
            </div>

            {/* Sales by Category */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Sales by Category</h2>
              <div className="space-y-3">
                {[
                  { name: "E-Liquids", value: 45, color: "bg-blue-500" },
                  { name: "Devices", value: 30, color: "bg-green-500" },
                  { name: "Accessories", value: 25, color: "bg-yellow-500" },
                ].map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${category.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                                      {store.orders?.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        #{order.orderNumber.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        £{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreReportsPage; 