"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as ChartIcon } from "lucide-react";

interface CategoryData {
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

interface CategoryDonutChartProps {
  categories: CategoryData[];
  totalAmount: number;
}

export function CategoryDonutChart({
  categories,
  totalAmount,
}: CategoryDonutChartProps) {
  const formatSom = (num: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(num)) + " с";

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center py-12">
        <ChartIcon className="w-10 h-10 text-slate-500 mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">Нет данных о расходах</h4>
        <p className="text-xs text-slate-500 mt-1">Добавьте первый расход, чтобы увидеть график категорий</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Расходы по категориям</h3>
            <p className="text-xs text-slate-400">Куда уходят деньги в этом месяце</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Donut Chart */}
        <div className="h-60 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="amount"
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || "#6B7280"}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryData;
                    return (
                      <div className="bg-[#1e293b] border border-white/10 p-3 rounded-xl shadow-xl text-xs">
                        <div className="flex items-center space-x-2">
                          <span>{data.icon}</span>
                          <span className="font-semibold text-white">{data.name}</span>
                        </div>
                        <div className="mt-1 text-emerald-400 font-bold text-sm">
                          {formatSom(data.amount)}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {data.percentage}% • {data.count} операций
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Всего</span>
            <span className="text-base font-bold text-white tracking-tight">{formatSom(totalAmount)}</span>
          </div>
        </div>

        {/* Category Legend & Details */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/5"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-base flex-shrink-0">{cat.icon}</span>
                <span className="text-xs font-medium text-slate-200 truncate">{cat.name}</span>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <div className="text-xs font-bold text-white">{formatSom(cat.amount)}</div>
                <div className="text-[10px] text-slate-400">{cat.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
