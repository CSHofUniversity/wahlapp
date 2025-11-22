// src/hooks/useFavoriten.ts

import { useEffect, useState, useCallback } from "react";
import type { Kandidat } from "../types/kandidat";

import {
  loadFavoritenDetails,
  addFavorit,
  deleteFavorit,
  updateFavorit,
} from "../services/favoritenLocal";

import { ladeKandidaten } from "../services/kandidaten";
import { ladeParteien } from "../services/parteien";

import { useFavoritenContext } from "../context/FavoritenContext";

export interface FavoritMitDetails extends Kandidat {
  notiz?: string;
  parteiFarbe?: string;
  parteiKurz?: string;
  parteiName?: string;
}

export function useFavoriten() {
  const [favoriten, setFavoriten] = useState<FavoritMitDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const { reloadFavoriten } = useFavoritenContext();

  const reload = useCallback(async () => {
    setLoading(true);

    // 1️⃣ Kandidaten & Parteien laden
    const kandidaten = await ladeKandidaten();
    const parteien = await ladeParteien();

    // 2️⃣ Favorit-Einträge + Kandidaten zusammenführen
    const rawFavs = await loadFavoritenDetails(kandidaten);

    // 3️⃣ Parteien-Metadaten mit Favoriten mergen
    const merged: FavoritMitDetails[] = rawFavs.map((f) => {
      const partei = parteien.find((p) => p.id === f.parteiId);

      return {
        ...f,
        parteiFarbe: partei?.farbe ?? "#666",
        parteiKurz: partei?.kurz ?? "?",
        parteiName: partei?.name ?? f.parteiName ?? "",
      };
    });

    setFavoriten(merged);
    setLoading(false);
  }, []);

  // Laden beim ersten Mount
  useEffect(() => {
    reloadFavoriten();
    reload();
  }, [reload]);

  const add = useCallback(
    async (k: Kandidat) => {
      await addFavorit(k);
      reloadFavoriten();
      await reload();
    },
    [reload]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteFavorit(id);
      reloadFavoriten();
      await reload();
    },
    [reload]
  );

  const updateNotiz = useCallback(
    async (id: string, text: string) => {
      await updateFavorit(id, { notiz: text });
      reloadFavoriten();
      await reload();
    },
    [reload]
  );

  return {
    favoriten,
    loading,
    add,
    remove,
    updateNotiz,
    reload,
  };
}
