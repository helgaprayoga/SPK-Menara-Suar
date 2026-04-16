import { useState } from "react";
import { Plus, Pencil, Trash2, Users, ArrowRight, Info, Anchor, Search, ChevronDown } from "lucide-react";
import { useApp, Alternative } from "../context/AppContext";
import { useNavigate } from "react-router";

function generateId() { return Math.random().toString(36).slice(2, 10); }

export function Alternatives() {
  const { criteria, alternatives, setAlternatives, ahpResult, menaraSuarList, currentMenaraId, setCurrentMenaraId } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showMenaraDropdown, setShowMenaraDropdown] = useState(false);
  const [searchMenara, setSearchMenara] = useState("");

  const currentMenara = menaraSuarList.find(m => m.id === currentMenaraId);
  const filteredMenara = menaraSuarList.filter(m => m.nama.toLowerCase().includes(searchMenara.toLowerCase()));

  const initForm = (alt?: Alternative) => {
    setFormName(alt?.name ?? "");
    const vals: Record<string, string> = {};
    criteria.forEach((c) => { vals[c.id] = alt ? String(alt.values[c.id] ?? "") : ""; });
    setFormValues(vals);
    setError("");
  };

  const openAdd = () => { setEditId(null); initForm(); setShowForm(true); };
  const openEdit = (alt: Alternative) => { setEditId(alt.id); initForm(alt); setShowForm(true); };

  const handleSave = () => {
    if (!formName.trim()) { setError("Nama kandidat wajib diisi."); return; }
    for (const c of criteria) {
      if (formValues[c.id] === "" || isNaN(parseFloat(formValues[c.id]))) {
        setError(`Nilai untuk "${c.name}" wajib diisi (angka).`);
        return;
      }
    }
    const values: Record<string, number> = {};
    criteria.forEach((c) => { values[c.id] = parseFloat(formValues[c.id]); });

    if (editId) {
      setAlternatives(alternatives.map((a) => a.id === editId ? { ...a, name: formName.trim(), values } : a));
    } else {
      const newAlt: Alternative = { id: generateId(), name: formName.trim(), values };
      setAlternatives([...alternatives, newAlt]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus alternatif ini? Hasil VIKOR akan direset.")) {
      setAlternatives(alternatives.filter((a) => a.id !== id));
    }
  };

  if (criteria.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-indigo-600" /> Kelola Alternatif
        </h1>
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center">
          <Info className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">Tambahkan Kriteria Terlebih Dahulu</h3>
          <button onClick={() => navigate("/kriteria")} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Kelola Kriteria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Menara Selection Dropdown */}
      <div className="mb-6 relative">
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Konteks Analisis Menara Suar</label>
        <button
          onClick={() => setShowMenaraDropdown(!showMenaraDropdown)}
          className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-indigo-300 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Anchor className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span className="text-slate-700 font-bold truncate">
              {currentMenara ? currentMenara.nama : "Pilih Menara Suar..."}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMenaraDropdown ? "rotate-180" : ""}`} />
        </button>

        {showMenaraDropdown && (
          <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menara..."
                  value={searchMenara}
                  onChange={(e) => setSearchMenara(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredMenara.length > 0 ? (
                filteredMenara.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setCurrentMenaraId(m.id); setShowMenaraDropdown(false); }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 flex flex-col transition-colors ${currentMenaraId === m.id ? "bg-indigo-50" : ""}`}
                  >
                    <span className={`text-sm font-bold ${currentMenaraId === m.id ? "text-indigo-700" : "text-slate-700"}`}>{m.nama}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">Tidak ada menara ditemukan</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Kelola Alternatif & Nilai
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Daftarkan kandidat sumber listrik dan masukkan nilainya</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Alternatif
        </button>
      </div>

      {!ahpResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Pembobotan AHP belum dilakukan. Anda tetap bisa input alternatif, namun VIKOR membutuhkan bobot AHP.
            <button onClick={() => navigate("/ahp")} className="ml-2 font-medium underline">Ke AHP →</button>
          </p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-slate-800 font-semibold text-lg mb-5">
              {editId ? "Edit Alternatif" : "Tambah Alternatif Baru"}
            </h2>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-slate-600 text-sm mb-1.5">Nama Kandidat <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: PLTS Off-Grid"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              />
            </div>

            {/* Criteria Values */}
            <div className="space-y-3 mb-4">
              <label className="block text-slate-600 text-sm font-medium">Nilai untuk Setiap Kriteria <span className="text-red-500">*</span></label>
              {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-40 flex-shrink-0">
                    <span className="text-xs text-slate-500">{c.code}</span>
                    <div className="text-sm text-slate-700 font-medium leading-tight">{c.name}</div>
                    <span className={`text-xs ${c.type === "benefit" ? "text-green-600" : "text-red-500"}`}>
                      ({c.type === "benefit" ? "Benefit" : "Cost"})
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formValues[c.id] ?? ""}
                    onChange={(e) => setFormValues({ ...formValues, [c.id]: e.target.value })}
                    placeholder="0"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  />
                </div>
              ))}
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm mb-4">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition">
                {editId ? "Simpan Perubahan" : "Tambah Alternatif"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {alternatives.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">Belum Ada Alternatif</h3>
          <p className="text-slate-400 text-sm mt-1">Klik "Tambah Alternatif" untuk mendaftarkan kandidat sumber listrik</p>
          <button onClick={openAdd} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Tambah Alternatif Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Nama Kandidat</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-3 py-3 whitespace-nowrap">
                      <div>{c.code}</div>
                      <div className="text-slate-400 font-normal normal-case" style={{ fontSize: 10 }}>{c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name}</div>
                      <div className={`text-xs font-normal normal-case ${c.type === "benefit" ? "text-green-500" : "text-red-400"}`}>
                        ({c.type === "benefit" ? "B" : "C"})
                      </div>
                    </th>
                  ))}
                  <th className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map((alt) => (
                  <tr key={alt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 text-sm font-medium">{alt.name}</td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-3 text-right text-slate-600 text-sm font-mono">
                        {alt.values[c.id] !== undefined ? alt.values[c.id].toLocaleString("id-ID") : "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(alt)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(alt.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 text-sm">{alternatives.length} alternatif terdaftar</span>
            {alternatives.length >= 2 && ahpResult && (
              <button onClick={() => navigate("/vikor")} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Lanjut ke Proses VIKOR <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
