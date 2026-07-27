"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { project } from "../../../lib/landing-content";

const sectionLinks = [
  { href: "#cultivos", label: "Cultivos" },
  { href: "#territorios", label: "Territorios" },
  { href: "#fases", label: "Fases" },
  { href: "#resultados", label: "Resultados" },
  { href: "#grupos", label: "Grupos" },
  { href: "#participar", label: "Participar" },
] as const;

/** Navbar propia de la propuesta "Agro": fija, cálida, con menú mobile. */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-[#E9E3D3]/80 bg-[#FAF8F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8 lg:px-12 lg:py-4">
        <Link
          href="#inicio"
          onClick={closeMenu}
          className="flex items-center gap-2 text-[#20281F]"
          aria-label="Inicio — Sos Agro 4.C"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-md"
            priority
          />
          <span className="font-[family-name:var(--font-agro-serif)] text-lg font-medium tracking-tight">
            {project.shortName}
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-[#6B6552] transition-colors hover:text-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 rounded"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link
            href="/campaign"
            className="inline-flex items-center rounded-full bg-[#15803D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            Responder encuesta
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="agro-mobile-menu"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#20281F] hover:bg-[#EEF3E6] lg:hidden"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="agro-mobile-menu"
        inert={!isMenuOpen}
        className={`overflow-hidden border-t border-[#E9E3D3] bg-[#FAF8F2] transition-[max-height] duration-300 lg:hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-4">
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#20281F] hover:bg-[#EEF3E6]"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="/campaign"
              onClick={closeMenu}
              className="block rounded-full bg-[#15803D] px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Responder encuesta
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
