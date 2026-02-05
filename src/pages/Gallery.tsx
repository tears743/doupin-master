import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Trash2, Calendar, Grid as GridIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../components/ConfirmModal";
import { MessageModal } from "../components/MessageModal";
import { Color } from "../utils/colorUtils";

interface Work {
  id: number;
  name: string;
  width: number;
  height: number;
  data: (Color | null)[][];
  created_at: string;
}

const WorkPreview: React.FC<{
  data: (Color | null)[][];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || !data.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to a fixed preview size or relative
    const previewSize = 400; // Increased size
    const cellSize = Math.max(
      2,
      Math.floor(previewSize / Math.max(width, height)),
    );

    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    data.forEach((row, y) => {
      if (!row) return;
      row.forEach((pixel, x) => {
        if (pixel && pixel.hex) {
          ctx.fillStyle = pixel.hex;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      });
    });
  }, [data, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain shadow-md rounded-sm bg-white"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

export const Gallery: React.FC = () => {
  const { t } = useTranslation();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modals
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [messageConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const data = await window.electronAPI.getWorks();
      setWorks(data);
    } catch (err) {
      console.error("Failed to fetch works", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await window.electronAPI.deleteWork(deleteId);
      if (res.changes) {
        setWorks(works.filter((w) => w.id !== deleteId));
        setToast({ message: t("gallery.delete_success"), type: "success" });
      } else {
        throw new Error(t("gallery.delete_failed"));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: t("gallery.delete_failed"), type: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1920px] mx-auto bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("gallery.title")}</h1>
        <Link
          to="/editor"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
        >
          {t("gallery.new_work")}
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <GridIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t("gallery.empty_title")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t("gallery.empty_desc")}
          </p>
          <Link
            to="/editor"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            {t("gallery.start_creating")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
          {works.map((work) => (
            <Link
              key={work.id}
              to={`/editor?id=${work.id}`}
              className="group block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow hover:border-primary/50"
            >
              <div className="aspect-square bg-gray-50 dark:bg-gray-800/50 relative flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-800 group-hover:bg-primary-light transition-colors overflow-hidden">
                {work.data && work.data.length > 0 ? (
                  <WorkPreview
                    data={work.data}
                    width={work.width}
                    height={work.height}
                  />
                ) : (
                  <GridIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 group-hover:text-primary/30" />
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => handleDeleteClick(e, work.id)}
                    className="p-2 bg-white dark:bg-gray-800 text-red-500 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {work.name || t("gallery.unnamed_work")}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <GridIcon className="w-4 h-4 mr-1" />
                    {work.width} x {work.height}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(work.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title={t("gallery.delete_confirm_title")}
        message={t("gallery.delete_confirm_msg")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        type="danger"
      />

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageConfig.title}
        message={messageConfig.message}
        type={messageConfig.type}
      />

      {/* Toast Message */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out animate-pulse">
          <div
            className={`px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-sm ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : "bg-red-500/90 border-red-400 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
