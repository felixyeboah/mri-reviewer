"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, invalidate } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { extractHeightmap, type HeightmapData } from "@/lib/heightmap";
import { cn } from "@/lib/utils";
import type { Region } from "@/components/image-reference";

const MARKER_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#6366f1",
];

interface MriSceneProps {
  imageUrl: string;
  regions: Region[];
  activeRegion: number | null;
  onRegionClick: (index: number) => void;
  extrusionScale: number;
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

  // Bilinear interpolation of height
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

  const worldX = (region.x / 100 - 0.5) * planeWidth;
  const worldY = (0.5 - region.y / 100) * planeHeight;
  const worldZ = height * extrusionScale + 0.02;

  return new THREE.Vector3(worldX, worldY, worldZ);
}

function HeightmapMesh({
  hmData,
  extrusionScale,
}: {
  hmData: HeightmapData;
  extrusionScale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const aspect = hmData.width / hmData.height;
  const planeWidth = aspect >= 1 ? 1 : aspect;
  const planeHeight = aspect >= 1 ? 1 / aspect : 1;

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
    for (let row = 0; row < hmData.height; row++) {
      for (let col = 0; col < hmData.width; col++) {
        const vertexIndex = row * hmData.width + col;
        positions[vertexIndex * 3 + 2] =
          hmData.heights[vertexIndex] * extrusionScale;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    invalidate();
  }, [geometry, hmData.heights, extrusionScale]);

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(hmData.textureDataUrl, () => {
      invalidate();
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [hmData.textureDataUrl]);

  // Dispose texture on unmount
  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
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
  const aspect = hmData.width / hmData.height;
  const planeWidth = aspect >= 1 ? 1 : aspect;
  const planeHeight = aspect >= 1 ? 1 / aspect : 1;

  return (
    <>
      {regions.map((region, i) => {
        const pos = regionTo3D(
          region,
          hmData,
          planeWidth,
          planeHeight,
          extrusionScale
        );
        const color = MARKER_COLORS[i % MARKER_COLORS.length];
        const isActive = activeRegion === i;

        return (
          <Html key={i} position={pos} center zIndexRange={[20, 10]}>
            <button
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-white text-white text-[11px] font-bold shadow-md transition-all duration-200 cursor-pointer",
                isActive ? "h-9 w-9" : "h-7 w-7"
              )}
              style={{
                backgroundColor: isActive ? color : `${color}cc`,
              }}
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

function InvalidateOnChange({ deps }: { deps: unknown[] }) {
  const { invalidate: inv } = useThree();
  useEffect(() => {
    inv();
  }, [inv, ...deps]);
  return null;
}

function Scene({
  hmData,
  regions,
  activeRegion,
  onRegionClick,
  extrusionScale,
}: {
  hmData: HeightmapData;
  regions: Region[];
  activeRegion: number | null;
  onRegionClick: (index: number) => void;
  extrusionScale: number;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 3]} intensity={0.8} />
      <HeightmapMesh hmData={hmData} extrusionScale={extrusionScale} />
      <RegionMarkers
        regions={regions}
        activeRegion={activeRegion}
        onRegionClick={onRegionClick}
        hmData={hmData}
        extrusionScale={extrusionScale}
      />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={0.3}
        maxDistance={3}
      />
      <InvalidateOnChange deps={[activeRegion, extrusionScale]} />
    </>
  );
}

export default function MriScene({
  imageUrl,
  regions,
  activeRegion,
  onRegionClick,
  extrusionScale,
}: MriSceneProps) {
  const [hmData, setHmData] = useState<HeightmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setHmData(null);
    extractHeightmap(imageUrl)
      .then((data) => setHmData(data))
      .catch((err) => console.error("Heightmap extraction failed:", err))
      .finally(() => setLoading(false));
  }, [imageUrl]);

  if (loading || !hmData) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary mr-2" />
        Building 3D model…
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: "32rem" }}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 1.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Scene
          hmData={hmData}
          regions={regions}
          activeRegion={activeRegion}
          onRegionClick={onRegionClick}
          extrusionScale={extrusionScale}
        />
      </Canvas>
    </div>
  );
}
