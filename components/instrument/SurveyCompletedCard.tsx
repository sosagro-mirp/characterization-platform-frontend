"use client";

import Link from "next/link";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import { useInstrumentSurveyStore } from "@/store/useInstrumentSurveyStore";

interface SurveyCompletedCardProps {
    title?: string;
    message?: string;
    ctaText?: string;
    ctaHref?: string;
    savedOffline?: boolean;
    campaignSessionId?: string;
}

export default function SurveyCompletedCard({
    title = "Encuesta completada",
    message = "Gracias por completar la encuesta. Sus respuestas han sido registradas correctamente.",
    ctaText = "Volver al inicio",
    ctaHref = "/instrument",
    savedOffline = false,
    campaignSessionId,
}: SurveyCompletedCardProps) {
    const sessionIdFromStore = useCampaignSessionStore((s) => s.sessionId);
    const activeCampaignId = useCampaignSessionStore((s) => s.campaignId) ?? null;
    const completedSurveyId = useInstrumentSurveyStore((s) => s.surveyId);

    const activeSessionId = campaignSessionId ?? sessionIdFromStore ?? null;
    const inCampaign = Boolean(activeSessionId && activeCampaignId);

    const campaignContinueHref = completedSurveyId
        ? `/campaign/${activeCampaignId}/session/${activeSessionId}?completedSurveyId=${completedSurveyId}`
        : `/campaign/${activeCampaignId}/session/${activeSessionId}`;

    const displayMessage = savedOffline
        ? "Sus respuestas han sido guardadas localmente y se enviaran al servidor cuando haya conexion."
        : message;

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
            <p className="text-gray-500 mt-2 px-4 text-center">{displayMessage}</p>

            {inCampaign ? (
                <div className="flex flex-col items-center gap-3 mt-12">
                    <Link
                        href={campaignContinueHref}
                        className="bg-green-900 px-4 py-3 rounded-xl text-gray-200 flex items-center gap-2"
                    >
                        Continuar con la siguiente encuesta
                    </Link>
                    <Link
                        href="/campaign"
                        className="text-sm text-gray-500 underline"
                    >
                        Salir
                    </Link>
                </div>
            ) : (
                <Link
                    href={ctaHref}
                    className="bg-green-900 px-4 py-3 rounded-xl text-gray-200 flex items-center gap-2 mt-12"
                >
                    {ctaText}
                </Link>
            )}
        </section>
    );
}
