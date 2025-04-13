import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
// Pages
import MapPage from "./pages/MapPage";
import HeroPage from "./pages/HeroPage";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  </BrowserRouter>
);
