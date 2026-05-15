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
        <div className="bg-white rounded-lg shadow-sm px-6 py-6">
            <label htmlFor={htmlFor} className="block text-base font-semibold text-gray-900 leading-snug">
                {label}
                {isRequired && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="mt-5">{children}</div>
        </div>
    );
}
