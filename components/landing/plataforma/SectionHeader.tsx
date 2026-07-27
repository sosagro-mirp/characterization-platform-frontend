interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

/**
 * Equivalente local de `components/landing/shared/SectionHeading.tsx` con la
 * estética dark de la propuesta "Plataforma" (verde lima sobre negro).
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center",
}: SectionHeaderProps) {
  const alignmentClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div
      className={`flex flex-col ${alignmentClass} max-w-3xl ${
        align === "center" ? "mx-auto" : ""
      }`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-[#2f3d31] bg-[#10140f] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#a3e635]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" aria-hidden="true" />
        {badge}
      </span>
      <h2 className="mt-4 font-[family-name:var(--font-plataforma-narrow)] text-3xl font-bold tracking-tight text-balance text-[#f4f7f2] lg:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-sm text-[#8a9a8d] text-pretty lg:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
