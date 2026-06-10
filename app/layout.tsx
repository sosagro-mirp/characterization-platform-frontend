import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SosAgro 4.C ",
  description: "SosAgro 4.C es un proyecto financiado por el ministerio de ciencia ...",
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
      >
        {children}
      </body>
    </html>
  );
}
