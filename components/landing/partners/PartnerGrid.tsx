import type { Partner } from "../../../lib/landing-content";
import { PartnerLogo } from "./PartnerLogo";

interface PartnerGridProps {
  title: string;
  description?: string;
  partners: Partner[];
  size?: "md" | "lg";
  /** Cuántas columnas máximas en lg+ (por defecto 5) */
  maxCols?: 3 | 4 | 5;
}

const maxColsClass: Record<3 | 4 | 5, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export function PartnerGrid({
  title,
  description,
  partners,
  size = "md",
  maxCols = 5,
}: PartnerGridProps) {
  if (partners.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold tracking-tight text-brand-dark">
          {title}
        </h3>
        {description ? (
          <p className="text-xs text-gray-600">{description}</p>
        ) : null}
      </div>
      <ul
        role="list"
        className={`grid grid-cols-2 sm:grid-cols-3 ${maxColsClass[maxCols]} gap-3 lg:gap-4`}
      >
        {partners.map((p) => (
          <li key={p.slug}>
            <PartnerLogo partner={p} size={size} />
          </li>
        ))}
      </ul>
    </div>
  );
}
