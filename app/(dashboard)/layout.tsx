import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export const metadata: Metadata = {
  title: "Dashboard Público",
  description:
    "Visualización pública y anonimizada de los datos recolectados por los instrumentos de diagnóstico de SOSAgro 4C en café, cacao, cannabis y cáñamo.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="bg-surface">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-horizontal.png"
              alt="SOSAgro 4C"
              width={175}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <ThemeToggle className="text-text-muted hover:bg-surface-muted" />
        </div>
      </header>
      {children}
    </>
  );
}
