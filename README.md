# 💰 Семейный учет расходов (Максат & Баяна)

Умное семейное приложение для быстрого учета расходов по категориям в кыргызских сомах (`KGS` / `с`), разработанное на Next.js 15, PostgreSQL (Supabase/Neon), Google Gemini 2.5 Flash и Telegram Bot API.

---

## 🌟 Ключевые возможности

1. **⚡ Быстрый ввод расхода в 1 клик на iPhone:**
   * **Telegram-бот:** понимает свободный текст (*«Обед в чайхане 850»*, *«такси 250»*), голосовые сообщения на ходу и фотографии бумажных чеков.
   * **iOS Команды (Shortcuts):** виджет на экране блокировки, кнопка действия (Action Button) или Back Tap на iPhone для моментальной отправки без открытия приложений.
   * **Удобный веб-интерфейс:** модальное окно с быстрыми чипсами (`+100`, `+500`, `+1000`) и выбором категории.
2. **🤖 Искусственный интеллект Google Gemini 2.5 Flash:**
   * Автоматическое распознавание суммы, определение нужной категории из 9 базовых категорий и извлечение описания.
3. **📊 Совместная семейная аналитика:**
   * Разделение расходов: **«Все» | «Максат» | «Баяна»**.
   * Круговая диаграмма (Donut Chart) распределения трат по категориям.
   * График расходов по дням месяца.
   * Контроль месячного семейного лимита (бюджета).
4. **📱 PWA & Telegram Mini App:**
   * Работает как нативное приложение при добавлении на экран «Домой» iPhone.
   * Открывается прямо внутри Телеграма по кнопке меню.
5. **🆓 100% Бесплатный стек (0$/месяц):**
   * Vercel Serverless + Supabase PostgreSQL + Google AI Studio + Telegram Bot API.

---

## 🚀 Пошаговая инструкция по запуску и развертыванию

### 1. Создание Telegram Бота
1. В Telegram найдите [@BotFather](https://t.me/BotFather) и отправьте `/newbot`.
2. Введите имя бота (например, `Семейный Бюджет`) и юзернейм (например, `maksat_bayana_money_bot`).
3. Скопируйте полученный **`TELEGRAM_BOT_TOKEN`**.

### 2. Получение ключа Gemini AI (Бесплатно)
1. Перейдите в [Google AI Studio](https://aistudio.google.com).
2. Нажмите **«Get API Key»** → создайте бесплатный ключ.
3. Скопируйте **`GEMINI_API_KEY`**.

### 3. Создание базы данных Supabase (Бесплатно)
1. Зарегистрируйтесь на [supabase.com](https://supabase.com).
2. Создайте новый проект (New Project) с паролем базы данных.
3. Перейдите в **Project Settings → Database → Connection string → URI** (режим Session или Transaction Pooler).
4. Скопируйте строку подключения **`DATABASE_URL`**.

---

### 4. Локальный запуск
1. Склонируйте проект и установите зависимости:
   ```bash
   npm install
   ```
2. Создайте файл `.env.local` на основе `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Заполните переменные окружения в `.env.local`:
   ```env
   DATABASE_URL="postgres://postgres:password@db.xxx.supabase.co:6543/postgres"
   GEMINI_API_KEY="AIzaSy..."
   TELEGRAM_BOT_TOKEN="123456789:ABCdef..."
   TELEGRAM_WEBHOOK_SECRET="super-secret-family-token-2026"
   FAMILY_SECRET_TOKEN="family-secret-money-token"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
4. Примените схему базы данных и начальные данные:
   ```bash
   npx drizzle-kit push
   npm run db:seed
   ```
5. Запустите проект в режиме разработки:
   ```bash
   npm run dev
   ```
6. Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

### 5. Бесплатный деплой на Vercel

1. Загрузите код в репозиторий GitHub.
2. Войдите на [vercel.com](https://vercel.com) → **Add New... → Project** → выберите ваш репозиторий.
3. В разделе **Environment Variables** добавьте все переменные:
   * `DATABASE_URL`
   * `GEMINI_API_KEY`
   * `TELEGRAM_BOT_TOKEN`
   * `TELEGRAM_WEBHOOK_SECRET`
   * `FAMILY_SECRET_TOKEN`
   * `NEXT_PUBLIC_APP_URL` (ваш публичный URL на Vercel, например `https://money-maksat.vercel.app`)
4. Нажмите **Deploy**.

### 6. Установка Telegram Webhook
После завершения деплоя на Vercel привяжите вебхук вашего бота:

Откройте в браузере или выполните в терминале команду:
```bash
curl -X POST "https://api.telegram.org/bot<ВАШ_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ваш-домен.vercel.app/api/bot/webhook",
    "secret_token": "ВАШ_TELEGRAM_WEBHOOK_SECRET"
  }'
```

Теперь бот готов к работе! При отправке любого сообщения или чека бот мгновенно запишет расход в базу данных и отобразит его в дашборде.

---

## 📱 Быстрые команды iOS для iPhone (Shortcuts)

Подробное руководство по настройке виджетов на экране блокировки и Action Button доступно в приложении на странице:
`https://ваш-домен.vercel.app/shortcuts`
