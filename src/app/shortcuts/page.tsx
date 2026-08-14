"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, Check, Copy, Send, Sparkles, Zap, Shield } from "lucide-react";

export default function ShortcutsPage() {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testText, setTestText] = useState("Такси 350");
  const [testUser, setTestUser] = useState("Максат");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleCopyCurl = () => {
    const curl = `curl -X POST https://your-app.vercel.app/api/transactions/quick \\
  -H "Content-Type: application/json" \\
  -H "x-family-token: YOUR_SECRET_TOKEN" \\
  -d '{"text": "Такси 350", "userName": "Максат"}'`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestQuickEndpoint = async () => {
    setTestLoading(true);
    setTestResponse(null);

    try {
      const res = await fetch("/api/transactions/quick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testText,
          userName: testUser,
        }),
      });

      const data = await res.json();
      setTestResponse(data);
    } catch (e: any) {
      setTestResponse({ error: e.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>« Вернуться в дашборд</span>
        </Link>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Быстрый ввод с iPhone (iOS Команды)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Настройка ввода расхода в 1 касание для Максата и Баяны
            </p>
          </div>
        </div>
      </div>

      {/* Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Apple Shortcuts App */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400">
            <Zap className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Способ 1: Команда iOS (Shortcuts)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Позволяет нажать кнопку действия (Action Button), виджет на экране блокировки или коснуться задней крышки iPhone (Back Tap), надиктовать/ввести расход и мгновенно сохранить его.
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>1.</b> Откройте приложение <b>«Быстрые команды» (Shortcuts)</b> на iPhone.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>2.</b> Нажмите <b>+ (Создать команду)</b> → добавьте действие <b>«Запросить ввод»</b> (Текст: <i>«Какой расход?»</i>).
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>3.</b> Добавьте действие <b>«Получить содержимое URL»</b>:
              <ul className="list-disc list-inside mt-1 text-slate-400 space-y-0.5">
                <li>URL: <code className="text-emerald-400">https://ваш-домен.vercel.app/api/transactions/quick</code></li>
                <li>Метод: <b>POST</b></li>
                <li>Заголовки: <code>x-family-token</code>: <i>ваш-пароль</i></li>
                <li>Тело запроса (JSON): <code>text</code>: <i>Предоставленный ввод</i>, <code>userName</code>: <i>Максат</i> (или <i>Баяна</i>)</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>4.</b> Добавьте действие <b>«Показать уведомление»</b> с текстом из ответа: <code>notificationText</code>.
            </div>
          </div>
        </div>

        {/* Option 2: Telegram Bot Shortcut */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-sky-400">
            <Send className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Способ 2: Telegram Бот</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Самый простой и быстрый способ без дополнительных настроек:
          </p>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>• Закрепите бота в Telegram:</b> Добавьте бота в семейную группу или закрепите вверху списка чатов.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>• Голосовые сообщения:</b> Зажимайте микрофон в чате и наговаривайте: <i>«Бензин 1800 на Газпроме»</i>.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>• Фото чеков:</b> Просто отправьте фото чека в чат — бот распознает сумму и категорию.
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <b>• Иконка на экран Домой:</b> Откройте веб-дашборд в Safari → нажмите «Поделиться» → «На экран “Домой”».
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick API Tester */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Интерактивный тест API быстрого расхода</h3>
          </div>
          <button
            onClick={handleCopyCurl}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 transition-colors"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? "Скопировано!" : "Скопировать cURL"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Текст сообщения
            </label>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Например: Такси 350 сом"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Автор
            </label>
            <select
              value={testUser}
              onChange={(e) => setTestUser(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Максат" className="bg-slate-900">👨 Максат</option>
              <option value="Баяна" className="bg-slate-900">👩 Баяна</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleTestQuickEndpoint}
          disabled={testLoading}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testLoading ? "Отправка..." : "Протестировать добавление расхода"}</span>
        </button>

        {testResponse && (
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-slate-300">Ответ сервера:</div>
            <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
