"use client";

import { Check, Mail, MessageSquare, Send } from "lucide-react";
import { useContactForm } from "../../../lib/landing-content/hooks/useContactForm";
import { AgroSection } from "./AgroSection";

const roleOptions = [
  { value: "", label: "Selecciona tu rol" },
  { value: "academia", label: "Academia · investigador o estudiante" },
  { value: "empresa", label: "Empresa · sector productivo o tecnológico" },
  { value: "estado", label: "Estado · entidad pública" },
  { value: "sociedad", label: "Sociedad · agricultor o agremiación" },
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

const inputClass =
  "w-full rounded-lg border border-[#D8D2BD] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#20281F] placeholder:text-[#6B6552]/60 transition-colors focus:border-[#15803D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#EEF3E6]";

const labelClass = "flex flex-col gap-1.5 text-xs font-bold text-[#20281F]";

const requiredMark = (
  <span className="text-[#15803D]" aria-hidden="true">
    *
  </span>
);

/** Formulario de contacto con estética cálida/editorial. */
export function Participation() {
  const { form, setField, toggleConsent, isValid, submitted, handleSubmit } =
    useContactForm();

  return (
    <AgroSection id="participar" tone="creamAlt">
      <div className="rounded-3xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 lg:p-10">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3E6] text-[#14532D]">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-agro-serif)] text-xl font-medium tracking-tight text-[#20281F]">
              ¡Gracias por escribirnos!
            </h3>
            <p className="text-sm text-[#6B6552]">
              Te vamos a contactar a la brevedad al correo indicado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEF3E6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#14532D]">
                <Mail className="h-3 w-3" aria-hidden="true" />
                Contáctanos
              </span>
              <h3 className="font-[family-name:var(--font-agro-serif)] text-2xl font-medium tracking-tight text-[#20281F] text-balance lg:text-3xl">
                Cuéntanos cómo te gustaría sumarte
              </h3>
              <p className="text-sm leading-relaxed text-[#6B6552]">
                Compártenos tu rol y el tema que te interesa. El equipo del
                proyecto te contactará para articular la colaboración con la
                entidad, agremiación o grupo de investigación correspondiente.
              </p>
              <ul className="mt-2 flex flex-col gap-3 text-xs text-[#6B6552]">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#166534]" aria-hidden="true" />
                  <span>
                    <span className="font-bold text-[#20281F]">Correo institucional</span>
                    <br />
                    <span>Pendiente de habilitar</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#166534]" aria-hidden="true" />
                  <span>
                    <span className="font-bold text-[#20281F]">Tiempo de respuesta</span>
                    <br />
                    <span>Hasta 5 días hábiles</span>
                  </span>
                </li>
              </ul>
            </div>

            <form
              aria-label="Formulario de contacto del proyecto SOS Agro 4C"
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass} htmlFor="agro-contact-name">
                  <span>Nombre completo {requiredMark}</span>
                  <input
                    id="agro-contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="María Pérez"
                    value={form.name}
                    onChange={setField("name")}
                    className={inputClass}
                  />
                </label>

                <label className={labelClass} htmlFor="agro-contact-email">
                  <span>Correo electrónico {requiredMark}</span>
                  <input
                    id="agro-contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="maria@ejemplo.co"
                    value={form.email}
                    onChange={setField("email")}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass} htmlFor="agro-contact-organization">
                  <span>Organización</span>
                  <input
                    id="agro-contact-organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    placeholder="Universidad, empresa o agremiación"
                    value={form.organization}
                    onChange={setField("organization")}
                    className={inputClass}
                  />
                </label>

                <label className={labelClass} htmlFor="agro-contact-role">
                  <span>Rol {requiredMark}</span>
                  <select
                    id="agro-contact-role"
                    name="role"
                    required
                    value={form.role}
                    onChange={setField("role")}
                    className={inputClass}
                  >
                    {roleOptions.map((o) => (
                      <option key={o.value} value={o.value} disabled={!o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={labelClass} htmlFor="agro-contact-topic">
                <span>Tema de interés {requiredMark}</span>
                <select
                  id="agro-contact-topic"
                  name="topic"
                  required
                  value={form.topic}
                  onChange={setField("topic")}
                  className={inputClass}
                >
                  {topicOptions.map((o) => (
                    <option key={o.value} value={o.value} disabled={!o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass} htmlFor="agro-contact-message">
                <span>Mensaje {requiredMark}</span>
                <textarea
                  id="agro-contact-message"
                  name="message"
                  required
                  rows={5}
                  minLength={20}
                  placeholder="Cuéntanos brevemente cómo te gustaría colaborar con el proyecto, qué capacidades aportas o qué información necesitas."
                  value={form.message}
                  onChange={setField("message")}
                  className={`${inputClass} resize-y`}
                />
              </label>

              <label className="flex items-start gap-2 text-xs text-[#6B6552]">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  checked={form.consent}
                  onChange={toggleConsent}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D8D2BD] text-[#15803D] focus:ring-[#15803D]"
                />
                <span>
                  Acepto el tratamiento de mis datos personales conforme a la
                  política de privacidad institucional del ITM. {requiredMark}
                </span>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-[#6B6552]">
                  Este formulario aún no envía datos a un servidor real.
                </p>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Enviar mensaje
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AgroSection>
  );
}
