import { type NextPage } from "next";
import Head from "next/head";

const ShippingPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Shipping Information - Ministry of Vapes</title>
        <meta name="description" content="Learn about our shipping options, delivery times, and shipping policies at Ministry of Vapes." />
      </Head>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
          Shipping Information
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Delivery Options</h2>
            
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Standard Delivery</h3>
                <p className="text-muted-foreground mb-2">2-3 business days</p>
                <p className="text-primary font-semibold">£3.95 or FREE on orders over £30</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Next Day Delivery</h3>
                <p className="text-muted-foreground mb-2">Order before 2 PM for next business day</p>
                <p className="text-primary font-semibold">£7.95</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">Saturday Delivery</h3>
                <p className="text-muted-foreground mb-2">Order by Friday 2 PM</p>
                <p className="text-primary font-semibold">£9.95</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Delivery Areas</h2>
            <p className="text-muted-foreground mb-4">
              We currently deliver to all UK mainland addresses. Delivery to the following areas may take an additional 1-2 days:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Scottish Highlands and Islands</li>
              <li>Northern Ireland</li>
              <li>Isle of Man</li>
              <li>Channel Islands</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Order Processing</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Orders placed before 2 PM on business days are processed the same day
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Orders placed after 2 PM or on weekends are processed the next business day
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                You'll receive a confirmation email once your order is dispatched
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Tracking information will be provided via email
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Age Verification</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Important:</strong> All vaping products are age-restricted. Our delivery partners may request ID upon delivery to verify you are 18 or over. Orders that cannot be delivered due to age verification failure will be returned and refunded minus shipping costs.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">International Shipping</h2>
            <p className="text-muted-foreground">
              We currently do not offer international shipping. We only deliver to UK addresses at this time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Missing or Damaged Items</h2>
            <p className="text-muted-foreground mb-4">
              If your order arrives damaged or items are missing, please contact us within 48 hours of delivery:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: support@ministryofvapes.com</li>
              <li>Phone: +44 20 1234 5678</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Please include your order number and photos of any damage when contacting us.
            </p>
          </section>

          <section className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground">
              If you have any questions about shipping or your order, please don't hesitate to contact our customer service team.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default ShippingPage; 