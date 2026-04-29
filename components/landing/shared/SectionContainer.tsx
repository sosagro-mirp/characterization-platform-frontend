import type { HTMLAttributes, ReactNode } from "react";

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  children: ReactNode;
  /** Verticals: "lg" para secciones principales, "md" para secciones contiguas */
  spacing?: "md" | "lg";
  /** Centra el contenido horizontalmente */
  centered?: boolean;
  className?: string;
}

const spacingClass = {
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24 lg:py-32",
} as const;

export function SectionContainer({
  id,
  children,
  spacing = "lg",
  centered = false,
  className = "",
  ...rest
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 md:px-6 lg:px-8 ${spacingClass[spacing]} ${className}`}
      {...rest}
    >
      <div
        className={`max-w-7xl mx-auto w-full ${
          centered ? "flex flex-col items-center text-center" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
