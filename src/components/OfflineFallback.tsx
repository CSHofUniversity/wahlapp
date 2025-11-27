import { Box, Typography, Button, Stack } from "@mui/material";
import CloudOffIcon from "@mui/icons-material/CloudOff";

export function OfflineFallback({ retry }: { retry: () => void }) {
  return (
    <Box
      sx={{
        mt: 8,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <CloudOffIcon sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Keine Daten verfügbar
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Du bist offline und es wurden noch keine Daten geladen.
      </Typography>
      <Button variant="contained" onClick={retry}>
        Erneut versuchen
      </Button>
    </Box>
  );
}
