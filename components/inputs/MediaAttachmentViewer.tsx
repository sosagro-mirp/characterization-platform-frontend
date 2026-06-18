"use client";

import { useState } from "react";
import type { MediaAttachment } from "@/app/(instrument)/types";

interface MediaAttachmentViewerProps {
    attachment: MediaAttachment;
}

export default function MediaAttachmentViewer({ attachment }: MediaAttachmentViewerProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const { publicUrl, mimeType, originalFilename } = attachment;

    if (mimeType.startsWith("image/")) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="block overflow-hidden rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                    aria-label={`Ver imagen ${originalFilename}`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={publicUrl}
                        alt={originalFilename}
                        className="max-h-64 w-auto object-contain"
                    />
                </button>

                {lightboxOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        onClick={() => setLightboxOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label={originalFilename}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={publicUrl}
                            alt={originalFilename}
                            className="max-h-[90vh] max-w-[90vw] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-4 right-4 text-white text-2xl font-bold leading-none"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </>
        );
    }

    if (mimeType.startsWith("audio/")) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">{originalFilename}</span>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={publicUrl} className="w-full" />
            </div>
        );
    }

    if (mimeType.startsWith("video/")) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">{originalFilename}</span>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video controls src={publicUrl} className="max-h-64 w-auto rounded-lg" />
            </div>
        );
    }

    if (mimeType === "application/pdf") {
        return (
            <a
                href={publicUrl}
                download={originalFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <span aria-hidden="true">📄</span>
                {originalFilename}
            </a>
        );
    }

    return (
        <a
            href={publicUrl}
            download={originalFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
            <span aria-hidden="true">📎</span>
            {originalFilename}
        </a>
    );
}
