import { GraduationCap, HeartHandshake, MapPinHouse, Sprout, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { project } from "../../../lib/landing-content";
import { HeroBadge } from "./HeroBadge";

interface HeroRole {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  primary?: boolean;
}

const roles: readonly HeroRole[] = [
  {
    label: "Soy agricultor",
    description: "Responde la encuesta de tu finca",
    icon: Sprout,
    href: "/",
    primary: true,
  },
  {
    label: "Soy extensionista",
    description: "Acompaño a productores en campo",
    icon: HeartHandshake,
    href: "/",
  },
  {
    label: "Soy propietario",
    description: "Gestiono una unidad productiva",
    icon: MapPinHouse,
    href: "/",
  },
  {
    label: "Soy investigador",
    description: "Ingresar a la plataforma",
    icon: GraduationCap,
    href: "/login",
  },
] as const;

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
                Ciencia de datos, IoT y bioeconomía para fortalecer la
                productividad sostenible del café, cacao, cannabis y cáñamo en
                seis departamentos de Colombia.
              </p>
            </div>

            <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
              Caracterizamos las unidades productivas, desplegamos tecnologías
              de captura de datos en finca y construimos una plataforma abierta
              para todos los actores de la cadena.
            </p>
          </div>

          <div className="mt-4 max-w-7xl">
            <p className="text-xs uppercase tracking-wider text-white/60 mb-3">
              Empieza según tu rol
            </p>
            <ul
              role="list"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
            >
              {roles.map((role) => {
                const isPrimary = Boolean(role.primary);
                return (
                  <li key={role.label}>
                    <Link
                      href={role.href}
                      className={`group flex h-full flex-col gap-3 rounded-xl border p-4 lg:p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark ${isPrimary
                        ? "border-green-300/60 bg-green-400/95 text-brand-dark hover:bg-green-300 focus-visible:ring-green-300"
                        : "border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 focus-visible:ring-white"
                        }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm lg:text-base font-bold tracking-tight">
                          {role.label}
                        </span>
                        <span
                          className={`text-[11px] lg:text-xs leading-snug ${isPrimary ? "text-brand-dark/75" : "text-white/65"
                            }`}
                        >
                          {role.description}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
