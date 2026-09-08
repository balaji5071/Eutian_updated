import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const userSessionCookie = req.cookies.eutian_user_session;
  const legacyAdminToken = req.cookies.admin_session;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_this_token';

  if (userSessionCookie) {
    try {
      const decoded = Buffer.from(userSessionCookie, 'base64').toString('utf-8');
      const user = JSON.parse(decoded);
      return res.status(200).json({ ok: true, authenticated: true, user });
    } catch (e) {
      // Invalid session
    }
  }

  if (legacyAdminToken && legacyAdminToken === ADMIN_TOKEN) {
    return res.status(200).json({
      ok: true,
      authenticated: true,
      user: { role: 'admin', name: 'Super Admin', email: process.env.ADMIN_EMAIL || 'admin@example.com' }
    });
  }

  return res.status(401).json({ ok: false, authenticated: false });
}
