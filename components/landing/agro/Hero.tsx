import { ArrowRight, Leaf } from "lucide-react";
import { heroStats, project } from "../../../lib/landing-content";

/** Hero editorial: titular serif, imagen de campo (placeholder) y stats. */
export function Hero() {
  return (
    <section
      id="inicio"
      className="scroll-mt-24 bg-[#FAF8F2] px-4 pt-28 pb-16 md:px-8 lg:px-12 lg:pt-40 lg:pb-24"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[6fr_5fr] lg:gap-14">
        <div className="flex flex-col justify-center gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8D2BD] bg-[#EEF3E6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#14532D]">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            SIGP {project.sigpCode} · Sistema General de Regalías
          </span>

          <h1 className="font-[family-name:var(--font-agro-serif)] text-4xl font-medium leading-[1.05] tracking-tight text-[#20281F] text-balance lg:text-6xl">
            Ciencia de datos para el campo colombiano
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[#6B6552] text-pretty lg:text-lg">
            {project.generalObjective}
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <a
              href="#participar"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15803D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
            >
              Sumarme al proyecto
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#cultivos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8D2BD] bg-transparent px-6 py-3 text-sm font-semibold text-[#20281F] transition-colors hover:bg-[#EEF3E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] focus-visible:ring-offset-2"
            >
              Conocer las cadenas productivas
            </a>
          </div>
        </div>

        {/* Placeholder de imagen de campo: no hay activo real disponible aún */}
        <div
          role="img"
          aria-label="Fotografía de finca cafetera en las montañas de Antioquia (imagen pendiente de reemplazo)"
          className="relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border border-[#D8D2BD] bg-[linear-gradient(160deg,#FACC15_0%,#15803D_45%,#14532D_100%)] p-6 text-white shadow-sm lg:min-h-[26rem]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Imagen de campo pendiente
          </p>
          <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-white/90">
            Unidad productiva cafetera en Antioquia — fotografía de referencia
            a incorporar cuando el proyecto cuente con banco de imágenes propio.
          </p>
        </div>
      </div>

      <dl className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-20 lg:gap-6">
        {heroStats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-2xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 lg:p-8"
          >
            <dt className="font-[family-name:var(--font-agro-serif)] text-3xl font-medium text-[#166534] lg:text-4xl">
              {stat.value}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#20281F]">
              {stat.label}
            </dd>
            {stat.description ? (
              <dd className="mt-2 text-xs leading-relaxed text-[#6B6552]">
                {stat.description}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
