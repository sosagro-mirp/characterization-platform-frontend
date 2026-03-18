import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from '../components/navbar/Navbar';
import Footer from "@/components/footer/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});


export const metadata: Metadata = {
  title: "SosAgro 4.C ",
  description: "SosAgro 4.C es un proyecto financiado por el ministerio de ciencia ...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${jetbrainsMono.variable} ${jetbrainsMono.className} antialiased`}
      >

        <Navbar />
        {children}
        <Footer />

      </body>
    </html>
  );
}
