// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { FavoritenProvider } from "./context/FavoritenContext";
import { NotificationProvider } from "./context/NotificationContext";

import { ThemeContextProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import OfflineBanner from "./components/OfflineBanner";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function Root() {
  return (
    <ThemeContextProvider>
      <CssBaseline />

      <FavoritenProvider>
        <NotificationProvider>
          <BrowserRouter>
            <OfflineBanner />
            <App />
          </BrowserRouter>
        </NotificationProvider>
      </FavoritenProvider>
    </ThemeContextProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
      <Root />
    </LocalizationProvider>
  </React.StrictMode>
);

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.log("SW registration failed", err));
  });
}
