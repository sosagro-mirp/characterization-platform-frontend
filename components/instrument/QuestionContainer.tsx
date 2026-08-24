import type { ReactNode } from "react";

interface QuestionContainerProps {
    label: string;
    isRequired?: boolean;
    htmlFor?: string;
    children: ReactNode;
}

export default function QuestionContainer({
    label,
    isRequired = false,
    htmlFor,
    children,
}: QuestionContainerProps) {
    return (
        <div className="bg-surface rounded-lg shadow-sm px-6 py-6">
            <label htmlFor={htmlFor} className="block text-base font-semibold text-text-primary leading-snug">
                {label}
                {isRequired && <span className="ml-1 text-[var(--danger-fg)]">*</span>}
            </label>
            <div className="mt-5">{children}</div>
        </div>
    );
}
