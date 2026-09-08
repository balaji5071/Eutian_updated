import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { Employee } from '@/shared/schema';
import { SAMPLE_EMPLOYEES } from '../employees';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_me';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_this_token';
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Check Superadmin login
  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const sessionData = JSON.stringify({
      token: ADMIN_TOKEN,
      role: 'admin',
      name: 'Super Admin',
      email: ADMIN_EMAIL,
    });
    const encoded = Buffer.from(sessionData).toString('base64');

    res.setHeader('Set-Cookie', [
      `admin_session=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${isProd ? 'Secure;' : ''}`,
      `eutian_user_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${isProd ? 'Secure;' : ''}`
    ]);

    return res.status(200).json({
      ok: true,
      role: 'admin',
      name: 'Super Admin',
      redirectUrl: '/eutianadmin'
    });
  }

  // 2. Check Employee login in MongoDB database
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const employees = db.collection<Employee>('employees');

    let emp = await employees.findOne({ email: cleanEmail });

    // Auto-seed sample employees if collection is completely empty and matching email is in sample set
    if (!emp) {
      const sampleMatch = SAMPLE_EMPLOYEES.find(e => e.email.toLowerCase() === cleanEmail);
      if (sampleMatch) {
        const count = await employees.countDocuments({});
        if (count === 0) {
          await employees.insertMany(SAMPLE_EMPLOYEES as any);
          emp = await employees.findOne({ email: cleanEmail });
        }
      }
    }

    if (emp) {
      if (emp.password !== password) {
        return res.status(401).json({ ok: false, error: 'Invalid password' });
      }

      if (emp.status === 'inactive') {
        return res.status(403).json({ ok: false, error: 'Employee account is inactive. Please contact admin.' });
      }

      const sessionData = JSON.stringify({
        token: `emp_${emp._id?.toString()}`,
        id: emp._id?.toString(),
        role: emp.role,
        name: emp.name,
        email: emp.email,
        department: emp.department
      });

      const encoded = Buffer.from(sessionData).toString('base64');

      res.setHeader('Set-Cookie', [
        `eutian_user_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${isProd ? 'Secure;' : ''}`,
        `admin_session=emp_${emp._id?.toString()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${isProd ? 'Secure;' : ''}`
      ]);

      const redirectUrl = emp.role === 'admin' ? '/eutianadmin' : `/employee?role=${emp.role}`;

      return res.status(200).json({
        ok: true,
        role: emp.role,
        name: emp.name,
        email: emp.email,
        redirectUrl
      });
    }
  } catch (err) {
    console.error('Employee auth database lookup error:', err);
  }

  return res.status(401).json({ ok: false, error: 'Invalid email or password' });
}
