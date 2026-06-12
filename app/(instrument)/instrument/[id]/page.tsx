import InstrumentLoader from '../InstrumentLoader';

interface InstrumentPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    campaignSessionId?: string;
    stepOrder?: string;
    preview?: string;
    existingSurveyId?: string;
  }>;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InstrumentPage({
  params,
  searchParams,
}: InstrumentPageProps) {
  const { id } = await params;
  const { campaignSessionId, stepOrder, preview, existingSurveyId } = await searchParams;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
  const isPreview = preview === 'true';

  if (!uuidRegex.test(id)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-red-600">
        ID de instrumento no válido. Verifica el enlace e intenta de nuevo.
      </div>
    );
  }

  const parsedStepOrder = stepOrder ? Number(stepOrder) : undefined;
  return (
    <InstrumentLoader
      instrumentId={id}
      apiBaseUrl={apiBaseUrl}
      campaignSessionId={campaignSessionId}
      stepOrder={Number.isFinite(parsedStepOrder) ? parsedStepOrder : undefined}
      previewMode={isPreview}
      existingSurveyId={existingSurveyId}
    />
  );
}
