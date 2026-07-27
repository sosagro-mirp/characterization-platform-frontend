"use client";

import { Check, Mail, MessageSquare, Send } from "lucide-react";
import { useContactForm } from "../../../lib/landing-content/hooks/useContactForm";
import { SectionHeader } from "./SectionHeader";

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
  "w-full rounded-lg border border-[#2f3d31] bg-[#0b0f0c] px-3 py-2.5 text-sm text-[#f4f7f2] placeholder:text-[#8a9a8d] transition-colors focus:border-[#a3e635] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10140f] disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "flex flex-col gap-1.5 text-xs font-bold text-[#8a9a8d]";

const requiredMark = (
  <span className="text-[#a3e635]" aria-hidden="true">
    *
  </span>
);

export function Participation() {
  const { form, setField, toggleConsent, isValid, submitted, handleSubmit } =
    useContactForm();

  return (
    <section
      id="contacto"
      className="scroll-mt-24 border-t border-[#2f3d31] bg-[#0b0f0c] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Participación"
          title="Sumate a la plataforma"
          subtitle="Investigadores, empresas y agremiaciones pueden articularse con el proyecto a través de este formulario."
        />

        <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-[#2f3d31] bg-[#10140f] p-6 lg:mt-16 lg:p-10">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2921] text-[#a3e635]">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-bold tracking-tight text-[#f4f7f2]">
                ¡Gracias por escribirnos!
              </h3>
              <p className="text-sm text-[#8a9a8d]">
                Te vamos a contactar a la brevedad al correo indicado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1f2921] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#a3e635]">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  Contáctanos
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-balance text-[#f4f7f2] lg:text-3xl">
                  Cuéntanos cómo te gustaría sumarte
                </h3>
                <p className="text-sm leading-relaxed text-[#8a9a8d]">
                  Compártenos tu rol y el tema que te interesa. El equipo del
                  proyecto te contactará para articular la colaboración con la
                  entidad, agremiación o grupo de investigación
                  correspondiente.
                </p>
                <ul className="mt-2 flex flex-col gap-3 text-xs text-[#8a9a8d]">
                  <li className="flex items-start gap-2">
                    <Mail
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a3e635]"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-bold text-[#f4f7f2]">
                        Correo institucional
                      </span>
                      <br />
                      {/* TODO: actualizar cuando se cuente con correo del proyecto */}
                      <span>Pendiente de habilitar</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a3e635]"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-bold text-[#f4f7f2]">
                        Tiempo de respuesta
                      </span>
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
                  <label className={labelClass} htmlFor="contact-name">
                    <span>Nombre completo {requiredMark}</span>
                    <input
                      id="contact-name"
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

                  <label className={labelClass} htmlFor="contact-email">
                    <span>Correo electrónico {requiredMark}</span>
                    <input
                      id="contact-email"
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
                      className={inputClass}
                    />
                  </label>

                  <label className={labelClass} htmlFor="contact-role">
                    <span>Rol {requiredMark}</span>
                    <select
                      id="contact-role"
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

                <label className={labelClass} htmlFor="contact-topic">
                  <span>Tema de interés {requiredMark}</span>
                  <select
                    id="contact-topic"
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

                <label className={labelClass} htmlFor="contact-message">
                  <span>Mensaje {requiredMark}</span>
                  <textarea
                    id="contact-message"
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

                <label className="flex items-start gap-2 text-xs text-[#8a9a8d]">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    checked={form.consent}
                    onChange={toggleConsent}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#2f3d31] bg-[#0b0f0c] text-[#a3e635] focus:ring-[#a3e635]"
                  />
                  <span>
                    Acepto el tratamiento de mis datos personales conforme a
                    la política de privacidad institucional del ITM.{" "}
                    {requiredMark}
                  </span>
                </label>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-[#8a9a8d]">
                    {/* Nota visible mientras no exista backend */}
                    Este formulario aún no envía datos a un servidor real.
                  </p>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a3e635] px-5 py-2.5 text-sm font-bold text-[#0b0f0c] transition-colors hover:bg-[#bef264] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10140f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Enviar mensaje
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
