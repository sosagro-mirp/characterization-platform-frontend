import Image from "next/image";
import Link from "next/link";
import { project } from "../../../lib/landing-content";

const sectionLinks = [
  { href: "#cadenas", label: "Cadenas productivas" },
  { href: "#territorios", label: "Territorios" },
  { href: "#fases", label: "Fases" },
  { href: "#indicador", label: "Indicador IFCT4C" },
  { href: "#grupos", label: "Grupos de investigación" },
  { href: "#contacto", label: "Contacto" },
] as const;

const platformLinks = [
  { href: "/campaign", label: "Responder encuesta" },
  { href: "/login", label: "Ingresar como investigador" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[#2f3d31] bg-[#0b0f0c]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-12">
          <div className="flex max-w-md flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#f4f7f2]">
              <Image
                src="/logo-transparent.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
              />
              {project.shortName}
            </span>
            <p className="text-xs leading-relaxed text-[#8a9a8d]">
              {project.fullName}
            </p>
            <p className="text-xs text-[#8a9a8d]">
              <span className="font-bold text-[#f4f7f2]">
                SIGP {project.sigpCode}
              </span>{" "}
              · Minciencias · Sistema General de Regalías 2023–2024
            </p>
          </div>

          <nav aria-label="Secciones de la plataforma">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#f4f7f2]">
              Plataforma
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#8a9a8d]">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="rounded transition-colors hover:text-[#f4f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Acceso a la herramienta">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#f4f7f2]">
              Acceso
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#8a9a8d]">
              {platformLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded transition-colors hover:text-[#f4f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="block font-bold text-[#f4f7f2]">
                  Entidad proponente
                </span>
                <span className="block text-xs">{project.proponent}</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#2f3d31] pt-6 text-xs text-[#8a9a8d] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Sos Agro 4.C · Proyecto SIGP{" "}
            {project.sigpCode}
          </p>
          <div className="flex gap-6">
            {/* TODO: enlazar páginas de privacidad y términos cuando existan */}
            <span>Política de privacidad</span>
            <span>Términos y condiciones</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
