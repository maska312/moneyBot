import { NextRequest, NextResponse } from "next/server";
import { parseExpenseText } from "@/lib/ai/gemini-parser";
import { recordExpenseTransaction } from "@/lib/telegram/bot";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify family token (if configured)
    const token = req.headers.get("x-family-token");
    const configuredToken = process.env.FAMILY_SECRET_TOKEN;

    if (configuredToken && token !== configuredToken) {
      return NextResponse.json({ error: "Invalid family token" }, { status: 401 });
    }

    const body = await req.json();
    const text = body.text?.trim();
    const requestedUserName = body.userName || body.user || "Максат";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 2. Resolve User
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.name, requestedUserName))
      .limit(1);

    if (!user) {
      const [firstUser] = await db.select().from(users).limit(1);
      user = firstUser;
    }

    if (!user) {
      user = {
        id: "00000000-0000-0000-0000-000000000001",
        name: requestedUserName,
        role: "husband",
        telegramUserId: null,
        avatarUrl: null,
        createdAt: new Date(),
      };
    }

    // 3. Parse expense text with Gemini
    const parsed = await parseExpenseText(text);

    if (!parsed.isExpense || parsed.amount <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Не удалось определить сумму расхода",
          rawInput: text,
        },
        { status: 422 }
      );
    }

    // 4. Save to DB
    const { transaction, category } = await recordExpenseTransaction({
      userId: user.id,
      categoryName: parsed.category,
      amount: parsed.amount,
      description: parsed.description,
      source: "ios_shortcut",
      rawInput: text,
    });

    const formattedAmount = new Intl.NumberFormat("ru-RU").format(parsed.amount);

    return NextResponse.json({
      ok: true,
      amount: parsed.amount,
      currency: "KGS",
      category: category.name,
      categoryIcon: category.icon,
      description: parsed.description,
      user: user.name,
      transactionId: transaction.id,
      notificationText: `✅ Записано: ${formattedAmount} сом (${category.name}) • ${user.name}`,
    });
  } catch (error: any) {
    console.error("POST /api/transactions/quick error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
