import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const ReturnsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Returns & Refunds - Ministry of Vapes</title>
        <meta name="description" content="Learn about our returns policy, refund process, and how to return items to Ministry of Vapes." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Returns & Refunds Policy
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">30-Day Return Guarantee</h2>
            <p className="text-blue-800">
              We offer a 30-day return period for unopened products in their original packaging. Your satisfaction is our priority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Can Be Returned?</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✓ Returnable Items</h3>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>• Unopened e-liquids in original packaging</li>
                  <li>• Unused devices with all accessories</li>
                  <li>• Sealed accessories and parts</li>
                  <li>• Items with manufacturing defects</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">✗ Non-Returnable Items</h3>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• Opened e-liquids (for safety reasons)</li>
                  <li>• Used devices or atomizers</li>
                  <li>• Replacement coils and consumables</li>
                  <li>• Items marked as final sale</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Return an Item</h2>
            
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">1</span>
                <div>
                  <h3 className="font-medium text-foreground">Contact Us</h3>
                  <p className="text-muted-foreground">Email returns@ministryofvapes.com with your order number and reason for return</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">2</span>
                <div>
                  <h3 className="font-medium text-foreground">Receive Return Authorization</h3>
                  <p className="text-muted-foreground">We'll send you a return authorization number and shipping instructions</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">3</span>
                <div>
                  <h3 className="font-medium text-foreground">Ship Your Return</h3>
                  <p className="text-muted-foreground">Package items securely and ship to our returns center</p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-3">4</span>
                <div>
                  <h3 className="font-medium text-foreground">Receive Your Refund</h3>
                  <p className="text-muted-foreground">Refunds are processed within 5-7 business days of receipt</p>
                </div>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Refund Information</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Refunds are issued to the original payment method
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Original shipping costs are non-refundable unless the return is due to our error
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Return shipping costs are the customer's responsibility unless item is defective
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Processing time: 5-7 business days after we receive your return
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Exchanges</h2>
            <p className="text-muted-foreground mb-4">
              We don't offer direct exchanges. If you need a different item, please:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Return the original item following our returns process</li>
              <li>Place a new order for the desired item</li>
              <li>Contact us if you need the new item urgently - we may be able to expedite shipping</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Damaged or Defective Items</h2>
            <p className="text-muted-foreground mb-4">
              If you receive a damaged or defective item:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Contact us within 48 hours of delivery</li>
              <li>• Provide photos of the damage or defect</li>
              <li>• We'll arrange a replacement or full refund including shipping costs</li>
              <li>• Keep all original packaging until the issue is resolved</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Warranty Claims</h2>
            <p className="text-muted-foreground">
              For warranty claims on devices, please see our <Link href="/warranty" className="text-primary hover:underline">warranty policy</Link>. 
              Many manufacturers offer direct warranty service which may be faster than returning through us.
            </p>
          </section>

          <section className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Questions About Returns?</h3>
            <p className="text-muted-foreground mb-4">
              Our customer service team is here to help make returns as easy as possible.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> returns@ministryofvapes.com</p>
              <p className="text-sm"><strong>Phone:</strong> +44 20 1234 5678</p>
              <p className="text-sm"><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM GMT</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ReturnsPage; 