import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseExpenseRegexFallback, parseExpenseText } from "@/lib/ai/gemini-parser";

describe("Gemini & Fallback Expense Parser", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("parseExpenseRegexFallback", () => {
    it("should parse '350 такси' correctly", () => {
      const result = parseExpenseRegexFallback("350 такси");
      expect(result.isExpense).toBe(true);
      expect(result.amount).toBe(350);
      expect(result.category).toBe("Такси и транспорт");
      expect(result.currency).toBe("KGS");
    });

    it("should parse 'Купил кофе за 220 сом' correctly", () => {
      const result = parseExpenseRegexFallback("Купил кофе за 220 сом");
      expect(result.isExpense).toBe(true);
      expect(result.amount).toBe(220);
      expect(result.category).toBe("Кафе и рестораны");
    });

    it("should parse 'Народный 1450' as Grocery products", () => {
      const result = parseExpenseRegexFallback("Народный 1450");
      expect(result.isExpense).toBe(true);
      expect(result.amount).toBe(1450);
      expect(result.category).toBe("Продукты");
    });

    it("should handle non-expense text gracefully", () => {
      const result = parseExpenseRegexFallback("Привет как дела");
      expect(result.isExpense).toBe(false);
      expect(result.amount).toBe(0);
    });
  });

  describe("parseExpenseText with Gemini API Mock", () => {
    it("should call Gemini API and parse structured JSON when GEMINI_API_KEY is present", async () => {
      process.env.GEMINI_API_KEY = "mock-key";

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    isExpense: true,
                    amount: 850,
                    category: "Кафе и рестораны",
                    description: "Обед в Навате",
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await parseExpenseText("Обед в чайхане Нават 850с");
      expect(result.isExpense).toBe(true);
      expect(result.amount).toBe(850);
      expect(result.category).toBe("Кафе и рестораны");
      expect(result.description).toBe("Обед в Навате");
    });

    it("should fallback to regex parser when GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;
      const result = await parseExpenseText("500 продукты");
      expect(result.isExpense).toBe(true);
      expect(result.amount).toBe(500);
      expect(result.category).toBe("Продукты");
    });
  });
});
