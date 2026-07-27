import type { HTMLAttributes, ReactNode } from "react";

interface AgroSectionProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  children: ReactNode;
  spacing?: "md" | "lg";
  tone?: "cream" | "creamAlt" | "surface";
  className?: string;
}

const spacingClass = {
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24 lg:py-28",
} as const;

const toneClass = {
  cream: "bg-[#FAF8F2]",
  creamAlt: "bg-[#EEF3E6]",
  surface: "bg-[#FFFFFF]",
} as const;

/** Contenedor de sección de la propuesta "Agro": ancho editorial, tono cálido. */
export function AgroSection({
  id,
  children,
  spacing = "lg",
  tone = "cream",
  className = "",
  ...rest
}: AgroSectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 md:px-8 lg:px-12 ${spacingClass[spacing]} ${toneClass[tone]} ${className}`}
      {...rest}
    >
      <div className="max-w-6xl mx-auto w-full">{children}</div>
    </section>
  );
}
