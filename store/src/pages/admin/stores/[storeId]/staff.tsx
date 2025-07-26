import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/utils/api";

const StoreStaffPage: NextPage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const { data: session, status } = useSession();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // API queries
  const { data: store, refetch: refetchStore } = api.admin.getStoreById.useQuery(
    { id: storeId as string },
    { enabled: !!storeId }
  );

  const { data: availableStaff } = api.admin.getAvailableStaff.useQuery(
    { excludeStoreId: storeId as string },
    { enabled: showAssignModal }
  );

  // Mutations
  const assignStaff = api.admin.assignStaffToStore.useMutation({
    onSuccess: () => {
      void refetchStore();
      setShowAssignModal(false);
      setSelectedStaffId("");
    },
  });

  const removeStaff = api.admin.removeStaffFromStore.useMutation({
    onSuccess: () => {
      void refetchStore();
    },
  });

  const assignAsManager = api.admin.updateStore.useMutation({
    onSuccess: () => {
      void refetchStore();
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

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store data...</p>
      </div>
    );
  }

  // Filter staff
  const filteredStaff = store.staff.filter((staff: any) =>
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignStaff = () => {
    if (!selectedStaffId) return;
    
    assignStaff.mutate({
      userId: selectedStaffId,
      storeId: storeId as string,
    });
  };

  const handleRemoveStaff = (userId: string) => {
    if (confirm("Are you sure you want to remove this staff member from the store?")) {
      removeStaff.mutate({ userId });
    }
  };

  const handleSetManager = (userId: string) => {
    if (confirm("Are you sure you want to set this person as the store manager?")) {
      assignAsManager.mutate({
        id: storeId as string,
        managerId: userId,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{store.name} - Staff Management</title>
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
                  <h1 className="text-xl font-bold text-foreground">{store.name} - Staff</h1>
                  <p className="text-sm text-muted-foreground">{store.address}, {store.city}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Assign Staff
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Current Manager */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Store Manager</h2>
            {store.manager ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {store.manager.name?.charAt(0) || store.manager.email.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{store.manager.name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{store.manager.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Manager
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground">No manager assigned</p>
            )}
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Staff List */}
          <div className="space-y-4">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-border bg-card">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No staff assigned</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Assign Staff" to add team members to this store.
                </p>
              </div>
            ) : (
              filteredStaff.map((staff: any) => (
                <div key={staff.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                          {staff.name?.charAt(0) || staff.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{staff.name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        staff.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : staff.role === "MANAGER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {staff.role}
                      </span>
                      <div className="flex items-center gap-1">
                        {staff.id !== store.managerId && (
                          <button
                            onClick={() => handleSetManager(staff.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Set as Manager"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          title="Remove from Store"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold text-foreground">{store.staff.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Managers</p>
              <p className="text-2xl font-bold text-foreground">
                {store.staff.filter((s: any) => s.role === "MANAGER").length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Staff Members</p>
              <p className="text-2xl font-bold text-foreground">
                {store.staff.filter((s: any) => s.role === "STAFF").length}
              </p>
            </div>
          </div>
        </div>

        {/* Assign Staff Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-foreground mb-4">Assign Staff to Store</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Select Staff Member
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Choose a staff member...</option>
                    {availableStaff?.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name || staff.email} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>

                {availableStaff?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available staff members to assign. All staff are already assigned to stores.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStaffId("");
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaffId || assignStaff.isPending}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {assignStaff.isPending ? "Assigning..." : "Assign Staff"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreStaffPage; 