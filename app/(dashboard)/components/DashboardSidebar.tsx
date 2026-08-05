import Link from "next/link";
import { buildDashboardQuery, DashboardPageState } from "@/lib/dashboard/filters";
import { DashboardCategory } from "../types";

interface DashboardSidebarProps {
  categories: DashboardCategory[];
  state: DashboardPageState;
}

/**
 * Sidebar de navegación (spec 43, Fase 5): "Resumen general" + C1–C15.
 * Server Component — el estado activo se deriva de `state` (ya resuelto en
 * `page.tsx` desde `searchParams`), sin hooks de cliente. Cambiar de vista
 * conserva los filtros activos (D6): cada enlace reusa `state.filters`.
 *
 * Verde institucional fijo en claro (`bg-brand-dark`/`text-brand-light`),
 * pero **no** en oscuro: releído `DESIGN.md`, la "Regla de oro" de verde
 * fijo en ambos modos es para bloques institucionales autocontenidos
 * (Footer, badges) — la navegación real de la app (el propio `<Navbar />`
 * una vez sólido, fuera del hero) usa superficie **reactiva**
 * (`bg-white/95 dark:bg-[#0f172a]/95`), no verde fijo. Este sidebar sigue
 * ese mismo criterio: superficie reactiva (`--surface`/`--text-*`) en
 * oscuro, igual que el resto de la navegación de la app.
 *
 * En `lg` queda `fixed` bajo el `<Navbar />` (mismo `top` que su altura real,
 * 92px — ver comentario en `(dashboard)/layout.tsx`) y con scroll propio, así
 * no se desplaza con el contenido. En mobile sigue siendo una barra horizontal
 * en el flujo normal (no aplica `fixed`, no hay espacio para eso).
 *
 * DEBT (2026-08-05): este `92px` y el de `layout.tsx` volvieron a ser un
 * número duplicado — se había centralizado en `--dashboard-navbar-h`
 * (`globals.css`), pero el bundler del proyecto descarta esa custom
 * property de `:root` en el CSS compilado (ver `spec/backlog.md`).
 */
export default function DashboardSidebar({
  categories,
  state,
}: DashboardSidebarProps) {
  const overviewHref = `/dashboard?${buildDashboardQuery({ view: "overview", filters: state.filters })}`;
  const isOverviewActive = state.view === "overview";

  return (
    <aside className="w-full lg:w-80 shrink-0 flex lg:flex-col bg-brand-dark text-brand-light dark:bg-surface dark:text-text-primary border-r border-transparent dark:border-[var(--border)] overflow-x-auto lg:overflow-y-auto scrollbar-hide lg:fixed lg:top-[92px] lg:left-0 lg:h-[calc(100vh-92px)] lg:z-30">
      {/* Sin logo propio: el `<Navbar />` del layout ya lo muestra arriba. */}
      <div className="hidden lg:block px-5 pt-5 pb-4 border-b border-white/10 dark:border-[var(--border)]">
        <p className="text-xs lg:text-[10px] 2xl:text-sm font-semibold tracking-[0.16em] text-brand-light/70 dark:text-text-muted uppercase">
          Panel analítico
        </p>
      </div>

      <nav className="flex lg:flex-col gap-1 p-2 lg:p-3 lg:flex-1">
        <SidebarLink href={overviewHref} active={isOverviewActive}>
          Resumen general
        </SidebarLink>

        <p className="hidden lg:block mt-3 mb-1 px-3 text-xs lg:text-[10px] 2xl:text-sm font-semibold tracking-[0.14em] text-brand-light/60 dark:text-text-muted uppercase">
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
              <span className="w-7 shrink-0 text-xs lg:text-[10px] 2xl:text-sm font-bold text-brand-light/60 dark:text-text-muted">
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
      className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm lg:text-xs 2xl:text-base font-medium transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : "text-brand-light/90 hover:bg-white/10 dark:text-text-primary dark:hover:bg-surface-muted"
      }`}
    >
      {children}
    </Link>
  );
}
