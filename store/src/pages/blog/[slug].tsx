import { useState, useEffect, useMemo } from "react";
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
    title: "Understanding Vaping: A Beginner's Guide to Safe Vaping",
    excerpt: "New to vaping? This comprehensive guide covers everything you need to know to get started safely and enjoyably, from device selection to e-liquid basics.",
    content: `
      <h2 id="introduction">Introduction to Vaping</h2>
      <p>Vaping has become increasingly popular as an alternative to traditional smoking. Whether you're looking to quit smoking or simply curious about vaping, this comprehensive guide will help you understand the basics and get started safely.</p>
      
      <h2 id="what-is-vaping">What is Vaping?</h2>
      <p>Vaping is the act of inhaling vapor produced by an electronic cigarette or similar device. Unlike traditional cigarettes, vaping devices heat e-liquid to create vapor rather than burning tobacco. This process eliminates many of the harmful byproducts associated with combustion.</p>
      
      <h2 id="types-of-devices">Types of Vaping Devices</h2>
      <p>Understanding the different types of vaping devices is crucial for beginners. Each type offers different features, complexity levels, and user experiences.</p>
      
      <h3 id="cigalikes">1. Cigalikes</h3>
      <p>These devices look similar to traditional cigarettes and are often the first choice for beginners. They're simple to use but have limited battery life and vapor production. Perfect for those transitioning from smoking.</p>
      
      <h3 id="vape-pens">2. Vape Pens</h3>
      <p>Slightly larger than cigalikes, vape pens offer better battery life and vapor production. They're still user-friendly and portable, making them ideal for everyday use.</p>
      
      <h3 id="pod-systems">3. Pod Systems</h3>
      <p>Pod systems use replaceable pods containing e-liquid. They're compact, easy to use, and perfect for beginners. Many modern pod systems offer excellent flavor and convenience.</p>
      
      <h3 id="box-mods">4. Box Mods</h3>
      <p>These are larger, more powerful devices that offer customizable settings. They're better suited for experienced vapers who want more control over their vaping experience.</p>
      
      <h2 id="understanding-eliquids">Understanding E-Liquids</h2>
      <p>E-liquids are the heart of the vaping experience. Understanding their components helps you make informed choices about what you're inhaling.</p>
      
      <p>E-liquids typically contain four main ingredients:</p>
      <ul>
        <li><strong>Propylene Glycol (PG):</strong> Provides throat hit and carries flavor effectively. Higher PG ratios offer stronger throat hits.</li>
        <li><strong>Vegetable Glycerin (VG):</strong> Creates vapor clouds and adds sweetness. Higher VG ratios produce more vapor.</li>
        <li><strong>Nicotine:</strong> Optional ingredient available in various strengths from 0mg to 50mg+.</li>
        <li><strong>Flavorings:</strong> Food-grade flavorings that provide taste. Thousands of flavors are available.</li>
      </ul>
      
      <h2 id="safety-tips">Safety Tips for Beginners</h2>
      <p>Safety should always be your top priority when vaping. Following these guidelines ensures a safe and enjoyable experience:</p>
      <ol>
        <li><strong>Buy from reputable vendors:</strong> Always purchase devices and e-liquids from trusted, established retailers.</li>
        <li><strong>Start with lower nicotine strengths:</strong> Begin with lower concentrations and adjust as needed.</li>
        <li><strong>Keep away from children and pets:</strong> Store all vaping products safely out of reach.</li>
        <li><strong>Follow manufacturer instructions:</strong> Read and follow all device instructions carefully.</li>
        <li><strong>Never modify devices:</strong> Don't attempt modifications unless you're experienced and knowledgeable.</li>
        <li><strong>Use proper chargers:</strong> Only use the charger provided with your device.</li>
        <li><strong>Stay hydrated:</strong> Vaping can cause mild dehydration, so drink plenty of water.</li>
      </ol>
      
      <h2 id="getting-started">Getting Started: Your First Steps</h2>
      <p>Ready to begin your vaping journey? Follow these steps for the best start:</p>
      <ol>
        <li><strong>Choose a beginner-friendly device:</strong> Pod systems or simple vape pens are ideal starters.</li>
        <li><strong>Select appealing flavors:</strong> Try different flavor profiles to find what you enjoy.</li>
        <li><strong>Pick appropriate nicotine strength:</strong> Match the strength to your current smoking habits if transitioning.</li>
        <li><strong>Take gentle puffs:</strong> Start with slow, gentle inhalations to avoid overwhelming yourself.</li>
        <li><strong>Stay hydrated:</strong> Keep water nearby as vaping can cause dry mouth.</li>
        <li><strong>Be patient:</strong> It may take time to find your preferred setup and technique.</li>
      </ol>
      
      <h2 id="maintenance">Basic Device Maintenance</h2>
      <p>Proper maintenance ensures your device performs well and lasts longer:</p>
      <ul>
        <li>Clean your device regularly with a soft, dry cloth</li>
        <li>Replace coils when flavor diminishes or vapor production decreases</li>
        <li>Charge your battery before it completely drains</li>
        <li>Store your device in a cool, dry place</li>
        <li>Check for leaks regularly and clean if necessary</li>
      </ul>
      
      <h2 id="conclusion">Conclusion</h2>
      <p>Vaping can be an enjoyable and potentially less harmful alternative to smoking when done safely and responsibly. Take your time to research, find the right device and e-liquid for your needs, and don't hesitate to ask for help from experienced vapers or knowledgeable shop staff. Remember that everyone's experience is different, so what works for others may not work for you – and that's perfectly normal.</p>
      
      <p>Most importantly, prioritize safety, start slowly, and enjoy the journey of discovering what works best for you.</p>
    `,
    author: "Sarah Johnson",
    authorBio: "Sarah is a certified vaping consultant with over 5 years of experience helping beginners transition to vaping safely. She holds certifications in tobacco harm reduction and specializes in beginner education.",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b5be?w=200&h=200&fit=crop&crop=face",
    date: "2024-01-15",
    lastModified: "2024-01-20",
    category: "Guides",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630",
    tags: ["beginners", "guide", "safety", "devices", "e-liquids"],
    wordCount: 1250,
    difficulty: "Beginner",
    featured: true,
  },
  {
    id: "2",
    slug: "top-10-e-liquid-flavors-2024",
    title: "Top 10 E-Liquid Flavors of 2024: Expert Reviews & Recommendations",
    excerpt: "Discover the most popular and highest-rated e-liquid flavors this year, from classic tobacco to exotic fruit blends. Expert tested and reviewed.",
    content: `
      <h2 id="introduction">The Year's Best Flavors</h2>
      <p>2024 has been an exceptional year for e-liquid innovation, with manufacturers pushing the boundaries of flavor complexity and quality...</p>
    `,
    author: "Mike Chen",
    authorBio: "Mike is a senior product reviewer with extensive experience testing e-liquids from around the world. He has reviewed over 1,000 different flavors.",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    date: "2024-01-10",
    lastModified: "2024-01-12",
    category: "Reviews",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=1200&h=630",
    tags: ["flavors", "reviews", "2024", "recommendations", "testing"],
    wordCount: 950,
    difficulty: "Intermediate",
    featured: true,
  },
];

// Related posts based on category/tags
const getRelatedPosts = (currentPost: typeof mockPosts[0]) => {
  return mockPosts
    .filter(post => 
      post.id !== currentPost.id && 
      (post.category === currentPost.category || 
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, 3);
};

// Extract headings for table of contents
const extractHeadings = (content: string) => {
  const headingRegex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[2-3]>/g;
  const headings: Array<{ level: number; id: string; text: string }> = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]!),
      id: match[2]!,
      text: match[3]!,
    });
  }
  
  return headings;
};

interface BlogPostPageProps {
  post: typeof mockPosts[0] | null;
}

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  const router = useRouter();
  const [activeHeading, setActiveHeading] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);

  const headings = useMemo(() => 
    post ? extractHeadings(post.content) : [], 
    [post?.content]
  );

  const relatedPosts = useMemo(() => 
    post ? getRelatedPosts(post) : [], 
    [post]
  );

  // Handle scroll for active heading
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveHeading(headings[i]!.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleShare = async (platform?: string) => {
    if (!post) return;

    const url = `https://ministryofvapes.com/blog/${post.slug}`;
    const text = post.title;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (navigator.share) {
      try {
        await navigator.share({ title: text, text: post.excerpt, url });
      } catch (err) {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowShareMenu(false);
    }
  };

  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or may have been moved.</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: {
      "@type": "Person",
      name: post.author,
      description: post.authorBio,
      image: post.authorImage
    },
    publisher: {
      "@type": "Organization",
      name: "Ministry of Vapes",
      url: "https://ministryofvapes.com",
      logo: {
        "@type": "ImageObject",
        url: "https://ministryofvapes.com/logo.png"
      }
    },
    datePublished: post.date,
    dateModified: post.lastModified,
    url: `https://ministryofvapes.com/blog/${post.slug}`,
    wordCount: post.wordCount,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    about: post.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ministryofvapes.com/blog/${post.slug}`
    }
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
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.category,
        item: `https://ministryofvapes.com/blog?category=${post.category}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `https://ministryofvapes.com/blog/${post.slug}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is this article about?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: post.excerpt
        }
      },
      {
        "@type": "Question",
        name: "Who wrote this article?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `This article was written by ${post.author}, ${post.authorBio}`
        }
      },
      {
        "@type": "Question",
        name: "How long does it take to read?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `This article takes approximately ${post.readTime} to read and contains ${post.wordCount} words.`
        }
      }
    ]
  };

  return (
    <>
      <Head>
        <title>{post.title} - Ministry of Vapes Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags.join(", ")} />
        <meta name="author" content={post.author} />
        <meta name="article:author" content={post.author} />
        <meta name="article:published_time" content={post.date} />
        <meta name="article:modified_time" content={post.lastModified} />
        <meta name="article:section" content={post.category} />
        <meta name="article:tag" content={post.tags.join(", ")} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://ministryofvapes.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image} />
        <meta name="twitter:creator" content="@ministryofvapes" />
        <link rel="canonical" href={`https://ministryofvapes.com/blog/${post.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-background">
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/blog?category=${post.category}`} className="hover:text-foreground transition-colors">
                  {post.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{post.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {post.wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {post.difficulty}
              </span>
              <time dateTime={post.date} className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              {post.lastModified !== post.date && (
                <span className="text-xs">
                  Updated: {new Date(post.lastModified).toLocaleDateString("en-GB")}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-8 p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src={post.authorImage} 
                  alt={post.author}
                  className="h-16 w-16 rounded-full object-cover"
                  width={64}
                  height={64}
                />
                <div>
                  <p className="font-semibold text-foreground text-lg">{post.author}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {post.authorBio}
                  </p>
                </div>
              </div>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-lg"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-lg"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-lg"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-lg"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <aside className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="rounded-lg border border-border bg-muted/30 p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
                    <nav>
                      <ul className="space-y-2">
                        {headings.map((heading) => (
                          <li key={heading.id}>
                            <a
                              href={`#${heading.id}`}
                              className={`block text-sm transition-colors ${
                                heading.level === 2 ? 'font-medium' : 'ml-4 text-muted-foreground'
                              } ${
                                activeHeading === heading.id 
                                  ? 'text-primary' 
                                  : 'hover:text-foreground'
                              }`}
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              </aside>
            )}

            {/* Article Content */}
            <div className={`${headings.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* Featured Image */}
              <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-8">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  width={1200}
                  height={630}
                />
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg prose-slate max-w-none
                  prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:text-foreground prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:text-foreground prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-li:text-muted-foreground prose-li:leading-relaxed
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="border-t border-border pt-8 mt-12 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?search=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              <div className="border-t border-border pt-8 mb-12">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Enjoyed This Article?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Get more expert vaping guides and industry insights delivered to your inbox.
                  </p>
                  <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <button
                      type="submit"
                      className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-border pt-12 mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="group">
                    <Link href={`/blog/${relatedPost.slug}`} className="block">
                      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          width={400}
                          height={225}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {relatedPost.category}
                        </span>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{relatedPost.readTime}</span>
                          <span>•</span>
                          <span>{new Date(relatedPost.date).toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = mockPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: "blocking",
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
    revalidate: 3600, // Revalidate every hour
  };
};

export default BlogPostPage; 