import type { NewsEntry } from "./types";

// Placeholder de divulgación. Sustituir por entradas reales cuando se cuente
// con CMS o un módulo de noticias en el backend.
export const news: readonly NewsEntry[] = [
  {
    id: "kickoff-2026",
    date: "2026-03-04",
    tag: "Hito",
    title:
      "Inicio del Período 0 — alistamiento administrativo y técnico",
    summary:
      "Arranca formalmente el proyecto con la conformación del comité técnico, definición del cronograma de la sub-actividad 1.1.1 y alistamiento de la plataforma de caracterización.",
  },
  {
    id: "semillero-iot-2026",
    date: "2026-05-15",
    tag: "Convocatoria",
    title:
      "Semillero virtual: Fundamentos técnicos y conceptuales de IoT y ciencia de datos para el sector agrícola",
    summary:
      "Programa de entrenamiento descentralizado dirigido a las instituciones cooperantes en los seis departamentos del proyecto. Inscripciones abiertas para investigadores y técnicos de campo.",
  },
  {
    id: "talleres-cocreacion-2026",
    date: "2026-07-22",
    tag: "Evento",
    title:
      "Talleres de co-creación con productores en seis departamentos",
    summary:
      "Diagnóstico participativo en Antioquia, Caquetá, Chocó, La Guajira, Meta y Norte de Santander para identificar capacidades productivas y necesidades de las cadenas de café, cacao, cannabis y cáñamo.",
  },
  {
    id: "art-caracterizacion-2026",
    date: "2026-11-30",
    tag: "Publicación",
    title:
      "Artículo: caracterización de capacidades técnicas y humanas para la adopción de tecnologías basadas en ciencia de datos",
    summary:
      "Resultado de la sub-actividad 1.1.1: documento de lineamientos técnicos por sector productivo, derivado de los instrumentos aplicados en las unidades productivas vinculadas a las agremiaciones.",
  },
] as const;
