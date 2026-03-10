"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ViewerToolbar,
  type WireframeMode,
  type ColorMode,
} from "@/components/viewer-toolbar";
import { SliceGraph } from "@/components/slice-graph";
import { MriSplitView } from "@/components/mri-split-view";
import type {
  MriSceneHandle,
  HoverInfo,
  CrosshairData,
} from "@/components/mri-scene";
import * as THREE from "three";

const MriScene = dynamic(() => import("@/components/mri-scene"), {
  ssr: false,
});

export interface Region {
  name: string;
  observation: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface ImageReferenceProps {
  imageUrl: string;
  regions: Region[];
}

export function extractRegions(analysisText: string): Region[] {
  const regions: Region[] = [];

  const anatomicalMatch = analysisText.match(
    /## Anatomical Regions Identified\n([\s\S]*?)(?=\n## |$)/
  );
  if (!anatomicalMatch) return regions;

  const anatomicalText = anatomicalMatch[1];
  const regionBlocks = anatomicalText
    .split(/(?=### )/)
    .filter((s) => s.startsWith("### "));

  for (const block of regionBlocks) {
    const lines = block.split("\n");
    const name = lines[0].replace(/^### /, "").trim();

    const obsLine = lines.find((l) => /^\*\*Observation:\*\*/i.test(l));
    const observation = obsLine
      ? obsLine.replace(/^\*\*Observation:\*\*\s*/i, "").trim()
      : "";

    const posLine = lines.find((l) => /^\*\*Position:\*\*/i.test(l));
    let x = 50,
      y = 50;
    if (posLine) {
      const posMatch = posLine.match(
        /(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%/
      );
      if (posMatch) {
        x = parseFloat(posMatch[1]);
        y = parseFloat(posMatch[2]);
      }
    }

    if (name) {
      regions.push({ name, observation, x, y });
    }
  }

  return regions;
}

const MARKER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

export function ImageReference({ imageUrl, regions }: ImageReferenceProps) {
  const sceneRef = useRef<MriSceneHandle>(null);

  // Core state
  const [activeRegion, setActiveRegion] = useState<number | null>(null);
  const [extrusionScale, setExtrusionScale] = useState(0.15);

  // Feature states
  const [wireframeMode, setWireframeMode] = useState<WireframeMode>("solid");
  const [colorMode, setColorMode] = useState<ColorMode>("grayscale");
  const [autoRotate, setAutoRotate] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<
    [THREE.Vector3, THREE.Vector3] | null
  >(null);
  const [measureBuffer, setMeasureBuffer] = useState<THREE.Vector3 | null>(null);

  // Hover & crosshair
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [crosshairData, setCrosshairData] = useState<CrosshairData | null>(null);

  // Split view cursor sync
  const [splitCursorFromScene, setSplitCursorFromScene] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [splitCursorFrom2D, setSplitCursorFrom2D] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleRegionClick = useCallback((index: number) => {
    setActiveRegion((prev) => (prev === index ? null : index));
  }, []);

  const handleMeasurePoint = useCallback(
    (point: THREE.Vector3) => {
      if (measureBuffer) {
        setMeasurePoints([measureBuffer, point]);
        setMeasureBuffer(null);
      } else {
        setMeasureBuffer(point);
        setMeasurePoints(null);
      }
    },
    [measureBuffer]
  );

  const handleClearMeasurement = useCallback(() => {
    setMeasurePoints(null);
    setMeasureBuffer(null);
  }, []);

  const handleScreenshot = useCallback(() => {
    sceneRef.current?.captureScreenshot();
  }, []);

  if (!imageUrl) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            3D Image Reference
          </CardTitle>
          <ViewerToolbar
            extrusionScale={extrusionScale}
            onExtrusionChange={setExtrusionScale}
            wireframeMode={wireframeMode}
            onWireframeModeChange={setWireframeMode}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            autoRotate={autoRotate}
            onAutoRotateChange={setAutoRotate}
            splitView={splitView}
            onSplitViewChange={setSplitView}
            measureMode={measureMode}
            onMeasureModeChange={(v) => {
              setMeasureMode(v);
              if (!v) {
                setMeasureBuffer(null);
              }
            }}
            onScreenshot={handleScreenshot}
            onClearMeasurement={handleClearMeasurement}
            hasMeasurement={measurePoints !== null}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Main viewer area */}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg border",
            splitView && "flex gap-2"
          )}
        >
          {/* Split view: 2D panel */}
          {splitView && (
            <div className="w-1/2">
              <MriSplitView
                imageUrl={imageUrl}
                regions={regions}
                activeRegion={activeRegion}
                onRegionClick={handleRegionClick}
                linkedCursorUV={splitCursorFromScene}
                onCursorChange={setSplitCursorFrom2D}
              />
            </div>
          )}

          {/* 3D scene */}
          <div className={cn("relative", splitView ? "w-1/2" : "w-full")}>
            <MriScene
              ref={sceneRef}
              imageUrl={imageUrl}
              regions={regions}
              activeRegion={activeRegion}
              onRegionClick={handleRegionClick}
              extrusionScale={extrusionScale}
              wireframeMode={wireframeMode}
              colorMode={colorMode}
              autoRotate={autoRotate}
              measureMode={measureMode}
              measurePoints={measurePoints}
              onMeasurePoint={handleMeasurePoint}
              onHoverChange={setHoverInfo}
              onCrosshairClick={setCrosshairData}
              splitViewCursorUV={splitView ? splitCursorFrom2D : null}
              onSplitViewCursorFromScene={setSplitCursorFromScene}
            />

            {/* Hover tooltip */}
            {hoverInfo && (
              <div
                className="pointer-events-none absolute z-30 rounded-md border bg-popover/95 px-2 py-1.5 text-[10px] text-popover-foreground shadow-lg backdrop-blur-sm"
                style={{
                  left: Math.min(hoverInfo.screenX + 12, 250),
                  top: Math.max(hoverInfo.screenY - 40, 4),
                }}
              >
                <div className="font-mono">
                  <span className="text-muted-foreground">Pos:</span>{" "}
                  {hoverInfo.uvX.toFixed(1)}%, {hoverInfo.uvY.toFixed(1)}%
                </div>
                <div className="font-mono">
                  <span className="text-muted-foreground">Brightness:</span>{" "}
                  {(hoverInfo.brightness * 100).toFixed(1)}%
                </div>
                <div className="font-medium">{hoverInfo.tissueType}</div>
              </div>
            )}

            {/* Measure mode indicator */}
            {measureMode && !measurePoints && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-medium text-white">
                {measureBuffer
                  ? "Click second point"
                  : "Click first point to measure"}
              </div>
            )}

            {/* Active region tooltip */}
            {activeRegion !== null && regions[activeRegion] && (
              <div className="absolute bottom-3 left-3 z-30 w-56 rounded-lg border bg-popover/95 p-3 text-xs text-popover-foreground shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{
                      backgroundColor:
                        MARKER_COLORS[activeRegion % MARKER_COLORS.length],
                    }}
                  >
                    {activeRegion + 1}
                  </span>
                  <p className="font-semibold leading-tight">
                    {regions[activeRegion].name}
                  </p>
                </div>
                {regions[activeRegion].observation && (
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">
                    {regions[activeRegion].observation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Crosshair slice graphs */}
        {crosshairData && (
          <div className="flex gap-4">
            <SliceGraph
              data={crosshairData.rowSlice}
              label={`Horizontal slice (y=${(crosshairData.uv.y * 100).toFixed(0)}%)`}
              orientation="horizontal"
              className="flex-1"
            />
            <SliceGraph
              data={crosshairData.colSlice}
              label={`Vertical slice (x=${(crosshairData.uv.x * 100).toFixed(0)}%)`}
              orientation="vertical"
              className="flex-1"
            />
          </div>
        )}

        {/* Region badges */}
        {regions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Click a region to locate
            </p>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((region, i) => {
                const color = MARKER_COLORS[i % MARKER_COLORS.length];
                const isActive = activeRegion === i;

                return (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn(
                      "cursor-pointer gap-1.5 transition-all duration-200",
                      isActive &&
                        "ring-2 ring-offset-1 ring-offset-background"
                    )}
                    style={
                      isActive
                        ? ({
                            borderColor: color,
                            backgroundColor: `${color}18`,
                            "--tw-ring-color": color,
                          } as React.CSSProperties)
                        : undefined
                    }
                    onClick={() => handleRegionClick(i)}
                  >
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </span>
                    {region.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
