import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Employee, EmployeeRole } from '@/shared/schema';

export const SAMPLE_EMPLOYEES: Omit<Employee, '_id'>[] = [
  {
    name: 'Sarah Connor',
    email: 'sales@eutian.com',
    password: 'sales123',
    role: 'sales',
    department: 'Sales & Business Development',
    status: 'active',
    assignedTasks: ['Follow up with enterprise leads', 'Send proposal for Express plan'],
    createdAt: new Date(),
  },
  {
    name: 'Alex Rivera',
    email: 'marketing@eutian.com',
    password: 'marketing123',
    role: 'marketing',
    department: 'Growth & Content Marketing',
    status: 'active',
    assignedTasks: ['Update SaaS prototype gallery', 'Launch promotional offer banner'],
    createdAt: new Date(),
  },
  {
    name: 'David Kim',
    email: 'intern@eutian.com',
    password: 'intern123',
    role: 'intern',
    department: 'Web Development Internship',
    status: 'active',
    assignedTasks: ['Review customer lead submission forms', 'Draft responsive design tests'],
    createdAt: new Date(),
  },
  {
    name: 'Elena Rostova',
    email: 'dev@eutian.com',
    password: 'dev123',
    role: 'developer',
    department: 'Engineering & Architecture',
    status: 'active',
    assignedTasks: ['Optimize MongoDB connection pooling', 'Deploy Next.js build updates'],
    createdAt: new Date(),
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const employees = db.collection<Employee>('employees');

    if (req.method === 'GET') {
      let items = await employees.find({}).sort({ createdAt: -1 }).toArray();

      // Auto-seed if database is empty
      if (items.length === 0) {
        await employees.insertMany(SAMPLE_EMPLOYEES as any);
        items = await employees.find({}).sort({ createdAt: -1 }).toArray();
      }

      const mapped = items.map(({ _id, ...rest }) => ({ id: _id?.toString(), ...rest }));
      return res.status(200).json({ ok: true, items: mapped });
    }

    if (req.method === 'POST') {
      if (req.body?.action === 'seed') {
        let seededCount = 0;
        for (const emp of SAMPLE_EMPLOYEES) {
          const existing = await employees.findOne({ email: emp.email });
          if (existing) {
            await employees.updateOne({ _id: existing._id }, { $set: emp });
          } else {
            await employees.insertOne(emp as any);
            seededCount++;
          }
        }
        return res.status(200).json({ ok: true, message: 'Sample employees seeded successfully', seededCount });
      }

      const { name, email, password, role, department, status, assignedTasks, notes } = req.body ?? {};

      if (!name || !email || !password || !role) {
        return res.status(400).json({ ok: false, error: 'Missing required fields: name, email, password, role' });
      }

      // Check if email already exists
      const existing = await employees.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ ok: false, error: `Employee with email ${email} already exists` });
      }

      const doc: Employee = {
        name,
        email: email.toLowerCase().trim(),
        password,
        role: role as EmployeeRole,
        department: department || `${role.toUpperCase()} Department`,
        status: status || 'active',
        assignedTasks: Array.isArray(assignedTasks) ? assignedTasks : [],
        notes: notes || '',
        createdAt: new Date(),
      };

      const result = await employees.insertOne(doc);
      return res.status(201).json({ ok: true, id: result.insertedId.toString() });
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body ?? {};
      if (!id) return res.status(400).json({ ok: false, error: 'Missing employee id' });

      const clean: any = {};
      ['name', 'email', 'password', 'role', 'department', 'status', 'assignedTasks', 'notes'].forEach((k) => {
        if (updates[k] !== undefined) {
          if (k === 'email') clean[k] = updates[k].toLowerCase().trim();
          else clean[k] = updates[k];
        }
      });

      const result = await employees.updateOne({ _id: new ObjectId(id) }, { $set: clean });
      return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query?.id ? { id: req.query.id } : req.body) as { id?: string };
      if (!id) return res.status(400).json({ ok: false, error: 'Missing employee id' });

      const result = await employees.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, deletedCount: result.deletedCount });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Employees API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
