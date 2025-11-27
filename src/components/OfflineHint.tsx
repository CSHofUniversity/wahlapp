import { Alert } from "@mui/material";

export function OfflineHint() {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      Daten aus Zwischenspeicher – du bist offline.
    </Alert>
  );
}
