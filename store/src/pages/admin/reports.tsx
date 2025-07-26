import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const AdminReportsPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [reportType, setReportType] = useState<"sales" | "products" | "customers" | "loyalty">("sales");
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [isExporting, setIsExporting] = useState(false);

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

  // Mock report data - in production, this would come from the API
  const salesData = {
    summary: {
      totalRevenue: 45678.90,
      totalOrders: 234,
      averageOrderValue: 195.21,
      conversionRate: 3.2,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
    },
    topProducts: [
      { name: "Premium Vape Kit", sales: 4567.80, units: 45 },
      { name: "Fruit Blast E-Liquid", sales: 3456.90, units: 234 },
      { name: "Coil Pack (5pc)", sales: 2345.60, units: 156 },
      { name: "Portable Charger", sales: 1234.50, units: 67 },
    ],
    salesByDay: [
      { date: "Mon", revenue: 6543 },
      { date: "Tue", revenue: 7234 },
      { date: "Wed", revenue: 5432 },
      { date: "Thu", revenue: 8765 },
      { date: "Fri", revenue: 9876 },
      { date: "Sat", revenue: 4567 },
      { date: "Sun", revenue: 3261 },
    ],
  };

  const customerData = {
    summary: {
      totalCustomers: 1234,
      newCustomers: 156,
      returningCustomers: 78,
      customerLifetimeValue: 234.56,
      churnRate: 5.2,
    },
    topCustomers: [
      { name: "John Smith", orders: 23, totalSpent: 2345.67, tier: "GOLD" },
      { name: "Sarah Johnson", orders: 19, totalSpent: 1876.54, tier: "SILVER" },
      { name: "Mike Williams", orders: 15, totalSpent: 1456.78, tier: "SILVER" },
      { name: "Emma Davis", orders: 12, totalSpent: 1234.56, tier: "BRONZE" },
    ],
    customersByTier: [
      { tier: "BRONZE", count: 678, percentage: 55 },
      { tier: "SILVER", count: 345, percentage: 28 },
      { tier: "GOLD", count: 156, percentage: 13 },
      { tier: "PLATINUM", count: 55, percentage: 4 },
    ],
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      // In production, this would generate and download the report
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      alert("Error exporting report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reports - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  ← Back
                </Link>
                <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-lg bg-background border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-lg bg-background border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Report Type Tabs */}
          <div className="border-b border-border mb-8">
            <nav className="flex gap-8">
              {[
                { key: "sales", label: "Sales Report" },
                { key: "products", label: "Product Performance" },
                { key: "customers", label: "Customer Analytics" },
                { key: "loyalty", label: "Loyalty Program" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setReportType(tab.key as any)}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    reportType === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Sales Report */}
          {reportType === "sales" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    £{salesData.summary.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    +{salesData.summary.revenueGrowth}% from last period
                  </p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{salesData.summary.totalOrders}</p>
                  <p className="text-sm text-green-600 mt-2">
                    +{salesData.summary.ordersGrowth}% from last period
                  </p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Average Order Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    £{salesData.summary.averageOrderValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {salesData.summary.conversionRate}%
                  </p>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Day</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {salesData.salesByDay.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{
                          height: `${(day.revenue / 10000) * 100}%`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Selling Products</h3>
                <div className="space-y-4">
                  {salesData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                      <p className="font-semibold text-foreground">£{product.sales.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Analytics */}
          {reportType === "customers" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-foreground">{customerData.summary.totalCustomers}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">New This Period</p>
                  <p className="text-2xl font-bold text-foreground">{customerData.summary.newCustomers}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Lifetime Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    £{customerData.summary.customerLifetimeValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-foreground">{customerData.summary.churnRate}%</p>
                </div>
              </div>

              {/* Customer Tiers */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Customers by Loyalty Tier</h3>
                <div className="space-y-4">
                  {customerData.customersByTier.map((tier) => (
                    <div key={tier.tier}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{tier.tier}</span>
                        <span className="text-sm text-muted-foreground">
                          {tier.count} customers ({tier.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tier.tier === "BRONZE" ? "bg-orange-500" :
                            tier.tier === "SILVER" ? "bg-gray-500" :
                            tier.tier === "GOLD" ? "bg-yellow-500" :
                            "bg-purple-500"
                          }`}
                          style={{ width: `${tier.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Top Customers</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Tier
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customerData.topCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-foreground">{customer.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{customer.orders}</td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            £{customer.totalSpent.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.tier === "BRONZE" ? "bg-orange-100 text-orange-800" :
                              customer.tier === "SILVER" ? "bg-gray-100 text-gray-800" :
                              customer.tier === "GOLD" ? "bg-yellow-100 text-yellow-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {customer.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Product Performance */}
          {reportType === "products" && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">Product Performance Report</h3>
              <p className="text-muted-foreground">Detailed product analytics coming soon...</p>
            </div>
          )}

          {/* Loyalty Program */}
          {reportType === "loyalty" && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">Loyalty Program Analytics</h3>
              <p className="text-muted-foreground">Points distribution and redemption metrics coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage; 