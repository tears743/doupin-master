// 颜色转换和距离计算工具

export interface Color {
  id: string;
  brand: string;
  name: string;
  rgb: [number, number, number];
  hex: string;
}

// RGB to LAB conversion
// Based on: https://github.com/antimatter15/rgb-lab/blob/master/color.js

function rgb2lab(rgb: [number, number, number]): [number, number, number] {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255;
  let x, y, z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

// Delta E 94 implementation (Better than 76, faster than 2000)
// Formula source: http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE94.html
export function deltaE94(
  labA: [number, number, number],
  labB: [number, number, number],
): number {
  const [L1, a1, b1] = labA;
  const [L2, a2, b2] = labB;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;

  const dC = C1 - C2;
  const dH2 = da * da + db * db - dC * dC;
  const dH = dH2 > 0 ? Math.sqrt(dH2) : 0;

  const sL = 1;
  const sC = 1 + 0.045 * C1;
  const sH = 1 + 0.015 * C1;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  return Math.sqrt(
    Math.pow(dL / (kL * sL), 2) +
      Math.pow(dC / (kC * sC), 2) +
      Math.pow(dH / (kH * sH), 2),
  );
}

// CIEDE2000 implementation - More accurate than CIE94
export function deltaE2000(
  labA: [number, number, number],
  labB: [number, number, number],
): number {
  const [L1, a1, b1] = labA;
  const [L2, a2, b2] = labB;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));

  const a1_prime = (1 + G) * a1;
  const a2_prime = (1 + G) * a2;

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

  const h1_prime = (Math.atan2(b1, a1_prime) * 180) / Math.PI;
  const h2_prime = (Math.atan2(b2, a2_prime) * 180) / Math.PI;

  const H1_prime = h1_prime >= 0 ? h1_prime : h1_prime + 360;
  const H2_prime = h2_prime >= 0 ? h2_prime : h2_prime + 360;

  const dL_prime = L2 - L1;
  const dC_prime = C2_prime - C1_prime;
  
  let dH_prime = 0;
  if (C1_prime * C2_prime === 0) {
    dH_prime = 0;
  } else if (Math.abs(H2_prime - H1_prime) <= 180) {
    dH_prime = H2_prime - H1_prime;
  } else if (H2_prime - H1_prime > 180) {
    dH_prime = H2_prime - H1_prime - 360;
  } else {
    dH_prime = H2_prime - H1_prime + 360;
  }

  const dH_upper_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin((dH_prime * Math.PI / 180) / 2);

  const L_bar_prime = (L1 + L2) / 2;
  const C_bar_prime = (C1_prime + C2_prime) / 2;
  
  let H_bar_prime = 0;
  if (C1_prime * C2_prime === 0) {
    H_bar_prime = H1_prime + H2_prime;
  } else if (Math.abs(H1_prime - H2_prime) <= 180) {
    H_bar_prime = (H1_prime + H2_prime) / 2;
  } else if (H1_prime + H2_prime < 360) {
    H_bar_prime = (H1_prime + H2_prime + 360) / 2;
  } else {
    H_bar_prime = (H1_prime + H2_prime - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos(((H_bar_prime - 30) * Math.PI) / 180) + 0.24 * Math.cos(((2 * H_bar_prime) * Math.PI) / 180) + 0.32 * Math.cos(((3 * H_bar_prime + 6) * Math.PI) / 180) - 0.20 * Math.cos(((4 * H_bar_prime - 63) * Math.PI) / 180);

  const dTheta = 30 * Math.exp(-Math.pow((H_bar_prime - 275) / 25, 2));
  const R_C = 2 * Math.sqrt(Math.pow(C_bar_prime, 7) / (Math.pow(C_bar_prime, 7) + Math.pow(25, 7)));
  const S_L = 1 + (0.015 * Math.pow(L_bar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar_prime - 50, 2));
  const S_C = 1 + 0.045 * C_bar_prime;
  const S_H = 1 + 0.015 * C_bar_prime * T;
  const R_T = -Math.sin((2 * dTheta * Math.PI) / 180) * R_C;

  return Math.sqrt(
    Math.pow(dL_prime / (kL * S_L), 2) +
    Math.pow(dC_prime / (kC * S_C), 2) +
    Math.pow(dH_upper_prime / (kH * S_H), 2) +
    R_T * (dC_prime / (kC * S_C)) * (dH_upper_prime / (kH * S_H))
  );
}

// 查找最近颜色
export function findClosestColor(
  targetRgb: [number, number, number],
  palette: Color[],
): Color {
  const targetLab = rgb2lab(targetRgb);
  let minDiff = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const diff = deltaE2000(targetLab, rgb2lab(color.rgb));
    if (diff < minDiff) {
      minDiff = diff;
      closest = color;
    }
  }
  return closest;
}

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Get contrast text color (black or white)
export function getContrastColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  // YIQ equation from 240
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
