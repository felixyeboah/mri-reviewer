/**
 * Converts a raster image (URL or data URL) into an SVG string
 * using imagetracerjs for client-side vector tracing.
 */
export async function imageToSvg(imageUrl: string): Promise<string> {
  // Load the image onto a canvas to get ImageData
  const img = new Image();
  img.crossOrigin = "anonymous";

  const imageData = await new Promise<ImageData>((resolve, reject) => {
    img.onload = () => {
      // Scale down large images for performance (max 800px on longest side)
      const maxDim = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const ratio = maxDim / Math.max(w, h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = () => reject(new Error("Failed to load image for SVG tracing"));
    img.src = imageUrl;
  });

  // imagetracerjs exports a singleton instance via module.exports
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tracer = require("imagetracerjs");

  const svgString: string = tracer.imagedataToSVG(imageData, {
    // Optimised for medical grayscale images
    colorsampling: 0, // deterministic palette
    numberofcolors: 24, // enough gray levels for detail
    colorquantcycles: 3,
    pathomit: 4, // drop tiny artifacts
    ltres: 0.5, // smoother line tracing
    qtres: 0.5, // smoother curves
    blurradius: 1, // slight blur to reduce noise
    strokewidth: 0, // filled paths only
    scale: 1,
    roundcoords: 2,
    desc: false,
    viewbox: true,
  });

  return svgString;
}
