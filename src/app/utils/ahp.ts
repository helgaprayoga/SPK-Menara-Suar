import { Criterion, AHPResult } from "../context/AppContext";

const RI_TABLE: Record<number, number> = {
  1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
};

export function calculateAHP(
  criteria: Criterion[],
  pairwiseValues: Record<string, Record<string, number>>
): AHPResult {
  const n = criteria.length;
  const ids = criteria.map((c) => c.id);

  // Build full n×n matrix
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (i < j) {
        const val = pairwiseValues[ids[i]]?.[ids[j]] ?? 1;
        matrix[i][j] = val;
        matrix[j][i] = 1 / val;
      }
    }
  }

  // Column sums
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) colSums[j] += matrix[i][j];
  }

  // Normalize matrix
  const normalizedMatrix: number[][] = matrix.map((row) =>
    row.map((val, j) => val / colSums[j])
  );

  // Priority vector (row average)
  const priorityVector: number[] = normalizedMatrix.map(
    (row) => row.reduce((s, v) => s + v, 0) / n
  );

  // Lambda max
  let lambdaMax = 0;
  for (let j = 0; j < n; j++) {
    let colWeighted = 0;
    for (let i = 0; i < n; i++) colWeighted += matrix[i][j] * priorityVector[i];
    lambdaMax += colWeighted / priorityVector[j];
  }
  lambdaMax /= n;

  const CI = n <= 2 ? 0 : (lambdaMax - n) / (n - 1);
  const ri = RI_TABLE[n] ?? 1.49;
  const cr = n <= 2 ? 0 : CI / ri;

  const weights: Record<string, number> = {};
  ids.forEach((id, i) => { weights[id] = priorityVector[i]; });

  return { weights, cr, isConsistent: cr < 0.1, lambdaMax, normalizedMatrix, priorityVector };
}

export const AHP_SCALE_OPTIONS = [
  { value: 9, label: "9 – Mutlak lebih penting" },
  { value: 8, label: "8 – Sangat-sangat lebih penting" },
  { value: 7, label: "7 – Sangat lebih penting" },
  { value: 6, label: "6 – Cukup-sangat lebih penting" },
  { value: 5, label: "5 – Cukup lebih penting" },
  { value: 4, label: "4 – Sedikit-cukup lebih penting" },
  { value: 3, label: "3 – Sedikit lebih penting" },
  { value: 2, label: "2 – Hampir sama penting" },
  { value: 1, label: "1 – Sama pentingnya" },
  { value: 1 / 2, label: "1/2 – Hampir sama penting (B)" },
  { value: 1 / 3, label: "1/3 – Sedikit lebih penting (B)" },
  { value: 1 / 4, label: "1/4 – Sedikit-cukup lebih penting (B)" },
  { value: 1 / 5, label: "1/5 – Cukup lebih penting (B)" },
  { value: 1 / 6, label: "1/6 – Cukup-sangat lebih penting (B)" },
  { value: 1 / 7, label: "1/7 – Sangat lebih penting (B)" },
  { value: 1 / 8, label: "1/8 – Sangat-sangat lebih penting (B)" },
  { value: 1 / 9, label: "1/9 – Mutlak lebih penting (B)" },
];

export function formatScaleValue(val: number): string {
  if (val >= 1) return val.toFixed(0);
  const reciprocal = Math.round(1 / val);
  return `1/${reciprocal}`;
}

export function getScaleLabel(val: number, nameA: string, nameB: string): string {
  if (val === 1) return `${nameA} dan ${nameB} sama pentingnya`;
  if (val > 1) {
    const desc = val >= 9 ? "mutlak" : val >= 7 ? "sangat" : val >= 5 ? "cukup" : val >= 3 ? "sedikit" : "hampir sama";
    return `${nameA} ${desc} lebih penting dari ${nameB}`;
  }
  const inv = Math.round(1 / val);
  const desc = inv >= 9 ? "mutlak" : inv >= 7 ? "sangat" : inv >= 5 ? "cukup" : inv >= 3 ? "sedikit" : "hampir sama";
  return `${nameB} ${desc} lebih penting dari ${nameA}`;
}
