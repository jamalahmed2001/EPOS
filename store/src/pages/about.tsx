import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Us - Ministry of Vapes</title>
        <meta name="description" content="Learn about Ministry of Vapes - your trusted vaping partner since 2020. We're committed to providing quality products and exceptional service." />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary/10 to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                About Ministry of Vapes
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
                Your trusted partner in the vaping journey since 2020
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Our Story */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Founded in 2020, Ministry of Vapes began as a small local shop with a simple mission: 
                to provide quality vaping products and help people transition away from traditional cigarettes. 
                What started as a passion project has grown into a trusted name in the vaping community.
              </p>
              <p className="mt-4">
                We believe in offering more than just products – we provide education, support, and a 
                welcoming environment for both beginners and experienced vapers. Our knowledgeable staff 
                is always ready to help you find the perfect setup for your needs.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Values</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quality First</h3>
                <p className="text-muted-foreground">
                  We carefully curate our product selection to ensure only the highest quality items make it to our shelves.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Community Focused</h3>
                <p className="text-muted-foreground">
                  We're more than a store – we're a community hub for vapers to connect, learn, and share experiences.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We stay ahead of the curve, bringing you the latest technology and trends in the vaping industry.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Why Choose Us</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Expert Guidance</h3>
                  <p className="text-muted-foreground">
                    Our trained staff provides personalized recommendations based on your preferences and experience level.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Wide Selection</h3>
                  <p className="text-muted-foreground">
                    From starter kits to advanced mods, we carry products for every vaper's journey.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Competitive Prices</h3>
                  <p className="text-muted-foreground">
                    We offer fair pricing without compromising on quality, plus exclusive member discounts.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Fast Shipping</h3>
                  <p className="text-muted-foreground">
                    Quick processing and reliable delivery to get your products to you when you need them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Us */}
          <div className="rounded-2xl bg-card border border-border p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Visit Our Store</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience our products firsthand and get personalized recommendations from our expert staff. 
              We're here to help you find the perfect vaping solution.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-2xl mx-auto text-left">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Store Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 8:00 PM<br />
                  Saturday: 10:00 AM - 7:00 PM<br />
                  Sunday: 11:00 AM - 6:00 PM
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">
                  123 High Street<br />
                  London, W1A 1AA<br />
                  United Kingdom
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Shop Online
              </Link>
              <a
                href="tel:+442012345678"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                Call Us: +44 20 1234 5678
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage; 