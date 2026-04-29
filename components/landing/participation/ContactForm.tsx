"use client";

import { Mail, MessageSquare, Send } from "lucide-react";

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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50";

const labelClass =
  "flex flex-col gap-1.5 text-xs font-bold text-gray-700";

const requiredMark = (
  <span className="text-brand" aria-hidden="true">
    *
  </span>
);

export function ContactForm() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-12">
        {/* Encabezado y contexto */}
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-dark">
            <Mail className="h-3 w-3" aria-hidden="true" />
            Contáctanos
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Cuéntanos cómo te gustaría sumarte
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Compártenos tu rol y el tema que te interesa. El equipo del proyecto
            te contactará para articular la colaboración con la entidad,
            agremiación o grupo de investigación correspondiente.
          </p>
          <ul className="mt-2 flex flex-col gap-3 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                <span className="font-bold text-gray-700">Correo institucional</span>
                <br />
                {/* TODO: actualizar cuando se cuente con correo del proyecto */}
                <span className="text-gray-500">Pendiente de habilitar</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                <span className="font-bold text-gray-700">Tiempo de respuesta</span>
                <br />
                <span className="text-gray-500">Hasta 5 días hábiles</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Formulario */}
        <form
          aria-label="Formulario de contacto del proyecto SOS Agro 4C"
          className="flex flex-col gap-4"
          // TODO: conectar a endpoint del backend cuando esté disponible
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={labelClass} htmlFor="contact-name">
              <span>Nombre completo {requiredMark}</span>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="María Pérez"
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
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={labelClass} htmlFor="contact-organization">
              <span>Organización</span>
              <input
                id="contact-organization"
                name="organization"
                type="text"
                autoComplete="organization"
                placeholder="Universidad, empresa o agremiación"
                className={inputClass}
              />
            </label>

            <label className={labelClass} htmlFor="contact-role">
              <span>Rol {requiredMark}</span>
              <select
                id="contact-role"
                name="role"
                required
                defaultValue=""
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
              defaultValue=""
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
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <span>
              Acepto el tratamiento de mis datos personales conforme a la
              política de privacidad institucional del ITM. {requiredMark}
            </span>
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-[11px] text-gray-500">
              {/* Nota visible mientras no exista backend */}
              Este formulario es una maqueta. La integración con el backend
              está pendiente.
            </p>
            <button
              type="submit"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-disabled="true"
            >
              Enviar mensaje
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
