"use client";

import { useState } from "react";
import { InstrumentCard } from "@/components/instrument/InstrumentCard";
import type { InstrumentSummary } from "@/app/(instrument)/types";

interface InstrumentListProps {
    instruments: InstrumentSummary[];
}

export default function InstrumentList({ instruments }: InstrumentListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = instruments.filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="relative mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar instrumento por nombre…"
                    className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                />
            </div>

            {filtered.length === 0 && searchTerm && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                    No se encontraron instrumentos para &ldquo;{searchTerm}&rdquo;.
                </div>
            )}

            {filtered.length === 0 && !searchTerm && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                    No hay instrumentos activos disponibles en este momento.
                </div>
            )}

            {filtered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((instrument) => (
                        <InstrumentCard key={instrument.instrumentId} instrument={instrument} />
                    ))}
                </div>
            )}
        </>
    );
}
