import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function expectedToken() {
  // Compare against a static token from env to avoid Node 'crypto' in Edge
  return process.env.ADMIN_TOKEN || '';
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isAdmin = url.pathname.startsWith('/admin');
  const isLogin = url.pathname.startsWith('/admin-login');

  if (isAdmin) {
    const token = req.cookies.get('admin_session')?.value;
    if (token !== expectedToken()) {
      url.pathname = '/admin-login';
      return NextResponse.redirect(url);
    }
  }
  if (isLogin) {
    const token = req.cookies.get('admin_session')?.value;
    if (token === expectedToken()) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin-login'],
};
