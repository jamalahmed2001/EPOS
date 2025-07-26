import { useState, useEffect, useRef } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const LoyaltyPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  const { data: loyaltyAccount } = api.loyalty.getAccount.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  // TODO: Implement getTransactionHistory in loyalty router
  const transactionHistory = undefined;
  const fetchNextPage = () => {};
  const hasNextPage = false;
  const isFetchingNextPage = false;

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (loyaltyAccount?.qrCode && qrCanvasRef.current && !qrCodeGenerated) {
        try {
          const QRCode = (await import("qrcode")).default;
          await QRCode.toCanvas(qrCanvasRef.current, loyaltyAccount.qrCode, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeGenerated(true);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
        }
      }
    };

    void generateQRCode();
  }, [loyaltyAccount?.qrCode, qrCodeGenerated]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    void router.push("/auth/signin");
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "SILVER":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "GOLD":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "PLATINUM":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTierProgress = (tier: string, lifetimePoints: number) => {
    const tiers = { BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 10000 };
    const currentTierPoints = tiers[tier as keyof typeof tiers] || 0;
    const nextTierPoints = tier === "PLATINUM" ? 10000 : Object.values(tiers).find(p => p > currentTierPoints) || 10000;
    const progress = Math.min((lifetimePoints - currentTierPoints) / (nextTierPoints - currentTierPoints) * 100, 100);
    
    return { progress, nextTierPoints, currentTierPoints };
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "EARNED":
        return (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case "REDEEMED":
        return (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case "BONUS":
        return (
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
    }
  };

  const transactions = [] as any[]; // TODO: Implement when getTransactionHistory is available
  const tierProgress = loyaltyAccount ? getTierProgress(loyaltyAccount.tier, loyaltyAccount.lifetimePoints) : null;

  return (
    <>
      <Head>
        <title>Loyalty Rewards - Ministry of Vapes</title>
        <meta name="description" content="View your loyalty points, QR code, and rewards history" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/account" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Loyalty Rewards
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your points, view your QR code, and manage rewards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loyalty Overview */}
            {loyaltyAccount && (
              <div className="rounded-lg bg-card border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Your Loyalty Status
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {loyaltyAccount.points}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Points</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold border ${getTierColor(loyaltyAccount.tier)}`}
                    >
                      {loyaltyAccount.tier}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Current Tier</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {loyaltyAccount.completedOrders}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed Orders</div>
                  </div>
                </div>

                {/* Tier Progress */}
                {tierProgress && loyaltyAccount.tier !== "PLATINUM" && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress to next tier</span>
                      <span>{tierProgress.nextTierPoints - loyaltyAccount.lifetimePoints} points to go</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tierProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Discount Eligibility */}
                {loyaltyAccount.completedOrders >= 10 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-semibold">🎉 Congratulations!</p>
                        <p className="text-green-700 text-sm">You qualify for 20% off on orders over £20</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Points History
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No point transactions yet</p>
                  <p className="text-sm">Start shopping to earn loyalty points!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.points > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.points > 0 ? "+" : ""}{transaction.points}
                      </div>
                    </div>
                  ))}

                  {hasNextPage && (
                    <div className="text-center">
                      <button
                        onClick={() => void fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="inline-flex items-center rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 disabled:opacity-50"
                      >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-card border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your Loyalty QR Code
              </h2>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg border-2 border-border">
                  <canvas
                    ref={qrCanvasRef}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Show this QR code in-store to earn points and redeem rewards
                </p>
                <p className="text-xs text-muted-foreground">
                                            Code: {loyaltyAccount?.qrCode || "Loading..."}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Points</span>
                  <span className="font-semibold">{loyaltyAccount?.points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lifetime Points</span>
                  <span className="font-semibold">{loyaltyAccount?.lifetimePoints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Tier</span>
                  <span className="font-semibold">{loyaltyAccount?.tier || "BRONZE"}</span>
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Tier Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Earn 1 point per £1 spent</li>
                  <li>• 20% off after 10 completed orders</li>
                  <li>• Exclusive member offers</li>
                  <li>• Birthday rewards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoyaltyPage; 