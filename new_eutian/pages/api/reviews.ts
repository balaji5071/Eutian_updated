import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Review = {
  _id?: ObjectId;
  name: string;
  email?: string;
  rating: number; // 1-5
  message: string;
  status: 'visible' | 'hidden';
  createdAt: Date;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'eutian';
    const db = client.db(dbName);
    const reviews = db.collection<Review>('reviews');

    if (req.method === 'POST') {
      const { name, email, rating, message } = req.body ?? {};
      if (!name || !message || typeof rating !== 'number') {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }
      const r = Math.max(1, Math.min(5, Math.round(rating)));
      const doc: Review = { name, email, rating: r, message, status: 'visible', createdAt: new Date() };
      const result = await reviews.insertOne(doc);
      return res.status(201).json({ ok: true, id: result.insertedId.toString() });
    }

    if (req.method === 'GET') {
      const all = req.query.all === '1' || req.query.all === 'true';
      const filter = all ? {} : { status: 'visible' };
      const items = await reviews.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
      const mapped = items.map(({ _id, ...rest }) => ({ id: _id?.toString(), ...rest }));
      return res.status(200).json({ ok: true, items: mapped });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body ?? {};
      if (!id || !status) return res.status(400).json({ ok: false, error: 'Missing id or status' });
      if (!['visible', 'hidden'].includes(status)) return res.status(400).json({ ok: false, error: 'Invalid status' });
      const result = await reviews.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query?.id ? { id: req.query.id } : req.body) as { id?: string };
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const result = await reviews.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount });
    }

    res.setHeader('Allow', ['POST', 'GET', 'PATCH', 'DELETE']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Reviews API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
