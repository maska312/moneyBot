# Семейный учет расходов (Family Expense Tracker) — План реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать современное веб-приложение (Next.js 15 + Supabase PostgreSQL) с Telegram-ботом на базе Gemini 2.5 Flash, поддержкой голосового ввода, фото чеков, iOS Shortcuts и аналитическим веб-дашбордом для Максата и Баяны в кыргызских сомах.

**Architecture:** Единый монорепозиторий Next.js 15 (App Router) с serverless API роутами для Telegram Webhook и REST эндпоинтов, Drizzle ORM для работы с PostgreSQL, Gemini 2.5 Flash для мультимодального распознавания и Tailwind CSS + Recharts для адаптивного PWA дашборда.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Drizzle ORM, Postgres (Supabase/Neon), Google Gemini API (`@google/genai`), Recharts, Lucide Icons, Vitest.

**Spec:** [`docs/superpowers/specs/2026-08-14-family-expense-tracker-design.md`](file:///Users/maksatamanbaev/Desktop/Projects/money/docs/superpowers/specs/2026-08-14-family-expense-tracker-design.md)

## Global Constraints
- Основная валюта: Кыргызский сом (`KGS` / `с`).
- Пользователи системы: Максат и Баяна.
- 100% Free tier совместимость (Vercel + Supabase + Google AI Studio).
- Поддержка ввода: Текст, Голосовые сообщения (OGG/Opus), Фотографии чеков, iOS Shortcuts, Ручной ввод на веб-сайте.

---

### Task 1: Next.js 15 Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/unit/setup.test.ts`

**Interfaces:**
- Produces: Рабочий проект Next.js 15 с поддержкой TypeScript, Tailwind CSS, Lucide icons, Vitest.

- [ ] **Step 1: Write failing setup test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Scaffold Next.js 15 app structure with dependencies (`drizzle-orm`, `postgres`, `@google/genai`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`)**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Database Schema & Seed (Drizzle ORM + PostgreSQL)

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/seed.ts`
- Create: `drizzle.config.ts`
- Test: `tests/unit/db-schema.test.ts`

**Interfaces:**
- Produces: Таблицы `users`, `categories`, `transactions`, `monthlyBudgets`, функции работы с базой данных и сид стандартных категорий и пользователей (Максат, Баяна).

- [ ] **Step 1: Write failing schema test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Drizzle schema, DB connection client, and seed logic**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Gemini 2.5 Flash AI Multimodal Parsing Service

**Files:**
- Create: `src/lib/ai/gemini-parser.ts`
- Create: `src/lib/ai/prompts.ts`
- Test: `tests/unit/gemini-parser.test.ts`

**Interfaces:**
- Produces: `parseExpenseText(text: string, categories: string[]) -> Promise<ParsedExpense>`
- Produces: `parseExpenseAudio(audioBuffer: Buffer, mimeType: string, categories: string[]) -> Promise<ParsedExpense>`
- Produces: `parseExpenseImage(imageBuffer: Buffer, mimeType: string, categories: string[]) -> Promise<ParsedExpense>`

- [ ] **Step 1: Write failing AI parser tests (с моками Gemini API)**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Gemini multimodal expense parser with structured JSON output**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Telegram Bot Webhook & Command Handlers

**Files:**
- Create: `src/app/api/bot/webhook/route.ts`
- Create: `src/lib/telegram/bot.ts`
- Create: `src/lib/telegram/keyboards.ts`
- Create: `src/lib/telegram/messages.ts`
- Test: `tests/unit/telegram-webhook.test.ts`

**Interfaces:**
- Produces: Serverless Webhook обработчик для Telegram Bot (текст, голосовые, фото, callback-кнопки «Отменить», «Изменить категорию», «Открыть Mini App»).

- [ ] **Step 1: Write failing Telegram webhook tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Telegram Webhook Route Handler and inline callback handlers**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Core Transactions, Budgets & iOS Shortcuts API

**Files:**
- Create: `src/app/api/transactions/route.ts`
- Create: `src/app/api/transactions/[id]/route.ts`
- Create: `src/app/api/transactions/quick/route.ts`
- Create: `src/app/api/analytics/route.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/budgets/route.ts`
- Test: `tests/unit/api-routes.test.ts`

**Interfaces:**
- Produces: REST API для транзакций, аналитики за месяц, категорий, бюджетов и быстрого ввода через iOS Shortcut с токеном `x-family-token`.

- [ ] **Step 1: Write failing API Route tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Next.js App Router API handlers**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Web Dashboard & Analytics UI (Overview, Charts & Budget)

**Files:**
- Create: `src/components/dashboard/OverviewCards.tsx`
- Create: `src/components/dashboard/CategoryDonutChart.tsx`
- Create: `src/components/dashboard/DailyTrendChart.tsx`
- Create: `src/components/dashboard/UserFilter.tsx`
- Create: `src/components/dashboard/BudgetProgressBar.tsx`
- Create: `src/components/dashboard/MonthSelector.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/dashboard-components.test.ts`

**Interfaces:**
- Produces: Интерактивный адаптивный дашборд с фильтрацией по автору (Все / Максат / Баяна), круговой диаграммой категорий и столбчатым графиком по дням.

- [ ] **Step 1: Write failing component tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Dashboard components with Recharts & Tailwind CSS**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: Transactions Feed & Manual Expense Modal UI

**Files:**
- Create: `src/components/transactions/TransactionList.tsx`
- Create: `src/components/transactions/TransactionItem.tsx`
- Create: `src/components/transactions/AddExpenseModal.tsx`
- Create: `src/components/transactions/EditExpenseModal.tsx`
- Create: `src/components/transactions/CategorySelector.tsx`
- Create: `src/components/ui/Modal.tsx`
- Test: `tests/unit/transaction-components.test.ts`

**Interfaces:**
- Produces: Хронологическая лента трат с группировкой по датам, поиском, модальным окном добавления с нумпадом и быстрым редактированием/удалением.

- [ ] **Step 1: Write failing transaction feed tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Transaction Feed and Modal components**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 8: iOS Shortcuts Integration, PWA Manifest & Setup Guide

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Create: `src/app/shortcuts/page.tsx` (Страница с готовыми ссылками на установку iOS Shortcuts и QR-кодами)
- Create: `README.md` (Пошаговая инструкция по деплою на Vercel + Supabase + Telegram Bot)
- Test: `tests/unit/pwa-manifest.test.ts`

**Interfaces:**
- Produces: Полноценный PWA манифест, страница настройки iOS Команд для Максата и Баяны и документация по развертыванию.

- [ ] **Step 1: Write failing manifest/shortcuts tests**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement PWA configuration and Shortcuts onboarding page**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 9: End-to-End System Verification & Build Verification

**Files:**
- Test: `tests/e2e/workflow.test.ts`

- [ ] **Step 1: Write end-to-end integration test verifying full ingestion -> parsing -> storage -> analytics aggregation**
- [ ] **Step 2: Run `npm run test` across all unit and integration tests**
- [ ] **Step 3: Run `npm run build` to verify production compilation**
- [ ] **Step 4: Commit**
