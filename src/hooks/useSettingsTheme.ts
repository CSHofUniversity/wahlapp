// src/hooks/useSettingsTheme.ts

import { useThemeContext } from "../context/ThemeContext";

export function useSettingsTheme() {
  const { mode, toggleMode } = useThemeContext();
  return {
    darkMode: mode === "dark",
    mode,
    toggleTheme: toggleMode,
  };
}
