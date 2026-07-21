import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// JWT vive en localStorage (ver store/useAuthStore.ts) por paridad
// offline-first con mobile; el backend valida cada request igual. Esta CSP
// reduce la superficie de exfiltración vía XSS restringiendo de dónde puede
// cargarse/ejecutarse contenido, sin bloquear la app (Next inyecta estilos y
// el payload de hidratación inline, por eso 'unsafe-inline' en script/style;
// en dev además se permite 'unsafe-eval' y el websocket de HMR).
const apiOrigin = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
