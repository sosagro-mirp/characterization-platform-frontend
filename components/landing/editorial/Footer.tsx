import Image from "next/image";
import { project } from "../../../lib/landing-content";

/**
 * Pie de página propio de la propuesta "Editorial": franja monocromática con
 * los datos institucionales del proyecto, sin el verde de marca del footer
 * compartido del sitio.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black bg-black px-6 py-10 text-white lg:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="mb-2 flex items-center gap-3">
            <Image
              src="/logo-transparent.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
            <p className="font-[family-name:var(--font-editorial-serif)] text-xl font-semibold tracking-tight">
              {project.shortName}
            </p>
          </div>
          <p className="max-w-xl text-xs text-white/60 leading-relaxed">
            SIGP {project.sigpCode} — {project.proponent} — {project.call}
          </p>
        </div>
        <p className="font-[family-name:var(--font-editorial-mono)] text-[10px] uppercase tracking-widest text-white/40">
          © {year} Sos Agro 4.C — Propuesta visual Editorial
        </p>
      </div>
    </footer>
  );
}
