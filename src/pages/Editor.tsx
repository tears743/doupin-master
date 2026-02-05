import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Color, getContrastColor, findClosestColor } from "../utils/colorUtils";
import { useLocation } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import {
  Save,
  FolderOpen,
  PlusSquare,
  ZoomIn,
  ZoomOut,
  Grid,
  Type,
  Eraser,
  PenTool,
  X,
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Edit,
  Download,
  Image as ImageIcon,
  Trash2,
  Search,
  Pipette,
  MousePointer2,
  Keyboard,
  Minimize2,
} from "lucide-react";
import { MessageModal } from "../components/MessageModal";

// --- Floating Reference Window Component ---
const FloatingWindow = ({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) => {
  const [position, setPosition] = useState({
    x: window.innerWidth - 320,
    y: 80,
  });
  const [size, setSize] = useState({ w: 300, h: 300 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a default size
    // We don't reset position here to remember where the user left it,
    // or we can reset if image changes to null and back.
    // But since the component is unmounted when !image, state is reset anyway.

    const container = document.querySelector(".flex-1.bg-gray-100");
    if (container) {
      const rect = container.getBoundingClientRect();
      setPosition({ x: rect.left + 50, y: rect.top + 50 });
    }
    // Reset scale/rotation when new image opens
    setScale(1);
    setRotation(0);
    setOpacity(1);
  }, []); // Run once on mount

  // When image loads, adjust window size to match image aspect ratio/size
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
    // Force a size update to respect the aspect ratio immediately
    const initialWidth = Math.min(400, img.naturalWidth);
    const initialHeight = initialWidth / ratio;
    setSize({ w: initialWidth, h: initialHeight });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas interaction
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
      if (isResizing) {
        const dx = e.clientX - dragStart.x;
        // const dy = e.clientY - dragStart.y;

        setSize((prev) => {
          const newW = Math.max(100, prev.w + dx);
          // If we have aspect ratio, lock it. Otherwise use free resize (shouldn't happen with image)
          const newH = aspectRatio
            ? newW / aspectRatio
            : Math.max(100, prev.h + (e.clientY - dragStart.y));
          return { w: newW, h: newH };
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, isResizing, dragStart]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      // Rotate
      setRotation((prev) => prev + (e.deltaY > 0 ? -5 : 5));
    } else {
      // Zoom
      setScale((prev) =>
        Math.max(0.1, Math.min(5, prev + (e.deltaY > 0 ? -0.1 : 0.1))),
      );
    }
  };

  if (!image) return null;

  return (
    <div
      ref={windowRef}
      className="fixed z-[100] flex flex-col overflow-visible group pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
      }}
    >
      {/* Header - Transparent overlay, only visible on hover */}
      {/* Removed per user request */}

      {/* Content - Click anywhere to drag */}
      <div className="flex-1 relative flex items-center justify-center bg-transparent group pointer-events-none">
        <div className="relative w-full h-full">
          <img
            src={image}
            alt="Ref"
            onLoad={handleImageLoad}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            className="w-full h-full object-contain select-none cursor-move pointer-events-auto"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              opacity: opacity,
            }}
            draggable={false}
          />

          {/* Attach/Close Button - Only visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="control-btn absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-50 pointer-events-auto"
            title="附着回画布 (关闭悬浮)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-auto"
          >
            <div className="w-2 h-2 bg-white/50 rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface Brand {
  name: string;
  value: string;
  sets?: { name: string; id: string }[];
}

interface Work {
  id: number;
  name: string;
  width: number;
  height: number;
  created_at: string;
  data: (Color | null)[][]; // Grid data
}

export function Editor() {
  // --- 1. States & Refs ---
  const { t } = useTranslation();
  const { settings } = useSettings();

  // Data States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("MARD");
  const [selectedSet, setSelectedSet] = useState<string>("full-221");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Editor States
  const [grid, setGrid] = useState<(Color | null)[][]>([]);
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [currentWorkId, setCurrentWorkId] = useState<number | null>(null);
  const [workName, setWorkName] = useState("未命名作品");

  // History for Undo
  const [, setHistory] = useState<(Color | null)[][][]>([]);
  const MAX_HISTORY = 50;

  // Clipboard & Selection
  const [clipboardColor, setClipboardColor] = useState<Color | null>(null);
  const [selectedPixels, setSelectedPixels] = useState<Set<string>>(new Set());
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const selectionBaseRef = useRef<Set<string>>(new Set());

  // View States
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [tool, setTool] = useState<
    "pen" | "eraser" | "picker" | "select" | "move_ref"
  >("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const mouseClientPos = useRef({ x: 0, y: 0 });

  // Reference Image States
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refOpacity, setRefOpacity] = useState(0.5);
  const [refImagePos, setRefImagePos] = useState({ x: 0, y: 0 });
  const [refRotation, setRefRotation] = useState(0);
  const [refScale, setRefScale] = useState(1);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  const refDragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Floating Reference
  const [showFloatingRef, setShowFloatingRef] = useState(false);

  // Floating Palette States
  const [isExpanded, setIsExpanded] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMiddleDragging, setIsMiddleDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const middleDragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Modals & UI
  const [showNewModal, setShowNewModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(32);
  const [resizeHeight, setResizeHeight] = useState(32);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [messageConfig, setMessageConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    title: "",
    message: "",
    type: "info",
  });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const location = useLocation();

  // --- 2. Helper Callbacks ---

  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = [...prev, grid.map((row) => [...row])];
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(newHistory.length - MAX_HISTORY);
      }
      return newHistory;
    });
  }, [grid]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const lastState = prev[prev.length - 1];
      setGrid(lastState);
      return prev.slice(0, prev.length - 1);
    });
  }, []);

  const fetchColors = useCallback(async () => {
    try {
      const data = await window.electronAPI.getColors(
        selectedBrand || undefined,
        selectedSet || undefined,
      );
      setColors(data);
      if (data.length > 0 && !selectedColor) {
        setSelectedColor(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch colors:", err);
    }
  }, [selectedBrand, selectedSet, selectedColor]);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await window.electronAPI.getBrands();
      setBrands(data);
    } catch (err: unknown) {
      console.error("Failed to fetch brands:", err);
      setMessageConfig({
        title: "Connection Error",
        message: "Failed to load brands.",
        type: "error",
      });
      setShowMessageModal(true);
    }
  }, []);

  const fetchAllColors = useCallback(async () => {
    try {
      // Calling getColors without brand/set returns a default set,
      // but let's check if we can get everything.
      // Based on server/data/colors.js, getColors() returns Perler + Artkal.
      // We might need to iterate through all brands to be truly accurate.
      const all: Color[] = [];
      const brandsData = await window.electronAPI.getBrands();
      for (const b of brandsData) {
        if (b.sets) {
          for (const s of b.sets) {
            const c = await window.electronAPI.getColors(b.value, s.id);
            all.push(...c);
          }
        }
      }
      setAllColors(all);
    } catch (err) {
      console.error("Failed to fetch all colors:", err);
    }
  }, []);

  const createGrid = useCallback((w: number, h: number) => {
    const newGrid = Array(h)
      .fill(null)
      .map(() => Array(w).fill(null));
    setGrid(newGrid);
    setWidth(w);
    setHeight(h);
    setCurrentWorkId(null);
    setWorkName("未命名作品");
    setHistory([]);
  }, []);

  const sampleRefImageColor = useCallback(
    (clientX: number, clientY: number) => {
      if (!imageCanvasRef.current) return null;
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const lx = clientX - rect.left;
      const ly = clientY - rect.top;

      // Calculate coordinates in the reference image space
      // 1. Undo translation (left/top)
      let mx = lx - refImagePos.x;
      let my = ly - refImagePos.y;

      // 2. Undo rotation and scale around center
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Translate to center
      const dx = mx - cx;
      const dy = my - cy;

      // Inverse Rotation
      const rad = (-refRotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dxRot = dx * cos - dy * sin;
      const dyRot = dx * sin + dy * cos;

      // Inverse Scale
      const dxScaled = dxRot / refScale;
      const dyScaled = dyRot / refScale;

      // Translate back
      const finalX = dxScaled + cx;
      const finalY = dyScaled + cy;

      const ratioX = finalX / rect.width;
      const ratioY = finalY / rect.height;

      if (ratioX < 0 || ratioX >= 1 || ratioY < 0 || ratioY >= 1) {
        return null;
      }

      const imgCanvas = imageCanvasRef.current;
      const imgX = Math.max(
        0,
        Math.min(imgCanvas.width - 1, Math.floor(ratioX * imgCanvas.width)),
      );
      const imgY = Math.max(
        0,
        Math.min(imgCanvas.height - 1, Math.floor(ratioY * imgCanvas.height)),
      );

      const ctx = imgCanvas.getContext("2d");
      if (!ctx) return null;

      const pixel = ctx.getImageData(imgX, imgY, 1, 1).data;
      const rgb: [number, number, number] = [pixel[0], pixel[1], pixel[2]];

      // Use allColors if available for maximum accuracy, otherwise fall back to filtered colors
      const searchPalette = allColors.length > 0 ? allColors : colors;
      const closest = findClosestColor(rgb, searchPalette);

      const gridX = Math.floor((lx / rect.width) * width);
      const gridY = Math.floor((ly / rect.height) * height);

      return { color: closest, x: gridX, y: gridY };
    },
    [refImagePos, refRotation, refScale, width, height, colors, allColors],
  );

  const handlePickColor = useCallback(
    (clientX: number, clientY: number) => {
      // 1. Try to pick from grid first if there's a color there
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const gridX = Math.floor(((clientX - rect.left) / rect.width) * width);
        const gridY = Math.floor(((clientY - rect.top) / rect.height) * height);

        if (
          gridX >= 0 &&
          gridX < width &&
          gridY >= 0 &&
          gridY < height &&
          grid[gridY][gridX]
        ) {
          const color = grid[gridY][gridX];
          setSelectedColor(color);
          return { color, x: gridX, y: gridY };
        }
      }

      // 2. If no color in grid, try to pick from reference image
      const result = sampleRefImageColor(clientX, clientY);
      if (result && result.color) {
        setSelectedColor(result.color);
        if (
          result.x >= 0 &&
          result.x < width &&
          result.y >= 0 &&
          result.y < height
        ) {
          setSelectedPixels(new Set([`${result.x},${result.y}`]));
        }
      }
      return result;
    },
    [sampleRefImageColor, width, height, grid],
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseScale = Math.max(10, Math.floor(600 / Math.max(width, height)));
    const scale = baseScale * zoom;

    canvas.width = width * scale;
    canvas.height = height * scale;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f0f0f0";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    grid.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          ctx.fillStyle = pixel.hex;
          ctx.fillRect(x * scale, y * scale, scale, scale);

          const isSelected = selectedColor?.id === pixel.id;
          const shouldShowName =
            (showNames && scale >= 15) || (isSelected && scale >= 12);

          if (shouldShowName) {
            ctx.fillStyle = getContrastColor(pixel.hex);
            const fontSize = Math.max(8, Math.floor(scale / 2.5));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              pixel.name,
              x * scale + scale / 2,
              y * scale + scale / 2,
              scale - 2,
            );
          }

          if (isSelected) {
            ctx.strokeStyle =
              getContrastColor(pixel.hex) === "#ffffff"
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x * scale, y * scale, scale, scale);
          }
        }
      });
    });

    if (selectedPixels.size > 0) {
      ctx.fillStyle = "rgba(0, 120, 255, 0.3)";
      ctx.strokeStyle = "rgba(0, 120, 255, 0.8)";
      ctx.lineWidth = 2;
      selectedPixels.forEach((coord) => {
        const [px, py] = coord.split(",").map(Number);
        if (!isNaN(px) && !isNaN(py)) {
          ctx.fillRect(px * scale, py * scale, scale, scale);
          ctx.strokeRect(px * scale, py * scale, scale, scale);
        }
      });
    }

    if (hoveredCell) {
      ctx.strokeStyle = tool === "picker" ? "#f43f5e" : "rgba(0,0,0,0.2)";
      ctx.lineWidth = tool === "picker" ? 3 : 1;
      ctx.strokeRect(
        hoveredCell.x * scale,
        hoveredCell.y * scale,
        scale,
        scale,
      );
    }

    if (showGrid) {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width, y * scale);
        ctx.stroke();
      }
    }

    // Draw Tiled Diagonal Watermark
    if (settings.showWatermark) {
      const wmCanvas = document.createElement("canvas");
      const wmSize = Math.max(200, scale * 10);
      wmCanvas.width = wmSize;
      wmCanvas.height = wmSize;
      const wmCtx = wmCanvas.getContext("2d");
      if (wmCtx) {
        wmCtx.translate(wmSize / 2, wmSize / 2);
        wmCtx.rotate(-Math.PI / 6); // Slight tilt
        wmCtx.fillStyle = `${settings.watermarkColor}26`; // 0.15 opacity in hex
        const fontSize = Math.max(16, Math.floor(scale / 0.8));
        wmCtx.font = `bold ${fontSize}px sans-serif`;
        wmCtx.textAlign = "center";
        wmCtx.fillText(`豆拼-周一地铺${settings.watermarkSuffix}`, 0, 0);

        const pattern = ctx.createPattern(wmCanvas, "repeat");
        if (pattern) {
          ctx.save();
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    }
  }, [
    grid,
    width,
    height,
    zoom,
    showGrid,
    showNames,
    selectedColor,
    selectedPixels,
    hoveredCell,
    tool,
    settings,
  ]);

  // --- 3. Effects ---

  useEffect(() => {
    if (refImage) {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        imageCanvasRef.current = canvas;
      };
      img.src = refImage;
    } else {
      imageCanvasRef.current = null;
    }
  }, [refImage]);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      setIsMiddleDragging(false);
    };
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, []);

  useEffect(() => {
    // Initial centering of the canvas
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const content = container.firstElementChild as HTMLElement;
      if (content) {
        container.scrollLeft =
          (content.offsetWidth - container.clientWidth) / 2;
        container.scrollTop =
          (content.offsetHeight - container.clientHeight) / 2;
      }
    }
  }, []);

  const handleLoadWork = useCallback(async (id: number) => {
    try {
      const work = await window.electronAPI.getWork(id);
      if (work.data) {
        setGrid(work.data);
        setWidth(work.width);
        setHeight(work.height);
        setWorkName(work.name);
        setCurrentWorkId(work.id);
        setShowHistoryModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchAllColors();

    if (location.state) {
      const { refImage, refX, refY, refScale, refRotation } =
        location.state as any;
      if (refImage) {
        setRefImage(refImage);
        if (refX !== undefined)
          setRefImagePos((prev) => ({ ...prev, x: refX }));
        if (refY !== undefined)
          setRefImagePos((prev) => ({ ...prev, y: refY }));
        if (refScale !== undefined) setRefScale(refScale);
        if (refRotation !== undefined) setRefRotation(refRotation);
      }
    }

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      handleLoadWork(parseInt(id));
    } else {
      createGrid(32, 32);
    }
  }, [
    fetchBrands,
    fetchAllColors,
    createGrid,
    handleLoadWork,
    location.search,
    location.state,
  ]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);

      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        if (
          !(
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement
          )
        ) {
          let colorToCopy = null;

          // 1. Priority: Try from selection first
          if (selectedPixels.size > 0) {
            // Find first valid color in selection
            for (const coord of selectedPixels) {
              const [sx, sy] = coord.split(",").map(Number);
              if (grid[sy] && grid[sy][sx]) {
                colorToCopy = grid[sy][sx];
                break;
              }
            }
          }

          // 2. Priority: If no color from selection, try hovered grid cell
          if (
            !colorToCopy &&
            hoveredCell &&
            grid[hoveredCell.y][hoveredCell.x]
          ) {
            colorToCopy = grid[hoveredCell.y][hoveredCell.x];
          }

          // 3. Try to pick from reference image if no color in grid but hovering canvas
          if (!colorToCopy && hoveredCell) {
            const result = sampleRefImageColor(
              mouseClientPos.current.x,
              mouseClientPos.current.y,
            );
            if (result && result.color) colorToCopy = result.color;
          }

          // 4. Fallback to currently selected palette color
          if (!colorToCopy) colorToCopy = selectedColor;

          if (colorToCopy) {
            setClipboardColor(colorToCopy);
            setSelectedColor(colorToCopy);
          }
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        if (
          !(
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement
          )
        ) {
          if (clipboardColor) {
            e.preventDefault();
            saveToHistory();
            const newGrid = grid.map((row) => [...row]);
            let changed = false;
            if (selectedPixels.size > 0) {
              selectedPixels.forEach((coord) => {
                const [x, y] = coord.split(",").map(Number);
                if (
                  x >= 0 &&
                  x < width &&
                  y >= 0 &&
                  y < height &&
                  newGrid[y][x]?.id !== clipboardColor.id
                ) {
                  newGrid[y][x] = clipboardColor;
                  changed = true;
                }
              });
            } else if (
              hoveredCell &&
              grid[hoveredCell.y][hoveredCell.x]?.id !== clipboardColor.id
            ) {
              newGrid[hoveredCell.y][hoveredCell.x] = clipboardColor;
              changed = true;
            }
            if (changed) setGrid(newGrid);
          }
        }
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedPixels.size > 0
      ) {
        if (
          !(
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement
          )
        ) {
          e.preventDefault();
          saveToHistory();
          const newGrid = grid.map((row) => [...row]);
          selectedPixels.forEach((coord) => {
            const [x, y] = coord.split(",").map(Number);
            if (x >= 0 && x < width && y >= 0 && y < height)
              newGrid[y][x] = null;
          });
          setGrid(newGrid);
        }
      }

      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key.toLowerCase();
      if (key === "e") setTool("eraser");
      if (key === "p" || key === "b") setTool("pen");
      if (key === "i") setTool("picker");
      if (key === "v") setTool("select");
      if (key === "m") setTool("move_ref");
      if (key === "s")
        setTool((current) => (current === "select" ? "pen" : "select"));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    selectedPixels,
    grid,
    width,
    height,
    undo,
    saveToHistory,
    selectedColor,
    clipboardColor,
    hoveredCell,
    handlePickColor,
    tool,
  ]);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        setPalettePosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [isDragging]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleWheelRaw = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => {
          const newZoom = Math.min(5, Math.max(0.5, prev + delta));
          return parseFloat(newZoom.toFixed(1));
        });
        return;
      }

      if (tool === "move_ref") {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setRefScale((prev) => {
          const newScale = Math.max(0.1, Math.min(5, prev + delta));
          return parseFloat(newScale.toFixed(2));
        });
      }
    };

    const handleMouseDownRaw = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheelRaw, { passive: false });
    container.addEventListener("mousedown", handleMouseDownRaw);
    return () => {
      container.removeEventListener("wheel", handleWheelRaw);
      container.removeEventListener("mousedown", handleMouseDownRaw);
    };
  }, [tool]);

  // --- 4. Event Handlers ---

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = (
      e.currentTarget.parentElement as HTMLElement
    ).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDraw = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const baseScale = Math.max(10, Math.floor(600 / Math.max(width, height)));
      const scale = baseScale * zoom;

      const gridX = Math.floor(x / scale);
      const gridY = Math.floor(y / scale);

      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        const newGrid = [...grid];
        newGrid[gridY] = [...newGrid[gridY]];

        if (tool === "pen") {
          if (selectedColor && newGrid[gridY][gridX]?.id !== selectedColor.id) {
            newGrid[gridY][gridX] = selectedColor;
            setGrid(newGrid);
          }
        } else {
          if (newGrid[gridY][gridX] !== null) {
            newGrid[gridY][gridX] = null;
            setGrid(newGrid);
          }
        }
      }
    },
    [grid, width, height, zoom, tool, selectedColor],
  );

  const handleSelectStart = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const scale =
      Math.max(10, Math.floor(600 / Math.max(width, height))) * zoom;
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      setSelectionStart({ x: gridX, y: gridY });
      selectionBaseRef.current = e.shiftKey
        ? new Set(selectedPixels)
        : new Set();
      const newSelection = new Set(selectionBaseRef.current);
      newSelection.add(`${gridX},${gridY}`);
      setSelectedPixels(newSelection);

      // Sync color display with selection
      if (grid[gridY][gridX]) {
        setSelectedColor(grid[gridY][gridX]);
      }
    }
  };

  const handleSelectMove = (e: React.MouseEvent) => {
    if (!selectionStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const scale =
      Math.max(10, Math.floor(600 / Math.max(width, height))) * zoom;
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      const startX = Math.min(selectionStart.x, gridX);
      const endX = Math.max(selectionStart.x, gridX);
      const startY = Math.min(selectionStart.y, gridY);
      const endY = Math.max(selectionStart.y, gridY);

      const newSelection = new Set(selectionBaseRef.current);
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          newSelection.add(`${x},${y}`);
        }
      }
      setSelectedPixels(newSelection);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      // Middle button for panning
      e.preventDefault();
      setIsMiddleDragging(true);
      if (scrollContainerRef.current) {
        middleDragStart.current = {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: scrollContainerRef.current.scrollLeft,
          scrollTop: scrollContainerRef.current.scrollTop,
        };
      }
      return;
    }

    setIsDrawing(true);
    if (tool === "move_ref") {
      setIsDraggingRef(true);
      refDragStart.current = { x: e.clientX, y: e.clientY };
    } else if (tool === "picker") {
      const result = handlePickColor(e.clientX, e.clientY);
      if (e.button === 2 && result && result.color) {
        saveToHistory();
        const { x, y, color } = result;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const newGrid = [...grid];
          newGrid[y] = [...newGrid[y]];
          newGrid[y][x] = color;
          setGrid(newGrid);
        }
      }
    } else if (tool === "select") {
      if (e.button === 0) handleSelectStart(e);
    } else {
      if (e.button === 0) {
        saveToHistory();
        handleDraw(e);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    mouseClientPos.current = { x: e.clientX, y: e.clientY };

    if (isMiddleDragging && scrollContainerRef.current) {
      e.preventDefault();
      const dx = e.clientX - middleDragStart.current.x;
      const dy = e.clientY - middleDragStart.current.y;
      scrollContainerRef.current.scrollLeft =
        middleDragStart.current.scrollLeft - dx;
      scrollContainerRef.current.scrollTop =
        middleDragStart.current.scrollTop - dy;
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const gridX = Math.floor(((e.clientX - rect.left) / rect.width) * width);
      const gridY = Math.floor(((e.clientY - rect.top) / rect.height) * height);
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        if (hoveredCell?.x !== gridX || hoveredCell?.y !== gridY)
          setHoveredCell({ x: gridX, y: gridY });
      } else {
        setHoveredCell(null);
      }
    }

    if (isDraggingRef) {
      const dx = e.clientX - refDragStart.current.x;
      const dy = e.clientY - refDragStart.current.y;
      setRefImagePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      refDragStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (isDrawing) {
      if (tool === "picker") {
        const result = handlePickColor(e.clientX, e.clientY);
        if (e.buttons & 2 && result && result.color) {
          const { x, y, color } = result;
          if (
            x >= 0 &&
            x < width &&
            y >= 0 &&
            y < height &&
            grid[y][x]?.id !== color.id
          ) {
            const newGrid = [...grid];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = color;
            setGrid(newGrid);
          }
        }
      } else if (tool === "select") {
        handleSelectMove(e);
      } else if (tool === "pen" || tool === "eraser") {
        handleDraw(e);
      }
    }
  };

  const handleCanvasMouseUp = (e?: React.MouseEvent) => {
    if (e && e.button === 1) {
      e.preventDefault();
    }
    setIsDrawing(false);
    setIsDraggingRef(false);
    setIsMiddleDragging(false);
    setSelectionStart(null);
  };

  const handleCanvasMouseLeave = () => {
    handleCanvasMouseUp();
    setHoveredCell(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (tool !== "select") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale =
      Math.max(10, Math.floor(600 / Math.max(width, height))) * zoom;
    const gridX = Math.floor(
      ((e.clientX - rect.left) * (canvas.width / rect.width)) / scale,
    );
    const gridY = Math.floor(
      ((e.clientY - rect.top) * (canvas.height / rect.height)) / scale,
    );

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      const clickedPixel = grid[gridY][gridX];
      if (clickedPixel) {
        const newSelection = new Set<string>();
        grid.forEach((row, ry) => {
          row.forEach((p, rx) => {
            if (p && p.name === clickedPixel.name)
              newSelection.add(`${rx},${ry}`);
          });
        });
        setSelectedPixels(newSelection);
      }
    }
  };

  const openResizeModal = () => {
    setResizeWidth(width);
    setResizeHeight(height);
    setShowResizeModal(true);
  };

  const handleResize = () => {
    saveToHistory();
    const newGrid = Array(resizeHeight)
      .fill(null)
      .map(() => Array(resizeWidth).fill(null));
    for (let y = 0; y < Math.min(resizeHeight, height); y++) {
      for (let x = 0; x < Math.min(resizeWidth, width); x++) {
        if (grid[y] && grid[y][x]) newGrid[y][x] = grid[y][x];
      }
    }
    setGrid(newGrid);
    setWidth(resizeWidth);
    setHeight(resizeHeight);
    setShowResizeModal(false);
  };

  const handleColorRightClick = (e: React.MouseEvent, color: Color) => {
    e.preventDefault();
    if (selectedPixels.size > 0) {
      saveToHistory();
      const newGrid = grid.map((row) => [...row]);
      let changed = false;
      selectedPixels.forEach((coord) => {
        const [x, y] = coord.split(",").map(Number);
        if (
          x >= 0 &&
          x < width &&
          y >= 0 &&
          y < height &&
          newGrid[y][x]?.id !== color.id
        ) {
          newGrid[y][x] = color;
          changed = true;
        }
      });
      if (changed) setGrid(newGrid);
    }
  };

  const handleSave = async () => {
    const payload = {
      id: currentWorkId || undefined,
      name: workName,
      width,
      height,
      data: grid,
    };
    try {
      const data = await window.electronAPI.saveWork(payload);
      if (data.id) setCurrentWorkId(data.id);
      setToast({ message: t("editor.save_success"), type: "success" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setToast({
        message: `${t("editor.save_failed")}: ${errorMessage}`,
        type: "error",
      });
      console.error(err);
    }
  };

  const handleExport = () => {
    if (!grid.length) return;

    // Create a temporary canvas for high-res export
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const exportScale = 40; // High resolution
    canvas.width = width * exportScale;
    canvas.height = height * exportScale;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Pixels
    grid.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          const px = x * exportScale;
          const py = y * exportScale;

          ctx.fillStyle = pixel.hex;
          ctx.fillRect(px, py, exportScale, exportScale);

          // Draw Grid
          if (showGrid) {
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, exportScale, exportScale);
          }

          // Draw Text
          ctx.fillStyle = getContrastColor(pixel.hex);
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            pixel.name,
            px + exportScale / 2,
            py + exportScale / 2,
            exportScale - 2,
          );
        }
      });
    });

    // Draw Tiled Diagonal Watermark
    if (settings.showWatermark) {
      const wmCanvas = document.createElement("canvas");
      const wmSize = 400; // Larger for export
      wmCanvas.width = wmSize;
      wmCanvas.height = wmSize;
      const wmCtx = wmCanvas.getContext("2d");
      if (wmCtx) {
        wmCtx.translate(wmSize / 2, wmSize / 2);
        wmCtx.rotate(-Math.PI / 6);
        wmCtx.fillStyle = `${settings.watermarkColor}40`; // 0.25 opacity in hex
        wmCtx.font = "bold 36px sans-serif";
        wmCtx.textAlign = "center";
        wmCtx.shadowColor = "rgba(255, 255, 255, 0.8)";
        wmCtx.shadowBlur = 4;
        wmCtx.fillText(`豆拼-周一地铺${settings.watermarkSuffix}`, 0, 0);

        const pattern = ctx.createPattern(wmCanvas, "repeat");
        if (pattern) {
          ctx.save();
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    }

    const link = document.createElement("a");
    link.download = `${workName || t("editor.unnamed")}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const loadWorks = async () => {
    try {
      const data = await window.electronAPI.getWorks();
      setWorks(data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setRefImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-950" : "h-full"} flex flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-gray-950`}
    >
      {/* Toolbar - Top (Mobile) or Left (Desktop) */}
      {!isFullscreen && (
        <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                {t("editor.tools_title")}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewModal(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title={t("editor.new")}
                >
                  <PlusSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 text-primary hover:bg-primary-light rounded transition-colors"
                  title={t("common.save")}
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title={t("common.export")}
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={loadWorks}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title={t("editor.history")}
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100 transition-all"
              placeholder={t("editor.work_name")}
            />

            {/* Tools */}
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <button
                onClick={() => setTool("pen")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all ${tool === "pen" ? "bg-white dark:bg-gray-700 shadow text-primary font-bold" : "text-gray-500 dark:text-gray-400"}`}
              >
                <PenTool className="w-4 h-4" /> {t("editor.pen")}
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all ${tool === "eraser" ? "bg-white dark:bg-gray-700 shadow text-primary font-bold" : "text-gray-500 dark:text-gray-400"}`}
              >
                <Eraser className="w-4 h-4" /> {t("editor.eraser")}
              </button>
              <button
                onClick={() => setTool("picker")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all ${tool === "picker" ? "bg-white dark:bg-gray-700 shadow text-primary font-bold" : "text-gray-500 dark:text-gray-400"}`}
              >
                <Pipette className="w-4 h-4" /> {t("editor.picker")}
              </button>
              <button
                onClick={() => setTool("select")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all ${tool === "select" ? "bg-white dark:bg-gray-700 shadow text-primary font-bold" : "text-gray-500 dark:text-gray-400"}`}
              >
                <MousePointer2 className="w-4 h-4" /> {t("editor.select")}
              </button>
              <button
                onClick={() => setTool("move_ref")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all ${tool === "move_ref" ? "bg-white dark:bg-gray-700 shadow text-primary font-bold" : "text-gray-500 dark:text-gray-400"}`}
                title={t("editor.move")}
              >
                <Move className="w-4 h-4" /> {t("editor.move")}
              </button>
            </div>
          </div>

          {/* Palette */}
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索颜色... (Cmd/Ctrl + F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3 mb-4">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full select-custom"
              >
                <option value="">全部品牌</option>
                {brands.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.name}
                  </option>
                ))}
              </select>

              {brands.find((b) => b.value === selectedBrand)?.sets && (
                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  className="w-full select-custom"
                >
                  {brands
                    .find((b) => b.value === selectedBrand)
                    ?.sets?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2 px-1">
              {colors
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    onContextMenu={(e) => handleColorRightClick(e, c)}
                    className={`w-full aspect-square rounded-md border-2 relative overflow-hidden group ${selectedColor?.id === c.id ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none"
                      style={{
                        color: getContrastColor(c.hex),
                        opacity: 0.7,
                      }}
                    >
                      {c.name}
                    </div>
                    {selectedColor?.id === c.id && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm ring-1 ring-white" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Palette (Fullscreen) */}
      {isFullscreen && (
        <div
          style={{ left: palettePosition.x, top: palettePosition.y }}
          className={`fixed bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col z-[60] ${
            isDragging ? "" : "transition-[width,height] duration-300"
          } ${isExpanded ? "w-80" : "w-36"}`}
        >
          {/* Header */}
          <div
            onMouseDown={handleDragStart}
            className="p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg flex justify-between items-center cursor-move select-none"
          >
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <Move className="w-4 h-4" />
              <span>工具箱</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded text-gray-600"
              title={isExpanded ? "收起" : "展开"}
            >
              {isExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Tools */}
          <div className="p-3 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => setTool("pen")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${tool === "pen" ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"}`}
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${tool === "eraser" ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"}`}
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool("picker")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${tool === "picker" ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"}`}
            >
              <Pipette className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool("select")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${tool === "select" ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"}`}
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool("move_ref")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded ${tool === "move_ref" ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"}`}
              title="移动参考图"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* Palette Content */}
          <div className="p-3 overflow-y-auto max-h-[60vh]">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef} // We can reuse the ref or create a new one, but for simplicity reusing it might focus the desktop one which is hidden if fullscreen.
                // Actually if we are in fullscreen, the desktop sidebar is hidden.
                // The floating palette has its own search input.
                // We should probably share the state but maybe different refs?
                // Or just use the same state and let the user focus whichever is visible.
                // The shortcut focuses `searchInputRef`.
                // Let's create a separate ref for fullscreen palette search or handle it smartly.
                // For now let's just use the same state. The shortcut logic might need adjustment if we want to focus the visible one.
                // Let's keep it simple: if fullscreen, focus this input?
                // The current implementation of `searchInputRef` is attached to the desktop input.
                // If we are in fullscreen, that input is not rendered (see `!isFullscreen &&`).
                // So `searchInputRef.current` would be null if we attach it there.
                // Wait, `!isFullscreen` wraps the desktop toolbar.
                // So in fullscreen, we need to attach the ref to the floating palette's input.
                // But React refs can only be attached to one element at a time if passed directly.
                // Since only one is visible at a time, we can pass the same ref to both inputs!
                type="text"
                placeholder="搜索颜色..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Selectors */}
            <div className="space-y-3 mb-4">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md"
              >
                <option value="">全部品牌</option>
                {brands.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.name}
                  </option>
                ))}
              </select>

              {brands.find((b) => b.value === selectedBrand)?.sets && (
                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-md"
                >
                  {brands
                    .find((b) => b.value === selectedBrand)
                    ?.sets?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Colors */}
            <div
              className={`grid gap-2 ${isExpanded ? "grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8" : "grid-cols-2"}`}
            >
              {colors
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    className={`w-full aspect-square rounded-md border-2 relative overflow-hidden group ${selectedColor?.id === c.id ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none"
                      style={{
                        color: getContrastColor(c.hex),
                        opacity: 0.7,
                      }}
                    >
                      {c.name}
                    </div>
                    {selectedColor?.id === c.id && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm ring-1 ring-white" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-950 relative overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>
                {t("editor.size")}: {width} x {height}
              </span>
              <button
                onClick={openResizeModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 transition-colors"
                title={t("editor.size")}
              >
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {t("editor.current_color")}:
              </span>
              {selectedColor ? (
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span className="font-bold text-primary">
                    {selectedColor.id}
                  </span>
                </div>
              ) : (
                <span className="font-mono text-gray-400">--</span>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(5, zoom + 0.2))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }
                }}
                className={`p-1 rounded transition-all ${refImage ? "bg-primary-light text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"}`}
                title={t("editor.upload_ref")}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              {refImage && (
                <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-2">
                  <button
                    onClick={() => setShowFloatingRef(!showFloatingRef)}
                    className={`p-1 rounded transition-all ${showFloatingRef ? "bg-primary-light text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"}`}
                    title={showFloatingRef ? "切换回画布层" : "切换为悬浮窗"}
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={refOpacity}
                    onChange={(e) => setRefOpacity(parseFloat(e.target.value))}
                    className="w-16 accent-primary"
                    title={t("editor.ref_opacity")}
                  />
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={refRotation}
                    onChange={(e) => setRefRotation(parseInt(e.target.value))}
                    className="w-16 accent-primary"
                    title="旋转"
                  />
                  <span className="text-[10px] text-gray-400 w-8 text-right font-mono">
                    {refRotation}°
                  </span>
                  <button
                    onClick={() => {
                      setRefImagePos({ x: 0, y: 0 });
                      setRefRotation(0);
                      setRefScale(1);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                    title={t("editor.reset_pos")}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setRefImage(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"
                    title={t("editor.clear_ref")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded transition-all ${showGrid ? "bg-primary-light text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
              title={t("converter.show_grid")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNames(!showNames)}
              className={`p-2 rounded transition-all ${showNames ? "bg-primary-light text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
              title={t("editor.show_names")}
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded transition-all ${isFullscreen ? "bg-primary-light text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
              title={
                isFullscreen
                  ? t("converter.exit_fullscreen")
                  : t("editor.fullscreen_mode")
              }
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 transition-colors"
              title={t("editor.shortcuts")}
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Scroll Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-gray-200/50 dark:bg-gray-900/50 relative custom-scrollbar"
        >
          <div className="min-w-[200%] min-h-[200%] flex items-center justify-center p-[50vh]">
            <div className="shadow-2xl bg-white dark:bg-gray-800 relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                onDoubleClick={handleCanvasDoubleClick}
                onContextMenu={(e) => e.preventDefault()}
                className="block relative z-10"
                style={{
                  cursor: isMiddleDragging
                    ? "grabbing"
                    : tool === "eraser"
                      ? "cell"
                      : tool === "picker"
                        ? "crosshair"
                        : tool === "select"
                          ? "default"
                          : tool === "move_ref"
                            ? "move"
                            : "crosshair",
                }}
              />
              {refImage && !showFloatingRef && (
                <img
                  src={refImage}
                  alt="Reference"
                  className="absolute w-full h-full object-fill pointer-events-none z-20"
                  style={{
                    opacity: refOpacity,
                    left: refImagePos.x,
                    top: refImagePos.y,
                    transform: `rotate(${refRotation}deg) scale(${refScale})`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Reference Window */}
      {showFloatingRef && refImage && (
        <FloatingWindow
          image={refImage}
          onClose={() => setShowFloatingRef(false)}
        />
      )}

      {/* Toast Message */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 ease-out animate-pulse">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* New Canvas Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">
              新建画布
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  宽度 (格)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  高度 (格)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    createGrid(width, height);
                    setShowNewModal(false);
                  }}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resize Modal */}
      {showResizeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">
              修改画布尺寸
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  宽度 (格)
                </label>
                <input
                  type="number"
                  value={resizeWidth}
                  onChange={(e) =>
                    setResizeWidth(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  高度 (格)
                </label>
                <input
                  type="number"
                  value={resizeHeight}
                  onChange={(e) =>
                    setResizeHeight(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                注意：缩小画布可能会裁剪掉部分内容。
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowResizeModal(false)}
                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleResize}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
                >
                  确认修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-gray-100">作品历史</h3>
              <button onClick={() => setShowHistoryModal(false)}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {works.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无历史作品</p>
              ) : (
                works.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 group transition-colors"
                  >
                    <div>
                      <div className="font-medium dark:text-gray-200">
                        {work.name || "未命名"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(work.created_at).toLocaleString()} |{" "}
                        {work.width}x{work.height}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoadWork(work.id)}
                        className="px-3 py-1 text-xs bg-primary-light text-primary rounded hover:opacity-90"
                      >
                        加载
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[450px] shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold dark:text-gray-100">
                  快捷键说明
                </h3>
              </div>
              <button onClick={() => setShowShortcutsModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { key: "P", label: "画笔工具" },
                  { key: "E", label: "橡皮擦工具" },
                  { key: "I", label: "吸色工具" },
                  { key: "S", label: "框选工具" },
                  { key: "M", label: "移动参考图" },
                  { key: "G", label: "切换网格" },
                  { key: "N", label: "切换色号" },
                  { key: "F", label: "全屏模式" },
                  { key: "Ctrl + S", label: "保存作品" },
                  { key: "Ctrl + Z", label: "撤销" },
                  { key: "Ctrl + Y", label: "重做" },
                  { key: "空格 + 拖拽", label: "移动画布" },
                  { key: "滚轮", label: "缩放画布" },
                  { key: "中键拖拽", label: "移动画布" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.label}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono dark:text-gray-300">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full mt-8 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageConfig.title}
        message={messageConfig.message}
        type={messageConfig.type}
      />
    </div>
  );
}
