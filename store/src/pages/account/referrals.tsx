import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useState } from "react";

const ReferralsPage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);

  const { data: profile } = api.auth.getProfile.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  // Mock referral data - in production, this would come from the API
  const referralStats = {
    totalReferrals: 5,
    successfulReferrals: 3,
    pendingReferrals: 2,
    totalEarned: 1500, // points
    lifetimeEarnings: 2500,
  };

  const referralHistory = [
    {
      id: "1",
      referredName: "John D.",
      status: "COMPLETED",
      date: new Date("2024-01-15"),
      pointsEarned: 500,
    },
    {
      id: "2",
      referredName: "Sarah M.",
      status: "COMPLETED",
      date: new Date("2024-01-10"),
      pointsEarned: 500,
    },
    {
      id: "3",
      referredName: "Mike R.",
      status: "COMPLETED",
      date: new Date("2024-01-05"),
      pointsEarned: 500,
    },
    {
      id: "4",
      referredName: "Emma L.",
      status: "PENDING",
      date: new Date("2024-01-20"),
      pointsEarned: 0,
    },
    {
      id: "5",
      referredName: "David K.",
      status: "PENDING",
      date: new Date("2024-01-18"),
      pointsEarned: 0,
    },
  ];

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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

  const referralCode = profile?.referralCode || "LOADING";
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://ministryofvapes.com"}/auth/signup?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Head>
        <title>Refer Friends - Ministry of Vapes</title>
        <meta name="description" content="Refer friends to Ministry of Vapes and earn rewards" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mb-4">
            <Link href="/account" className="text-primary hover:underline">
              ← Back to Account
            </Link>
          </nav>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Refer Friends & Earn Rewards
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your love for vaping and earn 500 points for each friend who makes their first purchase
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-primary">{referralStats.totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{referralStats.pendingReferrals}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{referralStats.totalEarned}</div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </div>
        </div>

        {/* Referral Methods */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Share Your Referral Code</h2>
          
          <div className="space-y-4">
            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Your Referral Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 h-12 px-4 rounded-lg border border-border bg-muted flex items-center font-mono text-lg">
                  {referralCode}
                </div>
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Your Referral Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 h-12 px-4 rounded-lg border border-border bg-muted text-sm"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Share via:</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out Ministry of Vapes! Use my code ${referralCode} for exclusive benefits: ${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=Check out Ministry of Vapes&body=${encodeURIComponent(`I've been loving Ministry of Vapes and thought you might too! Use my referral code ${referralCode} when you sign up: ${referralLink}`)}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Email
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-primary/5 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Share Your Code</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code or link with friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Friend Signs Up</h3>
              <p className="text-sm text-muted-foreground">
                Your friend creates an account using your referral code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get 500 points when they make their first purchase
              </p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Referral History</h2>
          </div>
          
          {referralHistory.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No referrals yet. Start sharing your code!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Friend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Points Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referralHistory.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {referral.referredName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {referral.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(referral.status)}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {referral.pointsEarned > 0 ? `+${referral.pointsEarned}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p className="mb-2">Terms & Conditions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Referral rewards are credited after your friend's first purchase is completed</li>
            <li>Self-referrals are not allowed and will be disqualified</li>
            <li>There is no limit to the number of friends you can refer</li>
            <li>Points expire after 12 months of inactivity</li>
            <li>Ministry of Vapes reserves the right to modify or end this program at any time</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ReferralsPage; 