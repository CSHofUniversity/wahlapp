// src/components/TerminEditorDialog.tsx

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { CustomDatePicker } from "./CustomDatePicker";
import dayjs, { Dayjs } from "dayjs";

import type { UserTermin } from "../services/userTermineLocal";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  initial?: UserTermin | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    beschreibung: string;
    datum_iso: string;
  }) => void;
}

export function TerminEditorDialog({ open, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [datum, setDatum] = useState<Dayjs | null>(null);

  // Fehlermeldungen (nur beim Speichern anzeigen)
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (initial && initial.title) {
      // Bearbeiten eines bestehenden Termins
      setTitle(initial.title);
      setBeschreibung(initial.beschreibung);
      setDatum(initial.datum_iso ? dayjs(initial.datum_iso) : null);
    } else {
      // Neuer Termin → vollständig zurücksetzen
      setTitle("");
      setBeschreibung("");
      setDatum(null);
    }

    setShowErrors(false);
  }, [initial, open]);

  function handleSave() {
    if (!title.trim() || !datum) {
      setShowErrors(true);
      return;
    }

    onSave({
      title: title.trim(),
      beschreibung,
      datum_iso: datum.toISOString(),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      closeAfterTransition
    >
      <DialogTitle>Eigener Termin</DialogTitle>

      <DialogContent
        sx={{
          pt: 2,
          pb: 1,
          px: 3,
          "& .MuiFormControl-root": {
            mt: 1.5,
          },
        }}
      >
        <Stack spacing={3}>
          {/* Titel */}
          <TextField
            label="Titel"
            value={title}
            required
            error={showErrors && !title.trim()}
            helperText={
              showErrors && !title.trim() ? "Titel ist ein Pflichtfeld." : " "
            }
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="standard"
          />

          {/* Beschreibung */}
          <TextField
            label="Beschreibung"
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            variant="standard"
          />

          {/* CustomDatePicker mit Fehlerhandling */}
          <CustomDatePicker
            label="Datum"
            value={datum}
            onChange={(newValue) => setDatum(newValue)}
            format="DD.MM.YYYY"
            required
            error={showErrors && !datum}
            helperText={
              showErrors && !datum ? "Datum ist ein Pflichtfeld." : " "
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="error" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
