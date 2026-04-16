import { useState } from "react";
import { Anchor, MapPin, Plus, Trash2, ChevronRight, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";

export function MenaraSuar() {
  const { menaraSuarList, addMenaraSuar, deleteMenaraSuar, setCurrentMenaraId } = useApp();
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!nama.trim()) { setFormError("Nama Menara Suar wajib diisi."); return; }
    if (!lat.trim() || !lng.trim()) { setFormError("Latitude dan Longitude wajib diisi."); return; }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setFormError("Latitude dan Longitude harus berupa angka.");
      return;
    }

    addMenaraSuar(nama.trim(), latNum, lngNum);
    setNama("");
    setLat("");
    setLng("");
  };

  const handleSelect = (id: string) => {
    setCurrentMenaraId(id);
    navigate(`/menara-suar/${id}`);
  };

  const filteredList = menaraSuarList.filter(m => 
    m.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-800 text-3xl font-bold flex items-center gap-3">
          <Anchor className="w-8 h-8 text-cyan-600" /> Manajemen Menara Suar
        </h1>
        <p className="text-slate-500 mt-1">Kelola data identitas menara suar untuk keperluan analisis sumber energi.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-slate-700 font-bold text-lg mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-500" /> Tambah Menara Baru
            </h2>

            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Nama Menara Suar</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: MS Karang Jamuang"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="-6.8233"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="109.0044"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Simpan Data
              </button>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menara suar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-slate-500 font-semibold px-6 py-4">Nama Menara</th>
                    <th className="text-left text-slate-500 font-semibold px-6 py-4">Koordinat (Lat, Lng)</th>
                    <th className="text-center text-slate-500 font-semibold px-6 py-4">History</th>
                    <th className="text-right text-slate-500 font-semibold px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length > 0 ? (
                    filteredList.map((m) => (
                      <tr key={m.id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div 
                            onClick={() => handleSelect(m.id)}
                            className="font-bold text-slate-700 cursor-pointer hover:text-cyan-600 flex items-center gap-2"
                          >
                            <Anchor className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                            {m.nama}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                            {m.history.length} Kalkulasi
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSelect(m.id)}
                              className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                              title="Lihat Detail & History"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteMenaraSuar(m.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Hapus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                        Tidak ada data menara suar yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
