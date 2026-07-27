"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useContactForm } from "../../../lib/landing-content/hooks/useContactForm";
import { SectionKicker } from "./SectionKicker";

const roleOptions = [
  { value: "", label: "Selecciona tu rol" },
  { value: "academia", label: "Academia — investigador o estudiante" },
  { value: "empresa", label: "Empresa — sector productivo o tecnológico" },
  { value: "estado", label: "Estado — entidad pública" },
  { value: "sociedad", label: "Sociedad — agricultor o agremiación" },
] as const;

const topicOptions = [
  { value: "", label: "¿Sobre qué te gustaría conversar?" },
  { value: "iot", label: "IoT y captura de datos en finca" },
  { value: "modelos", label: "Modelos de ciencia de datos e IA" },
  { value: "bioeconomia", label: "Bioeconomía y aprovechamiento de residuos" },
  { value: "laboratorio", label: "Servicios analíticos del centro de referencia" },
  { value: "convocatoria", label: "Convocatorias, becas y pasantías" },
  { value: "otro", label: "Otro tema" },
] as const;

const fieldClass =
  "w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400";

const labelClass = "flex flex-col gap-1.5 text-xs uppercase tracking-wider text-gray-500";

/**
 * Sección 07 — Participación. Combina el CTA hacia el dashboard público con
 * el formulario de contacto, ambos en la estética editorial (subrayado en
 * lugar de cajas, sin color de marca).
 */
export function Participation() {
  const { form, setField, toggleConsent, isValid, submitted, handleSubmit } =
    useContactForm();

  return (
    <section
      id="participacion"
      className="scroll-mt-24 px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="07" label="Participación" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        Explora los datos o súmate al proyecto
      </h2>

      <div className="mt-10 flex flex-col gap-4 border-y border-black py-8">
        <p className="max-w-2xl text-sm leading-relaxed text-gray-600 lg:text-base text-pretty">
          Consulta en tiempo real los resultados agregados y anonimizados de
          las encuestas de caracterización aplicadas en café, cacao, cannabis
          y cáñamo en los seis departamentos del proyecto.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 border-b border-black pb-1 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:text-gray-600"
        >
          Ver dashboard público
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-12">
        {submitted ? (
          <div className="flex flex-col items-start gap-3 py-16">
            <span className="flex h-10 w-10 items-center justify-center border border-black text-black">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-editorial-serif)] text-2xl font-semibold tracking-tight text-black">
              Gracias por escribirnos
            </h3>
            <p className="text-sm text-gray-600">
              Te vamos a contactar a la brevedad al correo indicado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16">
            <div className="flex flex-col gap-3">
              <h3 className="font-[family-name:var(--font-editorial-serif)] text-2xl font-semibold tracking-tight text-black">
                Cuéntanos cómo te gustaría sumarte
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 text-pretty">
                Compártenos tu rol y el tema que te interesa. El equipo del
                proyecto te contactará para articular la colaboración con la
                entidad, agremiación o grupo de investigación
                correspondiente.
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                Tiempo de respuesta: hasta 5 días hábiles
              </p>
            </div>

            <form
              aria-label="Formulario de contacto del proyecto SOS Agro 4C"
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className={labelClass} htmlFor="contact-name">
                  <span>Nombre completo *</span>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="María Pérez"
                    value={form.name}
                    onChange={setField("name")}
                    className={fieldClass}
                  />
                </label>

                <label className={labelClass} htmlFor="contact-email">
                  <span>Correo electrónico *</span>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="maria@ejemplo.co"
                    value={form.email}
                    onChange={setField("email")}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className={labelClass} htmlFor="contact-organization">
                  <span>Organización</span>
                  <input
                    id="contact-organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    placeholder="Universidad, empresa o agremiación"
                    value={form.organization}
                    onChange={setField("organization")}
                    className={fieldClass}
                  />
                </label>

                <label className={labelClass} htmlFor="contact-role">
                  <span>Rol *</span>
                  <select
                    id="contact-role"
                    name="role"
                    required
                    value={form.role}
                    onChange={setField("role")}
                    className={fieldClass}
                  >
                    {roleOptions.map((o) => (
                      <option key={o.value} value={o.value} disabled={!o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={labelClass} htmlFor="contact-topic">
                <span>Tema de interés *</span>
                <select
                  id="contact-topic"
                  name="topic"
                  required
                  value={form.topic}
                  onChange={setField("topic")}
                  className={fieldClass}
                >
                  {topicOptions.map((o) => (
                    <option key={o.value} value={o.value} disabled={!o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass} htmlFor="contact-message">
                <span>Mensaje *</span>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  minLength={20}
                  placeholder="Cuéntanos brevemente cómo te gustaría colaborar con el proyecto, qué capacidades aportas o qué información necesitas."
                  value={form.message}
                  onChange={setField("message")}
                  className={`${fieldClass} resize-y`}
                />
              </label>

              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  checked={form.consent}
                  onChange={toggleConsent}
                  className="mt-0.5 h-4 w-4 shrink-0 border-gray-300 text-black focus:ring-black"
                />
                <span>
                  Acepto el tratamiento de mis datos personales conforme a la
                  política de privacidad institucional del ITM. *
                </span>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-gray-500">
                  Este formulario aún no envía datos a un servidor real.
                </p>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="inline-flex w-fit items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
                >
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
