"use client";

import { useState } from "react";
import { axes } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";

const phaseTag = ["Fase activa", "Próxima fase", "Fase final"];

export function Axes() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = axes[activeIndex];

  return (
    <SectionContainer id="ejes" spacing="lg">
      <SectionHeading
        badge="Estructura del proyecto"
        title="Tres fases articuladas en cinco años"
        subtitle="El proyecto se estructura en tres objetivos específicos secuenciales: la captura y análisis de datos alimenta los procesos de bioeconomía y, en paralelo, los métodos analíticos del centro de referencia."
      />

      <div
        role="tablist"
        aria-label="Fases del proyecto"
        className="mt-12 lg:mt-16 flex gap-2 overflow-x-auto border-b border-gray-200"
      >
        {axes.map((axis, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={axis.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-brand text-brand-dark"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {String(index + 1).padStart(2, "0")} — {axis.title}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="pt-9">
        <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-[10.5px] font-bold text-green-800">
          {phaseTag[activeIndex]}
        </span>
        <h3 className="mt-4 text-2xl lg:text-3xl font-extrabold tracking-tight text-brand-dark">
          {current.title}
        </h3>
        <p className="mt-2.5 max-w-xl text-sm text-gray-600 leading-relaxed">
          {current.tagline}
        </p>
        <div className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {current.activities.map((activity) => (
            <div
              key={activity}
              className="flex gap-2.5 text-sm text-gray-700 leading-relaxed"
            >
              <span className="text-brand" aria-hidden="true">
                ▹
              </span>
              {activity}
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
