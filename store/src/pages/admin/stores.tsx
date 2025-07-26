import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";
import { z } from "zod";

const storeFormSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "URL slug is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("GB"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  latitude: z.number(),
  longitude: z.number(),
  managerId: z.string().optional(),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }),
    tuesday: z.object({ open: z.string(), close: z.string() }),
    wednesday: z.object({ open: z.string(), close: z.string() }),
    thursday: z.object({ open: z.string(), close: z.string() }),
    friday: z.object({ open: z.string(), close: z.string() }),
    saturday: z.object({ open: z.string(), close: z.string() }),
    sunday: z.object({ open: z.string(), close: z.string() }),
  }),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

const AdminStoresPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // API queries
  const { data: stores, refetch: refetchStores } = api.admin.getStores.useQuery();
  
  const { data: selectedStoreDetails } = api.admin.getStoreById.useQuery(
    { id: selectedStore! },
    { enabled: !!selectedStore }
  );

  const { data: storeStats } = api.admin.getStoreStats.useQuery(
    { storeId: selectedStore!, dateRange: "month" },
    { enabled: !!selectedStore }
  );

  // Mutations
  const createStore = api.admin.createStore.useMutation({
    onSuccess: () => {
      void refetchStores();
      setIsAddingStore(false);
    },
  });

  const updateStore = api.admin.updateStore.useMutation({
    onSuccess: () => {
      void refetchStores();
      setIsEditingStore(false);
    },
  });

  // Check admin access
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

  // Filter stores based on search and status
  const filteredStores = stores?.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && store.status === "ACTIVE") ||
                         (filterStatus === "inactive" && store.status !== "ACTIVE");
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAddStore = (data: StoreFormData) => {
    createStore.mutate(data);
  };

  const handleEditStore = (data: Partial<StoreFormData> & { id: string }) => {
    updateStore.mutate(data);
  };

  const handleToggleStatus = (storeId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStore.mutate({ id: storeId, status: newStatus });
  };

  return (
    <>
      <Head>
        <title>Store Management - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-xl font-bold text-foreground">Store Management</h1>
              </div>
              <button
                onClick={() => setIsAddingStore(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Store
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Stores</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Store Grid/List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className={`rounded-xl border bg-card p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedStore === store.id ? "border-primary" : "border-border"
                  }`}
                  onClick={() => setSelectedStore(store.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{store.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{store.address}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        store.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : store.status === "MAINTENANCE"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {store.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Manager</p>
                      <p className="font-medium text-foreground">{store.manager?.name || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff</p>
                      <p className="font-medium text-foreground">{store.staff.length} members</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-medium text-foreground">{store._count.orders}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-muted-foreground">{store.phone}</span>
                    <span className="text-muted-foreground mx-2">•</span>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-muted-foreground">{store.email}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Store Details */}
            {selectedStoreDetails && storeStats && (
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-border bg-card p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Store Details</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingStore(true)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(selectedStoreDetails.id, selectedStoreDetails.status)}
                        className={`p-2 rounded-lg ${
                          selectedStoreDetails.status === "ACTIVE"
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Store Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                      <p className="text-lg font-semibold text-foreground">
                        £{storeStats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Avg Order Value</p>
                      <p className="text-lg font-semibold text-foreground">
                        £{storeStats.avgOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Inventory Value</p>
                      <p className="text-lg font-semibold text-foreground">
                        £{storeStats.inventoryValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Low Stock Items</p>
                      <p className="text-lg font-semibold text-foreground">
                        {storeStats.lowStockItems}
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Opening Hours</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedStoreDetails.operatingHours as Record<string, { open: string; close: string }>).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{day}</span>
                          <span className="font-medium text-foreground">
                            {hours.open === "Closed" ? "Closed" : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Link 
                      href={`/admin/stores/${selectedStoreDetails.id}/inventory`}
                      className="block w-full h-10 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors text-center leading-10"
                    >
                      View Inventory
                    </Link>
                    <Link 
                      href={`/admin/stores/${selectedStoreDetails.id}/staff`}
                      className="block w-full h-10 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors text-center leading-10"
                    >
                      Manage Staff
                    </Link>
                    <Link 
                      href={`/admin/stores/${selectedStoreDetails.id}/reports`}
                      className="block w-full h-10 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors text-center leading-10"
                    >
                      Sales Reports
                    </Link>
                    <Link 
                      href={`/admin/stores/${selectedStoreDetails.id}/transfer`}
                      className="block w-full h-10 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors text-center leading-10"
                    >
                      Transfer Stock
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Stores</p>
              <p className="text-2xl font-bold text-foreground">{stores?.length || 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Active Stores</p>
              <p className="text-2xl font-bold text-foreground">
                {stores?.filter(s => s.status === "ACTIVE").length || 0}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold text-foreground">
                {stores?.reduce((acc, store) => acc + store.staff.length, 0) || 0}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">
                {stores?.reduce((acc, store) => acc + store._count.orders, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Add/Edit Store Modal */}
        {(isAddingStore || isEditingStore) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-foreground mb-6">
                {isAddingStore ? "Add New Store" : "Edit Store"}
              </h2>
              {/* Form would go here - simplified for brevity */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddingStore(false);
                    setIsEditingStore(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle form submission
                    setIsAddingStore(false);
                    setIsEditingStore(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
                >
                  {isAddingStore ? "Add Store" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminStoresPage; 