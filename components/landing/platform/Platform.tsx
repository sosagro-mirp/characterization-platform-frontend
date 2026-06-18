import Image from "next/image";
import Link from "next/link";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3.5 h-3.5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
      clipRule="evenodd"
    />
  </svg>
);

interface AudienceCardProps {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string };
  tone: "researcher" | "farmer";
}

function AudienceCard({
  badge,
  title,
  description,
  bullets,
  cta,
  tone,
}: AudienceCardProps) {
  const isResearcher = tone === "researcher";
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-6 transition-colors ${
        isResearcher
          ? "border-gray-200 bg-white hover:border-brand/40"
          : "border-brand/30 bg-brand-light/30 hover:border-brand/60"
      }`}
    >
      <span
        className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
          isResearcher
            ? "bg-gray-100 text-gray-700"
            : "bg-brand text-white"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isResearcher ? "bg-gray-500" : "bg-white"
          }`}
          aria-hidden="true"
        />
        {badge}
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold tracking-tight text-balance">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      <ul role="list" className="flex flex-col gap-2 text-sm text-gray-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              aria-hidden="true"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href={cta.href}
        className="group mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
      >
        {cta.label}
        <span className="transition-transform group-hover:translate-x-0.5">
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}

export function Platform() {
  return (
    <SectionContainer id="plataforma" spacing="lg">
      <SectionHeading
        badge="Plataforma"
        title="Captura, almacena y analiza la información del campo"
        subtitle="La plataforma de caracterización articula la sub-actividad 1.1.1 del OE1: instrumenta el diagnóstico de capacidades técnicas y humanas en cultivo, cosecha, postcosecha y comercialización de las unidades productivas."
      />

      <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-12 items-center">
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-light/60 to-transparent rounded-3xl blur-2xl" />
          <Image
            src="/logo.jpg"
            alt="Aplicación móvil de la plataforma SOS Agro 4C mostrando el flujo de encuesta"
            width={800}
            height={1000}
            className="w-full h-auto object-contain"
            sizes="(min-width: 1024px) 40vw, 80vw"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
          <AudienceCard
            tone="researcher"
            badge="Investigadores"
            title="Diseña instrumentos y analiza respuestas"
            description="Plataforma web para crear cuestionarios estructurados, monitorear el avance de la recolección y exportar los datos para análisis."
            bullets={[
              "Editor de instrumentos con secciones, preguntas y opciones",
              "Tablero de respuestas y estado de sincronización",
              "Datos abiertos en línea con OE1, sub-actividad 1.7",
            ]}
            cta={{ label: "Ingresar como investigador", href: "/login" }}
          />

          <AudienceCard
            tone="farmer"
            badge="Agricultores"
            title="Responde encuestas en tu finca"
            description="Diseñada para baja conectividad y baja alfabetización digital. Sin necesidad de cuenta, con preguntas adaptadas a tu cultivo."
            bullets={[
              "Funciona en zonas con conexión intermitente",
              "Preguntas tipo Likert, sí/no, opción múltiple y texto libre",
              "Tu información alimenta la hoja de ruta de tu sector",
            ]}
            cta={{ label: "Responder encuesta", href: "/campaign" }}
          />
        </div>
      </div>
    </SectionContainer>
  );
}
