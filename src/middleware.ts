import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",  // Auth page is the entry point
  "/dashboard",  // Temporarily allow dashboard for testing
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth",
  "/api/v1/health",
  "/api/sdk",
  "/api/v1/sdk",
  "/api/webhooks",
  "/api/email",
  "/api/onboarding",
  "/onboarding",
  "/unsubscribe",
];

const isPublicPath = (path: string): boolean => {
  return publicPaths.some((publicPath) => path.startsWith(publicPath));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next();
  }

  // Check for auth token (placeholder - will be replaced with NextAuth)
  const token = request.cookies.get("next-auth.session-token")?.value ||
                request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Redirect to auth page if no token
  if (!token) {
    const authUrl = new URL("/", request.url);
    authUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
