// src/App.tsx

import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";

import ParteienPage from "./pages/ParteienPage";
import KandidatenPage from "./pages/KandidatenPage";
import FavoritenPage from "./pages/FavoritenPage";
import WahllokalePage from "./pages/WahllokalePage";
import WahlterminePage from "./pages/WahlterminePage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";

import { TopBar } from "./components/TopBar";
import { NavigationBar } from "./components/NavigationBar";

import { useEffect } from "react";

function useDynamicThemeColor() {
  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const setColor = () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) return;

      meta.setAttribute("content", darkQuery.matches ? "#121212" : "#1e6fb8");
    };

    setColor();
    darkQuery.addEventListener("change", setColor);
    return () => darkQuery.removeEventListener("change", setColor);
  }, []);
}

export default function App() {
  useDynamicThemeColor();
  // Browser-Push Notifications
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <TopBar />

      <Box sx={{ pt: 8, pb: 8 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/parteien" element={<ParteienPage />} />
          <Route path="/kandidaten" element={<KandidatenPage />} />
          <Route path="/favoriten" element={<FavoritenPage />} />
          <Route path="/wahllokale" element={<WahllokalePage />} />
          <Route path="/wahltermine" element={<WahlterminePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Box>

      <NavigationBar />
    </>
  );
}
