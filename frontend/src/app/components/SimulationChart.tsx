import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactCurrency, formatCurrency } from "@/lib/simulation/format";

export type ChartPoint = { label: string; revenue: number; profit: number };

type SimulationChartProps = {
  data: ChartPoint[];
  /** One-sentence summary read by screen readers in place of the drawing. */
  summary: string;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const reducedMotionOnServer = () => true;

const axisTick = { fill: "var(--ms-chart-axis)", fontSize: 12 };

// Loaded on the client only (next/dynamic), so it never renders without a measured container.
export function SimulationChart({ data, summary }: SimulationChartProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    prefersReducedMotion,
    reducedMotionOnServer
  );

  return (
    <div role="img" aria-label={summary} className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 288 }}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          accessibilityLayer={false}
        >
          <CartesianGrid vertical={false} stroke="var(--ms-chart-grid)" />
          <XAxis
            dataKey="label"
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "var(--ms-border-strong)" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={76}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <ReferenceLine y={0} stroke="var(--ms-border-strong)" />
          <Tooltip
            cursor={{ stroke: "var(--ms-chart-crosshair)", strokeWidth: 1 }}
            formatter={(value) => (typeof value === "number" ? formatCurrency(value) : value)}
            contentStyle={{
              background: "var(--ms-surface-raised)",
              border: "1px solid var(--ms-border-strong)",
              borderRadius: "var(--ms-radius-xs)",
              color: "var(--ms-text)",
              fontSize: "var(--ms-text-fine)",
            }}
            labelStyle={{ color: "var(--ms-text-secondary)" }}
            itemStyle={{ color: "var(--ms-text)" }}
          />
          <Legend
            verticalAlign="top"
            align="left"
            height={32}
            wrapperStyle={{ color: "var(--ms-text-secondary)", fontSize: "var(--ms-text-caption)" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Receita"
            legendType="circle"
            stroke="var(--ms-chart-1)"
            strokeWidth={2}
            fill="var(--ms-chart-1)"
            fillOpacity={0.2}
            dot={false}
            activeDot={{ r: 3, stroke: "var(--ms-chart-crosshair)" }}
            isAnimationActive={!reducedMotion}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Lucro"
            legendType="square"
            stroke="var(--ms-chart-2)"
            strokeWidth={2}
            fill="var(--ms-chart-2)"
            fillOpacity={0.2}
            dot={false}
            activeDot={{ r: 3, stroke: "var(--ms-chart-crosshair)" }}
            isAnimationActive={!reducedMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
