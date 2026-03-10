/**
 * Generates color-mapped texture data URLs from heightmap data.
 */

function heatmapColor(t: number): [number, number, number] {
  // Blue → Cyan → Green → Yellow → Red
  if (t < 0.25) {
    const s = t / 0.25;
    return [0, Math.round(s * 255), 255];
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    return [0, 255, Math.round((1 - s) * 255)];
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    return [Math.round(s * 255), 255, 0];
  } else {
    const s = (t - 0.75) / 0.25;
    return [255, Math.round((1 - s) * 255), 0];
  }
}

export function generateHeatmapDataUrl(
  heights: Float32Array,
  width: number,
  height: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);

  for (let i = 0; i < heights.length; i++) {
    const [r, g, b] = heatmapColor(heights[i]);
    imgData.data[i * 4] = r;
    imgData.data[i * 4 + 1] = g;
    imgData.data[i * 4 + 2] = b;
    imgData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

const CONTOUR_PALETTE: [number, number, number][] = [
  [30, 60, 90],
  [40, 80, 120],
  [50, 110, 100],
  [60, 140, 80],
  [90, 160, 60],
  [130, 180, 50],
  [180, 190, 50],
  [210, 170, 50],
  [220, 130, 50],
  [200, 80, 50],
];

export function generateContourDataUrl(
  heights: Float32Array,
  width: number,
  height: number,
  bands = 10
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const band = Math.min(Math.floor(heights[i] * bands), bands - 1);

      // Check if any neighbor is in a different band (contour line)
      let isContour = false;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny * width + nx;
          const nBand = Math.min(Math.floor(heights[ni] * bands), bands - 1);
          if (nBand !== band) {
            isContour = true;
            break;
          }
        }
      }

      const [r, g, b] = isContour ? [20, 20, 20] : CONTOUR_PALETTE[band];
      imgData.data[i * 4] = r;
      imgData.data[i * 4 + 1] = g;
      imgData.data[i * 4 + 2] = b;
      imgData.data[i * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}
