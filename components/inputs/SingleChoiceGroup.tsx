import QuestionContainer from "@/components/instrument/QuestionContainer";

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
}: SingleChoiceGroupProps) {
    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            <div className="space-y-3">
                {options.map((option) => (
                    <div key={option.id}>
                        <div
                            className={`flex items-center px-4 py-6 rounded-xl border ${option.containerClassName ?? "border-gray-200"}`}
                        >
                            <input
                                type="radio"
                                id={option.id}
                                name={name}
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                onChange={() => onChange?.(option.id)}
                                className={`w-4 h-4 border border-gray-300 rounded cursor-pointer ${option.accentClassName ?? "accent-green-900"}`}
                            />
                            <label htmlFor={option.id} className="ml-3 text-base cursor-pointer">
                                {option.label}
                            </label>
                        </div>
                        {option.isOther && selectedOptionId === option.id && (
                            <input
                                type="text"
                                placeholder="Escribe el nombre..."
                                value={otherText ?? ""}
                                onChange={(e) => onOtherTextChange?.(e.target.value)}
                                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                maxLength={50}
                            />
                        )}
                    </div>
                ))}
            </div>
        </QuestionContainer>
    );
}
