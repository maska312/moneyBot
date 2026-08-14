import { db, users, categories } from "./index";

export const DEFAULT_CATEGORIES = [
  { name: "Продукты", icon: "🛒", color: "#10B981", isSystem: true },
  { name: "Кафе и рестораны", icon: "☕", color: "#F59E0B", isSystem: true },
  { name: "Такси и транспорт", icon: "🚕", color: "#3B82F6", isSystem: true },
  { name: "Дом и быт", icon: "🏠", color: "#8B5CF6", isSystem: true },
  { name: "Здоровье и аптека", icon: "💊", color: "#EF4444", isSystem: true },
  { name: "Развлечения и отдых", icon: "🎉", color: "#EC4899", isSystem: true },
  { name: "Дети и семья", icon: "👶", color: "#06B6D4", isSystem: true },
  { name: "Одежда и покупки", icon: "👗", color: "#F97316", isSystem: true },
  { name: "Прочее", icon: "📦", color: "#6B7280", isSystem: true },
];

export const DEFAULT_USERS = [
  {
    name: "Максат",
    role: "husband",
    telegramUserId: process.env.MAKSAT_TELEGRAM_ID ? Number(process.env.MAKSAT_TELEGRAM_ID) : null,
  },
  {
    name: "Баяна",
    role: "wife",
    telegramUserId: process.env.BAYANA_TELEGRAM_ID ? Number(process.env.BAYANA_TELEGRAM_ID) : null,
  },
];

export async function seedDatabase() {
  console.log("🌱 Seeding default users & categories...");

  // Seed Categories
  for (const cat of DEFAULT_CATEGORIES) {
    try {
      await db.insert(categories).values(cat).onConflictDoNothing();
    } catch (e) {
      console.warn(`Category ${cat.name} already exists or error:`, e);
    }
  }

  // Seed Users
  for (const user of DEFAULT_USERS) {
    try {
      await db.insert(users).values(user).onConflictDoNothing();
    } catch (e) {
      console.warn(`User ${user.name} already exists or error:`, e);
    }
  }

  console.log("✅ Database seeded successfully!");
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
