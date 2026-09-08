import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  BookOpen, 
  Filter 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/shared/schema';

type BlogItem = Omit<BlogPost, '_id' | 'createdAt'> & { id: string; createdAt: string };

export default function BlogIndex() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: blogs = [], isLoading, isError } = useQuery<BlogItem[]>({
    queryKey: ['public-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch blogs');
      return json.items as BlogItem[];
    },
    staleTime: 60_000,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesCategory = selectedCategory === 'All' || b.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const featuredPost = filteredBlogs.length > 0 && selectedCategory === 'All' && !searchQuery ? filteredBlogs[0] : null;
  const regularPosts = featuredPost ? filteredBlogs.slice(1) : filteredBlogs;

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      <Head>
        <title>Blog & Insights — Eutian</title>
        <meta
          name="description"
          content="Explore articles, guides, and thoughts on AI engineering, modern SaaS architectures, and full-stack development by Eutian."
        />
      </Head>

      <div className="flex flex-col min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insights & Technical Guides</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white mb-6 tracking-tight" data-testid="text-blog-title">
              Engineering & Digital Insights
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              In-depth articles, design patterns, and architectural blueprints on building intelligent web systems, SaaS platforms, and AI automation.
            </p>

            {/* Search and Filter bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles by title, topic, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white/[0.03] border-white/10 rounded-2xl text-white placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  data-testid="input-blog-search"
                />
              </div>
            </div>

            {/* Category pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-primary text-black font-semibold shadow-md shadow-primary/20'
                        : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                    data-testid={`btn-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">Loading articles...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-2">Failed to load blog posts.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm border border-primary/20"
                >
                  Try Again
                </button>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl p-12 max-w-xl mx-auto">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-60" />
                <h3 className="font-heading font-bold text-xl text-white mb-2">No articles found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {searchQuery
                    ? `No posts matched your search for "${searchQuery}". Try another keyword or clear filters.`
                    : 'Check back soon for upcoming articles!'}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-semibold text-xs transition-transform hover:scale-105"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                {/* Featured Post Card */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="group block relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-primary/5"
                      data-testid="card-featured-blog"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 lg:p-10">
                        {/* Featured Image */}
                        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                          {featuredPost.coverImage ? (
                            <img
                              src={featuredPost.coverImage}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/40">
                              <BookOpen className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-black shadow-md">
                              Featured Article
                            </span>
                          </div>
                        </div>

                        {/* Featured Content */}
                        <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                          <div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                              <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-primary border border-primary/20 font-medium">
                                {featuredPost.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {featuredPost.readingTime || '5 min read'}
                              </span>
                            </div>

                            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white group-hover:text-primary transition-colors duration-300 mb-4 leading-snug">
                              {featuredPost.title}
                            </h2>

                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-light">
                              {featuredPost.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                              {featuredPost.author?.avatar && (
                                <img
                                  src={featuredPost.author.avatar}
                                  alt={featuredPost.author.name}
                                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                                />
                              )}
                              <div>
                                <p className="text-xs font-semibold text-white">{featuredPost.author?.name || 'Eutian'}</p>
                                <p className="text-[10px] text-muted-foreground">{featuredPost.author?.role || 'Author'}</p>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                              Read Article <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Regular Posts Grid */}
                {regularPosts.length > 0 && (
                  <div>
                    {featuredPost && (
                      <h3 className="font-heading font-bold text-2xl text-white mb-6">
                        Latest Articles
                      </h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {regularPosts.map((post, idx) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                          className="h-full"
                        >
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group h-full flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-primary/5 p-5"
                            data-testid={`card-blog-${post.slug}`}
                          >
                            <div>
                              {/* Thumbnail */}
                              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5 bg-black/40 border border-white/5">
                                {post.coverImage ? (
                                  <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted/40">
                                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="absolute top-3 left-3">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background/80 backdrop-blur-md text-primary border border-primary/20">
                                    {post.category}
                                  </span>
                                </div>
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(post.publishedAt || post.createdAt)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {post.readingTime || '4 min read'}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="font-heading font-bold text-lg sm:text-xl text-white group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
                                {post.title}
                              </h3>

                              {/* Excerpt */}
                              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 font-light">
                                {post.excerpt}
                              </p>
                            </div>

                            {/* Author & Read More */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                {post.author?.avatar && (
                                  <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-6 h-6 rounded-full border border-white/20 object-cover"
                                  />
                                )}
                                <span className="text-xs font-medium text-white/80">{post.author?.name || 'Eutian'}</span>
                              </div>

                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                Read <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter / Project CTA */}
        <section className="py-20 bg-muted/20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-4">
              Have an Idea You Want to Bring to Life?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
              We engineer fast, scalable websites, SaaS applications, and intelligent chatbots for ambitious founders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
              >
                Get in Touch →
              </Link>
              <Link
                href="/prototypes"
                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Explore Prototypes
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
