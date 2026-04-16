import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Criteria } from "./pages/Criteria";
import { AHPWeighting } from "./pages/AHPWeighting";
import { Alternatives } from "./pages/Alternatives";
import { VikorCalculation } from "./pages/VikorCalculation";
import { Results } from "./pages/Results";
import { MenaraSuar } from "./pages/MenaraSuar";
import { MenaraSuarDetail } from "./pages/MenaraSuarDetail";
import { useApp } from "./context/AppContext";

function RequireAuth() {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "menara-suar", Component: MenaraSuar },
      { path: "menara-suar/:id", Component: MenaraSuarDetail },
      { path: "kriteria", Component: Criteria },
      { path: "ahp", Component: AHPWeighting },
      { path: "alternatif", Component: Alternatives },
      { path: "vikor", Component: VikorCalculation },
      { path: "hasil", Component: Results },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);