// src/pages/WahllokalePage.tsx

// src/pages/WahllokalePage.tsx

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { sucheWahllokale } from "../services/wahllokale";
import { geocodeAdresse } from "../services/geocode";
import type { Wahllokal } from "../types/wahllokal";
import { Loader } from "../components/Loader";
import {
  WahllokalMap,
  type WahllokalMapHandle,
} from "../components/WahllokalMap";
import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";

import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import Box from "@mui/material/Box";

// Entfernung berechnen (Haversine)
function distKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Erdradius
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type SortMode = "asc" | "desc";

export default function WahllokalePage() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Wahllokal[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [adresse, setAdresse] = useState("");

  const [sortMode, setSortMode] = useState<SortMode>("asc");

  const mapRef = useRef<WahllokalMapHandle>(null);

  function handleMapFocus(wl: Wahllokal) {
    if (wl.geo && mapRef.current) {
      mapRef.current.focusOn(wl.geo.lat, wl.geo.lng);
    }
  }

  function sortiereWahllokale(
    mode: SortMode,
    center: [number, number] | null,
    data: Wahllokal[]
  ): Wahllokal[] {
    if (!center) return data;

    const withDist = data.map((wl) => {
      const entfernung = wl.geo
        ? distKm(center[0], center[1], wl.geo.lat, wl.geo.lng)
        : Number.POSITIVE_INFINITY;

      // wir hängen entfernung als Zusatzproperty an (für Anzeige)
      return { ...wl, entfernung } as Wahllokal & { entfernung: number };
    });

    withDist.sort((a, b) => {
      const da = (a as any).entfernung ?? Number.POSITIVE_INFINITY;
      const db = (b as any).entfernung ?? Number.POSITIVE_INFINITY;
      return mode === "asc" ? da - db : db - da;
    });

    return withDist;
  }

  // BEIM SEITENSTART: GPS + ALLE WAHLOKALE LADEN
  useEffect(() => {
    async function init() {
      setLoading(true);
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const centerPos: [number, number] = [lat, lng];
          setCenter(centerPos);

          try {
            // Alle Wahllokale holen (ohne Filter)
            const alleWl = await sucheWahllokale({});
            // Entfernung hinzufügen + sortieren (Standard: nächstes zuerst)
            const sortiert = sortiereWahllokale("asc", centerPos, alleWl);
            setResult(sortiert);
          } catch (e) {
            console.error(e);
            setGeoError("Fehler beim Laden der Wahllokale.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setGeoError("GPS konnte nicht aktiviert werden.");
          setLoading(false);
        }
      );
    }
    init();
  }, []);

  async function handleAdresseSearch() {
    if (!adresse.trim()) return;

    setLoading(true);
    setGeoError(null);

    const pos = await geocodeAdresse(adresse);
    if (!pos) {
      setGeoError("Adresse konnte nicht lokalisiert werden.");
      setLoading(false);
      return;
    }

    const newCenter: [number, number] = [pos.lat, pos.lng];
    setCenter(newCenter);

    try {
      const data = await sucheWahllokale({});
      const sortiert = sortiereWahllokale(sortMode, newCenter, data);
      setResult(sortiert);
      // Adresse nach erfolgreicher Suche leeren, um wieder klaren Zustand zu haben
      setAdresse("");
    } catch {
      setGeoError("Fehler beim Abrufen der Wahllokale.");
    } finally {
      setLoading(false);
    }
  }
  async function resetToGps() {
    setAdresse("");
    setLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const gpsCenter: [number, number] = [lat, lng];
        setCenter(gpsCenter);

        try {
          const alle = await sucheWahllokale({});
          const sortiert = sortiereWahllokale("asc", gpsCenter, alle);
          setResult(sortiert);
        } catch {
          setGeoError("Fehler beim Abrufen der Wahllokale.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setGeoError("GPS konnte nicht aktiviert werden.");
        setLoading(false);
      }
    );
  }

  if (loading) return <Loader />;

  return (
    <PageTransition>
      <PageHeader
        icon={<LocationOnIcon />}
        title="Wahllokale"
        subtitle="Ihre Wahllokale sortiert nach Entfernung"
      />

      <Container sx={{ mt: 2, mb: 10 }}>
        {/* Suchbereich */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            bgcolor: "background.paper",
            mb: 3,
          }}
        >
          {/* Eingabeleiste */}
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon color="action" />
            <TextField
              label="Adresse eingeben"
              variant="standard"
              fullWidth
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />

            {/* Buttons */}
            <Button
              variant="contained"
              onClick={handleAdresseSearch}
              startIcon={<SearchIcon />}
              sx={{ py: 1.2 }}
            >
              Suchen
            </Button>

            <Button
              variant="contained"
              color="warning"
              onClick={resetToGps}
              startIcon={<UndoIcon />}
              sx={{ py: 1.2, whiteSpace: "nowrap" }}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        {/* Fehleranzeige */}
        {geoError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {geoError}
          </Alert>
        )}

        {/* Karte mit Info-Balken*/}
        {center && result.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <WahllokalMap
              ref={mapRef}
              center={center}
              wahllokale={result}
              darkMode={darkMode}
              onSelectWahllokal={() => {}}
            />
          </div>
        )}
        <Box
          sx={{
            mb: 1.5,
            px: 2,
            py: 1,
            borderRadius: 1,
            fontSize: "0.85rem",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.04)",
            color: theme.palette.text.secondary,
            backdropFilter: "blur(4px)",
          }}
        >
          💡 Tippen Sie auf ein Wahllokal in der Liste, um es auf der Karte zu
          sehen.
        </Box>

        {/* Liste */}
        {result.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Wahllokale in Ihrer Nähe
            </Typography>

            {/* Sortierung nur nach Entfernung */}
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
              <ToggleButtonGroup
                value={sortMode}
                exclusive
                onChange={(e, val) => {
                  if (!val) return;
                  setSortMode(val);

                  if (!center) return;

                  const newSorted = sortiereWahllokale(val, center, result);
                  setResult(newSorted);
                }}
                size="small"
              >
                <ToggleButton value="asc">Nächstes zuerst</ToggleButton>
                <ToggleButton value="desc">Weitestes zuerst</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </>
        )}

        {result.map((wl) => {
          const adr = wl.adresse;
          const distVal = (wl as any).entfernung as number | undefined;
          const dist =
            typeof distVal === "number" && isFinite(distVal)
              ? distVal.toFixed(1) + " km"
              : "";

          return (
            <AppCardWithSideInfo
              key={wl.id}
              parteiFarbe={"#1976d2"}
              parteiKurz={adr.ort}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {wl.name}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {adr.strasse}, {adr.plz} {adr.ort}
              </Typography>

              {dist && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Entfernung: {dist}
                </Typography>
              )}

              {wl.barrierefrei && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Barrierefrei zugänglich
                </Alert>
              )}

              {wl.geo && (
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    handleMapFocus(wl);
                  }}
                >
                  Auf Karte anzeigen
                </Button>
              )}
            </AppCardWithSideInfo>
          );
        })}
      </Container>
    </PageTransition>
  );
}
