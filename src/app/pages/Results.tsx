import { useRef } from "react";
import { Trophy, Printer, ArrowLeft, Medal, Star, CheckCircle2, Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { fmt } from "../utils/vikor";

const RANK_COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const medalIcons = ["🥇", "🥈", "🥉"];

export function Results() {
  const { criteria, alternatives, ahpResult, vikorResult } = useApp();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!vikorResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-amber-500" /> Hasil Rekomendasi
        </h1>
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center">
          <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">Perhitungan VIKOR Belum Dilakukan</h3>
          <p className="text-slate-400 text-sm mt-1">Jalankan perhitungan VIKOR terlebih dahulu untuk melihat hasil rekomendasi</p>
          <button onClick={() => navigate("/vikor")} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Ke Halaman Proses VIKOR
          </button>
        </div>
      </div>
    );
  }

  const ranking = vikorResult.ranking;
  const winner = ranking[0];

  const qChartData = ranking.map((r, idx) => ({
    name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name,
    fullName: r.name,
    Q: parseFloat(r.Q.toFixed(4)),
    S: parseFloat(r.S.toFixed(4)),
    R: parseFloat(r.R.toFixed(4)),
    rank: r.rank,
    color: RANK_COLORS[idx % RANK_COLORS.length],
  }));

  const weightRadarData = ahpResult
    ? criteria.map((c) => ({
        subject: c.code,
        fullName: c.name,
        bobot: parseFloat((ahpResult.weights[c.id] * 100).toFixed(2)),
      }))
    : [];

  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; inset: 0; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 no-print">
          <div>
            <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" /> Hasil Rekomendasi
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Perangkingan akhir berdasarkan metode VIKOR</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/vikor")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm transition">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> Cetak PDF
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div id="print-area" ref={printRef}>
          {/* Print Header */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-slate-200 pb-6">
            <h1 className="text-2xl font-bold text-slate-800">LAPORAN HASIL KEPUTUSAN</h1>
            <h2 className="text-lg font-semibold text-slate-600 mt-1">Sistem Pendukung Keputusan AHP-VIKOR</h2>
            <p className="text-slate-500 text-sm mt-2">Pemilihan Sumber Energi Listrik Optimal</p>
            <p className="text-slate-400 text-xs mt-1">Tanggal: {today}</p>
          </div>

          {/* Winner Card */}
          <div className={`rounded-xl p-6 mb-6 text-white ${winner ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-slate-400"}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                🏆
              </div>
              <div className="flex-1">
                <div className="text-green-100 text-sm font-medium">Rekomendasi Terbaik – Peringkat 1</div>
                <h2 className="text-white text-2xl font-bold">{winner?.name}</h2>
                <div className="flex gap-4 mt-1">
                  <span className="text-green-100 text-sm">Q = <strong className="text-white">{fmt(winner?.Q ?? 0)}</strong></span>
                  <span className="text-green-100 text-sm">S = <strong className="text-white">{fmt(winner?.S ?? 0)}</strong></span>
                  <span className="text-green-100 text-sm">R = <strong className="text-white">{fmt(winner?.R ?? 0)}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-100 text-xs">Nilai Q Terkecil</div>
                <div className="text-white text-3xl font-bold">{fmt(winner?.Q ?? 0)}</div>
                <div className="text-green-200 text-xs">(semakin kecil = semakin baik)</div>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-500" />
              <h2 className="text-slate-700 text-sm font-semibold">Tabel Peringkat Akhir (Diurutkan berdasarkan Q Terkecil)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-center text-slate-500 text-xs font-semibold uppercase px-4 py-3 w-16">Ranking</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-3">Nama Alternatif</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Nilai S</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Nilai R</th>
                    <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-3">Nilai Q</th>
                    <th className="text-center text-slate-500 text-xs font-semibold uppercase px-4 py-3 w-32">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r) => (
                    <tr
                      key={r.alternativeId}
                      className={`border-b border-slate-50 transition-colors ${
                        r.rank === 1
                          ? "bg-green-50"
                          : r.rank === 2
                          ? "bg-indigo-50/50"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center">
                          {r.rank <= 3 ? (
                            <span className="text-2xl">{medalIcons[r.rank - 1]}</span>
                          ) : (
                            <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {r.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: RANK_COLORS[(r.rank - 1) % RANK_COLORS.length] }}
                          />
                          <span className={`font-medium text-sm ${r.rank === 1 ? "text-green-800" : "text-slate-700"}`}>
                            {r.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 text-sm">{fmt(r.S)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 text-sm">{fmt(r.R)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                        <span className={r.rank === 1 ? "text-green-700" : "text-slate-700"}>{fmt(r.Q)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {r.rank === 1 && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            <Star className="w-3 h-3" /> Terpilih
                          </span>
                        )}
                        {r.rank === 2 && (
                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Alternatif
                          </span>
                        )}
                        {r.rank > 2 && (
                          <span className="text-slate-400 text-xs">#{r.rank}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6 no-print">
            {/* Q Value Chart */}
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <h3 className="text-slate-700 text-sm font-semibold mb-4">Perbandingan Nilai Q Alternatif</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={qChartData} margin={{ top: 0, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: number) => [val.toFixed(4), "Nilai Q"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="Q" radius={[4, 4, 0, 0]}>
                    {qChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-slate-400 text-xs text-center mt-2">Nilai Q lebih kecil = peringkat lebih baik</p>
            </div>

            {/* Bobot Radar */}
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <h3 className="text-slate-700 text-sm font-semibold mb-4">Distribusi Bobot Kriteria (AHP)</h3>
              {weightRadarData.length > 2 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={weightRadarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                    <Radar name="Bobot (%)" dataKey="bobot" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Bobot"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weightRadarData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Bobot"]} />
                    <Bar dataKey="bobot" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* S R Q Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6 no-print">
            {[
              { key: "S", label: "Nilai S (Utility Measure)", desc: "Mengukur keseluruhan kedekatan terhadap solusi terbaik. Kecil = lebih baik.", color: "text-blue-600 bg-blue-50 border-blue-100" },
              { key: "R", label: "Nilai R (Regret Measure)", desc: "Mengukur penyesalan maksimum. Kecil = lebih baik.", color: "text-purple-600 bg-purple-50 border-purple-100" },
              { key: "Q", label: "Nilai Q (Compromise)", desc: "Gabungan S dan R (v=0.5). Kecil = alternatif terbaik.", color: "text-green-600 bg-green-50 border-green-100" },
            ].map((item) => (
              <div key={item.key} className={`rounded-xl p-4 border ${item.color.split(" ").slice(1).join(" ")}`}>
                <div className={`text-lg font-bold ${item.color.split(" ")[0]}`}>{item.key}</div>
                <div className="text-slate-700 text-sm font-semibold mt-0.5">{item.label}</div>
                <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                <div className="mt-3 space-y-1">
                  {ranking.slice(0, 3).map((r) => (
                    <div key={r.alternativeId} className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs truncate mr-2">{r.name}</span>
                      <span className={`text-xs font-mono font-bold ${item.color.split(" ")[0]}`}>
                        {fmt(item.key === "S" ? r.S : item.key === "R" ? r.R : r.Q)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Weight Summary Table (for print) */}
          {ahpResult && (
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h2 className="text-slate-700 text-sm font-semibold">Ringkasan Bobot Kriteria (AHP)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Kode</th>
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Nama Kriteria</th>
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Sifat</th>
                      <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">Bobot</th>
                      <th className="text-right text-slate-500 text-xs font-semibold uppercase px-4 py-2.5">(%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c) => {
                      const w = ahpResult.weights[c.id] ?? 0;
                      return (
                        <tr key={c.id} className="border-b border-slate-50">
                          <td className="px-4 py-2.5"><span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded">{c.code}</span></td>
                          <td className="px-4 py-2.5 text-slate-700">{c.name}</td>
                          <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${c.type === "benefit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.type === "benefit" ? "Benefit" : "Cost"}</span></td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-600">{w.toFixed(4)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-indigo-700">{(w * 100).toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${ahpResult.isConsistent ? "text-green-600" : "text-red-500"}`} />
                  <span className={`text-sm ${ahpResult.isConsistent ? "text-green-700" : "text-red-600"}`}>
                    Rasio Konsistensi (CR) = {ahpResult.cr.toFixed(4)} — {ahpResult.isConsistent ? "Konsisten (CR < 0.1)" : "Tidak Konsisten"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Conclusion */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-slate-700 font-semibold text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" /> Kesimpulan & Rekomendasi
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Berdasarkan hasil perhitungan menggunakan metode <strong>AHP-VIKOR</strong> dengan {criteria.length} kriteria dan {alternatives.length} alternatif,
              diperoleh bahwa <strong>{winner.name}</strong> merupakan pilihan sumber energi listrik yang paling optimal dengan nilai kompromi (Q) = <strong>{fmt(winner.Q)}</strong>,
              nilai terkecil di antara semua alternatif yang dianalisis. Peringkat selengkapnya: {ranking.map((r) => `(${r.rank}) ${r.name}`).join(", ")}.
            </p>
            <p className="text-slate-500 text-xs mt-3">
              Laporan dihasilkan oleh Sistem Pendukung Keputusan AHP-VIKOR · {today}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
