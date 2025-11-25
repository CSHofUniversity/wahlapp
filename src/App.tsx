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

export default function App() {
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
