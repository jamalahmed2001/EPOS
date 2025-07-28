import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const AboutPage: NextPage = () => {
  // Store locations data
  const storeLocations = [
    {
      name: "Deepdale Preston",
      address: "19 Harewood Rd, Preston PR1 6XH",
      phone: "01772 446 376",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    },
    {
      name: "Friargate Preston", 
      address: "178 Friargate, Preston PR1 2EJ",
      phone: "01772 914 748",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    },
    {
      name: "Leyland",
      address: "Leyland Shopping Centre, Leyland PR25 1QX",
      phone: "01772 621 654",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    },
    {
      name: "Darwen",
      address: "Darwen Town Centre, Darwen BB3 1AS",
      phone: "01254 846 733",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    },
    {
      name: "Lancaster",
      address: "Lancaster City Centre, Lancaster LA1 1HT",
      phone: "07793 976 548",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    },
    {
      name: "Burnley",
      address: "Burnley Town Centre, Burnley BB11 1LD",
      phone: "07949 328 153",
      hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: 11AM-4PM"
    }
  ];

  // Generate structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ministry of Vapes",
    description: "Leading vaping retailer in Lancashire, UK. Premium e-liquids, devices, and accessories with expert guidance and exceptional service.",
    url: "https://ministryofvapes.com",
    logo: "https://ministryofvapes.com/logo.png",
    foundingDate: "2018",
    email: "info@ministryofvapes.co.uk",
    areaServed: {
      "@type": "State",
      name: "Lancashire, UK"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Vaping Products",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "E-Liquids",
            description: "Premium e-liquids in various flavors and nicotine strengths"
          }
        },
        {
          "@type": "Offer", 
          itemOffered: {
            "@type": "Product",
            name: "Vaping Devices",
            description: "Starter kits, advanced mods, and pod systems"
          }
        }
      ]
    },
    location: storeLocations.map(store => ({
      "@type": "Place",
      name: `Ministry of Vapes ${store.name}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: store.address.split(',')[0],
        addressLocality: store.address.split(',')[1]?.trim(),
        addressCountry: "GB"
      },
      telephone: store.phone,
      openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-17:00, Su 11:00-16:00"
    })),
    sameAs: [
      "https://www.facebook.com/ministryofvapes",
      "https://www.instagram.com/ministryofvapes"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ministryofvapes.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
        item: "https://ministryofvapes.com/about"
      }
    ]
  };

  return (
    <>
      <Head>
        <title>About Ministry of Vapes - Lancashire's Leading Vaping Retailer</title>
        <meta 
          name="description" 
          content="Learn about Ministry of Vapes - Lancashire's trusted vaping specialist since 2018. 6 stores across Preston, Leyland, Darwen, Lancaster & Burnley. Expert guidance, premium products." 
        />
        <meta name="keywords" content="about ministry of vapes, lancashire vape shop, preston vaping, uk vape retailer, vaping expert" />
        <meta property="og:title" content="About Ministry of Vapes - Lancashire's Leading Vaping Retailer" />
        <meta property="og:description" content="Lancashire's trusted vaping specialist with 6 stores across Preston, Leyland, Darwen, Lancaster & Burnley. Expert guidance and premium products since 2018." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ministryofvapes.com/about" />
        <meta property="og:image" content="https://ministryofvapes.com/about-og.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Ministry of Vapes - Lancashire's Leading Vaping Retailer" />
        <meta name="twitter:description" content="Lancashire's trusted vaping specialist with expert guidance and premium products." />
        <link rel="canonical" href="https://ministryofvapes.com/about" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">About Us</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary/10 to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                About Ministry of Vapes
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Lancashire's leading vaping specialist, serving the communities of Preston, Leyland, 
                Darwen, Lancaster, and Burnley with expert guidance and premium products since 2018.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  6 Stores Across Lancashire
                </div>
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Established 2018
                </div>
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expert Guidance
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Our Story */}
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Founded in 2018, Ministry of Vapes began with a simple but powerful mission: to help people 
                    transition away from traditional cigarettes by providing access to quality vaping products 
                    and expert guidance throughout Lancashire.
                  </p>
                  <p>
                    What started as a single store in Preston has grown into a trusted network of six locations 
                    across Lancashire, serving the communities of Preston (Deepdale & Friargate), Leyland, 
                    Darwen, Lancaster, and Burnley. Each store is staffed by knowledgeable vaping specialists 
                    who are passionate about helping customers find the right solution for their needs.
                  </p>
                  <p>
                    We believe that vaping is more than just an alternative to smoking – it's a lifestyle choice 
                    that deserves quality products, expert support, and a welcoming community. That's why we've 
                    built our reputation on providing exceptional customer service, competitive prices, and the 
                    latest innovations in vaping technology.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Innovation</h3>
                      <p className="text-sm text-muted-foreground">Latest vaping technology and trends</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Community</h3>
                      <p className="text-sm text-muted-foreground">Building connections across Lancashire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Quality</h3>
                      <p className="text-sm text-muted-foreground">Carefully curated premium products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="mb-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                To provide Lancashire's vaping community with access to premium products, expert guidance, 
                and exceptional service while promoting safer alternatives to traditional smoking.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Education</h3>
                  <p className="text-muted-foreground text-sm">
                    Empowering customers with knowledge about vaping products, safety, and best practices.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Care</h3>
                  <p className="text-muted-foreground text-sm">
                    Providing personalized service and ongoing support for every customer's vaping journey.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Excellence</h3>
                  <p className="text-muted-foreground text-sm">
                    Continuously improving our products, services, and customer experience across all locations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose Ministry of Vapes</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Expert Knowledge</h3>
                  <p className="text-muted-foreground">
                    Our trained staff have years of experience and stay up-to-date with the latest vaping trends, 
                    safety guidelines, and product innovations to provide you with the best advice.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Premium Product Range</h3>
                  <p className="text-muted-foreground">
                    We carefully curate our selection to include only the highest quality e-liquids, devices, 
                    and accessories from trusted manufacturers and emerging innovators.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Convenient Locations</h3>
                  <p className="text-muted-foreground">
                    With six strategically located stores across Lancashire, there's always a Ministry of Vapes 
                    nearby to serve your vaping needs with consistent quality and service.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Competitive Pricing</h3>
                  <p className="text-muted-foreground">
                    We offer competitive prices without compromising on quality, plus loyalty rewards, 
                    exclusive member discounts, and regular promotions to provide excellent value.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ongoing Support</h3>
                  <p className="text-muted-foreground">
                    Your relationship with us doesn't end at purchase. We provide ongoing support, device 
                    maintenance guidance, and are always available to help troubleshoot any issues.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Safety First</h3>
                  <p className="text-muted-foreground">
                    We prioritize safety in everything we do, from product selection to customer education, 
                    ensuring you have the knowledge and tools to vape safely and responsibly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Locations */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Store Locations</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Visit any of our six convenient locations across Lancashire for personalized service, 
              product demonstrations, and expert advice from our knowledgeable staff.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeLocations.map((store, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Ministry of Vapes {store.name}
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                        {store.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Start Your Vaping Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're new to vaping or looking to upgrade your setup, our expert team is here to help. 
              Visit one of our stores or browse our online collection to discover premium products and 
              personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Shop Online
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Contact Us
              </Link>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span>✓ Expert guidance and support</span>
              <span>✓ Premium quality products</span>
              <span>✓ Competitive prices</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage; 