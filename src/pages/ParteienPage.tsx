// src/pages/ParteienPage.tsx

import { useEffect, useState, useMemo } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PolicyIcon from "@mui/icons-material/Policy";

import { useNavigate } from "react-router-dom";
import { ladeParteien } from "../services/parteien";
import type { Partei } from "../types/partei";

import { AppCardWithSideInfo } from "../components/AppCardWithSideInfo";
import { PageLayout } from "../components/PageLayout";
import { OfflineFallback } from "../components/OfflineFallback";
import { safeApiCall } from "../services/api";
import { OfflineHint } from "../components/OfflineHint";
import { SkeletonFilter } from "../components/skeletons/SkeletonFilter";
import { SkeletonKandidatCard } from "../components/skeletons/SkeletonKandidatCard";
import { Loader } from "../components/Loader";

/* ------------------------------------------------------------------ */
/* Hauptkomponente                                                    */
/* ------------------------------------------------------------------ */

export default function ParteienPage() {
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const [parteien, setParteien] = useState<Partei[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { search, sort, setSearch, setSort } = useParteiFilterState();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);

    const res = await safeApiCall(() => ladeParteien(), []);
    setOffline(res.offline);
    setParteien(res.data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () => filterAndSortParteien(parteien, search, sort),
    [parteien, search, sort]
  );

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <>
        <PageLayout
          icon={<PolicyIcon />}
          title="Kandidaten"
          subtitle="Eine Übersicht der Kandidaten zur Kommunalwahl."
          children={undefined}
          loading={loading}
          skeleton={
            <>
              <Loader />
              <SkeletonFilter />
              {[1, 2, 3].map((k) => (
                <AppCardWithSideInfo
                  key={k}
                  parteiFarbe={"#666"}
                  parteiKurz={"???"}
                >
                  <SkeletonKandidatCard />
                </AppCardWithSideInfo>
              ))}
            </>
          }
        />
      </>
    );
  }

  if (offline && parteien.length === 0) {
    return <OfflineFallback />;
  }

  return (
    <PageLayout
      icon={<PolicyIcon />}
      title="Parteien"
      subtitle="Eine Übersicht der aktuellen Parteien zur Kommunalwahl."
      loading={loading}
    >
      {offline && <OfflineHint />}
      <ParteiFilterSection
        search={search}
        sort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      {filtered.map((p) => {
        const expanded = expandedId === p.id;

        return (
          <AppCardWithSideInfo
            key={p.id}
            parteiFarbe={p.farbe ?? "#666"}
            parteiKurz={p.kurz ?? "?"}
          >
            <ParteiCard
              partei={p}
              expanded={expanded}
              onToggleExpand={() => toggleExpand(p.id)}
              onNavigateToKandidaten={() =>
                navigate(`/kandidaten?partei=${p.id}`)
              }
            />
          </AppCardWithSideInfo>
        );
      })}
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Präsenationskomponenten                                            */
/* ------------------------------------------------------------------ */

function ParteiFilterSection({
  search,
  sort,
  onSearchChange,
  onSortChange,
}: {
  search: string;
  sort: string;
  onSearchChange: (v: string) => void;
  onSortChange: (v: "name" | "kurz" | "farbe") => void;
}) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <TextField
        label="Partei suchen"
        fullWidth
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Sortieren nach"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as any)}
      >
        <MenuItem value="name">Name (A–Z)</MenuItem>
        <MenuItem value="kurz">Kurzbezeichnung</MenuItem>
        <MenuItem value="farbe">Farbe</MenuItem>
      </TextField>
    </Stack>
  );
}

function ParteiCard({
  partei,
  expanded,
  onToggleExpand,
  onNavigateToKandidaten,
}: {
  partei: Partei;
  expanded: boolean;
  onToggleExpand: () => void;
  onNavigateToKandidaten: () => void;
}) {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ cursor: "pointer" }}
        onClick={onToggleExpand}
      >
        <Typography variant="h5">{partei.name}</Typography>

        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Typography sx={{ mt: 2 }}>
          {partei.programm ?? "Kein Programm verfügbar."}
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToKandidaten();
          }}
        >
          Kandidaten dieser Partei anzeigen
        </Button>
      </Collapse>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hooks & Utilities                                                  */
/* ------------------------------------------------------------------ */

function useParteiFilterState() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "kurz" | "farbe">("name");

  return { search, sort, setSearch, setSort };
}

function filterAndSortParteien(
  parteien: Partei[],
  search: string,
  sort: "name" | "kurz" | "farbe"
) {
  let list = parteien.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  switch (sort) {
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "kurz":
      return list.sort((a, b) => (a.kurz ?? "").localeCompare(b.kurz ?? ""));
    case "farbe":
      return list.sort((a, b) => (a.farbe ?? "").localeCompare(b.farbe ?? ""));
    default:
      return list;
  }
}
