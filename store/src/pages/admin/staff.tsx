import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { z } from "zod";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["STAFF", "MANAGER", "ADMIN"]),
  phone: z.string().optional(),
  permissions: z.array(z.string()),
});

const AdminStaffPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STAFF" as const,
    phone: "",
    permissions: [] as string[],
  });

  // Check admin access (only admins can manage staff)
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

  // Mock staff data - in production, this would come from the API
  const mockStaff = [
    {
      id: "1",
      name: "John Manager",
      email: "john@ministryofvapes.com",
      role: "MANAGER",
      phone: "+44 20 1234 5678",
      status: "ACTIVE",
      lastLogin: new Date("2024-01-25T10:30:00"),
      permissions: ["pos", "inventory", "orders", "customers"],
    },
    {
      id: "2",
      name: "Sarah Staff",
      email: "sarah@ministryofvapes.com",
      role: "STAFF",
      phone: "+44 20 1234 5679",
      status: "ACTIVE",
      lastLogin: new Date("2024-01-25T09:15:00"),
      permissions: ["pos", "orders"],
    },
    {
      id: "3",
      name: "Mike Admin",
      email: "mike@ministryofvapes.com",
      role: "ADMIN",
      phone: "+44 20 1234 5680",
      status: "ACTIVE",
      lastLogin: new Date("2024-01-24T14:20:00"),
      permissions: ["all"],
    },
  ];

  const availablePermissions = [
    { key: "pos", label: "Point of Sale", description: "Access to POS system" },
    { key: "inventory", label: "Inventory Management", description: "Manage product stock" },
    { key: "orders", label: "Order Management", description: "View and manage orders" },
    { key: "customers", label: "Customer Management", description: "View customer data" },
    { key: "reports", label: "Reports & Analytics", description: "Access to reports" },
    { key: "settings", label: "Settings", description: "Modify system settings" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = staffSchema.parse(formData);
      // In production, this would save to the API
      console.log("Save staff:", validatedData);
      setIsAddingStaff(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors[0]?.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "STAFF",
      phone: "",
      permissions: [],
    });
  };

  const handleDeactivate = (id: string) => {
    if (confirm("Are you sure you want to deactivate this staff member?")) {
      // In production, this would call the API
      console.log("Deactivate staff:", id);
    }
  };

  const handleResetPassword = (email: string) => {
    if (confirm(`Send password reset email to ${email}?`)) {
      // In production, this would call the API
      alert("Password reset email sent!");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "STAFF":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredStaff = mockStaff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Staff Management - Admin Dashboard</title>
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
                <h1 className="text-xl font-bold text-foreground">Staff Management</h1>
              </div>
              <button
                onClick={() => {
                  setIsAddingStaff(true);
                  setEditingId(null);
                  resetForm();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Staff Member
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md h-10 px-4 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Staff List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.phone && (
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {member.lastLogin.toLocaleDateString()} at {member.lastLogin.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((perm) => (
                            <span key={perm} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(member.id);
                              setFormData({
                                name: member.name,
                                email: member.email,
                                role: member.role as any,
                                phone: member.phone || "",
                                permissions: member.permissions,
                              });
                              setIsAddingStaff(true);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleResetPassword(member.email)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Reset Password
                          </button>
                          {member.status === "ACTIVE" && member.role !== "ADMIN" && (
                            <button
                              onClick={() => handleDeactivate(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStaff.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              )}
            </div>
          </div>

          {/* Add/Edit Modal */}
          {isAddingStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {editingId ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {availablePermissions.map((perm) => (
                        <label key={perm.key} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, permissions: [...formData.permissions, perm.key] });
                              } else {
                                setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.key) });
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                          />
                          <div>
                            <p className="font-medium text-sm text-foreground">{perm.label}</p>
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                    >
                      {editingId ? "Update" : "Add"} Staff Member
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingStaff(false);
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
    </>
  );
};

export default AdminStaffPage; 