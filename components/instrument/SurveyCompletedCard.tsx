"use client";

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
    ctaText = "Volver al inicio",
    ctaHref = "/productores",
}: SurveyCompletedCardProps) {
    return (
        <section className="w-full max-w-xl mx-auto mt-19 h-[calc(100vh-76px)] bg-surface flex flex-col justify-center items-center">
            <div className="bg-brand max-w-max p-6 rounded-full text-brand-foreground">
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
            <h2 className="font-bold text-3xl mt-6 text-text-primary">{title}</h2>
            <p className="text-text-muted mt-2 px-4 text-center">{message}</p>

            <Link
                href={ctaHref}
                className="bg-brand-hover px-4 py-3 rounded-xl text-brand-foreground flex items-center gap-2 mt-12"
            >
                {ctaText}
            </Link>
        </section>
    );
}
