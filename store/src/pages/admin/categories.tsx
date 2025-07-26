import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

const AdminCategoriesPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
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

  const { data: categories, refetch } = api.admin.getCategories.useQuery();
  
  const createCategory = api.admin.createCategory.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreating(false);
      resetForm();
    },
  });

  const updateCategory = api.admin.updateCategory.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingId(null);
      resetForm();
    },
  });

  const deleteCategory = api.admin.deleteCategory.useMutation({
    onSuccess: () => {
      void refetch();
      setShowDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parentId: "",
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = categorySchema.parse(formData);
      
      if (editingId) {
        updateCategory.mutate({
          id: editingId,
          ...validatedData,
        });
      } else {
        createCategory.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors[0]?.message);
      }
    }
  };

  const startEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || "",
    });
    setIsCreating(false);
  };

  const buildCategoryTree = (categories: any[], parentId: string | null = null): any[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id),
      }));
  };

  const renderCategoryRow = (category: any, level: number = 0) => {
    const indent = level * 24;
    
    return (
      <div key={category.id}>
        <div className="flex items-center p-4 hover:bg-muted/50 border-b border-border">
          <div className="flex-1 flex items-center" style={{ paddingLeft: `${indent}px` }}>
            {level > 0 && (
              <span className="text-muted-foreground mr-2">└</span>
            )}
            <div>
              <p className="font-medium text-foreground">{category.name}</p>
              <p className="text-sm text-muted-foreground">/{category.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {category._count?.products || 0} products
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(category)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(category.id)}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Delete"
                disabled={category._count?.products > 0 || category.children?.length > 0}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {category.children?.map((child: any) => renderCategoryRow(child, level + 1))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Category Management - Admin Dashboard</title>
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
                <h1 className="text-xl font-bold text-foreground">Category Management</h1>
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
                Add Category
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category List */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Categories</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categories?.length || 0} categories total
                  </p>
                </div>
                
                {categories && categories.length > 0 ? (
                  <div>
                    {buildCategoryTree(categories).map(category => renderCategoryRow(category))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No categories yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    {editingId ? "Edit Category" : "Create Category"}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (!editingId) {
                            setFormData(prev => ({
                              ...prev,
                              slug: generateSlug(e.target.value),
                            }));
                          }
                        }}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        pattern="[a-z0-9-]+"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL-friendly version (lowercase, hyphens only)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label htmlFor="parentId" className="block text-sm font-medium text-foreground mb-1">
                        Parent Category
                      </label>
                      <select
                        id="parentId"
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">None (Top Level)</option>
                        {categories?.filter(cat => cat.id !== editingId).map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={createCategory.isPending || updateCategory.isPending}
                        className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50 transition-colors"
                      >
                        {createCategory.isPending || updateCategory.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setEditingId(null);
                          resetForm();
                        }}
                        className="flex-1 h-10 rounded-lg bg-background border border-border hover:bg-muted text-foreground font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Delete Category?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. Make sure this category has no products or subcategories.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    deleteCategory.mutate({ id: showDeleteConfirm });
                  }}
                  disabled={deleteCategory.isPending}
                  className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {deleteCategory.isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-10 rounded-lg bg-background border border-border hover:bg-muted text-foreground font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCategoriesPage; 