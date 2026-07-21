import { describe, expect, it } from "vitest";
import { isSafeRedirectPath } from "./safeRedirect";

describe("isSafeRedirectPath", () => {
  it("accepts a plain internal path", () => {
    expect(isSafeRedirectPath("/campaign")).toBe(true);
  });

  it("rejects null/undefined/empty", () => {
    expect(isSafeRedirectPath(null)).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
  });

  it("rejects protocol-relative paths (open redirect)", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
  });

  it("rejects paths that don't start with /", () => {
    expect(isSafeRedirectPath("evil.com")).toBe(false);
  });

  it("rejects redirects back into /login", () => {
    expect(isSafeRedirectPath("/login")).toBe(false);
    expect(isSafeRedirectPath("/login?from=/campaign")).toBe(false);
  });

  it("rejects paths carrying a query string or nested from= (loop growth)", () => {
    expect(isSafeRedirectPath("/campaign?foo=bar")).toBe(false);
    expect(isSafeRedirectPath("/campaign?from=/admin")).toBe(false);
  });

  it("rejects paths longer than 512 characters", () => {
    const long = "/" + "a".repeat(512);
    expect(isSafeRedirectPath(long)).toBe(false);
  });
});
