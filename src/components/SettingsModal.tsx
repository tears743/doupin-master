import React from "react";
import {
  X,
  Settings,
  Check,
  Languages,
  Palette,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { useSettings, ThemeMode } from "../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useSettings();
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const colors = [
    { name: t("settings.colors.indigo"), value: "#6366f1" },
    { name: t("settings.colors.gray"), value: "#4b5563" },
    { name: t("settings.colors.black"), value: "#000000" },
    { name: t("settings.colors.red"), value: "#ef4444" },
    { name: t("settings.colors.green"), value: "#10b981" },
    { name: t("settings.colors.blue"), value: "#0ea5e9" },
    { name: t("settings.colors.orange"), value: "#f59e0b" },
    { name: t("settings.colors.purple"), value: "#8b5cf6" },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t("common.settings")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
          {/* Language Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("settings.language")}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange("zh")}
                className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                  i18n.language.startsWith("zh")
                    ? "bg-primary-light border-primary text-primary font-bold"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                中文
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                  i18n.language.startsWith("en")
                    ? "bg-primary-light border-primary text-primary font-bold"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Mode (Skin) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("settings.theme_mode")}
              </label>
            </div>
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {[
                {
                  id: "light" as ThemeMode,
                  icon: Sun,
                  label: t("settings.theme_light"),
                },
                {
                  id: "dark" as ThemeMode,
                  icon: Moon,
                  label: t("settings.theme_dark"),
                },
                {
                  id: "system" as ThemeMode,
                  icon: Monitor,
                  label: t("settings.theme_system"),
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateSettings({ themeMode: mode.id })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all ${
                    settings.themeMode === mode.id
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              ))}
              <label
                className={`aspect-square rounded-lg flex items-center justify-center transition-all border-2 cursor-pointer relative overflow-hidden ${
                  !colors.some((c) => c.value === settings.themeColor)
                    ? "border-primary shadow-md scale-105"
                    : "border-transparent hover:scale-105"
                }`}
                style={{
                  background: !colors.some(
                    (c) => c.value === settings.themeColor,
                  )
                    ? settings.themeColor
                    : "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #00FF00 120deg, #0000FF 240deg, #FF0000 360deg)",
                }}
                title={t("settings.custom_color")}
              >
                <input
                  type="color"
                  value={settings.themeColor}
                  onChange={(e) =>
                    updateSettings({ themeColor: e.target.value })
                  }
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                {!colors.some((c) => c.value === settings.themeColor) && (
                  <Check className="w-4 h-4 text-white drop-shadow-sm z-10" />
                )}
              </label>
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("settings.theme_color")}
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={`theme-${color.value}`}
                  onClick={() => updateSettings({ themeColor: color.value })}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all border-2 ${
                    settings.themeColor === color.value
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.themeColor === color.value && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">
                {t("settings.watermark_switch")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings.watermark_hint")}
              </div>
            </div>
            <button
              onClick={() =>
                updateSettings({ showWatermark: !settings.showWatermark })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showWatermark
                  ? "bg-primary"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.showWatermark ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Watermark Suffix */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              {t("settings.watermark_suffix")}
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={5}
                value={settings.watermarkSuffix}
                onChange={(e) =>
                  updateSettings({ watermarkSuffix: e.target.value })
                }
                placeholder={t("settings.watermark_suffix_placeholder")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-gray-100"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                {settings.watermarkSuffix.length}/5
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              {t("settings.watermark_preview")}: 豆拼-周一地铺
              {settings.watermarkSuffix}
            </p>
          </div>

          {/* Watermark Color */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              {t("settings.watermark_color")}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={`watermark-${color.value}`}
                  onClick={() =>
                    updateSettings({ watermarkColor: color.value })
                  }
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all border-2 ${
                    settings.watermarkColor === color.value
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.watermarkColor === color.value && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
              <label
                className={`aspect-square rounded-lg flex items-center justify-center transition-all border-2 cursor-pointer relative overflow-hidden ${
                  !colors.some((c) => c.value === settings.watermarkColor)
                    ? "border-primary shadow-md scale-105"
                    : "border-transparent hover:scale-105"
                }`}
                style={{
                  background: !colors.some(
                    (c) => c.value === settings.watermarkColor,
                  )
                    ? settings.watermarkColor
                    : "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #00FF00 120deg, #0000FF 240deg, #FF0000 360deg)",
                }}
                title={t("settings.custom_color")}
              >
                <input
                  type="color"
                  value={settings.watermarkColor}
                  onChange={(e) =>
                    updateSettings({ watermarkColor: e.target.value })
                  }
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                {!colors.some((c) => c.value === settings.watermarkColor) && (
                  <Check className="w-4 h-4 text-white drop-shadow-sm z-10" />
                )}
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          {t("settings.save_and_return")}
        </button>
      </div>
    </div>
  );
};
