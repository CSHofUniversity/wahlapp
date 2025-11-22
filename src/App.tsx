import { BrowserRouter, Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";

import ParteienPage from "./pages/ParteienPage";
import KandidatenPage from "./pages/KandidatenPage";
import FavoritenPage from "./pages/FavoritenPage";
import WahllokalePage from "./pages/WahllokalePage";
import WahlterminePage from "./pages/WahlterminePage";

import { NavigationBar } from "./components/NavigationBar";
import { TopBar } from "./components/TopBar";
import SettingsPage from "./pages/SettingsPage";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";

interface AppProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function App({ darkMode, toggleTheme }: AppProps) {
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <BrowserRouter>
      <TopBar darkMode={darkMode} onToggleTheme={toggleTheme} />

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
    </BrowserRouter>
  );
}
