import { useParams, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Anchor, MapPin, ArrowLeft, History, Play, Trash2, Calendar, Award } from "lucide-react";

export function MenaraSuarDetail() {
  const { id } = useParams();
  const { menaraSuarList, setCurrentMenaraId, setCriteria, setAhpResult, setVikorResult, setAlternatives } = useApp();
  const navigate = useNavigate();

  const menara = menaraSuarList.find(m => m.id === id);

  if (!menara) {
    return (
      <div className="p-6 text-center">
        <p>Menara Suar tidak ditemukan.</p>
        <button onClick={() => navigate("/menara-suar")} className="text-cyan-600 mt-4">Kembali</button>
      </div>
    );
  }

  const handleStartNewCalculation = () => {
    setCurrentMenaraId(menara.id);
    // Reset current calculation state for a fresh start
    setAhpResult(null);
    setVikorResult(null);
    // Optionally keep criteria/alternatives or reset them too
    // For this flow, let's go to criteria page
    navigate("/kriteria");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate("/menara-suar")}
        className="flex items-center gap-2 text-slate-500 hover:text-cyan-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </button>

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600">
              <Anchor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-slate-800 text-3xl font-bold">{menara.nama}</h1>
              <div className="flex items-center gap-2 text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-cyan-500" />
                {menara.lat.toFixed(4)}, {menara.lng.toFixed(4)}
              </div>
            </div>
          </div>
          <button
            onClick={handleStartNewCalculation}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-200 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Mulai Kalkulasi Baru
          </button>
        </div>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-slate-700 font-bold text-xl mb-6 flex items-center gap-2">
          <History className="w-6 h-6 text-cyan-500" /> History Perhitungan
        </h2>

        {menara.history.length > 0 ? (
          <div className="space-y-4">
            {menara.history.map((h, idx) => (
              <div key={h.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-cyan-200 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Tanggal Perhitungan</div>
                      <div className="text-slate-700 font-bold">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Hasil Terbaik</div>
                      <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold">
                        <Award className="w-4 h-4" />
                        {h.winner}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // Logic to view this specific result
                        // This might need a result viewer page or setting state and navigating to Hasil
                        setAhpResult(h.ahpResult);
                        setVikorResult(h.vikorResult);
                        setCurrentMenaraId(menara.id);
                        navigate("/hasil");
                      }}
                      className="text-cyan-600 hover:text-cyan-700 font-bold text-sm"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-600 font-bold mb-1">Belum Ada History</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Belum ada riwayat perhitungan untuk menara suar ini. Silakan mulai kalkulasi baru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
