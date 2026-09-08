import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Prototype, MediaItem } from '@/shared/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const protos = db.collection<Prototype>('prototypes');

    if (req.method === 'GET') {
      const items = await protos.find({}).sort({ createdAt: -1 }).toArray();
      const mapped = items.map(({ _id, ...rest }) => ({ id: _id?.toString(), ...rest }));
      return res.status(200).json({ ok: true, items: mapped });
    }

    if (req.method === 'POST') {
      if (req.body?.action === 'seed' || req.query?.seed === '1') {
        const seedItems: Prototype[] = [
          {
            title: 'ApexSaaS — AI Analytics Dashboard',
            category: 'SaaS',
            description: 'High-conversion SaaS web app prototype featuring real-time data visualization, AI insight widgets, dark mode design system, and multi-tenant user management.',
            techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Framer Motion'],
            features: ['Dark/Light Mode', 'Interactive Real-time Charts', 'Role-based Auth UI', 'Stripe Billing Integration', 'Responsive Grid Layout'],
            media: [
              { type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', order: 0 },
              { type: 'image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', order: 1 }
            ],
            createdAt: new Date()
          },
          {
            title: 'LuxeCart — Headless E-Commerce Storefront',
            category: 'E-Commerce',
            description: 'Next-gen headless e-commerce experience with interactive product showcase, instant search filters, cart drawer, and seamless checkout flow.',
            techStack: ['Next.js', 'React', 'Tailwind CSS', 'Zustand', 'Cloudinary', 'Stripe'],
            features: ['Multi-currency Support', 'Product Quick View Modal', 'Instant Search & Filtering', 'Wishlist & Cart Drawer', 'Mobile-First Layout'],
            media: [
              { type: 'image', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80', order: 0 },
              { type: 'image', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', order: 1 }
            ],
            createdAt: new Date()
          },
          {
            title: 'HyperLaunch — Ultra High-Converting Landing Page',
            category: 'Landing Page',
            description: 'Optimized startup product launch page built for extreme speed and conversion with interactive ROI calculator, social proof carousel, and dynamic pricing builder.',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Lucide Icons'],
            features: ['Glassmorphism Aesthetics', 'Interactive ROI Calculator', 'High-Converting Lead Capture', 'SEO & Performance Optimized', 'Dynamic Banner System'],
            media: [
              { type: 'image', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', order: 0 },
              { type: 'image', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', order: 1 }
            ],
            createdAt: new Date()
          },
          {
            title: 'HealthPulse — Telehealth & Care Portal',
            category: 'Healthcare',
            description: 'HIPAA-friendly telemedicine booking and patient portal prototype with live consultation widgets, appointment calendar, and prescription tracking.',
            techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'MongoDB', 'Date-fns'],
            features: ['Doctor Booking Calendar', 'Patient Health Records Dashboard', 'Prescription Tracker', 'Secure Telehealth Interface'],
            media: [
              { type: 'image', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80', order: 0 },
              { type: 'image', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', order: 1 }
            ],
            createdAt: new Date()
          },
          {
            title: 'FinVault — Neobank & Wealth Portal',
            category: 'Fintech',
            description: 'Sleek financial management application featuring crypto & fiat assets breakdown, virtual card creation, transfer animations, and security controls.',
            techStack: ['React', 'Next.js', 'Tailwind CSS', 'Recharts', 'Radix UI'],
            features: ['Virtual Card Generator', 'Live Asset Tracker', 'Financial Analytics Graphs', 'Multi-Factor Auth Prompts'],
            media: [
              { type: 'image', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', order: 0 },
              { type: 'image', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', order: 1 }
            ],
            createdAt: new Date()
          }
        ];

        let insertedCount = 0;
        for (const item of seedItems) {
          const existing = await protos.findOne({ title: item.title });
          if (existing) {
            await protos.updateOne({ _id: existing._id }, { $set: item });
          } else {
            await protos.insertOne(item);
            insertedCount++;
          }
        }
        return res.status(200).json({ ok: true, message: `Seeded ${seedItems.length} prototypes successfully`, insertedCount });
      }

      const { title, media, category, description, techStack, features } = req.body ?? {};
      if (!title || !media || !Array.isArray(media) || media.length === 0 || !category || !description) {
        return res.status(400).json({ ok: false, error: 'Missing required fields (media must be a non-empty array)' });
      }
      const doc: Prototype = {
        title,
        media: media.map((item: any, idx: number) => ({
          type: item.type || 'image',
          url: item.url,
          order: item.order ?? idx
        })),
        category,
        description,
        techStack: Array.isArray(techStack) ? techStack : [],
        features: Array.isArray(features) ? features : [],
        createdAt: new Date(),
      };
      const result = await protos.insertOne(doc);
      return res.status(201).json({ ok: true, id: result.insertedId.toString() });
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body ?? {};
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const clean: any = {};
      ['title','media','category','description','techStack','features'].forEach((k) => {
        if (updates[k] !== undefined) {
          if (k === 'media' && Array.isArray(updates[k])) {
            clean[k] = updates[k].map((item: any, idx: number) => ({
              type: item.type || 'image',
              url: item.url,
              order: item.order ?? idx
            }));
          } else {
            clean[k] = updates[k];
          }
        }
      });
      const result = await protos.updateOne({ _id: new ObjectId(id) }, { $set: clean });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query?.id ? { id: req.query.id } : req.body) as { id?: string };
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const result = await protos.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount });
    }

    res.setHeader('Allow', ['GET','POST','PATCH','DELETE']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Prototypes API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
