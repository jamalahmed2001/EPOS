import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "What age do I need to be to purchase vaping products?",
    answer: "You must be 18 years or older to purchase any vaping products. We verify age at checkout and may request additional verification.",
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 2-3 business days. Next-day delivery is available for orders placed before 2 PM on weekdays.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, PayPal, and Apple Pay. In-store, we also accept cash and contactless payments.",
  },
  {
    question: "Can I return or exchange products?",
    answer: "Unopened products can be returned within 30 days. For safety reasons, we cannot accept returns on opened e-liquids or used devices.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can also track orders in your account dashboard.",
  },
  {
    question: "Do you offer warranty on devices?",
    answer: "Yes, all devices come with manufacturer warranties ranging from 3-12 months. Extended warranties are available for purchase.",
  },
];

const supportTopics = [
  {
    icon: "📦",
    title: "Orders & Shipping",
    description: "Track orders, shipping info, and delivery options",
    link: "/shipping",
  },
  {
    icon: "↩️",
    title: "Returns & Refunds",
    description: "Return policy, refund process, and exchanges",
    link: "/returns",
  },
  {
    icon: "🛡️",
    title: "Warranty & Repairs",
    description: "Product warranties and repair services",
    link: "/warranty",
  },
  {
    icon: "💳",
    title: "Payment & Billing",
    description: "Payment methods, billing issues, and invoices",
    link: "/support/billing",
  },
  {
    icon: "👤",
    title: "Account & Login",
    description: "Account management, password reset, and profile",
    link: "/account",
  },
  {
    icon: "🎁",
    title: "Loyalty Program",
    description: "Points, rewards, and member benefits",
    link: "/support/loyalty",
  },
];

const SupportPage: NextPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Head>
        <title>Help Center - Ministry of Vapes</title>
        <meta name="description" content="Find answers to common questions and get support for your Ministry of Vapes orders and products." />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-muted-foreground">
            Search our help center or browse topics below
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Support Topics Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTopics.map((topic, index) => (
              <Link
                key={index}
                href={topic.link}
                className="block p-6 bg-card rounded-xl border border-border hover:border-primary transition-colors group"
              >
                <div className="text-4xl mb-4">{topic.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">
                    {faq.question}
                  </span>
                  <svg
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-muted/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="tel:+442012345678"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-background border border-border hover:bg-muted text-foreground font-semibold transition-colors"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call +44 20 1234 5678
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage; 