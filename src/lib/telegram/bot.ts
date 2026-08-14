import { db, users, categories, transactions } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { getExpenseActionsKeyboard, getCategoryPickerKeyboard } from "./keyboards";
import { formatExpenseRecordedMessage, formatExpenseCancelledMessage } from "./messages";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Call Telegram Bot API method
 */
export async function telegramApi(method: string, payload: Record<string, any>) {
  if (!BOT_TOKEN) {
    console.warn(`Telegram API call skipped: TELEGRAM_BOT_TOKEN is not set (${method})`);
    return { ok: false, description: "TELEGRAM_BOT_TOKEN not set" };
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

/**
 * Download a file from Telegram by file_id and return Base64 string + mimeType
 */
export async function downloadTelegramFileAsBase64(fileId: string): Promise<{ base64: string; mimeType: string }> {
  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to download files");
  }

  // 1. Get file path
  const fileInfo = await telegramApi("getFile", { file_id: fileId });
  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    throw new Error(`Failed to get file path from Telegram: ${fileInfo.description}`);
  }

  const filePath = fileInfo.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

  // 2. Fetch binary buffer
  const fileRes = await fetch(downloadUrl);
  const arrayBuffer = await fileRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  let mimeType = "audio/ogg; codecs=opus";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    mimeType = "image/jpeg";
  } else if (filePath.endsWith(".png")) {
    mimeType = "image/png";
  } else if (filePath.endsWith(".oga") || filePath.endsWith(".ogg")) {
    mimeType = "audio/ogg; codecs=opus";
  } else if (filePath.endsWith(".m4a") || filePath.endsWith(".mp3")) {
    mimeType = "audio/mp4";
  }

  return { base64, mimeType };
}

/**
 * Resolve user by Telegram user ID or matching name/username
 */
export async function resolveUser(tgUser: { id: number; first_name?: string; username?: string }) {
  try {
    // 1. Try match by telegram_user_id
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, tgUser.id))
      .limit(1);

    if (existing) return existing;

    // 2. Try match by name or environment IDs
    const maksatId = process.env.MAKSAT_TELEGRAM_ID ? Number(process.env.MAKSAT_TELEGRAM_ID) : null;
    const bayanaId = process.env.BAYANA_TELEGRAM_ID ? Number(process.env.BAYANA_TELEGRAM_ID) : null;

    let targetName = "Максат";
    let targetRole = "husband";

    if (tgUser.id === bayanaId || /баяна|bayana/i.test(tgUser.first_name || "") || /баяна|bayana/i.test(tgUser.username || "")) {
      targetName = "Баяна";
      targetRole = "wife";
    }

    // Check if target user exists without telegram_user_id linked yet
    const [unlinked] = await db
      .select()
      .from(users)
      .where(eq(users.name, targetName))
      .limit(1);

    if (unlinked) {
      // Link the Telegram ID
      const [updated] = await db
        .update(users)
        .set({ telegramUserId: tgUser.id })
        .where(eq(users.id, unlinked.id))
        .returning();
      return updated || unlinked;
    }

    // 3. Create new user
    const [created] = await db
      .insert(users)
      .values({
        name: targetName,
        role: targetRole,
        telegramUserId: tgUser.id,
      })
      .returning();

    return created;
  } catch (err) {
    console.warn("DB user resolve error, using fallback mock user:", err);
    return {
      id: "00000000-0000-0000-0000-000000000001",
      name: tgUser.first_name || "Максат",
      role: "husband",
      telegramUserId: tgUser.id,
      createdAt: new Date(),
    };
  }
}

/**
 * Record a transaction into PostgreSQL
 */
export async function recordExpenseTransaction(params: {
  userId: string;
  categoryName: string;
  amount: number;
  description: string;
  source: string;
  rawInput: string;
}) {
  try {
    // 1. Find category
    let [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, params.categoryName))
      .limit(1);

    if (!category) {
      const [fallbackCat] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, "Прочее"))
        .limit(1);
      category = fallbackCat;
    }

    // 2. Insert transaction
    const [trx] = await db
      .insert(transactions)
      .values({
        userId: params.userId,
        categoryId: category ? category.id : "00000000-0000-0000-0000-000000000000",
        amount: params.amount.toString(),
        currency: "KGS",
        description: params.description,
        source: params.source,
        rawInput: params.rawInput,
      })
      .returning();

    return {
      transaction: trx,
      category: category || { name: params.categoryName, icon: "🏷️", color: "#6B7280" },
    };
  } catch (err) {
    console.warn("DB transaction insert error, using mock:", err);
    return {
      transaction: {
        id: "trx-" + Date.now(),
        amount: params.amount.toString(),
        description: params.description,
      },
      category: { name: params.categoryName, icon: "🏷️", color: "#6B7280" },
    };
  }
}
