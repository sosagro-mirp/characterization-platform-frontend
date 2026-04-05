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
        <div>
            <label className="font-bold text-3xl">{label}</label>
            {isRequired && (
                <p className="mt-2 text-sm text-gray-500">* Pregunta obligatoria</p>
            )}
            <div className="mt-6 space-y-3">
                {options.map((option) => (
                    <div key={option.id}>
                        <div className="flex items-center px-4 py-6 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id={option.id}
                                name={name}
                                value={option.id}
                                checked={selectedOptionIds.includes(option.id)}
                                onChange={() => handleOptionToggle(option.id)}
                                className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-green-900"
                            />
                            <label htmlFor={option.id} className="ml-3 text-base cursor-pointer">
                                {option.label}
                            </label>
                        </div>
                        {option.isOther && selectedOptionIds.includes(option.id) && (
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
        </div>
    );
}
