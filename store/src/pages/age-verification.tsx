import { type NextPage } from "next";
import Head from "next/head";

const AgeVerificationPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Age Verification Policy - Ministry of Vapes</title>
        <meta name="description" content="Learn about our age verification requirements and procedures for purchasing vaping products." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Age Verification Policy
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-900 mb-2">🔞 Strictly 18+</h2>
            <p className="text-red-800">
              <strong>All vaping products are age-restricted.</strong> It is illegal to sell vaping products to anyone under the age of 18 in the UK. We take this responsibility seriously and have implemented strict age verification procedures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Age Verification?</h2>
            <p className="text-muted-foreground mb-4">
              Age verification is required by law and is essential for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Protecting young people from nicotine products</li>
              <li>Complying with UK regulations</li>
              <li>Maintaining our license to sell vaping products</li>
              <li>Promoting responsible vaping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Verification Process</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-2">Online Orders</h3>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-6">
              <li>Age declaration at account creation</li>
              <li>Date of birth verification at checkout</li>
              <li>Third-party age verification checks using credit bureaus</li>
              <li>Additional documentation may be requested if automatic verification fails</li>
              <li>Delivery drivers may request ID upon delivery</li>
            </ol>

            <h3 className="text-lg font-medium text-foreground mb-2">In-Store Purchases</h3>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2">
              <li>Visual age assessment by trained staff</li>
              <li>ID required if customer appears under 25 (Challenge 25 policy)</li>
              <li>Electronic ID verification for all sales</li>
              <li>Transaction refused if valid ID cannot be provided</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptable Forms of ID</h2>
            <p className="text-muted-foreground mb-4">We accept the following forms of identification:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✓ Accepted IDs</h3>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>• UK Driving License (photo card)</li>
                  <li>• Valid Passport</li>
                  <li>• Proof of Age Card (PASS hologram)</li>
                  <li>• Military ID Card</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">✗ Not Accepted</h3>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• Birth certificates</li>
                  <li>• Credit/debit cards</li>
                  <li>• Student cards</li>
                  <li>• Photos of ID documents</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Challenge 25 Policy</h2>
            <p className="text-muted-foreground">
              We operate a Challenge 25 policy. This means that if you look under 25, our staff will ask for ID before selling you any vaping products. This policy helps ensure we never accidentally sell to anyone under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Failed Verification</h2>
            <p className="text-muted-foreground mb-4">
              If age verification fails:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Online orders will be cancelled and refunded</li>
              <li>In-store purchases will be refused</li>
              <li>Delivery attempts will be returned to sender</li>
              <li>Multiple failed attempts may result in account suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection</h2>
            <p className="text-muted-foreground">
              Age verification data is processed securely and in accordance with our Privacy Policy. We only collect the minimum information necessary to verify your age and do not store ID documents longer than required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Proxy Purchasing</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Warning:</strong> It is illegal to purchase vaping products on behalf of someone under 18. This is known as proxy purchasing and can result in prosecution and fines of up to £2,500.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Staff Training</h2>
            <p className="text-muted-foreground">
              All our staff receive comprehensive training on age verification procedures, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Legal requirements and penalties</li>
              <li>How to check ID documents</li>
              <li>Spotting fake IDs</li>
              <li>Handling difficult situations</li>
              <li>Regular refresher training</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Reporting Concerns</h2>
            <p className="text-muted-foreground mb-4">
              If you have concerns about underage sales or our age verification procedures, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm"><strong>Age Verification Team</strong></p>
              <p className="text-sm">Email: compliance@ministryofvapes.com</p>
              <p className="text-sm">Phone: +44 20 1234 5678</p>
              <p className="text-sm">
                You can also report concerns anonymously to your local Trading Standards office.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Legal Compliance</h2>
            <p className="text-muted-foreground">
              Our age verification policy complies with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Nicotine Inhaling Products (Age of Sale and Proxy Purchasing) Regulations 2015</li>
              <li>Children and Young Persons Act 1933</li>
              <li>Tobacco and Related Products Regulations 2016</li>
              <li>Local authority licensing conditions</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};

export default AgeVerificationPage; 