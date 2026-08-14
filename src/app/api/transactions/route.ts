import { NextRequest, NextResponse } from "next/server";
import { db, transactions, users, categories } from "@/lib/db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthYear = searchParams.get("monthYear") || new Date().toISOString().slice(0, 7); // e.g. "2026-08"
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    const startDate = new Date(`${monthYear}-01T00:00:00.000Z`);
    // End of month
    const [year, month] = monthYear.split("-").map(Number);
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const conditions = [
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate),
    ];

    if (userId && userId !== "all") {
      conditions.push(eq(transactions.userId, userId));
    }

    if (categoryId && categoryId !== "all") {
      conditions.push(eq(transactions.categoryId, categoryId));
    }

    const items = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        currency: transactions.currency,
        description: transactions.description,
        source: transactions.source,
        rawInput: transactions.rawInput,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        user: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate));

    return NextResponse.json({ items, monthYear });
  } catch (error: any) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, categoryId, userId, description, transactionDate, source } = body;

    if (!amount || !categoryId || !userId) {
      return NextResponse.json(
        { error: "amount, categoryId, and userId are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(transactions)
      .values({
        amount: amount.toString(),
        categoryId,
        userId,
        description: description || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        source: source || "web_manual",
        currency: "KGS",
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
