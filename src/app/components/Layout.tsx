import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard, ListChecks, Scale, Users, Calculator, Trophy,
  LogOut, Menu, X, ChevronRight, Zap, Anchor, FileText
} from "lucide-react";
import { useApp } from "../context/AppContext";

const navItems = [
  { path: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { path: "/menara-suar", label: "Data Menara Suar", icon: Anchor },
  { path: "/kriteria", label: "Kelola Kriteria", icon: ListChecks },
  { path: "/ahp", label: "Pembobotan AHP", icon: Scale },
  { path: "/alternatif", label: "Kelola Alternatif", icon: Users },
  { path: "/vikor", label: "Proses VIKOR", icon: Calculator },
  { path: "/hasil", label: "Hasil Rekomendasi", icon: Trophy },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, criteria, alternatives, ahpResult, vikorResult } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stepStatus = [
    { label: "Kriteria", done: criteria.length > 0 },
    { label: "AHP", done: !!ahpResult },
    { label: "Alternatif", done: alternatives.length > 0 },
    { label: "VIKOR", done: !!vikorResult },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">SPK AHP-VIKOR</div>
          <div className="text-slate-400 text-xs">Sumber Energi Listrik</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-4 border-b border-slate-700">
        <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">Progress</div>
        <div className="flex gap-1.5">
          {stepStatus.map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-1 ${s.done ? "bg-indigo-400" : "bg-slate-600"}`} />
              <span className="text-slate-500 text-[10px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-900/40 hover:text-red-300 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-slate-900 flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-800 text-sm font-semibold">SPK AHP-VIKOR</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}