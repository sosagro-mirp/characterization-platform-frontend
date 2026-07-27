import { ArrowRight, LayoutDashboard } from "lucide-react";
import {
  crops,
  project,
  researchGroups,
  territories,
} from "../../../lib/landing-content";

const productiveUnits = crops.reduce((sum, c) => sum + c.productiveUnits, 0);

const heroNumbers = [
  { value: String(productiveUnits), label: "unidades productivas con IoT" },
  { value: String(territories.length), label: "departamentos" },
  { value: String(crops.length), label: "cadenas productivas" },
  { value: String(researchGroups.length), label: "grupos de investigación" },
] as const;

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-[#2f3d31] bg-[#0b0f0c] pt-32 pb-20 lg:pt-44 lg:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(163,230,53,0.12),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2f3d31] bg-[#10140f] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#a3e635]">
            SIGP {project.sigpCode} · Sistema General de Regalías
          </span>

          <h1 className="font-[family-name:var(--font-plataforma-narrow)] text-4xl font-bold tracking-tight text-balance text-[#f4f7f2] sm:text-5xl lg:text-6xl">
            La plataforma de datos que fortalece el{" "}
            <span className="text-[#a3e635]">café, cacao, cannabis y cáñamo</span>
          </h1>

          <p className="max-w-2xl text-base text-[#8a9a8d] text-pretty lg:text-lg">
            {project.generalObjective}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a3e635] px-6 py-3 text-sm font-bold text-[#0b0f0c] transition-colors hover:bg-[#bef264] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f0c]"
            >
              Sumarme al proyecto
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#cadenas"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2f3d31] px-6 py-3 text-sm font-bold text-[#f4f7f2] transition-colors hover:bg-[#141a12]"
            >
              Explorar cadenas productivas
            </a>
          </div>
        </div>

        {/* Stat row: 4 columnas de números */}
        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {heroNumbers.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 border-t border-[#2f3d31] pt-4 text-center"
            >
              <dt className="order-2 text-xs text-[#8a9a8d]">{stat.label}</dt>
              <dd className="order-1 font-[family-name:var(--font-plataforma-narrow)] text-3xl font-bold text-[#f4f7f2] lg:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Placeholder de captura del dashboard */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[#2f3d31] bg-[#10140f] p-8 text-center">
            <LayoutDashboard
              className="h-10 w-10 text-[#a3e635]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-sm font-bold text-[#f4f7f2]">
              Captura del dashboard de la plataforma
            </p>
            <p className="max-w-md text-xs text-[#8a9a8d]">
              Vista previa pendiente de incorporar: panel de monitoreo con
              indicadores en tiempo real de las 40 unidades productivas
              instrumentadas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
