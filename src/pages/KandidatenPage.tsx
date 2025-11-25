// src/pages/KandidatenPage.tsx

import { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";

import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PeopleIcon from "@mui/icons-material/People";

import { ladeKandidaten } from "../services/kandidaten";
import { ladeParteien } from "../services/parteien";

import type { Kandidat } from "../types/kandidat";
import type { Partei } from "../types/partei";

import { Loader } from "../components/Loader";
import { PageLayout } from "../components/PageLayout";
import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";
import { KandidatPortrait } from "../components/KandidatPortrait";
import { ImageLightbox } from "../components/ImageLightbox";

import {
  addFavorit,
  deleteFavorit,
  getFavoritEntry,
} from "../services/favoritenLocal";
import { toRawGitHub } from "../util/gitHubRaw";

import { useFavoritenContext } from "../context/FavoritenContext";
import { useSearchParams } from "react-router-dom";
import type { Favorit } from "../types/favorit";
import Divider from "@mui/material/Divider";

/* ------------------------------------------------------------------ */
/*  Hauptkomponente                                                   */
/* ------------------------------------------------------------------ */

export default function KandidatenPage() {
  const [loading, setLoading] = useState(true);
  const [kandidaten, setKandidaten] = useState<Kandidat[]>([]);
  const [parteien, setParteien] = useState<Partei[]>([]);

  const { favoriten, reloadFavoriten } = useFavoritenContext();
  const [searchParams] = useSearchParams();
  const initialParteiFromURL = searchParams.get("partei");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fehler pro Karte
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>(
    {}
  );

  // Lightbox (Portrait)
  const { imageOpen, imageSrc, imageBorderColor, openImage, closeImage } =
    useImageLightbox();

  // Filterstate
  const {
    search,
    selectedPartei,
    selectedWahlkreis,
    onlyFavorites,
    handleSearch,
    handleSelectPartei,
    handleSelectWahlkreis,
    handleToggleOnlyFavorites,
  } = useKandidatenFilter();

  // Favoritenhandling
  const { toggleFavorit } = useFavoritToggle({
    showErrorFor: (id: string, msg: string) =>
      showTemporaryError(id, msg, setCardErrors),
    reloadFavoriten,
  });

  // Kandidaten + Parteien laden
  useEffect(() => {
    Promise.all([ladeKandidaten(), ladeParteien()])
      .then(([kList, pList]) => {
        const merged = mergeParteien(kList, pList);
        setKandidaten(merged);
        setParteien(pList);

        // Partei aus Query param vorselektieren
        if (initialParteiFromURL) {
          const found = pList.find((p) => p.id === initialParteiFromURL);
          if (found) handleSelectPartei(found);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Wahlkreise (Memo)
  const wahlkreise = useMemo(() => {
    const w = Array.from(new Set(kandidaten.map((k) => k.wahlkreis)));
    return w.sort((a, b) => a.localeCompare(b));
  }, [kandidaten]);

  // Gefilterte Liste (Memo)
  const filtered = useMemo(() => {
    return filterKandidaten({
      kandidaten,
      search,
      selectedPartei,
      selectedWahlkreis,
      onlyFavorites,
      favoriten,
    });
  }, [
    kandidaten,
    search,
    selectedPartei,
    selectedWahlkreis,
    onlyFavorites,
    favoriten,
  ]);

  if (loading) return <Loader />;

  return (
    <PageLayout
      icon={<PeopleIcon />}
      title="Kandidaten"
      subtitle="Eine Übersicht der Kandidaten zur Kommunalwahl."
    >
      {/* Filter */}
      <FilterSection
        parteien={parteien}
        wahlkreise={wahlkreise}
        search={search}
        selectedPartei={selectedPartei}
        selectedWahlkreis={selectedWahlkreis}
        onlyFavorites={onlyFavorites}
        onSearch={handleSearch}
        onSelectPartei={handleSelectPartei}
        onSelectWahlkreis={handleSelectWahlkreis}
        onToggleOnlyFavorites={handleToggleOnlyFavorites}
      />

      {/* Ergebnisliste */}
      {filtered.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Keine Kandidaten gefunden.
        </Typography>
      )}

      {filtered.map((k: Kandidat) => {
        const expanded = expandedId === k.id;

        return (
          <AppCardWithSideInfo
            key={k.id}
            parteiFarbe={k.parteiFarbe ?? "#666"}
            parteiKurz={k.parteiKurz ?? "???"}
          >
            <KandidatCard
              kandidat={k}
              expanded={expanded}
              expandedId={expandedId}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === k.id ? null : k.id))
              }
              onToggleFavorit={() => toggleFavorit(k)}
              isFavorit={favoriten.some((f) => f.id === k.id)}
              imageActions={{
                openImage: () =>
                  openImage(toRawGitHub(k.foto_url), k.parteiFarbe ?? "#666"),
              }}
              errorMessage={cardErrors[k.id]}
            />
          </AppCardWithSideInfo>
        );
      })}

      <ImageLightbox
        open={imageOpen}
        onClose={closeImage}
        src={imageSrc}
        borderColor={imageBorderColor}
      />
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Präsentationskomponente: Filter                                   */
/* ------------------------------------------------------------------ */

function FilterSection({
  parteien,
  wahlkreise,
  search,
  selectedPartei,
  selectedWahlkreis,
  onlyFavorites,
  onSearch,
  onSelectPartei,
  onSelectWahlkreis,
  onToggleOnlyFavorites,
}: any) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <TextField
        label="Suche nach Name oder Wahlkreis"
        fullWidth
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <Autocomplete
        options={parteien}
        getOptionLabel={(p) => p.name}
        value={selectedPartei}
        onChange={(_, v) => onSelectPartei(v)}
        renderInput={(params) => (
          <TextField {...params} label="Partei wählen (optional)" />
        )}
        fullWidth
      />

      <Autocomplete
        options={wahlkreise}
        value={selectedWahlkreis}
        onChange={(_, v) => onSelectWahlkreis(v)}
        renderInput={(params) => (
          <TextField {...params} label="Wahlkreis wählen (optional)" />
        )}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={onlyFavorites}
            onChange={(e) => onToggleOnlyFavorites(e.target.checked)}
          />
        }
        label="Nur Favoriten anzeigen"
      />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Präsentationskomponente: Einzelkarte                              */
/* ------------------------------------------------------------------ */

function KandidatCard({
  kandidat: k,
  expanded,
  isFavorit,
  onToggleFavorit,
  onToggleExpand,
  imageActions,
  errorMessage,
}: any) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <KandidatPortrait
          name={k.name}
          fotoUrl={k.foto_url}
          borderColor={k.parteiFarbe}
          size={72}
          onClick={imageActions.openImage}
        />

        <Stack flexGrow={1} sx={{ cursor: "pointer" }} onClick={onToggleExpand}>
          <Typography variant="h5">{k.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Wahlkreis: {k.wahlkreis}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={onToggleFavorit}>
            {isFavorit ? <StarIcon color="warning" /> : <StarBorderIcon />}
          </IconButton>

          <IconButton onClick={onToggleExpand}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Ausklapper */}
      <Collapse in={expanded}>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Biografie
          </Typography>
          <Typography variant="body1">{k.biografie}</Typography>

          <Divider />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Agenda
          </Typography>
          <Typography variant="body1">{k.agenda}</Typography>
        </Stack>
      </Collapse>

      {/* Fehlerhinweis */}
      <Fade in={!!errorMessage}>
        <Collapse in={!!errorMessage}>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        </Collapse>
      </Fade>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* HOOKS & UTILS                                                      */
/* ------------------------------------------------------------------ */

function useKandidatenFilter() {
  const [search, setSearch] = useState("");
  const [selectedPartei, setSelectedPartei] = useState<Partei | null>(null);
  const [selectedWahlkreis, setSelectedWahlkreis] = useState<string | null>(
    null
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  return {
    search,
    selectedPartei,
    selectedWahlkreis,
    onlyFavorites,
    handleSearch: setSearch,
    handleSelectPartei: setSelectedPartei,
    handleSelectWahlkreis: setSelectedWahlkreis,
    handleToggleOnlyFavorites: setOnlyFavorites,
  };
}

function mergeParteien(kList: Kandidat[], pList: Partei[]) {
  return kList.map((k) => {
    const partei = pList.find((p) => p.id === k.parteiId);
    return {
      ...k,
      parteiFarbe: partei?.farbe ?? "#666",
      parteiKurz: partei?.kurz ?? "?",
    };
  });
}

function filterKandidaten({
  kandidaten,
  search,
  selectedPartei,
  selectedWahlkreis,
  onlyFavorites,
  favoriten,
}: any) {
  return kandidaten.filter((k: Kandidat) => {
    const matchSearch =
      !search ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.wahlkreis.toLowerCase().includes(search.toLowerCase());

    const matchPartei = !selectedPartei || selectedPartei.id === k.parteiId;
    const matchWahlkreis =
      !selectedWahlkreis || selectedWahlkreis === k.wahlkreis;
    const matchFav =
      !onlyFavorites || favoriten.some((f: Favorit) => f.id === k.id);

    return matchSearch && matchPartei && matchWahlkreis && matchFav;
  });
}
interface FavoritToggleOptions {
  showErrorFor: (id: string, msg: string) => void;
  reloadFavoriten: () => void;
}

function useFavoritToggle({
  showErrorFor,
  reloadFavoriten,
}: FavoritToggleOptions) {
  return {
    async toggleFavorit(k: Kandidat) {
      const existing = getFavoritEntry(k.id);

      if (existing) {
        if (existing.notiz.trim() !== "") {
          showErrorFor(
            k.id,
            "Favorit kann nicht entfernt werden – Es existiert eine Notiz."
          );
          return;
        }
        await deleteFavorit(k.id);
      } else {
        await addFavorit(k);
      }

      reloadFavoriten();
    },
  };
}

function useImageLightbox() {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setSrc] = useState("");
  const [imageBorderColor, setBorder] = useState("#666");

  return {
    imageOpen,
    imageSrc,
    imageBorderColor,
    openImage: (src: string, border: string) => {
      setSrc(src);
      setBorder(border);
      setImageOpen(true);
    },
    closeImage: () => setImageOpen(false),
  };
}

function showTemporaryError(
  id: string,
  message: string,
  setCardErrors: any,
  timeoutMs = 3000
) {
  setCardErrors((prev: any) => ({ ...prev, [id]: message }));
  setTimeout(() => {
    setCardErrors((prev: any) => ({ ...prev, [id]: null }));
  }, timeoutMs);
}
