"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { logout } from "@/services/auth.service";
import { useIsHydrated } from "@/hooks/useIsHydrated";

const sectionLinks = [
  { href: "/#proyecto", label: "El proyecto" },
  { href: "/#cultivos", label: "Cultivos" },
  { href: "/#territorios", label: "Territorios" },
  { href: "/#ejes", label: "Ejes" },
  { href: "/#participar", label: "Participar" },
  { href: "/#aliados", label: "Aliados" },
  { href: "/#resultados", label: "Resultados" },
] as const;

export const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const hydrated = useIsHydrated();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.replace("/");
  };

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
    : "bg-white/95 backdrop-blur-sm border-b border-gray-200";

  const brandClass = isOverHero ? "text-white" : "text-brand-dark";

  const linkBaseClass =
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded";
  const linkColorClass = isOverHero
    ? "text-gray-200 hover:text-white"
    : "text-gray-700 hover:text-brand-dark";

  const burgerColorClass = isOverHero
    ? "text-white hover:bg-white/10"
    : "text-gray-700 hover:bg-gray-100";

  const sessionTextClass = isOverHero ? "text-gray-100" : "text-gray-700";
  const logoutButtonClass = isOverHero
    ? "bg-white/10 border border-white/30 text-white hover:bg-white/20"
    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200";

  const showSession = hydrated && isAuthenticated && user;
  const isAdmin = !!showSession && user.role === "admin";

  const adminLinkClass = isOverHero
    ? "border-white/40 text-white hover:bg-white/10"
    : "border-brand/40 text-brand-dark hover:bg-brand/10";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${navClass}`}
      >
        <div className="flex items-center justify-between w-full mx-auto px-4 md:px-6 lg:px-8 py-3 lg:py-4">
          <Link
            href="/"
            className={`flex gap-3 items-center transition-colors duration-300 ${brandClass}`}
            aria-label="Inicio — SOS Agro 4C"
            onClick={closeMenu}
          >

            <span className="text-lg 2xl:text-xl font-bold tracking-tight">
              Sos Agro 4.C
            </span>
          </Link>

          <ul
            className={`hidden lg:flex gap-7 2xl:text-sm lg:text-xs  tracking-tight font-semibold transition-colors duration-300 ${linkColorClass}`}
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
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/instrument"
                  className={`inline-flex items-center px-4 py-2 rounded-lg border 2xl:text-sm lg:text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${adminLinkClass}`}
                >
                  Aplicar instrumento
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/instruments"
                    className={`inline-flex items-center px-4 py-2 rounded-lg border 2xl:text-sm lg:text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${adminLinkClass}`}
                  >
                    Panel administrativo
                  </Link>
                )}
                <span
                  className={`2xl:text-sm lg:text-xs font-semibold transition-colors duration-300 ${sessionTextClass}`}
                  title={user.email}
                >
                  {user.name} {user.lastName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`inline-flex items-center px-4 py-2 rounded-lg 2xl:text-sm lg:text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${logoutButtonClass}`}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
        {...(!isMenuOpen ? { inert: "" } : {})}
        className={`lg:hidden fixed inset-0 top-16 z-40 bg-white transition-all duration-300 ease-in-out ${isMenuOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-2"
          }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4 text-base tracking-tight border-t border-gray-100">
          {sectionLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={closeMenu}
                className="block py-3 text-gray-700 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            {showSession ? (
              <div className="flex flex-col gap-2">
                <span className="block py-2 text-center text-sm font-medium text-gray-700">
                  {user.name} {user.lastName}
                </span>
                <Link
                  href="/instrument"
                  onClick={closeMenu}
                  className="block w-full rounded-lg bg-brand py-3 text-center text-sm font-bold text-white"
                >
                  Aplicar instrumento
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/instruments"
                    onClick={closeMenu}
                    className="block w-full rounded-lg border border-brand py-3 text-center text-sm font-bold text-brand"
                  >
                    Panel administrativo
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg border border-brand py-3 text-center text-sm font-bold text-brand"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-lg bg-brand py-3 text-center text-sm font-bold text-white"
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
