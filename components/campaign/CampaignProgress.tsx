interface CampaignProgressProps {
  completedCount: number;
  totalSteps: number;
}

export default function CampaignProgress({
  completedCount,
  totalSteps,
}: CampaignProgressProps) {
  if (totalSteps === 0) return null;
  const pct = Math.min(100, Math.round((completedCount / totalSteps) * 100));
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>
          Paso {Math.min(completedCount + 1, totalSteps)} de {totalSteps}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
