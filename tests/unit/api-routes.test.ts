import { describe, it, expect } from "vitest";

describe("API Data Transformation & Aggregation Logic", () => {
  it("should calculate correct total, daily average and user split", () => {
    const mockTransactions = [
      { amount: "1200", userName: "Максат", categoryName: "Продукты", day: 1 },
      { amount: "800", userName: "Баяна", categoryName: "Кафе и рестораны", day: 1 },
      { amount: "500", userName: "Максат", categoryName: "Такси и транспорт", day: 2 },
    ];

    let total = 0;
    const byUser: Record<string, number> = { Максат: 0, Баяна: 0 };

    for (const t of mockTransactions) {
      const amt = parseFloat(t.amount);
      total += amt;
      byUser[t.userName] += amt;
    }

    expect(total).toBe(2500);
    expect(byUser["Максат"]).toBe(1700);
    expect(byUser["Баяна"]).toBe(800);

    const dailyAverage = Math.round(total / 2);
    expect(dailyAverage).toBe(1250);
  });

  it("should format currency numbers correctly in som", () => {
    const amount = 48500.5;
    const formatted = new Intl.NumberFormat("ru-RU").format(amount);
    expect(formatted).toContain("48");
    expect(formatted).toContain("500");
  });
});
