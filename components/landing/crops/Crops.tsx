import Image from "next/image";
import { crops } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";

export function Crops() {
  return (
    <SectionContainer id="cultivos" spacing="lg">
      <SectionHeading
        badge="Cultivos"
        title="Cuatro cadenas productivas, una plataforma"
        subtitle="40 unidades productivas en seis departamentos serán intervenidas con sensores agroclimáticos, cámaras multiespectrales y aplicaciones móviles para capturar datos de cultivo, cosecha, postcosecha y comercialización."
      />

      <ul
        role="list"
        className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
      >
        {crops.map((crop) => (
          <li
            key={crop.slug}
            className="group relative flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-xl border border-gray-200 dark:border-[#334155] shadow-sm transition-shadow hover:shadow-lg"
          >
            <Image
              src={crop.image}
              alt={`Cultivo de ${crop.name}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent dark:from-[#0f172a]/95 dark:via-[#0f172a]/40 dark:to-transparent" />

            <div className="relative flex flex-col gap-2 p-5 text-white">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-[#fde047]"
                  aria-hidden="true"
                />
                {crop.productiveUnits} unidades
              </span>
              <h3 className="text-2xl font-bold tracking-tight">{crop.name}</h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {crop.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
