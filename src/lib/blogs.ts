import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { BlogPost } from '@/shared/schema';

export type CleanBlogPost = Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
  id: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
};

function mapBlog(b: BlogPost): CleanBlogPost {
  return {
    id: b._id?.toString() || b.id || '',
    title: b.title || '',
    slug: b.slug || '',
    excerpt: b.excerpt || '',
    content: b.content || '',
    coverImage: b.coverImage || '',
    category: b.category || 'General',
    tags: Array.isArray(b.tags) ? b.tags : [],
    author: {
      name: b.author?.name || 'Eutian Team',
      role: b.author?.role || 'Author',
      avatar: b.author?.avatar || '/image.png',
    },
    status: b.status || 'published',
    readingTime: b.readingTime || '5 min read',
    publishedAt: b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined,
  };
}

export async function getPublishedBlogBySlug(slug: string): Promise<CleanBlogPost | null> {
  if (!slug) return null;
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const item = await db.collection<BlogPost>('blogs').findOne({
      slug: slug.trim(),
      status: 'published',
    });
    if (!item) return null;
    return mapBlog(item);
  } catch (error) {
    console.error(`Error querying blog by slug (${slug}):`, error);
    return null;
  }
}

export async function getAllPublishedBlogs(category?: string): Promise<CleanBlogPost[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const filter: Record<string, any> = { status: 'published' };
    if (category && category !== 'All') {
      filter.category = category;
    }
    const items = await db.collection<BlogPost>('blogs')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return items.map(mapBlog);
  } catch (error) {
    console.error('Error querying all published blogs:', error);
    return [];
  }
}

export async function getRelatedBlogs(slug: string, limit = 3): Promise<CleanBlogPost[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const items = await db.collection<BlogPost>('blogs')
      .find({ status: 'published', slug: { $ne: slug } })
      .project({ title: 1, slug: 1, category: 1, coverImage: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return items.map((r) => ({
      id: r._id?.toString() || '',
      title: r.title,
      slug: r.slug,
      category: r.category || 'General',
      coverImage: r.coverImage || '',
      excerpt: '',
      content: '',
      tags: [],
      author: { name: 'Eutian Team' },
      status: 'published',
      readingTime: '5 min read',
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error querying related blogs:', error);
    return [];
  }
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const items = await db.collection<BlogPost>('blogs')
      .find({ status: 'published' })
      .project({ slug: 1 })
      .toArray();
    return items.map((i) => i.slug).filter(Boolean);
  } catch (error) {
    console.error('Error querying blog slugs:', error);
    return [];
  }
}
