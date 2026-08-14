import { NextRequest, NextResponse } from "next/server";
import { db, transactions } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted });
  } catch (error: any) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, categoryId, userId, description, transactionDate } = body;

    const updateData: Record<string, any> = {};
    if (amount !== undefined) updateData.amount = amount.toString();
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (userId !== undefined) updateData.userId = userId;
    if (description !== undefined) updateData.description = description;
    if (transactionDate !== undefined) updateData.transactionDate = new Date(transactionDate);

    const [updated] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
