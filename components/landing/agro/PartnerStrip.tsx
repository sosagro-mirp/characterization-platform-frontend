import Image from "next/image";
import { partners } from "../../../lib/landing-content";

const axisLabel = {
  academia: "Academia",
  empresa: "Empresa",
  sociedad: "Sociedad",
} as const;

/** Tira editorial de aliados institucionales, agrupada por eje de la cuádruple hélice. */
export function PartnerStrip() {
  const withLogo = partners.filter((p) => p.logo);
  const withoutLogo = partners.filter((p) => !p.logo);

  return (
    <section
      id="aliados"
      className="scroll-mt-24 border-y border-[#E9E3D3] bg-[#EEF3E6] px-4 py-10 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#6B6552]">
          14 entidades · academia, empresa, estado y sociedad
        </p>

        <ul
          role="list"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        >
          {withLogo.map((partner) => (
            <li key={partner.slug} className="flex items-center">
              <div className="relative h-10 w-28 grayscale opacity-80 transition-opacity hover:opacity-100">
                <Image
                  src={partner.logo as string}
                  alt={partner.name}
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </div>
            </li>
          ))}
        </ul>

        <ul
          role="list"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-[#D8D2BD] pt-6"
        >
          {withoutLogo.map((partner) => (
            <li
              key={partner.slug}
              title={`${partner.name} — ${axisLabel[partner.axis]}`}
              className="rounded-full border border-[#D8D2BD] bg-[#FFFFFF] px-3 py-1 text-xs font-medium text-[#6B6552]"
            >
              {partner.shortName ?? partner.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
