import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { email, password } = req.body ?? {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (email && password && ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_TOKEN && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = ADMIN_TOKEN;
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${isProd ? 'Secure;' : ''}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: 'Invalid credentials' });
}
