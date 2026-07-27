"use client";

import { useState } from "react";
import { axes } from "../../../lib/landing-content";
import { SectionKicker } from "./SectionKicker";

/**
 * Sección 04 — Fases del proyecto. Tabs en tres columnas (uno por eje
 * OE1/OE2/OE3) con estado local simple, en vez de las tarjetas de la
 * variante original.
 */
export function Axes() {
  const [activeCode, setActiveCode] = useState(axes[0].code);
  const activeAxis = axes.find((a) => a.code === activeCode) ?? axes[0];

  return (
    <section
      id="fases"
      className="scroll-mt-24 border-b border-black px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="04" label="Fases del proyecto" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        Tres fases articuladas en cinco años
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 lg:text-base text-pretty">
        La captura y análisis de datos alimenta los procesos de bioeconomía y,
        en paralelo, los métodos analíticos del centro de referencia.
      </p>

      <div
        role="tablist"
        aria-label="Fases del proyecto"
        className="mt-10 grid grid-cols-1 border-t border-black sm:grid-cols-3"
      >
        {axes.map((axis, index) => {
          const isActive = axis.code === activeCode;
          return (
            <button
              key={axis.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`fase-panel-${axis.code}`}
              id={`fase-tab-${axis.code}`}
              onClick={() => setActiveCode(axis.code)}
              className={`flex flex-col items-start gap-2 border-b border-gray-300 px-4 py-6 text-left transition-colors sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                isActive ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-[family-name:var(--font-editorial-mono)] text-xs uppercase tracking-widest ${
                  isActive ? "text-white/60" : "text-gray-500"
                }`}
              >
                {String(index + 1).padStart(2, "0")} — {axis.code}
              </span>
              <span className="font-[family-name:var(--font-editorial-serif)] text-lg font-semibold leading-snug">
                {axis.title}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  isActive ? "text-white/70" : "text-gray-400"
                }`}
              >
                {axis.status === "active" ? "En curso" : "Próxima fase"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`fase-panel-${activeAxis.code}`}
        aria-labelledby={`fase-tab-${activeAxis.code}`}
        className="grid grid-cols-1 gap-8 border-b border-gray-300 py-8 lg:grid-cols-[7fr_5fr] lg:gap-12"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-gray-700 lg:text-base text-pretty">
            {activeAxis.description}
          </p>
          <p className="text-sm font-medium text-black">{activeAxis.tagline}</p>
        </div>

        <ol className="flex flex-col gap-3">
          {activeAxis.activities.map((activity, index) => (
            <li key={activity} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="font-[family-name:var(--font-editorial-mono)] text-xs text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-pretty">{activity}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
