"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ConsentForm from "@/components/consents/ConsentForm";
import DocumentCollisionDialog from "@/components/farmers/DocumentCollisionDialog";
import { getInstrumentByCode } from "@/services/instruments.service";
import { extractFarmer, getExtraction } from "@/services/surveys.service";
import {
  completeAfterBatch,
  resolveCollisionFlow,
  type CollisionPending,
} from "@/lib/registration/preSurveyFlow";
import {
  clearPendingConsent,
  registroInstrumentPath,
  savePendingConsent,
} from "@/lib/pollster/registrationFlow";

function NuevoProductor() {
  const router = useRouter();
  const completedSurveyId = useSearchParams().get("completedSurveyId");
  const [collision, setCollision] = useState<CollisionPending | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const ran = useRef<string | null>(null);

  // Un registro nuevo empieza sin consentimiento pendiente de intentos abandonados.
  useEffect(() => {
    if (!completedSurveyId) clearPendingConsent();
  }, [completedSurveyId]);

  // Tras S_REG: confirma la extracción del productor y abre su ficha.
  useEffect(() => {
    if (!completedSurveyId || ran.current === completedSurveyId) return;
    ran.current = completedSurveyId;
    completeAfterBatch(completedSurveyId, "registro_pending", {
      getExtraction,
      getInstrumentByCode,
      onFarmer: (farmerId) => router.replace(`/productores/${farmerId}`),
    })
      .then((outcome) => {
        if (outcome.phase === "collision") setCollision(outcome.pending);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudo confirmar el registro."),
      );
  }, [completedSurveyId, router]);

  async function resolveCollision(resolution: "same_person" | "separate_person") {
    if (!collision) return;
    setResolving(true);
    try {
      await resolveCollisionFlow(collision, resolution, {
        extractFarmer,
        getInstrumentByCode,
        onFarmer: (farmerId) => router.replace(`/productores/${farmerId}`),
      });
      setCollision(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al resolver la colisión de documento.");
      setCollision(null);
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 p-4 sm:p-6">
      <Link
        href="/productores"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Productores
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Nuevo productor
      </h1>

      {error && (
        <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {completedSurveyId ? (
        !error && !collision && (
          <p className="text-sm text-[var(--text-muted)]">Registrando al productor…</p>
        )
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)]">
            Primero se registra el consentimiento informado y luego el
            instrumento de registro.
          </p>
          <ConsentForm
            onCaptured={async (values) => {
              if (starting) return;
              setStarting(true);
              try {
                const registro = await getInstrumentByCode("S_REG");
                savePendingConsent(values);
                router.push(registroInstrumentPath(registro.instrumentId));
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "No se encontró el instrumento de registro.",
                );
                setStarting(false);
              }
            }}
          />
        </>
      )}

      {collision && (
        <DocumentCollisionDialog
          submittedName={collision.submittedName}
          existingFarmerName={collision.existingFarmerName}
          onSamePerson={() => resolveCollision("same_person")}
          onSeparatePerson={() => resolveCollision("separate_person")}
          loading={resolving}
        />
      )}
    </div>
  );
}

export default function NuevoProductorPage() {
  return (
    <Suspense fallback={null}>
      <NuevoProductor />
    </Suspense>
  );
}
