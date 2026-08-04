import Image from "next/image";
import Link from "next/link";
import { buildDashboardQuery, DashboardPageState } from "@/lib/dashboard/filters";
import { DashboardCategory } from "../types";

interface DashboardSidebarProps {
  categories: DashboardCategory[];
  state: DashboardPageState;
}

/**
 * Sidebar oscuro de navegación (spec 43, Fase 5): "Resumen general" + C1–C15.
 * Server Component — el estado activo se deriva de `state` (ya resuelto en
 * `page.tsx` desde `searchParams`), sin hooks de cliente. Cambiar de vista
 * conserva los filtros activos (D6): cada enlace reusa `state.filters`.
 */
export default function DashboardSidebar({
  categories,
  state,
}: DashboardSidebarProps) {
  const overviewHref = `/dashboard?${buildDashboardQuery({ view: "overview", filters: state.filters })}`;
  const isOverviewActive = state.view === "overview";

  return (
    <aside className="w-full lg:w-60 shrink-0 flex lg:flex-col bg-brand-dark text-brand-light overflow-x-auto lg:overflow-visible">
      <div className="hidden lg:block px-4 pt-5 pb-4 border-b border-white/10">
        <div className="inline-block rounded-md bg-white px-2 py-1">
          <Image
            src="/logo-horizontal.png"
            alt="SOSAgro 4C"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </div>
        <p className="mt-3 text-[9px] font-semibold tracking-[0.16em] text-brand-light/70 uppercase">
          Panel analítico
        </p>
      </div>

      <nav className="flex lg:flex-col gap-1 p-2 lg:p-2.5 lg:flex-1">
        <SidebarLink href={overviewHref} active={isOverviewActive}>
          Resumen general
        </SidebarLink>

        <p className="hidden lg:block mt-3 mb-1 px-2.5 text-[9px] font-semibold tracking-[0.14em] text-brand-light/60 uppercase">
          Categorías
        </p>

        {categories.map((category) => {
          const href = `/dashboard?${buildDashboardQuery({
            view: "category",
            categoryId: category.code,
            filters: state.filters,
          })}`;
          const active = state.view === "category" && state.categoryId === category.code;
          const isDigitalDemand = category.code === "C15";

          return (
            <SidebarLink key={category.id} href={href} active={active}>
              <span className="w-6 shrink-0 text-[9px] font-bold text-brand-light/60">
                {category.code}
              </span>
              <span className="truncate">{category.name}</span>
              {isDigitalDemand && (
                <span className="text-[var(--accent)]" aria-hidden="true">
                  ★
                </span>
              )}
            </SidebarLink>
          );
        })}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : "text-brand-light/90 hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}
