// src/pages/FavoritenPage.tsx

import { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import { useFavoriten, type FavoritMitDetails } from "../hooks/useFavoriten";
import { PageTransition } from "../components/PageTransition";
import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";
import { KandidatPortrait } from "../components/KandidatPortrait";
import { useFavoritenContext } from "../context/FavoritenContext";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { PageHeader } from "../components/PageHeader";
import StarIcon from "@mui/icons-material/Star";
import { Loader } from "../components/Loader";
import { toRawGitHub } from "../util/gitHubRaw";
import { ImageLightbox } from "../components/ImageLightbox";
import Box from "@mui/material/Box";

export default function FavoritenPage() {
  const { favoriten, loading, remove, updateNotiz } = useFavoriten();
  const { reloadFavoriten } = useFavoritenContext();

  // Filter und Cluster
  const [selectedPartei, setSelectedPartei] = useState<string>("alle");
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

  // --- UI States ---
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string | null>>(
    {}
  );

  // Dialog für Notizen
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFavorit, setEditingFavorit] =
    useState<FavoritMitDetails | null>(null);
  const [text, setText] = useState("");

  // --- Helper: Expand ---
  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // --- Helper: Fehler je Karte ---
  function showErrorFor(id: string, msg: string) {
    setCardErrors((prev) => ({ ...prev, [id]: msg }));
    setTimeout(() => {
      setCardErrors((prev) => ({ ...prev, [id]: null }));
    }, 3000);
  }

  // --- Notiz-Dialog ---
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

  // Lightbox
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageBorderColor, setImageBorderColor] = useState("#666");

  if (loading) return <Loader />;

  return (
    <PageTransition>
      <PageHeader
        icon={<StarIcon />}
        title="Favoriten"
        subtitle="Ihre Favoriten für die anstehende Kommunalwahl."
      />

      {favoriten.length === 0 && (
        <PageHeader
          icon={<StarIcon />}
          title="Favoriten"
          subtitle="Bisher noch keine Favoriten gespeichert."
        />
      )}
      <Container sx={{ mt: 2, mb: 10 }}>
        {/* FILTER */}
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

        {Object.entries(clustered).map(([partei, list]) => (
          <Box key={partei} sx={{ mb: 3 }}>
            {/* Abschnitts-Header */}
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

            {/* Karten dieser Partei */}
            {list.map((fav) => {
              const expanded = expandedId === fav.id;

              return (
                <AppCardWithSideInfo
                  key={fav.id}
                  parteiFarbe={fav.parteiFarbe ?? "#666"}
                  parteiKurz={fav.parteiKurz ?? "?"}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      {/* Portrait */}
                      <KandidatPortrait
                        name={fav.name}
                        fotoUrl={fav.foto_url}
                        borderColor={fav.parteiFarbe ?? "#666"}
                        size={72}
                        onClick={() => {
                          setImageSrc(toRawGitHub(fav.foto_url));
                          setImageOpen(true);
                          setImageBorderColor(fav.parteiFarbe ?? "#666");
                        }}
                      />

                      {/* Name + Partei */}
                      <Stack
                        flexGrow={1}
                        spacing={0.5}
                        sx={{ cursor: "pointer" }}
                        onClick={() => toggleExpand(fav.id)}
                      >
                        <Typography variant="h5">{fav.name}</Typography>
                        <Typography variant="h6" color="text.secondary">
                          {fav.parteiName}
                        </Typography>
                      </Stack>

                      {/* Edit + Expand-Icon */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {/* Edit Notiz */}
                        <IconButton
                          size="small"
                          onClick={() => openDialog(fav)}
                        >
                          <EditIcon />
                        </IconButton>

                        {/* Delete Favorit (nur ohne Notiz) */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (fav.notiz?.trim()) {
                              showErrorFor(
                                fav.id,
                                "Favorit kann nicht entfernt werden – es existiert eine Notiz."
                              );
                              return;
                            }
                            remove(fav.id);
                            reloadFavoriten();
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>

                        {/* Expand-Icon */}
                        <IconButton onClick={() => toggleExpand(fav.id)}>
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Ausklappbarer Bereich */}
                    <Collapse in={expanded}>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          {fav.notiz?.trim()
                            ? fav.notiz
                            : "Keine Notiz hinterlegt."}
                        </Typography>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openDialog(fav)}
                        >
                          Notiz bearbeiten
                        </Button>
                      </Stack>
                    </Collapse>

                    {/* Fehler Toast */}
                    {cardErrors[fav.id] && (
                      <Fade in>
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          {cardErrors[fav.id]}
                        </Alert>
                      </Fade>
                    )}
                  </Stack>
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
              onChange={(e) => setText(e.target.value)}
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
          onClose={() => setImageOpen(false)}
          src={imageSrc}
          borderColor={imageBorderColor}
        />
      </Container>
    </PageTransition>
  );
}
