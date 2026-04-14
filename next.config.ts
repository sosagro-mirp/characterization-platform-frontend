import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public", // * El directorio donde se generará el service worker y los archivos relacionados
  reloadOnOnline: false, // * Evita que la aplicación se recargue automáticamente cuando el dispositivo vuelva a estar en línea
  disable: process.env.NODE_ENV === "development", // * Desactiva PWA en desarrollo para evitar problemas con el hot reloading
  workboxOptions: {
    runtimeCaching: [
      // * Cachea las páginas HTML con NetworkFirst para que estén disponibles offline
      {
        urlPattern: ({ request }: { request: Request }) =>
          request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // * Configuración de caché para las rutas de renderizado de instrumentos
      {
        urlPattern: /\/api\/instruments\/.*\/render$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "instrument-render-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
    ],
  },
})(nextConfig);
