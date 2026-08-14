"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { TransactionItemData } from "./TransactionItem";
import { Save, User, Tag, FileText, Calendar } from "lucide-react";

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

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItemData | null;
  categories: Category[];
  users: UserData[];
  onSave: (id: string, data: {
    amount: number;
    categoryId: string;
    userId: string;
    description: string;
    transactionDate: string;
  }) => Promise<void>;
}

export function EditExpenseModal({
  isOpen,
  onClose,
  transaction,
  categories,
  users,
  onSave,
}: EditExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setCategoryId(transaction.category.id);
      setUserId(transaction.user.id);
      setDescription(transaction.description || "");
      const d = new Date(transaction.transactionDate);
      setTransactionDate(d.toISOString().slice(0, 10));
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Укажите корректную сумму расхода");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(transaction.id, {
        amount: parsedAmount,
        categoryId,
        userId,
        description: description.trim(),
        transactionDate: new Date(transactionDate).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Редактировать расход">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Amount */}
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xl font-bold text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              сом
            </span>
          </div>
        </div>

        {/* User */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Кто совершил расход?
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
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    isSelected
                      ? isHusband
                        ? "bg-blue-500 text-white border-blue-400"
                        : "bg-pink-500 text-white border-pink-400"
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

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Категория
          </label>
          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500 text-white font-semibold"
                      : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="text-lg block mb-0.5">{c.icon}</span>
                  <span className="text-[10px] leading-tight line-clamp-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Дата
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all mt-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Сохранение..." : "Сохранить изменения"}</span>
        </button>
      </form>
    </Modal>
  );
}
