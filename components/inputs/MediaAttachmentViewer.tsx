"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QuestionContainer from "@/components/instrument/QuestionContainer";
import {
    SIGNED_URL_SAFETY_MARGIN_MS,
    createSignedMediaUrlCache,
    type MediaUrlError,
    type SignedMediaUrl,
} from "@/lib/media/mediaSignedUrl";
import { getMediaDownloadUrl } from "@/services/media-attachments.service";

// Spec 85: la evidencia se resuelve por URL firmada bajo demanda. La caché es
// de módulo para que varios visores del mismo adjunto compartan una petición
// (riesgo R4: throttler de 60 req/min por IP).
const mediaUrlCache = createSignedMediaUrlCache({ fetch: getMediaDownloadUrl });

type ViewerState =
    | { status: "loading" }
    | { status: "ready"; media: SignedMediaUrl }
    | { status: "error"; error: MediaUrlError };

/**
 * Resuelve la URL firmada de un adjunto y la renueva sin recargar la página:
 * un temporizador la refresca poco antes de `expiresAt`, y `renew()` permite
 * que el elemento multimedia pida otra si el navegador reporta un error.
 */
function useSignedMedia(attachmentId: string | undefined) {
    // El resultado se guarda junto al adjunto al que pertenece: si cambia el
    // `attachmentId`, el estado derivado vuelve a «cargando» sin setState en efecto.
    const [settled, setSettled] = useState<{ id: string; state: ViewerState } | null>(null);
    const renewed = useRef(false);
    const state: ViewerState =
        settled && settled.id === attachmentId ? settled.state : { status: "loading" };

    const load = useCallback(
        async (force: boolean) => {
            if (!attachmentId) return;
            if (force) mediaUrlCache.invalidate(attachmentId);
            const result = await mediaUrlCache.resolve(attachmentId);
            setSettled({
                id: attachmentId,
                state: result.ok
                    ? { status: "ready", media: result.value }
                    : { status: "error", error: result.error },
            });
        },
        [attachmentId],
    );

    // Carga inicial (y al cambiar de adjunto). El setState ocurre en el `.then`,
    // nunca de forma síncrona dentro del efecto.
    useEffect(() => {
        if (!attachmentId) return;
        renewed.current = false;
        let cancelled = false;
        void mediaUrlCache.resolve(attachmentId).then((result) => {
            if (cancelled) return;
            setSettled({
                id: attachmentId,
                state: result.ok
                    ? { status: "ready", media: result.value }
                    : { status: "error", error: result.error },
            });
        });
        return () => {
            cancelled = true;
        };
    }, [attachmentId]);

    // Renovación proactiva antes de que venza la URL.
    const expiresAt = state.status === "ready" ? state.media.expiresAt : null;
    useEffect(() => {
        if (!expiresAt) return;
        const delay = Date.parse(expiresAt) - Date.now() - SIGNED_URL_SAFETY_MARGIN_MS;
        const timer = setTimeout(() => void load(true), Math.max(delay, 1_000));
        return () => clearTimeout(timer);
    }, [expiresAt, load]);

    // Renovación reactiva: una sola vez por URL si el elemento falla al cargar.
    const renew = useCallback(() => {
        if (renewed.current) return;
        renewed.current = true;
        void load(true);
    }, [load]);

    const retry = useCallback(() => {
        renewed.current = false;
        setSettled(null);
        void load(true);
    }, [load]);

    return { state, renew, retry };
}

interface EvidenceProps {
    attachmentId: string | null | undefined;
    mimeType?: string | null;
    originalFilename?: string | null;
}

/** Evidencia sin contenedor de pregunta: úsalo donde la etiqueta ya se muestra aparte. */
export function MediaEvidence({ attachmentId, mimeType, originalFilename }: EvidenceProps) {
    if (!attachmentId) return <EmptyEvidence />;
    return (
        <ResolvedEvidence
            attachmentId={attachmentId}
            mimeTypeHint={mimeType ?? undefined}
            originalFilenameHint={originalFilename ?? undefined}
        />
    );
}

interface Props extends EvidenceProps {
    label: string;
    isRequired?: boolean;
}

export default function MediaAttachmentViewer({
    label,
    isRequired = false,
    attachmentId,
    mimeType,
    originalFilename,
}: Props) {
    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            <MediaEvidence
                attachmentId={attachmentId}
                mimeType={mimeType}
                originalFilename={originalFilename}
            />
        </QuestionContainer>
    );
}

function ResolvedEvidence({
    attachmentId,
    mimeTypeHint,
    originalFilenameHint,
}: {
    attachmentId: string;
    mimeTypeHint?: string;
    originalFilenameHint?: string;
}) {
    const { state, renew, retry } = useSignedMedia(attachmentId);

    if (state.status === "loading") {
        return (
            <div
                role="status"
                className="flex items-center gap-2 rounded-lg bg-[var(--info-bg)] px-4 py-3 text-sm text-[var(--info-fg)]"
            >
                <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
                Cargando evidencia…
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div
                role="alert"
                className="flex flex-col items-start gap-2 rounded-lg bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-fg)]"
            >
                <p>{state.error.message}</p>
                {state.error.kind !== "not_found" && state.error.kind !== "forbidden" && (
                    <button
                        type="button"
                        onClick={retry}
                        aria-label="Volver a cargar la evidencia"
                        className="rounded-md border border-current px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                    >
                        Volver a cargar
                    </button>
                )}
            </div>
        );
    }

    return (
        <MediaContent
            url={state.media.url}
            mimeType={state.media.mimeType || mimeTypeHint || ""}
            originalFilename={state.media.originalFilename ?? originalFilenameHint}
            onLoadError={renew}
        />
    );
}

function EmptyEvidence() {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--text-muted)]">
            <FileIcon className="h-4 w-4 shrink-0" />
            Sin evidencia capturada
        </div>
    );
}

function MediaContent({
    url,
    mimeType,
    originalFilename,
    onLoadError,
}: {
    url: string;
    mimeType: string;
    originalFilename?: string;
    onLoadError: () => void;
}) {
    if (mimeType.startsWith("image/")) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-[var(--border)]"
                title={originalFilename ?? "Ver imagen en tamaño completo"}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={url}
                    alt={originalFilename ?? "Imagen capturada en campo"}
                    onError={onLoadError}
                    className="max-h-72 w-full object-contain"
                />
                <p className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    {originalFilename ?? "imagen.jpg"} · Toca para ver en tamaño completo
                </p>
            </a>
        );
    }

    if (mimeType.startsWith("audio/")) {
        return (
            <div className="space-y-2">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={url} onError={onLoadError} className="w-full" />
                {originalFilename && (
                    <p className="text-xs text-[var(--text-muted)]">{originalFilename}</p>
                )}
            </div>
        );
    }

    if (mimeType.startsWith("video/")) {
        return (
            <div className="space-y-2">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video controls src={url} onError={onLoadError} className="w-full rounded-lg" />
                {originalFilename && (
                    <p className="text-xs text-[var(--text-muted)]">{originalFilename}</p>
                )}
            </div>
        );
    }

    // PDF y cualquier otro tipo: enlace de descarga. El nombre original lo fija
    // el backend en `Content-Disposition` de la URL firmada.
    return (
        <a
            href={url}
            download={originalFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--border)]"
        >
            <FileIcon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            {originalFilename ??
                (mimeType === "application/pdf" ? "Descargar documento" : "Descargar archivo")}
        </a>
    );
}

function FileIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}
