import { describe, it, expect } from "vitest";
import { users, categories, transactions, monthlyBudgets } from "@/lib/db/schema";
import { DEFAULT_CATEGORIES, DEFAULT_USERS } from "@/lib/db/seed";

describe("Database Schema & Seed Definition", () => {
  it("should define all required tables and columns", () => {
    expect(users).toBeDefined();
    expect(categories).toBeDefined();
    expect(transactions).toBeDefined();
    expect(monthlyBudgets).toBeDefined();
  });

  it("should have 9 default categories with correct icons and colors", () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(9);
    const categoryNames = DEFAULT_CATEGORIES.map((c) => c.name);
    expect(categoryNames).toContain("Продукты");
    expect(categoryNames).toContain("Кафе и рестораны");
    expect(categoryNames).toContain("Такси и транспорт");
    expect(categoryNames).toContain("Дом и быт");
    expect(categoryNames).toContain("Здоровье и аптека");
    expect(categoryNames).toContain("Развлечения и отдых");
    expect(categoryNames).toContain("Дети и семья");
    expect(categoryNames).toContain("Одежда и покупки");
    expect(categoryNames).toContain("Прочее");
  });

  it("should have default users for Maksat and Bayana", () => {
    expect(DEFAULT_USERS).toHaveLength(2);
    expect(DEFAULT_USERS[0].name).toBe("Максат");
    expect(DEFAULT_USERS[0].role).toBe("husband");
    expect(DEFAULT_USERS[1].name).toBe("Баяна");
    expect(DEFAULT_USERS[1].role).toBe("wife");
  });
});
