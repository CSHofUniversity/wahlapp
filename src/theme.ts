// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const appTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",

      // Modern primary - softer, more vibrant
      primary: {
        main: "#3A7AFE", // Modern Blue
        light: "#76A4FF",
        dark: "#1F53C7",
        contrastText: "#FFFFFF",
      },

      // Secondary - modern warm orange/amber
      secondary: {
        main: "#FFB74D",
        light: "#FFD48A",
        dark: "#C88719",
        contrastText: "#1A1A1A",
      },

      // Backgrounds: Modern surfaces
      background: {
        default: darkMode ? "#0F1218" : "#F5F7FA",
        paper: darkMode ? "#1A1F27" : "#FFFFFF",
      },

      text: {
        primary: darkMode ? "#E8EDF6" : "#1B1D22",
        secondary: darkMode ? "#A9B4C6" : "#5F6368",
      },

      // Modern functional colors
      success: {
        main: darkMode ? "#48E58C" : "#2E7D32",
      },
      error: {
        main: darkMode ? "#FF6B6B" : "#D32F2F",
      },
      info: {
        main: darkMode ? "#4DBAFF" : "#0288D1",
      },
    },

    shape: {
      borderRadius: 14, // softer look
    },

    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      h5: {
        fontWeight: 700,
      },
      body1: {
        lineHeight: 1.6,
      },
    },

    components: {
      // Modern AppBar
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1C2533" : "#3A7AFE",
            backdropFilter: "blur(12px)",
          },
        },
      },

      // Cards – soft, floating
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: darkMode ? "#1A1F27" : "#FFFFFF",
            boxShadow: darkMode
              ? "0 8px 28px rgba(0,0,0,0.45)"
              : "0 8px 20px rgba(0,0,0,0.10)",
            transition: "all 0.25s ease",
          },
        },
      },

      // Paper elements (Drawer, BottomNav)
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(22px)",
            backgroundColor: darkMode
              ? "rgba(20,25,32,0.85)"
              : "rgba(255,255,255,0.7)",
          },
        },
      },

      // Buttons – rounded, bold
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            textTransform: "none",
            padding: "10px 18px",
          },
          startIcon: {
            marginTop: 0,
            marginBottom: 0,
            "& > *:first-of-type": {
              fontSize: "1.2rem",
            },
          },
          contained: {
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          },
        },
      },

      // Textfields – modern flat style
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#222832" : "#FFF",
            borderRadius: 12,
          },
          notchedOutline: {
            borderColor: darkMode ? "#3E4959" : "#D0D7DE",
          },
        },
      },

      // Chips – rounded, modern
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
          },
        },
      },

      // Alerts – soft rounded look
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backdropFilter: "blur(10px)",
          },
        },
      },

      // Bottom Navigation (modern floating pill)
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: darkMode ? "#C7D3E1" : "#424242",
            "&.Mui-selected": {
              color: darkMode ? "#FFFFFF" : "#FFFFFF",
            },
          },
        },
      },
    },
  });
