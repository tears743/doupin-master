import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface AppSettings {
  showWatermark: boolean;
  watermarkSuffix: string;
  watermarkColor: string;
  themeColor: string;
  themeMode: ThemeMode;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  showWatermark: true,
  watermarkSuffix: "",
  watermarkColor: "#6366f1", // Default indigo
  themeColor: "#6366f1", // Default indigo
  themeMode: "system",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("pindou_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("pindou_settings", JSON.stringify(settings));
    // Apply theme color to CSS variable
    document.documentElement.style.setProperty("--primary-color", settings.themeColor);
    // Apply a subtle background color based on theme
    document.documentElement.style.setProperty("--primary-color-light", `${settings.themeColor}15`);
    document.documentElement.style.setProperty("--primary-color-medium", `${settings.themeColor}40`);

    // Handle Dark Mode
    const applyTheme = (mode: ThemeMode) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (mode === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(mode);
      }
    };

    applyTheme(settings.themeMode);

    // Listen for system changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.themeMode === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Enforce 5 character limit for suffix
      if (updated.watermarkSuffix.length > 5) {
        updated.watermarkSuffix = updated.watermarkSuffix.substring(0, 5);
      }
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
