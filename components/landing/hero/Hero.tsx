import Image from "next/image";
import Link from "next/link";
import { project } from "../../../lib/landing-content";
import { HeroBadge } from "./HeroBadge";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[75vh] items-center overflow-hidden bg-brand-dark dark:bg-transparent scroll-mt-24"
    >
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:6rem_4rem]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 lg:pt-32 pb-10 md:pb-14 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[6fr_5fr] lg:gap-14">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="max-w-3xl flex flex-col gap-6 md:gap-8">
              <HeroBadge
                parts={[
                  `Proyecto SIGP ${project.sigpCode}`,
                  "Minciencias",
                  "SGR 2023–2024",
                ]}
              />

              <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance">
                  {project.shortName}
                </h1>
                <p className="text-base md:text-lg text-white/80 max-w-2xl text-pretty">
                  Fortalecemos las capacidades científico-tecnológicas que afectan la productividad agrícola sostenible de los sectores del Café, Cacao,
                  Cannabis y Cáñamo en los departamentos de Antioquia, Caquetá, Chocó, Guajira, Meta, Norte de Santander.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-3">
                Da el primer paso
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/#participar"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300/60 dark:border-[#fde047]/60 bg-green-400/95 dark:bg-[#fde047] px-6 py-4 text-sm font-bold tracking-tight text-brand-dark transition-colors hover:bg-green-300 dark:hover:bg-[#facc15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 dark:focus-visible:ring-[#fde047] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark dark:focus-visible:ring-offset-[#0f172a]"
                >
                  Contáctanos
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-4 text-sm font-bold tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark dark:focus-visible:ring-offset-[#0f172a]"
                >
                  Soy investigador
                </Link>
              </div>
            </div>
          </div>

          <figure className="flex flex-col gap-2">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/10 shadow-lg lg:min-h-[26rem]">
              <Image
                src="/campesino.jpg"
                alt="Agricultor en una unidad productiva de las zonas de impacto del proyecto"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="text-xs leading-relaxed text-white/60 text-pretty">
              Unidad productiva beneficiaria en una de las seis regiones de
              intervención del proyecto.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
