import PublicSurveyLoader from "./PublicSurveyLoader";

interface PublicSurveyPageProps {
  params: Promise<{ id: string }>;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Spec 79 — /encuesta/{instrumentId}. Sin autenticación, sin
 * campaignSessionId ni farmerId: cualquiera con el enlace puede abrir esta
 * ruta. El formato del id se valida aquí (mismo patrón que
 * (instrument)/instrument/[id]/page.tsx) para no hacerle una llamada al
 * backend con un id que ya sabemos que no puede ser válido.
 */
export default async function PublicSurveyPage({
  params,
}: PublicSurveyPageProps) {
  const { id } = await params;

  if (!uuidRegex.test(id)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-red-600">
        El enlace no es válido. Verifícalo e intenta de nuevo.
      </div>
    );
  }

  return <PublicSurveyLoader instrumentId={id} />;
}
