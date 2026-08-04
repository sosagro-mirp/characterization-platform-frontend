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
    <div className="flex min-h-screen flex-col">
      {/* Fase 5 (spec 43): el diseño no tiene navbar propio — su sidebar aloja
          logo + navegación + perfil. Se conserva esta barra superior liviana
          (en vez de duplicar el logo en dos lugares) porque DESIGN.md exige
          el ThemeToggle en el header del dashboard público y es el único
          punto de retorno al sitio principal — mismo criterio que AdminShell
          ("Barra superior nueva... que aloja el ThemeToggle global"). */}
      <header className="bg-surface border-b border-[var(--border)] shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-horizontal.png"
              alt="SOSAgro 4C"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <ThemeToggle className="text-text-muted hover:bg-surface-muted" />
        </div>
      </header>
      <div className="flex-1 bg-surface-muted min-h-0">{children}</div>
    </div>
  );
}
