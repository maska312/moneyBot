"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { UserFilter } from "@/components/dashboard/UserFilter";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { BudgetProgressBar } from "@/components/dashboard/BudgetProgressBar";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { DailyTrendChart } from "@/components/dashboard/DailyTrendChart";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddExpenseModal } from "@/components/transactions/AddExpenseModal";
import { EditExpenseModal } from "@/components/transactions/EditExpenseModal";
import { TransactionItemData } from "@/components/transactions/TransactionItem";
import { Plus, Smartphone, Sparkles, RefreshCw, Send } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [currentMonthYear, setCurrentMonthYear] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [selectedUser, setSelectedUser] = useState("all");

  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionItemData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([
    { id: "1", name: "Максат", role: "husband" },
    { id: "2", name: "Баяна", role: "wife" },
  ]);

  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItemData | null>(null);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Analytics
      const analyticsRes = await fetch(
        `/api/analytics?monthYear=${currentMonthYear}&userId=${selectedUser}`
      );
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // 2. Fetch Transactions
      const trxRes = await fetch(
        `/api/transactions?monthYear=${currentMonthYear}&userId=${selectedUser}`
      );
      const trxData = await trxRes.json();
      setTransactions(trxData.items || []);

      // 3. Fetch Categories
      const catRes = await fetch(`/api/categories`);
      const catData = await catRes.json();
      if (catData.categories) {
        setCategories(catData.categories);
      }

      // 4. Fetch Users
      const usersRes = await fetch(`/api/users`);
      const usersData = await usersRes.json();
      if (usersData.users && usersData.users.length > 0) {
        setUsers(usersData.users);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonthYear, selectedUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Add Expense
  const handleAddExpense = async (data: any) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Не удалось добавить расход");
    }

    await fetchData();
  };

  // Handle Edit Expense
  const handleSaveEdit = async (id: string, data: any) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Не удалось обновить расход");
    }

    await fetchData();
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Удалить эту запись о расходе?")) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await fetchData();
    }
  };

  // Handle Update Monthly Budget
  const handleUpdateBudget = async (newLimit: number) => {
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthYear: currentMonthYear,
        limitAmount: newLimit,
      }),
    });
    await fetchData();
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#0b0f19] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/5">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Семейный бюджет
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                KGS (сом)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
              <span>Учет расходов семьи</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">👨 Максат & 👩 Баяна</span>
            </p>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <MonthSelector
              currentMonthYear={currentMonthYear}
              onChange={setCurrentMonthYear}
            />

            <Link
              href="/shortcuts"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
              title="Настройка команд для iPhone"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">iOS Команды</span>
            </Link>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить расход</span>
            </button>
          </div>
        </header>

        {/* User Filter Tabs */}
        <section className="flex justify-between items-center">
          <UserFilter selectedUser={selectedUser} onChange={setSelectedUser} />
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </section>

        {/* Overview Stats Cards */}
        {analytics && (
          <OverviewCards
            totalAmount={analytics.totalAmount || 0}
            dailyAverage={analytics.dailyAverage || 0}
            byUser={analytics.byUser || []}
            transactionCount={analytics.transactionCount || 0}
          />
        )}

        {/* Budget Progress Bar */}
        {analytics?.budget && (
          <BudgetProgressBar
            budget={analytics.budget}
            monthYear={currentMonthYear}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics && (
            <CategoryDonutChart
              categories={analytics.byCategory || []}
              totalAmount={analytics.totalAmount || 0}
            />
          )}

          {analytics && (
            <DailyTrendChart data={analytics.dailyTrend || []} />
          )}
        </div>

        {/* Transactions Feed */}
        <section className="pt-2">
          <TransactionList
            transactions={transactions}
            onEdit={(t) => setEditingTransaction(t)}
            onDelete={handleDeleteExpense}
          />
        </section>
      </main>

      {/* Floating Bottom Bar for Mobile iPhone */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/90 to-transparent sm:hidden safe-bottom pointer-events-none flex justify-center z-40">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pointer-events-auto w-full max-w-xs py-3.5 px-6 rounded-2xl bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-2xl shadow-emerald-500/40 flex items-center justify-center space-x-2 border border-emerald-400/30"
        >
          <Plus className="w-5 h-5" />
          <span>➕ Быстрый расход</span>
        </button>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        users={users}
        onAdd={handleAddExpense}
      />

      <EditExpenseModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        categories={categories}
        users={users}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
