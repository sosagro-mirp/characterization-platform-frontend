import QuestionContainer from "@/components/instrument/QuestionContainer";

interface OpenInputProps {
    id: string;
    name: string;
    label: string;
    type?: "text" | "number" | "email" | "tel" | "date";
    isRequired?: boolean;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OpenInput({
    id,
    name,
    label,
    type = "text",
    isRequired = false,
    placeholder,
    value,
    onChange,
}: OpenInputProps) {
    return (
        <QuestionContainer label={label} isRequired={isRequired} htmlFor={id}>
            <input
                type={type}
                name={name}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-200 px-4 py-2"
            />
        </QuestionContainer>
    );
}
