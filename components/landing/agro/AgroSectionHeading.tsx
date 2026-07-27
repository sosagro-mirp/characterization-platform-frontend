interface AgroSectionHeadingProps {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}

/** Encabezado editorial: kicker en versalitas + título serif grande. */
export function AgroSectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  as: Heading = "h2",
}: AgroSectionHeadingProps) {
  const alignClass =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} max-w-2xl`}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#166534]">
        {kicker}
      </span>
      <Heading className="mt-3 font-[family-name:var(--font-agro-serif)] text-3xl lg:text-5xl font-medium tracking-tight text-[#20281F] text-balance">
        {title}
      </Heading>
      {subtitle ? (
        <p className="mt-5 text-[#6B6552] text-sm lg:text-base leading-relaxed text-pretty">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
