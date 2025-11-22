// src/pages/KandidatenPage.tsx

import { useEffect, useState, useMemo } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Collapse from "@mui/material/Collapse";

import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { ladeKandidaten } from "../services/kandidaten";
import { ladeParteien } from "../services/parteien";

import type { Kandidat } from "../types/kandidat";
import type { Partei } from "../types/partei";

import { Loader } from "../components/Loader";
import { PageTransition } from "../components/PageTransition";
import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";

import {
  addFavorit,
  deleteFavorit,
  getFavoritEntry,
} from "../services/favoritenLocal";

import { useFavoritenContext } from "../context/FavoritenContext";
import { toRawGitHub } from "../util/gitHubRaw";
import { useSearchParams } from "react-router-dom";
import { ImageLightbox } from "../components/ImageLightbox";
import { KandidatPortrait } from "../components/KandidatPortrait";
import { PageHeader } from "../components/PageHeader";

import PeopleIcon from "@mui/icons-material/People";

export default function KandidatenPage() {
  const [kandidaten, setKandidaten] = useState<Kandidat[]>([]);
  const [parteien, setParteien] = useState<Partei[]>([]);
  const [loading, setLoading] = useState(true);

  const { favoriten, reloadFavoriten } = useFavoritenContext();

  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const initialParteiFromURL = searchParams.get("partei");
  const [selectedPartei, setSelectedPartei] = useState<Partei | null>(null);
  const [selectedWahlkreis, setSelectedWahlkreis] = useState<string | null>(
    null
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Expand-Status pro Kandidat
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fehler pro Karte
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>(
    {}
  );

  // Lightbox
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageBorderColor, setImageBorderColor] = useState("#666");

  function showErrorFor(id: string, msg: string) {
    setCardErrors((prev) => ({ ...prev, [id]: msg }));
    setTimeout(() => {
      setCardErrors((prev) => ({ ...prev, [id]: null }));
    }, 3000);
  }

  // Kandidaten & Parteien laden + Parteifarbe/-kürzel mergen
  useEffect(() => {
    Promise.all([ladeKandidaten(), ladeParteien()])
      .then(([kList, pList]) => {
        const merged = kList.map((k) => {
          const partei = pList.find((p) => p.id === k.parteiId);
          return {
            ...k,
            parteiFarbe: partei?.farbe ?? "#666",
            parteiKurz: partei?.kurz ?? "?",
          };
        });

        setKandidaten(merged);
        setParteien(pList);

        // Partei aus Query-Param vorselektieren
        if (initialParteiFromURL) {
          const found = pList.find((p) => p.id === initialParteiFromURL);
          if (found) setSelectedPartei(found);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const wahlkreise = useMemo(() => {
    const w = Array.from(new Set(kandidaten.map((k) => k.wahlkreis)));
    return w.sort((a, b) => a.localeCompare(b));
  }, [kandidaten]);

  const filteredKandidaten = useMemo(() => {
    return kandidaten.filter((k) => {
      const matchSearch =
        search.trim() === "" ||
        k.name.toLowerCase().includes(search.toLowerCase()) ||
        k.wahlkreis.toLowerCase().includes(search.toLowerCase());

      const matchPartei = !selectedPartei || k.parteiId === selectedPartei.id;

      const matchWahlkreis =
        !selectedWahlkreis || k.wahlkreis === selectedWahlkreis;

      const matchFavorite =
        !onlyFavorites || favoriten.some((f) => f.id === k.id);

      return matchSearch && matchPartei && matchWahlkreis && matchFavorite;
    });
  }, [
    kandidaten,
    search,
    selectedPartei,
    selectedWahlkreis,
    onlyFavorites,
    favoriten,
  ]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) return <Loader />;

  return (
    <PageTransition>
      <PageHeader
        icon={<PeopleIcon />}
        title="Kandidaten"
        subtitle="Eine Übersicht der Kandidaten zur Kommunalwahl."
      />
      <Container sx={{ mt: 2, mb: 10 }}>
        {/* Filter */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Suche nach Name oder Wahlkreis"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Autocomplete
            options={parteien}
            getOptionLabel={(p) => p.name}
            value={selectedPartei}
            onChange={(_, v) => setSelectedPartei(v)}
            renderInput={(params) => (
              <TextField {...params} label="Partei wählen (optional)" />
            )}
            fullWidth
          />

          <Autocomplete
            options={wahlkreise}
            value={selectedWahlkreis}
            onChange={(_, v) => setSelectedWahlkreis(v)}
            renderInput={(params) => (
              <TextField {...params} label="Wahlkreis wählen (optional)" />
            )}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
              />
            }
            label="Nur Favoriten anzeigen"
          />
        </Stack>

        {filteredKandidaten.map((k) => {
          const expanded = expandedId === k.id;

          return (
            <AppCardWithSideInfo
              key={k.id}
              parteiFarbe={k.parteiFarbe ?? "#666"}
              parteiKurz={k.parteiKurz ?? "?"}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {/* 🖼️ Portrait */}
                  <KandidatPortrait
                    name={k.name}
                    fotoUrl={k.foto_url}
                    borderColor={k.parteiFarbe ?? "#666"}
                    size={72}
                    onClick={() => {
                      setImageSrc(toRawGitHub(k.foto_url));
                      setImageOpen(true);
                      setImageBorderColor(k.parteiFarbe ?? "#666");
                    }}
                  />

                  {/* Name + Wahlkreis */}
                  <Stack
                    flexGrow={1}
                    spacing={0.5}
                    sx={{ cursor: "pointer" }}
                    onClick={() => toggleExpand(k.id)}
                  >
                    <Typography variant="h5">{k.name}</Typography>
                    <Typography variant="h6" color="text.secondary">
                      Wahlkreis: {k.wahlkreis}
                    </Typography>
                  </Stack>

                  {/* Favorit + Expand-Icon */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* Favorit Button */}
                    <IconButton
                      onClick={async () => {
                        const existing = getFavoritEntry(k.id);

                        if (existing) {
                          if (existing.notiz.trim() !== "") {
                            showErrorFor(
                              k.id,
                              "Favorit kann nicht entfernt werden – Sie haben eine Notiz für den Kandidaten angelegt."
                            );
                            return;
                          }

                          await deleteFavorit(k.id);
                          reloadFavoriten();
                          return;
                        }

                        await addFavorit(k);
                        reloadFavoriten();
                      }}
                    >
                      {favoriten.some((f) => f.id === k.id) ? (
                        <StarIcon color="warning" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>

                    {/* Expand-Icon */}
                    <IconButton onClick={() => toggleExpand(k.id)}>
                      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Ausklappbarer Bereich: Biografie + Agenda + Details */}
                <Collapse in={expanded}>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="h6" color="text.secondary">
                      Biografie:
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {k.biografie}
                    </Typography>

                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Agenda:
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {k.agenda}
                    </Typography>
                  </Stack>
                </Collapse>

                {/* Fehler Toast nur für diese Card */}
                <Fade in={!!cardErrors[k.id]}>
                  <Collapse in={!!cardErrors[k.id]}>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {cardErrors[k.id]}
                    </Alert>
                  </Collapse>
                </Fade>
              </Stack>
            </AppCardWithSideInfo>
          );
        })}

        {filteredKandidaten.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Keine Kandidaten gefunden.
          </Typography>
        )}
        <ImageLightbox
          open={imageOpen}
          onClose={() => setImageOpen(false)}
          src={imageSrc}
          borderColor={imageBorderColor}
        />
      </Container>
    </PageTransition>
  );
}
