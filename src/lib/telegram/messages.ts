export function formatExpenseRecordedMessage(params: {
  amount: number;
  category: string;
  categoryIcon?: string;
  userName: string;
  description?: string;
  currency?: string;
}): string {
  const icon = params.categoryIcon || "🏷️";
  const curr = params.currency || "сом";
  const formattedAmount = new Intl.NumberFormat("ru-RU").format(params.amount);

  return [
    `✅ <b>Записан расход: ${formattedAmount} ${curr}</b>`,
    ``,
    `📁 Категория: ${icon} <b>${params.category}</b>`,
    `👤 Кто: <b>${params.userName}</b>`,
    params.description ? `📝 Описание: <i>${params.description}</i>` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatExpenseCancelledMessage(amount: number, description?: string): string {
  const formattedAmount = new Intl.NumberFormat("ru-RU").format(amount);
  return `❌ <b>Расход отменен: ${formattedAmount} сом</b>${description ? ` (${description})` : ""}`;
}

export function formatMonthlySummaryMessage(params: {
  monthYear: string;
  totalAmount: number;
  maksatAmount: number;
  bayanaAmount: number;
  topCategories: { name: string; icon: string; amount: number }[];
}): string {
  const total = new Intl.NumberFormat("ru-RU").format(params.totalAmount);
  const maksat = new Intl.NumberFormat("ru-RU").format(params.maksatAmount);
  const bayana = new Intl.NumberFormat("ru-RU").format(params.bayanaAmount);

  let msg = `📊 <b>Семейный бюджет за ${params.monthYear}</b>\n\n`;
  msg += `💰 <b>Всего расходов:</b> ${total} сом\n`;
  msg += `├ 👨 Максат: ${maksat} сом\n`;
  msg += `└ 👩 Баяна: ${bayana} сом\n\n`;

  if (params.topCategories.length > 0) {
    msg += `<b>Топ категорий:</b>\n`;
    for (const cat of params.topCategories) {
      const catAmount = new Intl.NumberFormat("ru-RU").format(cat.amount);
      msg += `${cat.icon} ${cat.name}: <b>${catAmount} сом</b>\n`;
    }
  }

  return msg;
}
