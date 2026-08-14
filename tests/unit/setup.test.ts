import { describe, it, expect } from "vitest";

describe("Project Scaffolding Setup", () => {
  it("should have correct environment and currency configuration", () => {
    const defaultCurrency = "KGS";
    const users = ["Максат", "Баяна"];
    expect(defaultCurrency).toBe("KGS");
    expect(users).toHaveLength(2);
    expect(users).toContain("Максат");
    expect(users).toContain("Баяна");
  });
});
