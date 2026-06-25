import {
  Building2,
  GraduationCap,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { ContactForm } from "./ContactForm";

interface ParticipationRole {
  iconKey: "academia" | "empresa" | "estado" | "sociedad";
  axisLabel: string;
  title: string;
  description: string;
  action: {
    label: string;
    href: string;
    external?: boolean;
  };
}

const iconMap: Record<ParticipationRole["iconKey"], LucideIcon> = {
  academia: GraduationCap,
  empresa: Building2,
  estado: Landmark,
  sociedad: Users,
};

const roles: readonly ParticipationRole[] = [
  {
    iconKey: "academia",
    axisLabel: "Academia",
    title: "Soy investigador o estudiante",
    description:
      "Universidades aliadas, semilleros y becarios articulan capacidades en ciencia de datos, IoT, bioeconomía y metrología en torno al proyecto.",
    action: { label: "Ingresar a la plataforma", href: "/login" },
  },
  {
    iconKey: "empresa",
    axisLabel: "Empresa",
    title: "Represento una empresa del sector",
    description:
      "Empresas de café, cacao, cannabis, cáñamo y de servicios tecnológicos colaboran en pruebas de campo, transferencia y co-desarrollo de prototipos.",
    // TODO: enlazar correo institucional del proyecto cuando esté disponible
    action: {
      label: "Conoce a los aliados empresariales",
      href: "/#aliados",
    },
  },
  {
    iconKey: "estado",
    axisLabel: "Estado",
    title: "Represento una entidad pública",
    description:
      "Proyecto financiado por el Sistema General de Regalías y articulado con Minciencias, alcaldías y entidades territoriales en seis departamentos.",
    action: {
      label: "Minciencias ↗",
      href: "https://minciencias.gov.co/",
      external: true,
    },
  },
  {
    iconKey: "sociedad",
    axisLabel: "Sociedad",
    title: "Soy agricultor o agremiación",
    description:
      "Las unidades productivas y las asociaciones de ingenieros agrónomos son el centro del proyecto. Tu participación define la hoja de ruta de tu sector.",
    action: { label: "Responder encuesta", href: "/campaign" },
  },
] as const;

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
      clipRule="evenodd"
    />
  </svg>
);

function ActionLink({
  action,
}: {
  action: ParticipationRole["action"];
}) {
  const className =
    "group inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand-dark hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded";
  const inner = (
    <>
      {action.label}
      <span className="transition-transform group-hover:translate-x-0.5">
        <ArrowIcon />
      </span>
    </>
  );
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={action.href} className={className}>
      {inner}
    </Link>
  );
}

export function Participation() {
  return (
    <SectionContainer id="participar" spacing="lg">
      <SectionHeading
        badge="Cómo participar"
        title="Formulario de contacto"
        subtitle="Sos Agro 4.C articula la cuádruple hélice — academia, empresa, estado y sociedad — bajo la premisa de que la productividad sostenible exige colaboración entre todos los actores de la cadena."
      />
      <div className="mt-12 lg:mt-16">
        <ContactForm />
      </div>
    </SectionContainer>
  );
}
