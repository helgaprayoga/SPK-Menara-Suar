import { useState } from "react";
import { Calculator, Play, Info, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateVIKOR, fmt } from "../utils/vikor";
import { useNavigate } from "react-router";

export function VikorCalculation() {
  const { criteria, alternatives, ahpResult, vikorResult, setVikorResult, currentMenaraId, addHistoryToMenara } = useApp();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [showSteps, setShowSteps] = useState(!!vikorResult);

  const canRun = criteria.length >= 2 && alternatives.length >= 2 && !!ahpResult;

  const handleRun = async () => {
    if (!ahpResult) return;
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1000));
    const result = calculateVIKOR(criteria, alternatives, ahpResult.weights);
    setVikorResult(result);

    if (currentMenaraId) {
      addHistoryToMenara(currentMenaraId, {
        ahpResult,
        vikorResult: result,
        winner: result.ranking[0].name
      });
    }

    setShowSteps(true);
    setRunning(false);
  };

  const vr = vikorResult;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-600" />
          Proses Perhitungan VIKOR
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Metode VIKOR (VlseKriterijumska Optimizacija I Kompromisno Resenje) – Optimasi Multi-Kriteria
        </p>
      </div>

      {/* Prerequisites Check */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Kriteria", done: criteria.length >= 2, desc: `${criteria.length} kriteria` },
          { label: "Bobot AHP", done: !!ahpResult && ahpResult.isConsistent, desc: ahpResult ? `CR=${ahpResult.cr.toFixed(3)}` : "Belum dihitung" },
          { label: "Alternatif", done: alternatives.length >= 2, desc: `${alternatives.length} alternatif` },
        ].map((item) => (
          <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg border ${item.done ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500" : "bg-slate-200"}`}>
              {item.done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-slate-500 text-xs">?</span>}
            </div>
            <div>
              <div className={`text-sm font-medium ${item.done ? "text-green-800" : "text-slate-500"}`}>{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {!canRun && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            Pastikan Anda telah: (1) menambahkan minimal 2 kriteria, (2) menyelesaikan pembobotan AHP yang konsisten, dan (3) menambahkan minimal 2 alternatif.
          </div>
        </div>
      )}

      {/* Method Info */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6">
        <h2 className="text-slate-700 font-semibold text-sm mb-3">Alur Perhitungan VIKOR</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { step: 1, title: "Nilai Terbaik & Terburuk", desc: "Tentukan f* dan f⁻ untuk setiap kriteria berdasarkan tipe Benefit/Cost" },
            { step: 2, title: "Matriks Normalisasi (d)", desc: "Hitung d[i][j] = w[j] × |f*[j] - x[i][j]| / |f*[j] - f⁻[j]|" },
            { step: 3, title: "Nilai S dan R", desc: "S[i] = Σ d (utility), R[i] = max d (regret) untuk setiap alternatif" },
            { step: 4, title: "Nilai Q & Ranking", desc: "Q[i] = v·(S−S*)/(S⁻−S*) + (1−v)·(R−R*)/(R⁻−R*), v=0.5" },
          ].map((s) => (
            <div key={s.step} className="bg-slate-50 rounded-lg p-3">
              <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mb-2">{s.step}</div>
              <div className="text-slate-700 text-xs font-semibold mb-1">{s.title}</div>
              <div className="text-slate-500 text-xs">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleRun}
          disabled={!canRun || running}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200"
        >
          {running ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Menghitung...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Jalankan Perhitungan VIKOR
            </>
          )}
        </button>
      </div>

      {/* Step-by-step Results */}
      {showSteps && vr && (
        <div className="space-y-6">
          {/* Step 1: Best & Worst */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <h2 className="text-slate-700 text-sm font-semibold">Nilai Terbaik (f*) dan Terburuk (f⁻)</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Keterangan</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="text-right text-slate-500 text-xs font-semibold uppercase px-3 py-3">
                        {c.code} <span className="text-slate-300">({c.type === "benefit" ? "B" : "C"})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50 bg-green-50/50">
                    <td className="px-4 py-3 font-medium text-green-700 text-sm">f* (Terbaik)</td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-3 text-right text-green-700 font-bold font-mono">{fmt(vr.fBest[c.id] ?? 0, 2)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-50 bg-red-50/50">
                    <td className="px-4 py-3 font-medium text-red-600 text-sm">f⁻ (Terburuk)</td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-3 text-right text-red-600 font-bold font-mono">{fmt(vr.fWorst[c.id] ?? 0, 2)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 2: D matrix */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-slate-700 text-sm font-semibold">Matriks d[i][j] = w[j] × |f*[j] − x[i][j]| / |f*[j] − f⁻[j]|</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Alternatif</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="text-right text-slate-500 text-xs font-semibold uppercase px-3 py-3">{c.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt) => (
                    <tr key={alt.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-700 font-medium">{alt.name}</td>
                      {criteria.map((c) => (
                        <td key={c.id} className="px-3 py-3 text-right text-slate-600 font-mono text-xs">
                          {fmt(vr.dMatrix[alt.id]?.[c.id] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3: S, R, Q */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <h2 className="text-slate-700 text-sm font-semibold">Nilai S (Utility), R (Regret), dan Q (Kompromi)</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Alternatif</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">S (Σ d)</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">R (max d)</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Q (Kompromi)</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Peringkat</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt) => {
                    const rankData = vr.ranking.find((r) => r.alternativeId === alt.id);
                    return (
                      <tr key={alt.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${rankData?.rank === 1 ? "bg-green-50/50" : ""}`}>
                        <td className="px-4 py-3 text-slate-700 font-medium">{alt.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(vr.S[alt.id] ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(vr.R[alt.id] ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">{fmt(vr.Q[alt.id] ?? 0)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rankData?.rank === 1 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                            #{rankData?.rank}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td className="px-4 py-2 text-xs text-slate-500 font-medium">Referensi</td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">
                      S* = {fmt(vr.sStar)} &nbsp;|&nbsp; S⁻ = {fmt(vr.sMinus)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">
                      R* = {fmt(vr.rStar)} &nbsp;|&nbsp; R⁻ = {fmt(vr.rMinus)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">v = 0.5</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Done */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-200" />
                <span className="font-semibold">Perhitungan VIKOR Selesai!</span>
              </div>
              <p className="text-green-100 text-sm">
                Alternatif terbaik: <strong>{vr.ranking[0]?.name}</strong> dengan nilai Q = {fmt(vr.ranking[0]?.Q ?? 0)} (terkecil)
              </p>
            </div>
            <button onClick={() => navigate("/hasil")} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
              Lihat Hasil <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
