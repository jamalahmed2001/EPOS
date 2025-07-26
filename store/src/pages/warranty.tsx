import { type NextPage } from "next";
import Head from "next/head";

const WarrantyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Warranty Information - Ministry of Vapes</title>
        <meta name="description" content="Learn about product warranties, coverage details, and how to make warranty claims at Ministry of Vapes." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Warranty Information
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Peace of Mind Guarantee</h2>
            <p className="text-green-800">
              All devices sold at Ministry of Vapes come with manufacturer warranties. We're here to help you through the warranty process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Standard Warranty Coverage</h2>
            
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Starter Kits & Mods</h3>
                <p className="text-muted-foreground mb-2">3-6 months manufacturer warranty</p>
                <p className="text-sm text-muted-foreground">Covers defects in materials and workmanship under normal use</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Pod Systems</h3>
                <p className="text-muted-foreground mb-2">3 months manufacturer warranty</p>
                <p className="text-sm text-muted-foreground">Covers device malfunctions, not pods or coils</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Premium Devices</h3>
                <p className="text-muted-foreground mb-2">6-12 months manufacturer warranty</p>
                <p className="text-sm text-muted-foreground">Extended coverage for high-end devices</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Batteries</h3>
                <p className="text-muted-foreground mb-2">30-90 days warranty</p>
                <p className="text-sm text-muted-foreground">Limited warranty due to nature of lithium batteries</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What's Covered</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Manufacturing defects in materials or workmanship
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Electronic component failures under normal use
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Button or screen malfunctions
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Charging port defects (not damage)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Battery issues within warranty period
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What's Not Covered</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Physical damage from drops, impacts, or misuse
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Water damage (unless device is rated waterproof)
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Damage from incorrect charging or power sources
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Normal wear and tear (scratches, fading, etc.)
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Consumable parts (coils, pods, o-rings)
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                Modifications or repairs by unauthorized parties
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Make a Warranty Claim</h2>
            
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">1</span>
                <div>
                  <h3 className="font-medium text-foreground">Gather Information</h3>
                  <p className="text-muted-foreground">Have your order number, purchase date, and device serial number ready</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">2</span>
                <div>
                  <h3 className="font-medium text-foreground">Document the Issue</h3>
                  <p className="text-muted-foreground">Take clear photos or video showing the problem</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">3</span>
                <div>
                  <h3 className="font-medium text-foreground">Contact Us</h3>
                  <p className="text-muted-foreground">Email warranty@ministryofvapes.com with your information and documentation</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">4</span>
                <div>
                  <h3 className="font-medium text-foreground">Follow Instructions</h3>
                  <p className="text-muted-foreground">We'll guide you through the manufacturer's warranty process or handle it directly</p>
                </div>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Extended Warranty Options</h2>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="font-medium text-foreground mb-2">Ministry Care+</h3>
              <p className="text-muted-foreground mb-4">
                Extend your device warranty for up to 2 years with our protection plan:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Coverage for accidental damage</li>
                <li>• No deductibles on claims</li>
                <li>• Express replacement service</li>
                <li>• Available at checkout for eligible devices</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Important Notes</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Keep your receipt - proof of purchase is required for all warranty claims
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Register your device with the manufacturer for faster service
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Some manufacturers offer direct warranty service which may be faster
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Warranty period starts from the date of purchase, not first use
              </li>
            </ul>
          </section>

          <section className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Warranty Support</h3>
            <p className="text-muted-foreground mb-4">
              Our warranty team is here to help you get your device working again.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> warranty@ministryofvapes.com</p>
              <p className="text-sm"><strong>Phone:</strong> +44 20 1234 5678</p>
              <p className="text-sm"><strong>Response Time:</strong> Within 24 hours on business days</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default WarrantyPage; 