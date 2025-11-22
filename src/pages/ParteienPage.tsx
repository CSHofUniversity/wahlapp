// src/pages/ParteienPage.tsx

import { useEffect, useState, useMemo } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { Partei } from "../types/partei";
import { ladeParteien } from "../services/parteien";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";
import PolicyIcon from "@mui/icons-material/Policy";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { Loader } from "../components/Loader";

export default function ParteienPage() {
  const [parteien, setParteien] = useState<Partei[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "farbe" | "kurz">("name");

  const navigate = useNavigate();

  useEffect(() => {
    ladeParteien().then((p) => {
      setParteien(p);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = parteien.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    switch (sort) {
      case "name":
        list = list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "kurz":
        list = list.sort((a, b) => (a.kurz ?? "").localeCompare(b.kurz ?? ""));
        break;
      case "farbe":
        list = list.sort((a, b) =>
          (a.farbe ?? "").localeCompare(b.farbe ?? "")
        );
        break;
    }
    return list;
  }, [parteien, search, sort]);

  const handleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) return <Loader />;

  return (
    <PageTransition>
      <PageHeader
        icon={<PolicyIcon />}
        title="Parteien"
        subtitle="Eine Übersicht der aktuellen Parteien zur Kommunalwahl."
      />

      <Container sx={{ mt: 2, mb: 10 }}>
        {/* FILTER */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Partei suchen"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            select
            label="Sortieren nach"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="name">Name (A–Z)</MenuItem>
            <MenuItem value="kurz">Kurzbezeichnung</MenuItem>
            <MenuItem value="farbe">Farbe</MenuItem>
          </TextField>
        </Stack>

        {filtered.map((p) => {
          const expanded = expandedId === p.id;

          return (
            <AppCardWithSideInfo
              key={p.id}
              parteiFarbe={p.farbe ?? "#666"}
              parteiKurz={p.kurz ?? "?"}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ cursor: "pointer" }}
                onClick={() => handleExpand(p.id)}
              >
                <Typography variant="h5">{p.name}</Typography>

                <IconButton>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              <Collapse in={expanded}>
                <Typography sx={{ mt: 2 }}>
                  {p.programm ?? "Kein Programm verfügbar."}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation(); // verhindert Toggle beim Klick
                    navigate(`/kandidaten?partei=${p.id}`);
                  }}
                >
                  Kandidaten dieser Partei anzeigen
                </Button>
              </Collapse>
            </AppCardWithSideInfo>
          );
        })}
      </Container>
    </PageTransition>
  );
}
