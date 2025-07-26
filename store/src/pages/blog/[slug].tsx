import { type NextPage } from "next";
import { type GetStaticProps, type GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

// Mock blog post data - In production, this would come from a CMS or database
const mockPosts = [
  {
    id: "1",
    slug: "understanding-vaping-beginners-guide",
    title: "Understanding Vaping: A Beginner's Guide",
    excerpt: "New to vaping? This comprehensive guide covers everything you need to know to get started safely and enjoyably.",
    content: `
      <h2>Introduction to Vaping</h2>
      <p>Vaping has become increasingly popular as an alternative to traditional smoking. Whether you're looking to quit smoking or simply curious about vaping, this guide will help you understand the basics.</p>
      
      <h2>What is Vaping?</h2>
      <p>Vaping is the act of inhaling vapor produced by an electronic cigarette or similar device. Unlike traditional cigarettes, vaping devices heat e-liquid to create vapor rather than burning tobacco.</p>
      
      <h2>Types of Vaping Devices</h2>
      <h3>1. Cigalikes</h3>
      <p>These devices look similar to traditional cigarettes and are often the first choice for beginners. They're simple to use but have limited battery life and vapor production.</p>
      
      <h3>2. Vape Pens</h3>
      <p>Slightly larger than cigalikes, vape pens offer better battery life and vapor production. They're still user-friendly and portable.</p>
      
      <h3>3. Pod Systems</h3>
      <p>Pod systems use replaceable pods containing e-liquid. They're compact, easy to use, and perfect for beginners.</p>
      
      <h3>4. Box Mods</h3>
      <p>These are larger, more powerful devices that offer customizable settings. They're better suited for experienced vapers.</p>
      
      <h2>Understanding E-Liquids</h2>
      <p>E-liquids typically contain:</p>
      <ul>
        <li><strong>Propylene Glycol (PG):</strong> Provides throat hit and carries flavor</li>
        <li><strong>Vegetable Glycerin (VG):</strong> Creates vapor and adds sweetness</li>
        <li><strong>Nicotine:</strong> Optional, available in various strengths</li>
        <li><strong>Flavorings:</strong> Food-grade flavorings for taste</li>
      </ul>
      
      <h2>Safety Tips for Beginners</h2>
      <ol>
        <li>Always buy from reputable vendors</li>
        <li>Start with lower nicotine strengths</li>
        <li>Keep devices and e-liquids away from children and pets</li>
        <li>Follow manufacturer instructions for device use and maintenance</li>
        <li>Never modify your device unless you know what you're doing</li>
      </ol>
      
      <h2>Getting Started</h2>
      <p>If you're ready to start vaping, we recommend:</p>
      <ol>
        <li>Choose a beginner-friendly device like a pod system</li>
        <li>Select an e-liquid flavor that appeals to you</li>
        <li>Start with a nicotine strength that matches your needs</li>
        <li>Take slow, gentle puffs to avoid overwhelming yourself</li>
        <li>Stay hydrated as vaping can cause dry mouth</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Vaping can be an enjoyable experience when done safely and responsibly. Take your time to find the right device and e-liquid for your needs, and don't hesitate to ask for help from experienced vapers or shop staff.</p>
    `,
    author: "Sarah Johnson",
    authorBio: "Sarah is a vaping expert with over 5 years of experience helping beginners transition to vaping.",
    date: "2024-01-15",
    category: "Guides",
    readTime: "5 min read",
    image: "/blog/beginners-guide.jpg",
    tags: ["beginners", "guide", "vaping basics", "getting started"],
  },
];

interface BlogPostPageProps {
  post: typeof mockPosts[0] | null;
}

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
        <Link
          href="/blog"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} - Ministry of Vapes Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:tag" content={post.tags.join(",")} />
      </Head>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground">/</li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                Blog
              </Link>
            </li>
            <li className="text-muted-foreground">/</li>
            <li className="text-primary">{post.category}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
              {post.category}
            </span>
            <span>{post.readTime}</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.authorBio}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-8">
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10" />
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg prose-slate max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="border-t border-border pt-8 mb-12">
          <h3 className="text-sm font-medium text-foreground mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm text-foreground transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="border-t border-border pt-8 mb-12">
          <h3 className="text-sm font-medium text-foreground mb-4">Share this article</h3>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ministryofvapes.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ministryofvapes.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ministryofvapes.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Want More Vaping Tips?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for the latest guides, product reviews, and exclusive offers.
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

        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mock related articles */}
            {[1, 2, 3].map((i) => (
              <article key={i} className="group">
                <Link href={`/blog/article-${i}`} className="block">
                  <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4">
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Related Article Title {i}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Brief description of the related article content goes here.
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = mockPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = mockPosts.find((p) => p.slug === slug) || null;

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 60, // Revalidate every hour
  };
};

export default BlogPostPage; 