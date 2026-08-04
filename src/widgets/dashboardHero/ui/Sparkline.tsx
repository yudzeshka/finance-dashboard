import { useId, useMemo } from "react";

type SparklineProps = {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  ariaLabel: string;
};

export function Sparkline({
  data,
  color,
  width = 200,
  height = 64,
  ariaLabel,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return { polyline: "", areaPoints: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (data.length - 1);

    const points = data.map((val, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((val - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    const polyline = points.join(" ");
    // Area polygon: line points + bottom-right + bottom-left (closes back to first point)
    const areaPoints = `${polyline} ${padding + chartWidth},${padding + chartHeight} ${padding},${padding + chartHeight}`;

    return { polyline, areaPoints };
  }, [data, width, height]);

  const rawId = useId();
  const gradientId = `sparkline-grad-${rawId.replace(/:/g, "")}`;

  if (data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        style={{ display: "block" }}
      >
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--aurora-text-secondary)"
          fontSize="12"
        >
          −
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={path.areaPoints}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={path.polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
