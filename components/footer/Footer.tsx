import Image from "next/image";
import Link from "next/link";
import { project } from "../../lib/landing-content";

const sectionLinks = [
  { href: "/#proyecto", label: "El proyecto" },
  { href: "/#cultivos", label: "Cultivos" },
  { href: "/#territorios", label: "Territorios" },
  { href: "/#ejes", label: "Ejes" },
  { href: "/#plataforma", label: "Plataforma" },
  { href: "/#participar", label: "Participar" },
  { href: "/#aliados", label: "Aliados" },
  { href: "/#resultados", label: "Resultados" },
] as const;

const platformLinks = [
  { href: "/instrument", label: "Responder encuesta" },
  { href: "/login", label: "Ingresar como investigador" },
] as const;

const Footer = () => {
  return (
    <footer className="w-full bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Brand block */}
          <div className="flex flex-col gap-4 max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white"
              aria-label="Inicio — SOS Agro 4C"
            >
              <span className="text-xl font-bold tracking-tight">
                {project.shortName}
              </span>
            </Link>
            <p className="text-xs text-white/70 leading-relaxed">
              {project.fullName}
            </p>
            <p className="text-xs text-white/60">
              <span className="font-bold text-white/80">SIGP {project.sigpCode}</span>{" "}
              · Minciencias · Sistema General de Regalías 2023–2024
            </p>
          </div>

          {/* Sección: Proyecto */}
          <nav aria-label="Secciones del proyecto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Proyecto
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sección: Plataforma */}
          <nav aria-label="Plataforma">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Plataforma
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              {platformLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sección: Institucional */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Institucional
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              <li>
                <span className="block font-bold text-white/90">
                  Entidad proponente
                </span>
                <span className="block text-xs">
                  {project.proponent}
                </span>
              </li>
              <li>
                <a
                  href="https://minciencias.gov.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                >
                  Minciencias ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.sgr.gov.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                >
                  Sistema General de Regalías ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/50">
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
};

export default Footer;
