import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const token = req.cookies.admin_session;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (token && ADMIN_TOKEN && token === ADMIN_TOKEN) {
    return res.status(200).json({ ok: true, authenticated: true });
  }

  return res.status(401).json({ ok: false, authenticated: false });
}
