"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { logout } from "@/services/auth.service";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { PANEL_ROLES } from "@/lib/roleRouting";

const sectionLinks = [
  { href: "/#cultivos", label: "Cultivos" },
  { href: "/#territorios", label: "Territorios" },
  { href: "/#ejes", label: "Ejes" },
  { href: "/#resultados", label: "Resultados" },
  { href: "/#grupos", label: "Grupos" },
  { href: "/#participar", label: "Participar" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const hydrated = useIsHydrated();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const closeMenu = () => setIsMenuOpen(false);
  const closeSessionMenu = () => setIsSessionMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeSessionMenu();
    closeMenu();
    router.replace("/");
  };

  useEffect(() => {
    if (!isSessionMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!sessionMenuRef.current?.contains(e.target as Node)) {
        closeSessionMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSessionMenu();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSessionMenuOpen]);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) {
      queueMicrotask(() => setIsOverHero(false));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverHero(entry.isIntersecting);
      },
      {
        // El hero deja de estar "visible" cuando el navbar (top: 0) ha cruzado
        // la mitad inferior del viewport del hero.
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const navClass = isOverHero
    ? "bg-transparent"
    : "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#334155]";

  const linkBaseClass =
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:focus-visible:ring-[#fde047] focus-visible:ring-offset-2 rounded";
  const linkColorClass = isOverHero
    ? "text-gray-200 hover:text-white"
    : "text-gray-700 dark:text-[#f1f5f9] hover:text-brand-dark dark:hover:text-white";

  const burgerColorClass = isOverHero
    ? "text-white hover:bg-white/10"
    : "text-gray-700 dark:text-[#f1f5f9] hover:bg-gray-100 dark:hover:bg-white/10";

  const sessionTextClass = isOverHero ? "text-gray-100" : "text-gray-700 dark:text-[#f1f5f9]";
  const sessionHoverClass = isOverHero ? "hover:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10";

  const showSession = hydrated && isAuthenticated && user;
  const isAdmin = !!showSession && !!user?.role && PANEL_ROLES.has(user.role);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${navClass}`}
      >
        <div className="flex items-center justify-between w-full mx-auto px-4 md:px-6 lg:px-8 py-3 lg:py-4">
          <Link
            href="/"
            className="flex items-center rounded-lg bg-white px-3 py-1.5"
            aria-label="Inicio — SOS Agro 4C"
            onClick={closeMenu}
          >
            <Image
              src="/logo-horizontal.png"
              alt="Sos Agro 4.C"
              width={2319}
              height={663}
              className="h-12 w-auto shrink-0"
              priority
            />
          </Link>

          <ul
            className={`hidden lg:flex gap-7 lg:text-sm  tracking-tight font-semibold transition-colors duration-300 ${linkColorClass}`}
          >
            {sectionLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkBaseClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 items-center">
            {showSession ? (
              <div className="relative hidden lg:block" ref={sessionMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsSessionMenuOpen((p) => !p)}
                  aria-haspopup="menu"
                  aria-expanded={isSessionMenuOpen}
                  className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 2xl:text-sm lg:text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:focus-visible:ring-[#fde047] focus-visible:ring-offset-2 ${sessionHoverClass}`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand dark:bg-[#fde047] text-sm font-bold uppercase text-white dark:text-brand-dark"
                    aria-hidden="true"
                  >
                    {user.name?.[0]}
                  </span>
                  <span
                    className={`transition-colors duration-300 ${sessionTextClass} text-sm`}
                    title={user.email}
                  >
                    {user.name} {user.lastName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isSessionMenuOpen ? "rotate-180" : ""} ${sessionTextClass}`}
                    aria-hidden="true"
                  />
                </button>

                {isSessionMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0f172a] py-1.5 shadow-lg"
                  >
                    <Link
                      href="/campaign"
                      role="menuitem"
                      onClick={closeSessionMenu}
                      className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#f1f5f9] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white"
                    >
                      Campañas
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/instruments"
                        role="menuitem"
                        onClick={closeSessionMenu}
                        className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#f1f5f9] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white"
                      >
                        Panel administrativo
                      </Link>
                    )}
                    <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-[#f1f5f9] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-brand dark:bg-[#fde047] text-white dark:text-brand-dark text-sm font-bold transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:focus-visible:ring-[#fde047] focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </Link>
            )}

            <button
              type="button"
              onClick={toggleMenu}
              className={`lg:hidden p-2 rounded transition-colors ${burgerColorClass}`}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`size-7 transition-transform duration-300 ${isMenuOpen ? "rotate-90" : "rotate-0"
                  }`}
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        {...(!isMenuOpen ? { inert: true } : {})}
        className={`lg:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-[#0f172a] transition-all duration-300 ease-in-out ${isMenuOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-2"
          }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4 text-base tracking-tight border-t border-gray-100 dark:border-white/10">
          {sectionLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={closeMenu}
                className="block py-3 text-gray-700 dark:text-[#f1f5f9] hover:text-brand-dark dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            {showSession ? (
              <div className="flex flex-col gap-2">
                <span className="block py-2 text-center text-sm font-medium text-gray-700 dark:text-[#f1f5f9]">
                  {user.name} {user.lastName}
                </span>
                <Link
                  href="/campaign"
                  onClick={closeMenu}
                  className="block w-full rounded-lg bg-brand dark:bg-[#fde047] py-3 text-center text-sm font-bold text-white dark:text-brand-dark"
                >
                  Campañas
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/instruments"
                    onClick={closeMenu}
                    className="block w-full rounded-lg border border-brand dark:border-[#fde047] py-3 text-center text-sm font-bold text-brand dark:text-[#fde047]"
                  >
                    Panel administrativo
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg border border-brand dark:border-[#fde047] py-3 text-center text-sm font-bold text-brand dark:text-[#fde047]"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-lg bg-brand dark:bg-[#fde047] py-3 text-center text-sm font-bold text-white dark:text-brand-dark"
              >
                Iniciar sesión
              </Link>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};
