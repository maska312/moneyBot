import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/lib/../app/api/bot/webhook/route";
import { NextRequest } from "next/server";
import { getExpenseActionsKeyboard, getCategoryPickerKeyboard } from "@/lib/telegram/keyboards";
import { formatExpenseRecordedMessage, formatExpenseCancelledMessage } from "@/lib/telegram/messages";

describe("Telegram Webhook & Message Formatting", () => {
  describe("Keyboards", () => {
    it("should generate expense action buttons with undo and category picker", () => {
      const kb = getExpenseActionsKeyboard("test-trx-123", "https://app.vercel.app");
      expect(kb.inline_keyboard[0][0].text).toContain("Отменить");
      expect(kb.inline_keyboard[0][0].callback_data).toBe("undo:test-trx-123");
      expect(kb.inline_keyboard[0][1].text).toContain("Категория");
      expect(kb.inline_keyboard[1][0].text).toContain("дашборд");
    });

    it("should generate 9 categories in picker grid", () => {
      const kb = getCategoryPickerKeyboard("test-trx-123");
      expect(kb.inline_keyboard.length).toBeGreaterThanOrEqual(5); // 9 categories / 2 per row + back button
      const backBtn = kb.inline_keyboard[kb.inline_keyboard.length - 1][0];
      expect(backBtn.text).toContain("Назад");
    });
  });

  describe("Message Formatting", () => {
    it("should format recorded expense in KGS som with HTML tags", () => {
      const msg = formatExpenseRecordedMessage({
        amount: 1500,
        category: "Продукты",
        categoryIcon: "🛒",
        userName: "Максат",
        description: "Гипермаркет Фрунзе",
      });

      expect(msg).toContain("1 500 сом");
      expect(msg).toContain("🛒 <b>Продукты</b>");
      expect(msg).toContain("<b>Максат</b>");
      expect(msg).toContain("Гипермаркет Фрунзе");
    });

    it("should format cancelled message", () => {
      const msg = formatExpenseCancelledMessage(500, "Такси");
      expect(msg).toContain("500 сом");
      expect(msg).toContain("Расход отменен");
    });
  });
});
