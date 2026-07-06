import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MUST_CHANGE_COOKIE, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/sessionCookie";
import { isSafeRedirectPath } from "@/lib/safeRedirect";
import { defaultRouteForRole, PANEL_ROLES } from "@/lib/roleRouting";

const PROTECTED_PREFIXES = ["/admin", "/instrument", "/campaign", "/change-password"];

export function middleware(request: NextRequest) {
  // --- MAINTENANCE MODE ---
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  if (isMaintenanceMode && request.nextUrl.pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  // --- END MAINTENANCE MODE ---

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

    const mustChange = request.cookies.get(MUST_CHANGE_COOKIE)?.value === "1";
    if (mustChange && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    if (pathname.startsWith("/admin")) {
      if (!role || !PANEL_ROLES.has(role)) {
        return NextResponse.redirect(new URL("/campaign", request.url));
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
    const target = isSafeRedirectPath(from) ? from : defaultRouteForRole(role);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Applies middleware to all routes except:
     * - Next.js static files (_next/static, _next/image, favicon.ico)
     * - Files with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
