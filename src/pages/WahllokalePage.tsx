// src/pages/WahllokalePage.tsx

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";

import { PageLayout } from "../components/PageLayout";
import { Loader } from "../components/Loader";

import { WahllokalList } from "../components/WahllokalList";
import { useWahllokaleController } from "../hooks/useWahllokaleController";
import { WahllokalMap } from "../components/WahllokalMap";

// -------------------------------------------------------------
// Hauptkomponente
// -------------------------------------------------------------

export default function WahllokalePage() {
  const {
    loading,
    adresse,
    setAdresse,
    geoError,
    center,
    result,
    sortMode,
    mapRef,
    darkMode,
    handleAdresseSearch,
    resetToGps,
    handleSortChange,
    handleMapFocus,
  } = useWahllokaleController();

  if (loading) return <Loader />;

  return (
    <PageLayout
      icon={<LocationOnIcon />}
      title="Wahllokale"
      subtitle="Finden Sie Ihr Wahllokal und den schnellsten Weg dorthin."
    >
      <WahllokalSearchBar
        adresse={adresse}
        onAdresseChange={(v) => setAdresse(v)}
        onSearch={handleAdresseSearch}
        onReset={resetToGps}
      />

      {geoError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {geoError}
        </Alert>
      )}

      {center && result.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <WahllokalMap
            ref={mapRef}
            center={center}
            wahllokale={result}
            onSelectWahllokal={handleMapFocus}
            darkMode={darkMode}
          />
        </Box>
      )}

      <Box
        sx={{
          mb: 1.5,
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: "0.85rem",
          backgroundColor: "action.hover",
          color: "text.secondary",
          backdropFilter: "blur(4px)",
        }}
      >
        💡 Tippen Sie auf ein Wahllokal in der Liste, um es auf der Karte zu
        sehen.
      </Box>

      {result.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Wahllokale in Ihrer Nähe
          </Typography>

          <WahllokalSortControls
            sortMode={sortMode}
            onChange={handleSortChange}
          />
        </>
      )}

      <WahllokalList wahllokale={result} onMapFocus={handleMapFocus} />
    </PageLayout>
  );
}

// -------------------------------------------------------------
// Präsentationskomponenten
// -------------------------------------------------------------

function WahllokalSearchBar({
  adresse,
  onAdresseChange,
  onSearch,
  onReset,
}: {
  adresse: string;
  onAdresseChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: "background.paper",
        mb: 3,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <LocationOnIcon color="action" />

        <TextField
          label="Adresse eingeben"
          variant="standard"
          fullWidth
          value={adresse}
          onChange={(e) => onAdresseChange(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={onSearch}
          startIcon={<SearchIcon />}
          sx={{ py: 1.2 }}
        >
          Suchen
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={onReset}
          startIcon={<UndoIcon />}
          sx={{ py: 1.2 }}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
}

function WahllokalSortControls({
  sortMode,
  onChange,
}: {
  sortMode: "asc" | "desc";
  onChange: (m: "asc" | "desc") => void;
}) {
  return (
    <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
      <ToggleButtonGroup
        value={sortMode}
        exclusive
        onChange={(_e, val) => {
          if (val) onChange(val);
        }}
        size="small"
      >
        <ToggleButton value="asc">Nächstes zuerst</ToggleButton>
        <ToggleButton value="desc">Weitestes zuerst</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
