import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  ListChecks, Scale, Users, Calculator, Trophy,
  CheckCircle2, ArrowRight, Database, RefreshCcw,
  Anchor, Activity, MapPin, Zap, Clock, History
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MapWidget } from "../components/MapWidget";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function Dashboard() {
  const { criteria, alternatives, ahpResult, vikorResult, menaraSuarList, loadSampleData, resetAll, setCurrentMenaraId } = useApp();
  const navigate = useNavigate();

  const weightData = ahpResult
    ? criteria.map((c) => ({
        name: c.code,
        fullName: c.name,
        bobot: parseFloat((ahpResult.weights[c.id] * 100).toFixed(2)),
      }))
    : [];

  const totalCalculations = menaraSuarList.reduce((sum, m) => sum + m.history.length, 0);

  const steps = [
    { step: 1, label: "Tambah Menara", desc: "Daftarkan menara suar", path: "/menara-suar", icon: Anchor, done: menaraSuarList.length > 0 },
    { step: 2, label: "Tambah Kriteria", desc: "Daftarkan kriteria penilaian", path: "/kriteria", icon: ListChecks, done: criteria.length > 0 },
    { step: 3, label: "Pembobotan AHP", desc: "Hitung bobot setiap kriteria", path: "/ahp", icon: Scale, done: !!ahpResult },
    { step: 4, label: "Input Alternatif", desc: "Daftarkan kandidat sumber listrik", path: "/alternatif", icon: Users, done: alternatives.length > 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold">Beranda Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Sistem Pendukung Keputusan AHP-VIKOR · Pemilihan Sumber Energi Menara Suar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSampleData} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm transition-all">
            <Database className="w-4 h-4" /> Muat Data Contoh
          </button>
          <button onClick={() => { if (confirm("Reset semua data?")) resetAll(); }} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm transition-all">
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Map Widget - Full Width */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-700 font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-500" />
            Peta Sebaran Menara Suar
          </h2>
          <button onClick={() => navigate("/menara-suar")} className="flex items-center gap-1.5 text-indigo-500 text-xs hover:text-indigo-700 transition">
            Kelola Data Menara Suar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <MapWidget menaraSuarList={menaraSuarList as any} onSelectMenara={(id) => { setCurrentMenaraId(id); navigate(`/menara-suar/${id}`); }} />
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Steps Progress */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h2 className="text-slate-700 text-sm font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-500" /> Alur Proses SPK
          </h2>
          <div className="space-y-1">
            {steps.map((s, idx) => (
              <div key={s.step}>
                <button onClick={() => navigate(s.path)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all text-left group">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-green-500" : "bg-slate-100"}`}>
                    {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <span className="text-slate-500 text-xs font-bold">{s.step}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${s.done ? "text-slate-700" : "text-slate-500"}`}>{s.label}</div>
                    <div className="text-slate-400 text-xs">{s.desc}</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                </button>
                {idx < steps.length - 1 && <div className={`ml-6.5 w-0.5 h-2 ml-7 ${s.done ? "bg-green-200" : "bg-slate-100"}`} />}
              </div>
            ))}
          </div>
          {vikorResult && (
            <button onClick={() => navigate("/hasil")} className="w-full mt-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition">
              <Trophy className="w-4 h-4" /> Lihat Hasil Rekomendasi
            </button>
          )}
        </div>

        {/* Weight Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-700 text-sm font-semibold">Bobot Kriteria (Hasil AHP)</h2>
            {ahpResult && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${ahpResult.isConsistent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                CR = {ahpResult.cr.toFixed(4)}
              </span>
            )}
          </div>
          {ahpResult && weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={weightData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number, _, props) => [`${val}%`, props.payload.fullName]}
                  labelFormatter={() => ""}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="bobot" radius={[4, 4, 0, 0]}>
                  {weightData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-44 text-slate-400">
              <Scale className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Bobot belum dihitung</p>
              <button onClick={() => navigate("/ahp")} className="mt-3 text-indigo-500 text-xs hover:underline flex items-center gap-1">
                Ke Halaman AHP <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menara Suar Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-slate-700 text-sm font-semibold flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-500" /> Daftar Menara Suar Terbaru
          </h2>
          <button onClick={() => navigate("/menara-suar")} className="flex items-center gap-1.5 text-indigo-500 text-xs hover:text-indigo-700">
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-3">Nama Menara Suar</th>
                <th className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-3 hidden md:table-cell">Koordinat (Lat, Lng)</th>
                <th className="text-center text-slate-400 text-xs font-semibold uppercase px-4 py-3">History</th>
                <th className="text-right text-slate-400 text-xs font-semibold uppercase px-4 py-3">Rekomendasi Terakhir</th>
                <th className="text-center text-slate-400 text-xs font-semibold uppercase px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menaraSuarList.slice(0, 5).map((m) => {
                const latestHistory = m.history.length > 0 ? m.history[0] : null;
                return (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-700 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {m.nama}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs font-mono hidden md:table-cell">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {m.history.length} Kalkulasi
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {latestHistory ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-100">
                          <Zap className="w-3.5 h-3.5" /> {latestHistory.winner}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">Belum dihitung</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => { setCurrentMenaraId(m.id); navigate(`/menara-suar/${m.id}`); }}
                        className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
