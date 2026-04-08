import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public", // * El directorio donde se generará el service worker y los archivos relacionados
  reloadOnOnline: false, // * Evita que la aplicación se recargue automáticamente cuando el dispositivo vuelva a estar en línea
  disable: process.env.NODE_ENV === "development", // * Desactiva PWA en desarrollo para evitar problemas con el hot reloading
  workboxOptions: {
    runtimeCaching: [
      // * Configuración de caché para las rutas de renderizado de instrumentos
      {
        urlPattern: /\/api\/instruments\/.*\/render$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "instrument-render-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 }, // * Mantiene un máximo de 10 entradas durante 7 días
        },
      },
    ],
  },
})(nextConfig);
