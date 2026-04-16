import { createContext, useContext, useState, ReactNode } from "react";

export interface Criterion {
  id: string;
  code: string;
  name: string;
  type: "benefit" | "cost";
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>;
}

export interface AHPResult {
  weights: Record<string, number>;
  cr: number;
  isConsistent: boolean;
  lambdaMax: number;
  normalizedMatrix: number[][];
  priorityVector: number[];
}

export interface VikorStepData {
  fBest: Record<string, number>;
  fWorst: Record<string, number>;
  dMatrix: Record<string, Record<string, number>>;
  S: Record<string, number>;
  R: Record<string, number>;
  Q: Record<string, number>;
  sStar: number;
  sMinus: number;
  rStar: number;
  rMinus: number;
  ranking: Array<{ alternativeId: string; name: string; rank: number; Q: number; S: number; R: number }>;
}

export type CuacaType = "Terik" | "Berangin" | "Sering Hujan";
export type StatusMenara = "Aktif" | "Perencanaan" | "Selesai";

export interface CalculationHistory {
  id: string;
  date: string;
  ahpResult: AHPResult | null;
  vikorResult: VikorStepData | null;
  winner: string;
}

export interface MenaraSuarItem {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  criteria: Criterion[];
  alternatives: Alternative[];
  pairwiseValues: Record<string, Record<string, number>>;
  ahpResult: AHPResult | null;
  vikorResult: VikorStepData | null;
  history: CalculationHistory[];
}

interface AppContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  criteria: Criterion[];
  setCriteria: (c: Criterion[]) => void;
  alternatives: Alternative[];
  setAlternatives: (a: Alternative[]) => void;
  pairwiseValues: Record<string, Record<string, number>>;
  setPairwiseValues: (v: Record<string, Record<string, number>>) => void;
  ahpResult: AHPResult | null;
  setAhpResult: (r: AHPResult | null) => void;
  vikorResult: VikorStepData | null;
  setVikorResult: (r: VikorStepData | null) => void;
  // Menara Suar
  menaraSuarList: MenaraSuarItem[];
  setMenaraSuarList: (list: MenaraSuarItem[]) => void;
  addMenaraSuar: (nama: string, lat: number, lng: number) => void;
  deleteMenaraSuar: (id: string) => void;
  addHistoryToMenara: (menaraId: string, history: Omit<CalculationHistory, "id" | "date">) => void;
  currentMenaraId: string | null;
  setCurrentMenaraId: (id: string | null) => void;
  loadSampleData: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const SAMPLE_CRITERIA: Criterion[] = [
  { id: "c1", code: "C1", name: "Biaya Investasi", type: "cost" },
  { id: "c2", code: "C2", name: "Biaya Operasional", type: "cost" },
  { id: "c3", code: "C3", name: "Kapasitas Daya (kW)", type: "benefit" },
  { id: "c4", code: "C4", name: "Keandalan & Kontinuitas", type: "benefit" },
  { id: "c5", code: "C5", name: "Dampak Lingkungan", type: "cost" },
  { id: "c6", code: "C6", name: "Kemudahan Instalasi", type: "benefit" },
];

const SAMPLE_ALTERNATIVES: Alternative[] = [
  { id: "a1", name: "PLN (Listrik Negara)", values: { c1: 50, c2: 30, c3: 100, c4: 85, c5: 60, c6: 90 } },
  { id: "a2", name: "PLTS Off-Grid", values: { c1: 180, c2: 8, c3: 50, c4: 60, c5: 10, c6: 65 } },
  { id: "a3", name: "Genset Diesel", values: { c1: 40, c2: 60, c3: 80, c4: 75, c5: 80, c6: 85 } },
  { id: "a4", name: "PLTS + Baterai Hibrida", values: { c1: 250, c2: 12, c3: 80, c4: 80, c5: 15, c6: 60 } },
];

const SAMPLE_PAIRWISE: Record<string, Record<string, number>> = {
  c1: { c2: 3, c3: 0.333, c4: 0.2, c5: 5, c6: 3 },
  c2: { c3: 0.333, c4: 0.2, c5: 3, c6: 2 },
  c3: { c4: 0.333, c5: 7, c6: 5 },
  c4: { c5: 9, c6: 7 },
  c5: { c6: 0.333 },
};

export const SAMPLE_MENARA_SUAR: MenaraSuarItem[] = [
  { id: "ms1", nama: "Menara Suar Karang Jamuang", lat: -6.8233, lng: 109.0044, criteria: SAMPLE_CRITERIA, alternatives: SAMPLE_ALTERNATIVES, pairwiseValues: SAMPLE_PAIRWISE, ahpResult: null, vikorResult: null, history: [] },
  { id: "ms2", nama: "Menara Suar Tanjung Priok", lat: -6.1000, lng: 106.8833, criteria: [], alternatives: [], pairwiseValues: {}, ahpResult: null, vikorResult: null, history: [] },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [criteria, setCriteriaState] = useState<Criterion[]>([]);
  const [alternatives, setAlternativesState] = useState<Alternative[]>([]);
  const [pairwiseValues, setPairwiseValuesState] = useState<Record<string, Record<string, number>>>({});
  const [ahpResult, setAhpResultState] = useState<AHPResult | null>(null);
  const [vikorResult, setVikorResultState] = useState<VikorStepData | null>(null);
  const [menaraSuarList, setMenaraSuarListState] = useState<MenaraSuarItem[]>(SAMPLE_MENARA_SUAR);
  const [currentMenaraId, setCurrentMenaraIdState] = useState<string | null>(null);

  const login = () => { setIsLoggedIn(true); };
  const logout = () => { setIsLoggedIn(false); };

  const updateMenaraItem = (id: string, updates: Partial<MenaraSuarItem>) => {
    setMenaraSuarListState(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const setCriteria = (c: Criterion[]) => { 
    setCriteriaState(c); 
    setAhpResultState(null); 
    setVikorResultState(null); 
    if (currentMenaraId) updateMenaraItem(currentMenaraId, { criteria: c, ahpResult: null, vikorResult: null });
  };
  const setAlternatives = (a: Alternative[]) => { 
    setAlternativesState(a); 
    setVikorResultState(null); 
    if (currentMenaraId) updateMenaraItem(currentMenaraId, { alternatives: a, vikorResult: null });
  };
  const setPairwiseValues = (v: Record<string, Record<string, number>>) => { 
    setPairwiseValuesState(v); 
    if (currentMenaraId) updateMenaraItem(currentMenaraId, { pairwiseValues: v });
  };
  const setAhpResult = (r: AHPResult | null) => { 
    setAhpResultState(r); 
    if (currentMenaraId) updateMenaraItem(currentMenaraId, { ahpResult: r });
  };
  const setVikorResult = (r: VikorStepData | null) => { 
    setVikorResultState(r); 
    if (currentMenaraId) updateMenaraItem(currentMenaraId, { vikorResult: r });
  };
  
  const setMenaraSuarList = (list: MenaraSuarItem[]) => { setMenaraSuarListState(list); };
  
  const addMenaraSuar = (nama: string, lat: number, lng: number) => {
    const newItem: MenaraSuarItem = {
      id: Math.random().toString(36).substr(2, 9),
      nama,
      lat,
      lng,
      criteria: [],
      alternatives: [],
      pairwiseValues: {},
      ahpResult: null,
      vikorResult: null,
      history: []
    };
    const newList = [...menaraSuarList, newItem];
    setMenaraSuarList(newList);
  };

  const deleteMenaraSuar = (id: string) => {
    const newList = menaraSuarList.filter(m => m.id !== id);
    setMenaraSuarList(newList);
    if (currentMenaraId === id) setCurrentMenaraId(null);
  };

  const addHistoryToMenara = (menaraId: string, historyData: Omit<CalculationHistory, "id" | "date">) => {
    const newList = menaraSuarList.map(m => {
      if (m.id === menaraId) {
        const newHistory: CalculationHistory = {
          ...historyData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
        };
        return { ...m, history: [newHistory, ...m.history] };
      }
      return m;
    });
    setMenaraSuarList(newList);
  };

  const setCurrentMenaraId = (id: string | null) => {
    setCurrentMenaraIdState(id);
    if (id) {
      const menara = menaraSuarList.find(m => m.id === id);
      if (menara) {
        setCriteriaState(menara.criteria || []);
        setAlternativesState(menara.alternatives || []);
        setPairwiseValuesState(menara.pairwiseValues || {});
        setAhpResultState(menara.ahpResult || null);
        setVikorResultState(menara.vikorResult || null);
      }
    } else {
      setCriteriaState([]);
      setAlternativesState([]);
      setPairwiseValuesState({});
      setAhpResultState(null);
      setVikorResultState(null);
    }
  };

  const loadSampleData = () => {
    if (currentMenaraId) {
      setCriteriaState(SAMPLE_CRITERIA);
      setAlternativesState(SAMPLE_ALTERNATIVES);
      setPairwiseValuesState(SAMPLE_PAIRWISE);
      setAhpResultState(null);
      setVikorResultState(null);
      updateMenaraItem(currentMenaraId, { 
        criteria: SAMPLE_CRITERIA, 
        alternatives: SAMPLE_ALTERNATIVES, 
        pairwiseValues: SAMPLE_PAIRWISE, 
        ahpResult: null, 
        vikorResult: null 
      });
    }
  };

  const resetAll = () => {
    setCriteriaState([]);
    setAlternativesState([]);
    setPairwiseValuesState({});
    setAhpResultState(null);
    setVikorResultState(null);
    if (currentMenaraId) {
      updateMenaraItem(currentMenaraId, { 
        criteria: [], 
        alternatives: [], 
        pairwiseValues: {}, 
        ahpResult: null, 
        vikorResult: null 
      });
    }
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn, login, logout,
      criteria, setCriteria,
      alternatives, setAlternatives,
      pairwiseValues, setPairwiseValues,
      ahpResult, setAhpResult,
      vikorResult, setVikorResult,
      menaraSuarList, setMenaraSuarList,
      addMenaraSuar, deleteMenaraSuar, addHistoryToMenara,
      currentMenaraId, setCurrentMenaraId,
      loadSampleData, resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
