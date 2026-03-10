"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Canvas, useThree, invalidate, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { extractHeightmap, type HeightmapData } from "@/lib/heightmap";
import {
  generateHeatmapDataUrl,
  generateContourDataUrl,
} from "@/lib/color-mapping";
import { cn } from "@/lib/utils";
import type { Region } from "@/components/image-reference";
import type { WireframeMode, ColorMode } from "@/components/viewer-toolbar";

const MARKER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

export interface HoverInfo {
  screenX: number;
  screenY: number;
  brightness: number;
  uvX: number;
  uvY: number;
  tissueType: string;
}

export interface CrosshairData {
  uv: { x: number; y: number };
  rowSlice: number[];
  colSlice: number[];
}

export interface MriSceneHandle {
  captureScreenshot: () => void;
}

export interface MriSceneProps {
  imageUrl: string;
  regions: Region[];
  activeRegion: number | null;
  onRegionClick: (index: number) => void;
  extrusionScale: number;
  wireframeMode: WireframeMode;
  colorMode: ColorMode;
  autoRotate: boolean;
  measureMode: boolean;
  measurePoints: [THREE.Vector3, THREE.Vector3] | null;
  onMeasurePoint: (point: THREE.Vector3) => void;
  onHoverChange: (info: HoverInfo | null) => void;
  onCrosshairClick: (data: CrosshairData | null) => void;
  splitViewCursorUV: { x: number; y: number } | null;
  onSplitViewCursorFromScene: (uv: { x: number; y: number } | null) => void;
}

// --- Helpers ---

function getPlaneDims(hmData: HeightmapData) {
  const aspect = hmData.width / hmData.height;
  return {
    planeWidth: aspect >= 1 ? 1 : aspect,
    planeHeight: aspect >= 1 ? 1 / aspect : 1,
  };
}

function regionTo3D(
  region: Region,
  hmData: HeightmapData,
  planeWidth: number,
  planeHeight: number,
  extrusionScale: number
): THREE.Vector3 {
  const px = (region.x / 100) * (hmData.width - 1);
  const py = (region.y / 100) * (hmData.height - 1);

  const x0 = Math.floor(px);
  const x1 = Math.min(x0 + 1, hmData.width - 1);
  const y0 = Math.floor(py);
  const y1 = Math.min(y0 + 1, hmData.height - 1);
  const fx = px - x0;
  const fy = py - y0;

  const h00 = hmData.heights[y0 * hmData.width + x0];
  const h10 = hmData.heights[y0 * hmData.width + x1];
  const h01 = hmData.heights[y1 * hmData.width + x0];
  const h11 = hmData.heights[y1 * hmData.width + x1];

  const height =
    h00 * (1 - fx) * (1 - fy) +
    h10 * fx * (1 - fy) +
    h01 * (1 - fx) * fy +
    h11 * fx * fy;

  return new THREE.Vector3(
    (region.x / 100 - 0.5) * planeWidth,
    (0.5 - region.y / 100) * planeHeight,
    height * extrusionScale + 0.02
  );
}

function heightAtUV(
  u: number,
  v: number,
  hmData: HeightmapData
): number {
  const px = u * (hmData.width - 1);
  const py = v * (hmData.height - 1);
  const x0 = Math.floor(px);
  const x1 = Math.min(x0 + 1, hmData.width - 1);
  const y0 = Math.floor(py);
  const y1 = Math.min(y0 + 1, hmData.height - 1);
  const fx = px - x0;
  const fy = py - y0;
  return (
    hmData.heights[y0 * hmData.width + x0] * (1 - fx) * (1 - fy) +
    hmData.heights[y0 * hmData.width + x1] * fx * (1 - fy) +
    hmData.heights[y1 * hmData.width + x0] * (1 - fx) * fy +
    hmData.heights[y1 * hmData.width + x1] * fx * fy
  );
}

function estimateTissueType(brightness: number): string {
  if (brightness < 0.2) return "CSF / Fluid";
  if (brightness < 0.5) return "Gray Matter";
  if (brightness < 0.8) return "White Matter";
  return "Bone / Calcification";
}

// --- Components ---

function HeightmapMesh({
  hmData,
  extrusionScale,
  wireframeMode,
  colorMode,
  activeRegion,
  regions,
  measureMode,
  onPointerMoveMesh,
  onClickMesh,
  onPointerLeaveMesh,
}: {
  hmData: HeightmapData;
  extrusionScale: number;
  wireframeMode: WireframeMode;
  colorMode: ColorMode;
  activeRegion: number | null;
  regions: Region[];
  measureMode: boolean;
  onPointerMoveMesh: (e: THREE.Intersection) => void;
  onClickMesh: (e: THREE.Intersection) => void;
  onPointerLeaveMesh: () => void;
}) {
  const { planeWidth, planeHeight } = getPlaneDims(hmData);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      hmData.width - 1,
      hmData.height - 1
    );
    return geo;
  }, [hmData.width, hmData.height, planeWidth, planeHeight]);

  // Apply vertex displacement
  useEffect(() => {
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < hmData.heights.length; i++) {
      positions[i * 3 + 2] = hmData.heights[i] * extrusionScale;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    invalidate();
  }, [geometry, hmData.heights, extrusionScale]);

  // Region isolation: bake dimming into the texture
  const isolationTextureUrl = useMemo(() => {
    if (activeRegion === null || !regions[activeRegion]) return null;
    const regionU = regions[activeRegion].x / 100;
    const regionV = regions[activeRegion].y / 100;
    const radius = 0.15;

    const canvas = document.createElement("canvas");
    canvas.width = hmData.width;
    canvas.height = hmData.height;
    const ctx = canvas.getContext("2d")!;

    // Get base texture pixels
    const baseImg = new Image();
    baseImg.src = (() => {
      if (colorMode === "heatmap")
        return generateHeatmapDataUrl(hmData.heights, hmData.width, hmData.height);
      if (colorMode === "contour")
        return generateContourDataUrl(hmData.heights, hmData.width, hmData.height);
      return hmData.textureDataUrl;
    })();

    // Since the image is a data URL it loads synchronously in most cases,
    // but we'll draw on the canvas directly from heights for reliability
    const imgData = ctx.createImageData(hmData.width, hmData.height);
    // First, fill with the base color mode
    if (colorMode === "heatmap") {
      for (let i = 0; i < hmData.heights.length; i++) {
        const t = hmData.heights[i];
        let r: number, g: number, b: number;
        if (t < 0.25) { const s = t / 0.25; r = 0; g = Math.round(s * 255); b = 255; }
        else if (t < 0.5) { const s = (t - 0.25) / 0.25; r = 0; g = 255; b = Math.round((1 - s) * 255); }
        else if (t < 0.75) { const s = (t - 0.5) / 0.25; r = Math.round(s * 255); g = 255; b = 0; }
        else { const s = (t - 0.75) / 0.25; r = 255; g = Math.round((1 - s) * 255); b = 0; }
        imgData.data[i * 4] = r;
        imgData.data[i * 4 + 1] = g;
        imgData.data[i * 4 + 2] = b;
        imgData.data[i * 4 + 3] = 255;
      }
    } else if (colorMode === "contour") {
      const bands = 10;
      const palette: [number, number, number][] = [
        [30,60,90],[40,80,120],[50,110,100],[60,140,80],[90,160,60],
        [130,180,50],[180,190,50],[210,170,50],[220,130,50],[200,80,50],
      ];
      for (let y = 0; y < hmData.height; y++) {
        for (let x = 0; x < hmData.width; x++) {
          const idx = y * hmData.width + x;
          const band = Math.min(Math.floor(hmData.heights[idx] * bands), bands - 1);
          let isContour = false;
          for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < hmData.width && ny >= 0 && ny < hmData.height) {
              const nBand = Math.min(Math.floor(hmData.heights[ny * hmData.width + nx] * bands), bands - 1);
              if (nBand !== band) { isContour = true; break; }
            }
          }
          const [r, g, b] = isContour ? [20, 20, 20] : palette[band];
          imgData.data[idx * 4] = r;
          imgData.data[idx * 4 + 1] = g;
          imgData.data[idx * 4 + 2] = b;
          imgData.data[idx * 4 + 3] = 255;
        }
      }
    } else {
      // Grayscale
      for (let i = 0; i < hmData.heights.length; i++) {
        const v = Math.round(hmData.heights[i] * 255);
        imgData.data[i * 4] = v;
        imgData.data[i * 4 + 1] = v;
        imgData.data[i * 4 + 2] = v;
        imgData.data[i * 4 + 3] = 255;
      }
    }

    // Apply isolation dimming
    for (let y = 0; y < hmData.height; y++) {
      for (let x = 0; x < hmData.width; x++) {
        const u = x / (hmData.width - 1);
        const v = y / (hmData.height - 1);
        const dist = Math.sqrt((u - regionU) ** 2 + (v - regionV) ** 2);
        if (dist > radius * 0.7) {
          const dim = Math.min((dist - radius * 0.7) / (radius * 0.3), 1);
          const factor = 1 - dim * 0.85;
          const idx = (y * hmData.width + x) * 4;
          imgData.data[idx] = Math.round(imgData.data[idx] * factor);
          imgData.data[idx + 1] = Math.round(imgData.data[idx + 1] * factor);
          imgData.data[idx + 2] = Math.round(imgData.data[idx + 2] * factor);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
  }, [activeRegion, regions, hmData, colorMode]);

  // Base texture (no isolation)
  const baseTextureUrl = useMemo(() => {
    if (colorMode === "heatmap")
      return generateHeatmapDataUrl(hmData.heights, hmData.width, hmData.height);
    if (colorMode === "contour")
      return generateContourDataUrl(hmData.heights, hmData.width, hmData.height);
    return hmData.textureDataUrl;
  }, [colorMode, hmData]);

  const activeTextureUrl = isolationTextureUrl ?? baseTextureUrl;

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(activeTextureUrl, () => invalidate());
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [activeTextureUrl]);

  useEffect(() => () => texture.dispose(), [texture]);

  // Pointer event handlers — use R3F's ThreeEvent types
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerDown = useCallback((e: any) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    if (measureMode) e.stopPropagation();
  }, [measureMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerUp = useCallback((e: any) => {
    if (!pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pointerDownPos.current = null;

    if (dist < 5 && e.intersections?.[0]) {
      onClickMesh(e.intersections[0]);
    }
  }, [onClickMesh]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerMove = useCallback((e: any) => {
    if (e.intersections?.[0]) onPointerMoveMesh(e.intersections[0]);
  }, [onPointerMoveMesh]);

  const showSolid = wireframeMode === "solid" || wireframeMode === "both";
  const showWireframe = wireframeMode === "wireframe" || wireframeMode === "both";

  return (
    <group>
      {/* Primary interactive mesh — always present for raycasting */}
      <mesh
        geometry={geometry}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={onPointerLeaveMesh as never}
        visible={showSolid}
      >
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe-only mode: separate visible mesh */}
      {wireframeMode === "wireframe" && (
        <mesh geometry={geometry}>
          <meshStandardMaterial
            wireframe
            color="#00ff88"
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {/* Both mode: wireframe overlay */}
      {wireframeMode === "both" && (
        <mesh geometry={geometry} renderOrder={1}>
          <meshStandardMaterial
            wireframe
            color="#00ff88"
            opacity={0.3}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function RegionMarkers({
  regions,
  activeRegion,
  onRegionClick,
  hmData,
  extrusionScale,
}: {
  regions: Region[];
  activeRegion: number | null;
  onRegionClick: (index: number) => void;
  hmData: HeightmapData;
  extrusionScale: number;
}) {
  const { planeWidth, planeHeight } = getPlaneDims(hmData);

  return (
    <>
      {regions.map((region, i) => {
        const pos = regionTo3D(region, hmData, planeWidth, planeHeight, extrusionScale);
        const color = MARKER_COLORS[i % MARKER_COLORS.length];
        const isActive = activeRegion === i;

        return (
          <Html key={i} position={pos} center zIndexRange={[20, 10]}>
            <button
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-white text-white text-[11px] font-bold shadow-md transition-all duration-200 cursor-pointer",
                isActive ? "h-9 w-9" : "h-7 w-7"
              )}
              style={{ backgroundColor: isActive ? color : `${color}cc` }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onRegionClick(i)}
            >
              {i + 1}
              {isActive && (
                <span
                  className="absolute inset-0 animate-ping rounded-full border-2 opacity-40"
                  style={{ borderColor: color }}
                />
              )}
            </button>
          </Html>
        );
      })}
    </>
  );
}

function CrosshairLines({
  crosshairUV,
  hmData,
  extrusionScale,
}: {
  crosshairUV: { x: number; y: number };
  hmData: HeightmapData;
  extrusionScale: number;
}) {
  const { planeWidth, planeHeight } = getPlaneDims(hmData);
  const steps = 100;

  // Horizontal line (fixed v, varying u)
  const hPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const v = crosshairUV.y;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const h = heightAtUV(u, v, hmData);
      points.push([
        (u - 0.5) * planeWidth,
        (0.5 - v) * planeHeight,
        h * extrusionScale + 0.005,
      ]);
    }
    return points;
  }, [crosshairUV.y, hmData, extrusionScale, planeWidth, planeHeight]);

  // Vertical line (fixed u, varying v)
  const vPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const u = crosshairUV.x;
    for (let i = 0; i <= steps; i++) {
      const v = i / steps;
      const h = heightAtUV(u, v, hmData);
      points.push([
        (u - 0.5) * planeWidth,
        (0.5 - v) * planeHeight,
        h * extrusionScale + 0.005,
      ]);
    }
    return points;
  }, [crosshairUV.x, hmData, extrusionScale, planeWidth, planeHeight]);

  return (
    <>
      <Line points={hPoints} color="#f59e0b" lineWidth={1.5} opacity={0.8} transparent />
      <Line points={vPoints} color="#f59e0b" lineWidth={1.5} opacity={0.8} transparent />
    </>
  );
}

function MeasurementLine({
  points,
}: {
  points: [THREE.Vector3, THREE.Vector3];
}) {
  const midpoint = useMemo(
    () => new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5),
    [points]
  );
  const distance = useMemo(() => points[0].distanceTo(points[1]), [points]);

  const linePoints = useMemo(
    () =>
      [
        [points[0].x, points[0].y, points[0].z],
        [points[1].x, points[1].y, points[1].z],
      ] as [number, number, number][],
    [points]
  );

  return (
    <>
      <Line
        points={linePoints}
        color="#ef4444"
        lineWidth={2}
        dashed
        dashSize={0.02}
        gapSize={0.01}
      />
      {/* Point markers */}
      <mesh position={points[0]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={points[1]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Distance label */}
      <Html position={midpoint} center>
        <div
          className="rounded bg-popover/95 px-2 py-1 text-[10px] font-mono text-popover-foreground shadow-lg backdrop-blur-sm border whitespace-nowrap"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {distance.toFixed(4)} units
        </div>
      </Html>
    </>
  );
}

function SplitViewCursor({
  cursorUV,
  hmData,
  extrusionScale,
}: {
  cursorUV: { x: number; y: number };
  hmData: HeightmapData;
  extrusionScale: number;
}) {
  const { planeWidth, planeHeight } = getPlaneDims(hmData);
  const u = cursorUV.x / 100;
  const v = cursorUV.y / 100;
  const h = heightAtUV(u, v, hmData);
  const pos = useMemo(
    () =>
      new THREE.Vector3(
        (u - 0.5) * planeWidth,
        (0.5 - v) * planeHeight,
        h * extrusionScale + 0.02
      ),
    [u, v, h, extrusionScale, planeWidth, planeHeight]
  );

  return (
    <mesh position={pos}>
      <ringGeometry args={[0.01, 0.015, 16]} />
      <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
    </mesh>
  );
}

function CameraZoomToRegion({
  activeRegion,
  regions,
  hmData,
  extrusionScale,
}: {
  activeRegion: number | null;
  regions: Region[];
  hmData: HeightmapData;
  extrusionScale: number;
}) {
  const { camera, controls } = useThree();
  const prevRegion = useRef<number | null>(null);
  const animating = useRef(false);
  const startTime = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (activeRegion === prevRegion.current) return;
    prevRegion.current = activeRegion;

    if (activeRegion === null || !regions[activeRegion]) {
      // Zoom back out to default view
      animating.current = true;
      startTime.current = performance.now();
      startPos.current.copy(camera.position);
      startTarget.current.copy(
        (controls as unknown as { target: THREE.Vector3 }).target
      );
      endPos.current.set(0, 0, 1.5);
      endTarget.current.set(0, 0, 0);
      return;
    }

    const { planeWidth, planeHeight } = getPlaneDims(hmData);
    const regionPos = regionTo3D(
      regions[activeRegion],
      hmData,
      planeWidth,
      planeHeight,
      extrusionScale
    );

    // Camera zooms to 0.4 units above the region, looking down at it
    const camTarget = regionPos.clone();
    const camPos = regionPos.clone().add(new THREE.Vector3(0, -0.1, 0.4));

    animating.current = true;
    startTime.current = performance.now();
    startPos.current.copy(camera.position);
    startTarget.current.copy(
      (controls as unknown as { target: THREE.Vector3 }).target
    );
    endPos.current.copy(camPos);
    endTarget.current.copy(camTarget);
  }, [activeRegion, regions, hmData, extrusionScale, camera, controls]);

  useFrame(() => {
    if (!animating.current) return;

    const elapsed = performance.now() - startTime.current;
    const duration = 600; // ms
    const t = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos.current, endPos.current, ease);
    const orbitTarget = (controls as unknown as { target: THREE.Vector3 }).target;
    orbitTarget.lerpVectors(startTarget.current, endTarget.current, ease);
    (controls as unknown as { update: () => void }).update();

    if (t >= 1) {
      animating.current = false;
    }
  });

  return null;
}

function AutoRotateController({ autoRotate }: { autoRotate: boolean }) {
  const { gl } = useThree();
  useFrame(() => {
    if (autoRotate) gl.render;
  });
  return null;
}

function InvalidateOnChange({ deps }: { deps: unknown[] }) {
  const { invalidate: inv } = useThree();
  useEffect(() => {
    inv();
  }, [inv, ...deps]);
  return null;
}

// --- Main Scene ---

function Scene({
  hmData,
  regions,
  activeRegion,
  onRegionClick,
  extrusionScale,
  wireframeMode,
  colorMode,
  autoRotate,
  measureMode,
  measurePoints,
  onMeasurePoint,
  onHoverChange,
  onCrosshairClick,
  splitViewCursorUV,
  onSplitViewCursorFromScene,
}: Omit<MriSceneProps, "imageUrl"> & { hmData: HeightmapData }) {
  const { camera, gl } = useThree();
  const [crosshairUV, setCrosshairUV] = useState<{ x: number; y: number } | null>(null);
  const lastHoverTime = useRef(0);

  const handlePointerMove = useCallback(
    (intersection: THREE.Intersection) => {
      const now = performance.now();
      if (now - lastHoverTime.current < 16) return;
      lastHoverTime.current = now;

      const uv = intersection.uv;
      if (!uv) return;

      // Project to screen
      const point = intersection.point.clone();
      point.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      const screenX = ((point.x + 1) / 2) * rect.width;
      const screenY = ((-point.y + 1) / 2) * rect.height;

      const brightness = heightAtUV(uv.x, 1 - uv.y, hmData);

      onHoverChange({
        screenX,
        screenY,
        brightness,
        uvX: uv.x * 100,
        uvY: (1 - uv.y) * 100,
        tissueType: estimateTissueType(brightness),
      });

      // Split view cursor sync
      onSplitViewCursorFromScene({ x: uv.x * 100, y: (1 - uv.y) * 100 });
    },
    [camera, gl, hmData, onHoverChange, onSplitViewCursorFromScene]
  );

  const handlePointerLeave = useCallback(() => {
    onHoverChange(null);
    onSplitViewCursorFromScene(null);
  }, [onHoverChange, onSplitViewCursorFromScene]);

  const handleClick = useCallback(
    (intersection: THREE.Intersection) => {
      const uv = intersection.uv;
      if (!uv) return;

      if (measureMode) {
        onMeasurePoint(intersection.point.clone());
        return;
      }

      // Crosshair: extract slices
      const clickU = uv.x;
      const clickV = 1 - uv.y;

      // Row slice (horizontal, fixed v)
      const rowSlice: number[] = [];
      for (let i = 0; i < hmData.width; i++) {
        const row = Math.round(clickV * (hmData.height - 1));
        rowSlice.push(hmData.heights[row * hmData.width + i]);
      }

      // Column slice (vertical, fixed u)
      const colSlice: number[] = [];
      for (let j = 0; j < hmData.height; j++) {
        const col = Math.round(clickU * (hmData.width - 1));
        colSlice.push(hmData.heights[j * hmData.width + col]);
      }

      const newUV = { x: clickU, y: clickV };
      setCrosshairUV(newUV);
      onCrosshairClick({ uv: newUV, rowSlice, colSlice });
    },
    [measureMode, onMeasurePoint, hmData, onCrosshairClick]
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 3]} intensity={0.8} />
      <HeightmapMesh
        hmData={hmData}
        extrusionScale={extrusionScale}
        wireframeMode={wireframeMode}
        colorMode={colorMode}
        activeRegion={activeRegion}
        regions={regions}
        measureMode={measureMode}
        onPointerMoveMesh={handlePointerMove}
        onClickMesh={handleClick}
        onPointerLeaveMesh={handlePointerLeave}
      />
      <RegionMarkers
        regions={regions}
        activeRegion={activeRegion}
        onRegionClick={onRegionClick}
        hmData={hmData}
        extrusionScale={extrusionScale}
      />
      {crosshairUV && (
        <CrosshairLines
          crosshairUV={crosshairUV}
          hmData={hmData}
          extrusionScale={extrusionScale}
        />
      )}
      {measurePoints && <MeasurementLine points={measurePoints} />}
      {splitViewCursorUV && (
        <SplitViewCursor
          cursorUV={splitViewCursorUV}
          hmData={hmData}
          extrusionScale={extrusionScale}
        />
      )}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={0.2}
        maxDistance={3}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
      <CameraZoomToRegion
        activeRegion={activeRegion}
        regions={regions}
        hmData={hmData}
        extrusionScale={extrusionScale}
      />
      {autoRotate && <AutoRotateController autoRotate={autoRotate} />}
      <InvalidateOnChange
        deps={[activeRegion, extrusionScale, wireframeMode, colorMode, crosshairUV, measurePoints, splitViewCursorUV]}
      />
    </>
  );
}

// --- Exported component ---

const MriScene = forwardRef<MriSceneHandle, MriSceneProps>(function MriScene(
  props,
  ref
) {
  const [hmData, setHmData] = useState<HeightmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    setHmData(null);
    extractHeightmap(props.imageUrl)
      .then((data) => setHmData(data))
      .catch((err) => console.error("Heightmap extraction failed:", err))
      .finally(() => setLoading(false));
  }, [props.imageUrl]);

  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "mri-3d-screenshot.png";
      a.click();
    },
  }));

  if (loading || !hmData) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary mr-2" />
        Building 3D model…
      </div>
    );
  }

  const frameloop = props.autoRotate ? "always" : "demand";

  return (
    <div className="w-full" style={{ height: "32rem" }}>
      <Canvas
        ref={canvasRef}
        frameloop={frameloop}
        camera={{ position: [0, 0, 1.5], fov: 45 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ background: "transparent" }}
      >
        <Scene hmData={hmData} {...props} />
      </Canvas>
    </div>
  );
});

export default MriScene;
