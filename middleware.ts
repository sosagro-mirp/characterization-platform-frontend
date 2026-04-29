import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "1";
  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const from = request.nextUrl.pathname + request.nextUrl.search;
  loginUrl.searchParams.set("from", from);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
