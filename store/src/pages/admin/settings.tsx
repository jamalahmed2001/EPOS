import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { z } from "zod";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Invalid email address"),
  storePhone: z.string().min(1, "Phone number is required"),
  storeAddress: z.string().min(1, "Address is required"),
  currency: z.string().min(1, "Currency is required"),
  taxRate: z.number().min(0).max(100),
  minimumOrderAmount: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  orderPrefix: z.string().optional(),
  enablePOS: z.boolean(),
  enableLoyalty: z.boolean(),
  enableSubscriptions: z.boolean(),
  loyaltyPointsPerPound: z.number().min(0),
  loyaltyRedemptionRate: z.number().min(0),
});

const AdminSettingsPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"general" | "commerce" | "features" | "notifications">("general");
  const [isSaving, setIsSaving] = useState(false);

  // Check admin access (only admins can access settings)
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

  // Mock settings data - in production, this would come from the API
  const [settings, setSettings] = useState({
    // General Settings
    storeName: "Ministry of Vapes",
    storeEmail: "info@ministryofvapes.com",
    storePhone: "+44 20 1234 5678",
    storeAddress: "123 Vape Street, London, UK",
    timeZone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    
    // Commerce Settings
    currency: "GBP",
    taxRate: 20,
    taxIncluded: true,
    minimumOrderAmount: 20,
    freeShippingThreshold: 50,
    orderPrefix: "MOV",
    orderNumberFormat: "PREFIX-YYYY-0000",
    
    // Feature Toggles
    enablePOS: true,
    enableLoyalty: true,
    enableSubscriptions: true,
    enableReviews: true,
    enableBlog: true,
    maintenanceMode: false,
    
    // Loyalty Settings
    loyaltyPointsPerPound: 10,
    loyaltyRedemptionRate: 100, // 100 points = £1
    loyaltyTierThresholds: {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      platinum: 10000,
    },
    
    // Notification Settings
    orderNotificationEmail: "orders@ministryofvapes.com",
    lowStockThreshold: 10,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, this would save to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings - Admin Dashboard</title>
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
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {[
                  { key: "general", label: "General", icon: "🏪" },
                  { key: "commerce", label: "Commerce", icon: "💷" },
                  { key: "features", label: "Features", icon: "⚙️" },
                  { key: "notifications", label: "Notifications", icon: "🔔" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.key
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl border border-border p-6">
                {/* General Settings Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-4">General Settings</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Store Name
                          </label>
                          <input
                            type="text"
                            value={settings.storeName}
                            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={settings.storeEmail}
                            onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={settings.storePhone}
                            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Time Zone
                          </label>
                          <select
                            value={settings.timeZone}
                            onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="America/New_York">New York (EST)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Store Address
                        </label>
                        <textarea
                          value={settings.storeAddress}
                          onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Commerce Settings Tab */}
                {activeTab === "commerce" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-4">Commerce Settings</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Currency
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="GBP">GBP (£)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.taxRate}
                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Minimum Order Amount (£)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={settings.minimumOrderAmount}
                            onChange={(e) => setSettings({ ...settings, minimumOrderAmount: parseFloat(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Free Shipping Threshold (£)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={settings.freeShippingThreshold}
                            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Order Number Prefix
                          </label>
                          <input
                            type="text"
                            value={settings.orderPrefix}
                            onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.taxIncluded}
                            onChange={(e) => setSettings({ ...settings, taxIncluded: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">Prices include tax</span>
                        </label>
                      </div>
                    </div>

                    {/* Loyalty Settings */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Loyalty Program</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Points per £1 Spent
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={settings.loyaltyPointsPerPound}
                            onChange={(e) => setSettings({ ...settings, loyaltyPointsPerPound: parseInt(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Points Required for £1 Discount
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={settings.loyaltyRedemptionRate}
                            onChange={(e) => setSettings({ ...settings, loyaltyRedemptionRate: parseInt(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === "features" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-4">Feature Toggles</h2>
                      <div className="space-y-4">
                        {[
                          { key: "enablePOS", label: "Point of Sale System", description: "Enable in-store POS functionality" },
                          { key: "enableLoyalty", label: "Loyalty Program", description: "Enable customer loyalty points and rewards" },
                          { key: "enableSubscriptions", label: "Subscriptions", description: "Allow recurring product subscriptions" },
                          { key: "enableReviews", label: "Product Reviews", description: "Allow customers to review products" },
                          { key: "enableBlog", label: "Blog", description: "Enable blog and content marketing features" },
                          { key: "maintenanceMode", label: "Maintenance Mode", description: "Temporarily disable the storefront" },
                        ].map((feature) => (
                          <label key={feature.key} className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[feature.key as keyof typeof settings] as boolean}
                              onChange={(e) => setSettings({ ...settings, [feature.key]: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{feature.label}</p>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Order Notification Email
                          </label>
                          <input
                            type="email"
                            value={settings.orderNotificationEmail}
                            onChange={(e) => setSettings({ ...settings, orderNotificationEmail: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Receive notifications when new orders are placed
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={settings.lowStockThreshold}
                            onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Alert when product stock falls below this level
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.enableEmailNotifications}
                              onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Enable email notifications</span>
                          </label>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.enableSMSNotifications}
                              onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Enable SMS notifications (requires setup)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettingsPage; 