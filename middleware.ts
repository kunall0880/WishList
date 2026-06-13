/**
 * Wishlist AI — Route Protection Middleware
 *
 * Protects dashboard routes — redirects unauthenticated users to /login.
 * When auth is not configured (no DB), allows access for development.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // In development without a DB, allow all access
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("user:password")) {
    return NextResponse.next();
  }

  // Dynamic import to avoid issues when auth is not configured
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If auth fails (no DB, etc.), allow access in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/goals/:path*",
    "/simulator/:path*",
    "/portfolio/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
