import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/sessionCookie";

const PROTECTED_PREFIXES = ["/admin", "/instrument", "/campaign"];
const PANEL_ROLES = new Set(["admin", "researcher"]);

function isSafeFromPath(from: string | null): from is string {
  if (!from) return false;
  if (!from.startsWith("/") || from.startsWith("//")) return false;
  if (from.startsWith("/login")) return false;
  return true;
}

function destinationForRole(role: string | null): string {
  if (role && PANEL_ROLES.has(role)) return "/admin/instruments";
  return "/instrument";
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "1";
  const role = request.cookies.get(ROLE_COOKIE)?.value
    ? decodeURIComponent(request.cookies.get(ROLE_COOKIE)!.value)
    : null;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin")) {
      if (!role || !PANEL_ROLES.has(role)) {
        return NextResponse.redirect(new URL("/instrument", request.url));
      }
      if (
        role === "researcher" &&
        (pathname === "/admin/users" || pathname.startsWith("/admin/users/"))
      ) {
        return NextResponse.redirect(
          new URL("/admin/instruments", request.url),
        );
      }
    }

    return NextResponse.next();
  }

  if (pathname === "/login" && hasSession) {
    const from = request.nextUrl.searchParams.get("from");
    const target = isSafeFromPath(from) ? from : destinationForRole(role);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instrument/:path*",
    "/campaign/:path*",
    "/login",
  ],
};
