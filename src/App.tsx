import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Minus, Square, X, Settings } from "lucide-react";
import { Gallery } from "./pages/Gallery";
import { Editor } from "./pages/Editor";
import { Converter } from "./pages/Converter";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SettingsModal } from "./components/SettingsModal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function AppContent() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();

  const handleMin = () => (window as any).electronAPI.windowMin();
  const handleMax = () => (window as any).electronAPI.windowMax();
  const handleClose = () => (window as any).electronAPI.windowClose();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 select-none text-gray-900 dark:text-gray-100">
      {/* Custom Title Bar */}
      <div className="h-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0 drag-region">
        <div className="flex items-center gap-3 no-drag">
          <img src="logo.png" className="w-5 h-5" alt="Logo" />
          <span className="text-sm font-bold text-primary">豆拼</span>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-primary-light text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {t("nav.converter")}
            </Link>
            <Link
              to="/editor"
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                location.pathname === "/editor"
                  ? "bg-primary-light text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {t("nav.editor")}
            </Link>
            <Link
              to="/gallery"
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                location.pathname === "/gallery"
                  ? "bg-primary-light text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {t("nav.gallery")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center no-drag">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title={t("common.settings")}
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            onClick={handleMin}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMax}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-500 hover:text-white text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-auto relative">
        <Routes>
          <Route path="/" element={<Converter />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </Router>
  );
}
