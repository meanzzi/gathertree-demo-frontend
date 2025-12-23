import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import TreeDrawPage from "./pages/TreeDrawPage";
import TreeViewPage from "./pages/TreeViewPage";
import DecorationPage from "./pages/DecorationPage";
import TreeEditPage from "./pages/TreeEditPage";
import EvaluationPage from "./pages/EvaluationPage";
import ReactGA from "react-ga4";

const ga = ReactGA.initialize ? ReactGA : ReactGA.default;

ga.initialize("G-P795FJFT1P");
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ga.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tree/new" element={<TreeDrawPage />} />
        <Route path="/tree/:uuid" element={<TreeViewPage />} />
        <Route path="/tree/:uuid/decorate" element={<DecorationPage />} />
        <Route path="/tree/:uuid/edit" element={<TreeEditPage />} />
        <Route path="/tree/:uuid/evaluate" element={<EvaluationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
