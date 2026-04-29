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
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={crop.image}
                alt={`Cultivo de ${crop.name}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-dark backdrop-blur-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand"
                  aria-hidden="true"
                />
                {crop.productiveUnits} unidades
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="text-2xl font-bold tracking-tight">{crop.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {crop.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
