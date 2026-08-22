import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const THEME_STORAGE_KEY = "fin_service_theme";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // localStorage may not be available (e.g. incognito/restrictions)
    }
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Track system preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        if (e.newValue === "light" || e.newValue === "dark" || e.newValue === "system") {
          setThemeState(e.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Apply dark class and color-scheme to document root
  useEffect(() => {
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.style.colorScheme = isDark ? "dark" : "light";
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "system") return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
