import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";
import { z } from "zod";

const transferSchema = z.object({
  fromStoreId: z.string(),
  toStoreId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
  ),
  reason: z.string().min(1),
});

const StoreTransferPage: NextPage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const { data: session, status } = useSession();
  
  const [targetStoreId, setTargetStoreId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [transferReason, setTransferReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // API queries
  const { data: store } = api.admin.getStoreById.useQuery(
    { id: storeId as string },
    { enabled: !!storeId }
  );

  const { data: stores } = api.admin.getStores.useQuery();

  const { data: categories } = api.product.getCategories.useQuery();

  // Mutations
  const transferStock = api.admin.transferStoreStock.useMutation({
    onSuccess: () => {
      void router.push(`/admin/stores/${storeId}/inventory`);
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

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    void router.push("/");
    return null;
  }

  if (!store || !stores) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store data...</p>
      </div>
    );
  }

  // Filter inventory
  const filteredInventory = store.inventory?.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const otherStores = stores.filter(s => s.id !== storeId && s.status === "ACTIVE");

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      selectedProducts.delete(productId);
    } else {
      selectedProducts.set(productId, quantity);
    }
    setSelectedProducts(new Map(selectedProducts));
  };

  const handleTransfer = () => {
    if (!targetStoreId || selectedProducts.size === 0 || !transferReason) return;

    const items = Array.from(selectedProducts.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    transferStock.mutate({
      fromStoreId: storeId as string,
      toStoreId: targetStoreId,
      items,
      reason: transferReason,
    });
  };

  const totalItemsToTransfer = Array.from(selectedProducts.values()).reduce((sum, qty) => sum + qty, 0);

  return (
    <>
      <Head>
        <title>{store.name} - Stock Transfer</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/stores/${storeId}/inventory`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Stock Transfer</h1>
                  <p className="text-sm text-muted-foreground">From: {store.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Transfer Details */}
          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Transfer Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  From Store
                </label>
                <div className="h-10 rounded-lg border border-input bg-muted px-4 flex items-center text-sm">
                  {store.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  To Store
                </label>
                <select
                  value={targetStoreId}
                  onChange={(e) => setTargetStoreId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Select destination store...</option>
                  {otherStores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Reason for Transfer
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full h-20 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Balancing inventory, store request, seasonal adjustment..."
                />
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Select Products</h2>
              <div className="text-sm text-muted-foreground">
                {selectedProducts.size} products, {totalItemsToTransfer} total items
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Products Table */}
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
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transfer Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((item) => {
                    const transferQty = selectedProducts.get(item.productId) || 0;
                    return (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={item.stock}
                            value={transferQty}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                            disabled={item.stock === 0}
                            className="w-20 h-8 rounded border border-input bg-background px-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              href={`/admin/stores/${storeId}/inventory`}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={() => setShowConfirmModal(true)}
                                disabled={!targetStoreId || selectedProducts.size === 0 || !transferReason || transferStock.isPending}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              Review Transfer
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-lg w-full">
              <h2 className="text-xl font-bold text-foreground mb-4">Confirm Stock Transfer</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium text-foreground">{store.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium text-foreground">
                    {stores.find(s => s.id === targetStoreId)?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Products to Transfer</p>
                  <p className="font-medium text-foreground">
                    {selectedProducts.size} products, {totalItemsToTransfer} total items
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-sm text-foreground">{transferReason}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action will move inventory between stores and cannot be undone. 
                  Please verify all details before confirming.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleTransfer();
                    setShowConfirmModal(false);
                  }}
                  disabled={transferStock.isPending}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                                      {transferStock.isPending ? "Processing..." : "Confirm Transfer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreTransferPage; 