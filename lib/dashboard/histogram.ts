export interface HistogramBin {
  label: string;
  count: number;
  /** Porcentaje del bin sobre el total de valores (0–100). */
  percentage: number;
}

/** Algoritmo de Sturges: k = ceil(log2(n) + 1) bins entre min y max. */
export function buildHistogramBins(
  values: number[],
  min: number,
  max: number,
): HistogramBin[] {
  const n = values.length;
  if (n === 0 || max === min) return [];

  const k = Math.max(1, Math.ceil(Math.log2(n) + 1));
  const binWidth = (max - min) / k;
  const counts = Array.from({ length: k }, () => 0);

  values.forEach((v) => {
    const idx = Math.min(k - 1, Math.floor((v - min) / binWidth));
    counts[idx] += 1;
  });

  return counts.map((count, i) => ({
    label: `${(min + i * binWidth).toFixed(1)}–${(min + (i + 1) * binWidth).toFixed(1)}`,
    count,
    percentage: (count / n) * 100,
  }));
}
