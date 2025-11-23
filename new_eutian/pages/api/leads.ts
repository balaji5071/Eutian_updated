import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const PLAN_OPTIONS = ['Express', 'Standard', 'Premium', 'Custom'] as const;
type Lead = {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  websiteType?: string;
  plan?: (typeof PLAN_OPTIONS)[number];
  region: 'India' | 'Global';
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const leads = db.collection<Lead>('leads');

    if (req.method === 'POST') {
      const { name, email, region, message, phone, whatsapp, websiteType, plan } = req.body ?? {};
      if (!name || !email || !region || !message) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }
      const mappedPlan: Lead['plan'] = typeof plan === 'string' && PLAN_OPTIONS.includes(plan as Lead['plan'])
        ? (plan as Lead['plan'])
        : undefined;
      const doc: Lead = { name, email, region, message, phone, whatsapp, websiteType, plan: mappedPlan, status: 'new', createdAt: new Date() };
      const result = await leads.insertOne(doc);
      return res.status(201).json({ ok: true, id: result.insertedId.toString() });
    }

    if (req.method === 'GET') {
      const items = await leads
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      const mapped = items.map(({ _id, ...rest }) => ({ id: _id?.toString(), ...rest }));
      return res.status(200).json({ ok: true, items: mapped });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body ?? {};
      if (!id || !status) return res.status(400).json({ ok: false, error: 'Missing id or status' });
      if (!['new', 'contacted', 'closed'].includes(status)) return res.status(400).json({ ok: false, error: 'Invalid status' });
      const result = await leads.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query?.id ? { id: req.query.id } : req.body) as { id?: string };
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const result = await leads.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount });
    }

    res.setHeader('Allow', ['POST', 'GET', 'PATCH', 'DELETE']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Leads API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
