import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MenaraSuarItem } from "../context/AppContext";
import { Anchor, Zap, History, MapPin } from "lucide-react";
import * as L from "leaflet";
import { useEffect, useMemo } from "react";

// Helper to fix icon issues and create custom markers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface Props {
  menaraSuarList: MenaraSuarItem[];
  onSelectMenara?: (id: string) => void;
}

// Component to handle auto-bounds
function ChangeView({ markers }: { markers: MenaraSuarItem[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const validMarkers = markers.filter(m => !isNaN(m.lat) && !isNaN(m.lng));
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [markers, map]);

  return null;
}

export function MapWidget({ menaraSuarList, onSelectMenara }: Props) {
  // Memoize icons to prevent re-renders
  const greenIcon = useMemo(() => createCustomIcon("#10b981"), []);
  const cyanIcon = useMemo(() => createCustomIcon("#06b6d4"), []);

  // Ensure window is defined (for SSR safety, though this is a SPA)
  if (typeof window === "undefined") return null;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={[-6.1754, 106.8272]} 
        zoom={6} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView markers={menaraSuarList} />

        {menaraSuarList.map((m) => {
          if (isNaN(m.lat) || isNaN(m.lng)) return null;
          
          const hasHistory = m.history.length > 0;
          const latestHistory = hasHistory ? m.history[0] : null;

          return (
            <Marker 
              key={m.id} 
              position={[m.lat, m.lng]} 
              icon={hasHistory ? greenIcon : cyanIcon}
            >
              <Popup>
                <div className="p-1 min-w-[150px] font-sans">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="w-4 h-4 text-cyan-600" />
                    <span className="font-bold text-slate-800 text-sm">{m.nama}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                  </div>
                  
                  <div className="space-y-1.5 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                        <History className="w-3 h-3" /> History
                      </span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{m.history.length}</span>
                    </div>
                    {latestHistory && (
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
                          <Zap className="w-2.5 h-2.5" /> Rekomendasi Terakhir:
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          {latestHistory.winner}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => onSelectMenara?.(m.id)}
                    className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] py-2 rounded-lg font-bold transition-all shadow-md shadow-cyan-100"
                  >
                    Buka Detail Menara
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
