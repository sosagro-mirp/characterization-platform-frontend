"use client";

import { useEffect, useState } from "react";
import InstrumentQuestionFlow from "@/components/instrument/InstrumentQuestionFlow";
import PublicConsentStep from "@/components/instrument/PublicConsentStep";
import {
  loadPublicInstrument,
  type PublicInstrumentResponse,
} from "@/services/public-surveys.service";
import { resolvePublicSurveyAccess } from "@/lib/public-surveys/publicSurveyAccess";
import type { PublicSurveyConsentInput } from "@/lib/public-surveys/publicSurveyPayload";

interface PublicSurveyLoaderProps {
  instrumentId: string;
}

type LoaderState =
  | { phase: "loading" }
  | { phase: "unavailable"; message: string }
  | { phase: "consent"; instrument: PublicInstrumentResponse }
  | { phase: "survey"; instrument: PublicInstrumentResponse; consent: PublicSurveyConsentInput };

/**
 * Spec 79 — orquesta el formulario público: carga el instrumento (o explica
 * por qué no está disponible, distinguiendo "cerrado" de "inexistente" —
 * criterios 2 y 9), pide el consentimiento informado como paso bloqueante
 * (criterio 5) y solo entonces monta InstrumentQuestionFlow en publicMode.
 */
export default function PublicSurveyLoader({
  instrumentId,
}: PublicSurveyLoaderProps) {
  const [state, setState] = useState<LoaderState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    loadPublicInstrument(instrumentId).then(({ result, data }) => {
      if (cancelled) return;
      const access = resolvePublicSurveyAccess(result);
      if (access.state === "available" && data) {
        setState({ phase: "consent", instrument: data });
      } else {
        setState({
          phase: "unavailable",
          message: access.message ?? "No se pudo cargar el formulario.",
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [instrumentId]);

  if (state.phase === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-muted">Cargando encuesta…</p>
      </div>
    );
  }

  if (state.phase === "unavailable") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-12 text-[var(--warning-fg)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p className="text-[var(--warning-fg)] font-medium">{state.message}</p>
      </div>
    );
  }

  if (state.phase === "consent") {
    return (
      <PublicConsentStep
        document={state.instrument.consentDocument}
        onAccept={(consent) =>
          setState({ phase: "survey", instrument: state.instrument, consent })
        }
      />
    );
  }

  return (
    <InstrumentQuestionFlow
      localId={state.instrument.instrumentId}
      instrumentId={state.instrument.instrumentId}
      instrumentName={state.instrument.name}
      sections={state.instrument.sections}
      apiBaseUrl=""
      publicMode
      publicConsent={state.consent}
    />
  );
}
