import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/',
  '/parcours',
  '/auth/login',
  '/auth/signup',
  '/api/',
];

const DASHBOARD_PATHS = ['/dashboard'];
const DASHBOARD_ROLES = ['COACH', 'ADMIN'];

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  onboardingDone?: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const loginPath = pathname.startsWith('/dashboard') ? '/dashboard/login' : '/auth/login';
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'default-secret');
    const { payload } = await jwtVerify(accessToken, secret);
    const user = payload as unknown as JwtPayload;

    // Dashboard role check
    if (DASHBOARD_PATHS.some((p) => pathname.startsWith(p)) && pathname !== '/dashboard/login') {
      if (!DASHBOARD_ROLES.includes(user.role)) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }

    // Onboarding gate (skip for dashboard and onboarding itself)
    if (
      !pathname.startsWith('/dashboard') &&
      pathname !== '/onboarding' &&
      !user.onboardingDone
    ) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
  } catch {
    // Token expired or invalid
    const loginPath = pathname.startsWith('/dashboard') ? '/dashboard/login' : '/auth/login';
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
