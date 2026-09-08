import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Copy, 
  BookOpen, 
  Tag, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';
import { BlogPost } from '@/shared/schema';

type BlogItem = Omit<BlogPost, '_id' | 'createdAt'> & { id: string; createdAt: string };

// Helper to render markdown-like content into clean HTML components
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
      // Blockquote
      elements.push(
        <blockquote key={`quote-${i}`} className="my-6 pl-4 border-l-4 border-primary text-white/90 italic bg-primary/5 py-3 pr-4 rounded-r-xl">
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      // Bullet items
      elements.push(
        <li key={`li-${i}`} className="ml-6 list-disc text-white/80 my-1.5 leading-relaxed text-base">
          {line.trim().substring(2)}
        </li>
      );
    } else if (line.trim() === '') {
      // Spacer
      elements.push(<div key={`space-${i}`} className="h-4" />);
    } else {
      // Regular paragraph
      elements.push(
        <p key={`p-${i}`} className="text-white/80 leading-relaxed text-base sm:text-lg my-3 font-light">
          {line}
        </p>
      );
    }
  }

  return <div className="prose prose-invert max-w-none">{elements}</div>;
}

export default function BlogPostDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [copied, setCopied] = useState(false);

  // Fetch current post
  const { data: currentPost, isLoading, isError } = useQuery<BlogItem | null>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(`/api/blogs?slug=${slug}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch article');
      return json.item as BlogItem;
    },
    enabled: !!slug,
  });

  // Fetch all posts for related section
  const { data: allBlogs = [] } = useQuery<BlogItem[]>({
    queryKey: ['public-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      const json = await res.json();
      return (json.items || []) as BlogItem[];
    },
  });

  const relatedPosts = useMemo(() => {
    if (!currentPost) return [];
    return allBlogs
      .filter((b) => b.id !== currentPost.id)
      .slice(0, 3);
  }, [allBlogs, currentPost]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading article...</p>
      </div>
    );
  }

  if (isError || !currentPost) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 px-4 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-2">Article Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          The article you are looking for might have been moved, removed, or is currently in draft mode.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Articles
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Head>
        <title>{currentPost.title} — Eutian Blog</title>
        <meta name="description" content={currentPost.excerpt} />
        <meta property="og:title" content={`${currentPost.title} — Eutian Blog`} />
        <meta property="og:description" content={currentPost.excerpt} />
        {currentPost.coverImage && <meta property="og:image" content={currentPost.coverImage} />}
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
                {currentPost.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(currentPost.publishedAt || currentPost.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {currentPost.readingTime || '5 min read'}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-6 leading-tight" data-testid="text-article-title">
              {currentPost.title}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-light mb-8">
              {currentPost.excerpt}
            </p>

            {/* Author & Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/10">
              <div className="flex items-center gap-3">
                {currentPost.author?.avatar && (
                  <img
                    src={currentPost.author.avatar}
                    alt={currentPost.author.name}
                    className="w-10 h-10 rounded-full border border-white/20 object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{currentPost.author?.name || 'Eutian Team'}</p>
                  <p className="text-xs text-muted-foreground">{currentPost.author?.role || 'Author'}</p>
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
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentPost.title)}&url=${encodeURIComponent(currentUrl)}`}
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
          {currentPost.coverImage && (
            <div className="relative w-full h-72 sm:h-96 lg:h-[450px] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black/40">
              <img
                src={currentPost.coverImage}
                alt={currentPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div className="article-body mb-16 text-white/85">
            <MarkdownContent content={currentPost.content} />
          </div>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="pt-6 pb-10 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {currentPost.tags.map((tag) => (
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
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/40 transition-all duration-300"
                  >
                    <div>
                      {post.coverImage && (
                        <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-black/40">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-primary font-medium mb-1">{post.category}</p>
                      <h4 className="font-heading font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {post.title}
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
