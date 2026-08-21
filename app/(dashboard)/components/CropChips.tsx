import { cropColor } from "@/lib/dashboard/palette";

interface CropChipItem {
  name: string;
  count: number;
  percentage: number;
}

interface CropChipsProps {
  items: CropChipItem[];
}

/** Leyenda de cultivos (spec 43, D7): primitivo de solo lectura — distinto
 * del toggle interactivo de `GlobalFilterBar` (ese filtra; este solo lista). */
export default function CropChips({ items }: CropChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const color = cropColor(item.name);
        return (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="flex-1 font-medium text-text-primary">
              {item.name}
            </span>
            <span className="font-semibold text-text-primary">
              {item.percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-text-muted">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}
