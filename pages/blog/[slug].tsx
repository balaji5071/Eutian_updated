import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Copy, 
  Tag, 
  ArrowRight
} from 'lucide-react';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';
import { getPublishedBlogBySlug, getRelatedBlogs, CleanBlogPost } from '@/lib/blogs';

interface BlogPostDetailProps {
  post: CleanBlogPost;
  relatedPosts: CleanBlogPost[];
}

// Markdown-like content renderer
function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-6 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg">
            {codeBlockLang && (
              <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-muted-foreground uppercase">
                {codeBlockLang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace('```', '');
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-heading font-bold text-lg text-white mt-6 mb-3">
          {line.replace('#### ', '')}
        </h4>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-heading font-bold text-xl sm:text-2xl text-white mt-8 mb-4">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="font-heading font-bold text-2xl sm:text-3xl text-white mt-10 mb-4 pb-2 border-b border-white/10">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-12 mb-6">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-6 pl-4 border-l-4 border-primary text-white/90 italic bg-primary/5 py-3 pr-4 rounded-r-xl">
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-6 list-disc text-white/80 my-1.5 leading-relaxed text-base">
          {line.trim().substring(2)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={`space-${i}`} className="h-4" />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-white/80 leading-relaxed text-base sm:text-lg my-3 font-light">
          {line}
        </p>
      );
    }
  }

  return <div className="prose prose-invert max-w-none">{elements}</div>;
}

export default function BlogPostDetail({ post, relatedPosts = [] }: BlogPostDetailProps) {
  const [copied, setCopied] = useState(false);

  if (!post) {
    return null;
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const canonicalUrl = `https://www.eutian.com/blog/${post.slug}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl;
  const isoPublishedDate = post.publishedAt || post.createdAt;
  const isoModifiedDate = post.updatedAt || isoPublishedDate;
  const coverImageUrl = post.coverImage || 'https://www.eutian.com/og-image.png';

  // JSON-LD Schema: BlogPosting / Article for rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: [coverImageUrl],
    datePublished: isoPublishedDate,
    dateModified: isoModifiedDate,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Eutian Team',
      jobTitle: post.author?.role || 'Author',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Eutian',
      url: 'https://www.eutian.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.eutian.com/image.png',
      },
    },
    articleSection: post.category,
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : '',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.eutian.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.eutian.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Head>
        <title key="title">{`${post.title} — Eutian Blog`}</title>
        <meta key="description" name="description" content={post.excerpt} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots Indexing Directive */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Open Graph / Facebook */}
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:title" property="og:title" content={`${post.title} — Eutian Blog`} />
        <meta key="og:description" property="og:description" content={post.excerpt} />
        <meta key="og:url" property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Eutian" />
        <meta key="og:image" property="og:image" content={coverImageUrl} />
        <meta property="og:image:alt" content={post.title} />
        <meta property="article:published_time" content={isoPublishedDate} />
        <meta property="article:modified_time" content={isoModifiedDate} />
        {post.author?.name && <meta property="article:author" content={post.author.name} />}
        {post.category && <meta property="article:section" content={post.category} />}
        {Array.isArray(post.tags) && post.tags.map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}

        {/* Twitter */}
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content={`${post.title} — Eutian Blog`} />
        <meta key="twitter:description" name="twitter:description" content={post.excerpt} />
        <meta key="twitter:image" name="twitter:image" content={coverImageUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <div className="min-h-screen bg-background py-12 sm:py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button & Breadcrumbs */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              data-testid="link-back-blog"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime || '5 min read'}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-6 leading-tight" data-testid="text-article-title">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-light mb-8">
              {post.excerpt}
            </p>

            {/* Author & Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/10">
              <div className="flex items-center gap-3">
                {post.author?.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full border border-white/20 object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{post.author?.name || 'Eutian Team'}</p>
                  <p className="text-xs text-muted-foreground">{post.author?.role || 'Author'}</p>
                </div>
              </div>

              {/* Social Share actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs"
                  title="Copy link"
                  data-testid="btn-share-copy"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-[#0a66c2]/20 hover:border-[#0a66c2]/40 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin className="w-4 h-4" />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Share on X"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </header>

          {/* Featured Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-72 sm:h-96 lg:h-[450px] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black/40">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div className="article-body mb-16 text-white/85">
            <MarkdownContent content={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 pb-10 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="pt-12 border-t border-white/10">
              <h3 className="font-heading font-bold text-2xl text-white mb-8">
                More from Eutian Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rPost) => (
                  <Link
                    key={rPost.id}
                    href={`/blog/${rPost.slug}`}
                    className="group flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/40 transition-all duration-300"
                  >
                    <div>
                      {rPost.coverImage && (
                        <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-black/40">
                          <img
                            src={rPost.coverImage}
                            alt={rPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-primary font-medium mb-1">{rPost.category}</p>
                      <h4 className="font-heading font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {rPost.title}
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1 mt-3">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {};

  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  try {
    const post = await getPublishedBlogBySlug(slug);

    // If blog does not exist or is unpublished, return true 404
    // This prevents Google Soft 404 errors (returning HTTP 200 on missing pages)
    if (!post) {
      return {
        notFound: true,
      };
    }

    const relatedPosts = await getRelatedBlogs(slug, 3);

    // CDN edge caching header
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );

    return {
      props: {
        post,
        relatedPosts,
      },
    };
  } catch (error) {
    console.error('Error in blog slug getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};
