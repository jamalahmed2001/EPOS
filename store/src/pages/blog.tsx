import { useState, useMemo } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

// Mock blog data - In production, this would come from a CMS or database
const mockPosts = [
  {
    id: "1",
    slug: "understanding-vaping-beginners-guide",
    title: "Understanding Vaping: A Beginner's Guide to Safe Vaping",
    excerpt: "New to vaping? This comprehensive guide covers everything you need to know to get started safely and enjoyably, from device selection to e-liquid basics.",
    author: "Sarah Johnson",
    authorRole: "Vaping Expert & Safety Consultant",
    date: "2024-01-15",
    category: "Guides",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600",
    tags: ["beginners", "guide", "safety", "devices"],
    featured: true,
  },
  {
    id: "2",
    slug: "top-10-e-liquid-flavors-2024",
    title: "Top 10 E-Liquid Flavors of 2024: Expert Reviews & Recommendations",
    excerpt: "Discover the most popular and highest-rated e-liquid flavors this year, from classic tobacco to exotic fruit blends. Expert tested and reviewed.",
    author: "Mike Chen",
    authorRole: "Senior Product Reviewer",
    date: "2024-01-10",
    category: "Reviews",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&h=600",
    tags: ["flavors", "reviews", "2024", "recommendations"],
    featured: true,
  },
  {
    id: "3",
    slug: "vaping-safety-best-practices",
    title: "Vaping Safety: Essential Best Practices & Safety Tips",
    excerpt: "Learn essential safety tips for vaping, including battery care, proper storage, device maintenance, and responsible usage guidelines.",
    author: "Dr. Emily Roberts",
    authorRole: "Health & Safety Specialist",
    date: "2024-01-05",
    category: "Safety",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600",
    tags: ["safety", "maintenance", "battery", "health"],
    featured: false,
  },
  {
    id: "4",
    slug: "evolution-of-vaping-technology",
    title: "The Evolution of Vaping Technology: From Cigalikes to Smart Devices",
    excerpt: "From early e-cigarettes to modern smart pod systems, explore how vaping technology has advanced and what the future holds.",
    author: "James Williams",
    authorRole: "Technology Analyst",
    date: "2023-12-28",
    category: "Technology",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600",
    tags: ["technology", "innovation", "devices", "future"],
    featured: false,
  },
  {
    id: "5",
    slug: "nicotine-strength-guide",
    title: "Choosing the Right Nicotine Strength: Complete Guide",
    excerpt: "Understand nicotine strengths, how to choose the right level for your needs, and tips for transitioning between strengths.",
    author: "Sarah Johnson",
    authorRole: "Vaping Expert & Safety Consultant",
    date: "2023-12-20",
    category: "Guides",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600",
    tags: ["nicotine", "guide", "beginners", "health"],
    featured: false,
  },
  {
    id: "6",
    slug: "vaping-vs-smoking-health-comparison",
    title: "Vaping vs Smoking: A Comprehensive Health Comparison",
    excerpt: "An evidence-based comparison of vaping and smoking, examining health impacts, scientific research, and harm reduction benefits.",
    author: "Dr. Emily Roberts",
    authorRole: "Health & Safety Specialist",
    date: "2023-12-15",
    category: "Health",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600",
    tags: ["health", "research", "comparison", "science"],
    featured: false,
  },
];

const categories = ["All", "Guides", "Reviews", "Safety", "Technology", "Health", "News"];

const BlogPage: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = mockPosts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  // Paginate posts
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const featuredPosts = mockPosts.filter(post => post.featured);

  // Generate structured data for blog listing
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Ministry of Vapes Blog",
    description: "Expert vaping guides, product reviews, and industry insights from Ministry of Vapes.",
    url: "https://ministryofvapes.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Ministry of Vapes",
      url: "https://ministryofvapes.com"
    },
    blogPost: paginatedPosts.map(post => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      author: {
        "@type": "Person",
        name: post.author,
        jobTitle: post.authorRole
      },
      datePublished: post.date,
      url: `https://ministryofvapes.com/blog/${post.slug}`,
      image: post.image,
      keywords: post.tags.join(", "),
      articleSection: post.category
    }))
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
        name: "Blog",
        item: "https://ministryofvapes.com/blog"
      }
    ]
  };

  return (
    <>
      <Head>
        <title>
          {selectedCategory !== "All" 
            ? `${selectedCategory} Articles - Ministry of Vapes Blog`
            : "Vaping Guides & Reviews - Ministry of Vapes Blog"
          }
        </title>
        <meta 
          name="description" 
          content={`Expert vaping guides, safety tips, product reviews, and industry insights. ${filteredPosts.length} articles covering everything from beginner guides to advanced techniques. Stay informed with Ministry of Vapes.`}
        />
        <meta name="keywords" content="vaping guides, e-liquid reviews, vaping safety, vaping technology, vaping tips, Ministry of Vapes blog" />
        <meta property="og:title" content="Vaping Guides & Expert Reviews - Ministry of Vapes Blog" />
        <meta property="og:description" content="Expert vaping guides, safety tips, product reviews, and industry insights from Ministry of Vapes professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ministryofvapes.com/blog" />
        <meta property="og:image" content={featuredPosts[0]?.image || "https://ministryofvapes.com/blog-og.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vaping Guides & Expert Reviews - Ministry of Vapes Blog" />
        <meta name="twitter:description" content="Expert vaping guides, safety tips, and product reviews from industry professionals." />
        <link rel="canonical" href="https://ministryofvapes.com/blog" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Blog</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Vaping Insights & Expert Guides
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with expert guides, safety tips, product reviews, and the latest industry insights from our vaping professionals.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search articles, guides, and reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {category}
                  {category !== "All" && (
                    <span className="ml-1 text-xs opacity-70">
                      ({mockPosts.filter(p => p.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "All" 
                ? `${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''} found`
                : `${mockPosts.length} articles available`
              }
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setCurrentPage(1);
                }}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Featured Articles */}
          {selectedCategory === "All" && !searchTerm && featuredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4 relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            Featured
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                          <span>{post.readTime}</span>
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{post.author}</p>
                              <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedPosts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                          <span>{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{post.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <span className="text-primary group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-12">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg border ${
                        currentPage === i + 1
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709M15 3H9a2 2 0 00-2 2v1.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 000 1.414l6.414 6.414a1 1 0 00.707.293H15a2 2 0 002-2V3z" />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                View all articles
              </button>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Stay Informed with Our Newsletter
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get the latest vaping guides, safety tips, product reviews, and exclusive insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe at any time. Read our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage; 