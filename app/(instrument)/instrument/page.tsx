import InstrumentQuestionFlow from "@/components/instrument/InstrumentQuestionFlow"
import type { InstrumentResponse, SurveyResponse } from "../types"

export default async function Instrument() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

    const instrument = await fetch(`${apiBaseUrl}/api/instruments/3b7bae0d-4bea-4a56-af4c-bfe65a9f887c/render`)
    const data: InstrumentResponse = await instrument.json()

    const survey = await fetch(`${apiBaseUrl}/api/surveys`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            instrumentIds: [data.instrumentId],
        }),
        cache: "no-store",
    });

    if (!survey.ok) {
        throw new Error("No se pudo crear la encuesta para registrar respuestas");
    }

    const surveyData: SurveyResponse = await survey.json();

    return (
        <InstrumentQuestionFlow
            surveyId={surveyData.surveyId}
            instrumentName={data.name}
            sections={data.sections}
        />
    )
}
