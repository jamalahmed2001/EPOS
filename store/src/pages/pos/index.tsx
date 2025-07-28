import { useState, useEffect, useRef } from "react";
import { type NextPage } from "next";
import { type ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { type NextPageWithLayout } from "@/pages/_app";

interface POSCartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  sku: string;
  barcode?: string;
  stock: number;
  image?: string;
  discount: number;
  discountType: "percentage" | "fixed";
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  tier: string;
  completedOrders: number;
}

interface Payment {
  method: "cash" | "card" | "terminal";
  amount: number;
  amountReceived?: number; // For cash payments
}

const POSPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Core state
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<"products" | "customer" | "payment">("products");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  
  // Transaction state
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [promoCode, setPromoCode] = useState("");
  
  // Search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showQuickRegisterModal, setShowQuickRegisterModal] = useState(false);
  const [quickRegisterData, setQuickRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Store and location state
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [showStoreSelectionModal, setShowStoreSelectionModal] = useState(true);

  // Check permissions
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      void router.push("/");
    }
  }, [status, session, router]);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable GPS.");
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // API queries
  const { data: stores } = api.pos.getStores.useQuery();
  
  const { data: searchResults } = api.product.getAll.useQuery(
    { search: searchQuery.trim(), limit: 8 },
    { 
      enabled: searchQuery.trim().length > 0
    }
  );

  // Show dropdown when search results are available
  useEffect(() => {
    if (searchResults?.products && searchQuery.trim()) {
      setShowProductDropdown(true);
    }
  }, [searchResults, searchQuery]);

  const { data: categories } = api.product.getCategories.useQuery();

  const { data: customerSearchResults, refetch: refetchCustomers } = api.pos.searchCustomers.useQuery(
    { query: customerSearchQuery.trim() },
    { enabled: false }
  );

  const { data: todayStats } = api.pos.getTodayStats.useQuery();

  // Mutations
  const createOrder = api.pos.createOrder.useMutation({
    onSuccess: (data) => {
      setLastOrder(data.order);
      setShowReceiptModal(true);
      handleClearCart();
      setActiveTab("products");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const registerCustomer = api.pos.registerCustomer.useMutation({
    onSuccess: (customer) => {
      setSelectedCustomer({
        id: customer.id,
        name: customer.name || "",
        email: customer.email,
        phone: customer.phone || "",
        loyaltyPoints: customer.loyaltyPoints,
        tier: "BRONZE",
        completedOrders: 0,
      });
      setShowQuickRegisterModal(false);
      setQuickRegisterData({ name: "", email: "", phone: "" });
    },
  });

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderDiscountAmount = discountType === "percentage" 
    ? (subtotal * discount) / 100 
    : Math.min(discount, subtotal);
  const tax = Math.max(0, (subtotal - orderDiscountAmount) * 0.2);
  const total = Math.max(0, subtotal - orderDiscountAmount + tax);
  
  // Payment calculations
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = Math.max(0, total - totalPaid);
  const cashPayments = payments.filter(p => p.method === "cash");
  const totalCashReceived = cashPayments.reduce((sum, payment) => 
    sum + (payment.amountReceived ?? payment.amount), 0
  );
  const totalCashRequired = cashPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const change = totalCashReceived - totalCashRequired;

  // Handlers
  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (product.trackInventory && existingItem.quantity >= product.stock) {
        alert(`Only ${product.stock} items available in stock`);
        return;
      }
      setCartItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.trackInventory && product.stock < 1) {
        alert("Product out of stock");
        return;
      }
      setCartItems(prev => [...prev, {
          productId: product.id,
          name: product.name,
          price: product.price,
        originalPrice: product.price,
          quantity: 1,
          sku: product.sku,
          barcode: product.barcode,
        stock: product.stock,
        image: product.images?.[0]?.url,
        discount: 0,
        discountType: "percentage",
      }]);
    }
    
    setSearchQuery("");
    setShowProductDropdown(false);
    searchInputRef.current?.focus();
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(items => items.filter(item => item.productId !== productId));
    } else {
      const item = cartItems.find(item => item.productId === productId);
      if (item && item.stock < quantity) {
        alert(`Only ${item.stock} items available in stock`);
        return;
      }
      setCartItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setPromoCode("");
    setSelectedCustomer(null);
    setPayments([]);
  };

  const handleItemDiscount = (productId: string, itemDiscount: number, itemDiscountType: "percentage" | "fixed") => {
    setCartItems(items =>
      items.map(item => {
        if (item.productId === productId) {
          let newPrice = item.originalPrice;
          if (itemDiscountType === "percentage") {
            newPrice = item.originalPrice * (1 - itemDiscount / 100);
          } else {
            newPrice = Math.max(0, item.originalPrice - itemDiscount);
          }
          return {
            ...item,
            discount: itemDiscount,
            discountType: itemDiscountType,
            price: newPrice,
          };
        }
        return item;
      })
    );
  };

  const handleCustomerSearch = async () => {
    if (customerSearchQuery.trim()) {
      await refetchCustomers();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    if (!selectedStoreId) {
      alert("Please select a store first");
      setShowStoreSelectionModal(true);
      return;
    }
    
    if (!userLocation) {
      alert("Unable to verify your location. Please enable GPS.");
      return;
    }
    
    if (Math.abs(totalPaid - total) > 0.01) {
      alert(`Payment total (£${totalPaid.toFixed(2)}) does not match order total (£${total.toFixed(2)})`);
      return;
    }

    // Validate cash payments
    for (const payment of payments) {
      if (payment.method === "cash" && (!payment.amountReceived || payment.amountReceived < payment.amount)) {
        alert("Cash payments must include amount received and it must be >= payment amount");
        return;
      }
    }
    
    createOrder.mutate({
      customerId: selectedCustomer?.id,
      storeId: selectedStoreId,
      orderLatitude: userLocation.lat,
      orderLongitude: userLocation.lng,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      discount,
      discountType,
      payments,
      promoCode: promoCode || undefined,
    });
  };

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Try to find by barcode/SKU first
      const product = searchResults?.products.find(
        p => p.barcode === searchQuery.trim() || p.sku === searchQuery.trim()
      );
      if (product) {
        handleAddToCart(product);
      }
    }
    if (e.key === "Escape") {
      setShowProductDropdown(false);
    }
  };

  // Quick actions
  const handleQuickDiscount = (percentage: number) => {
    setDiscount(percentage);
    setDiscountType("percentage");
  };

  // Payment handlers
  const addPayment = (method: "cash" | "card" | "terminal", amount: number) => {
    if (amount <= 0 || amount > remainingAmount) return;
    
    const newPayment: Payment = {
      method,
      amount,
      ...(method === "cash" && { amountReceived: amount })
    };
    
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (index: number, updates: Partial<Payment>) => {
    setPayments(prev => prev.map((payment, i) => 
      i === index ? { ...payment, ...updates } : payment
    ));
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const addQuickPayment = (method: "cash" | "card" | "terminal") => {
    if (remainingAmount > 0) {
      addPayment(method, remainingAmount);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role === "CUSTOMER") {
    return null;
  }

  return (
    <>
      <Head>
        <title>Point of Sale - Ministry of Vapes</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">POS Terminal</h1>
              {selectedStoreId && stores && (
                <button
                  onClick={() => setShowStoreSelectionModal(true)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    {stores.find(s => s.id === selectedStoreId)?.name || "Select Store"}
                  </span>
                </button>
              )}
              <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                <span>Staff: {session?.user?.name}</span>
                {todayStats && (
                  <>
                    <span>•</span>
                    <span>Sales: £{todayStats.totalRevenue.toFixed(2)}</span>
                    <span>•</span>
                    <span>Orders: {todayStats.orderCount}</span>
                  </>
                )}
              </div>
            </div>
                <button
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Exit POS
                </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mobile Tabs */}
            <div className="lg:hidden border-b border-border bg-card/30 flex-shrink-0">
              <div className="flex">
                {[
                  { key: "products", label: "Products" },
                  { key: "customer", label: "Customer" },
                  { key: "payment", label: "Payment" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="relative">
              <input
                  ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeInput}
                  onFocus={() => searchQuery && setShowProductDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                  placeholder="Scan barcode, search products..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Product Search Dropdown */}
                {showProductDropdown && searchResults?.products && searchResults.products.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.products.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                        className="w-full p-3 text-left hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-muted"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{product.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>£{product.price}</span>
                              <span>•</span>
                              <span>SKU: {product.sku}</span>
                              {product.trackInventory && (
                                <>
                                  <span>•</span>
                                  <span className={product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"}>
                                    {product.stock} in stock
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Cart is empty</p>
                  <p className="text-muted-foreground">Scan a barcode or search for products to get started</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, 0)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.discount > 0 ? (
                              <>
                                <span className="line-through">£{item.originalPrice.toFixed(2)}</span>
                                <span className="text-green-600 font-medium">£{item.price.toFixed(2)} each</span>
                                <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">
                                  -{item.discountType === "percentage" ? `${item.discount}%` : `£${item.discount}`}
                                </span>
                              </>
                            ) : (
                              <span>£{item.price.toFixed(2)} each</span>
                            )}
                            <span>• SKU: {item.sku}</span>
                          </div>
                          
                          {/* Item Discount Controls */}
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              value={item.discount || ""}
                              onChange={(e) => handleItemDiscount(item.productId, parseFloat(e.target.value) || 0, item.discountType)}
                              placeholder="0"
                              className="w-16 h-6 px-2 text-xs border border-input rounded bg-background focus:border-primary focus:outline-none"
                              min="0"
                              max={item.discountType === "percentage" ? 100 : item.originalPrice}
                              step={item.discountType === "percentage" ? 1 : 0.01}
                            />
                            <select
                              value={item.discountType}
                              onChange={(e) => {
                                const newType = e.target.value as "percentage" | "fixed";
                                handleItemDiscount(item.productId, item.discount, newType);
                              }}
                              className="h-6 px-2 text-xs border border-input rounded bg-background focus:border-primary focus:outline-none"
                            >
                              <option value="percentage">%</option>
                              <option value="fixed">£</option>
                            </select>
                            <span className="text-xs text-muted-foreground">discount</span>
                      </div>

                          <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                        </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center text-sm border border-input rounded-lg bg-background focus:border-primary focus:outline-none"
                                min="0"
                                max={item.stock}
                              />
                        <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-foreground transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                        </button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">£{(item.price * item.quantity).toFixed(2)}</p>
                              {item.discount > 0 && (
                                <p className="text-xs text-green-600">
                                  Saved: £{((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Desktop / Mobile Modals */}
          <div className="lg:w-96 lg:border-l lg:border-border lg:bg-card/30 lg:flex lg:flex-col lg:min-h-0">
            {/* Customer Section */}
            <div className={`p-4 border-b border-border flex-shrink-0 ${activeTab !== "customer" ? "hidden lg:block" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Customer</h2>
                {selectedCustomer && (
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                    Clear
                    </button>
                )}
              </div>
              
              {selectedCustomer ? (
                <div className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{selectedCustomer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {selectedCustomer.tier}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedCustomer.loyaltyPoints} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedCustomer.completedOrders >= 10 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800 font-medium">
                        🎉 Eligible for 20% loyalty discount!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full h-16 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Customer
                </button>
              )}
            </div>

            {/* Discounts & Promo */}
            <div className={`p-4 border-b border-border flex-shrink-0 ${activeTab !== "payment" ? "hidden lg:block" : ""}`}>
              <h2 className="font-semibold text-foreground mb-3">Order Discount</h2>
              
              <div className="space-y-3">
                {/* Quick Discount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => handleQuickDiscount(percentage)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        discount === percentage && discountType === "percentage"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>

                {/* Custom Discount */}
              <div className="flex gap-2">
                <input
                  type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                    className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:border-primary focus:outline-none"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">£</option>
                </select>
              </div>

                {/* Promo Code */}
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className={`p-4 border-b border-border flex-shrink-0 ${activeTab !== "payment" ? "hidden lg:block" : ""}`}>
              <h2 className="font-semibold text-foreground mb-3">Order Summary</h2>
              
                              <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">£{subtotal.toFixed(2)}</span>
                  </div>
                  {/* Show item discounts total */}
                  {cartItems.some(item => item.discount > 0) && (
                    <div className="flex justify-between text-green-600">
                      <span>Item Discounts</span>
                      <span>-£{cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  )}
                  {orderDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Order Discount ({discountType === "percentage" ? `${discount}%` : "Fixed"})</span>
                      <span>-£{orderDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (20%)</span>
                    <span className="text-foreground">£{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">£{total.toFixed(2)}</span>
                  </div>
                </div>
            </div>

            {/* Payment Section */}
            <div className={`p-4 flex-shrink-0 ${activeTab !== "payment" ? "hidden lg:block" : ""}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Payments</h2>
                  <div className="text-sm text-muted-foreground">
                    Remaining: £{remainingAmount.toFixed(2)}
                  </div>
                </div>

                {/* Current Payments */}
                {payments.length > 0 && (
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div key={index} className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between mb-2">
                                                     <div className="flex items-center gap-2">
                             <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               {payment.method === "card" ? (
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                               ) : payment.method === "cash" ? (
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                               ) : (
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                               )}
                             </svg>
                            <span className="font-medium text-foreground capitalize">{payment.method}</span>
                          </div>
                          <button
                            onClick={() => removePayment(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">Amount</label>
                            <input
                              type="number"
                              value={payment.amount}
                              onChange={(e) => updatePayment(index, { amount: parseFloat(e.target.value) || 0 })}
                              step="0.01"
                              min="0"
                              max={payment.amount + remainingAmount}
                              className="w-full h-8 px-2 rounded border border-input bg-background text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                          
                          {payment.method === "cash" && (
                            <div className="flex-1">
                              <label className="block text-xs text-muted-foreground mb-1">Received</label>
                              <input
                                type="number"
                                value={payment.amountReceived || ""}
                                onChange={(e) => updatePayment(index, { amountReceived: parseFloat(e.target.value) || 0 })}
                                step="0.01"
                                min={payment.amount}
                                className="w-full h-8 px-2 rounded border border-input bg-background text-sm focus:border-primary focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Payment Buttons */}
                {remainingAmount > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addQuickPayment("card")}
                        className="h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center gap-2 text-foreground transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Add Card
                      </button>
                      <button
                        onClick={() => addQuickPayment("cash")}
                        className="h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center gap-2 text-foreground transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add Cash
                      </button>
                    </div>
                    
                    <button
                      onClick={() => addQuickPayment("terminal")}
                      className="w-full h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center gap-2 text-foreground transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Add Terminal Payment
                    </button>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        Still need: £{remainingAmount.toFixed(2)}
                      </div>
                    </div>
                  </>
                )}

                {/* Payment Summary */}
                {payments.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span>£{totalPaid.toFixed(2)}</span>
                    </div>
                    {change > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Change:</span>
                        <span>£{change.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`p-4 space-y-2 lg:mt-auto flex-shrink-0 ${activeTab !== "payment" ? "hidden lg:block" : ""}`}>
              <button
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
                className="w-full h-12 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || createOrder.isPending}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg"
              >
                {createOrder.isPending ? "Processing..." : `Charge £${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>

        {/* Customer Search Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Customer Lookup</h3>
                
                <div className="space-y-4">
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomerSearch()}
                    placeholder="Search name, email, or scan QR code..."
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              
              {customerSearchResults && customerSearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                  {customerSearchResults.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer({
                          id: customer.id,
                              name: customer.name || "",
                              email: customer.email,
                              phone: customer.phone || "",
                          loyaltyPoints: customer.loyaltyPoints,
                              tier: customer.tier,
                              completedOrders: customer.completedOrders,
                        });
                            setShowCustomerModal(false);
                        setCustomerSearchQuery("");
                      }}
                          className="w-full p-3 text-left rounded-xl hover:bg-muted/50 transition-colors border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {customer.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{customer.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.loyaltyPoints} points • {customer.tier}
                              </p>
                            </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
                  
                  <div className="flex gap-3">
                <button
                  onClick={() => {
                        setShowCustomerModal(false);
                    setCustomerSearchQuery("");
                  }}
                      className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                      onClick={handleCustomerSearch}
                      disabled={!customerSearchQuery.trim()}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  Search
                </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      setShowQuickRegisterModal(true);
                    }}
                    className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    + Register New Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && lastOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground">Order #{lastOrder.orderNumber}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground">£{lastOrder.total}</span>
                  </div>
                  {lastOrder.metadata?.payments && lastOrder.metadata.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm text-green-600">
                      <span className="capitalize">{payment.method}</span>
                      <span>£{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {lastOrder.metadata?.change > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Change</span>
                      <span>£{lastOrder.metadata.change.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Close
                  </button>
              <button
                onClick={() => {
                  // Create receipt content
                  const receipt = `
                    <html>
                      <head>
                        <title>Receipt - Order #${lastOrder.orderNumber}</title>
                        <style>
                          body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; }
                          h1 { text-align: center; font-size: 20px; margin: 10px 0; }
                          .header { text-align: center; margin-bottom: 20px; }
                          .divider { border-top: 1px dashed #000; margin: 10px 0; }
                          .item { display: flex; justify-content: space-between; margin: 5px 0; }
                          .total { font-weight: bold; font-size: 16px; }
                          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>Ministry of Vapes</h1>
                          <p>${stores?.find(s => s.id === selectedStoreId)?.name || ""}</p>
                          <p>${new Date().toLocaleString()}</p>
                        </div>
                        <div class="divider"></div>
                        ${lastOrder.items.map((item: any) => `
                          <div class="item">
                            <span>${item.product.name} x${item.quantity}</span>
                            <span>£${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        `).join("")}
                        <div class="divider"></div>
                        <div class="item">
                          <span>Subtotal:</span>
                          <span>£${lastOrder.subtotal.toFixed(2)}</span>
                        </div>
                        ${lastOrder.discount > 0 ? `
                          <div class="item">
                            <span>Discount:</span>
                            <span>-£${lastOrder.discount.toFixed(2)}</span>
                          </div>
                        ` : ""}
                        <div class="item">
                          <span>Tax:</span>
                          <span>£${lastOrder.tax.toFixed(2)}</span>
                        </div>
                        <div class="divider"></div>
                        <div class="item total">
                          <span>Total:</span>
                          <span>£${lastOrder.total.toFixed(2)}</span>
                        </div>
                        ${lastOrder.metadata?.payments ? lastOrder.metadata.payments.map((payment: any) => `
                          <div class="item">
                            <span class="capitalize">${payment.method}:</span>
                            <span>£${payment.amount.toFixed(2)}</span>
                          </div>
                          ${payment.method === "cash" && payment.amountReceived > payment.amount ? `
                            <div class="item">
                              <span>Cash Received:</span>
                              <span>£${payment.amountReceived.toFixed(2)}</span>
                            </div>
                          ` : ""}
                        `).join("") : ""}
                        ${lastOrder.metadata?.change > 0 ? `
                          <div class="item">
                            <span>Change:</span>
                            <span>£${lastOrder.metadata.change.toFixed(2)}</span>
                          </div>
                        ` : ""}
                        <div class="divider"></div>
                        <div class="footer">
                          <p>Order #${lastOrder.orderNumber}</p>
                          <p>Thank you for your purchase!</p>
                          <p>${stores?.find(s => s.id === selectedStoreId)?.email || ""}</p>
                        </div>
                      </body>
                    </html>
                  `;
                  
                  // Open print window
                  const printWindow = window.open("", "_blank", "width=400,height=600");
                  if (printWindow) {
                    printWindow.document.write(receipt);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }
                }}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                    Print Receipt
              </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Customer Registration Modal */}
        {showQuickRegisterModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Customer Registration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={quickRegisterData.name}
                    onChange={(e) => setQuickRegisterData({ ...quickRegisterData, name: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={quickRegisterData.email}
                    onChange={(e) => setQuickRegisterData({ ...quickRegisterData, email: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={quickRegisterData.phone}
                    onChange={(e) => setQuickRegisterData({ ...quickRegisterData, phone: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowQuickRegisterModal(false);
                    setQuickRegisterData({ name: "", email: "", phone: "" });
                  }}
                  className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (quickRegisterData.name && quickRegisterData.email) {
                      registerCustomer.mutate({
                        name: quickRegisterData.name,
                        email: quickRegisterData.email,
                        phone: quickRegisterData.phone || undefined,
                      });
                    }
                  }}
                  disabled={!quickRegisterData.name || !quickRegisterData.email || registerCustomer.isPending}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  {registerCustomer.isPending ? "Registering..." : "Register"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Store Selection Modal */}
        {showStoreSelectionModal && stores && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-foreground mb-4">Select Your Store</h2>
              
              {locationError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">{locationError}</p>
                </div>
              )}

              {userLocation && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    Location detected. Please select the store you're currently at.
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setShowStoreSelectionModal(false);
                    }}
                    className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 text-left transition-all"
                  >
                    <h3 className="font-medium text-foreground">{store.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {store.address}, {store.city}
                    </p>
                    {userLocation && (
                      <p className="text-xs text-primary mt-2">
                        Distance will be verified when processing orders
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* TODO: Add workingStoreId to User type
              {session?.user?.workingStoreId && (
                <button
                  onClick={() => {
                    const assignedStore = stores.find(s => s.id === session.user.workingStoreId);
                    if (assignedStore) {
                      setSelectedStoreId(assignedStore.id);
                      setShowStoreSelectionModal(false);
                    }
                  }}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
                >
                  Use My Assigned Store
                </button>
              )} */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default POSPage; 

// Disable the default layout for POS
POSPage.getLayout = (page: ReactElement) => page; 