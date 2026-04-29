/**
 * Cookie espejo de sesión consumida por middleware.ts.
 *
 * El JWT vive en localStorage (compatible con offline-first), por lo que el
 * middleware de Next no puede leerlo. Esta cookie es una bandera "blanda" que
 * permite hacer la primera redirección antes de cargar /admin/**. La fuente
 * de verdad sigue siendo el token: el backend valida cada request y el
 * apiClient redirige a /login en 401 aunque la cookie haya sido manipulada.
 */
export const SESSION_COOKIE = "sosagro.session";
const MAX_AGE_DAYS = 7;

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
