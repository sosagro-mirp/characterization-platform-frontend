interface SectionHeadingProps {
  badge: string;
  title: string;
  subtitle?: string;
  /** Alineación del bloque de heading */
  align?: "left" | "center";
  /** Nivel del encabezado para preservar jerarquía semántica (default h2) */
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  as: Heading = "h2",
}: SectionHeadingProps) {
  const alignmentClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignmentClass} max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
      <div className="max-w-max rounded-lg px-3 py-1 text-xs lg:text-sm border border-gray-200 mb-4 flex items-center font-medium">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" aria-hidden="true" />
        {badge}
      </div>
      <Heading className="text-3xl lg:text-5xl font-bold tracking-tight text-balance">
        {title}
      </Heading>
      {subtitle ? (
        <p className="mt-6 text-gray-600 text-sm lg:text-base text-pretty">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
