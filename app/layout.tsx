import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sosagro4c.vercel.app"),
  title: {
    default: "SOS Agro 4C",
    template: "%s — SOS Agro 4C",
  },
  description:
    "Plataforma del proyecto SIGP 108927: fortalecimiento de capacidades científico-tecnológicas para café, cacao, cannabis y cáñamo en seis departamentos de Colombia.",
};

export const viewport: Viewport = {
  themeColor: "#14532d",
};

/**
 * Anti-FOUC (spec 63): lee la preferencia de tema de localStorage y aplica la
 * clase `dark` en <html> antes del primer paint. No puede importar
 * lib/theme/resolveTheme.ts porque corre como script inline sin bundlear;
 * replica su lógica mínima a propósito.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem("sosagro.theme");
    var preference = "system";
    if (raw) {
      var parsed = JSON.parse(raw);
      var stored = parsed && parsed.state && parsed.state.preference;
      if (stored === "light" || stored === "dark" || stored === "system") {
        preference = stored;
      }
    }
    var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var effective = preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;
    if (effective === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${jetbrainsMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
