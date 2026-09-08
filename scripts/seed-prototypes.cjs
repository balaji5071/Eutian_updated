#!/usr/bin/env node
const { loadEnvConfig } = require('@next/env');
const { MongoClient } = require('mongodb');

loadEnvConfig(process.cwd());

const samplePrototypes = [
  {
    title: 'ApexSaaS — AI Analytics Dashboard',
    category: 'SaaS',
    description: 'High-conversion SaaS web app prototype featuring real-time data visualization, AI insight widgets, dark mode design system, and multi-tenant user management.',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Framer Motion'],
    features: ['Dark/Light Mode', 'Interactive Real-time Charts', 'Role-based Auth UI', 'Stripe Billing Integration', 'Responsive Grid Layout'],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        order: 0
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
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
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        order: 0
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
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
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        order: 0
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
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
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        order: 0
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
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
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        order: 0
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
    ],
    createdAt: new Date()
  }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing in .env.local');
  }
  const dbName = (process.env.MONGODB_DB || 'eutian').toLowerCase();
  console.log(`Connecting to MongoDB database "${dbName}"...`);
  
  const client = new MongoClient(uri, { tls: true, tlsAllowInvalidCertificates: true, serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    const protosCol = db.collection('prototypes');

    console.log('Seeding prototype items...');
    for (const proto of samplePrototypes) {
      const existing = await protosCol.findOne({ title: proto.title });
      if (existing) {
        console.log(`- Updating existing prototype: "${proto.title}"`);
        await protosCol.updateOne({ _id: existing._id }, { $set: proto });
      } else {
        console.log(`+ Inserting prototype: "${proto.title}"`);
        await protosCol.insertOne(proto);
      }
    }
    console.log('✅ Prototypes seeded successfully!');
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
