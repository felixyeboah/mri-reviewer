"use client";

import { cn } from "@/lib/utils";

export type WireframeMode = "solid" | "wireframe" | "both";
export type ColorMode = "grayscale" | "heatmap" | "contour";

interface ViewerToolbarProps {
  extrusionScale: number;
  onExtrusionChange: (v: number) => void;
  wireframeMode: WireframeMode;
  onWireframeModeChange: (v: WireframeMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (v: ColorMode) => void;
  autoRotate: boolean;
  onAutoRotateChange: (v: boolean) => void;
  splitView: boolean;
  onSplitViewChange: (v: boolean) => void;
  measureMode: boolean;
  onMeasureModeChange: (v: boolean) => void;
  onScreenshot: () => void;
  onClearMeasurement: () => void;
  hasMeasurement: boolean;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  title,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  title: string;
}) {
  return (
    <div
      className="inline-flex h-7 items-center rounded-md bg-muted/50 p-0.5"
      title={title}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-6 rounded-sm px-2 text-[10px] font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ViewerToolbar({
  extrusionScale,
  onExtrusionChange,
  wireframeMode,
  onWireframeModeChange,
  colorMode,
  onColorModeChange,
  autoRotate,
  onAutoRotateChange,
  splitView,
  onSplitViewChange,
  measureMode,
  onMeasureModeChange,
  onScreenshot,
  onClearMeasurement,
  hasMeasurement,
}: ViewerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Depth slider */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="extrusion" className="text-[10px] text-muted-foreground">
          Depth
        </label>
        <input
          id="extrusion"
          type="range"
          min="0"
          max="0.4"
          step="0.01"
          value={extrusionScale}
          onChange={(e) => onExtrusionChange(parseFloat(e.target.value))}
          className="h-1 w-16 cursor-pointer accent-primary"
        />
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Wireframe mode */}
      <SegmentedControl
        value={wireframeMode}
        onChange={onWireframeModeChange}
        title="Wireframe mode"
        options={[
          { value: "solid", label: "Solid" },
          { value: "wireframe", label: "Wire" },
          { value: "both", label: "Both" },
        ]}
      />

      {/* Color mode */}
      <SegmentedControl
        value={colorMode}
        onChange={onColorModeChange}
        title="Color mapping"
        options={[
          { value: "grayscale", label: "Gray" },
          { value: "heatmap", label: "Heat" },
          { value: "contour", label: "Contour" },
        ]}
      />

      <div className="h-4 w-px bg-border" />

      {/* Auto-rotate */}
      <ToolbarButton
        active={autoRotate}
        onClick={() => onAutoRotateChange(!autoRotate)}
        title="Auto-rotate"
      >
        {/* rotate icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      </ToolbarButton>

      {/* Measure mode */}
      <ToolbarButton
        active={measureMode}
        onClick={() => onMeasureModeChange(!measureMode)}
        title="Measurement tool"
      >
        {/* ruler icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
      </ToolbarButton>

      {hasMeasurement && (
        <button
          type="button"
          onClick={onClearMeasurement}
          className="h-7 rounded-md bg-muted/50 px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Clear
        </button>
      )}

      {/* Split view */}
      <ToolbarButton
        active={splitView}
        onClick={() => onSplitViewChange(!splitView)}
        title="Split view (2D + 3D)"
      >
        {/* columns icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 3v18" />
        </svg>
      </ToolbarButton>

      {/* Screenshot */}
      <ToolbarButton onClick={onScreenshot} title="Capture screenshot">
        {/* camera icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
