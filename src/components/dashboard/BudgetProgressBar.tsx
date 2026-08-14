"use client";

import React, { useState } from "react";
import { Target, AlertCircle, Edit2, Check } from "lucide-react";

interface BudgetProgressBarProps {
  budget: {
    limit: number | null;
    spent: number;
    remaining: number | null;
    percentage: number | null;
  };
  monthYear: string;
  onUpdateBudget: (newLimit: number) => Promise<void>;
}

export function BudgetProgressBar({
  budget,
  monthYear,
  onUpdateBudget,
}: BudgetProgressBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputLimit, setInputLimit] = useState(budget.limit ? budget.limit.toString() : "80000");
  const [loading, setLoading] = useState(false);

  const formatSom = (num: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(num)) + " с";

  const handleSave = async () => {
    const val = parseFloat(inputLimit);
    if (!isNaN(val) && val > 0) {
      setLoading(true);
      await onUpdateBudget(val);
      setLoading(false);
      setIsEditing(false);
    }
  };

  const percentage = budget.percentage || 0;
  const isOverBudget = percentage > 100;

  let progressColor = "bg-emerald-500";
  if (percentage > 80 && percentage <= 100) progressColor = "bg-amber-500";
  if (percentage > 100) progressColor = "bg-rose-500";

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Месячный бюджет</h3>
            <p className="text-xs text-slate-400">Лимит расходов на семью</p>
          </div>
        </div>

        <div>
          {isEditing ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                value={inputLimit}
                onChange={(e) => setInputLimit(e.target.value)}
                className="w-28 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Сумма сом"
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors border border-white/5"
            >
              <Edit2 className="w-3 h-3" />
              <span>{budget.limit ? "Изменить" : "Задать лимит"}</span>
            </button>
          )}
        </div>
      </div>

      {budget.limit ? (
        <div className="mt-4">
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="text-slate-300 font-medium">
              Потрачено: <b className="text-white">{formatSom(budget.spent)}</b> из {formatSom(budget.limit)}
            </span>
            <span className={`font-bold ${isOverBudget ? "text-rose-400" : "text-slate-300"}`}>
              {percentage}%
            </span>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs mt-2">
            {isOverBudget ? (
              <span className="text-rose-400 flex items-center space-x-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Превышение на {formatSom(Math.abs(budget.remaining || 0))}</span>
              </span>
            ) : (
              <span className="text-emerald-400">
                Остаток бюджета: <b>{formatSom(budget.remaining || 0)}</b>
              </span>
            )}
            <span className="text-slate-500 text-[11px]">до конца месяца</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-slate-400">
          Лимит на этот месяц пока не установлен. Нажмите «Задать лимит», чтобы контролировать траты.
        </div>
      )}
    </div>
  );
}
