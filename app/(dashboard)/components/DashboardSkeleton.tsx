interface DashboardSkeletonProps {
  count?: number;
}

export default function DashboardSkeleton({ count = 4 }: DashboardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-[var(--border)] bg-surface-muted"
        />
      ))}
    </div>
  );
}
