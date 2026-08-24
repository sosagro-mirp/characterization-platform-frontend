import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";

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
      {/* Ajuste post-Fase-5: se reemplaza la barra superior propia del
          dashboard por el mismo `<Navbar />` de "/" (fixed top-0 + padding
          de compensación en el contenido, mismo patrón que login/register).
          El dashboard no tiene `#inicio`, así que `isOverHero` cae en su
          fallback (`false`) y el navbar renderiza siempre en su estado
          sólido — ya trae el ThemeToggle que DESIGN.md exige en este header.

          Altura real del navbar (no la de login/register, que quedaba corta
          12px porque no contaba el padding propio del link del logo):
          outer `py-3 lg:py-4` (12px / 16px por lado) + link del logo
          `py-1.5` (6px por lado) + imagen `h-12` (48px) =
          84px en mobile, 92px en lg.

          DEBT (2026-08-05): se intentó centralizar este número en una
          variable CSS (`--dashboard-navbar-h`, `globals.css`) para no
          repetirlo en `DashboardSidebar.tsx` (hallazgo de `@reviewer`), pero
          el bundler (Turbopack/Lightning CSS de este proyecto) descarta esa
          declaración de `:root` en el CSS compilado — el `var()` queda sin
          valor y el navbar tapa el contenido. Revertido a valores en
          píxeles explícitos hasta investigar la causa del bundler; ver
          `spec/backlog.md`. */}
      <Navbar />
      <div className="flex-1 bg-surface-muted min-h-0 pt-[84px] lg:pt-[92px]">
        {children}
      </div>
    </div>
  );
}
