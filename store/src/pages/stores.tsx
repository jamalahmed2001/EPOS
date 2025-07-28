import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";

interface FormattedHour {
  day: string;
  open: string;
  close: string;
  isToday: boolean;
}

const StoresPage: NextPage = () => {
  const { data: stores, isLoading, error } = api.admin.getStores.useQuery();

  const formatOperatingHours = (operatingHours: any): FormattedHour[] | null => {
    if (!operatingHours || typeof operatingHours !== 'object') return null;
    
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday', 
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    return daysOrder.map(day => {
      const hours = operatingHours[day];
      if (!hours) return null;
      
      return {
        day: dayNames[day as keyof typeof dayNames],
        open: hours.open,
        close: hours.close,
        isToday: new Date().getDay() === daysOrder.indexOf(day) + 1
      };
    }).filter((hour): hour is FormattedHour => hour !== null);
  };

  const getDirectionsUrl = (address: string, city: string, postalCode: string) => {
    const fullAddress = `${address}, ${city}, ${postalCode}, UK`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  };

  if (error) {
    return (
      <>
        <Head>
          <title>Store Locations - Ministry of Vapes</title>
          <meta name="description" content="Find Ministry of Vapes store locations across Lancashire" />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to load stores</h1>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Link href="/" className="text-primary hover:underline">Return to Home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Store Locations - Ministry of Vapes</title>
        <meta name="description" content="Find Ministry of Vapes store locations across Lancashire. Visit us for premium vaping products and expert advice." />
        <meta name="keywords" content="vape stores, Ministry of Vapes locations, Lancashire vape shops, Preston, Leyland, Darwen, Lancaster, Burnley" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Our Store Locations
            </h1>
            <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Visit any of our premium stores across Lancashire for expert advice, 
              quality products, and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>6 Locations</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-primary-foreground/30"></div>
              <div className="flex items-center space-x-2">
                <span>🕒</span>
                <span>Open 7 Days</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-primary-foreground/30"></div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>Expert Staff</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 sm:p-8 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
              {stores.map((store) => {
                const hours = formatOperatingHours(store.operatingHours);
                const isOpen = store.status === 'ACTIVE';
                
                return (
                  <div key={store.id} className="group bg-card hover:bg-card/50 rounded-2xl border border-border hover:border-primary/20 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg">
                    {/* Store Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                          {store.name}
                        </h2>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOpen 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isOpen ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-4xl">🏪</div>
                    </div>

                    {/* Address */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Address
                      </h3>
                      <div className="text-foreground space-y-1">
                        <p>{store.address}</p>
                        <p>{store.city}, {store.postalCode}</p>
                        <p>{store.country === 'GB' ? 'United Kingdom' : store.country}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Contact
                      </h3>
                      <div className="space-y-2">
                        <a 
                          href={`tel:${store.phone}`}
                          className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group/phone"
                        >
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            <span className="text-sm">📞</span>
                          </div>
                          <span className="group-hover/phone:underline">{store.phone}</span>
                        </a>
                        <a 
                          href={`mailto:${store.email}`}
                          className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group/email"
                        >
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            <span className="text-sm">✉️</span>
                          </div>
                          <span className="group-hover/email:underline">{store.email}</span>
                        </a>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    {hours && hours.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          Opening Hours
                        </h3>
                        <div className="space-y-2">
                          {hours.map((hour, index) => (
                            <div key={index} className={`flex justify-between items-center text-sm ${
                              hour.isToday ? 'font-semibold text-primary' : 'text-foreground'
                            }`}>
                              <span>{hour.day}</span>
                              <span>{hour.open} - {hour.close}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={getDirectionsUrl(store.address, store.city, store.postalCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors group/directions"
                      >
                        <span className="mr-2">🗺️</span>
                        Get Directions
                        <svg className="ml-2 w-4 h-4 group-hover/directions:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="mr-2">📱</span>
                        Call Store
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🏪</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">No stores found</h2>
              <p className="text-muted-foreground mb-8">We're working on expanding our locations.</p>
              <Link href="/contact" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Contact Us for Updates
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our expert staff are here to help. Contact any of our stores directly or reach out to our customer service team.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl mb-4">
                📞
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-3">Speak to our friendly team</p>
              <a href="tel:01772446376" className="text-primary hover:underline font-medium">
                01772 446 376
              </a>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl mb-4">
                ✉️
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-3">We'll respond within 24 hours</p>
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Send Message
              </Link>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl mb-4">
                🎧
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Support</h3>
              <p className="text-muted-foreground mb-3">Get help with your order</p>
              <Link href="/support" className="text-primary hover:underline font-medium">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StoresPage; 