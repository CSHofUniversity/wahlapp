import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";

import { useTheme } from "@mui/material/styles";

import SettingsIcon from "@mui/icons-material/Settings";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";

export default function SettingsPage() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";

  return (
    <PageTransition>
      <PageHeader
        icon={<SettingsIcon />}
        title="Einstellungen"
        subtitle="Informationen und Einstellungen zu der App."
      />
      <Container sx={{ mt: 2, mb: 10 }}>
        <Typography variant="h5" sx={{ mb: 2 }}></Typography>

        <Stack spacing={2}>
          <Typography variant="h6">Darstellung</Typography>
          <Typography>
            Aktuelles Theme: <b>{darkMode ? "Dunkel" : "Hell"}</b>
          </Typography>

          <Divider />

          <Typography variant="h6">App-Informationen</Typography>
          <Typography>Wahl-Info & Wahllokalfinder</Typography>
          <Typography>Version: 1.0.0</Typography>

          <Divider />

          <Typography variant="h6">PWA</Typography>
          <Typography>
            Diese App kann auf dem Homescreen installiert und offline verwendet
            werden.
          </Typography>

          <Button variant="outlined" onClick={() => window.location.reload()}>
            App neu laden
          </Button>
        </Stack>
      </Container>
    </PageTransition>
  );
}
