import { type NextPage } from "next";
import Head from "next/head";

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - Ministry of Vapes</title>
        <meta name="description" content="Read the terms and conditions for using Ministry of Vapes website and services." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Terms of Service
        </h1>

        <p className="text-muted-foreground mb-8">
          Last updated: January 1, 2024
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Age Restriction</h2>
            <p className="text-red-800">
              <strong>You must be 18 years or older to use this website or purchase our products.</strong> By using our services, you confirm that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the Ministry of Vapes website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of Website</h2>
            <h3 className="text-lg font-medium text-foreground mb-2">Acceptable Use</h3>
            <p className="text-muted-foreground mb-4">You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others.</p>
            
            <h3 className="text-lg font-medium text-foreground mb-2">Prohibited Activities</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Attempting to purchase products if under 18</li>
              <li>Using false information or impersonating others</li>
              <li>Interfering with website security or functionality</li>
              <li>Reselling products without authorization</li>
              <li>Using automated systems to access the website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Product Information</h2>
            <p className="text-muted-foreground mb-4">
              We strive to provide accurate product descriptions and images. However:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Colors may vary due to monitor settings</li>
              <li>Product availability is subject to change</li>
              <li>We reserve the right to limit quantities</li>
              <li>Prices are subject to change without notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Orders and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All orders are subject to acceptance and availability</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Payment must be received before order processing</li>
              <li>You agree to provide accurate billing information</li>
              <li>Prices are in GBP and include VAT where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Shipping and Delivery</h2>
            <p className="text-muted-foreground">
              Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or circumstances beyond our control. Risk of loss passes to you upon delivery to the carrier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Returns and refunds are governed by our Returns Policy. Opened e-liquids cannot be returned for safety reasons. Defective products may be returned within the warranty period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website, including text, graphics, logos, and images, is the property of Ministry of Vapes or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              Our website and products are provided "as is" without warranties of any kind, either express or implied. We do not warrant that the website will be uninterrupted, error-free, or free of viruses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, Ministry of Vapes shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Health Warnings</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="text-yellow-800 space-y-2">
                <li>• Vaping products contain nicotine, which is addictive</li>
                <li>• Not for use by pregnant or breastfeeding women</li>
                <li>• Keep out of reach of children and pets</li>
                <li>• May be harmful to people with heart conditions</li>
                <li>• Consult your doctor if you have health concerns</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Account Terms</h2>
            <p className="text-muted-foreground mb-4">
              If you create an account:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>You are responsible for maintaining account security</li>
              <li>You must provide accurate information</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our website constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm"><strong>Ministry of Vapes Ltd</strong></p>
              <p className="text-sm">Email: legal@ministryofvapes.com</p>
              <p className="text-sm">Phone: +44 20 1234 5678</p>
              <p className="text-sm">Address: 123 Vape Street, London, UK, W1A 1AA</p>
              <p className="text-sm">Company Registration: 12345678</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsPage; 