import QuestionContainer from "@/components/instrument/QuestionContainer";

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
}: CheckboxGroupProps) {
    const handleOptionToggle = (optionId: string) => {
        if (selectedOptionIds.includes(optionId)) {
            onChange?.(selectedOptionIds.filter((id) => id !== optionId));
            return;
        }

        onChange?.([...selectedOptionIds, optionId]);
    };

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
                                type="checkbox"
                                id={option.id}
                                name={name}
                                value={option.id}
                                checked={selectedOptionIds.includes(option.id)}
                                onChange={() => handleOptionToggle(option.id)}
                                className="w-4 h-4 shrink-0 rounded cursor-pointer accent-green-700"
                            />
                            <span className="text-sm text-gray-800">{option.label}</span>
                        </label>
                        {option.isOther && selectedOptionIds.includes(option.id) && (
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
