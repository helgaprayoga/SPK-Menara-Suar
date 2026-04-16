import { useState, useEffect } from "react";
import { Scale, Calculator, CheckCircle2, XCircle, ChevronDown, ArrowRight, Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateAHP, AHP_SCALE_OPTIONS, getScaleLabel, formatScaleValue } from "../utils/ahp";
import { useNavigate } from "react-router";

export function AHPWeighting() {
  const { criteria, pairwiseValues, setPairwiseValues, ahpResult, setAhpResult } = useApp();
  const navigate = useNavigate();
  const [localValues, setLocalValues] = useState<Record<string, Record<string, number>>>(pairwiseValues);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    setLocalValues(pairwiseValues);
    setCalculated(!!ahpResult);
  }, []);

  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < criteria.length; i++) {
    for (let j = i + 1; j < criteria.length; j++) {
      pairs.push([i, j]);
    }
  }

  const getValue = (idA: string, idB: string): number => {
    return localValues[idA]?.[idB] ?? 1;
  };

  const setValue = (idA: string, idB: string, val: number) => {
    setLocalValues((prev) => ({
      ...prev,
      [idA]: { ...(prev[idA] ?? {}), [idB]: val },
    }));
    setCalculated(false);
  };

  const handleCalculate = () => {
    const result = calculateAHP(criteria, localValues);
    setAhpResult(result);
    setPairwiseValues(localValues);
    setCalculated(true);
  };

  const allFilled = pairs.length === 0 || pairs.every(([i, j]) => localValues[criteria[i].id]?.[criteria[j].id] !== undefined);

  if (criteria.length < 2) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="w-6 h-6 text-indigo-600" />
          <h1 className="text-slate-800 text-2xl font-bold">Pembobotan AHP</h1>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center">
          <Scale className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">Minimal 2 Kriteria Diperlukan</h3>
          <p className="text-slate-400 text-sm mt-1">Silakan tambahkan minimal 2 kriteria terlebih dahulu</p>
          <button onClick={() => navigate("/kriteria")} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Kelola Kriteria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            Pembobotan AHP
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Bandingkan setiap pasang kriteria untuk menghitung bobot relatifnya</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">
          Pilih angka <strong>1–9</strong> untuk menunjukkan seberapa penting <strong>kriteria kiri (A)</strong> dibanding <strong>kriteria kanan (B)</strong>. Angka <strong>1/2–1/9</strong> berarti B lebih penting dari A. Sistem akan menghitung nilai kebalikannya secara otomatis.
        </p>
      </div>

      {/* Comparison Form */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <h2 className="text-slate-700 text-sm font-semibold">Matriks Perbandingan Berpasangan</h2>
          <span className="text-slate-400 text-xs">{pairs.length} pasang perbandingan</span>
        </div>

        <div className="divide-y divide-slate-50">
          {pairs.map(([i, j]) => {
            const critA = criteria[i];
            const critB = criteria[j];
            const val = getValue(critA.id, critB.id);
            const label = getScaleLabel(val, critA.name, critB.name);

            return (
              <div key={`${i}-${j}`} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {/* A */}
                  <div className="flex-1 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded">{critA.code}</span>
                      <span className="text-slate-700 text-sm font-medium">{critA.name}</span>
                    </span>
                  </div>

                  {/* Select */}
                  <div className="relative flex-shrink-0">
                    <select
                      value={val}
                      onChange={(e) => setValue(critA.id, critB.id, parseFloat(e.target.value))}
                      className="appearance-none bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                    >
                      {AHP_SCALE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                          {formatScaleValue(opt.value)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200 pointer-events-none" />
                  </div>

                  {/* B */}
                  <div className="flex-1 text-left">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-700 text-sm font-medium">{critB.name}</span>
                      <span className="bg-violet-100 text-violet-700 text-xs font-bold px-1.5 py-0.5 rounded">{critB.code}</span>
                    </span>
                  </div>
                </div>
                <p className="text-center text-slate-400 text-xs mt-1.5 italic">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCalculate}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-indigo-200"
        >
          <Calculator className="w-5 h-5" />
          Hitung Bobot
        </button>
      </div>

      {/* Results */}
      {ahpResult && calculated && (
        <div className="space-y-5">
          {/* Consistency Status */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
            ahpResult.isConsistent
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            {ahpResult.isConsistent
              ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            }
            <div>
              <div className={`font-semibold ${ahpResult.isConsistent ? "text-green-800" : "text-red-800"}`}>
                {ahpResult.isConsistent ? "✅ Konsisten (CR < 0,1)" : "❌ Tidak Konsisten – Silakan Ulangi Penilaian"}
              </div>
              <div className="text-sm mt-0.5 opacity-80">
                Rasio Konsistensi (CR) = <strong>{ahpResult.cr.toFixed(4)}</strong> &nbsp;|&nbsp;
                λ<sub>max</sub> = <strong>{ahpResult.lambdaMax.toFixed(4)}</strong> &nbsp;|&nbsp;
                {!ahpResult.isConsistent && "CR harus &lt; 0,1. Periksa kembali nilai perbandingan Anda."}
              </div>
            </div>
          </div>

          {/* Weights Table */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h2 className="text-slate-700 text-sm font-semibold">Hasil Bobot Kriteria</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Kode</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Nama Kriteria</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Sifat</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Bobot (Desimal)</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Bobot (%)</th>
                    <th className="px-4 py-3 w-48">Distribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c) => {
                    const w = ahpResult.weights[c.id] ?? 0;
                    const pct = (w * 100).toFixed(2);
                    return (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">{c.code}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-sm font-medium">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === "benefit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {c.type === "benefit" ? "Benefit" : "Cost"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 text-sm font-mono">{w.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-indigo-700 font-bold text-sm">{pct}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-slate-600 text-sm font-semibold">Total</td>
                    <td className="px-4 py-3 text-right text-slate-700 text-sm font-bold font-mono">
                      {Object.values(ahpResult.weights).reduce((s, v) => s + v, 0).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right text-indigo-700 font-bold text-sm">100.00%</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Normalized Matrix */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h2 className="text-slate-700 text-sm font-semibold">Matriks Ternormalisasi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Kriteria</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="text-right text-slate-500 text-xs font-semibold uppercase px-3 py-2.5">{c.code}</th>
                    ))}
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Vektor Prioritas</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-2.5">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded">{c.code}</span>
                      </td>
                      {criteria.map((_, j) => (
                        <td key={j} className="px-3 py-2.5 text-right text-slate-600 text-xs font-mono">
                          {(ahpResult.normalizedMatrix[i]?.[j] ?? 0).toFixed(4)}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right text-indigo-700 font-bold text-xs font-mono">
                        {(ahpResult.priorityVector[i] ?? 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {ahpResult.isConsistent && (
            <div className="flex justify-end">
              <button onClick={() => navigate("/alternatif")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                Lanjut ke Input Alternatif <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
