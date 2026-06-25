"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type MapTheme } from "@/lib/map/constants";

export function useMapTheme() {
  const [theme, setThemeState] = useState<MapTheme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
    document.documentElement.setAttribute(
      "data-theme",
      stored === "dark" ? "dark" : "light",
    );
    setIsReady(true);
  }, []);

  const setTheme = useCallback((value: MapTheme) => {
    setThemeState(value);
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
    document.documentElement.setAttribute("data-theme", value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme, isReady };
}
