"use client";

import React from "react";
import { Wallet, TrendingDown, Users, Sparkles } from "lucide-react";

interface OverviewCardsProps {
  totalAmount: number;
  dailyAverage: number;
  byUser: { name: string; amount: number; count: number }[];
  transactionCount: number;
}

export function OverviewCards({
  totalAmount,
  dailyAverage,
  byUser,
  transactionCount,
}: OverviewCardsProps) {
  const formatSom = (num: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(num)) + " с";

  const maksatData = byUser.find((u) => u.name === "Максат") || { amount: 0, count: 0 };
  const bayanaData = byUser.find((u) => u.name === "Баяна") || { amount: 0, count: 0 };

  const maksatPercent =
    totalAmount > 0 ? Math.round((maksatData.amount / totalAmount) * 100) : 0;
  const bayanaPercent =
    totalAmount > 0 ? Math.round((bayanaData.amount / totalAmount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Total Expenses Card */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Общий расход
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            {formatSom(totalAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <span>{transactionCount} операций за месяц</span>
          </div>
        </div>
      </div>

      {/* 2. Daily Average Card */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Средний расход в день
          </span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            {formatSom(dailyAverage)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            в среднем за прошедшие дни
          </div>
        </div>
      </div>

      {/* 3. Family Split Card */}
      <div className="glass-panel rounded-2xl p-5 sm:col-span-2 lg:col-span-1 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Разделение расходов
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">👨 Максат: {formatSom(maksatData.amount)}</span>
              <span className="text-slate-400">{maksatPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${maksatPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-200">👩 Баяна: {formatSom(bayanaData.amount)}</span>
              <span className="text-slate-400">{bayanaPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${bayanaPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
