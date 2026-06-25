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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${jetbrainsMono.className} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
