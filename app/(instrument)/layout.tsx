import PollsterNav from '@/components/instrument/PollsterNav';

export default function InstrumentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PollsterNav />
      {/* pt-14 compensa la navbar fija en desktop; pb-16 compensa la barra inferior en mobile */}
      <div className="sm:pt-14 pb-16 sm:pb-0">
        {children}
      </div>
    </>
  );
}
