import Image from "next/image";
import { crops } from "../../../lib/landing-content";
import { SectionKicker } from "./SectionKicker";

/**
 * Sección 02 — Cadenas productivas. Filas numeradas tipo índice de revista,
 * con la imagen del cultivo en blanco y negro (desaturada vía CSS) y las
 * cifras de unidades productivas alineadas a la derecha.
 */
export function Crops() {
  return (
    <section
      id="cultivos"
      className="scroll-mt-24 border-b border-black px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="02" label="Cadenas productivas" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        Cuatro cadenas productivas, una plataforma de datos
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 lg:text-base text-pretty">
        40 unidades productivas en seis departamentos serán intervenidas con
        sensores agroclimáticos, cámaras multiespectrales y aplicaciones
        móviles para capturar datos de cultivo, cosecha, postcosecha y
        comercialización.
      </p>

      <ol className="mt-10 flex flex-col border-t border-black">
        {crops.map((crop, index) => (
          <li
            key={crop.slug}
            className="grid grid-cols-[3rem_5rem_1fr_auto] items-center gap-4 border-b border-gray-300 py-5 lg:grid-cols-[4rem_7rem_1fr_auto] lg:gap-6 lg:py-7"
          >
            <span className="font-[family-name:var(--font-editorial-mono)] text-sm text-gray-400 lg:text-base">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="relative aspect-square w-full overflow-hidden bg-gray-100 grayscale">
              <Image
                src={crop.image}
                alt={`Cultivo de ${crop.name}`}
                fill
                sizes="(min-width: 1024px) 7rem, 5rem"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-[family-name:var(--font-editorial-serif)] text-xl font-semibold tracking-tight text-black lg:text-2xl">
                {crop.name}
              </h3>
              <p className="hidden max-w-xl text-xs leading-relaxed text-gray-600 lg:block lg:text-sm">
                {crop.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-0.5 text-right">
              <span className="font-[family-name:var(--font-editorial-serif)] text-2xl font-semibold text-black lg:text-3xl">
                {crop.productiveUnits}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                unidades
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
