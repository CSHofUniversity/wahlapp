// src/pages/FavoritenPage.tsx

import { useState } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";

import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";
import { KandidatPortrait } from "../components/KandidatPortrait";
import { ImageLightbox } from "../components/ImageLightbox";
import { Loader } from "../components/Loader";
import { PageLayout } from "../components/PageLayout";

import { useFavoriten, type FavoritMitDetails } from "../hooks/useFavoriten";
import { useFavoritenContext } from "../context/FavoritenContext";

import { toRawGitHub } from "../util/gitHubRaw";

/* ------------------------------------------------------------------ */
/* Hauptkomponente                                                    */
/* ------------------------------------------------------------------ */

export default function FavoritenPage() {
  const { favoriten, loading, remove, updateNotiz } = useFavoriten();
  const { reloadFavoriten } = useFavoritenContext();

  // Filter-Logik
  const { selectedPartei, parteienListe, clustered, setSelectedPartei } =
    useFavoritenFilter(favoriten);

  // UI-Hooks
  const { imageOpen, imageSrc, imageBorderColor, openImage, closeImage } =
    useImageLightboxGeneral();

  const {
    dialogOpen,
    text,
    openDialog,
    closeDialog,
    handleTextChange,
    saveNotiz,
  } = useFavoritenNotizDialog(updateNotiz, reloadFavoriten);

  const { cardErrors, showErrorFor } = useFavoritenErrorToast();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (loading) return <Loader />;

  return (
    <PageLayout
      icon={<StarIcon />}
      title="Favoriten"
      subtitle="Ihre Favoriten für die anstehende Kommunalwahl."
    >
      {favoriten.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Bisher noch keine Favoriten gespeichert.
        </Alert>
      )}

      {/* Filter */}
      <TextField
        select
        label="Favoriten filtern nach Partei"
        fullWidth
        value={selectedPartei}
        onChange={(e) => setSelectedPartei(e.target.value)}
        sx={{ mb: 3, mt: 1, maxWidth: 320 }}
      >
        <MenuItem value="alle">Alle Parteien</MenuItem>
        {parteienListe.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>

      {/* Gruppierte Favoriten */}
      {Object.entries(clustered).map(([partei, list]) => (
        <Box key={partei} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              color: "primary.main",
              fontWeight: 700,
              pl: 1,
              borderLeft: `6px solid ${list[0].parteiFarbe ?? "#666"}`,
            }}
          >
            {partei}
          </Typography>

          {list.map((fav) => {
            const expanded = expandedId === fav.id;

            return (
              <AppCardWithSideInfo
                key={fav.id}
                parteiFarbe={fav.parteiFarbe ?? "#666"}
                parteiKurz={fav.parteiKurz ?? "???"}
              >
                <FavoritCard
                  fav={fav}
                  expanded={expanded}
                  onToggleExpand={() => toggleExpand(fav.id)}
                  onOpenDialog={() => openDialog(fav)}
                  onDelete={() => {
                    if (fav.notiz?.trim()) {
                      showErrorFor(
                        fav.id,
                        "Favorit kann nicht gelöscht werden – es existiert eine Notiz."
                      );
                      return;
                    }
                    remove(fav.id);
                    reloadFavoriten();
                  }}
                  onOpenImage={() =>
                    openImage(
                      toRawGitHub(fav.foto_url),
                      fav.parteiFarbe ?? "#666"
                    )
                  }
                  errorMessage={cardErrors[fav.id]}
                />
              </AppCardWithSideInfo>
            );
          })}
        </Box>
      ))}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Notiz bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={4}
            fullWidth
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Notiz eingeben…"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={closeDialog}>
            Abbrechen
          </Button>
          <Button variant="contained" onClick={saveNotiz}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

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
/* Präsentationskomponente: FavoritCard                               */
/* ------------------------------------------------------------------ */

function FavoritCard({
  fav,
  expanded,
  onToggleExpand,
  onOpenDialog,
  onDelete,
  onOpenImage,
  errorMessage,
}: {
  fav: FavoritMitDetails;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenDialog: () => void;
  onDelete: () => void;
  onOpenImage: () => void;
  errorMessage: string | null;
}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <KandidatPortrait
          name={fav.name}
          fotoUrl={fav.foto_url}
          borderColor={fav.parteiFarbe ?? "#666"}
          size={72}
          onClick={onOpenImage}
        />

        <Stack
          flexGrow={1}
          spacing={0.5}
          sx={{ cursor: "pointer" }}
          onClick={onToggleExpand}
        >
          <Typography variant="h5">{fav.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {fav.parteiName}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={onOpenDialog}>
            <EditIcon />
          </IconButton>

          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>

          <IconButton size="small" onClick={onToggleExpand}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded}>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {fav.notiz?.trim() ? fav.notiz : "Keine Notiz hinterlegt."}
          </Typography>

          <Button variant="contained" size="small" onClick={onOpenDialog}>
            Notiz bearbeiten
          </Button>
        </Stack>
      </Collapse>

      {errorMessage && (
        <Fade in>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        </Fade>
      )}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Hooks & Utilities                                                  */
/* ------------------------------------------------------------------ */

function useFavoritenFilter(favoriten: FavoritMitDetails[]) {
  const [selectedPartei, setSelectedPartei] = useState("alle");

  const parteienListe = Array.from(
    new Set(favoriten.map((f) => f.parteiName))
  ).sort();

  const filteredFavoriten =
    selectedPartei === "alle"
      ? favoriten
      : favoriten.filter((f) => f.parteiName === selectedPartei);

  const clustered = filteredFavoriten.reduce((groups, fav) => {
    const key = fav.parteiName ?? "Unbekannt";
    if (!groups[key]) groups[key] = [];
    groups[key].push(fav);
    return groups;
  }, {} as Record<string, FavoritMitDetails[]>);

  return {
    selectedPartei,
    setSelectedPartei,
    parteienListe,
    filteredFavoriten,
    clustered,
  };
}

function useImageLightboxGeneral() {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageBorderColor, setImageBorderColor] = useState("#666");

  return {
    imageOpen,
    imageSrc,
    imageBorderColor,
    openImage: (src: string, border: string) => {
      setImageSrc(src);
      setImageBorderColor(border);
      setImageOpen(true);
    },
    closeImage: () => setImageOpen(false),
  };
}

function useFavoritenNotizDialog(
  updateNotiz: (id: string, text: string) => Promise<void>,
  reloadFavoriten: () => void
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFavorit, setEditingFavorit] =
    useState<FavoritMitDetails | null>(null);
  const [text, setText] = useState("");

  function openDialog(fav: FavoritMitDetails) {
    setEditingFavorit(fav);
    setText(fav.notiz ?? "");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingFavorit(null);
    setText("");
  }

  async function saveNotiz() {
    if (!editingFavorit) return;

    await updateNotiz(editingFavorit.id, text);
    reloadFavoriten();
    closeDialog();
  }

  return {
    dialogOpen,
    editingFavorit,
    text,
    openDialog,
    closeDialog,
    handleTextChange: setText,
    saveNotiz,
  };
}

function useFavoritenErrorToast() {
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>(
    {}
  );

  function showErrorFor(id: string, msg: string) {
    setCardErrors((prev) => ({ ...prev, [id]: msg }));
    setTimeout(() => setCardErrors((prev) => ({ ...prev, [id]: null })), 3000);
  }

  return { cardErrors, showErrorFor };
}
