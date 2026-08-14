import { pgTable, uuid, varchar, text, decimal, timestamp, boolean, bigint, unique } from "drizzle-orm/pg-core";

// 1. Users Table (Максат, Баяна)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).unique(),
  name: varchar("name", { length: 100 }).notNull(), // "Максат" | "Баяна"
  role: varchar("role", { length: 20 }).default("member").notNull(), // "husband" | "wife" | "admin"
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Categories Table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(), // "Продукты", "Кафе и рестораны", etc.
  icon: varchar("icon", { length: 10 }).notNull(), // "🛒", "☕", "🚕", etc.
  color: varchar("color", { length: 10 }).notNull(), // "#10B981", "#F59E0B", etc.
  isSystem: boolean("is_system").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Transactions Table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "restrict" }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("KGS").notNull(), // "KGS"
  description: text("description"),
  rawInput: text("raw_input"),
  source: varchar("source", { length: 30 }).default("telegram_text").notNull(), // "telegram_text" | "telegram_voice" | "telegram_photo" | "web_manual" | "ios_shortcut"
  transactionDate: timestamp("transaction_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Monthly Budgets Table
export const monthlyBudgets = pgTable(
  "monthly_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }), // null = total family budget
    monthYear: varchar("month_year", { length: 7 }).notNull(), // "2026-08"
    limitAmount: decimal("limit_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("monthly_budgets_cat_month_idx").on(table.categoryId, table.monthYear),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type MonthlyBudget = typeof monthlyBudgets.$inferSelect;
export type NewMonthlyBudget = typeof monthlyBudgets.$inferInsert;
