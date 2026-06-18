"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { logout } from "@/services/auth.service";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function CampaignIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5}
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
      />
    </svg>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5}
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  );
}

const PANEL_ROLES = ["admin", "researcher"];

export default function PollsterNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? null;
  const canAccessPanel = userRole !== null && PANEL_ROLES.includes(userRole);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isCampaignActive =
    pathname === "/campaign" || pathname.startsWith("/campaign/");
  const isDashboardActive = pathname.startsWith("/admin");

  const items: NavItem[] = [
    {
      label: "Campañas",
      href: "/campaign",
      icon: <CampaignIcon active={isCampaignActive} />,
    },
    ...(canAccessPanel
      ? [
        {
          label: "Panel",
          href: "/admin/instruments",
          icon: <DashboardIcon active={isDashboardActive} />,
        },
      ]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/campaign") return isCampaignActive;
    return isDashboardActive;
  };

  return (
    <>
      {/* ── Desktop: top navbar ───────────────────────────────────────────── */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 z-40 h-14 items-center border-b border-neutral-200 bg-white px-6 shadow-sm">
        <span className="mr-8 text-base font-bold text-green-700 tracking-tight select-none">
          SosAgro4.C
        </span>
        <nav className="flex items-center gap-1 flex-1">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active
                  ? "bg-green-50 text-green-700"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-medium text-neutral-600">
              {user.name} {user.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      {/* ── Mobile: bottom navigation bar ────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-neutral-200 bg-white">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${active
                ? "text-green-700"
                : "text-neutral-400 hover:text-neutral-600"
                }`}
            >
              {/* active indicator line at the top */}
              <span
                className={`absolute top-0 h-0.5 w-12 rounded-full transition-colors ${active ? "bg-green-600" : "bg-transparent"
                  }`}
              />
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Salir
        </button>
      </nav>
    </>
  );
}
