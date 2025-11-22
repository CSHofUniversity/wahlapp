// src/components/Loader.tsx

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Loader() {
  return (
    <Box
      sx={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary">
        Daten werden geladen...
      </Typography>
    </Box>
  );
}
