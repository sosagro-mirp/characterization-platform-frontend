"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import OpenInput from "./OpenInput";
import type { InstrumentDraftAnswer } from "@/app/(instrument)/types";

type GpsState = "idle" | "requesting" | "obtained" | "error";

interface GpsCoordinateInputProps {
    questionId: string;
    fieldType: "latitude" | "longitude";
    label: string;
    isRequired: boolean;
    value: number | undefined;
    onChange: (answer: InstrumentDraftAnswer) => void;
}

const geolocationSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

export default function GpsCoordinateInput({
    questionId,
    fieldType,
    label,
    isRequired,
    value,
    onChange,
}: GpsCoordinateInputProps) {
    const [gpsState, setGpsState] = useState<GpsState>("idle");
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const raw = event.target.value;
        const parsed = parseFloat(raw);
        onChange({
            questionId,
            numericValue: raw === "" || isNaN(parsed) ? undefined : parsed,
        });
    }

    function handleGpsClick() {
        if (!geolocationSupported) return;

        setGpsState("requesting");
        setErrorMessage("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coord =
                    fieldType === "latitude"
                        ? position.coords.latitude
                        : position.coords.longitude;

                setAccuracy(position.coords.accuracy ?? null);
                onChange({ questionId, numericValue: coord });
                setGpsState("obtained");
            },
            () => {
                setGpsState("error");
                setErrorMessage(
                    "No se pudo obtener la ubicación. Verifica los permisos del navegador.",
                );
            },
            { enableHighAccuracy: true, timeout: 20_000 },
        );
    }

    if (!geolocationSupported) {
        return (
            <OpenInput
                id={questionId}
                name={questionId}
                label={label}
                isRequired={isRequired}
                type="number"
                value={value ?? ""}
                onChange={handleInputChange}
            />
        );
    }

    const buttonLabel = gpsState === "obtained" ? "Actualizar GPS" : "Usar GPS";
    const isRequesting = gpsState === "requesting";

    return (
        <div className="flex flex-col gap-2">
            <OpenInput
                id={questionId}
                name={questionId}
                label={label}
                isRequired={isRequired}
                type="number"
                value={value ?? ""}
                onChange={handleInputChange}
            />

            <button
                type="button"
                onClick={handleGpsClick}
                disabled={isRequesting}
                className="inline-flex items-center gap-2 self-start rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 transition-colors"
            >
                {isRequesting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Obteniendo...
                    </>
                ) : (
                    <>
                        <MapPin className="h-4 w-4" />
                        {buttonLabel}
                    </>
                )}
            </button>

            {gpsState === "obtained" && accuracy !== null && (
                <p className="text-sm text-[var(--text-muted)]">Precisión: ±{Math.round(accuracy)} m</p>
            )}

            {gpsState === "error" && (
                <p className="text-sm text-[var(--danger-fg)]">{errorMessage}</p>
            )}
        </div>
    );
}
