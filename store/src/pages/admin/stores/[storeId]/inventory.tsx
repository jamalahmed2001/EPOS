import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";
import { z } from "zod";

const stockAdjustmentSchema = z.object({
  productId: z.string(),
  adjustment: z.number(),
  reason: z.string().min(1),
});

const StoreInventoryPage: NextPage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const { data: session, status } = useSession();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    currentStock: number;
  } | null>(null);
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  // API queries
  const { data: store, refetch: refetchStore } = api.admin.getStoreById.useQuery(
    { id: storeId as string },
    { enabled: !!storeId }
  );

  const { data: categories } = api.product.getCategories.useQuery();

  const adjustStock = api.admin.adjustStoreInventory.useMutation({
    onSuccess: () => {
      void refetchStore();
      setShowAdjustmentModal(false);
      setSelectedProduct(null);
      setAdjustment("");
      setAdjustmentReason("");
    },
  });

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

  // Filter inventory
  const filteredInventory = store.inventory?.filter((item: any) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.product.categoryId === categoryFilter;
    const matchesStock = stockFilter === "all" ||
                        (stockFilter === "low" && item.stock > 0 && item.stock <= 10) ||
                        (stockFilter === "out" && item.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const handleAdjustStock = () => {
    if (!selectedProduct || !adjustment || !adjustmentReason) return;

    adjustStock.mutate({
      storeId: storeId as string,
      productId: selectedProduct.id,
      adjustment: parseInt(adjustment),
      reason: adjustmentReason,
    });
  };

  const totalInventoryValue = store.inventory?.reduce<number>(
    (sum: number, item: any) => sum + (item.stock * Number(item.product.price)),
    0
  ) || 0;

  const lowStockCount = store.inventory?.filter((item: any) => item.stock > 0 && item.stock <= 10).length || 0;
  const outOfStockCount = store.inventory?.filter((item: any) => item.stock === 0).length || 0;

  return (
    <>
      <Head>
        <title>{store.name} - Inventory Management</title>
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
                  <h1 className="text-xl font-bold text-foreground">{store.name} - Inventory</h1>
                  <p className="text-sm text-muted-foreground">{store.address}, {store.city}</p>
                </div>
              </div>
              <Link
                href={`/admin/stores/${storeId}/transfer`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer Stock
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{store.inventory?.length || 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold text-foreground">£{Number(totalInventoryValue).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
              className="h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (≤10)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Inventory Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.product.name}</div>
                          {item.product.barcode && (
                            <div className="text-xs text-muted-foreground">{item.product.barcode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {categories?.find(c => c.id === item.product.categoryId)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        £{item.product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.stock === 0
                            ? "bg-red-100 text-red-800"
                            : item.stock <= 10
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        £{(item.stock * Number(item.product.price))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedProduct({
                              id: item.productId,
                              name: item.product.name,
                              currentStock: item.stock,
                            });
                            setShowAdjustmentModal(true);
                          }}
                          className="text-primary hover:text-primary/90 font-medium"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        {showAdjustmentModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-foreground mb-4">Adjust Stock</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium text-foreground">{selectedProduct.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProduct.currentStock}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Adjustment (use negative for decrease)
                  </label>
                  <input
                    type="number"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., +10 or -5"
                  />
                  {adjustment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      New stock: {selectedProduct.currentStock + parseInt(adjustment || "0")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Reason for adjustment
                  </label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full h-20 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Stock count correction, damaged goods, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAdjustmentModal(false);
                    setSelectedProduct(null);
                    setAdjustment("");
                    setAdjustmentReason("");
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={!adjustment || !adjustmentReason || adjustStock.isPending}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {adjustStock.isPending ? "Adjusting..." : "Confirm Adjustment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreInventoryPage; 