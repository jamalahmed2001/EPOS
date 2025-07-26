import { type NextPage } from "next";
import Head from "next/head";

const CookiesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy - Ministry of Vapes</title>
        <meta name="description" content="Learn about how Ministry of Vapes uses cookies and similar technologies on our website." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Cookie Policy
        </h1>

        <p className="text-muted-foreground mb-8">
          Last updated: January 1, 2024
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our site, and enabling certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Ministry of Vapes uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
              <li><strong>Performance cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing cookies:</strong> Deliver relevant advertisements and track campaign effectiveness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These cookies are necessary for the website to function and cannot be switched off.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Cookie Name</th>
                      <th className="text-left py-2 font-medium">Purpose</th>
                      <th className="text-left py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">session_id</td>
                      <td className="py-2">Maintains user session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">age_verified</td>
                      <td className="py-2">Age verification status</td>
                      <td className="py-2">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2">cart_id</td>
                      <td className="py-2">Shopping cart functionality</td>
                      <td className="py-2">7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These help us understand how visitors interact with our website.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Cookie Name</th>
                      <th className="text-left py-2 font-medium">Provider</th>
                      <th className="text-left py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2">_gid</td>
                      <td className="py-2">Google Analytics</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Marketing Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These cookies track your browsing habits to deliver relevant advertisements.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Cookie Name</th>
                      <th className="text-left py-2 font-medium">Provider</th>
                      <th className="text-left py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">_fbp</td>
                      <td className="py-2">Facebook</td>
                      <td className="py-2">90 days</td>
                    </tr>
                    <tr>
                      <td className="py-2">ads/ga-audiences</td>
                      <td className="py-2">Google Ads</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences through:
            </p>
            
            <h3 className="text-lg font-medium text-foreground mb-2">Cookie Settings</h3>
            <p className="text-muted-foreground mb-4">
              Click the "Cookie Settings" button in the footer of our website to manage your preferences for non-essential cookies.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2">Browser Settings</h3>
            <p className="text-muted-foreground mb-4">
              Most browsers allow you to control cookies through their settings:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Impact of Disabling Cookies</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Please note:</strong> If you disable or refuse cookies, some parts of our website may become inaccessible or not function properly. Essential cookies cannot be disabled as they are required for the website to operate.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground">
              Some cookies are placed by third-party services that appear on our pages. We do not control these cookies, and you should refer to the third party's privacy policy for more information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
              <li>Google Analytics - Website analytics</li>
              <li>Facebook Pixel - Social media integration</li>
              <li>Stripe - Payment processing</li>
              <li>YouTube - Video content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Do Not Track</h2>
            <p className="text-muted-foreground">
              Some browsers include a "Do Not Track" feature that signals to websites you visit that you do not want your online activity tracked. Our website currently does not respond to Do Not Track signals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. Please check this page periodically for updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm"><strong>Privacy Team</strong></p>
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

export default CookiesPage; 