import Link from "next/link";

interface SurveyCompletedCardProps {
    title?: string;
    message?: string;
    ctaText?: string;
    ctaHref?: string;
}

export default function SurveyCompletedCard({
    title = "Encuesta completada",
    message = "Gracias por completar la encuesta. Sus respuestas han sido registradas correctamente.",
    ctaText = "Realizar otra encuesta",
    ctaHref = "/instrument",
}: SurveyCompletedCardProps) {
    return (
        <section className="w-full max-w-xl mx-auto mt-19 h-[calc(100vh-76px)] bg-white flex flex-col justify-center items-center">
            <div className="bg-green-700 max-w-max p-6 rounded-full text-gray-200">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                    />
                </svg>
            </div>
            <h2 className="font-bold text-3xl mt-6">{title}</h2>
            <p className="text-gray-500 mt-2 px-4 text-center">{message}</p>
            <Link
                href={ctaHref}
                className="bg-green-900 px-4 py-3 rounded-xl text-gray-200 flex items-center gap-2 mt-12"
            >
                {ctaText}
            </Link>
        </section>
    );
}
