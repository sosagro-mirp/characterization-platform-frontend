import Image from "next/image";
import type { Partner } from "../../../lib/landing-content";

const roleLabel: Record<Partner["role"], string> = {
  proponente: "Entidad proponente",
  aliado: "Aliado",
  beneficiario: "Beneficiario",
};

interface PartnerLogoProps {
  partner: Partner;
  size?: "md" | "lg";
}

export function PartnerLogo({ partner, size = "md" }: PartnerLogoProps) {
  const heightClass = size === "lg" ? "h-20 lg:h-24" : "h-14 lg:h-16";
  const tooltip = `${partner.name} — ${roleLabel[partner.role]}${
    partner.country ? ` (${partner.country})` : ""
  }`;

  return (
    <div
      title={tooltip}
      className={`group flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-brand/40 hover:shadow-sm ${
        size === "lg" ? "min-h-32" : "min-h-24"
      }`}
    >
      {partner.logo ? (
        <div
          className={`relative w-full ${heightClass} flex items-center justify-center`}
        >
          <Image
            src={partner.logo}
            alt={`Logo de ${partner.name}`}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
            className="object-contain"
          />
        </div>
      ) : (
        <div
          className={`flex w-full ${heightClass} flex-col items-center justify-center text-center`}
          aria-label={partner.name}
        >
          <p className="text-sm font-bold text-brand-dark leading-tight">
            {partner.shortName ?? partner.name}
          </p>
          {partner.shortName && partner.shortName !== partner.name ? (
            <p className="mt-1 text-[10px] text-gray-500 leading-tight line-clamp-2">
              {partner.name}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
