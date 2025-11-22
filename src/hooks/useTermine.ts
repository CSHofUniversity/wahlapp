import { useEffect, useState } from "react";
import type { Termin } from "../types/termin";
import { getPersoenlicheTermine } from "../services/termineLocal";

export function useTermine() {
  const [termine, setTermine] = useState<Termin[]>([]);

  async function reload() {
    const items = await getPersoenlicheTermine();
    setTermine(items);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      const items = await getPersoenlicheTermine();
      if (active) setTermine(items);
    })();

    return () => {
      active = false;
    };
  }, []);

  return { termine, reload };
}
