import { Color, findClosestColor } from "./colorUtils";

interface ProcessOptions {
  targetWidth: number; // 拼豆板的宽度（格数）
  targetHeight?: number; // 拼豆板的高度（格数）
  palette: Color[]; // 可用色卡
  dithering: boolean; // 是否开启抖动
  ditheringStrength?: number; // 抖动强度 (0.0 - 1.0)
  brightness?: number; // 亮度调整 (-100 to 100)
  contrast?: number; // 对比度调整 (-100 to 100)
  saturation?: number; // 饱和度调整 (-100 to 100)
  colorMergeThreshold?: number; // 颜色合并阈值
}

export interface PixelData {
  color: Color;
  originalRgb: [number, number, number];
}

// 辅助函数：限制 RGB 值范围
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// 辅助函数：计算 RGB 欧氏距离
function getRgbDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2),
  );
}

// 辅助函数：调整亮度、对比度、饱和度
function applyFilters(
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number,
  saturation: number,
): Uint8ClampedArray {
  const newData = new Uint8ClampedArray(data);

  // 预计算对比度因子
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < newData.length; i += 4) {
    let r = newData[i];
    let g = newData[i + 1];
    let b = newData[i + 2];

    // 1. 亮度 (Brightness)
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // 2. 对比度 (Contrast)
    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 3. 饱和度 (Saturation)
    if (saturation !== 0) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      const satMultiplier = 1 + saturation / 100;
      r = gray + (r - gray) * satMultiplier;
      g = gray + (g - gray) * satMultiplier;
      b = gray + (b - gray) * satMultiplier;
    }

    newData[i] = clamp(r);
    newData[i + 1] = clamp(g);
    newData[i + 2] = clamp(b);
    // Alpha remains unchanged
  }

  return newData;
}

export async function processImage(
  imageSource: string | HTMLImageElement,
  options: ProcessOptions,
): Promise<PixelData[][]> {
  const {
    targetWidth,
    targetHeight: providedHeight,
    palette,
    dithering,
    ditheringStrength = 0.8, // 默认 80% 抖动强度
    brightness = 0,
    contrast = 0,
    saturation = 0,
    colorMergeThreshold = 0,
  } = options;

  // 1. 加载图片
  let img: HTMLImageElement;
  if (typeof imageSource === "string") {
    img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSource;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  } else {
    img = imageSource;
  }

  // 2. 计算目标尺寸
  const aspectRatio = img.height / img.width;
  const targetHeight = providedHeight || Math.round(targetWidth * aspectRatio);

  // 3. 绘制到 Canvas 进行缩放
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // 使用 imageSmoothingEnabled = true (默认) 进行双线性插值，对于缩小图片通常效果较好
  // 如果想要像素风格，可以设为 false
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  // 4. 应用滤镜 (亮度/对比度/饱和度)
  if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
    imageData.data.set(
      applyFilters(imageData.data, brightness, contrast, saturation),
    );
  }

  // 4.5 颜色合并
  if (colorMergeThreshold > 0) {
    const data = imageData.data;
    const representativeColors: [number, number, number][] = [];

    for (let i = 0; i < data.length; i += 4) {
      // 忽略完全透明的像素
      if (data[i + 3] === 0) continue;

      const currentRgb: [number, number, number] = [
        data[i],
        data[i + 1],
        data[i + 2],
      ];

      // 寻找是否已有相似颜色
      let foundMatch = false;
      for (const refColor of representativeColors) {
        if (getRgbDistance(currentRgb, refColor) <= colorMergeThreshold) {
          data[i] = refColor[0];
          data[i + 1] = refColor[1];
          data[i + 2] = refColor[2];
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        representativeColors.push(currentRgb);
      }
    }
  }

  const data = imageData.data;
  const result: PixelData[][] = Array(targetHeight)
    .fill(null)
    .map(() => Array(targetWidth));

  // 5. 处理像素 (颜色匹配 + 抖动)
  const buffer: number[][][] = [];
  for (let y = 0; y < targetHeight; y++) {
    buffer[y] = [];
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      buffer[y][x] = [data[idx], data[idx + 1], data[idx + 2]];
    }
  }

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const oldRgb = buffer[y][x];

      const clampedRgb: [number, number, number] = [
        clamp(oldRgb[0]),
        clamp(oldRgb[1]),
        clamp(oldRgb[2]),
      ];

      // 找到最近的拼豆颜色
      const closestColor = findClosestColor(clampedRgb, palette);
      const newRgb = closestColor.rgb;

      result[y][x] = {
        color: closestColor,
        originalRgb: clampedRgb,
      };

      if (dithering) {
        const errR = (oldRgb[0] - newRgb[0]) * ditheringStrength;
        const errG = (oldRgb[1] - newRgb[1]) * ditheringStrength;
        const errB = (oldRgb[2] - newRgb[2]) * ditheringStrength;

        // Floyd-Steinberg Dithering
        distributeError(
          buffer,
          x + 1,
          y,
          errR,
          errG,
          errB,
          7 / 16,
          targetWidth,
          targetHeight,
        );
        distributeError(
          buffer,
          x - 1,
          y + 1,
          errR,
          errG,
          errB,
          3 / 16,
          targetWidth,
          targetHeight,
        );
        distributeError(
          buffer,
          x,
          y + 1,
          errR,
          errG,
          errB,
          5 / 16,
          targetWidth,
          targetHeight,
        );
        distributeError(
          buffer,
          x + 1,
          y + 1,
          errR,
          errG,
          errB,
          1 / 16,
          targetWidth,
          targetHeight,
        );
      }
    }
  }

  return result;
}

function distributeError(
  buffer: number[][][],
  x: number,
  y: number,
  errR: number,
  errG: number,
  errB: number,
  factor: number,
  width: number,
  height: number,
) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    buffer[y][x][0] += errR * factor;
    buffer[y][x][1] += errG * factor;
    buffer[y][x][2] += errB * factor;
  }
}
