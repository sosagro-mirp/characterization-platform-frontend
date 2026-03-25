import QuestionContainer from "@/components/instrument/QuestionContainer";

interface SingleChoiceOption {
    id: string;
    label: string;
}

interface SingleChoiceGroupProps {
    name: string;
    label: string;
    options: SingleChoiceOption[];
    isRequired?: boolean;
    selectedOptionId?: string;
    onChange?: (optionId: string) => void;
}

export default function SingleChoiceGroup({
    name,
    label,
    options,
    isRequired = false,
    selectedOptionId,
    onChange,
}: SingleChoiceGroupProps) {
    return (
        <QuestionContainer label={label} isRequired={isRequired}>
            <div className="space-y-3">
                {options.map((option) => (
                    <div
                        key={option.id}
                        className="flex items-center px-4 py-6 rounded-xl border border-gray-200"
                    >
                        <input
                            type="radio"
                            id={option.id}
                            name={name}
                            value={option.id}
                            checked={selectedOptionId === option.id}
                            onChange={() => onChange?.(option.id)}
                            className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-green-900"
                        />
                        <label htmlFor={option.id} className="ml-3 text-base cursor-pointer">
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </QuestionContainer>
    );
}
