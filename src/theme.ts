// src/theme.ts

import { createTheme } from "@mui/material/styles";

export const appTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#0066cc",
        dark: "#004a99",
      },
      secondary: {
        main: "#ffb74d",
      },
      background: {
        default: darkMode ? "#0c1724" : "#f4f6f8",
        paper: darkMode ? "rgba(13, 22, 38, 1)" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#e3eaf3" : "#222",
        secondary: darkMode ? "#b5c4d6" : "#555",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiAppBar: {
        defaultProps: {
          color: "primary",
          elevation: 1,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: darkMode
              ? "0 4px 16px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  });
