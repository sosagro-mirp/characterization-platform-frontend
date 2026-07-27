"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#cadenas", label: "Cadenas" },
  { href: "#territorios", label: "Territorios" },
  { href: "#fases", label: "Fases" },
  { href: "#indicador", label: "Indicador" },
  { href: "#grupos", label: "Grupos" },
  { href: "#contacto", label: "Contacto" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#2f3d31] bg-[#0b0f0c]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 font-[family-name:var(--font-plataforma-narrow)] text-lg font-bold tracking-tight text-[#f4f7f2]"
        >
          <Image
            src="/logo-transparent.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
            priority
          />
          Sos Agro <span className="text-[#a3e635]">4.C</span>
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#8a9a8d] transition-colors hover:text-[#f4f7f2]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-lg bg-[#a3e635] px-4 py-2 text-sm font-bold text-[#0b0f0c] transition-colors hover:bg-[#bef264] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f0c]"
          >
            Entrar
          </a>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="plataforma-mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg border border-[#2f3d31] p-2 text-[#f4f7f2] lg:hidden"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="plataforma-mobile-menu"
        inert={!open}
        className={`overflow-hidden border-t border-[#2f3d31] bg-[#0b0f0c] transition-[max-height] duration-200 lg:hidden ${
          open ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <nav
          aria-label="Navegación principal móvil"
          className="flex flex-col gap-1 px-4 py-4"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#8a9a8d] transition-colors hover:bg-[#141a12] hover:text-[#f4f7f2]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#a3e635] px-4 py-2.5 text-sm font-bold text-[#0b0f0c]"
          >
            Entrar
          </a>
        </nav>
      </div>
    </header>
  );
}
