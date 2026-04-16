import { Criterion, Alternative, VikorStepData } from "../context/AppContext";

export function calculateVIKOR(
  criteria: Criterion[],
  alternatives: Alternative[],
  weights: Record<string, number>,
  v: number = 0.5
): VikorStepData {
  // Step 1: Find f* (best) and f- (worst) for each criterion
  const fBest: Record<string, number> = {};
  const fWorst: Record<string, number> = {};

  for (const crit of criteria) {
    const vals = alternatives.map((a) => a.values[crit.id] ?? 0);
    if (crit.type === "benefit") {
      fBest[crit.id] = Math.max(...vals);
      fWorst[crit.id] = Math.min(...vals);
    } else {
      fBest[crit.id] = Math.min(...vals);
      fWorst[crit.id] = Math.max(...vals);
    }
  }

  // Step 2: Calculate d[i][j] = w[j] * |f*[j] - x[i][j]| / |f*[j] - f-[j]|
  const dMatrix: Record<string, Record<string, number>> = {};
  const S: Record<string, number> = {};
  const R: Record<string, number> = {};

  for (const alt of alternatives) {
    dMatrix[alt.id] = {};
    let sSum = 0;
    let rMax = -Infinity;

    for (const crit of criteria) {
      const xij = alt.values[crit.id] ?? 0;
      const fStar = fBest[crit.id];
      const fMinus = fWorst[crit.id];
      const w = weights[crit.id] ?? 0;
      const denom = fStar - fMinus;
      const normalized = denom !== 0 ? Math.abs(fStar - xij) / Math.abs(denom) : 0;
      const d = w * normalized;
      dMatrix[alt.id][crit.id] = d;
      sSum += d;
      rMax = Math.max(rMax, d);
    }

    S[alt.id] = sSum;
    R[alt.id] = rMax === -Infinity ? 0 : rMax;
  }

  // Step 3: Find S*, S-, R*, R-
  const sValues = Object.values(S);
  const rValues = Object.values(R);
  const sStar = Math.min(...sValues);
  const sMinus = Math.max(...sValues);
  const rStar = Math.min(...rValues);
  const rMinus = Math.max(...rValues);

  // Step 4: Calculate Q
  const Q: Record<string, number> = {};
  for (const alt of alternatives) {
    const sDenom = sMinus - sStar;
    const rDenom = rMinus - rStar;
    const qS = sDenom !== 0 ? v * (S[alt.id] - sStar) / sDenom : 0;
    const qR = rDenom !== 0 ? (1 - v) * (R[alt.id] - rStar) / rDenom : 0;
    Q[alt.id] = qS + qR;
  }

  // Step 5: Rank by Q ascending
  const ranking = alternatives
    .map((alt) => ({ alternativeId: alt.id, name: alt.name, Q: Q[alt.id], S: S[alt.id], R: R[alt.id] }))
    .sort((a, b) => a.Q - b.Q)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return { fBest, fWorst, dMatrix, S, R, Q, sStar, sMinus, rStar, rMinus, ranking };
}

export function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}
