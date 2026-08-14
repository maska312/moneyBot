"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Plus, User, Tag, FileText, Calendar, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface UserData {
  id: string;
  name: string;
  role: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  users: UserData[];
  onAdd: (data: {
    amount: number;
    categoryId: string;
    userId: string;
    description: string;
    transactionDate: string;
  }) => Promise<void>;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  users,
  onAdd,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [userId, setUserId] = useState(users[0]?.id || "");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleQuickAdd = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Укажите корректную сумму расхода");
      return;
    }

    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }

    if (!userId) {
      setError("Выберите, кто совершил расход");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAdd({
        amount: parsedAmount,
        categoryId,
        userId,
        description: description.trim(),
        transactionDate: new Date(transactionDate).toISOString(),
      });
      // Reset form
      setAmount("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при добавлении расхода");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Добавить расход">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Сумма в сомах (с)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              сом
            </span>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickAdd(q)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 border border-white/5 transition-colors"
              >
                +{q}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount("")}
              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-medium text-rose-300 transition-colors"
            >
              Сброс
            </button>
          </div>
        </div>

        {/* 2. User Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Кто совершил расход?</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {users.map((u) => {
              const isSelected = userId === u.id;
              const isHusband = u.name === "Максат";
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUserId(u.id)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    isSelected
                      ? isHusband
                        ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20"
                        : "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{isHusband ? "👨" : "👩"}</span>
                  <span>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Category Grid */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Категория</span>
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10 font-semibold"
                      : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="text-xl mb-1">{c.icon}</span>
                  <span className="text-[11px] leading-tight line-clamp-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Description & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Описание (опционально)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например, Обед в Навате"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Дата</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 5. Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "Сохранение..." : "Записать расход"}</span>
        </button>
      </form>
    </Modal>
  );
}
