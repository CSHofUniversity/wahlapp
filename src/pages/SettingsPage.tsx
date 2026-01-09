// src/pages/SettingsPage.tsx
// Refaktorisierte Version – konsistent mit dem PageLayout-System

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import SettingsIcon from "@mui/icons-material/Settings";
import { PageLayout } from "../components/PageLayout";
import { useSettingsTheme } from "../hooks/useSettingsTheme";
import { OfflineHint } from "../components/OfflineHint";

/* ------------------------------------------------------------------ */
/* Hauptkomponente                                                    */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useSettingsTheme();
  const { reloadApp } = usePwaActions();
  const offline = !navigator.onLine;

  return (
    <PageLayout
      icon={<SettingsIcon />}
      title="Einstellungen"
      subtitle="Theme, App-Informationen & PWA-Funktionen."
    >
      {offline && <OfflineHint />}
      <Stack spacing={3}>
        {/* Darstellung */}
        <Section title="Darstellung">
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleTheme} />}
            label={`Dark-Mode: ${darkMode ? "aktiv" : "deaktiviert"}`}
          />
        </Section>

        <Divider />

        {/* App-Infos */}
        <Section title="App-Informationen">
          <Typography>Wahlinfo & Wahllokalfinder</Typography>
          <Typography>Version: 1.0.0</Typography>
        </Section>

        <Divider />

        {/* PWA */}
        <Section title="PWA">
          <Typography>
            Diese App kann auf dem Homescreen installiert und offline genutzt
            werden.
          </Typography>

          <Button variant="outlined" onClick={reloadApp}>
            App neu laden
          </Button>
        </Section>
      </Stack>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Präsentationskomponente: Section                                   */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

/**
 * PWA-Utilities – später erweiterbar (z. B. install prompt, update available)
 */

export function usePwaActions() {
  function reloadApp() {
    window.location.reload();
  }

  return { reloadApp };
}
