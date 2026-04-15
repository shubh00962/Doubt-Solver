import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/expert') && token?.role !== 'expert') {
      return NextResponse.redirect(new URL('/dashboard/student', req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/room/:path*', '/book/:path*'],
};
