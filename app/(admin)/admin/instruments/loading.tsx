export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-32 rounded bg-[var(--surface-muted)]" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded bg-[var(--surface-muted)]" />
          <div className="mt-2 h-4 w-32 rounded bg-[var(--surface-muted)]" />
        </div>
        <div className="h-9 w-44 rounded-xl bg-[var(--surface-muted)]" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="h-3 w-full max-w-3xl rounded bg-[var(--border)]" />
        </div>
        <div className="divide-y divide-[var(--border)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-4 w-40 rounded bg-[var(--surface-muted)]" />
              <div className="h-4 w-12 rounded bg-[var(--surface-muted)]" />
              <div className="h-4 w-24 rounded bg-[var(--surface-muted)]" />
              <div className="h-4 w-32 rounded bg-[var(--surface-muted)]" />
              <div className="h-5 w-16 rounded-full bg-[var(--surface-muted)]" />
              <div className="ml-auto flex gap-2">
                <div className="h-7 w-16 rounded-lg bg-[var(--surface-muted)]" />
                <div className="h-7 w-16 rounded-lg bg-[var(--surface-muted)]" />
                <div className="h-7 w-20 rounded-lg bg-[var(--surface-muted)]" />
                <div className="h-7 w-20 rounded-lg bg-[var(--surface-muted)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
