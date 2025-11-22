// FavoritenContext.tsx

import { createContext, useContext, useState, useEffect } from "react";
import type { FavoritEntry } from "../services/favoritenLocal";
import { getFavoriten } from "../services/favoritenLocal";

interface FavoritenContextValue {
  favoriten: FavoritEntry[];
  reloadFavoriten: () => void;
}

const FavoritenContext = createContext<FavoritenContextValue>({
  favoriten: [],
  reloadFavoriten: () => {},
});

export function FavoritenProvider({ children }: { children: React.ReactNode }) {
  const [favoriten, setFavoriten] = useState<FavoritEntry[]>([]);

  const reloadFavoriten = () => {
    setFavoriten(getFavoriten());
  };

  useEffect(() => {
    reloadFavoriten();
  }, []);

  return (
    <FavoritenContext.Provider value={{ favoriten, reloadFavoriten }}>
      {children}
    </FavoritenContext.Provider>
  );
}

export function useFavoritenContext() {
  return useContext(FavoritenContext);
}
