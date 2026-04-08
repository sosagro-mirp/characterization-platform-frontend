import InstrumentLoader from './InstrumentLoader';

export default function InstrumentPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
  return <InstrumentLoader apiBaseUrl={apiBaseUrl} />;
}
