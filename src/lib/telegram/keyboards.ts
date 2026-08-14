import { DEFAULT_CATEGORIES } from "@/lib/db/seed";

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  web_app?: { url: string };
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Main action keyboard shown under newly recorded expense
 */
export function getExpenseActionsKeyboard(transactionId: string, webAppUrl?: string): InlineKeyboardMarkup {
  const keyboard: InlineKeyboardButton[][] = [
    [
      { text: "🗑️ Отменить", callback_data: `undo:${transactionId}` },
      { text: "✏️ Категория", callback_data: `cat_menu:${transactionId}` },
    ],
  ];

  if (webAppUrl) {
    keyboard.push([
      { text: "📊 Открыть дашборд", web_app: { url: webAppUrl } },
    ]);
  }

  return { inline_keyboard: keyboard };
}

/**
 * Category picker keyboard showing grid of 9 categories
 */
export function getCategoryPickerKeyboard(transactionId: string, categories = DEFAULT_CATEGORIES): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = [];
  let currentRow: InlineKeyboardButton[] = [];

  for (const cat of categories) {
    currentRow.push({
      text: `${cat.icon} ${cat.name}`,
      callback_data: `cat_set:${transactionId}:${cat.name}`,
    });

    if (currentRow.length === 2) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  rows.push([{ text: "« Назад", callback_data: `back:${transactionId}` }]);

  return { inline_keyboard: rows };
}
