"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function ImageReference({ imageUrl, regions }: ImageReferenceProps) {
  const [activeRegion, setActiveRegion] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveRegion(null);
    setImageLoaded(false);
  }, [imageUrl]);

  const handleRegionClick = useCallback((index: number) => {
    setActiveRegion((prev) => (prev === index ? null : index));
  }, []);

  if (!imageUrl) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
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
          Image Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Interactive image with overlay markers */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded medical image"
            className="block w-full object-contain"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Markers as absolutely positioned elements — no SVG distortion */}
          {imageLoaded &&
            regions.map((region, i) => {
              const color = MARKER_COLORS[i % MARKER_COLORS.length];
              const isActive = activeRegion === i;

              return (
                <button
                  key={i}
                  className={cn(
                    "absolute flex items-center justify-center rounded-full border-2 border-white text-white text-[11px] font-bold shadow-md transition-all duration-200 -translate-x-1/2 -translate-y-1/2",
                    isActive ? "h-9 w-9 z-20" : "h-7 w-7 z-10"
                  )}
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    backgroundColor: isActive ? color : `${color}cc`,
                  }}
                  onClick={() => handleRegionClick(i)}
                >
                  {i + 1}

                  {/* Pulse ring */}
                  {isActive && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full border-2 opacity-40"
                      style={{ borderColor: color }}
                    />
                  )}
                </button>
              );
            })}

          {/* Active region tooltip */}
          {activeRegion !== null && regions[activeRegion] && (
            <div
              className="absolute z-30 w-56 rounded-lg border bg-popover/95 p-3 text-xs text-popover-foreground shadow-xl backdrop-blur-sm"
              style={{
                left: `clamp(8px, ${regions[activeRegion].x}%, calc(100% - 232px))`,
                top: `${Math.min(regions[activeRegion].y + 4, 80)}%`,
              }}
            >
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
                      isActive && "ring-2 ring-offset-1 ring-offset-background"
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
