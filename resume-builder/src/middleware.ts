import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isProtectedRoute = pathname.startsWith("/resume");

  // Auth pages (login, register)
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  if (isProtectedRoute && !token) {
    // Redirect to login if token is missing
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    // If logged in, redirect away from auth pages to resume dashboard
    return NextResponse.redirect(new URL("/resume", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/resume/:path*", "/auth/:path*"],
};
