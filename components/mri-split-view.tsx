"use client";

import { useRef, useCallback } from "react";
import type { Region } from "@/components/image-reference";

const MARKER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

interface MriSplitViewProps {
  imageUrl: string;
  regions: Region[];
  activeRegion: number | null;
  onRegionClick: (index: number) => void;
  linkedCursorUV: { x: number; y: number } | null;
  onCursorChange: (uv: { x: number; y: number } | null) => void;
}

export function MriSplitView({
  imageUrl,
  regions,
  activeRegion,
  onRegionClick,
  linkedCursorUV,
  onCursorChange,
}: MriSplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      onCursorChange({ x: x * 100, y: y * 100 });
    },
    [onCursorChange]
  );

  const handleMouseLeave = useCallback(() => {
    onCursorChange(null);
  }, [onCursorChange]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 2D Image */}
      <img
        src={imageUrl}
        alt="MRI scan 2D reference"
        className="block w-full h-auto"
        draggable={false}
      />

      {/* Region markers */}
      {regions.map((region, i) => {
        const color = MARKER_COLORS[i % MARKER_COLORS.length];
        const isActive = activeRegion === i;

        return (
          <button
            key={i}
            className="absolute flex items-center justify-center rounded-full border-2 border-white text-white text-[11px] font-bold shadow-md transition-all duration-200 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: isActive ? 36 : 28,
              height: isActive ? 36 : 28,
              backgroundColor: isActive ? color : `${color}cc`,
              zIndex: isActive ? 20 : 10,
            }}
            onClick={() => onRegionClick(i)}
          >
            {i + 1}
          </button>
        );
      })}

      {/* Linked cursor crosshair from 3D view */}
      {linkedCursorUV && (
        <>
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-blue-400/60"
            style={{ left: `${linkedCursorUV.x}%` }}
          />
          <div
            className="pointer-events-none absolute left-0 right-0 h-px bg-blue-400/60"
            style={{ top: `${linkedCursorUV.y}%` }}
          />
          <div
            className="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-blue-400 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${linkedCursorUV.x}%`, top: `${linkedCursorUV.y}%` }}
          />
        </>
      )}
    </div>
  );
}
