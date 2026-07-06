export const PANEL_ROLES = new Set(["admin", "researcher"]);

export function defaultRouteForRole(role: string | null | undefined): string {
  if (role && PANEL_ROLES.has(role)) return "/admin/instruments";
  return "/campaign";
}
