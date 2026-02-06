import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { processImage, PixelData } from "../utils/imageProcessor";
import { Color } from "../utils/colorUtils";
import { useSettings } from "../contexts/SettingsContext";
import {
  Upload,
  Settings,
  Download,
  Palette,
  Grid,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Save,
  PenTool,
  Image as ImageIcon,
  RotateCcw,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { SaveModal } from "../components/SaveModal";
import { MessageModal } from "../components/MessageModal";

interface Brand {
  name: string;
  value: string;
  sets?: { name: string; id: string }[];
}

// Circular Slider Component Removed

export function Converter() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [colors, setColors] = useState<Color[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("MARD");
  const [selectedSet, setSelectedSet] = useState<string>("full-221");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 参数状态
  const [targetWidth, setTargetWidth] = useState<number>(50);
  const [dithering, setDithering] = useState<boolean>(true);
  const [ditheringStrength, setDitheringStrength] = useState<number>(0.75);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [colorMergeThreshold, setColorMergeThreshold] = useState<number>(30);

  const [resultGrid, setResultGrid] = useState<PixelData[][] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 参考图状态
  const [showReference, setShowReference] = useState(false);
  const [referenceOpacity, setReferenceOpacity] = useState(0.5);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // 对齐状态接口
  interface AlignmentState {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }

  // 对齐状态 (x, y, scale, rotation)
  const [alignment, setAlignment] = useState<AlignmentState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });
  const [alignmentMode, setAlignmentMode] = useState<"image" | "grid">("image");

  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (selectedImage) {
      const img = new Image();
      img.src = selectedImage;
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
    }
  }, [selectedImage]);

  // 视图控制状态
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [highlightColor, setHighlightColor] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // 统计用量
  const [stats, setStats] = useState<
    Map<string, { color: Color; count: number }>
  >(new Map());

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    title: "",
    message: "",
    type: "info",
  });

  // 加载品牌数据
  useEffect(() => {
    window.electronAPI
      .getBrands()
      .then((data) => {
        setBrands(data);
      })
      .catch((err) => {
        console.error("Failed to load brands:", err);
      });
  }, []);

  // Update default set when brand changes
  useEffect(() => {
    if (brands.length === 0) return;

    const brand = brands.find((b) => b.value === selectedBrand);
    if (brand?.sets && brand.sets.length > 0) {
      // Keep current set if valid, otherwise reset to first
      const currentSetValid = brand.sets.some((s) => s.id === selectedSet);
      if (!currentSetValid) {
        setSelectedSet(brand.sets[0].id);
      }
    } else {
      setSelectedSet("");
    }
  }, [selectedBrand, brands, selectedSet]);

  // 加载色卡数据
  useEffect(() => {
    window.electronAPI
      .getColors(selectedBrand || undefined, selectedSet || undefined)
      .then((data) => setColors(data))
      .catch((err) => {
        console.error("Failed to load colors:", err);
      });
  }, [selectedBrand, selectedSet]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setReferenceImage(null); // Reset custom reference when new image uploaded
        setResultGrid(null); // Reset result
        setAlignment({ x: 0, y: 0, scale: 1, rotation: 0 }); // Reset alignment
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
        setShowReference(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage || colors.length === 0) return;

    setIsProcessing(true);
    try {
      // 预处理图片：应用对齐参数
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 计算目标高度（与预览保持一致，确保格数正确）
      const aspectRatio = img.width / img.height;
      const calculatedTargetHeight = Math.round(targetWidth / aspectRatio);

      // 使用目标尺寸的整数倍作为中间 canvas 尺寸，避免采样误差
      const scaleFactor = 10;
      const canvasWidth = targetWidth * scaleFactor;
      const canvasHeight = calculatedTargetHeight * scaleFactor;

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // 填充白色背景
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 应用变换
        // 变换中心应该是 Canvas 中心
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.translate(cx, cy);
        ctx.translate(
          alignment.x * (canvas.width / 500),
          alignment.y * (canvas.width / 500),
        ); // 缩放偏移量以匹配 Canvas 大小
        ctx.scale(alignment.scale, alignment.scale);
        ctx.rotate((alignment.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);

        // 为了保证填满，需要计算绘制图片的尺寸
        // 预览中我们使用了 width: 500 * displayScale
        // 这里我们要画在 canvasWidth * canvasHeight 的画布上
        // 原始逻辑 drawImage(img, 0, 0, width, height) 是拉伸图片填满画布
        // 这与预览逻辑一致（预览也是填满对齐框）
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const processedImage = canvas.toDataURL("image/png");

      setTimeout(async () => {
        const grid = await processImage(processedImage, {
          targetWidth,
          targetHeight: calculatedTargetHeight,
          palette: colors,
          dithering,
          ditheringStrength,
          brightness,
          contrast,
          saturation,
          colorMergeThreshold,
        });
        setResultGrid(grid);

        // 计算统计
        const newStats = new Map<string, { color: Color; count: number }>();
        grid.forEach((row) => {
          row.forEach((pixel) => {
            const key = pixel.color.id;
            if (!newStats.has(key)) {
              newStats.set(key, { color: pixel.color, count: 0 });
            }
            newStats.get(key)!.count++;
          });
        });
        setStats(newStats);

        setIsProcessing(false);
      }, 100);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  // Helper: Determine text color based on background brightness
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  const handleExport = () => {
    if (!resultGrid) return;

    // Create a temporary canvas for high-res export
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const height = resultGrid.length;
    const width = resultGrid[0].length;
    const exportScale = 40; // Force a large scale for export to ensure text visibility

    canvas.width = width * exportScale;
    canvas.height = height * exportScale;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Pixels and Text
    resultGrid.forEach((row, y) => {
      row.forEach((pixel, x) => {
        const px = x * exportScale;
        const py = y * exportScale;

        // Draw pixel color
        ctx.fillStyle = pixel.color.hex;
        ctx.fillRect(px, py, exportScale, exportScale);

        // Draw Grid
        if (showGrid) {
          ctx.strokeStyle = "rgba(0,0,0,0.2)"; // Slightly darker for export
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, exportScale, exportScale);
        }

        // Always draw text in export
        ctx.fillStyle = getContrastColor(pixel.color.hex);
        ctx.font = "bold 10px sans-serif"; // Adjust size as needed
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Wrap text if needed or just draw centered
        // Using name as requested
        ctx.fillText(
          pixel.color.name,
          px + exportScale / 2,
          py + exportScale / 2,
          exportScale - 2, // Max width
        );
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
        wmCtx.fillStyle = `${settings.watermarkColor}40`; // 0.25 opacity
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
    link.download = `pixel-art-full-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 绘制结果到 Canvas
  useEffect(() => {
    if (resultGrid && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const height = resultGrid.length;
      const width = resultGrid[0].length;

      // Calculate base scale to fit in view, then apply zoom
      // Use window dimensions if fullscreen, otherwise default container size
      // We can use windowSize state to ensure re-calculation on resize
      const availableWidth = isFullscreen ? windowSize.width - 40 : 600;
      const availableHeight = isFullscreen
        ? windowSize.height - 100
        : windowSize.height * 0.6;

      const baseScale = Math.max(
        10,
        Math.min(
          Math.floor(availableWidth / width),
          Math.floor(availableHeight / height),
        ),
      );
      const scale = baseScale * zoom;

      canvas.width = width * scale;
      canvas.height = height * scale;

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Pixels
      resultGrid.forEach((row, y) => {
        row.forEach((pixel, x) => {
          const px = x * scale;
          const py = y * scale;

          const isHighlighted =
            highlightColor && pixel.color.hex === highlightColor;
          const isDimmed = highlightColor && pixel.color.hex !== highlightColor;

          ctx.fillStyle = pixel.color.hex;
          // Apply dimming if needed
          if (isDimmed) {
            ctx.globalAlpha = 0.2;
          } else {
            ctx.globalAlpha = 1.0;
          }

          ctx.fillRect(px, py, scale, scale);
          ctx.globalAlpha = 1.0; // Reset alpha

          // Highlighting border
          if (isHighlighted) {
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, scale, scale);
          } else if (showGrid) {
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, scale, scale);
          }

          // Draw color name if scale is large enough or highlighted
          if (scale >= 25 || isHighlighted) {
            // Threshold for showing text
            ctx.fillStyle = getContrastColor(pixel.color.hex);
            if (isDimmed) ctx.fillStyle = "rgba(0,0,0,0.2)"; // Fade text too if dimmed

            // Adjust font size based on scale
            const fontSize = Math.max(8, Math.floor(scale / 3));
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
              pixel.color.name,
              px + scale / 2,
              py + scale / 2,
              scale - 2,
            );
          }
        });
      });

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
          wmCtx.fillStyle = `${settings.watermarkColor}26`; // 0.15 opacity
          const fontSize = Math.max(16, Math.floor(scale / 1.0));
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
    }
  }, [resultGrid, showGrid, zoom, highlightColor, isFullscreen, settings]);

  // Handle canvas click for color selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!resultGrid || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = resultGrid[0].length;
    const height = resultGrid.length;

    // Recalculate scale logic to match drawing logic
    const availableWidth = isFullscreen ? window.innerWidth - 40 : 600;
    const availableHeight = isFullscreen
      ? window.innerHeight - 100
      : window.innerHeight * 0.6;

    const baseScale = Math.max(
      10,
      Math.min(
        Math.floor(availableWidth / width),
        Math.floor(availableHeight / height),
      ),
    );
    const scale = baseScale * zoom;

    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);

    if (
      gridY >= 0 &&
      gridY < resultGrid.length &&
      gridX >= 0 &&
      gridX < resultGrid[0].length
    ) {
      const clickedColor = resultGrid[gridY][gridX].color.hex;
      if (highlightColor === clickedColor) {
        setHighlightColor(null); // Toggle off
      } else {
        setHighlightColor(clickedColor);
      }
    } else {
      setHighlightColor(null); // Click outside grid clears selection
    }
  };

  // Handle scroll for zoom (Fix passive listener issue)
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.min(Math.max(0.1, prev * delta), 5));
      }
    };

    // 中键拖拽逻辑
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        // Middle mouse button
        e.preventDefault();
        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
        container.style.cursor = "grabbing";
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - startX;
      const y = e.pageY - startY;
      container.scrollLeft = scrollLeft - x;
      container.scrollTop = scrollTop - y;
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = "";
    };

    // Add non-passive listener to allow preventDefault
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // 对齐预览交互逻辑
  const alignmentContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 500,
    height: 500,
  });

  useEffect(() => {
    if (alignmentContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerSize({ width, height });
        }
      });
      resizeObserver.observe(alignmentContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // 计算动态基准尺寸
  // 我们希望取景框尽可能大，但不超过容器大小，并保留一定 padding
  const previewPadding = 40;
  const availablePreviewWidth = Math.max(
    100,
    containerSize.width - previewPadding,
  );
  const availablePreviewHeight = Math.max(
    100,
    containerSize.height - previewPadding,
  );

  // 计算适应容器的缩放比例
  const displayScale = Math.min(
    availablePreviewWidth / 500,
    availablePreviewHeight / (500 / aspectRatio),
  );

  const displayScaleRef = useRef(displayScale);
  useEffect(() => {
    displayScaleRef.current = displayScale;
  }, [displayScale]);

  // Fix stale closure in alignment interaction by using refs or functional updates purely
  // Re-implementing alignment interaction with refs for mutable state during drag
  const alignmentStateRef = useRef<AlignmentState>(alignment);
  useEffect(() => {
    alignmentStateRef.current = alignment;
  }, [alignment]);

  // Use ref for alignmentMode to avoid stale closures in event handlers
  const alignmentModeRef = useRef(alignmentMode);
  useEffect(() => {
    alignmentModeRef.current = alignmentMode;
  }, [alignmentMode]);

  useEffect(() => {
    const container = alignmentContainerRef.current;
    if (!container || !selectedImage || resultGrid) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Always use current mode from ref
      if (alignmentModeRef.current === "grid") {
        // 网格模式：仅修改 targetWidth，不影响 alignment.scale
        const delta = e.deltaY > 0 ? -1 : 1;
        setTargetWidth((prev) => Math.min(150, Math.max(20, prev + delta)));
      } else {
        // 图片模式：仅修改 alignment.scale，不影响 targetWidth
        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        setAlignment((prev) => ({
          ...prev,
          scale: Math.max(0.1, Math.min(5, prev.scale * delta)),
        }));
      }
    };

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // 如果点击的是交互元素（如滑块、按钮），则不触发拖拽
      const target = e.target as HTMLElement;
      if (target.closest("input") || target.closest("button")) {
        return;
      }

      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = alignmentStateRef.current.x;
      initialY = alignmentStateRef.current.y;
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const scale = displayScaleRef.current;
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      // 在网格模式下，移动操作是反向的：网格向右 = 图片向左
      const multiplier = alignmentModeRef.current === "grid" ? -1 : 1;

      setAlignment((prev) => ({
        ...prev,
        x: initialX + dx * multiplier,
        y: initialY + dy * multiplier,
      }));
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selectedImage, resultGrid]); // Removed alignmentMode dependency as we use ref

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (highlightColor) {
          setHighlightColor(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, highlightColor]);

  const handleSave = () => {
    if (!resultGrid) return;
    setShowSaveModal(true);
  };

  const handleEdit = async () => {
    if (!resultGrid) return;

    const width = resultGrid[0].length;
    const height = resultGrid.length;
    const gridData = resultGrid.map((row) => row.map((pixel) => pixel.color));

    const defaultName = `图纸转绘 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const payload = {
      name: defaultName,
      width,
      height,
      data: gridData,
    };

    try {
      setIsProcessing(true);
      const data = await window.electronAPI.saveWork(payload);
      setToast({
        message: t("converter.save_success_nav"),
        type: "success",
      });
      setTimeout(() => {
        navigate(`/editor?id=${data.id}`, {
          state: {
            refImage: referenceImage || selectedImage,
            refX: alignment.x,
            refY: alignment.y,
            refScale: alignment.scale,
            refRotation: alignment.rotation,
          },
        });
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setToast({
        message: `${t("common.error")}: ${errorMessage}`,
        type: "error",
      });
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = async (name: string) => {
    if (!resultGrid) return;

    const width = resultGrid[0].length;
    const height = resultGrid.length;
    const gridData = resultGrid.map((row) => row.map((pixel) => pixel.color));

    const payload = {
      name,
      width,
      height,
      data: gridData,
    };

    try {
      await window.electronAPI.saveWork(payload);
      setToast({
        message: t("converter.save_success"),
        type: "success",
      });
      setShowSaveModal(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setToast({
        message: `${t("common.error")}: ${errorMessage}`,
        type: "error",
      });
      console.error(err);
    }
  };

  // Toolbar Button Component
  const ToolbarButton = ({
    onClick,
    icon: Icon,
    label,
    active = false,
    variant = "default",
  }: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    active?: boolean;
    variant?: "default" | "primary" | "success" | "danger";
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-2 rounded-lg border transition-all flex items-center justify-center group relative ${
          active
            ? "bg-primary-light text-primary border-primary/20"
            : variant === "primary"
              ? "bg-primary text-white border-primary hover:opacity-90"
              : variant === "success"
                ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                : variant === "danger"
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                  : "text-gray-600 border-gray-200 hover:bg-gray-100"
        }`}
      >
        <Icon className="w-5 h-5" />
      </button>
      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[150] shadow-lg">
        {label}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden flex flex-col lg:flex-row p-6 gap-8 bg-gray-50 dark:bg-gray-950">
      {/* 左侧控制栏 */}
      <div className="w-full lg:w-96 space-y-6 overflow-y-auto flex-shrink-0 pr-2 custom-scrollbar">
        {/* 上传卡片 */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Upload className="w-5 h-5" />
            {t("converter.upload_title")}
          </h2>
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("converter.upload_hint")}
              </p>
            </div>
          </div>
          {selectedImage && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t("converter.preview_original")}
              </p>
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-48 object-contain rounded bg-gray-100 dark:bg-gray-800"
              />
            </div>
          )}
        </div>

        {/* 设置卡片 */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Settings className="w-5 h-5" />
            {t("converter.settings_title")}
          </h2>

          <div className="space-y-6">
            {/* 品牌选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("converter.brand")}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full select-custom"
              >
                <option value="">{t("converter.all_brands")}</option>
                {brands.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 套装选择 */}
            {brands.find((b) => b.value === selectedBrand)?.sets && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("converter.set")}
                </label>
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
              </div>
            )}

            {/* 基础设置 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("converter.target_width")}
                </label>
                <input
                  type="number"
                  min="20"
                  max="150"
                  value={targetWidth}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setTargetWidth(val);
                  }}
                  className="w-20 p-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary focus:border-primary text-center text-gray-900 dark:text-gray-100 outline-none"
                />
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={targetWidth}
                onChange={(e) => setTargetWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* 图像调整 */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <Sliders className="w-4 h-4" /> {t("converter.image_enhance")}
              </h3>

              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t("converter.brightness")}</span>
                  <span>
                    {brightness > 0 ? "+" : ""}
                    {brightness}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t("converter.contrast")}</span>
                  <span>
                    {contrast > 0 ? "+" : ""}
                    {contrast}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t("converter.saturation")}</span>
                  <span>
                    {saturation > 0 ? "+" : ""}
                    {saturation}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t("converter.color_merge_threshold")}</span>
                  <span>{colorMergeThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={colorMergeThreshold}
                  onChange={(e) =>
                    setColorMergeThreshold(Number(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* 抖动设置 */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("converter.dithering")}
                </label>
                <input
                  type="checkbox"
                  checked={dithering}
                  onChange={(e) => setDithering(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {dithering && (
                <div className="ml-2 pl-2 border-l-2 border-primary-light">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t("converter.dithering_strength")}</span>
                    <span>{Math.round(ditheringStrength * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ditheringStrength}
                    onChange={(e) =>
                      setDitheringStrength(Number(e.target.value))
                    }
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {t("converter.dithering_hint")}
                  </p>
                </div>
              )}
            </div>

            {/* 参考图设置 */}
            {resultGrid && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> 参考图叠加
                  </h3>
                  <input
                    type="checkbox"
                    checked={showReference}
                    onChange={(e) => setShowReference(e.target.checked)}
                    className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {showReference && (
                  <div className="ml-2 pl-2 border-l-2 border-primary-light space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>透明度</span>
                        <span>{Math.round(referenceOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={referenceOpacity}
                        onChange={(e) =>
                          setReferenceOpacity(Number(e.target.value))
                        }
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReferenceUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button className="w-full py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
                          {referenceImage ? "更换参考图" : "上传自定义参考图"}
                        </button>
                      </div>
                      {referenceImage && (
                        <button
                          onClick={() => setReferenceImage(null)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="重置为原图"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      默认使用左侧上传的原图作为参考
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!selectedImage || isProcessing}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all mt-4
                ${
                  !selectedImage || isProcessing
                    ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500"
                    : "bg-primary hover:opacity-90 shadow-md hover:shadow-lg"
                }`}
            >
              {isProcessing
                ? t("converter.processing")
                : t("converter.process_button")}
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        {resultGrid && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Palette className="w-5 h-5" />
              {t("converter.stats_title")}
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from(stats.values())
                .sort((a, b) => b.count - a.count)
                .map(({ color, count }) => (
                  <div
                    key={color.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {color.id} {color.name}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-mono">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold text-gray-800 dark:text-gray-200">
              <span>{t("converter.total")}</span>
              <span>
                {Array.from(stats.values()).reduce(
                  (acc, curr) => acc + curr.count,
                  0,
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 右侧展示区 */}
      <div
        className={`flex-1 min-w-0 ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-950 p-4 overflow-auto flex flex-col" : "flex flex-col overflow-hidden"}`}
      >
        <div
          className={`bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col overflow-hidden ${isFullscreen ? "h-full border-0 shadow-none p-0" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Grid className="w-5 h-5" />
              {t("converter.preview_title")}
            </h2>
            {resultGrid && (
              <div className="flex flex-wrap gap-2 items-center">
                {/* 缩放控制 */}
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden mr-2 bg-white dark:bg-gray-800">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title={t("converter.zoom_out")}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="px-2 text-sm min-w-[3em] text-center font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title={t("converter.zoom_in")}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                <ToolbarButton
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  icon={isFullscreen ? Minimize : Maximize}
                  label={
                    isFullscreen
                      ? t("converter.exit_fullscreen")
                      : t("converter.fullscreen")
                  }
                />

                <ToolbarButton
                  onClick={() => setShowGrid(!showGrid)}
                  icon={Grid}
                  label={
                    showGrid
                      ? t("converter.hide_grid")
                      : t("converter.show_grid")
                  }
                  active={showGrid}
                />

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                <ToolbarButton
                  onClick={handleEdit}
                  icon={PenTool}
                  label={t("converter.go_to_editor")}
                  variant="primary"
                />

                <ToolbarButton
                  onClick={handleSave}
                  icon={Save}
                  label={t("converter.save_work")}
                  variant="success"
                />

                <ToolbarButton
                  onClick={handleExport}
                  icon={Download}
                  label={t("converter.export_image")}
                  variant="default"
                />

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                <ToolbarButton
                  onClick={() => {
                    setResultGrid(null);
                    setStats(new Map());
                  }}
                  icon={Trash2}
                  label={t("common.clear")}
                  variant="danger"
                />
              </div>
            )}
          </div>

          <div
            ref={resultGrid ? previewContainerRef : alignmentContainerRef}
            className={`flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-800 min-h-[500px] ${isFullscreen ? "h-full" : ""} relative overflow-hidden`}
          >
            {resultGrid ? (
              <div className="relative inline-block">
                {/* 参考图层 */}
                {showReference && (selectedImage || referenceImage) && (
                  <img
                    src={referenceImage || selectedImage || ""}
                    alt="Reference"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
                    style={{ opacity: referenceOpacity }}
                  />
                )}

                {/* 像素画 Canvas */}
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-none shadow-lg bg-white dark:bg-gray-800 cursor-crosshair relative z-10"
                />
              </div>
            ) : selectedImage ? (
              <div
                ref={alignmentContainerRef}
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
              >
                {/* 对齐预览模式 */}
                <div
                  className="relative pointer-events-none transition-transform duration-100 ease-out origin-center"
                  style={{
                    transform: `translate(${alignment.x * displayScale}px, ${alignment.y * displayScale}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                    transformOrigin: "center",
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Alignment Preview"
                    style={{
                      width: 500 * displayScale,
                      height: (500 / aspectRatio) * displayScale,
                      pointerEvents: "none",
                    }}
                    className="object-fill shadow-lg"
                  />
                </div>

                {/* 覆盖网格 */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-50 flex items-center justify-center">
                  {/* 我们绘制一个固定大小的网格框来模拟取景框 */}
                  <div
                    className="border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-100 ease-out"
                    style={{
                      width: 500 * displayScale,
                      height: (500 / aspectRatio) * displayScale,
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                      backgroundSize: `${(500 / targetWidth) * displayScale}px ${(500 / targetWidth) * displayScale}px`,
                    }}
                  />
                </div>

                <div className="absolute bottom-4 bg-black/70 text-white px-1 py-1 rounded-full text-sm pointer-events-auto z-20 flex items-center gap-1">
                  <button
                    onClick={() => setAlignmentMode("image")}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${
                      alignmentMode === "image"
                        ? "bg-primary text-white"
                        : "hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    移动图片
                  </button>
                  <button
                    onClick={() => setAlignmentMode("grid")}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${
                      alignmentMode === "grid"
                        ? "bg-primary text-white"
                        : "hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    移动网格
                  </button>

                  {/* 分隔线 */}
                  <div className="w-px h-4 bg-white/20 mx-1" />

                  {/* 旋转控制 - Range Slider */}
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                      ROT
                    </span>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={alignment.rotation}
                      onChange={(e) =>
                        setAlignment((prev) => ({
                          ...prev,
                          rotation: Number(e.target.value),
                        }))
                      }
                      className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-xs text-gray-200 font-mono w-9 text-right">
                      {alignment.rotation}°
                    </span>

                    {alignment.rotation !== 0 && (
                      <button
                        onClick={() =>
                          setAlignment((prev) => ({ ...prev, rotation: 0 }))
                        }
                        className="p-1 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        title="重置旋转"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-lg text-xs pointer-events-none z-20 backdrop-blur-sm">
                  {alignmentMode === "image"
                    ? "拖拽移动图片 / 滚轮缩放图片"
                    : "拖拽移动网格 / 滚轮调整网格数量"}
                </div>

                <button
                  onClick={() =>
                    setAlignment({ x: 0, y: 0, scale: 1, rotation: 0 })
                  }
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 pointer-events-auto z-30"
                  title="重置对齐"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Grid className="w-12 h-12 mb-2 opacity-20" />
                <p>{t("converter.empty_preview")}</p>
              </div>
            )}
          </div>

          {highlightColor && resultGrid && (
            <div className="mt-4 p-3 bg-primary-light border border-primary/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
              <div
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                style={{ backgroundColor: highlightColor }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("converter.selected_color")}:{" "}
                  {
                    resultGrid
                      .flat()
                      .find((p) => p.color.hex === highlightColor)?.color.name
                  }
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID:{" "}
                  {
                    resultGrid
                      .flat()
                      .find((p) => p.color.hex === highlightColor)?.color.id
                  }{" "}
                  | HEX: {highlightColor}
                </p>
              </div>
              <button
                onClick={() => setHighlightColor(null)}
                className="ml-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
              >
                {t("converter.clear_selection")}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleConfirmSave}
        initialName={`Pixel Art ${new Date().toLocaleDateString()}`}
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
}
