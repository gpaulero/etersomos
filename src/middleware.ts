import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/api/admin", "/api/cms"];
const METHOD_PROTECTED: Record<string, string[]> = {
  "/api/bookings": ["GET", "PUT", "DELETE"],
};

function isProtectedRoute(pathname: string, method: string): boolean {
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route)) return true;
  }
  for (const [route, methods] of Object.entries(METHOD_PROTECTED)) {
    if (pathname.startsWith(route) && methods.includes(method)) return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (!pathname.startsWith("/api/")) return addSecurityHeaders(request);

  const PUBLIC_ROUTES = ["/api/auth", "/api/newsletter", "/api/payments", "/api/memberships"];
  for (const route of PUBLIC_ROUTES) {
    if (pathname.startsWith(route)) return addSecurityHeaders(request);
  }

  if (!isProtectedRoute(pathname, method)) return addSecurityHeaders(request);

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Autenticacion requerida" }, { status: 401 });

  const apiSecret = process.env.ADMIN_API_SECRET;
  if (!apiSecret || token !== apiSecret) return NextResponse.json({ error: "Token invalido" }, { status: 403 });

  return addSecurityHeaders(request);
}

function addSecurityHeaders(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (request.nextUrl.pathname.startsWith("/api/")) response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
