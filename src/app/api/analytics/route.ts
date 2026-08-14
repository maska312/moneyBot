import { NextRequest, NextResponse } from "next/server";
import { db, transactions, users, categories, monthlyBudgets } from "@/lib/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthYear = searchParams.get("monthYear") || new Date().toISOString().slice(0, 7); // "2026-08"
    const selectedUserId = searchParams.get("userId"); // "all" | specific userId

    const [year, month] = monthYear.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(year, month, 0).getDate();

    const conditions = [
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate),
    ];

    if (selectedUserId && selectedUserId !== "all") {
      conditions.push(eq(transactions.userId, selectedUserId));
    }

    // 1. Fetch all month transactions with joined tables
    const trxs = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        userId: transactions.userId,
        userName: users.name,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions));

    // 2. Fetch monthly budget
    const [generalBudget] = await db
      .select()
      .from(monthlyBudgets)
      .where(
        and(
          eq(monthlyBudgets.monthYear, monthYear),
          sql`${monthlyBudgets.categoryId} IS NULL`
        )
      )
      .limit(1);

    // 3. Compute Totals & Aggregations
    let totalAmount = 0;
    const byUserMap: Record<string, { name: string; amount: number; count: number }> = {
      Максат: { name: "Максат", amount: 0, count: 0 },
      Баяна: { name: "Баяна", amount: 0, count: 0 },
    };

    const byCategoryMap: Record<
      string,
      { name: string; icon: string; color: string; amount: number; count: number }
    > = {};

    // Prepare daily trend array [ { day: 1, amount: 0 }, ... ]
    const dailyTrendMap: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyTrendMap[d] = 0;
    }

    for (const t of trxs) {
      const amt = parseFloat(t.amount);
      totalAmount += amt;

      // By User
      const uName = t.userName || "Максат";
      if (!byUserMap[uName]) {
        byUserMap[uName] = { name: uName, amount: 0, count: 0 };
      }
      byUserMap[uName].amount += amt;
      byUserMap[uName].count += 1;

      // By Category
      const cName = t.categoryName || "Прочее";
      if (!byCategoryMap[cName]) {
        byCategoryMap[cName] = {
          name: cName,
          icon: t.categoryIcon || "🏷️",
          color: t.categoryColor || "#6B7280",
          amount: 0,
          count: 0,
        };
      }
      byCategoryMap[cName].amount += amt;
      byCategoryMap[cName].count += 1;

      // By Day
      const day = new Date(t.transactionDate).getUTCDate();
      if (dailyTrendMap[day] !== undefined) {
        dailyTrendMap[day] += amt;
      }
    }

    const byCategory = Object.values(byCategoryMap)
      .map((c) => ({
        ...c,
        percentage: totalAmount > 0 ? Number(((c.amount / totalAmount) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const dailyTrend = Object.entries(dailyTrendMap).map(([day, amount]) => ({
      day: Number(day),
      dateLabel: `${day} ${getMonthName(month)}`,
      amount,
    }));

    const todayDate = new Date().getDate();
    const passedDays = Math.min(todayDate, daysInMonth);
    const dailyAverage = passedDays > 0 ? Math.round(totalAmount / passedDays) : 0;

    const budgetLimit = generalBudget ? parseFloat(generalBudget.limitAmount) : null;
    const budgetRemaining = budgetLimit !== null ? budgetLimit - totalAmount : null;
    const budgetPercentage =
      budgetLimit !== null && budgetLimit > 0
        ? Number(((totalAmount / budgetLimit) * 100).toFixed(1))
        : null;

    return NextResponse.json({
      monthYear,
      totalAmount,
      dailyAverage,
      transactionCount: trxs.length,
      byUser: Object.values(byUserMap),
      byCategory,
      dailyTrend,
      budget: {
        limit: budgetLimit,
        spent: totalAmount,
        remaining: budgetRemaining,
        percentage: budgetPercentage,
      },
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getMonthName(m: number): string {
  const months = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек"
  ];
  return months[m - 1] || "";
}
