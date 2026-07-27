import Image from "next/image";
import { crops } from "../../../lib/landing-content";
import { SectionHeader } from "./SectionHeader";

export function Crops() {
  return (
    <section id="cadenas" className="scroll-mt-24 bg-[#0b0f0c] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Cadenas productivas"
          title="Cuatro cadenas, un mismo modelo de datos"
          subtitle="Cada cadena productiva tiene su propio conjunto de unidades instrumentadas, con sensores agroclimáticos y captura multimodal adaptada a sus procesos."
        />

        <ul
          role="list"
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
        >
          {crops.map((crop) => (
            <li key={crop.slug} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#2f3d31] bg-[#10140f] transition-colors hover:border-[#a3e635]/40">
                <div className="relative h-40 w-full">
                  <Image
                    src={crop.image}
                    alt={`Cultivo de ${crop.name}`}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f0c] via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-[#f4f7f2]">
                      {crop.name}
                    </h3>
                    <span className="rounded-full bg-[#1f2921] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a3e635]">
                      {crop.productiveUnits} UP
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#8a9a8d]">
                    {crop.description}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
