"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthSelectorProps {
  currentMonthYear: string; // e.g. "2026-08"
  onChange: (monthYear: string) => void;
}

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

export function MonthSelector({ currentMonthYear, onChange }: MonthSelectorProps) {
  const [yearStr, monthStr] = currentMonthYear.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1 to 12

  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="flex items-center space-x-1 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Предыдущий месяц"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center px-3 py-1 text-sm font-semibold text-slate-100 tracking-wide space-x-2">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <span>{monthLabel}</span>
      </div>

      <button
        onClick={handleNext}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Следующий месяц"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
