interface HeroBadgeProps {
  parts: readonly string[];
}

export function HeroBadge({ parts }: HeroBadgeProps) {
  return (
    <div
      role="presentation"
      className="max-w-max inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] lg:text-xs font-medium text-white/90 backdrop-blur-sm"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-green-400"
        aria-hidden="true"
      />
      {parts.map((part, i) => (
        <span key={part} className="flex items-center gap-2">
          {i > 0 ? (
            <span className="opacity-50" aria-hidden="true">
              ·
            </span>
          ) : null}
          {part}
        </span>
      ))}
    </div>
  );
}
