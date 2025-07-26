import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

// Mock blog data - In production, this would come from a CMS or database
const mockPosts = [
  {
    id: "1",
    slug: "understanding-vaping-beginners-guide",
    title: "Understanding Vaping: A Beginner's Guide",
    excerpt: "New to vaping? This comprehensive guide covers everything you need to know to get started safely and enjoyably.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    category: "Guides",
    readTime: "5 min read",
    image: "/blog/beginners-guide.jpg",
  },
  {
    id: "2",
    slug: "top-10-e-liquid-flavors-2024",
    title: "Top 10 E-Liquid Flavors of 2024",
    excerpt: "Discover the most popular e-liquid flavors this year, from classic tobacco to exotic fruit blends.",
    author: "Mike Chen",
    date: "2024-01-10",
    category: "Reviews",
    readTime: "3 min read",
    image: "/blog/top-flavors.jpg",
  },
  {
    id: "3",
    slug: "vaping-safety-best-practices",
    title: "Vaping Safety: Best Practices and Tips",
    excerpt: "Learn essential safety tips for vaping, including battery care, proper storage, and device maintenance.",
    author: "Dr. Emily Roberts",
    date: "2024-01-05",
    category: "Safety",
    readTime: "7 min read",
    image: "/blog/safety-tips.jpg",
  },
  {
    id: "4",
    slug: "evolution-of-vaping-technology",
    title: "The Evolution of Vaping Technology",
    excerpt: "From early e-cigarettes to modern pod systems, explore how vaping technology has advanced over the years.",
    author: "James Williams",
    date: "2023-12-28",
    category: "Technology",
    readTime: "6 min read",
    image: "/blog/tech-evolution.jpg",
  },
];

const BlogPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blog - Ministry of Vapes</title>
        <meta name="description" content="Read the latest news, guides, and reviews from Ministry of Vapes. Stay informed about vaping products and industry updates." />
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Vaping Insights & News
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay up to date with the latest in vaping technology, product reviews, and industry news.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["All", "Guides", "Reviews", "Safety", "Technology", "News"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPosts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4">
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 group-hover:opacity-75 transition-opacity" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
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

        {/* Newsletter CTA */}
        <div className="mt-16 bg-muted/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for the latest vaping news, exclusive offers, and product launches.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BlogPage; 