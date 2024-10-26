import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Ignore static file requests like images, CSS, JS, etc.
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/) || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/profile');

  if (isStaticAsset) {
    return NextResponse.next(); // Allow static assets to load without redirection
  }

  // If the user has the "finance" role, redirect if they are not on a finance route
  if (token?.role === 'finance' && !pathname.startsWith('/finance')) {
    return NextResponse.redirect(new URL('/finance', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico|public).*)'],
};
