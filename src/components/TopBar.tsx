// src/components/TopBar.tsx

import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import { useNavigate } from "react-router-dom";
import { useSettingsTheme } from "../hooks/useSettingsTheme";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useSettingsTheme();
  const navigate = useNavigate();

  const toggleDrawer = (v: boolean) => () => setOpen(v);

  return (
    <>
      <AppBar position="fixed" elevation={1} color="primary" enableColorOnDark>
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: 600, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Kommunale Wahlinfo-App für den Wahlkreis Hof
            </Typography>
          </Box>

          {/* Theme-Switch */}
          <IconButton onClick={toggleTheme} color="inherit">
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          {/* Menü */}
          <IconButton onClick={toggleDrawer(true)} color="inherit">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Paper sx={{ width: 260, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
            Navigation
          </Typography>
          <Divider />

          <List>
            {[
              { path: "/", label: "Startseite" },
              { path: "/kandidaten", label: "Kandidaten" },
              { path: "/parteien", label: "Parteien" },
              { path: "/wahllokale", label: "Wahllokale" },
              { path: "/wahltermine", label: "Termine" },
              { path: "/favoriten", label: "Favoriten" },
              { path: "/settings", label: "Einstellungen" },
            ].map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Drawer>
    </>
  );
}
