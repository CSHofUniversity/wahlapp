// src/main.tsx
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { loadNotifications } from "./services/notificationsLocal";
import { appTheme } from "./theme";

import { FavoritenProvider } from "./context/FavoritenContext";
import { NotificationProvider } from "./context/NotificationContext";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function Root() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const theme = useMemo(() => appTheme(darkMode), [darkMode]);

  // Notifications
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "CHECK_NOTIFICATIONS") {
      checkLocalNotifications();
    }
  });

  function checkLocalNotifications() {
    const list = loadNotifications();
    const now = Date.now();

    list.forEach((entry) => {
      const eventTime = new Date(entry.dateISO).getTime();
      const notifyAt = eventTime - entry.leadMinutes * 60 * 1000;

      if (now >= notifyAt && now < eventTime) {
        showBrowserNotification("Wahltermin bald!", {
          body: "Der Termin steht bevor!",
        });
      }
    });
  }

  function showBrowserNotification(
    title: string,
    options: NotificationOptions
  ) {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FavoritenProvider>
        <NotificationProvider>
          <App darkMode={darkMode} toggleTheme={() => setDarkMode((x) => !x)} />
        </NotificationProvider>
      </FavoritenProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
      <Root />
    </LocalizationProvider>
  </React.StrictMode>
);
