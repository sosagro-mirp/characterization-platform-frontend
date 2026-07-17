export function isSafeRedirectPath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.startsWith("/login")) return false;
  // Previene el bucle de redirección: un `from` es siempre una ruta interna
  // simple. Si trae query o un `from=` anidado, es una redirección envuelta que
  // haría crecer la URL en cada rebote (middleware ⇄ AdminGuard) hasta congelar
  // el navegador; se rechaza. También se acota la longitud por seguridad.
  if (value.includes("?") || value.includes("from=")) return false;
  if (value.length > 512) return false;
  return true;
}
