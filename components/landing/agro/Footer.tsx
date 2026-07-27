import Image from "next/image";
import Link from "next/link";
import { project } from "../../../lib/landing-content";

const sectionLinks = [
  { href: "#cultivos", label: "Cultivos" },
  { href: "#territorios", label: "Territorios" },
  { href: "#fases", label: "Fases" },
  { href: "#resultados", label: "Resultados" },
  { href: "#grupos", label: "Grupos" },
  { href: "#participar", label: "Participar" },
] as const;

const platformLinks = [
  { href: "/campaign", label: "Responder encuesta" },
  { href: "/login", label: "Ingresar como investigador" },
] as const;

/** Footer propio de la propuesta "Agro". */
export function Footer() {
  return (
    <footer className="w-full bg-[#0D3320] text-[#FAF8F2]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="flex max-w-md flex-col gap-4">
            <Link href="#inicio" className="flex items-center gap-2" aria-label="Inicio — Sos Agro 4.C">
              <Image
                src="/logo-transparent.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
              />
              <span className="font-[family-name:var(--font-agro-serif)] text-lg font-medium tracking-tight">
                {project.shortName}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#FAF8F2]/75">
              {project.fullName}
            </p>
            <p className="text-xs text-[#FAF8F2]/60">
              <span className="font-bold text-[#FAF8F2]/85">SIGP {project.sigpCode}</span>{" "}
              · Minciencias · Sistema General de Regalías 2023–2024
            </p>
          </div>

          <nav aria-label="Secciones del proyecto">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#FAF8F2]/90">
              Proyecto
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#FAF8F2]/75">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="rounded transition-colors hover:text-[#FAF8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F2]/40"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Plataforma">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#FAF8F2]/90">
              Plataforma
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#FAF8F2]/75">
              {platformLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded transition-colors hover:text-[#FAF8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F2]/40"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-[#FAF8F2]/15 pt-6 text-xs text-[#FAF8F2]/60">
          <p>
            Entidad proponente: {project.proponent}. Propuesta visual
            &quot;Agro&quot; — no indexada para motores de búsqueda.
          </p>
        </div>
      </div>
    </footer>
  );
}
