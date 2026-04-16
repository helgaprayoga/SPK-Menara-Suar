import { useState } from "react";
import { Plus, Pencil, Trash2, ListChecks, ArrowRight, Info, Anchor, Search } from "lucide-react";
import { useApp, Criterion } from "../context/AppContext";
import { useNavigate } from "react-router";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface FormState { name: string; type: "benefit" | "cost" }

export function Criteria() {
  const { criteria, setCriteria, menaraSuarList, currentMenaraId, setCurrentMenaraId } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", type: "benefit" });
  const [error, setError] = useState("");
  const [searchMenara, setSearchMenara] = useState("");

  const currentMenara = menaraSuarList.find(m => m.id === currentMenaraId);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", type: "benefit" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (c: Criterion) => {
    setEditId(c.id);
    setForm({ name: c.name, type: c.type });
    setError("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Nama kriteria wajib diisi."); return; }
    if (editId) {
      setCriteria(criteria.map((c) => c.id === editId ? { ...c, name: form.name.trim(), type: form.type } : c));
    } else {
      const newCode = `C${criteria.length + 1}`;
      const newCriterion: Criterion = { id: generateId(), code: newCode, name: form.name.trim(), type: form.type };
      setCriteria([...criteria, newCriterion]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus kriteria ini? Data AHP dan VIKOR akan direset.")) {
      const newCriteria = criteria.filter((c) => c.id !== id).map((c, i) => ({ ...c, code: `C${i + 1}` }));
      setCriteria(newCriteria);
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...criteria];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setCriteria(arr.map((c, i) => ({ ...c, code: `C${i + 1}` })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === criteria.length - 1) return;
    const arr = [...criteria];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setCriteria(arr.map((c, i) => ({ ...c, code: `C${i + 1}` })));
  };

  const filteredMenara = menaraSuarList.filter(m => m.nama.toLowerCase().includes(searchMenara.toLowerCase()));

  if (!currentMenaraId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Anchor className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Pilih Menara Suar</h1>
          <p className="text-slate-500 mt-2">Pilih menara suar yang ingin dikelola kriterianya</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari menara suar..."
            value={searchMenara}
            onChange={(e) => setSearchMenara(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {filteredMenara.length > 0 ? (
            filteredMenara.map(m => (
              <button
                key={m.id}
                onClick={() => setCurrentMenaraId(m.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="font-bold text-slate-700">{m.nama}</div>
                  <div className="text-xs text-slate-400">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 italic text-sm">
              Tidak ada menara suar ditemukan
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Selection Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Anchor className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Menara Terpilih</div>
            <div className="text-slate-700 font-bold">{currentMenara?.nama}</div>
          </div>
        </div>
        <button
          onClick={() => setCurrentMenaraId(null)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
        >
          Ganti Menara
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-indigo-600" />
            Kelola Kriteria
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Daftarkan kriteria yang digunakan dalam penilaian</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Kriteria
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-700">
          <span className="font-medium">Benefit</span> = nilai lebih tinggi lebih baik (contoh: kapasitas daya, keandalan). &nbsp;
          <span className="font-medium">Cost</span> = nilai lebih rendah lebih baik (contoh: biaya investasi, biaya operasional).
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-slate-800 font-semibold text-lg mb-5">
              {editId ? "Edit Kriteria" : "Tambah Kriteria Baru"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">Nama Kriteria <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Biaya Investasi"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">Sifat Kriteria</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["benefit", "cost"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.type === t
                          ? t === "benefit"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-red-400 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {t === "benefit" ? "✅ Benefit" : "🔻 Cost"}
                      <div className="text-xs mt-0.5 opacity-70">{t === "benefit" ? "Lebih besar = lebih baik" : "Lebih kecil = lebih baik"}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                {editId ? "Simpan Perubahan" : "Tambah Kriteria"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {criteria.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center">
          <ListChecks className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">Belum Ada Kriteria</h3>
          <p className="text-slate-400 text-sm mt-1">Klik "Tambah Kriteria" untuk mulai mendaftarkan kriteria penilaian</p>
          <button onClick={openAdd} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Tambah Kriteria Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3 w-12">#</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3 w-20">Kode</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Nama Kriteria</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3 w-32">Sifat</th>
                  <th className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, idx) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button disabled={idx === 0} onClick={() => handleMoveUp(idx)} className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▲</button>
                        <button disabled={idx === criteria.length - 1} onClick={() => handleMoveDown(idx)} className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▼</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.type === "benefit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {c.type === "benefit" ? "Benefit" : "Cost"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
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
            <span className="text-slate-500 text-sm">{criteria.length} kriteria terdaftar</span>
            {criteria.length >= 2 && (
              <button onClick={() => navigate("/ahp")} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Lanjut ke Pembobotan AHP <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
