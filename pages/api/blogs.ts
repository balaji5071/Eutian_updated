import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { BlogPost } from '@/shared/schema';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection<BlogPost>('blogs');

    if (req.method === 'GET') {
      const { slug, admin, category } = req.query;

      // Single blog fetch by slug
      if (typeof slug === 'string' && slug) {
        const query: any = { slug };
        if (admin !== '1') {
          query.status = 'published';
        }
        const item = await blogsCollection.findOne(query);
        if (!item) {
          return res.status(404).json({ ok: false, error: 'Blog post not found' });
        }
        const mapped = { id: item._id?.toString(), ...item };
        return res.status(200).json({ ok: true, item: mapped });
      }

      // Query list
      const filter: any = {};
      if (admin !== '1') {
        filter.status = 'published';
      }
      if (typeof category === 'string' && category && category !== 'All') {
        filter.category = category;
      }

      const items = await blogsCollection.find(filter).sort({ createdAt: -1 }).toArray();
      const mapped = items.map(({ _id, ...rest }) => ({ id: _id?.toString(), ...rest }));
      return res.status(200).json({ ok: true, items: mapped });
    }

    if (req.method === 'POST') {
      // Seed action
      if (req.body?.action === 'seed' || req.query?.seed === '1') {
        const seedItems: Omit<BlogPost, '_id'>[] = [
          {
            title: 'How Generative AI is Reshaping Modern Full-Stack Development',
            slug: 'how-generative-ai-is-reshaping-modern-full-stack-development',
            excerpt: 'Explore how AI-assisted code generation, intelligent agentic workflows, and real-time inference are supercharging engineering productivity across the stack.',
            content: `### The Paradigm Shift in Software Engineering

The intersection of artificial intelligence and full-stack web engineering is no longer speculative—it is fundamentally transforming how developers plan, construct, and scale production systems.

#### 1. From Repetitive Boilerplate to High-Level Architecture
Modern developers are no longer bogged down writing mundane CRUD operations, repetitive mock data, or boilerplate schemas. Instead, conversational intelligence and agentic tools allow engineers to focus on what matters most: **system design, user experience, and business logic**.

\`\`\`typescript
// Real-world AI Integration Pattern
export async function generateDynamicInsights(prompt: string) {
  const response = await aiClient.chat.completions.create({
    model: "claude-3-7-sonnet",
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content;
}
\`\`\`

#### 2. Self-Healing Pipelines and Real-Time Observability
AI integrations now proactively monitor runtime logs, catch edge-case anomalies before users report them, and provide context-aware suggestions for remediation.

#### What This Means for Startups
For early-stage startups, this shift drastically reduces time-to-market. What once took a five-person engineering team three months can now be brought to MVP status in just weeks.

> "The true superpower of modern AI isn't replacing engineers—it's giving high-agency developers the leverage of an entire specialized team."

At Eutian, we engineer modern web applications and AI chatbots that capitalize directly on this revolution.`,
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            category: 'AI & Automation',
            tags: ['AI', 'Full-Stack', 'Next.js', 'Engineering'],
            author: {
              name: 'Balaji',
              role: 'Founder & CEO',
              avatar: '/image.png',
            },
            status: 'published',
            readingTime: '5 min read',
            publishedAt: new Date(),
            createdAt: new Date(),
          },
          {
            title: 'Architecting High-Performance SaaS Products: From Zero to Production',
            slug: 'architecting-high-performance-saas-products',
            excerpt: 'A practical roadmap for technical founders on selecting frameworks, designing database schemas, managing auth, and optimizing frontend responsiveness.',
            content: `### Building for Speed, Scale, and Reliability

Creating a Software-as-a-Service (SaaS) application that converts visitors into loyal paying customers requires more than just functional code. It demands a fast, resilient architecture designed from day one.

#### Key Architectural Pillars

1. **Server-Side Rendering (SSR) & Hybrid Static Regeneration**: Combining pre-rendered static marketing pages with server-rendered authenticated dashboards ensures lightning-fast initial load times while retaining dynamic data agility.
2. **Unified Component Design Systems**: Utilizing Tailwind CSS alongside accessible primitives (like Radix UI) enforces visual consistency across every customer touchpoint.
3. **Optimistic UI Updates**: Using tools like TanStack Query gives users instantaneous feedback during critical actions like invoicing, profile updates, or team invites.

\`\`\`bash
# Essential production checklist
- [x] Sub-100ms API response latency
- [x] Responsive dark/light theme tokens
- [x] End-to-end type safety with TypeScript & Zod
\`\`\`

#### The Operational Secret: Streamlined Delivery
Even the cleanest codebase fails if delivery schedules slip. Combining agile sprint cadences with automated CI/CD and rigorous cross-team quality checks ensures your product consistently outpaces competitors.`,
            coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
            category: 'SaaS',
            tags: ['SaaS', 'Architecture', 'TypeScript', 'Performance'],
            author: {
              name: 'Srikar',
              role: 'Co-Founder & COO',
              avatar: '/image.png',
            },
            status: 'published',
            readingTime: '6 min read',
            publishedAt: new Date(),
            createdAt: new Date(),
          },
          {
            title: 'Why Next.js & Modern Headless Architecture Win in 2026',
            slug: 'why-nextjs-and-modern-headless-architecture-win',
            excerpt: 'Why decoupled frontends, serverless backends, and edge compute provide the ultimate competitive edge for modern digital businesses.',
            content: `### The Demise of Monolithic CMS Solutions

Traditional monolithic CMS platforms were groundbreaking in their time, but modern enterprises and ambitious startups require agility that monoliths simply cannot deliver.

#### The Advantages of Headless

- **Infinite Flexibility**: Present your digital brand across web apps, mobile applications, and IoT interfaces from one centralized content source.
- **Uncompromised Security**: Decoupling the frontend display layer eliminates the large attack surfaces common in legacy CMS systems.
- **Superior SEO & Core Web Vitals**: Blazing-fast edge caching and fine-grained asset optimization consistently produce 95+ Google Lighthouse scores.

Whether you're launching a sleek landing page, an e-commerce storefront, or an interactive community hub, headless architecture provides a future-proof foundation.`,
            coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            category: 'Web Development',
            tags: ['Next.js', 'Headless', 'Web Dev', 'SEO'],
            author: {
              name: 'Balaji',
              role: 'Founder & CEO',
              avatar: '/image.png',
            },
            status: 'published',
            readingTime: '4 min read',
            publishedAt: new Date(),
            createdAt: new Date(),
          }
        ];

        let seededCount = 0;
        for (const item of seedItems) {
          const existing = await blogsCollection.findOne({ slug: item.slug });
          if (existing) {
            await blogsCollection.updateOne({ _id: existing._id }, { $set: item });
          } else {
            await blogsCollection.insertOne(item as BlogPost);
            seededCount++;
          }
        }
        return res.status(200).json({ ok: true, message: `Seeded ${seedItems.length} blog posts successfully`, seededCount });
      }

      const {
        title,
        slug: userSlug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        authorName,
        authorRole,
        authorAvatar,
        status = 'draft',
        readingTime = '4 min read',
      } = req.body ?? {};

      if (!title || !content) {
        return res.status(400).json({ ok: false, error: 'Title and content are required' });
      }

      const slug = (userSlug && userSlug.trim()) ? slugify(userSlug) : slugify(title);

      // Check unique slug
      const existingSlug = await blogsCollection.findOne({ slug });
      const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      const newPost: BlogPost = {
        title,
        slug: finalSlug,
        excerpt: excerpt || title,
        content,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        category: category || 'General',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['General'],
        author: {
          name: authorName || 'Eutian Team',
          role: authorRole || 'Editor',
          avatar: authorAvatar || '/image.png',
        },
        status: status === 'published' ? 'published' : 'draft',
        readingTime: readingTime || '4 min read',
        publishedAt: status === 'published' ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await blogsCollection.insertOne(newPost);
      return res.status(201).json({ ok: true, id: result.insertedId.toString(), post: { id: result.insertedId.toString(), ...newPost } });
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body ?? {};
      if (!id) return res.status(400).json({ ok: false, error: 'Missing blog post id' });

      const cleanUpdates: any = { updatedAt: new Date() };

      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.slug !== undefined) cleanUpdates.slug = slugify(updates.slug);
      if (updates.excerpt !== undefined) cleanUpdates.excerpt = updates.excerpt;
      if (updates.content !== undefined) cleanUpdates.content = updates.content;
      if (updates.coverImage !== undefined) cleanUpdates.coverImage = updates.coverImage;
      if (updates.category !== undefined) cleanUpdates.category = updates.category;
      if (updates.readingTime !== undefined) cleanUpdates.readingTime = updates.readingTime;

      if (updates.tags !== undefined) {
        cleanUpdates.tags = Array.isArray(updates.tags)
          ? updates.tags
          : typeof updates.tags === 'string'
            ? updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [];
      }

      if (updates.authorName || updates.authorRole || updates.authorAvatar) {
        const existing = await blogsCollection.findOne({ _id: new ObjectId(id) });
        cleanUpdates.author = {
          name: updates.authorName || existing?.author?.name || 'Eutian Team',
          role: updates.authorRole || existing?.author?.role || 'Editor',
          avatar: updates.authorAvatar || existing?.author?.avatar || '/image.png',
        };
      }

      if (updates.status !== undefined) {
        cleanUpdates.status = updates.status === 'published' ? 'published' : 'draft';
        if (cleanUpdates.status === 'published' && !updates.publishedAt) {
          cleanUpdates.publishedAt = new Date();
        }
      }

      const result = await blogsCollection.updateOne({ _id: new ObjectId(id) }, { $set: cleanUpdates });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query?.id ? { id: req.query.id } : req.body) as { id?: string };
      if (!id) return res.status(400).json({ ok: false, error: 'Missing blog post id' });

      const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Blogs API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
