/**
 * Cookies espejo de sesión consumidas por middleware.ts.
 *
 * El JWT vive en localStorage (compatible con offline-first), por lo que el
 * middleware de Next no puede leerlo. Estas cookies son banderas "blandas" que
 * permiten hacer la primera redirección antes de cargar rutas protegidas.
 * La fuente de verdad sigue siendo el token: el backend valida cada request y
 * el apiClient redirige a /login en 401 aunque las cookies hayan sido
 * manipuladas. La cookie de rol solo se usa para decidir el destino tras
 * login (admin vs encuestador), nunca para autorizar.
 */
export const SESSION_COOKIE = "sosagro.session";
export const ROLE_COOKIE = "sosagro.role";
const MAX_AGE_DAYS = 7;

function buildCookie(name: string, value: string, maxAge: number): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = buildCookie(SESSION_COOKIE, "1", maxAge);
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = buildCookie(SESSION_COOKIE, "", 0);
}

export function setRoleCookie(role: string | null): void {
  if (typeof document === "undefined") return;
  if (!role) {
    clearRoleCookie();
    return;
  }
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = buildCookie(ROLE_COOKIE, encodeURIComponent(role), maxAge);
}

export function clearRoleCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = buildCookie(ROLE_COOKIE, "", 0);
}
