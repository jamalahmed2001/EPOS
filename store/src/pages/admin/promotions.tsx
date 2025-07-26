import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { z } from "zod";

const promoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

const AdminPromotionsPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "expired" | "all">("active");

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    expiresAt: "",
    isActive: true,
  });

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

  const { data: promoCodes, refetch } = api.admin.getPromoCodes.useQuery({ status: activeTab });
  
  const createPromoCode = api.admin.createPromoCode.useMutation({
    onSuccess: () => {
      setIsCreating(false);
      resetForm();
      void refetch();
    },
  });

  const updatePromoCode = api.admin.updatePromoCode.useMutation({
    onSuccess: () => {
      setEditingId(null);
      resetForm();
      void refetch();
    },
  });

  const deletePromoCode = api.admin.deletePromoCode.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      expiresAt: "",
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = promoCodeSchema.parse({
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt || undefined,
      });
      
      if (editingId) {
        updatePromoCode.mutate({ id: editingId, ...validatedData });
      } else {
        createPromoCode.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors[0]?.message);
      }
    }
  };

  const handleEdit = (promoCode: any) => {
    setEditingId(promoCode.id);
    setFormData({
      code: promoCode.code,
      description: promoCode.description || "",
      discountType: promoCode.discountType,
      discountValue: Number(promoCode.discountValue),
      minOrderValue: promoCode.minOrderValue ? Number(promoCode.minOrderValue) : 0,
      maxDiscount: 0, // TODO: Add maxDiscount to schema
      usageLimit: promoCode.usageLimit || 0,
      expiresAt: promoCode.expiresAt ? new Date(promoCode.expiresAt).toISOString().split('T')[0] ?? "" : "",
      isActive: promoCode.isActive,
    });
    setIsCreating(true);
  };

  const getDiscountDisplay = (promoCode: any) => {
    if (promoCode.discountType === "PERCENTAGE") {
      return `${promoCode.discountValue}%`;
    } else {
      return `£${Number(promoCode.discountValue).toFixed(2)}`;
    }
  };

  return (
    <>
      <Head>
        <title>Promotions Management - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-primary hover:text-primary/80">
                  ← Back
                </Link>
                <h1 className="text-xl font-bold text-foreground">Promotions & Coupons</h1>
              </div>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingId(null);
                  resetForm();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Promo Code
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Create/Edit Form */}
          {isCreating && (
            <div className="mb-8 bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {editingId ? "Edit Promo Code" : "Create New Promo Code"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-foreground mb-1">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="discountType" className="block text-sm font-medium text-foreground mb-1">
                      Discount Type
                    </label>
                    <select
                      id="discountType"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="discountValue" className="block text-sm font-medium text-foreground mb-1">
                      Discount Value {formData.discountType === "PERCENTAGE" ? "(%)" : "(£)"}
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      min="0"
                      step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="minOrderValue" className="block text-sm font-medium text-foreground mb-1">
                      Min Order Value (£)
                    </label>
                    <input
                      type="number"
                      id="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {formData.discountType === "PERCENTAGE" && (
                    <div>
                      <label htmlFor="maxDiscount" className="block text-sm font-medium text-foreground mb-1">
                        Max Discount (£)
                      </label>
                      <input
                        type="number"
                        id="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="usageLimit" className="block text-sm font-medium text-foreground mb-1">
                      Usage Limit (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      id="usageLimit"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                      min="0"
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-foreground mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="expiresAt"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="20% off all e-liquids"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                    Active (code can be used immediately)
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createPromoCode.isPending || updatePromoCode.isPending}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium disabled:opacity-50 transition-colors"
                  >
                    {editingId ? "Update Code" : "Create Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex -mb-px">
              {["active", "expired", "all"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Promo Codes Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Min Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {promoCodes?.map((promoCode) => (
                    <tr key={promoCode.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-foreground">{promoCode.code}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {promoCode.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-medium text-foreground">
                          {getDiscountDisplay(promoCode)}
                        </span>
                        {/* TODO: Add maxDiscount to schema
                        {promoCode.maxDiscount && (
                          <span className="text-muted-foreground ml-1">
                            (max £{Number(promoCode.maxDiscount).toFixed(2)})
                          </span>
                        )} */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {promoCode.minOrderValue ? `£${Number(promoCode.minOrderValue).toFixed(2)}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {promoCode.currentUsage || 0} / {promoCode.usageLimit || "∞"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          promoCode.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {promoCode.isActive ? "Active" : "Inactive"}
                        </span>
                        {promoCode.expiresAt && (
                          <span className="text-xs text-muted-foreground ml-2">
                            Expires {new Date(promoCode.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(promoCode)}
                          className="text-primary hover:text-primary/80 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this promo code?")) {
                              deletePromoCode.mutate({ id: promoCode.id });
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {(!promoCodes || promoCodes.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No promo codes found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPromotionsPage; 