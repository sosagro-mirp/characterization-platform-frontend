import InstrumentLoader from '../InstrumentLoader';
import { hasApplyContextParams, parseApplyContext } from '@/lib/pollster/surveyAnchor';

interface InstrumentPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    preview?: string;
    existingSurveyId?: string;
    farmerId?: string;
    farmId?: string;
    farmCropId?: string;
    scopeLevel?: string;
    registro?: string;
  }>;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InstrumentPage({
  params,
  searchParams,
}: InstrumentPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const { preview, existingSurveyId } = sp;
  // Spec 102 — contexto de productor; inválido o incompleto se ignora.
  const query = new URLSearchParams();
  for (const k of ['farmerId', 'farmId', 'farmCropId', 'scopeLevel'] as const) {
    if (sp[k]) query.set(k, sp[k]!);
  }
  const producerContext = parseApplyContext(query);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
  const isPreview = preview === 'true';

  if (!uuidRegex.test(id)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-red-600">
        ID de instrumento no válido. Verifica el enlace e intenta de nuevo.
      </div>
    );
  }

  if (hasApplyContextParams(query) && !producerContext) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-red-600">
        El contexto del productor en el enlace no es válido. Vuelve a la ficha e inténtalo de nuevo.
      </div>
    );
  }

  return (
    <InstrumentLoader
      instrumentId={id}
      apiBaseUrl={apiBaseUrl}
      previewMode={isPreview}
      existingSurveyId={existingSurveyId}
      producerContext={producerContext ?? undefined}
      registroMode={sp.registro === '1'}
    />
  );
}
