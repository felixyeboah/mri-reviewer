"use client";

interface SliceGraphProps {
  data: number[];
  label: string;
  orientation: "horizontal" | "vertical";
  className?: string;
}

export function SliceGraph({
  data,
  label,
  orientation,
  className,
}: SliceGraphProps) {
  if (data.length === 0) return null;

  const w = 200;
  const h = 60;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (w - padding * 2);
      const y = h - padding - v * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-medium text-muted-foreground">
        {label}
      </p>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="rounded border bg-background/80 backdrop-blur-sm"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((v) => (
          <line
            key={v}
            x1={padding}
            y1={h - padding - v * (h - padding * 2)}
            x2={w - padding}
            y2={h - padding - v * (h - padding * 2)}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.5}
          />
        ))}
        {/* Intensity profile line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
