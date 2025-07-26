import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const AccountPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data: profile } = api.auth.getProfile.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: loyaltyAccount } = api.loyalty.getAccount.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
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
        return "text-orange-600 bg-orange-50";
      case "SILVER":
        return "text-gray-600 bg-gray-50";
      case "GOLD":
        return "text-yellow-600 bg-yellow-50";
      case "PLATINUM":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <Head>
        <title>My Account - Ministry of Vapes</title>
        <meta name="description" content="Manage your Ministry of Vapes account" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile, orders, and loyalty rewards
          </p>
        </div>

        {/* Profile Overview */}
        <div className="mb-8 rounded-lg bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Welcome back, {profile?.name || "User"}!
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {profile?.createdAt 
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "Unknown"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loyalty Status */}
        {loyaltyAccount && (
          <div className="mb-8 rounded-lg bg-card border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Loyalty Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {loyaltyAccount.points}
                </div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
              <div className="text-center">
                <div 
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTierColor(loyaltyAccount.tier)}`}
                >
                  {loyaltyAccount.tier}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {loyaltyAccount.completedOrders}
                </div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {loyaltyAccount.lifetimePoints}
                </div>
                <div className="text-sm text-muted-foreground">Lifetime Points</div>
              </div>
            </div>
            
            {loyaltyAccount.completedOrders >= 10 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">
                    🎉 You qualify for 20% off on orders over £20!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/account/orders"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Order History</h3>
                <p className="text-muted-foreground">View your past orders and track shipments</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Addresses</h3>
                <p className="text-muted-foreground">Manage your shipping addresses</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/loyalty"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Loyalty Rewards</h3>
                <p className="text-muted-foreground">View your QR code and rewards history</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/subscriptions"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Subscriptions</h3>
                <p className="text-muted-foreground">Manage your recurring orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/profile"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Profile Settings</h3>
                <p className="text-muted-foreground">Update your personal information</p>
              </div>
            </div>
          </Link>

          <Link
            href="/account/referrals"
            className="block rounded-lg bg-card border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Refer Friends</h3>
                <p className="text-muted-foreground">Share your referral code and earn rewards</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AccountPage; 