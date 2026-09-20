import { GetServerSideProps } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { BlogPost } from '@/shared/schema';

const SITE_URL = 'https://www.eutian.com';

const STATIC_PAGES = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/services', changefreq: 'monthly', priority: '0.9' },
  { url: '/prototypes', changefreq: 'weekly', priority: '0.8' },
  { url: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/reviews', changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', changefreq: 'monthly', priority: '0.7' },
  { url: '/blog', changefreq: 'daily', priority: '0.8' },
  { url: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { url: '/terms', changefreq: 'yearly', priority: '0.3' },
];

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateSiteMap(blogs: Array<{ slug: string; updatedAt?: string; publishedAt?: string; createdAt?: string }>) {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = STATIC_PAGES.map((page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  const blogUrls = blogs.map((blog) => {
    const rawDate = blog.updatedAt || blog.publishedAt || blog.createdAt || currentDate;
    const dateFormatted = new Date(rawDate).toISOString().split('T')[0];
    return `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(blog.slug)}</loc>
    <lastmod>${dateFormatted}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls ? blogUrls + '\n' : ''}</urlset>`.trim();
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let blogs: Array<{ slug: string; updatedAt?: string; publishedAt?: string; createdAt?: string }> = [];

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection<BlogPost>('blogs');
    const items = await blogsCollection
      .find({ status: 'published' })
      .project({ slug: 1, updatedAt: 1, publishedAt: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    blogs = items.map((b) => ({
      slug: b.slug,
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined,
      publishedAt: b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Error querying blogs for sitemap:', error);
  }

  const xml = generateSiteMap(blogs);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return {
    props: {},
  };
};

export default function SiteMap() {
  return null;
}
