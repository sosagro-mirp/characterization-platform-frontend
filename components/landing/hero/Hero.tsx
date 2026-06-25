import Link from "next/link";
import { project } from "../../../lib/landing-content";
import { HeroBadge } from "./HeroBadge";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden bg-brand-dark scroll-mt-24"
    >
      <video
        src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL || undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center -z-10"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-br from-brand-dark/85 via-brand-dark/75 to-black/70"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300/60 bg-green-400/95 px-6 py-4 text-sm font-bold tracking-tight text-brand-dark transition-colors hover:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                Contáctanos
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-4 text-sm font-bold tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                Soy investigador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
