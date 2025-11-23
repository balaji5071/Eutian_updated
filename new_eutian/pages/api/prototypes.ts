import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Prototype = {
  _id?: ObjectId;
  title: string;
  image: string; // URL
  category: string;
  description: string;
  techStack: string[];
  features: string[];
  createdAt: Date;
};

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
      const { title, image, category, description, techStack, features } = req.body ?? {};
      if (!title || !image || !category || !description) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }
      const doc: Prototype = {
        title,
        image,
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
      ['title','image','category','description','techStack','features'].forEach((k) => {
        if (updates[k] !== undefined) clean[k] = updates[k];
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
