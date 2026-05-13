import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

// * Solo se cachea como app a las rutas del encuestador (/instrument*) y a /login.
// * Landing y /admin quedan fuera del scope: la PWA no las precachea ni las
// * sirve desde el SW como navegación cacheada.
// * IMPORTANTE: la función urlPattern se serializa al SW con .toString(), por
// * lo que NO puede referenciar identificadores externos. Toda la lógica vive
// * inline dentro del callback.

export default withPWA({
  dest: "public",
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      // Navegaciones HTML del encuestador: NetworkFirst con fallback a cache.
      {
        urlPattern: ({
          request,
          url,
        }: {
          request: Request;
          url: URL;
        }) => {
          if (request.mode !== "navigate") return false;
          const path = url.pathname;
          return (
            path === "/instrument" ||
            path.startsWith("/instrument/") ||
            path === "/campaign" ||
            path.startsWith("/campaign/") ||
            path === "/login"
          );
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "surveyor-pages-cache",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // Listado de instrumentos activos: SWR para tener disponibilidad offline.
      {
        urlPattern: /\/api\/instruments(?:\?.*)?$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "instrument-list-cache",
          expiration: { maxEntries: 5, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // Renderizado del instrumento (estructura de la encuesta): SWR.
      {
        urlPattern: /\/api\/instruments\/.*\/render$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "instrument-render-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // Listado de campañas activas (público): SWR.
      {
        urlPattern: /\/api\/campaigns\/active(?:\?.*)?$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "campaign-list-cache",
          expiration: { maxEntries: 5, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // Render de campaña (pasos y condiciones): SWR.
      {
        urlPattern: /\/api\/campaigns\/.*\/render$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "campaign-render-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
    ],
  },
})(nextConfig);
