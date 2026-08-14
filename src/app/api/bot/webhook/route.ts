import { NextRequest, NextResponse } from "next/server";
import { parseExpenseText, parseExpenseAudio, parseExpenseImage } from "@/lib/ai/gemini-parser";
import {
  telegramApi,
  downloadTelegramFileAsBase64,
  resolveUser,
  recordExpenseTransaction,
} from "@/lib/telegram/bot";
import { getExpenseActionsKeyboard, getCategoryPickerKeyboard } from "@/lib/telegram/keyboards";
import {
  formatExpenseRecordedMessage,
  formatExpenseCancelledMessage,
} from "@/lib/telegram/messages";
import { db, transactions, categories } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Webhook Secret (if configured)
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (configuredSecret && secretHeader !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 2. Handle Callback Queries (Inline Buttons)
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const tgUser = message.from;

    // Resolve user (Максат or Баяна)
    const user = await resolveUser(tgUser);

    // 3. Handle Commands
    if (message.text && message.text.startsWith("/")) {
      if (message.text.startsWith("/start")) {
        const welcomeText = [
          `👋 <b>Привет, ${user.name}!</b>`,
          ``,
          `Я ваш семейный финансовый бот для учета расходов в сомах.`,
          ``,
          `<b>Как записывать траты:</b>`,
          `• 📝 <b>Текстом:</b> <i>«Такси 220»</i> или <i>«Купил в Народном продукты на 1250»</i>`,
          `• 🎙️ <b>Голосом:</b> Просто надиктуйте расход в голосовом сообщении`,
          `• 📸 <b>Фото:</b> Сфотографируйте чек из магазина или кафе`,
          ``,
          `Все расходы автоматически категоризируются с помощью ИИ и добавляются в общий семейный дашборд!`,
        ].join("\n");

        const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: welcomeText,
          parse_mode: "HTML",
          reply_markup: webAppUrl
            ? {
                inline_keyboard: [
                  [{ text: "📊 Открыть семейный дашборд", web_app: { url: webAppUrl } }],
                ],
              }
            : undefined,
        });

        return NextResponse.json({ ok: true });
      }
    }

    // 4. Handle Voice Messages
    if (message.voice) {
      try {
        const { base64, mimeType } = await downloadTelegramFileAsBase64(message.voice.file_id);
        const parsed = await parseExpenseAudio(base64, mimeType);

        if (!parsed.isExpense || parsed.amount <= 0) {
          await telegramApi("sendMessage", {
            chat_id: chatId,
            text: "🤔 Не удалось разобрать сумму расхода в голосовом сообщении. Попробуйте еще раз.",
          });
          return NextResponse.json({ ok: true });
        }

        const { transaction, category } = await recordExpenseTransaction({
          userId: user.id,
          categoryName: parsed.category,
          amount: parsed.amount,
          description: parsed.description,
          source: "telegram_voice",
          rawInput: "🎙️ Голосовое сообщение",
        });

        const replyText = formatExpenseRecordedMessage({
          amount: parsed.amount,
          category: category.name,
          categoryIcon: category.icon,
          userName: user.name,
          description: parsed.description,
        });

        const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: replyText,
          parse_mode: "HTML",
          reply_markup: getExpenseActionsKeyboard(transaction.id, webAppUrl),
        });
      } catch (err: any) {
        console.error("Voice parse error:", err);
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: `⚠️ Ошибка обработки голосового: ${err.message}`,
        });
      }

      return NextResponse.json({ ok: true });
    }

    // 5. Handle Photos (Receipts)
    if (message.photo && message.photo.length > 0) {
      try {
        // Get the largest photo size
        const photo = message.photo[message.photo.length - 1];
        const { base64, mimeType } = await downloadTelegramFileAsBase64(photo.file_id);
        const parsed = await parseExpenseImage(base64, mimeType);

        if (!parsed.isExpense || parsed.amount <= 0) {
          await telegramApi("sendMessage", {
            chat_id: chatId,
            text: "🤔 Не удалось распознать сумму на чеке. Укажите сумму текстом.",
          });
          return NextResponse.json({ ok: true });
        }

        const { transaction, category } = await recordExpenseTransaction({
          userId: user.id,
          categoryName: parsed.category,
          amount: parsed.amount,
          description: parsed.description,
          source: "telegram_photo",
          rawInput: "📸 Фото чека",
        });

        const replyText = formatExpenseRecordedMessage({
          amount: parsed.amount,
          category: category.name,
          categoryIcon: category.icon,
          userName: user.name,
          description: parsed.description,
        });

        const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: replyText,
          parse_mode: "HTML",
          reply_markup: getExpenseActionsKeyboard(transaction.id, webAppUrl),
        });
      } catch (err: any) {
        console.error("Photo parse error:", err);
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: `⚠️ Ошибка обработки фото чека: ${err.message}`,
        });
      }

      return NextResponse.json({ ok: true });
    }

    // 6. Handle Regular Text Messages
    if (message.text) {
      const parsed = await parseExpenseText(message.text);

      if (!parsed.isExpense || parsed.amount <= 0) {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: "🤔 Не нашел сумму расхода. Напишите, например: <i>«250 кофе»</i> или <i>«Такси 350»</i>.",
          parse_mode: "HTML",
        });
        return NextResponse.json({ ok: true });
      }

      const { transaction, category } = await recordExpenseTransaction({
        userId: user.id,
        categoryName: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        source: "telegram_text",
        rawInput: message.text,
      });

      const replyText = formatExpenseRecordedMessage({
        amount: parsed.amount,
        category: category.name,
        categoryIcon: category.icon,
        userName: user.name,
        description: parsed.description,
      });

      const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;
      await telegramApi("sendMessage", {
        chat_id: chatId,
        text: replyText,
        parse_mode: "HTML",
        reply_markup: getExpenseActionsKeyboard(transaction.id, webAppUrl),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handle Inline Button clicks
 */
async function handleCallbackQuery(callbackQuery: any) {
  const data = callbackQuery.data;
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  if (!data) return;

  // 1. Cancel / Undo expense
  if (data.startsWith("undo:")) {
    const trxId = data.replace("undo:", "");

    try {
      // Find transaction amount
      const [trx] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, trxId))
        .limit(1);

      if (trx) {
        await db.delete(transactions).where(eq(transactions.id, trxId));
        const cancelledText = formatExpenseCancelledMessage(Number(trx.amount), trx.description || undefined);

        await telegramApi("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: cancelledText,
          parse_mode: "HTML",
        });
      } else {
        await telegramApi("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: "❌ <b>Расход уже удален или не найден</b>",
          parse_mode: "HTML",
        });
      }
    } catch (e) {
      console.warn("DB delete error:", e);
      await telegramApi("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: "❌ <b>Расход успешно отменен</b>",
        parse_mode: "HTML",
      });
    }

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
      text: "Расход отменен!",
    });
    return;
  }

  // 2. Open Category Picker Menu
  if (data.startsWith("cat_menu:")) {
    const trxId = data.replace("cat_menu:", "");
    await telegramApi("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: getCategoryPickerKeyboard(trxId),
    });

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
    });
    return;
  }

  // 3. Set New Category
  if (data.startsWith("cat_set:")) {
    const parts = data.split(":");
    const trxId = parts[1];
    const categoryName = parts[2];

    try {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, categoryName))
        .limit(1);

      if (category) {
        await db
          .update(transactions)
          .set({ categoryId: category.id })
          .where(eq(transactions.id, trxId));
      }

      // Re-read transaction
      const [trx] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, trxId))
        .limit(1);

      const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;

      if (trx) {
        const updatedText = formatExpenseRecordedMessage({
          amount: Number(trx.amount),
          category: category ? category.name : categoryName,
          categoryIcon: category ? category.icon : "🏷️",
          userName: callbackQuery.from.first_name || "Максат",
          description: trx.description || undefined,
        });

        await telegramApi("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: updatedText,
          parse_mode: "HTML",
          reply_markup: getExpenseActionsKeyboard(trxId, webAppUrl),
        });
      }
    } catch (e) {
      console.warn("DB update category error:", e);
    }

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
      text: `Категория изменена на "${categoryName}"!`,
    });
    return;
  }

  // 4. Back to main actions
  if (data.startsWith("back:")) {
    const trxId = data.replace("back:", "");
    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;

    await telegramApi("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: getExpenseActionsKeyboard(trxId, webAppUrl),
    });

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
    });
  }
}
