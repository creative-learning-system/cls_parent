"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "light", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") setThemeState(saved);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
