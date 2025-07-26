import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const AddressesPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "GB",
    phone: "",
    isDefault: false,
  });

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.push("/auth/signin?callbackUrl=/account/addresses");
    return null;
  }

  const { data: addresses, isPending } = api.address.getUserAddresses.useQuery();
  const utils = api.useContext();

  const createAddress = api.address.create.useMutation({
    onSuccess: () => {
      void utils.address.getUserAddresses.invalidate();
      setIsAdding(false);
      resetForm();
    },
  });

  const updateAddress = api.address.update.useMutation({
    onSuccess: () => {
      void utils.address.getUserAddresses.invalidate();
      setIsEditing(null);
      resetForm();
    },
  });

  const deleteAddress = api.address.delete.useMutation({
    onSuccess: () => {
      void utils.address.getUserAddresses.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "GB",
      phone: "",
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await updateAddress.mutateAsync({
        id: isEditing,
        ...formData,
      });
    } else {
      await createAddress.mutateAsync(formData);
    }
  };

  const handleEdit = (address: any) => {
    setFormData({
      name: address.name,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setIsEditing(address.id);
    setIsAdding(true);
  };

  return (
    <>
      <Head>
        <title>Manage Addresses - Ministry of Vapes</title>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Addresses</h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your shipping addresses
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setIsEditing(null);
                  resetForm();
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add New Address
              </button>
            </div>
          </div>

          {/* Address Form */}
          {isAdding && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {isEditing ? "Edit Address" : "Add New Address"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="line1" className="block text-sm font-medium text-foreground mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="line1"
                    required
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="line2" className="block text-sm font-medium text-foreground mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="line2"
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="text-primary"
                    />
                    <span className="text-sm text-foreground">Set as default address</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(null);
                      resetForm();
                    }}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAddress.isPending || updateAddress.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isEditing ? "Update" : "Add"} Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {isPending ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : addresses && addresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`rounded-lg border ${
                    address.isDefault ? "border-primary" : "border-border"
                  } bg-card p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{address.name}</h3>
                      {address.isDefault && (
                        <span className="text-xs text-primary">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={() => deleteAddress.mutate({ id: address.id })}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.line1}<br />
                    {address.line2 && <>{address.line2}<br /></>}
                    {address.city}, {address.postalCode}<br />
                    {address.country}
                    {address.phone && (
                      <>
                        <br />
                        Phone: {address.phone}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground mb-4">No addresses saved yet</p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddressesPage; 