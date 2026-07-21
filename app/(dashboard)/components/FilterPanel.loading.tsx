export default function FilterPanelLoading() {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-3 w-20 rounded bg-surface-muted" />
          <div className="h-9 rounded-lg bg-surface-muted" />
        </div>
      ))}
      <div className="h-10 rounded-lg bg-surface-muted" />
    </aside>
  );
}
