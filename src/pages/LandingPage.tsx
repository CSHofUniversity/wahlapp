// src/pages/LandingPage.tsx

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Policy";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EventIcon from "@mui/icons-material/Event";

import { useNavigate } from "react-router-dom";

import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <PageHeader
        icon={<ThumbUpIcon />}
        title="Willkommen!"
        subtitle="Ihre kompakte Wahlinfo als Unterstützung für die anstehende Kommunalwahl."
      />

      <Container sx={{ mt: 2, mb: 12 }}>
        {/* Intro Text */}
        <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
          Diese App hilft Ihnen, alle wichtigen Informationen zu den
          Kommunalwahlen im Wahlkreis Hof schnell und übersichtlich zu finden.
          Sie können Kandidaten entdecken, Parteien vergleichen, Ihr Wahllokal
          finden und persönliche Favoriten speichern.
        </Typography>

        {/* Visueller Grid – Einstiegskarten */}
        <Stack spacing={3}>
          {/* Parteien */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              cursor: "pointer",
            }}
            onClick={() => navigate("/parteien")}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              <PolicyIcon fontSize="inherit" />
            </Box>

            <Box>
              <Typography variant="h6">Parteien vergleichen</Typography>
              <Typography variant="body2" color="text.secondary">
                Programme & Positionen auf einen Blick.
              </Typography>
            </Box>
          </Paper>

          {/* Kandidaten */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              cursor: "pointer",
            }}
            onClick={() => navigate("/kandidaten")}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              <PeopleIcon fontSize="inherit" />
            </Box>

            <Box>
              <Typography variant="h6">Kandidaten entdecken</Typography>
              <Typography variant="body2" color="text.secondary">
                Alle Kandidaten nach Wahlkreis und Partei.
              </Typography>
            </Box>
          </Paper>

          {/* Favoriten */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              cursor: "pointer",
            }}
            onClick={() => navigate("/favoriten")}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "warning.main",
                color: "warning.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              <StarIcon fontSize="inherit" />
            </Box>

            <Box>
              <Typography variant="h6">Ihre Favoriten</Typography>
              <Typography variant="body2" color="text.secondary">
                Gespeicherte Kandidaten & persönliche Notizen.
              </Typography>
            </Box>
          </Paper>

          {/* Wahllokale */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              cursor: "pointer",
            }}
            onClick={() => navigate("/wahllokale")}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "info.main",
                color: "info.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              <LocationOnIcon fontSize="inherit" />
            </Box>

            <Box>
              <Typography variant="h6">Wahllokal finden</Typography>
              <Typography variant="body2" color="text.secondary">
                Ihr Wahllokal auf der Karte.
              </Typography>
            </Box>
          </Paper>

          {/* Termine */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              cursor: "pointer",
            }}
            onClick={() => navigate("/wahltermine")}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "success.main",
                color: "success.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              <EventIcon fontSize="inherit" />
            </Box>

            <Box>
              <Typography variant="h6">Wahltermine & Erinnerungen</Typography>
              <Typography variant="body2" color="text.secondary">
                Termine speichern & Push-Benachrichtigungen erhalten.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </PageTransition>
  );
}
