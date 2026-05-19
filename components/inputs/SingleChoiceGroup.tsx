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
            <div className="space-y-1">
                {options.map((option) => (
                    <div key={option.id}>
                        <label
                            htmlFor={option.id}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <input
                                type="radio"
                                id={option.id}
                                name={name}
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                onChange={() => onChange?.(option.id)}
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
        </QuestionContainer>
    );
}
