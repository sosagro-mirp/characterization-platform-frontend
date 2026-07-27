"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export interface EditorialSection {
  id: string;
  number: string;
  label: string;
}

/**
 * Índice numerado de secciones de la propuesta "Editorial". Fuente única de
 * verdad de ids/números/labels, consumida tanto por el side-nav como por
 * `EditorialLandingPage` para nombrar cada `<section id="...">`.
 */
export const EDITORIAL_SECTIONS: readonly EditorialSection[] = [
  { id: "introduccion", number: "01", label: "Introducción" },
  { id: "cultivos", number: "02", label: "Cadenas productivas" },
  { id: "territorios", number: "03", label: "Territorios" },
  { id: "fases", number: "04", label: "Fases del proyecto" },
  { id: "indicador", number: "05", label: "Indicador IFCT4C" },
  { id: "investigacion", number: "06", label: "Grupos de investigación" },
  { id: "participacion", number: "07", label: "Participación" },
] as const;

export function SideNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle móvil: fijo arriba a la derecha, controla el panel overlay */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="editorial-sidenav-panel"
        className="fixed right-4 top-4 z-50 flex items-center gap-2 border border-black bg-white px-3 py-2 text-xs font-semibold uppercase tracking-widest text-black lg:hidden"
      >
        {open ? (
          <>
            <X className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            Cerrar
          </>
        ) : (
          <>
            <Menu className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            Menú
          </>
        )}
      </button>

      {/* Desktop: side-nav fija */}
      <nav
        aria-label="Índice de secciones"
        className="fixed inset-y-0 left-0 z-40 hidden w-[230px] flex-col justify-between border-r border-black bg-white px-6 py-10 lg:flex"
      >
        <SideNavContent />
      </nav>

      {/* Mobile: panel overlay a pantalla completa */}
      {open ? (
        <div
          id="editorial-sidenav-panel"
          className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-white px-6 py-10 lg:hidden"
        >
          <SideNavContent onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </>
  );
}

function SideNavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-10 pt-10 lg:pt-0">
        <a
          href="#introduccion"
          onClick={onNavigate}
          className="flex items-center gap-3 text-black"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0"
            priority
          />
          <span className="font-[family-name:var(--font-editorial-serif)] text-xl font-semibold leading-none tracking-tight">
            Sos Agro
            <span className="block text-sm font-normal text-gray-500">4.C</span>
          </span>
        </a>

        <ol className="flex flex-col gap-1">
          {EDITORIAL_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={onNavigate}
                className="group flex items-baseline gap-3 border-b border-transparent py-2 text-sm text-gray-600 transition-colors hover:border-black hover:text-black"
              >
                <span className="font-[family-name:var(--font-editorial-mono)] text-xs text-gray-400 group-hover:text-black">
                  {section.number}
                </span>
                <span className="leading-snug">{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <p className="font-[family-name:var(--font-editorial-mono)] text-[10px] uppercase tracking-widest text-gray-400">
        SIGP 108927
        <br />
        SGR · Colombia
      </p>
    </>
  );
}
