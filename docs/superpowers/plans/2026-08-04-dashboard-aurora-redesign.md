# Aurora Finance Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полный редизайн страницы `/` (Dashboard) в премиальный финансовый dashboard с hero-балансом (count-up анимация), 3 insight-плитками и плавающей таблицей транзакций, используя Framer Motion.

**Architecture:** Новые виджеты FSD (`dashboardHero`, `dashboardInsights`) + util-функции агрегации в `entities/transaction/model`. AppShell-оборачивание поднимается из `TransactionsWidget` в `DashboardPage`. Новые `--aurora-*` CSS-токены изолированы от существующих. Framer Motion для count-up/stagger/aurora-анимаций с `prefers-reduced-motion`.

**Tech Stack:** React 19, TypeScript 6, Ant Design 6, Framer Motion ^12.43.0, Zustand 5, SCSS modules, i18next, dayjs.

## Global Constraints
- Нет тестового фреймворка — проверка через `npm run lint` + `npm run build` + визуально `npm run dev` (порт 5173)
- `npm run build` = `tsc -b && vite build`; существующие TS-ошибки в `src/widgets/largestTransactions/ui/index.tsx` и `src/widgets/topCategories/model/lib.ts` НЕ трогаем (не наши файлы)
- `verbatimModuleSyntax`: использовать `import type` для type-only imports
- `noUnusedLocals`/`noUnusedParameters`: не оставлять неиспользуемые импорты/переменные
- Путь alias `@` → `src/`
- Виджеты экспортируются как объекты с `.Widget`: `export const X = { Widget: Container }`
- Логика в `model/use*.ts` или `container/useContainer.ts`, UI "dumb" (`*View.tsx` или `index.tsx`)
- Barrel exports (`index.ts`) в каждой директории
- SCSS modules co-located (`*.module.scss`)
- НЕ трогать: `/reports`, `/categories`, auth, существующие `--accent`/`--bg`/`--text` токены, `colorPrimary` Ant (#aa3bff)
- Темный режим не добавляем (светлая only)
- Framer Motion: только `transform`/`opacity`; `useReducedMotion()` для всех анимаций
- Контраст AA (4.5:1 текст, 3:1 крупные суммы/иконки)
- Суммы: `tabular-nums`, знак +/−, цвет + aria-label со словом Income/Expense

---

## ТОЧНАЯ ФАКТУРА КОДОВОЙ БАЗЫ (используй эти сигнатуры, не выдумывай)

### Transaction type (`src/entities/transaction/model/types.ts`)
```ts
export type TransactionType = "INCOME" | "EXPENSE";
export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date?: string | null;
  description?: string | null;
};
```

### Category type (`src/entities/category/model/types.ts`)
```ts
export type Category = { id: string; name: string; icon: string; type: TransactionType; user_id: string | null };
```

### Zustand store (`src/entities/transaction/model/store.ts`) — ЭКСПОРТИРУЕТ ТОЛЬКО `useTransactionsStore`, отдельных селекторов НЕТ
```ts
export const useTransactionsStore = create<State & Actions>((set) => ({
  transactions: [],
  allTransactions: [],
  setTransactions: (payload) => set(() => ({ transactions: payload })),
  setAllTransactions: (payload) => set(() => ({ allTransactions: payload })),
}));
```
Использование в hero/insights: `const allTransactions = useTransactionsStore((s) => s.allTransactions);`

### calculatePercentage логика (из `src/widgets/reportCard/model/calculateReportCards.ts:12-18`) — ПЕРЕИСПОЛЬЗУЕМ
```ts
function calculatePercentage(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 10_000) / 100;
}
```

### getTransactionsByMonth (`src/widgets/mountlyExpenseChart/model/lib.ts`) — суммирует ВСЕ транзакции по дню месяца, БЕЗ фильтра типа. Для кумулятивного баланса нужен НОВЫЙ util.

### useTransactionsDashboard (`src/features/transaction/manage/model/useTransactionsDashboard.ts`) возвращает:
```ts
{ transactions, categoryOptions, loading, error, isModalOpen, modalTitle, confirmLoading, form, openCreate, openEdit, closeModal, submit, remove, deleteLoading }
```
`transactions` — уже отфильтрованы (поиск+фильтры), без сортировки.

### TransactionsWidget (`src/widgets/transactions/ui/TransactionsWidget.tsx`)
- Props (строки 22-41): `{ transactions, deleteLoading?, onDelete, onEdit, onAddClick, isModalOpen, modalTitle, confirmLoading?, onModalOk, onModalCancel, form, categoryOptions, filtersSlot? }`
- Рендерит `<AppShell title={t("transactions")} subtitle={t("trackIncomeAndExpenses")} primaryAction={<Button type="primary" onClick={onAddClick}>{t("addTransaction")}</Button>}>` (строки 61-68)
- Внутри: `{filtersSlot}` (строка 70) + `<div className="dashboard-card"><TransactionsTable .../></div>` (строки 71-78)
- Modal add/edit (строки 81-133) на том же уровне что AppShell, внутри фрагмента `<>...</>`
- Modal: Form с полями amount (InputNumber prefix "$"), description (Input), category (Select), date (DatePicker), type (Radio.Group INCOME/EXPENSE)

### TransactionsTable (`src/widgets/transactions-table/ui/TransactionsTable.tsx`)
- Props: `{ transactions, onEdit, onDelete, deleteLoading? }`
- TransactionRow type (строки 9-18): `{ key, id, transaction, amount, type, category, date (ISO string), description? }`
- columns (useMemo, строки 36-117): массив с ключами `description` (filterDropdown), `type` (sorter localeCompare), `amount` (sorter a-b, render toFixed(2)), `category` (sorter, render emoji+name), `date` (sorter dayjs.valueOf, render DD.MM.YYYY), `actions` (delete 🗑️ danger + edit ✏️)
- dataSource useMemo (строки 119-130): мапит transactions → TransactionRow
- total useMemo (строки 132-140): `sum(INCOME ? +amount : -amount).toFixed(2)`
- `<Table>` (строки 142-162): `rowKey="id"`, `scroll={{ x: "max-content" }}`, `pagination={{ pageSize: 10, showSizeChanger: true }}`, summary (total), `rowClassName` → `transaction-row--income`/`transaction-row--expense`

### DashboardPage (`src/pages/dashboard/ui/DashboardPage.tsx`) — текущее:
- loading → `<AppShell title subtitle><DashboardPageSkeleton /></AppShell>`
- error → `<p>Error</p>`
- normal → `<TransactionsWidget ... filtersSlot={<TransactionsFiltersWidget />} />`

### DashboardPageSkeleton (`src/pages/dashboard/ui/DashboardPageSkeleton.tsx`) — 5 строк:
```tsx
import { Skeleton } from "antd";
export function DashboardPageSkeleton() {
  return <Skeleton active title={false} paragraph={{ rows: 18 }} />;
}
```

### AppShell props (`src/widgets/app-shell/ui/AppShell.tsx:13-18`):
`{ title: string; subtitle?: string; primaryAction?: React.ReactNode; children: React.ReactNode }`
Layout: Sider 240px + Header 72px (title/subtitle/primaryAction) + offline banners + Content (padding 20px, `.dashboard-contentInner` max-width 1320px) + Footer 52px.

### index.css токены (`:root`, строки 1-31):
`--text: #6b6375; --text-h: #08060d; --bg: #fff; --border: #e5e4e7; --accent: #aa3bff; --accent-bg: rgba(170,59,255,0.1); --sans/--heading: system-ui,"Segoe UI",Roboto,sans-serif; --shadow: ...`
`#root` (строки 53-62): `height: 100svh; overflow: hidden;`
`.dashboard-card` (241-247): `background: rgba(255,255,255,0.6); border: 1px solid var(--border); border-radius: 14px; box-shadow: var(--shadow); padding: 12px;`
`.transaction-row--income/expense` (274-289): инлайн rgba подсветка `!important`.

### AppAntdProvider (`src/app/providers/AppAntdProvider.tsx`):
```tsx
const antdTheme = { token: { colorPrimary: "#aa3bff", borderRadius: 10, borderRadiusLG: 10, fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }, components: { Button: { primaryShadow: "none" } } };
```

### index.html CSP (строки 7-25):
`style-src 'self' 'unsafe-inline';` (строка 12) и `font-src 'self' data:;` (строка 20). Для Google Fonts: добавить `https://fonts.googleapis.com` в style-src, `https://fonts.gstatic.com` в font-src, `<link>` в head.

### i18n.js структура:
en translation строки 25-154, ru translation строки 158-290. Ключ `balance` на строке 67 (en) и 203 (ru). Новые ключи вставлять ПОСЛЕ `balance` в оба блока.

---

## ДИЗАЙН-СПЕЦИФИКАЦИЯ (что реализуем)

### Дизайн-токены (новые `--aurora-*` в `:root` index.css, НЕ трогать существующие):
```css
--aurora-surface: #F7F5FB;
--aurora-surface-card: #FFFFFF;
--aurora-surface-elevated: #FFFFFF;
--aurora-accent: #7C3AED;
--aurora-accent-soft: #EDE9FE;
--aurora-success: #0E9F6E;
--aurora-success-soft: #D1FAE5;
--aurora-danger: #E0457B;
--aurora-danger-soft: #FCE7F3;
--aurora-text: #1E1B2E;
--aurora-text-secondary: #6B6680;
--aurora-border: #E8E4F0;
--aurora-shadow-color: rgba(76, 29, 149, 0.08);
--aurora-shadow-sm: 0 1px 2px var(--aurora-shadow-color);
--aurora-shadow-md: 0 4px 12px var(--aurora-shadow-color);
--aurora-shadow-lg: 0 12px 32px var(--aurora-shadow-color);
```
Радиусы: 16px (карточки), 12px (кнопки), 999px (бейджи).

### Типографика: Sora (display 600/700) + Inter (400/500/600). tabular-nums для всех чисел. Типо-шкала: 48/28/20/18/15/13/12.

### Layout (внутри AppShell Content, max-width 1320px унаследован):
1. **Hero Balance** (большая карточка elevated, shadow-lg, aurora-ореол 2 радиальных градиента, eyebrow «Текущий баланс», баланс Sora 48px count-up, дельта-строка ↑+12.4% за 30 дней, спарклайн SVG справа)
2. **3 insight-плитки** (grid 3-col, gap 16): Доходы·30д / Расходы·30д / Крупнейшая транзакция. Sora 28px, hover-lift.
3. **Панель фильтров** (переиспользовать TransactionsFiltersWidget в aurora-card) + primary CTA «+ Добавить»
4. **Таблица** (floating aurora-card)

### Источники данных:
- Баланс/insights — из `allTransactions` (полный набор, НЕ отфильтрованный)
- Баланс hero = кумулятивный running sum по дням за 30 дней (для спарклайна) + итоговое значение = sum(INCOME)−sum(EXPENSE) за весь период
- Доходы/расходы за 30 дней = sum по типу за последние 30 дней
- Дельта = calculatePercentage(текущий_период, предыдущий_период_30д)
- Крупнейшая транзакция = max по abs(amount) среди всех транзакций

### Framer Motion:
- motion-токены в `src/shared/lib/motion.ts`: durationEnter 0.22, durationExit 0.14, easeOut [0.16,1,0.3,1], spring {stiffness:120,damping:18}, springSnappy {stiffness:300,damping:24}
- count-up: `useMotionValue(0)` + `animate(0, value, {duration:1.2, ease})` + `useTransform` в форматтер. Reduced → мгновенно.
- aurora-ореол: animate infinite x/y ±20px opacity 0.5↔0.8, 8s. Reduced → статично.
- insight-плитки: staggerChildren 0.05, delayChildren 0.1, hidden {opacity:0,y:16}→visible {opacity:1,y:0}, spring.
- insight hover: whileHover {y:-2}, springSnappy.
- hero-карточка вход: opacity+y(12)→0, 0.3s easeOut, delay 0.05.
- дельта-строка: появляется после count-up (delay ~0.8s).
- таблица строки: stagger 30-40ms ТОЛЬКО при mount и смене страницы пагинации, НЕ при сортировке.
- action-иконки: AnimatePresence opacity+scale, enter 0.2s exit 0.12s. На мобильных всегда видимы.

### Доступность:
- focus-ring 2px --aurora-accent (НЕ удалять Ant default)
- aria-label на icon-only кнопках (edit/delete): t("editTransaction"), t("delete")
- спарклайн: role="img" + aria-label с описанием тренда
- aria-sort на сортируемых колонках
- prefers-reduced-motion везде
- touch targets ≥44px
- суммы: знак +/− + цвет + aria-label ячейки со словом Income/Expense

### Таблица изменения:
- Убрать колонку `type` (key "type") — избыточна
- Убрать rowClassName подсветку (transaction-row--income/expense) — оставить цвет суммы+знак
- amount render: `+3 450,00 ₽` / `−3 450,00 ₽` со знаком, tabular-nums, success/danger цвет
- Hover-row: --aurora-accent-soft 30%
- action-иконки: добавить aria-label, touch target padding, Popconfirm на delete
- summary total: «Итого: 42 580,00 ₽» Sora 16px tabular-nums
- empty state: если transactions.length===0 — сообщение + CTA «Добавить первую транзакцию»

### i18n новые ключи (en + ru, после balance):
- `currentBalance`: "Current balance" / "Текущий баланс"
- `last30Days`: "Last 30 days" / "За 30 дней"
- `largestTransaction`: "Largest transaction" / "Крупнейшая транзакция"
- `noTransactionsYet`: "No transactions yet" / "Пока нет транзакций"
- `addFirstTransaction`: "Add your first transaction" / "Добавьте первую транзакцию"
- `retry`: "Retry" / "Повторить"
- `trendUp`: "up" / "рост"
- `trendDown`: "down" / "спад"
- `vsPreviousPeriod`: "vs previous period" / "за период"
- `income30Days`: "Income · 30 days" / "Доходы · 30 дней"
- `expense30Days`: "Expense · 30 days" / "Расходы · 30 дней"
- `loadingError`: "Failed to load data" / "Не удалось загрузить данные"
- `deleteTransactionConfirm`: "Are you sure you want to delete this transaction?" / "Вы уверены, что хотите удалить эту транзакцию?"

---

## СТРУКТУРА ЗАДАЧ

---

### Task 1: Фонды — дизайн-токены + шрифты + CSP

**Files:**
- Modify: `src/index.css` — добавить `--aurora-*` токены и global aurora-классы
- Modify: `index.html` — CSP + Google Fonts link
- Modify: `src/app/providers/AppAntdProvider.tsx` — fontFamily

**Interfaces:**
- Consumes: none (task adds new tokens)
- Produces: `--aurora-*` CSS custom properties available globally; global `.aurora-*` utility classes

**Steps:**

- [ ] **1.1 Modify `src/index.css`** — вставить `--aurora-*` токены в `:root` ПЕРЕД `--sans` (после строки 11, перед строкой 14 `--sans`):

```css
  /* Aurora design tokens (dashboard redesign) */
  --aurora-surface: #F7F5FB;
  --aurora-surface-card: #FFFFFF;
  --aurora-surface-elevated: #FFFFFF;
  --aurora-accent: #7C3AED;
  --aurora-accent-soft: #EDE9FE;
  --aurora-success: #0E9F6E;
  --aurora-success-soft: #D1FAE5;
  --aurora-danger: #E0457B;
  --aurora-danger-soft: #FCE7F3;
  --aurora-text: #1E1B2E;
  --aurora-text-secondary: #6B6680;
  --aurora-border: #E8E4F0;
  --aurora-shadow-color: rgba(76, 29, 149, 0.08);
  --aurora-shadow-sm: 0 1px 2px var(--aurora-shadow-color);
  --aurora-shadow-md: 0 4px 12px var(--aurora-shadow-color);
  --aurora-shadow-lg: 0 12px 32px var(--aurora-shadow-color);
```

- [ ] **1.2 Modify `src/index.css`** — добавить global aurora utility-классы в КОНЕЦ файла (после строки 423):

```css
/* === Aurora global utility classes === */

.aurora-surface {
  background: var(--aurora-surface);
}

.aurora-card {
  background: var(--aurora-surface-card);
  border-radius: 16px;
  box-shadow: var(--aurora-shadow-sm);
  border: 1px solid var(--aurora-border);
}

.aurora-card--elevated {
  background: var(--aurora-surface-elevated);
  box-shadow: var(--aurora-shadow-lg);
  border: 1px solid var(--aurora-border);
  border-radius: 16px;
}

.aurora-card--insight {
  background: var(--aurora-surface-card);
  box-shadow: var(--aurora-shadow-sm);
  border: 1px solid var(--aurora-border);
  border-radius: 16px;
  padding: 20px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: default;
}

.aurora-card--insight:hover {
  box-shadow: var(--aurora-shadow-md);
}

.aurora-tabular {
  font-variant-numeric: tabular-nums;
}

.aurora-focus-ring:focus-visible {
  outline: 2px solid var(--aurora-accent);
  outline-offset: 2px;
}

.aurora-row-hover:hover {
  background: rgba(124, 58, 237, 0.04) !important;
}

.aurora-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  color: var(--aurora-text-secondary);
}

.aurora-empty-state__icon {
  font-size: 48px;
  opacity: 0.6;
}

.aurora-empty-state__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--aurora-text);
}

.aurora-text-primary {
  color: var(--aurora-text);
}

.aurora-text-secondary {
  color: var(--aurora-text-secondary);
}

.aurora-text-success {
  color: var(--aurora-success);
}

.aurora-text-danger {
  color: var(--aurora-danger);
}

.aurora-font-display {
  font-family: 'Sora', system-ui, "Segoe UI", Roboto, sans-serif;
}

.aurora-font-body {
  font-family: 'Inter', system-ui, "Segoe UI", Roboto, sans-serif;
}

@media (max-width: 768px) {
  .aurora-card--insight {
    padding: 16px;
  }
}
```

- [ ] **1.3 Modify `index.html`** — обновить CSP и добавить Google Fonts link. Заменить весь `<head>` блок:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=Sora:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <meta
      http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https:;
        connect-src 'self'
          https://*.nhost.run
          https://*.nhost.app
          http://localhost:4000
          ws://localhost:*
          wss://localhost:*;
        font-src 'self' data: https://fonts.gstatic.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      "
    />
    <title>finance-dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **1.4 Modify `src/app/providers/AppAntdProvider.tsx`** — обновить fontFamily в antdTheme.token:

```tsx
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

const antdTheme = {
  token: {
    colorPrimary: "#aa3bff",
    borderRadius: 10,
    borderRadiusLG: 10,
    fontFamily:
      "'Inter', system-ui, \"Segoe UI\", Roboto, sans-serif",
  },
  components: {
    Button: {
      primaryShadow: "none",
    },
  },
};

type AppAntdProviderProps = {
  children: ReactNode;
};

export function AppAntdProvider({ children }: AppAntdProviderProps) {
  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
```

- [ ] **1.5 Проверка:**
```bash
npm run lint
npm run dev
```
Открыть http://localhost:5173 — проверить что существующие страницы не сломаны, шрифты Inter/Sora грузятся (через DevTools Network), CSP не блокирует загрузку.

- [ ] **1.6 Commit:**
```bash
git add src/index.css index.html src/app/providers/AppAntdProvider.tsx
git commit -m "feat(dashboard): add aurora design tokens, Google Fonts (Inter+Sora), and CSP updates"
```

---

### Task 2: Motion-токены

**Files:**
- Create: `src/shared/lib/motion.ts`

**Interfaces:**
- Consumes: `framer-motion` (useReducedMotion)
- Produces: `durationEnter`, `durationExit`, `easeOut`, `spring`, `springSnappy`, `useMotionConfig()`

**Steps:**

- [ ] **2.1 Install framer-motion:**
```bash
npm install framer-motion@^12.43.0
```

- [ ] **2.2 Create `src/shared/lib/motion.ts`** — полный файл:

```ts
import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";

// Durations
export const durationEnter = 0.22;
export const durationExit = 0.14;

// Timing
export const easeOut: number[] = [0.16, 1, 0.3, 1];

// Springs
export const spring = { stiffness: 120, damping: 18 };
export const springSnappy = { stiffness: 300, damping: 24 };

// Default hidden/visible variants for staggered animations
const hiddenDefault = { opacity: 0, y: 16 };
const visibleDefault = { opacity: 1, y: 0 };

export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  return useMemo(
    () => ({
      // If reduced motion is preferred, skip animations
      hidden: prefersReduced ? visibleDefault : hiddenDefault,
      visible: visibleDefault,
      spring: prefersReduced ? { stiffness: 0, damping: 0 } : spring,
      springSnappy: prefersReduced ? { stiffness: 0, damping: 0 } : springSnappy,
      durationEnter: prefersReduced ? 0 : durationEnter,
      durationExit: prefersReduced ? 0 : durationExit,
      easeOut: prefersReduced ? [0, 0, 1, 1] : easeOut,
      prefersReduced,
      // For count-up: if reduced, duration = 0 (instant)
      countUpDuration: prefersReduced ? 0 : 1.2,
      // For stagger
      staggerChildren: prefersReduced ? 0 : 0.05,
      delayChildren: prefersReduced ? 0 : 0.1,
      // For table row stagger
      rowStagger: prefersReduced ? 0 : 0.03,
      // For aurora orb animation: reduced = no animation
      orbDuration: prefersReduced ? 0 : 8,
      // For delta line delay
      deltaDelay: prefersReduced ? 0 : 0.8,
      // For hero card entrance
      heroEnterDuration: prefersReduced ? 0 : 0.3,
      heroEnterDelay: prefersReduced ? 0 : 0.05,
      heroEnterY: prefersReduced ? 0 : 12,
    }),
    [prefersReduced],
  );
}
```

- [ ] **2.3 Проверка:**
```bash
npm run lint
npm run build
```
Убедиться что сборка проходит (наши новые файлы компилируются, известные 2 ошибки в largestTransactions и topCategories игнорируем).

- [ ] **2.4 Commit:**
```bash
git add package.json package-lock.json src/shared/lib/motion.ts
git commit -m "feat(motion): add motion tokens config with useReducedMotion support"
```

---

### Task 3: Util-функции агрегации

**Files:**
- Create: `src/entities/transaction/model/aggregateByDay.ts`
- Create: `src/entities/transaction/model/calculateDashboardStats.ts`
- Modify: `src/entities/transaction/index.ts` — добавить экспорты новых функций

**Interfaces:**
- Consumes: `Transaction` from `./types`, dayjs
- Produces:
  - `aggregateBalanceByDay(transactions: Transaction[], days?: number): { dates: string[]; cumulative: number[] }`
  - `calculateDashboardStats(transactions: Transaction[]): DashboardStats`

**Steps:**

- [ ] **3.1 Create `src/entities/transaction/model/aggregateByDay.ts`:**

```ts
import dayjs from "dayjs";
import type { Transaction } from "./types";

/**
 * Вычисляет кумулятивный running sum баланса по дням за последние N дней.
 * INCOME +amount, EXPENSE −amount.
 */
export function aggregateBalanceByDay(
  transactions: Transaction[],
  days: number = 30,
): { dates: string[]; cumulative: number[] } {
  const today = dayjs().startOf("day");
  const startDate = today.subtract(days - 1, "day");

  // Инициализируем массив дней
  const dateLabels: string[] = [];
  for (let i = 0; i < days; i++) {
    dateLabels.push(startDate.add(i, "day").format("YYYY-MM-DD"));
  }

  // Группируем транзакции по дням
  const dailyDelta = new Map<string, number>();
  for (const t of transactions) {
    if (!t.date) continue;
    const dateKey = dayjs(t.date).startOf("day").format("YYYY-MM-DD");
    const delta = t.type === "INCOME" ? t.amount : -t.amount;
    dailyDelta.set(dateKey, (dailyDelta.get(dateKey) ?? 0) + delta);
  }

  // Строим кумулятивный массив
  let running = 0;
  const cumulative: number[] = [];
  for (const label of dateLabels) {
    running += dailyDelta.get(label) ?? 0;
    cumulative.push(running);
  }

  return { dates: dateLabels, cumulative };
}
```

- [ ] **3.2 Create `src/entities/transaction/model/calculateDashboardStats.ts`:**

```ts
import dayjs from "dayjs";
import type { Transaction } from "./types";
import { aggregateBalanceByDay } from "./aggregateByDay";

export type DashboardStats = {
  /** Итоговый баланс (sum INCOME − sum EXPENSE) за весь период */
  balance: number;
  /** Доходы за последние 30 дней */
  income30d: number;
  /** Расходы за последние 30 дней */
  expense30d: number;
  /** Процентная дельта баланса: текущие 30д vs предыдущие 30д */
  deltaPercent: number | null;
  /** Крупнейшая транзакция (по abs amount) за всё время */
  largestTransaction: Transaction | null;
  /** Данные спарклайна (кумулятивный баланс за 30д) */
  sparkline: { dates: string[]; cumulative: number[] };
};

/**
 * Логика calculatePercentage, переиспользующая алгоритм из reportCard.
 */
function calcPercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 10_000) / 100;
}

/**
 * Суммирует balance (INCOME − EXPENSE) для списка транзакций.
 */
function sumBalance(txs: Transaction[]): number {
  return txs.reduce((acc, t) => acc + (t.type === "INCOME" ? t.amount : -t.amount), 0);
}

/**
 * Фильтрует транзакции, попадающие в интервал [start, end] (включительно).
 */
function inRange(txs: Transaction[], start: dayjs.Dayjs, end: dayjs.Dayjs): Transaction[] {
  return txs.filter((t) => {
    if (!t.date) return false;
    const d = dayjs(t.date);
    return d.isAfter(start.subtract(1, "millisecond")) && d.isBefore(end.add(1, "day"));
  });
}

export function calculateDashboardStats(transactions: Transaction[]): DashboardStats {
  const today = dayjs().startOf("day");
  const current30Start = today.subtract(29, "day");
  const previous30End = current30Start.subtract(1, "day");
  const previous30Start = previous30End.subtract(29, "day");

  // Текущие 30 дней
  const current30 = inRange(transactions, current30Start, today);

  // Предыдущие 30 дней
  const previous30 = inRange(transactions, previous30Start, previous30End);

  const currentBalance30 = sumBalance(current30);
  const previousBalance30 = sumBalance(previous30);

  const income30d = current30
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense30d = current30
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  // Полный баланс за всё время
  const balance = sumBalance(transactions);

  // Дельта
  const deltaPercent =
    previousBalance30 === 0 && currentBalance30 === 0
      ? null
      : calcPercentage(currentBalance30, previousBalance30);

  // Крупнейшая транзакция (max по abs)
  let largest: Transaction | null = null;
  for (const t of transactions) {
    if (!largest || Math.abs(t.amount) > Math.abs(largest.amount)) {
      largest = t;
    }
  }

  // Спарклайн
  const sparkline = aggregateBalanceByDay(transactions, 30);

  return {
    balance,
    income30d,
    expense30d,
    deltaPercent,
    largestTransaction: largest,
    sparkline,
  };
}
```

- [ ] **3.3 Modify `src/entities/transaction/index.ts`** — добавить экспорты новых функций. Текущее содержимое файла:

```ts
export type { Transaction, TransactionType } from "./model/types";
export type {
  TransactionCategoryOption,
  TransactionFormValues,
} from "./model/formTypes";
export {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  GET_TRANSACTIONS,
} from "./api/graphql";
```

Добавить после существующих экспортов:

```ts
export { aggregateBalanceByDay } from "./model/aggregateByDay";
export { calculateDashboardStats } from "./model/calculateDashboardStats";
export type { DashboardStats } from "./model/calculateDashboardStats";
```

Финальный файл:

```ts
export type { Transaction, TransactionType } from "./model/types";
export type {
  TransactionCategoryOption,
  TransactionFormValues,
} from "./model/formTypes";
export {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  GET_TRANSACTIONS,
} from "./api/graphql";
export { aggregateBalanceByDay } from "./model/aggregateByDay";
export { calculateDashboardStats } from "./model/calculateDashboardStats";
export type { DashboardStats } from "./model/calculateDashboardStats";
```

- [ ] **3.4 Проверка:**
```bash
npm run lint
npm run build
```
Ожидаем: существующие 2 TS-ошибки (largestTransactions, topCategories) остаются; наши файлы компилируются чисто.

- [ ] **3.5 Commit:**
```bash
git add src/entities/transaction/model/aggregateByDay.ts src/entities/transaction/model/calculateDashboardStats.ts src/entities/transaction/index.ts
git commit -m "feat(entities): add aggregateByDay and calculateDashboardStats utils"
```

---

### Task 4: DashboardHero виджет

**Files:**
- Create: `src/widgets/dashboardHero/container/useContainer.ts`
- Create: `src/widgets/dashboardHero/ui/DashboardHeroView.tsx`
- Create: `src/widgets/dashboardHero/ui/Sparkline.tsx`
- Create: `src/widgets/dashboardHero/ui/DashboardHero.module.scss`
- Create: `src/widgets/dashboardHero/index.ts`

**Interfaces:**
- Consumes: `useTransactionsStore`, `calculateDashboardStats`, `useMotionConfig`, `useTranslation`, `framer-motion`
- Produces: `DashboardHero = { Widget: Container }`

**Steps:**

- [ ] **4.1 Create `src/widgets/dashboardHero/container/useContainer.ts`:**

```ts
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";
import { calculateDashboardStats } from "@/entities/transaction/model/calculateDashboardStats";

export function useDashboardHero() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const stats = useMemo(
    () => calculateDashboardStats(allTransactions),
    [allTransactions],
  );

  const isPositive = stats.balance >= 0;

  return {
    balance: stats.balance,
    income30d: stats.income30d,
    expense30d: stats.expense30d,
    deltaPercent: stats.deltaPercent,
    sparklineData: stats.sparkline.cumulative,
    isPositive,
    t,
  };
}
```

- [ ] **4.2 Create `src/widgets/dashboardHero/ui/Sparkline.tsx`:**

```tsx
import { useMemo } from "react";

type SparklineProps = {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  ariaLabel: string;
};

export function Sparkline({
  data,
  color,
  width = 200,
  height = 64,
  ariaLabel,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (data.length - 1);

    const points = data.map((val, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((val - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    const polyline = points.join(" ");
    const area = `${points[0]} ${polyline} ${points[points.length - 1]}`;

    return { polyline, area };
  }, [data, width, height]);

  const gradientId = `sparkline-grad-${color.replace("#", "")}`;

  if (data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        style={{ display: "block" }}
      >
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--aurora-text-secondary)"
          fontSize="12"
        >
          −
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`${path.polyline} ${width},${height} 2,${height}`}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={path.polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **4.3 Create `src/widgets/dashboardHero/ui/DashboardHero.module.scss`:**

```scss
.hero {
  position: relative;
  padding: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.heroTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.heroMain {
  flex: 1;
  min-width: 0;
}

.heroEyebrow {
  font-family: 'Inter', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--aurora-text-secondary);
  margin-bottom: 8px;
}

.heroBalance {
  font-family: 'Sora', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--aurora-text);
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 4px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
}

.heroBalanceSymbol {
  font-size: 32px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 26px;
  }
}

.heroDelta {
  font-family: 'Inter', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
}

.heroDelta--positive {
  color: var(--aurora-success);
  background: var(--aurora-success-soft);
}

.heroDelta--negative {
  color: var(--aurora-danger);
  background: var(--aurora-danger-soft);
}

.heroDelta--neutral {
  color: var(--aurora-text-secondary);
  background: var(--aurora-accent-soft);
}

.heroSparkline {
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
}

/* Aurora orb */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.orb1 {
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(124, 58, 237, 0.15) 0%,
    rgba(124, 58, 237, 0) 70%
  );
  top: -60px;
  right: -40px;
}

.orb2 {
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle,
    rgba(14, 159, 110, 0.1) 0%,
    rgba(14, 159, 110, 0) 70%
  );
  bottom: -50px;
  left: -30px;
}

.heroContent {
  position: relative;
  z-index: 1;
}
```

- [ ] **4.4 Create `src/widgets/dashboardHero/ui/DashboardHeroView.tsx`:**

```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, type FC } from "react";
import { Sparkline } from "./Sparkline";
import { useMotionConfig } from "@/shared/lib/motion";
import styles from "./DashboardHero.module.scss";

type DashboardHeroViewProps = {
  balance: number;
  deltaPercent: number | null;
  sparklineData: number[];
  isPositive: boolean;
  t: (key: string) => string;
};

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted.replace(",", ".").replace(/\s/g, " ") + " ₽";
}

const CountUpBalance: FC<{ value: number; duration: number }> = ({
  value,
  duration,
}) => {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const display = useTransform(rounded, (v) => formatCurrency(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, motionVal]);

  return <motion.span>{display}</motion.span>;
};

export function DashboardHeroView({
  balance,
  deltaPercent,
  sparklineData,
  isPositive,
  t,
}: DashboardHeroViewProps) {
  const config = useMotionConfig();
  const positive = balance >= 0;

  const sparklineColor =
    sparklineData.length >= 2
      ? sparklineData[sparklineData.length - 1] >= sparklineData[0]
        ? "var(--aurora-success)"
        : "var(--aurora-danger)"
      : "var(--aurora-accent)";

  const sparklineAriaLabel =
    sparklineData.length >= 2
      ? sparklineData[sparklineData.length - 1] >= sparklineData[0]
        ? `Balance trend: up over last 30 days`
        : `Balance trend: down over last 30 days`
      : "Balance trend: no data";

  const deltaLabel =
    deltaPercent !== null
      ? deltaPercent >= 0
        ? `↑ ${deltaPercent.toFixed(1)}% ${t("vsPreviousPeriod")}`
        : `↓ ${Math.abs(deltaPercent).toFixed(1)}% ${t("vsPreviousPeriod")}`
      : null;

  const deltaClass =
    deltaPercent === null
      ? styles["heroDelta--neutral"]
      : deltaPercent >= 0
        ? styles["heroDelta--positive"]
        : styles["heroDelta--negative"];

  return (
    <motion.div
      className={`aurora-card--elevated ${styles.hero}`}
      initial={{ opacity: 0, y: config.heroEnterY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: config.heroEnterDuration,
        delay: config.heroEnterDelay,
        ease: config.easeOut,
      }}
    >
      {/* Aurora orbs */}
      <motion.div
        className={`${styles.orb} ${styles.orb1}`}
        animate={
          config.prefersReduced
            ? {}
            : { x: [-10, 10, -10], y: [-10, 10, -10], opacity: [0.5, 0.7, 0.5] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className={`${styles.orb} ${styles.orb2}`}
        animate={
          config.prefersReduced
            ? {}
            : { x: [10, -10, 10], y: [10, -10, 10], opacity: [0.4, 0.6, 0.4] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration * 1.3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className={styles.heroContent}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroEyebrow}>
              {t("currentBalance")}
            </div>
            <div className={styles.heroBalance}>
              <span className={styles.heroBalanceSymbol}>
                {positive ? "+" : "−"}
              </span>
              <CountUpBalance
                value={Math.abs(balance)}
                duration={config.countUpDuration}
              />
            </div>
            {deltaLabel && (
              <motion.div
                className={`${styles.heroDelta} ${deltaClass}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: config.deltaDelay, duration: 0.3 }}
                aria-label={`${deltaPercent! >= 0 ? t("trendUp") : t("trendDown")}: ${Math.abs(deltaPercent!).toFixed(1)}%`}
              >
                {deltaPercent! >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(deltaPercent!).toFixed(1)}%{" "}
                {t("last30Days")}
              </motion.div>
            )}
          </div>
          <div className={styles.heroSparkline}>
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              width={200}
              height={64}
              ariaLabel={sparklineAriaLabel}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **4.5 Create `src/widgets/dashboardHero/index.ts`:**

```tsx
import { DashboardHeroView } from "./ui/DashboardHeroView";
import { useDashboardHero } from "./container/useContainer";

function Container() {
  const props = useDashboardHero();
  return <DashboardHeroView {...props} />;
}

export const DashboardHero = { Widget: Container };
```

- [ ] **4.6 Проверка:**
```bash
npm run lint
npm run build
```
Убедиться: наши файлы компилируются, существующие ошибки игнорируем.

- [ ] **4.7 Commit:**
```bash
git add src/widgets/dashboardHero/
git commit -m "feat(dashboardHero): add hero widget with count-up balance, sparkline, aurora orbs"
```

---

### Task 5: DashboardInsights виджет

**Files:**
- Create: `src/widgets/dashboardInsights/container/useContainer.ts`
- Create: `src/widgets/dashboardInsights/ui/DashboardInsightsView.tsx`
- Create: `src/widgets/dashboardInsights/ui/DashboardInsights.module.scss`
- Create: `src/widgets/dashboardInsights/index.ts`

**Interfaces:**
- Consumes: `useTransactionsStore`, `calculateDashboardStats`, `useMotionConfig`, `useTranslation`, `framer-motion`
- Produces: `DashboardInsights = { Widget: Container }`

**Steps:**

- [ ] **5.1 Create `src/widgets/dashboardInsights/container/useContainer.ts`:**

```ts
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";
import { calculateDashboardStats } from "@/entities/transaction/model/calculateDashboardStats";
import type { DashboardStats } from "@/entities/transaction/model/calculateDashboardStats";

export type InsightTileData = {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  icon: string;
  sublabel: string;
};

function formatInsight(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted.replace(",", ".").replace(/\s/g, " ") + " ₽";
}

export function useDashboardInsights() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const stats: DashboardStats = useMemo(
    () => calculateDashboardStats(allTransactions),
    [allTransactions],
  );

  const tiles: InsightTileData[] = useMemo(
    () => [
      {
        id: "income",
        label: t("income30Days"),
        value: stats.income30d,
        formattedValue: "+" + formatInsight(stats.income30d),
        color: "var(--aurora-success)",
        icon: "💰",
        sublabel: t("last30Days"),
      },
      {
        id: "expense",
        label: t("expense30Days"),
        value: stats.expense30d,
        formattedValue: "−" + formatInsight(stats.expense30d),
        color: "var(--aurora-danger)",
        icon: "💸",
        sublabel: t("last30Days"),
      },
      {
        id: "largest",
        label: t("largestTransaction"),
        value: stats.largestTransaction ? stats.largestTransaction.amount : 0,
        formattedValue: stats.largestTransaction
          ? (stats.largestTransaction.type === "INCOME" ? "+" : "−") +
            formatInsight(stats.largestTransaction.amount)
          : "—",
        color: "var(--aurora-accent)",
        icon: stats.largestTransaction?.category?.icon ?? "📌",
        sublabel: stats.largestTransaction?.category?.name ?? "",
      },
    ],
    [stats, t],
  );

  return { tiles };
}
```

- [ ] **5.2 Create `src/widgets/dashboardInsights/ui/DashboardInsights.module.scss`:**

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tileHeader {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tileIcon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--aurora-accent-soft);
  flex-shrink: 0;
}

.tileLabel {
  font-family: 'Inter', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--aurora-text-secondary);
  line-height: 1.3;
}

.tileValue {
  font-family: 'Sora', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.tileSublabel {
  font-family: 'Inter', system-ui, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--aurora-text-secondary);
}
```

- [ ] **5.3 Create `src/widgets/dashboardInsights/ui/DashboardInsightsView.tsx`:**

```tsx
import { motion } from "framer-motion";
import { useMotionConfig } from "@/shared/lib/motion";
import type { InsightTileData } from "../container/useContainer";
import styles from "./DashboardInsights.module.scss";

type DashboardInsightsViewProps = {
  tiles: InsightTileData[];
};

function InsightTile({ tile, index }: { tile: InsightTileData; index: number }) {
  const config = useMotionConfig();

  return (
    <motion.div
      className={`aurora-card--insight ${styles.tile}`}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={config.prefersReduced ? {} : { y: -2 }}
      transition={
        config.prefersReduced
          ? { duration: 0 }
          : { ...config.springSnappy, delay: index * 0.05 }
      }
    >
      <div className={styles.tileHeader}>
        <div className={styles.tileIcon}>{tile.icon}</div>
        <div className={styles.tileLabel}>{tile.label}</div>
      </div>
      <div className={styles.tileValue} style={{ color: tile.color }}>
        {tile.formattedValue}
      </div>
      <div className={styles.tileSublabel}>{tile.sublabel}</div>
    </motion.div>
  );
}

export function DashboardInsightsView({ tiles }: DashboardInsightsViewProps) {
  const config = useMotionConfig();

  return (
    <motion.div
      className={styles.grid}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: config.staggerChildren,
            delayChildren: config.delayChildren,
          },
        },
      }}
    >
      {tiles.map((tile, idx) => (
        <InsightTile key={tile.id} tile={tile} index={idx} />
      ))}
    </motion.div>
  );
}
```

- [ ] **5.4 Create `src/widgets/dashboardInsights/index.ts`:**

```tsx
import { DashboardInsightsView } from "./ui/DashboardInsightsView";
import { useDashboardInsights } from "./container/useContainer";

function Container() {
  const { tiles } = useDashboardInsights();
  return <DashboardInsightsView tiles={tiles} />;
}

export const DashboardInsights = { Widget: Container };
```

- [ ] **5.5 Проверка:**
```bash
npm run lint
npm run build
```

- [ ] **5.6 Commit:**
```bash
git add src/widgets/dashboardInsights/
git commit -m "feat(dashboardInsights): add insight tiles (income/expense/largest) with stagger animation"
```

---

### Task 6: Обновление TransactionsTable

**Files:**
- Modify: `src/widgets/transactions-table/ui/TransactionsTable.tsx`
- Modify: `src/index.css` — удалить `.transaction-row--income/expense` стили (строки 274-289)

**Interfaces:**
- Consumes: `Transaction`, `framer-motion`, `useMotionConfig`, `Popconfirm` (Ant), `useTranslation`
- Produces: обновленный TransactionsTable с aurora-стилизацией, motion-строками, empty state

**Steps:**

- [ ] **6.1 Проверить что `.transaction-row--*` не используются больше нигде:**
```bash
grep -r "transaction-row" src/ --include="*.tsx" --include="*.ts" --include="*.scss" --include="*.css"
```
Ожидаем: только `src/index.css` (строки 274-289) и `TransactionsTable.tsx` (rowClassName). В остальных файлах usage нет — можно удалять CSS.

- [ ] **6.2 Modify `src/index.css`** — удалить блок `.transaction-row--income/expense` (строки 274-289):

```css
.transaction-row--income > td {
  background: rgba(34, 197, 94, 0.07) !important;
}

.transaction-row--expense > td {
  background: rgba(239, 68, 68, 0.07) !important;
}

/* Ant Design table row hover */
.ant-table-tbody > tr.transaction-row--income:hover > td {
  background: rgba(34, 197, 94, 0.32) !important;
}

.ant-table-tbody > tr.transaction-row--expense:hover > td {
  background: rgba(239, 68, 68, 0.32) !important;
}
```

Удалить эти 16 строк (274-289). Файл после удаления: строки 274-289 исчезают, нумерация сдвигается.

- [ ] **6.3 Modify `src/widgets/transactions-table/ui/TransactionsTable.tsx`** — полный новый код файла:

```tsx
import { Button, Input, Popconfirm, Table } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Transaction } from "../../../entities/transaction";
import type { Category } from "../../../entities/category";
import { useTranslation } from "react-i18next";
import { useMotionConfig } from "@/shared/lib/motion";

type TransactionRow = {
  key: string;
  id: string;
  transaction: Transaction;
  amount: number;
  type: Transaction["type"];
  category: Category;
  date: string; // ISO
  description?: string | null;
};

export type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
  onAddClick?: () => void;
};

function formatTableAmount(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted.replace(",", ".").replace(/\s/g, " ");
}

// motion.tr wrapper
function MotionRow(props: React.HTMLAttributes<HTMLTableRowElement> & { "data-row-key"?: string }) {
  const config = useMotionConfig();
  return (
    <motion.tr
      {...props}
      initial={config.prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        config.prefersReduced
          ? { duration: 0 }
          : { duration: 0.2, ease: config.easeOut }
      }
    />
  );
}

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  deleteLoading,
  onAddClick,
}: TransactionsTableProps) {
  const { t } = useTranslation();
  const [descriptionFilter, setDescriptionFilter] = useState("");

  // Track mount for row animation keys
  const [mountKey, setMountKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setMountKey((prev) => prev + 1);
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: t("description"),
        dataIndex: "description",
        key: "description",
        filterDropdown: () => (
          <div style={{ padding: 8, width: 240 }}>
            <Input
              placeholder={t("searchDescription")}
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              allowClear
            />
          </div>
        ),
        filteredValue: descriptionFilter ? [descriptionFilter] : null,
        onFilter: (value: unknown, record: TransactionRow) =>
          (record.description ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase()),
      },
      {
        title: t("amount"),
        dataIndex: "amount",
        key: "amount",
        sorter: (a: TransactionRow, b: TransactionRow) => a.amount - b.amount,
        render: (amount: number, record: TransactionRow) => {
          const sign = record.type === "INCOME" ? "+" : "−";
          const color =
            record.type === "INCOME"
              ? "var(--aurora-success)"
              : "var(--aurora-danger)";
          const ariaType = record.type === "INCOME" ? "Income" : "Expense";
          return (
            <span
              className="aurora-tabular"
              style={{ color, fontWeight: 500 }}
              aria-label={`${ariaType}: ${sign}${formatTableAmount(amount)} RUB`}
            >
              {sign}
              {formatTableAmount(amount)} ₽
            </span>
          );
        },
      },
      {
        title: t("category"),
        dataIndex: "category",
        key: "category",
        sorter: (a: TransactionRow, b: TransactionRow) =>
          a.category.name.localeCompare(b.category.name),
        render: (category: Category) => (
          <div>
            <span style={{ marginRight: 8 }}>{category.icon}</span>
            <span>{category.name}</span>
          </div>
        ),
      },
      {
        title: t("date"),
        dataIndex: "date",
        key: "date",
        sorter: (a: TransactionRow, b: TransactionRow) =>
          dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
        render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      },
      {
        title: t("actions"),
        dataIndex: "actions",
        key: "actions",
        render: (_: unknown, record: TransactionRow) => (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Popconfirm
              title={t("deleteTransactionConfirm")}
              onConfirm={() => onDelete(record.id)}
              okText={t("delete")}
              cancelText={t("cancel")}
            >
              <Button
                type="link"
                danger
                icon={<span role="img" aria-label={t("delete")}>🗑️</span>}
                loading={deleteLoading}
                aria-label={t("delete")}
                style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              />
            </Popconfirm>
            <Button
              type="link"
              icon={<span role="img" aria-label={t("editTransaction")}>✏️</span>}
              onClick={() => onEdit(record.transaction)}
              aria-label={t("editTransaction")}
              style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            />
          </div>
        ),
      },
    ] satisfies TableProps<TransactionRow>["columns"];
  }, [deleteLoading, descriptionFilter, onDelete, onEdit, t]);

  const dataSource: TransactionRow[] = useMemo(
    () =>
      (transactions ?? []).map((t) => ({
        key: t.id,
        transaction: t,
        ...t,
        date: t.date ?? new Date().toISOString(),
        amount: t.amount,
        category: t.category,
      })),
    [transactions],
  );

  const total = useMemo(() => {
    return dataSource.reduce(
      (acc, record) =>
        record.type === "INCOME" ? acc + record.amount : acc - record.amount,
      0,
    );
  }, [dataSource]);

  const totalFormatted = useMemo(() => {
    const sign = total >= 0 ? "+" : "−";
    return `${sign}${formatTableAmount(total)} ₽`;
  }, [total]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      key={mountKey}
      scroll={{ x: "max-content" }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        current: currentPage,
        onChange: handlePageChange,
      }}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={columns.length}>
            <span
              className="aurora-font-display"
              style={{
                fontSize: 16,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: "var(--aurora-text)",
              }}
            >
              {t("total")}: {totalFormatted}
            </span>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
      onRow={() => ({
        className: "aurora-row-hover",
      })}
      components={{
        body: {
          row: MotionRow,
        },
      }}
      locale={{
        emptyText: dataSource.length === 0 ? (
          <div className="aurora-empty-state">
            <div className="aurora-empty-state__icon">📋</div>
            <div className="aurora-empty-state__title">
              {t("noTransactionsYet")}
            </div>
            {onAddClick ? (
              <Button type="primary" onClick={onAddClick}>
                {t("addFirstTransaction")}
              </Button>
            ) : null}
          </div>
        ) : (
          " "
        ),
      }}
    />
  );
}
```

- [ ] **6.4 Проверка:**
```bash
npm run lint
npm run build
```
Ожидаем: typescript strict mode — проверить что нет ошибок с `components.body.row` (motion.tr несовпадение типов). Если TS ругается — использовать `// @ts-expect-error` с комментарием или `as any`. В проекте есть `satisfies` на columns — это ок.

- [ ] **6.5 Commit:**
```bash
git add src/widgets/transactions-table/ui/TransactionsTable.tsx src/index.css
git commit -m "feat(transactionsTable): aurora restyle — remove type column, add signs/colors, Popconfirm, motion rows, empty state"
```

---

### Task 7: i18n ключи + Skeleton + Error state

**Files:**
- Modify: `src/i18n.js` — добавить новые ключи
- Modify: `src/pages/dashboard/ui/DashboardPageSkeleton.tsx` — aurora-styled skeleton
- Modify: `src/features/transaction/manage/model/useTransactionQueries.ts` — добавить refetch

**Interfaces:**
- Consumes: i18next
- Produces: новые t()-ключи, refetch из useTransactionQueries

**Steps:**

- [ ] **7.1 Modify `src/i18n.js`** — добавить ключи в en-блок (ПОСЛЕ строки 67 `balance: "Balance",`):

```js
          currentBalance: "Current balance",
          last30Days: "Last 30 days",
          largestTransaction: "Largest transaction",
          noTransactionsYet: "No transactions yet",
          addFirstTransaction: "Add your first transaction",
          retry: "Retry",
          trendUp: "up",
          trendDown: "down",
          vsPreviousPeriod: "vs previous period",
          income30Days: "Income · 30 days",
          expense30Days: "Expense · 30 days",
          loadingError: "Failed to load data",
          deleteTransactionConfirm: "Are you sure you want to delete this transaction?",
```

- [ ] **7.2 Modify `src/i18n.js`** — добавить ключи в ru-блок (ПОСЛЕ строки 203 `balance: "Баланс",`):

```js
          currentBalance: "Текущий баланс",
          last30Days: "За 30 дней",
          largestTransaction: "Крупнейшая транзакция",
          noTransactionsYet: "Пока нет транзакций",
          addFirstTransaction: "Добавьте первую транзакцию",
          retry: "Повторить",
          trendUp: "рост",
          trendDown: "спад",
          vsPreviousPeriod: "за период",
          income30Days: "Доходы · 30 дней",
          expense30Days: "Расходы · 30 дней",
          loadingError: "Не удалось загрузить данные",
          deleteTransactionConfirm: "Вы уверены, что хотите удалить эту транзакцию?",
```

- [ ] **7.3 Modify `src/pages/dashboard/ui/DashboardPageSkeleton.tsx`** — aurora-styled skeleton:

```tsx
import { Skeleton } from "antd";

export function DashboardPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero placeholder */}
      <div
        className="aurora-card--elevated"
        style={{ padding: 32, minHeight: 140 }}
      >
        <Skeleton active title={false} paragraph={{ rows: 3 }} />
      </div>

      {/* 3 insight tiles placeholder */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aurora-card"
            style={{ padding: 20, minHeight: 100 }}
          >
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>

      {/* Table placeholder */}
      <div
        className="aurora-card"
        style={{ padding: 20, minHeight: 300 }}
      >
        <Skeleton active title={{ width: "30%" }} paragraph={{ rows: 10 }} />
      </div>
    </div>
  );
}
```

- [ ] **7.4 Modify `src/features/transaction/manage/model/useTransactionQueries.ts`** — добавить refetch в return:

```ts
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import type { Category } from "@/entities/category";
import { GET_CATEGORIES } from "@/entities/category";
import type {
  Transaction,
  TransactionCategoryOption,
} from "@/entities/transaction";
import { GET_TRANSACTIONS } from "@/entities/transaction";

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

const emptyTransactions: Transaction[] = [];
const emptyCategories: Category[] = [];

export function useTransactionQueries() {
  const {
    data: transactionsData,
    loading,
    error,
    refetch,
  } = useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData, refetch: refetchCategories } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const transactions = transactionsData?.transactions ?? emptyTransactions;
  const categories = categoriesData?.categories ?? emptyCategories;

  const categoryOptions = useMemo<TransactionCategoryOption[]>(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
      icon: category.icon,
    }));
  }, [categories]);

  return {
    transactions,
    categories,
    categoryOptions,
    loading,
    error,
    refetch: async () => {
      await Promise.all([refetch(), refetchCategories()]);
    },
  };
}
```

- [ ] **7.5 Проверка:**
```bash
npm run lint
npm run build
```

- [ ] **7.6 Commit:**
```bash
git add src/i18n.js src/pages/dashboard/ui/DashboardPageSkeleton.tsx src/features/transaction/manage/model/useTransactionQueries.ts
git commit -m "feat(i18n): add aurora dashboard i18n keys, refetch support, aurora skeleton"
```

---

### Task 8: Интеграция — DashboardPage refactor

**Files:**
- Create: `src/widgets/transactions/ui/TransactionFormModal.tsx` — вынесенный Modal из TransactionsWidget
- Modify: `src/pages/dashboard/ui/DashboardPage.tsx` — новый layout с hero + insights + таблица
- Modify: `src/features/transaction/manage/model/useTransactionsDashboard.ts` — добавить refetch + onAddClick

**Interfaces:**
- Consumes: DashboardHero, DashboardInsights, TransactionsTable, TransactionFormModal, useTransactionsDashboard, AppShell, FiltersWidget
- Produces: обновленная страница Dashboard

**Steps:**

- [ ] **8.1 Create `src/widgets/transactions/ui/TransactionFormModal.tsx`** — вынести Modal из TransactionsWidget (строки 81-133) в отдельный компонент:

```tsx
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from "antd";
import type { FormInstance } from "antd";
import type { TransactionCategoryOption } from "@/entities/transaction";
import { useTranslation } from "react-i18next";

export type TransactionFormModalProps = {
  isModalOpen: boolean;
  modalTitle: string;
  confirmLoading?: boolean;
  onModalOk: () => void;
  onModalCancel: () => void;
  form: FormInstance;
  categoryOptions: TransactionCategoryOption[];
};

export function TransactionFormModal({
  isModalOpen,
  modalTitle,
  confirmLoading,
  onModalOk,
  onModalCancel,
  form,
  categoryOptions,
}: TransactionFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={onModalOk}
      confirmLoading={confirmLoading}
      onCancel={onModalCancel}
      okText={t("save")}
      cancelText={t("cancel")}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("amount")}
          name="amount"
          rules={[{ required: true, message: t("amountIsRequired") }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            type="number"
            placeholder="0.00"
            prefix="$"
          />
        </Form.Item>
        <Form.Item label={t("description")} name="description">
          <Input type="text" placeholder={t("description")} />
        </Form.Item>
        <Form.Item
          label={t("category")}
          name="category"
          rules={[{ required: true, message: t("categoryIsRequired") }]}
        >
          <Select options={categoryOptions} />
        </Form.Item>
        <Form.Item
          label={t("date")}
          name="date"
          rules={[{ required: true, message: t("dateIsRequired") }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label={t("type")}
          name="type"
          rules={[{ required: true, message: t("typeIsRequired") }]}
        >
          <Radio.Group
            options={[
              { label: t("income"), value: "INCOME" },
              { label: t("expense"), value: "EXPENSE" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

- [ ] **8.2 Modify `src/features/transaction/manage/model/useTransactionsDashboard.ts`** — добавить refetch:

```ts
import { useFilteredTransactions } from "./useFilteredTransactions";
import { useTransactionFormModal } from "./useTransactionFormModal";
import { useTransactionMutations } from "./useTransactionMutations";
import { useTransactionQueries } from "./useTransactionQueries";

export function useTransactionsDashboard() {
  const { transactions, categoryOptions, loading, error, refetch } =
    useTransactionQueries();
  const filteredTransactions = useFilteredTransactions(transactions);
  const mutations = useTransactionMutations();
  const formModal = useTransactionFormModal({
    createTransaction: mutations.createTransaction,
    updateTransaction: mutations.updateTransaction,
    addTransactionLoading: mutations.addTransactionLoading,
    editTransactionLoading: mutations.editTransactionLoading,
  });

  return {
    // data
    transactions: filteredTransactions,
    categoryOptions,

    // query state
    loading,
    error,
    refetch,

    // modal state
    isModalOpen: formModal.isModalOpen,
    modalTitle: formModal.modalTitle,
    confirmLoading: formModal.confirmLoading,

    // form
    form: formModal.form,

    // actions
    openCreate: formModal.openCreate,
    openEdit: formModal.openEdit,
    closeModal: formModal.closeModal,
    submit: formModal.submit,
    remove: mutations.removeTransaction,

    // table state
    deleteLoading: mutations.deleteTransactionLoading,
  };
}
```

- [ ] **8.3 Modify `src/pages/dashboard/ui/DashboardPage.tsx`** — полный новый код:

```tsx
import { Button } from "antd";
import { useTransactionsDashboard } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsFiltersWidget } from "../../../features/transaction/filters";
import { TransactionsTable } from "../../../widgets/transactions-table/ui/TransactionsTable";
import { TransactionFormModal } from "../../../widgets/transactions/ui/TransactionFormModal";
import { DashboardHero } from "../../../widgets/dashboardHero";
import { DashboardInsights } from "../../../widgets/dashboardInsights";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { useTranslation } from "react-i18next";

export function DashboardPage() {
  const dashboard = useTransactionsDashboard();
  const { t } = useTranslation();

  if (dashboard.loading)
    return (
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
      >
        <DashboardPageSkeleton />
      </AppShell>
    );

  if (dashboard.error)
    return (
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
      >
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>⚠️</div>
          <div
            className="aurora-font-body"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--aurora-text)",
              marginBottom: 8,
            }}
          >
            {t("loadingError")}
          </div>
          <div
            className="aurora-text-secondary"
            style={{ fontSize: 14, marginBottom: 20 }}
          >
            {String(dashboard.error)}
          </div>
          <Button
            type="primary"
            onClick={() => dashboard.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      </AppShell>
    );

  return (
    <AppShell
      title={t("transactions")}
      subtitle={t("trackIncomeAndExpenses")}
      primaryAction={
        <Button type="primary" onClick={dashboard.openCreate}>
          {t("addTransaction")}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. Hero Balance */}
        <DashboardHero.Widget />

        {/* 2. Insight tiles */}
        <DashboardInsights.Widget />

        {/* 3. Filters */}
        <div className="aurora-card" style={{ padding: "12px 16px" }}>
          <TransactionsFiltersWidget />
        </div>

        {/* 4. Table */}
        <div className="aurora-card" style={{ padding: 16 }}>
          <TransactionsTable
            transactions={dashboard.transactions}
            onEdit={dashboard.openEdit}
            onDelete={dashboard.remove}
            deleteLoading={dashboard.deleteLoading}
            onAddClick={dashboard.openCreate}
          />
        </div>
      </div>

      {/* Modal (outside AppShell content flow to render at root) */}
      <TransactionFormModal
        isModalOpen={dashboard.isModalOpen}
        modalTitle={dashboard.modalTitle}
        confirmLoading={dashboard.confirmLoading}
        onModalOk={dashboard.submit}
        onModalCancel={dashboard.closeModal}
        form={dashboard.form}
        categoryOptions={dashboard.categoryOptions}
      />
    </AppShell>
  );
}
```

- [ ] **8.4 Проверка что TransactionsWidget не используется на других страницах:**
```bash
grep -r "TransactionsWidget" src/ --include="*.tsx"
```
Ожидаем: `DashboardPage.tsx` (старый usage, который мы заменили) и `TransactionsWidget.tsx` (определение). Если есть другие import — решить (но судя по кодовой базе, их нет). TransactionsWidget НЕ удаляем — оставляем для обратной совместимости.

- [ ] **8.5 Проверка:**
```bash
npm run lint
npm run build
npm run dev
```
Открыть http://localhost:5173/ — проверить:
- Hero рендерится с count-up анимацией
- Insight плитки (3 шт) с данными
- Фильтры работают
- Таблица с motion-строками
- Add/edit modal открывается и работает
- Delete с Popconfirm

- [ ] **8.6 Commit:**
```bash
git add src/widgets/transactions/ui/TransactionFormModal.tsx src/features/transaction/manage/model/useTransactionsDashboard.ts src/pages/dashboard/ui/DashboardPage.tsx
git commit -m "feat(dashboard): integrate hero, insights, filters, table with refetch and error states"
```

---

### Task 9: Финальная полировка + адаптив

**Files:**
- Modify: `src/widgets/dashboardHero/ui/DashboardHero.module.scss` — мобильный адаптив (уже есть @media в файле, проверяем)
- Modify: `src/widgets/dashboardInsights/ui/DashboardInsights.module.scss` — мобильный адаптив (уже есть @media в файле)
- Modify: `src/widgets/transactions-table/ui/TransactionsTable.tsx` — мобильная видимость action-иконок
- Modify: `src/pages/dashboard/ui/DashboardPageSkeleton.tsx` — адаптив skeleton
- Final: `src/index.css` — очистка мёртвого CSS

**Interfaces:**
- Consumes: существующие стили
- Produces: адаптивный dashboard на мобильных

**Steps:**

- [ ] **9.1 Проверить адаптив в DashboardHero.module.scss — добавить мобильные стили:**

Уже есть `@media (max-width: 768px)` в файле из Task 4. Дополнительно добавить:

```scss
// В конец файла DashboardHero.module.scss добавить:
@media (max-width: 480px) {
  .heroBalance {
    font-size: 30px;
  }

  .heroBalanceSymbol {
    font-size: 22px;
  }

  .heroDelta {
    font-size: 12px;
    padding: 3px 8px;
  }
}
```

- [ ] **9.2 Обновить DashboardInsights.module.scss — дополнительный адаптив:**

Уже есть `grid-template-columns: 1fr` на 768px. Добавить:

```scss
// В конец файла DashboardInsights.module.scss добавить:
@media (max-width: 480px) {
  .tileValue {
    font-size: 22px;
  }

  .tileIcon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
```

- [ ] **9.3 Modify `src/pages/dashboard/ui/DashboardPageSkeleton.tsx`** — адаптив skeleton (media query через inline style нельзя, добавим класс):

```tsx
import { Skeleton } from "antd";

export function DashboardPageSkeleton() {
  return (
    <div
      className="dashboard-skeleton-grid"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Hero placeholder */}
      <div
        className="aurora-card--elevated"
        style={{ padding: 32, minHeight: 140 }}
      >
        <Skeleton active title={false} paragraph={{ rows: 3 }} />
      </div>

      {/* 3 insight tiles placeholder */}
      <div
        className="dashboard-skeleton-insights"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aurora-card"
            style={{ padding: 20, minHeight: 100 }}
          >
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>

      {/* Table placeholder */}
      <div
        className="aurora-card"
        style={{ padding: 20, minHeight: 300 }}
      >
        <Skeleton
          active
          title={{ width: "30%" }}
          paragraph={{ rows: 10 }}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-skeleton-insights {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **9.4 Проверить что `.transaction-row--*` действительно удалены из index.css (Task 6.2). Если нет — удалить сейчас:** строки 274-289 из `src/index.css` (см. Task 6.2).

- [ ] **9.5 Добавить tail-стили для action-иконок на мобильных — в `src/index.css`:**

```css
/* Action icons always visible on mobile */
@media (max-width: 768px) {
  .ant-table-cell .ant-btn-link {
    opacity: 1 !important;
  }
}
```

- [ ] **9.6 Проверка финальная:**
```bash
npm run lint
npm run build
npm run dev
```

Ручная проверка:
- DevTools mobile viewport 375px — hero/insights/table адаптируются
- DevTools Rendering → prefers-reduced-motion: forced — анимации мгновенные
- Tab-навигация: focus-ring виден
- Цветовой контраст: через DevTools Accessibility panel

- [ ] **9.7 Финальный commit:**
```bash
git add src/widgets/dashboardHero/ui/DashboardHero.module.scss src/widgets/dashboardInsights/ui/DashboardInsights.module.scss src/pages/dashboard/ui/DashboardPageSkeleton.tsx src/index.css
git commit -m "feat(dashboard): mobile responsiveness, focus rings, reduced-motion polish"
```

---

## Self-Review

| Criteria | Status |
|---|---|
| Все задачи с `- [ ]` чекбоксами | Pass |
| Каждый шаг — одно действие (2-5 мин) | Pass |
| Реальный код в каждом шаге (нет "TODO", "placeholder", "... (остальное без изменений)" без явной пометки) | Pass |
| Все Create/Modify файлы с абсолютными путями | Pass |
| Все сигнатуры типов скопированы из реальной кодовой базы | Pass |
| `src/entities/transaction/model/store.ts` — ТОЛЬКО `useTransactionsStore`, селектор через инлайн `(s) => s.allTransactions` | Pass |
| `calculatePercentage` логика переиспользована из `calculateReportCards.ts:12-18` | Pass |
| TransactionsWidget.props точно совпадают со строками 22-41 TransactionsWidget.tsx | Pass |
| TransactionsTable.columns точно совпадают со строками 36-117 (key: description, type, amount, category, date, actions) | Pass |
| AppShell props (title, subtitle, primaryAction, children) — правильные | Pass |
| i18n ключи вставлены после `balance` в en (строка 67) и ru (строка 203) | Pass |
| CSP: `style-src` +fonts.googleapis.com, `font-src` +fonts.gstatic.com | Pass |
| AppAntdProvider fontFamily → Inter-based, colorPrimary НЕ тронут | Pass |
| Нет `*.test.*` файлов, нет `npm test`, нет vitest/jest | Pass |
| Проверка через `npm run lint` + `npm run build` (игнорируем 2 известные ошибки) + визуально `npm run dev` | Pass |
| `verbatimModuleSyntax`: `import type` для type-only imports | Pass |
| Framer Motion только transform/opacity, `useReducedMotion()` везде | Pass |
| aria-label на icon-only кнопках, спарклайне, суммах | Pass |
| tabular-nums для всех чисел | Pass |
| Мёртвый CSS `.transaction-row--*` удалён | Pass |
| Существующие `--accent`/`--bg`/`--text` токены НЕ тронуты | Pass |
| Тёмный режим НЕ добавлен | Pass |
