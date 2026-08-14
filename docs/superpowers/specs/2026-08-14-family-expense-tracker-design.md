# Семейный учет расходов (Family Expense Tracker) — Дизайн-документ и Спецификация

## 1. Обзор и цели системы

**Семейный учет расходов** — это высокопроизводительное, кроссплатформенное приложение для быстрого учета и совместной аналитики семейных финансов для **Максата** и **Баяны**.

### Ключевые цели:
1. **Мгновенный ввод расхода на iPhone (до 3 секунд):**
   * Через **Telegram-бота**: свободным текстом (например, `кофе и круассан 450`), голосовым сообщением на ходу или фотографией чека.
   * Через **iOS Shortcuts (Быстрые команды)**: по нажатию Action Button / виджета блокировки / Back Tap на iPhone.
2. **Интеллектуальная обработка с Gemini 2.5 Flash:**
   * Автоматическое извлечение суммы, категории, названия заведения и описания из текста, голоса или фото чека.
3. **Совместная аналитика и учет в сомах (KGS / с):**
   * Общий семейный баланс с четким разделением, кто совершил трату (Максат / Баяна).
   * Красивый адаптивный веб-дашборд (PWA / Telegram Mini App) с круговыми диаграммами, динамикой расходов по дням и контролем лимитов.
4. **100% бесплатный стек хостинга и инфраструктуры:**
   * Vercel (Next.js Serverless) + Supabase (PostgreSQL) + Google Gemini API + Telegram Bot API.

---

## 2. Пользователи и роли

| Пользователь | Роль | Способы взаимодействия |
| :--- | :--- | :--- |
| **Максат** | Глава семьи / Муж | Telegram-бот, iOS Shortcut, Веб-дашборд / PWA |
| **Баяна** | Супруга / Жена | Telegram-бот, iOS Shortcut, Веб-дашборд / PWA |

---

## 3. Архитектура и стек технологий

```mermaid
graph TD
    A[iPhone Максата] -->|Текст / Голос / Фото / iOS Shortcut| TB[Telegram Bot / Webhook]
    B[iPhone Баяны] -->|Текст / Голос / Фото / iOS Shortcut| TB
    TB -->|Next.js 15 Serverless Webhook| API[/api/bot/webhook]
    API -->|Мультимодальный парсинг| GEMINI[Google Gemini 2.5 Flash API]
    GEMINI -->|Сумма, Категория, Описание| API
    API -->|Запись транзакции| DB[(Supabase PostgreSQL)]
    API -->|Ответ с инлайн-кнопками| TB
    
    A -->|PWA / Safari / Telegram Mini App| DASH[Next.js 15 Web Dashboard]
    B -->|PWA / Safari / Telegram Mini App| DASH
    DASH -->|Drizzle ORM / SQL Queries| DB
```

### Технологический стек:
* **Frontend**: Next.js 15 (App Router, React 19), Tailwind CSS / Vanilla CSS (стильный темный и светлый режим, Glassmorphism), Lucide Icons, Recharts для интерактивных графиков.
* **Backend API**: Next.js Route Handlers (Edge / Serverless functions на Vercel).
* **Database**: Supabase PostgreSQL (бесплатный тариф) + Drizzle ORM для типобезопасных запросов и миграций.
* **AI Engine**: Google Gemini 2.5 Flash (`@google/genai` SDK) для мгновенного разбора текста, расшифровки аудио (OGG/Opus) и OCR чеков.
* **Telegram Integration**: Telegraf / grammY / прямой Webhook обработчик Telegram Bot API с поддержкой Telegram Mini App.
* **PWA & Mobile**: Web App Manifest, Service Worker для оффлайн-кэширования и установки на домашний экран iOS.

---

## 4. Модель данных (Схема базы данных)

### 4.1. `users` (Пользователи)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE,
    name VARCHAR(100) NOT NULL, -- 'Максат', 'Баяна'
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'husband', 'wife', 'admin'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2. `categories` (Категории расходов)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL, -- '🛒', '🚕', '☕', '🏠', '💊', '🎉', '👶', '👗', '📦'
    color VARCHAR(7) NOT NULL, -- '#10B981', '#3B82F6', etc.
    is_system BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
*Стандартные категории:*
1. 🛒 **Продукты** (`#10B981`)
2. ☕ **Кафе и рестораны** (`#F59E0B`)
3. 🚕 **Такси и транспорт** (`#3B82F6`)
4. 🏠 **Дом и коммуналка** (`#8B5CF6`)
5. 💊 **Здоровье и аптека** (`#EF4444`)
6. 🎉 **Развлечения и отдых** (`#EC4899`)
7. 👶 **Дети и семья** (`#06B6D4`)
8. 👗 **Одежда и покупки** (`#F97316`)
9. 📦 **Прочее** (`#6B7280`)

### 4.3. `transactions` (Транзакции)
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'KGS',
    description TEXT,
    raw_input TEXT,
    source VARCHAR(30) NOT NULL DEFAULT 'telegram_text', -- 'telegram_text', 'telegram_voice', 'telegram_photo', 'web_manual', 'ios_shortcut'
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.4. `monthly_budgets` (Месячные бюджеты / Лимиты)
```sql
CREATE TABLE monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE, -- NULL = общий лимит на месяц
    month_year VARCHAR(7) NOT NULL, -- '2026-08'
    limit_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, month_year)
);
```

---

## 5. Логика Telegram-бота и Gemini AI

### 5.1. Обработка входящих сообщений
1. **Идентификация пользователя:**
   * При получении сообщения бот проверяет `msg.from.id`. Если это Telegram ID Максата или Баяны, операция связывается с соответствующим `user_id`.
   * Если пишет новый пользователь, бот предлагает авторизоваться по семейному PIN-коду.
2. **Обработка текста:**
   * Текст передается в Gemini 2.5 Flash с системным промптом, знающим список категорий и валюту (кыргызский сом, с).
   * Формат ответа ИИ — валидный JSON:
     ```json
     {
       "amount": 1250.00,
       "category": "Продукты",
       "description": "Покупки в гипермаркете Фрунзе"
     }
     ```
3. **Обработка голосовых сообщений (Voice OGG/Opus):**
   * Бот получает ссылку на аудиофайл через Telegram API.
   * Передает аудиофайл в Gemini Multimodal API напрямую.
   * Gemini распознает русскую/кыргызскую речь, транскрибирует и одновременно структурирует транзакцию в JSON.
4. **Обработка фотографий чеков:**
   * Фото скачивается и передается в Gemini Vision.
   * ИИ находит итоговую сумму (Total/Итого), название магазина и классифицирует покупку.

### 5.2. Ответ бота и интерактивные действия
```text
✅ Записано: 1 250 сом
📁 Категория: 🛒 Продукты
👤 Кто: Максат
📝 Описание: Покупки в гипермаркете Фрунзе

[🗑️ Отменить] [✏️ Изменить категорию] [📊 Открыть дашборд]
```
* **Инлайн-кнопка «🗑️ Отменить»**: Мгновенно удаляет запись из базы данных и обновляет сообщение на *«❌ Расход отменен»*.
* **Инлайн-кнопка «✏️ Изменить категорию»**: Показывает сетку из 9 категорий для быстрого перевыбора.
* **Кнопка меню / WebApp**: Открывает Telegram Mini App с веб-дашбордом.

---

## 6. Веб-дашборд и PWA интерфейс

### 6.1. Экраны и функционал:
1. **Главная (Обзор)**:
   * Карточка общего расхода за месяц (например, `48 200 с`) с индикатором среднего расхода в день.
   * Фильтр по автору: **`Все` | `Максат` | `Баяна`**.
   * Donut Chart (Круговая диаграмма) по категориям с легендой и суммами.
   * Bar Chart (Столбчатый график) расходов по дням выбранного месяца.
   * Прогресс-бар выполнения месячного бюджета.
2. **Лента транзакций**:
   * Хронологический список с группировкой по датам.
   * Иконка категории, цвет, описание, имя автора (Максат/Баяна), источник ввода (Telegram, голос, веб).
   * Поиск по описанию и фильтр по категории/автору.
   * Модальное окно быстрого редактирования и удаления.
3. **Форма быстрого добавления «➕ Расход»**:
   * Встроенный калькулятор/нумпад для ввода суммы.
   * Быстрый выбор категории в 1 клик.
   * Выбор автора (Максат / Баяна) и даты.
4. **Категории и Лимиты**:
   * Просмотр и редактирование категорий.
   * Установка месячного лимита (общего и по категориям).

### 6.2. Мобильная оптимизация (iOS PWA):
* Адаптивная верстка под экран iPhone (Safe Area insets, Touch-first UI, haptic-like animations).
* Иконка на экран «Домой» (Apple Touch Icon).
* Поддержка автономной работы и быстрого запуска без адресной строки Safari.

---

## 7. Интеграция с iOS Быстрыми командами (Shortcuts)

* **API Endpoint**: `POST /api/transactions/quick`
* **Headers**: `x-family-token: <SECRET_KEY>`
* **Body**: `{ "text": "...", "user": "Максат" }`
* **Shortcut Workflow**:
  1. Нажатие Action Button или виджета на iPhone.
  2. Всплывающее окно iOS: *«Введите или надиктуйте расход»*.
  3. Отправка POST-запроса на Vercel API.
  4. Показ системного уведомления iOS: *«✅ Записано: 350 сом (Такси)»*.

---

## 8. Безопасность и авторизация

1. **Telegram Webhook**: Защита заголовком `x-telegram-bot-api-secret-token`.
2. **Telegram Mini App**: Проверка криптографической подписи `initData` через HMAC-SHA256.
3. **Web Dashboard**: Вход по семейному PIN-коду / Magic Link или через Telegram Login.

---

## 9. План развертывания (100% Free Tier)

1. **База данных**: Supabase (создание бесплатного проекта в 1 клик, выполнение SQL-миграции).
2. **Gemini API**: Получение бесплатного API ключа в Google AI Studio.
3. **Telegram Bot**: Создание бота через `@BotFather`, получение токена.
4. **Деплой на Vercel**: Импорт репозитория, указание переменных окружения (`DATABASE_URL`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`).
5. **Активация Webhook**: Запуск разового вызова `setWebhook` на Telegram API.
