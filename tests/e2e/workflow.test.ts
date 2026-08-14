import { describe, it, expect } from "vitest";
import { parseExpenseRegexFallback } from "@/lib/ai/gemini-parser";
import { formatExpenseRecordedMessage, formatMonthlySummaryMessage } from "@/lib/telegram/messages";
import { getExpenseActionsKeyboard, getCategoryPickerKeyboard } from "@/lib/telegram/keyboards";
import { DEFAULT_CATEGORIES, DEFAULT_USERS } from "@/lib/db/seed";

describe("End-to-End Family Expense Workflow", () => {
  it("Scenario 1: Maksat logs taxi expense via natural text", () => {
    const input = "Яндекс такси 250 сом";
    const parsed = parseExpenseRegexFallback(input);

    expect(parsed.isExpense).toBe(true);
    expect(parsed.amount).toBe(250);
    expect(parsed.category).toBe("Такси и транспорт");
    expect(parsed.currency).toBe("KGS");

    const message = formatExpenseRecordedMessage({
      amount: parsed.amount,
      category: parsed.category,
      categoryIcon: "🚕",
      userName: "Максат",
      description: parsed.description,
    });

    expect(message).toContain("250 сом");
    expect(message).toContain("🚕 <b>Такси и транспорт</b>");
    expect(message).toContain("<b>Максат</b>");

    const keyboard = getExpenseActionsKeyboard("mock-trx-1");
    expect(keyboard.inline_keyboard[0][0].callback_data).toBe("undo:mock-trx-1");
    expect(keyboard.inline_keyboard[0][1].callback_data).toBe("cat_menu:mock-trx-1");
  });

  it("Scenario 2: Bayana logs groceries in Narodnyi", () => {
    const input = "Купила в Народном продукты на 1850с";
    const parsed = parseExpenseRegexFallback(input);

    expect(parsed.isExpense).toBe(true);
    expect(parsed.amount).toBe(1850);
    expect(parsed.category).toBe("Продукты");

    const message = formatExpenseRecordedMessage({
      amount: parsed.amount,
      category: parsed.category,
      categoryIcon: "🛒",
      userName: "Баяна",
      description: parsed.description,
    });

    expect(message).toContain("1 850 сом");
    expect(message).toContain("🛒 <b>Продукты</b>");
    expect(message).toContain("<b>Баяна</b>");
  });

  it("Scenario 3: Monthly family summary aggregation", () => {
    const summary = formatMonthlySummaryMessage({
      monthYear: "Август 2026",
      totalAmount: 65400,
      maksatAmount: 38200,
      bayanaAmount: 27200,
      topCategories: [
        { name: "Продукты", icon: "🛒", amount: 25000 },
        { name: "Кафе и рестораны", icon: "☕", amount: 14000 },
        { name: "Такси и транспорт", icon: "🚕", amount: 8400 },
      ],
    });

    expect(summary).toContain("Август 2026");
    expect(summary).toContain("65 400 сом");
    expect(summary).toContain("👨 Максат: 38 200 сом");
    expect(summary).toContain("👩 Баяна: 27 200 сом");
    expect(summary).toContain("🛒 Продукты: <b>25 000 сом</b>");
  });

  it("Scenario 4: Category picker keyboard has all 9 standard categories", () => {
    const picker = getCategoryPickerKeyboard("mock-trx-2", DEFAULT_CATEGORIES);
    expect(picker.inline_keyboard.length).toBe(6); // 9 categories (2 per row = 5 rows) + 1 back row
    const allButtons = picker.inline_keyboard.flat();
    expect(allButtons.some((b) => b.text.includes("Продукты"))).toBe(true);
    expect(allButtons.some((b) => b.text.includes("Кафе и рестораны"))).toBe(true);
    expect(allButtons.some((b) => b.text.includes("Назад"))).toBe(true);
  });
});
