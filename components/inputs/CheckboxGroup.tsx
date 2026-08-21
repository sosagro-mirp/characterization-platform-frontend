"use client";

import { useMemo, useState } from "react";
import QuestionContainer from "@/components/instrument/QuestionContainer";
import { OPTION_SEARCH_THRESHOLD, normalizeSearchText } from "@/lib/optionSearch";

interface CheckboxOption {
    id: string;
    label: string;
    isOther?: boolean;
}

interface CheckboxGroupProps {
    name: string;
    label: string;
    options: CheckboxOption[];
    isRequired?: boolean;
    selectedOptionIds?: string[];
    onChange?: (optionIds: string[]) => void;
    otherText?: string;
    onOtherTextChange?: (text: string) => void;
    searchThreshold?: number;
}

export default function CheckboxGroup({
    name,
    label,
    options,
    isRequired = false,
    selectedOptionIds = [],
    onChange,
    otherText,
    onOtherTextChange,
    searchThreshold = OPTION_SEARCH_THRESHOLD,
}: CheckboxGroupProps) {
    const [query, setQuery] = useState("");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const isSearchable = options.length > searchThreshold;

    const handleOptionToggle = (optionId: string) => {
        if (selectedOptionIds.includes(optionId)) {
            onChange?.(selectedOptionIds.filter((id) => id !== optionId));
            return;
        }

        onChange?.([...selectedOptionIds, optionId]);
    };

    const visibleOptions = useMemo(() => {
        if (!isSearchable || !query.trim()) return options;
        const normalizedQuery = normalizeSearchText(query);
        return options.filter(
            (option) => option.isOther || normalizeSearchText(option.label).includes(normalizedQuery),
        );
    }, [isSearchable, options, query]);

    const hasMatches = visibleOptions.some((option) => !option.isOther);
    const selectedOptions = options.filter((option) => selectedOptionIds.includes(option.id));

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
            if (effectiveHighlightedId) handleOptionToggle(effectiveHighlightedId);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setQuery("");
        }
    };

    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            <div className="space-y-3">
                {isSearchable && selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedOptions.map((option) => (
                            <span
                                key={option.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-subtle-bg px-3 py-1 text-xs text-brand-subtle-fg"
                            >
                                {option.label}
                                <button
                                    type="button"
                                    onClick={() => handleOptionToggle(option.id)}
                                    aria-label={`Quitar ${option.label}`}
                                    className="text-brand hover:text-brand-subtle-fg"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
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
                        className="w-full rounded-xl border border-[var(--border)] bg-surface px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                )}
                {isSearchable && !hasMatches && (
                    <p className="px-3 py-2 text-sm text-text-muted">
                        Sin resultados{options.some((o) => o.isOther) ? ". Puedes usar la opción \"Otros\"." : "."}
                    </p>
                )}
                <div id={`${name}-options`} className="space-y-1">
                    {visibleOptions.map((option) => (
                        <div key={option.id}>
                            <label
                                id={`option-row-${option.id}`}
                                htmlFor={option.id}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-surface-muted transition-colors ${
                                    isSearchable && effectiveHighlightedId === option.id ? "bg-surface-muted ring-1 ring-brand" : ""
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    id={option.id}
                                    name={name}
                                    value={option.id}
                                    checked={selectedOptionIds.includes(option.id)}
                                    onChange={() => handleOptionToggle(option.id)}
                                    onFocus={() => setHighlightedId(option.id)}
                                    className="w-4 h-4 shrink-0 rounded cursor-pointer accent-[var(--brand)]"
                                />
                                <span className="text-sm text-text-primary">{option.label}</span>
                            </label>
                            {option.isOther && selectedOptionIds.includes(option.id) && (
                                <input
                                    type="text"
                                    placeholder="Escribe el nombre..."
                                    value={otherText ?? ""}
                                    onChange={(e) => onOtherTextChange?.(e.target.value)}
                                    className="mt-1 ml-10 w-[calc(100%-2.5rem)] border-b border-[var(--border-strong)] bg-transparent px-0 py-1 text-sm focus:outline-none focus:border-brand transition-colors"
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
