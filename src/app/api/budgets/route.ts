import { NextRequest, NextResponse } from "next/server";
import { db, monthlyBudgets, categories } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthYear = searchParams.get("monthYear") || new Date().toISOString().slice(0, 7);

    const budgets = await db
      .select({
        id: monthlyBudgets.id,
        categoryId: monthlyBudgets.categoryId,
        monthYear: monthlyBudgets.monthYear,
        limitAmount: monthlyBudgets.limitAmount,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(monthlyBudgets)
      .leftJoin(categories, eq(monthlyBudgets.categoryId, categories.id))
      .where(eq(monthlyBudgets.monthYear, monthYear));

    return NextResponse.json({ budgets, monthYear });
  } catch (error: any) {
    return NextResponse.json({ budgets: [], monthYear: "", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, monthYear, limitAmount } = body;

    if (!monthYear || !limitAmount) {
      return NextResponse.json({ error: "monthYear and limitAmount are required" }, { status: 400 });
    }

    const [budget] = await db
      .insert(monthlyBudgets)
      .values({
        categoryId: categoryId || null,
        monthYear,
        limitAmount: limitAmount.toString(),
      })
      .onConflictDoUpdate({
        target: [monthlyBudgets.categoryId, monthlyBudgets.monthYear],
        set: { limitAmount: limitAmount.toString() },
      })
      .returning();

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
