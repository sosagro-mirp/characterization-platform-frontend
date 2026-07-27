import Image from "next/image";
import { crops } from "../../../lib/landing-content";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";

/** Cadenas productivas del proyecto, en tarjetas editoriales con foto de fondo. */
export function Crops() {
  return (
    <AgroSection id="cultivos" tone="cream">
      <AgroSectionHeading
        kicker="Cadenas productivas"
        title="Cuatro cultivos, una misma plataforma de datos"
        subtitle="40 unidades productivas en seis departamentos capturan variables agroclimáticas, de cosecha y postcosecha con sensores IoT y visión multiespectral."
      />

      <ul
        role="list"
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6"
      >
        {crops.map((crop) => (
          <li key={crop.slug}>
            <article className="group relative flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-2xl border border-[#E9E3D3] shadow-sm transition-shadow hover:shadow-md">
              <Image
                src={crop.image}
                alt={`Cultivo de ${crop.name}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#20281F]/85 via-[#20281F]/20 to-transparent" />

              <div className="relative flex flex-col gap-2 p-5 text-white">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {crop.productiveUnits} unidades productivas
                </span>
                <h3 className="font-[family-name:var(--font-agro-serif)] text-2xl font-medium tracking-tight">
                  {crop.name}
                </h3>
                <p className="text-xs leading-relaxed text-white/85">
                  {crop.description}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </AgroSection>
  );
}
