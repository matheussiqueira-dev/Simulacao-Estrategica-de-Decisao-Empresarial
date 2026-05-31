"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SimulationChartProps = {
  labels: string[];
  revenue: number[];
  profit: number[];
};

export function SimulationChart({ labels, revenue, profit }: SimulationChartProps) {
  const [mounted, setMounted] = useState(false);
  const data = useMemo(
    () =>
      labels.map((label, index) => ({
        name: label,
        revenue: revenue[index] ?? 0,
        profit: profit[index] ?? 0,
      })),
    [labels, profit, revenue],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-glass">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Receita x Lucro projetados</p>
          <p className="text-xl font-semibold text-white">Próximos meses</p>
        </div>
      </div>

      <div className="mt-2 h-72 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ left: -20, right: 0, top: 10 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.92)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#e2e8f0",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Receita"
                stroke="#4ade80"
                strokeWidth={2.4}
                fill="url(#revGradient)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Lucro"
                stroke="#22d3ee"
                strokeWidth={2.4}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-2xl bg-slate-900/70" />
        )}
      </div>
    </div>
  );
}
