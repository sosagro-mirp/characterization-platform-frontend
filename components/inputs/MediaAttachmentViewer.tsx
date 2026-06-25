import QuestionContainer from "@/components/instrument/QuestionContainer";

interface Props {
    label: string;
    isRequired?: boolean;
    publicUrl: string | undefined;
    mimeType: string | undefined;
    originalFilename?: string;
}

export default function MediaAttachmentViewer({
    label,
    isRequired = false,
    publicUrl,
    mimeType,
    originalFilename,
}: Props) {
    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            {publicUrl ? (
                <MediaContent
                    publicUrl={publicUrl}
                    mimeType={mimeType ?? ""}
                    originalFilename={originalFilename}
                />
            ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--text-muted)]">
                    <FileIcon className="h-4 w-4 shrink-0" />
                    Sin evidencia capturada
                </div>
            )}
        </QuestionContainer>
    );
}

function MediaContent({
    publicUrl,
    mimeType,
    originalFilename,
}: {
    publicUrl: string;
    mimeType: string;
    originalFilename?: string;
}) {
    if (mimeType.startsWith("image/")) {
        return (
            <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-[var(--border)]"
                title={originalFilename ?? "Ver imagen en tamaño completo"}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={publicUrl}
                    alt={originalFilename ?? "Imagen capturada en campo"}
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
                <audio controls src={publicUrl} className="w-full" />
                {originalFilename && (
                    <p className="text-xs text-[var(--text-muted)]">{originalFilename}</p>
                )}
            </div>
        );
    }

    if (mimeType === "application/pdf" || mimeType.startsWith("video/")) {
        const isVideo = mimeType.startsWith("video/");
        if (isVideo) {
            return (
                <div className="space-y-2">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video controls src={publicUrl} className="w-full rounded-lg" />
                    {originalFilename && (
                        <p className="text-xs text-[var(--text-muted)]">{originalFilename}</p>
                    )}
                </div>
            );
        }
        return (
            <a
                href={publicUrl}
                download={originalFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--border)]"
            >
                <FileIcon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                {originalFilename ?? "Descargar documento"}
            </a>
        );
    }

    // Generic fallback
    return (
        <a
            href={publicUrl}
            download={originalFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--border)]"
        >
            <FileIcon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            {originalFilename ?? "Descargar archivo"}
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
