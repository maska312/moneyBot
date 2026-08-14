"use client";

import React, { useState } from "react";
import { TransactionItem, TransactionItemData } from "./TransactionItem";
import { Search, Filter, ReceiptText } from "lucide-react";

interface TransactionListProps {
  transactions: TransactionItemData[];
  onEdit: (t: TransactionItemData) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.includes(searchQuery);

    const matchesCategory =
      selectedCategory === "all" || t.category.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group by Date (Сегодня, Вчера, DD Month YYYY)
  const groupedByDate: Record<string, TransactionItemData[]> = {};

  for (const t of filtered) {
    const dateObj = new Date(t.transactionDate);
    const dateKey = formatDateHeader(dateObj);
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(t);
  }

  // Get unique categories for filter
  const uniqueCategories = Array.from(
    new Map(transactions.map((t) => [t.category.id, t.category])).values()
  );

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">История расходов</h3>
            <p className="text-xs text-slate-400">{filtered.length} записей найдено</p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск трат..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {uniqueCategories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all" className="bg-slate-900 text-white">
                Все категории
              </option>
              {uniqueCategories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ReceiptText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-slate-400">Нет операций за этот период</h4>
          <p className="text-xs text-slate-600 mt-1">Отправьте сообщение боту или нажмите «Добавить расход»</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedByDate).map(([dateLabel, items]) => {
            const dayTotal = items.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            const formattedTotal = new Intl.NumberFormat("ru-RU").format(Math.round(dayTotal)) + " с";

            return (
              <div key={dateLabel} className="space-y-2">
                <div className="flex justify-between items-center px-1 text-xs text-slate-400 font-medium">
                  <span className="text-slate-300 font-semibold">{dateLabel}</span>
                  <span className="text-slate-400">{formattedTotal}</span>
                </div>

                <div className="space-y-1.5">
                  {items.map((t) => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDateHeader(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";

  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() !== now.getFullYear() ? d.getFullYear() : ""}`;
}
