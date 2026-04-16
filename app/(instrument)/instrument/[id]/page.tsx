import InstrumentLoader from '../InstrumentLoader';

interface InstrumentPageProps {
  params: Promise<{ id: string }>;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InstrumentPage({ params }: InstrumentPageProps) {
  const { id } = await params;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

  if (!uuidRegex.test(id)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-red-600">
        ID de instrumento no válido. Verifica el enlace e intenta de nuevo.
      </div>
    );
  }

  return <InstrumentLoader instrumentId={id} apiBaseUrl={apiBaseUrl} />;
}