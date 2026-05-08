import type { Metadata } from 'next';
import InstrumentSyncShell from './InstrumentSyncShell';

export const metadata: Metadata = {
  manifest: '/manifest.json',
};

export default function InstrumentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InstrumentSyncShell>{children}</InstrumentSyncShell>;
}
