"use client";

import { useMemo, useState } from "react";
import QuestionContainer from "@/components/instrument/QuestionContainer";
import { OPTION_SEARCH_THRESHOLD, normalizeSearchText } from "@/lib/optionSearch";

interface SingleChoiceOption {
    id: string;
    label: string;
    isOther?: boolean;
    containerClassName?: string;
    accentClassName?: string;
}

interface SingleChoiceGroupProps {
    name: string;
    label: string;
    options: SingleChoiceOption[];
    isRequired?: boolean;
    selectedOptionId?: string;
    onChange?: (optionId: string) => void;
    otherText?: string;
    onOtherTextChange?: (text: string) => void;
    searchThreshold?: number;
}

export default function SingleChoiceGroup({
    name,
    label,
    options,
    isRequired = false,
    selectedOptionId,
    onChange,
    otherText,
    onOtherTextChange,
    searchThreshold = OPTION_SEARCH_THRESHOLD,
}: SingleChoiceGroupProps) {
    const [query, setQuery] = useState("");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const isSearchable = options.length > searchThreshold;

    const visibleOptions = useMemo(() => {
        if (!isSearchable || !query.trim()) return options;
        const normalizedQuery = normalizeSearchText(query);
        const matches = options.filter(
            (option) => option.isOther || normalizeSearchText(option.label).includes(normalizedQuery),
        );
        // Conserva visible la opción ya seleccionada aunque no coincida con la
        // búsqueda, para no perder de vista la respuesta ya dada al refinar.
        if (selectedOptionId && !matches.some((o) => o.id === selectedOptionId)) {
            const selected = options.find((o) => o.id === selectedOptionId);
            if (selected) return [selected, ...matches];
        }
        return matches;
    }, [isSearchable, options, query, selectedOptionId]);

    const hasMatches = visibleOptions.some((option) => !option.isOther);

    // Deriva el resaltado activo: usa la selección de teclado si sigue siendo
    // visible, o cae a la primera opción visible (sin usar un efecto).
    const effectiveHighlightedId =
        highlightedId && visibleOptions.some((o) => o.id === highlightedId)
            ? highlightedId
            : (visibleOptions[0]?.id ?? null);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (visibleOptions.length === 0) return;
        const currentIndex = visibleOptions.findIndex((o) => o.id === effectiveHighlightedId);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = visibleOptions[(currentIndex + 1) % visibleOptions.length];
            setHighlightedId(next.id);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + visibleOptions.length) % visibleOptions.length;
            setHighlightedId(visibleOptions[prevIndex].id);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (effectiveHighlightedId) onChange?.(effectiveHighlightedId);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setQuery("");
        }
    };

    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            <div className="space-y-3">
                {isSearchable && (
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Buscar opción…"
                        role="combobox"
                        aria-expanded
                        aria-controls={`${name}-options`}
                        aria-activedescendant={effectiveHighlightedId ? `option-row-${effectiveHighlightedId}` : undefined}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-green-600 transition-colors"
                    />
                )}
                {isSearchable && !hasMatches && (
                    <p className="px-3 py-2 text-sm text-gray-500">
                        Sin resultados{options.some((o) => o.isOther) ? ". Puedes usar la opción \"Otros\"." : "."}
                    </p>
                )}
                <div id={`${name}-options`} className="space-y-1">
                    {visibleOptions.map((option) => (
                        <div key={option.id}>
                            <label
                                id={`option-row-${option.id}`}
                                htmlFor={option.id}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                    isSearchable && effectiveHighlightedId === option.id ? "bg-gray-50 ring-1 ring-green-600" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    id={option.id}
                                    name={name}
                                    value={option.id}
                                    checked={selectedOptionId === option.id}
                                    onChange={() => onChange?.(option.id)}
                                    onFocus={() => setHighlightedId(option.id)}
                                    className={`w-4 h-4 shrink-0 cursor-pointer ${option.accentClassName ?? "accent-green-700"}`}
                                />
                                <span className="text-sm text-gray-800">{option.label}</span>
                            </label>
                            {option.isOther && selectedOptionId === option.id && (
                                <input
                                    type="text"
                                    placeholder="Escribe el nombre..."
                                    value={otherText ?? ""}
                                    onChange={(e) => onOtherTextChange?.(e.target.value)}
                                    className="mt-1 ml-10 w-[calc(100%-2.5rem)] border-b border-gray-300 bg-transparent px-0 py-1 text-sm focus:outline-none focus:border-green-600 transition-colors"
                                    maxLength={50}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </QuestionContainer>
    );
}
