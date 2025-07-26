import { type NextPage } from "next";
import Head from "next/head";

const PrivacyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Ministry of Vapes</title>
        <meta name="description" content="Learn how Ministry of Vapes collects, uses, and protects your personal information." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Privacy Policy
        </h1>

        <p className="text-muted-foreground mb-8">
          Last updated: January 1, 2024
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Ministry of Vapes ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
            <p className="text-muted-foreground mb-4">We may collect:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Name and contact details (email, phone, address)</li>
              <li>Date of birth (for age verification)</li>
              <li>Payment information</li>
              <li>Order history and preferences</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-2">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Cookies and usage data</li>
              <li>Shopping behavior and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Verify your age (18+ requirement)</li>
              <li>Communicate about your orders and account</li>
              <li>Send marketing communications (with consent)</li>
              <li>Improve our products and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Manage our loyalty program</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Payment processors and financial institutions</li>
              <li>Shipping and logistics partners</li>
              <li>Age verification services</li>
              <li>Marketing service providers (with consent)</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">Under UK data protection laws, you have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content. For more information, please see our Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Age Restrictions</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Important:</strong> Our website and products are only for individuals aged 18 and over. We implement strict age verification procedures and do not knowingly collect information from anyone under 18.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Typically:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
              <li>Order information: 7 years for tax purposes</li>
              <li>Account information: Until account deletion</li>
              <li>Marketing preferences: Until withdrawal of consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than the UK. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or how we handle your information, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm"><strong>Data Protection Officer</strong></p>
              <p className="text-sm">Ministry of Vapes Ltd</p>
              <p className="text-sm">Email: privacy@ministryofvapes.com</p>
              <p className="text-sm">Phone: +44 20 1234 5678</p>
              <p className="text-sm">Address: 123 Vape Street, London, UK, W1A 1AA</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage; 