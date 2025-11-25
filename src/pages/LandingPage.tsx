// src/pages/LandingPage.tsx

import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Policy";
import StarIcon from "@mui/icons-material/Star";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { PageLayout } from "../components/PageLayout";
import type { JSX } from "react";
import Box from "@mui/material/Box";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageLayout
      icon={<ThumbUpIcon />}
      title="Wahl-Info"
      subtitle="Ihre kompakte Information für die Kommunalwahl."
    >
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Diese App unterstützt Sie bei der Suche nach Wahlinformationen,
        Briefwahl-Fristen und dem zuständigen Wahllokal.
      </Typography>

      <Stack spacing={2}>
        <LandingCard
          icon={<PolicyIcon fontSize="large" />}
          title="Parteien"
          description="Parteien, Farben, Programme – schnell im Überblick."
          bgcolor={"secondary.main"}
          onClick={() => navigate("/parteien")}
        />

        <LandingCard
          icon={<PeopleIcon fontSize="large" />}
          title="Kandidaten"
          description="Kandidaten, Wahlkreise und Biografien."
          bgcolor={"primary.main"}
          onClick={() => navigate("/kandidaten")}
        />

        <LandingCard
          icon={<StarIcon fontSize="large" />}
          title="Favoriten"
          description="Speichern Sie Kandidaten als Favoriten – offline verfügbar."
          bgcolor={"warning.main"}
          onClick={() => navigate("/favoriten")}
        />

        <LandingCard
          icon={<LocationOnIcon fontSize="large" />}
          title="Wahllokale"
          description="Ermitteln Sie Ihr zuständiges Wahllokal per Adresse oder GPS."
          bgcolor={"info.main"}
          onClick={() => navigate("/wahllokale")}
        />

        <LandingCard
          icon={<EventIcon fontSize="large" />}
          title="Wahltermine"
          description="Alle wichtigen Fristen und Wahltermine, inklusive Erinnerungen."
          bgcolor={"success.main"}
          onClick={() => navigate("/wahltermine")}
        />
      </Stack>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Präsentationskomponente: LandingCard                               */
/* ------------------------------------------------------------------ */

interface LandingCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  bgcolor: string;
  onClick: () => void;
}

function LandingCard({
  icon,
  title,
  description,
  bgcolor,
  onClick,
}: LandingCardProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        borderRadius: 2,
        ":hover": { backgroundColor: "action.hover" },
      }}
      onClick={onClick}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: bgcolor,
            color: "warning.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
