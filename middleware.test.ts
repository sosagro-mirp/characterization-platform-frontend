import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function makeRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const url = `https://app.sosagro.test${pathname}`;
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

describe("middleware", () => {
  const originalMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_MAINTENANCE_MODE;
  });

  afterEach(() => {
    if (originalMaintenance === undefined) {
      delete process.env.NEXT_PUBLIC_MAINTENANCE_MODE;
    } else {
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE = originalMaintenance;
    }
  });

  it("redirects unauthenticated requests on protected routes to /login with from=", () => {
    const res = middleware(makeRequest("/admin/instruments"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("from")).toBe("/admin/instruments");
  });

  it("lets an authenticated request through to a protected non-admin route", () => {
    const res = middleware(
      makeRequest("/campaign", { "sosagro.session": "1" }),
    );
    expect(res.status).toBe(200);
  });

  it("forces /change-password when must_change cookie is set", () => {
    const res = middleware(
      makeRequest("/campaign", {
        "sosagro.session": "1",
        "sosagro.must_change": "1",
      }),
    );
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/change-password",
    );
  });

  it("redirects a non-panel role away from /admin", () => {
    const res = middleware(
      makeRequest("/admin", {
        "sosagro.session": "1",
        "sosagro.role": "pollster",
      }),
    );
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/campaign");
  });

  it("redirects a researcher away from /admin/users to /admin/instruments", () => {
    const res = middleware(
      makeRequest("/admin/users", {
        "sosagro.session": "1",
        "sosagro.role": "researcher",
      }),
    );
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/admin/instruments",
    );
  });

  it("lets an admin through to /admin/users", () => {
    const res = middleware(
      makeRequest("/admin/users", {
        "sosagro.session": "1",
        "sosagro.role": "admin",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("redirects an authenticated /login visit to a safe `from` target", () => {
    const res = middleware(
      makeRequest("/login?from=%2Fcampaign", { "sosagro.session": "1" }),
    );
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/campaign");
  });

  it("falls back to the role default route when `from` is unsafe", () => {
    const res = middleware(
      makeRequest("/login?from=%2F%2Fevil.com", {
        "sosagro.session": "1",
        "sosagro.role": "admin",
      }),
    );
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/admin/instruments",
    );
  });

  it("redirects everything to /maintenance when maintenance mode is on", () => {
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE = "true";
    const res = middleware(makeRequest("/campaign"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/maintenance",
    );
  });
});
