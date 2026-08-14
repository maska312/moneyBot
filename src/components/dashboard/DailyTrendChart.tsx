"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface DailyTrendPoint {
  day: number;
  dateLabel: string;
  amount: number;
}

interface DailyTrendChartProps {
  data: DailyTrendPoint[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const formatSom = (num: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(num)) + " с";

  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Динамика расходов по дням</h3>
            <p className="text-xs text-slate-400">Пики и распределение трат за текущий месяц</p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500">
          Нет данных для отображения графика
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as DailyTrendPoint;
                    return (
                      <div className="bg-[#1e293b] border border-white/10 p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="text-slate-400 font-medium">{d.dateLabel}</div>
                        <div className="text-emerald-400 font-bold text-sm mt-0.5">
                          {formatSom(d.amount)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: "#34d399" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
