import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { loadStripe } from "@stripe/stripe-js";

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "GB",
  });

  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "GB",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  // Get cart data
  const { data: cart } = api.cart.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: cartSummary } = api.cart.getSummary.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const createOrder = api.checkout.createOrder.useMutation();
  const createPaymentIntent = api.checkout.createPaymentIntent.useMutation();

  // If not authenticated, redirect to sign in
  if (status === "unauthenticated") {
    void router.push("/auth/signin?callbackUrl=/checkout");
    return null;
  }

  if (!cart?.items.length) {
    return (
      <>
        <Head>
          <title>Checkout - Ministry of Vapes</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Create the order
      const order = await createOrder.mutateAsync({
        shippingAddress,
        billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
      });

      if (paymentMethod === "card") {
        // Create Stripe payment intent
        const { clientSecret } = await createPaymentIntent.mutateAsync({
          orderId: order.orderId,
        });

        // Redirect to Stripe checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) throw new Error("Stripe failed to load");

        // This would be filled by Stripe Elements in a real implementation
        // For now, just redirect to success page
        // const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);

        // if (stripeError) {
        //   throw new Error(stripeError.message);
        // }
      }

      // Redirect to success page
              await router.push(`/checkout/success?orderId=${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout - Ministry of Vapes</title>
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "shipping" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Shipping</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${
                step !== "shipping" ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center ${
                step === "payment" ? "text-primary" : step === "review" ? "text-primary" : "text-muted-foreground"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "payment" || step === "review" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Payment</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${
                step === "review" ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center ${step === "review" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "review" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Shipping Form */}
              {step === "shipping" && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={shippingAddress.email}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="line1" className="block text-sm font-medium text-foreground mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="line1"
                        required
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
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
                        value={shippingAddress.line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
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
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
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
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                  </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Form */}
              {step === "payment" && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Payment Method</h2>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value as "card")}
                          className="text-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) => setPaymentMethod(e.target.value as "paypal")}
                          className="text-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">PayPal</p>
                          <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Billing Address</h3>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={billingAddress.sameAsShipping}
                          onChange={(e) => setBillingAddress({ ...billingAddress, sameAsShipping: e.target.checked })}
                          className="text-primary"
                        />
                        <span className="text-sm text-foreground">Same as shipping address</span>
                      </label>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep("shipping")}
                        className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Review Order
                      </button>
                    </div>
                  </form>
                  </div>
                )}

              {/* Review Order */}
              {step === "review" && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Review Your Order</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-foreground mb-2">Shipping Address</h3>
                        <p className="text-sm text-muted-foreground">
                          {shippingAddress.name}<br />
                          {shippingAddress.line1}<br />
                          {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                          {shippingAddress.city}, {shippingAddress.postalCode}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-2">Payment Method</h3>
                        <p className="text-sm text-muted-foreground">
                          {paymentMethod === "card" ? "Credit/Debit Card" : "PayPal"}
                        </p>
              </div>

              <div>
                        <h3 className="font-medium text-foreground mb-2">Order Items</h3>
                        <div className="space-y-3">
                          {cart?.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              {item.product.images?.[0] && (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × £{Number(item.product.price).toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium text-foreground">
                                £{(item.quantity * Number(item.product.price)).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                        onClick={() => setStep("payment")}
                        className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isLoading}
                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isLoading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-foreground">
                        £{(item.quantity * Number(item.product.price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">£{cartSummary?.subtotal.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">£{cartSummary?.shipping.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">£{cartSummary?.tax.toFixed(2) ?? "0.00"}</span>
                  </div>
                  {cartSummary && cartSummary.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-£{cartSummary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">£{cartSummary?.total.toFixed(2) ?? "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage; 