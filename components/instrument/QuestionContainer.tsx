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
        <div className="max-w-xl mx-auto">
            <label htmlFor={htmlFor} className="font-bold text-3xl max-w-2xl">
                {label}
            </label>
            {isRequired && (
                <p className="mt-2 text-sm text-gray-500">* Pregunta obligatoria</p>
            )}
            <div className="mt-6">{children}</div>
        </div>
    );
}
