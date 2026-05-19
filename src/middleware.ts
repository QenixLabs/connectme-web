import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicTalentProfile = /^\/talent\/[^/]+(\/portfolio)?$/.test(pathname);
  if (isPublicTalentProfile) {
    return NextResponse.next();
  }

  const isAdmin = pathname.startsWith('/admin/');
  const isProtected =
    pathname.startsWith('/talent/') || pathname.startsWith('/recruiter/');

  if (isAdmin) {
    const authSession = request.cookies.get('auth_session')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    if (!authSession || userRole !== 'admin') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtected) {
    const authSession = request.cookies.get('auth_session')?.value;
    if (!authSession) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = request.cookies.get('user_role')?.value;
    const expectedRole = pathname.startsWith('/talent/') ? 'talent' : 'recruiter';

    if (userRole && userRole !== expectedRole) {
      const fallbackUrl =
        userRole === 'talent'
          ? '/talent/dashboard'
          : userRole === 'recruiter'
            ? '/recruiter/dashboard'
            : userRole === 'admin'
              ? '/admin/dashboard'
              : '/auth/login';
      return NextResponse.redirect(new URL(fallbackUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/talent/:path*', '/recruiter/:path*', '/admin/:path*'],
};
