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

import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

interface TopBarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ darkMode, onToggleTheme }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (value: boolean) => () => {
    setOpen(value);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        color="primary"
        enableColorOnDark
        className="app-topbar"
      >
        <Toolbar>
          {/* Logo + Titel */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexGrow: 1,
              minWidth: 0,
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

          {/* Theme toggle */}
          <IconButton onClick={onToggleTheme} color="inherit" sx={{ ml: 1 }}>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          {/* Menü */}
          <IconButton
            onClick={toggleDrawer(true)}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Paper sx={{ width: 260, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
            Navigation
          </Typography>
          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/")}>
                <ListItemText primary="Startseite" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/kandidaten")}>
                <ListItemText primary="Kandidaten" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/parteien")}>
                <ListItemText primary="Parteien" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/wahllokale")}>
                <ListItemText primary="Wahllokale" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/wahltermine")}>
                <ListItemText primary="Termine" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/favoriten")}>
                <ListItemText primary="Favoriten" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/settings")}>
                <ListItemText primary="Einstellungen" />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Drawer>
    </>
  );
}
