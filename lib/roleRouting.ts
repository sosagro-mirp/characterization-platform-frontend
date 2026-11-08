export const PANEL_ROLES = new Set(["admin", "researcher"]);

// Spec 102 — `/productores` es la entrada del encuestador y exige sesión.
export const PROTECTED_PREFIXES: readonly string[] = [
  "/admin",
  "/instrument",
  "/campaign",
  "/change-password",
  "/productores",
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function defaultRouteForRole(role: string | null | undefined): string {
  if (role && PANEL_ROLES.has(role)) return "/admin/instruments";
  return "/productores";
}
