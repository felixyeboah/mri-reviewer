export interface HeightmapData {
  heights: Float32Array;
  width: number;
  height: number;
  textureDataUrl: string;
}

/**
 * Extracts a heightmap from an image URL.
 * Returns grayscale values (0–1) as a Float32Array plus a higher-res texture data URL.
 */
export async function extractHeightmap(
  imageUrl: string,
  geoMaxRes = 256,
  texMaxRes = 1024
): Promise<HeightmapData> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image for heightmap"));
    img.src = imageUrl;
  });

  // --- Geometry resolution (low-res for vertex displacement) ---
  const aspect = img.naturalWidth / img.naturalHeight;
  let geoW = img.naturalWidth;
  let geoH = img.naturalHeight;
  if (Math.max(geoW, geoH) > geoMaxRes) {
    const ratio = geoMaxRes / Math.max(geoW, geoH);
    geoW = Math.round(geoW * ratio);
    geoH = Math.round(geoH * ratio);
  }

  const geoCanvas = document.createElement("canvas");
  geoCanvas.width = geoW;
  geoCanvas.height = geoH;
  const geoCtx = geoCanvas.getContext("2d")!;
  geoCtx.drawImage(img, 0, 0, geoW, geoH);
  const geoData = geoCtx.getImageData(0, 0, geoW, geoH).data;

  const heights = new Float32Array(geoW * geoH);
  for (let i = 0; i < heights.length; i++) {
    const r = geoData[i * 4];
    const g = geoData[i * 4 + 1];
    const b = geoData[i * 4 + 2];
    heights[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // --- Texture resolution (higher-res for visual quality) ---
  let texW = img.naturalWidth;
  let texH = img.naturalHeight;
  if (Math.max(texW, texH) > texMaxRes) {
    const ratio = texMaxRes / Math.max(texW, texH);
    texW = Math.round(texW * ratio);
    texH = Math.round(texH * ratio);
  }

  const texCanvas = document.createElement("canvas");
  texCanvas.width = texW;
  texCanvas.height = texH;
  const texCtx = texCanvas.getContext("2d")!;
  texCtx.drawImage(img, 0, 0, texW, texH);
  const textureDataUrl = texCanvas.toDataURL("image/png");

  return { heights, width: geoW, height: geoH, textureDataUrl };
}
