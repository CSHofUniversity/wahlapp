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
import { safeApiCall } from "../services/api";

export interface FavoritMitDetails extends Kandidat {
  notiz?: string;
  parteiFarbe?: string;
  parteiKurz?: string;
  parteiName?: string;
}

export function useFavoriten() {
  const [favoriten, setFavoriten] = useState<FavoritMitDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const { reloadFavoriten } = useFavoritenContext();

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      // -----------------------------
      // Kandidaten laden
      // -----------------------------
      const resK = await safeApiCall(() => ladeKandidaten(), []);
      const kandidaten = resK.data ?? [];
      const offlineK = resK.offline;

      // -----------------------------
      // Parteien laden
      // -----------------------------
      const resP = await safeApiCall(() => ladeParteien(), []);
      const parteien = resP.data ?? [];
      const offlineP = resP.offline;

      // Merke Offline-Status
      setOffline(offlineK || offlineP);

      // -----------------------------
      // Favoriten + Kandidaten mergen
      // loadFavoritenDetails erwartet ein ARRAY → korrekt!
      // -----------------------------
      const rawFavs = await loadFavoritenDetails(kandidaten);

      // -----------------------------
      // Parteien zu Favoriten mergen
      // -----------------------------
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial laden
  useEffect(() => {
    reloadFavoriten();
    reload();
  }, [reload]);

  // -----------------------------
  // CRUD: add
  // -----------------------------
  const add = useCallback(
    async (k: Kandidat) => {
      await addFavorit(k);
      reloadFavoriten();
      await reload();
    },
    [reload]
  );

  // -----------------------------
  // CRUD: remove
  // -----------------------------
  const remove = useCallback(
    async (id: string) => {
      await deleteFavorit(id);
      reloadFavoriten();
      await reload();
    },
    [reload]
  );

  // -----------------------------
  // CRUD: update Notiz
  // -----------------------------
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
    offline,
    add,
    remove,
    updateNotiz,
    reload,
  };
}
