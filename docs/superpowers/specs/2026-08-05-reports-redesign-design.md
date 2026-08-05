# Reports Page Redesign — Design Spec

**Date:** 2026-08-05
**Branch:** feat/dashboard-aurora-redesign (extends)
**Selected variant:** C — Editorial / Featured

## Summary

Полный редизайн страницы `/reports` финансового дашборда в рамках Aurora design system.
Текущая страница — bare-bones сетка графиков без визуальной иерархии, без состояний
загрузки/ошибки, без анимаций и с устаревшей палитрой ECharts. Редизайн вводит
featured-hero с count-up сводкой и aurora-orbs, стилизованные KPI-карточки с дельтой,
bento 2×2 сетку для графиков и объединённый виджет списков с Ant Tabs + AnimatePresence.
Все графики перенастроены на aurora-токены. Страница использует framer-motion с
prefers-reduced-motion гейтами, глобальные aurora-утилиты из `src/index.css` и
консистентна с dashboard и categories.

---

## 1. Context and Goals

### 1.1 What we are redesigning

Страница `/reports` (`pages/reports/ui/ReportsPage.tsx`) — вторая по важности страница
после Dashboard. Пользователи видят агрегированную аналитику по доходам/расходам.

### 1.2 Problems we solve

| Problem | Current state | Target |
|---|---|---|
| Визуальная иерархия отсутствует | Плоская сетка 4×2 без hero и без акцентов | Featured hero + KPI bar + bento — читаемый flow сверху вниз |
| Мобильный «пусто и мелко» | Графики min-height 260px, легенды обрезаются | Mobile min-height 320-360px, легенды внизу, KPI 2×2 |
| Старый стиль | Тень `var(--shadow)`, border-radius 10px, цвета hardcoded (`#FF4D4F`, `#52C41A`) | Aurora-токены, radius 16px, hairline-бордер `--aurora-border` |
| Нет анимаций | Статичная загрузка страницы | Stagger reveal, count-up чисел, hover-lift карточек, AnimatePresence табов |
| Нет состояний | Нет loading skeleton, нет error card, нет empty state | Полный набор состояний в aurora-стиле |
| Неиспользуемая сводка | ReportCardWidget есть, но сливается с графиками | KPI 4 карточки aurora-card--insight с count-up + дельтой, вынесенные над графиками |
| IncomeVsExpenceChart закопан в сетке | Не выделен визуально как ключевой график | Помещён в featured hero справа, elevated card |
| Разрозненные списки | TopCategories и LargestTransactions в отдельных ячейках сетки | Объединены в ReportsLists с Ant Tabs |

### 1.3 Non-goals

- Не трогаем фильтры (TransactionsFiltersWidget) — остаётся as-is, только обёртка в aurora-card.
- Не меняем логику расчёта данных (useContainer'ы виджетов остаются source of truth).
- Не добавляем новых зависимостей — framer-motion уже установлен.
- Не меняем AppShell — ReportsPage рендерится внутри него, как и раньше.

---

## 2. Fixed Decisions (from brainstorming)

1. **Featured hero** слева (заголовок + сводка 3 числа + orbs), справа — IncomeVsExpenceChart в elevated-card.
2. **KPI: 4 отдельных aurora-card--insight**, заменяют текущий ReportCardWidget (переработка виджета). Конфиг: Total Income (success), Total Expense (danger), Net Balance (accent), Savings Rate (neutral). Savings Rate = новый 4-й KPI вместо Average Per Day.
3. **Bento 2×2**: ExpenseChart (donut) + MountlyExpenseChart. CSS Grid 2 колонки на desktop.
4. **ReportsLists** — новый виджет с Ant Tabs: «Категории» (TopCategories.Widget) и «Транзакции» (LargestTransactions.Widget). AnimatePresence fade + y-offset.
5. **ECharts**: полная перенастройка на aurora-токены. Без градиентов. Animation в ECharts минимальная (animationDuration 600), т.к. контейнеры анимирует framer-motion.
6. **framer-motion** для всей страницы: stagger reveal секций, count-up чисел, AnimatePresence табов, scroll-reveal графиков, hover-lift карточек.
7. **Loading/error/empty** в aurora-стиле, как на dashboard и categories.
8. **Адаптив**: >1200px desktop, 768-1200px tablet, <768px mobile. На mobile KPI 2×2, графики мин. 320-360px, легенды внизу, orbs скрываются <480px.
9. **Нет градиентов** — глубина через тени и hairline-бордеры.
10. **Иконки** из @ant-design/icons (SVG), не emoji.

---

## 3. Visual Language (Aurora Design System)

### 3.1 Tokens (из `src/index.css`)

Все токены уже определены в `:root`:

| Token | Value | Usage |
|---|---|---|
| `--aurora-surface` | `#F7F5FB` | Фон страницы |
| `--aurora-surface-card` | `#FFFFFF` | Фон карточек |
| `--aurora-surface-elevated` | `#FFFFFF` | Elevated карточки |
| `--aurora-accent` | `#7C3AED` | Акцент (Net Balance, фокус) |
| `--aurora-accent-soft` | `#EDE9FE` | Мягкий акцентный фон |
| `--aurora-success` | `#0E9F6E` | Income, позитивная дельта |
| `--aurora-success-soft` | `#D1FAE5` | Мягкий зелёный фон |
| `--aurora-danger` | `#E0457B` | Expense, негативная дельта |
| `--aurora-danger-soft` | `#FCE7F3` | Мягкий розовый фон |
| `--aurora-text` | `#1E1B2E` | Основной текст |
| `--aurora-text-secondary` | `#6B6680` | Второстепенный текст |
| `--aurora-border` | `#E8E4F0` | Бордеры, сетка |
| `--aurora-shadow-color` | `rgba(76, 29, 149, 0.08)` | Базовый цвет теней |
| `--aurora-shadow-sm` | `0 1px 2px var(--aurora-shadow-color)` | Карточки |
| `--aurora-shadow-md` | `0 4px 12px var(--aurora-shadow-color)` | Hover |
| `--aurora-shadow-lg` | `0 12px 32px var(--aurora-shadow-color)` | Elevated |

### 3.2 Utility Classes (из `src/index.css`)

- `.aurora-surface` — фон страницы
- `.aurora-card` — базовая карточка (16px radius, sm shadow)
- `.aurora-card--elevated` — elevated (lg shadow)
- `.aurora-card--insight` — insight-карточка (sm shadow, hover-md lift)
- `.aurora-tabular` — tabular-nums для чисел
- `.aurora-text-primary`, `.aurora-text-secondary`, `.aurora-text-success`, `.aurora-text-danger`
- `.aurora-font-display` — Sora (заголовки, числа)
- `.aurora-font-body` — Inter (текст)
- `.aurora-empty-state` — empty state контейнер (48px padding, центрирование, gap 12px)
- `.aurora-empty-state__icon` — иконка 48px, opacity 0.6
- `.aurora-empty-state__title` — заголовок 15px 500
- `.aurora-row-hover` / `.aurora-row-actions` — hover-раскрытие кнопок в строках
- `.aurora-focus-ring` — фокус-кольцо

### 3.3 Typography Rules

- **Заголовки**: `.aurora-font-display` (Sora), weight 600-700, color `--aurora-text`
- **Тело**: `.aurora-font-body` (Inter), weight 400-500, color `--aurora-text` / `--aurora-text-secondary`
- **Числа**: `.aurora-tabular` + `.aurora-font-display`, weight 700, size 24-32px (KPI/hero), 12px (лейблы)
- **Цветовая хроматика**: только для данных — success (income), danger (expense), accent (balance)

### 3.4 Rules

- **Нет градиентов** — Gist: пользователь отверг. Глубина достигается тенями (sm/md/lg) и hairline-бордерами.
- **Ant компоненты остаются светлыми** — `AppAntdProvider` не использует `darkAlgorithm`. Тёмная тема — только через CSS custom properties и `prefers-color-scheme: dark`.
- **Хроматика только для данных**: зелёный = income/рост, розовый = expense/падение, фиолетовый = акцент/нейтрально.
- **Иконки**: SVG из `@ant-design/icons`, не emoji.

---

## 4. Architecture (FSD)

### 4.1 New Widgets

| Widget | Path | Pattern | Description |
|---|---|---|---|
| `ReportsHero` | `widgets/reportsHero/` | `.Widget` object export | Featured hero: сводка (3 числа) + orbs слева, IncomeVsExpenceChart справа |
| `ReportsLists` | `widgets/reportsLists/` | `.Widget` object export | Ant Tabs с TopCategories + LargestTransactions, AnimatePresence переключение |

### 4.2 Changed Widgets

| Widget | Path | Changes |
|---|---|---|
| `ReportCardWidget` | `widgets/reportCard/` | UI переписан под aurora-card--insight, добавлен count-up чисел, 4-я карточка Savings Rate вместо Average Per Day, новые tone-цвета через aurora-токены |
| `ExpenseChart` | `widgets/expenseChart/` | Стили → aurora-card + aurora-токены. ECharts option → aurora-палитра. UI обновлён (тайтл через aurora-классы). |
| `IncomeVsExpenceChart` | `widgets/incomeVsExpenceChart/` | То же. Используется внутри ReportsHero в elevated-card. |
| `MountlyExpenseChart` | `widgets/mountlyExpenseChart/` | То же + aurora-стили для DatePicker обёртки |

### 4.3 Changed Page

| Page | Path | Changes |
|---|---|---|
| `ReportsPage` | `pages/reports/ui/ReportsPage.tsx` | Полная переработка: aurora-surface обёртка, compose ReportsHero + KPI + bento + ReportsLists, loading/error состояния |

### 4.4 File Structure (net-new and changed files)

```
src/
  pages/reports/
    ui/
      ReportsPage.tsx          ← ПЕРЕРАБОТАН
      ReportsPage.module.scss  ← ПЕРЕПИСАН (bento + adaptive grid)
      ReportsPageSkeleton.tsx  ← НОВЫЙ (page-level skeleton, аналог DashboardPageSkeleton)

  widgets/
    reportsHero/                ← НОВЫЙ
      index.ts
      container/
        index.tsx
        useContainer.ts        (данные для сводки: income, expense, balance)
      ui/
        ReportsHeroView.tsx
        ReportsHero.module.scss
        ReportsHeroSkeleton.tsx

    reportsLists/               ← НОВЫЙ
      index.ts
      container/
        index.tsx
      ui/
        ReportsListsView.tsx
        ReportsLists.module.scss
        ReportsListsSkeleton.tsx

    reportCard/                 ← ИЗМЕНЁН
      container/
        useContainer.tsx        (добавлен Savings Rate)
        ReportCardWidget.tsx    (loading/error — aurora skeleton/error card)
        ReportCardWidgetSkeleton.tsx  ← ПЕРЕРАБОТАН (aurora shimmer)
      ui/
        ReportCard.tsx          ← ПЕРЕРАБОТАН (insight card + count-up)
        styles.module.scss      ← ПЕРЕРАБОТАН (aurora-токены)
      model/
        types.ts                ← ИЗМЕНЁН (Savings Rate конфиг)
        cardsConfig.tsx         ← ИЗМЕНЁН (Savings Rate вместо Average Per Day)

    expenseChart/
      container/useContainer.tsx  ← ИЗМЕНЁН (aurora ECharts option)
      ui/
        index.tsx                ← ИЗМЕНЁН (aurora-стили, card wrapper)
        styles.module.scss       ← ПЕРЕРАБОТАН (aurora-токены)

    incomeVsExpenceChart/
      container/useContainer.tsx  ← ИЗМЕНЁН (aurora ECharts option)
      ui/
        index.tsx                ← ИЗМЕНЁН (убираем title — он в hero)
        styles.module.scss       ← ПЕРЕРАБОТАН (aurora-токены)

    mountlyExpenseChart/
      container/useContainer.tsx  ← ИЗМЕНЁН (aurora ECharts option)
      ui/
        index.tsx                ← ИЗМЕНЁН (aurora-стили)
        styles.module.scss       ← ПЕРЕРАБОТАН (aurora-токены)

    topCategories/               ← БЕЗ ИЗМЕНЕНИЙ
    largestTransactions/         ← БЕЗ ИЗМЕНЕНИЙ

  shared/lib/
    motion.ts                    ← ДОБАВЛЕНЫ scrollReveal variants
```

### 4.5 Data Flow

```
ReportsPage
  ├── useTransactionQueries()            ← page-level: получает { loading, error, refetch }
  │     └── Apollo cache-first: первый вызов заполняет кеш, последующие (в виджетах) — cache hit
  │
  ├── [loading] → ReportsPageSkeleton    ← все секции shimmer
  ├── [error]   → Error card (ExclamationCircleOutlined + Retry)
  ├── [empty]   → Empty state (InboxOutlined + "Нет данных за период")
  │
  └── [loaded]
        ├── <ReportsHero.Widget />
        │     └── useContainer → useTransactionQueries + useFilters
        │           └── { totalIncome, totalExpense, balance }
        │     └── <IncomeVsExpenceChart.Widget /> (встроен в hero)
        │
        ├── <ReportCardWidget />          ← 4 KPI карточки
        │     └── useContainer → useTransactionQueries + useFilters
        │           └── calculateReportCards → [{ id, title, value, percentage, positive, ... }]
        │
        ├── <ExpenseChart.Widget />       ← donut
        │     └── useContainer → calculateExpenceChart
        │
        ├── <MountlyExpenseChart.Widget /> ← line/area
        │     └── useContainer → getTransactionsByMonth
        │
        └── <ReportsLists.Widget />
              └── Ant Tabs
                    ├── TopCategories.Widget
                    └── LargestTransactions.Widget
```

**Важно for data flow**: `ReportsPage` вызывает `useTransactionQueries()` на уровне страницы. При `loading === true` рендерится `ReportsPageSkeleton` (единый shimmer на все секции). Когда данные загружены, Apollo-кеш заполнен — каждый виджет внутри вызывает `useTransactionQueries()` повторно, но `fetchPolicy: 'cache-first'` (default) отдаёт данные из кеша мгновенно с `loading: false`. Это исключает «прыжки» layout и множественные спиннеры внутри виджетов.

---

## 5. Detailed Design by Section

### 5.1 Page Shell

```
ReportsPage
├── AppShell (title="reports", subtitle="reportsOnYourTransactions")
│     └── <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
│           ├── <TransactionsFiltersWidget /> (в aurora-card, padding: 12px 16px)
│           ├── <ReportsHero.Widget />
│           ├── <ReportCardWidget /> (4 KPI)
│           ├── <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}> (bento)
│           │     ├── <ExpenseChart.Widget />
│           │     └── <MountlyExpenseChart.Widget />
│           ├── <ReportsLists.Widget />
```

- Контейнер с `gap: 20px` на desktop, `16px` на tablet/mobile.
- Все карточки используют `className="aurora-card"` (или `aurora-card--elevated`/`aurora-card--insight`).
- `ReportsPage.module.scss` содержит только стили для bento-грида и адаптив-переопределения. Вся остальная стилизация — через глобальные aurora-классы и инлайн/модульные стили виджетов.

### 5.2 ReportsHero Widget

**Layout (desktop):**
```
┌──────────────────────────────────────────────────────────┐
│ aurora-card--elevated (padding: 32px)                   │
│ display: grid, grid-template-columns: 1fr 1fr, gap: 24px│
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐│
│  │ LEFT (text + orbs)   │  │ RIGHT (chart)             ││
│  │                      │  │ aurora-card               ││
│  │ h1 "Отчеты"          │  │ IncomeVsExpenseChart      ││
│  │   Sora 700 32px      │  │                           ││
│  │                      │  │                           ││
│  │ p "Отчеты по вашим   │  │                           ││
│  │   транзакциям"       │  │                           ││
│  │   Inter 15px         │  │                           ││
│  │   text-secondary     │  │                           ││
│  │                      │  │                           ││
│  │ ┌──────────────────┐ │  │                           ││
│  │ │ Total Income      │ │  │                           ││
│  │ │ $12,450  success  │ │  │                           ││
│  │ │ Total Expense     │ │  │                           ││
│  │ │ $4,320   danger   │ │  │                           ││
│  │ │ Net Balance       │ │  │                           ││
│  │ │ $8,130   accent   │ │  │                           ││
│  │ └──────────────────┘ │  │                           ││
│  │                      │  │                           ││
│  │ [orb 1] [orb 2]     │  │                           ││
│  │  blur 80px, float   │  │                           ││
│  └──────────────────────┘  └───────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

**Сводка (3 числа):**
- Каждая строка: label (11px, muted, uppercase tracking) + значение (Sora 700, 28px desktop / 24px mobile, tabular-nums)
- Цвета: Income → `--aurora-success`, Expense → `--aurora-danger`, Balance → `--aurora-accent`
- Count-up анимация через `useMotionValue` + `animate()`: duration `countUpDuration` (1.2s / 0 if reduced)
- Данные приходят из `useContainer` виджета (totalIncome, totalExpense, balance — агрегация по transactions)

**Aurora Orbs:**
- 2 декоративных `motion.div`, абсолютное позиционирование в левой части
- Размеры: orb1 ~200px, orb2 ~120px
- Цвета: orb1 → `--aurora-accent-soft` (opacity 0.4), orb2 → `--aurora-accent` (opacity 0.15)
- `filter: blur(80px)`, `border-radius: 50%`, `pointer-events: none`, `z-index: 0`
- Анимация: `motion.div` с `animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], opacity: [0.3, 0.5, 0.3] }}`, duration `orbDuration` (8s), `repeat: Infinity`, `ease: "easeInOut"`
- На mobile <480px: `display: none` (чтобы не мешали тексту)

**Hero entrance:**
- `motion.div` initial `{ opacity: 0, y: heroEnterY }` → animate `{ opacity: 1, y: 0 }`, duration `heroEnterDuration`, delay `heroEnterDelay`

**IncomeVsExpenseChart в hero:**
- Размещается в правой колонке, внутри `aurora-card` (отдельная карточка для визуального отделения)
- UI-компонент графика НЕ рендерит собственный title (заголовок уже есть в левой колонке)
- Легенда: сверху
- На tablet/mobile: график перемещается ПОД текстовую сводку (колонки схлопываются в 1)

### 5.3 KPI Bar (ReportCardWidget)

**Layout:**
```
CSS Grid: 4 колонки на desktop (1fr каждая), gap: 16px
Tablet (768-1200px): 2 колонки
Mobile (<768px): 2 колонки
```

**Каждая карточка (aurora-card--insight):**
```
┌─────────────────────────────────┐
│ Icon (24px)                     │
│                                 │
│ Label (11px, muted, uppercase)  │
│ Value (28px desktop/24px mobile,│
│        Sora 700, tabular-nums)  │
│                                 │
│ Delta: ↑/↓ X.X% vs last month   │
│ (13px, success/danger цвет)     │
└─────────────────────────────────┘
```

**Конфиг 4 карточек:**

| id | titleKey | Icon | tone / цвет value | content |
|---|---|---|---|---|
| `income` | `totalIncome` | `ArrowUpOutlined` | success (`--aurora-success`) | Total income + delta % |
| `expense` | `totalExpense` | `ArrowDownOutlined` | danger (`--aurora-danger`) | Total expense + delta % |
| `balance` | `balance` | `WalletOutlined` | accent (`--aurora-accent`) | Net balance + delta % |
| `savingsRate` | `savingsRate` | `PieChartOutlined` | neutral (`--aurora-text-secondary`) | (Income - Expense) / Income × 100%, без дельты |

**Savings Rate** — новый KPI, заменяет Average Per Day:
- Значение = `income > 0 ? Math.round(((income - expense) / income) * 100) : 0`
- Отображается как `XX%` (процент, не валюта)
- `showPercentage: false` (нет дельты сравнения с прошлым периодом), вместо дельты — текст `Based on N days` или `All time`

**Изменения в `cardsConfig.tsx`:**
- Удалить запись `averagePerDay`
- Добавить запись `savingsRate` с `id: "savingsRate"`, `Icon: PieChartOutlined`, `tone: "neutral"`

**Изменения в `ReportCard.tsx` (UI):**
- Убрать Ant Design `<Card>` — заменить на `<div className="aurora-card--insight">`
- Добавить `whileHover={{ y: -2 }}` (framer-motion, springSnappy)
- Count-up для значения через `useMotionValue` + `animate()`
- Форматирование: числа — `Intl.NumberFormat` currency USD (income/expense/balance), процент — `XX%` (savingsRate)
- Tone-цвета через aurora CSS-переменные: значение `.aurora-text-success` / `.aurora-text-danger` / `.aurora-text-primary`
- Delta: `CaretUpOutlined` / `CaretDownOutlined` иконки + процент + `vs last month` / `vs ...`

**Изменения в `ReportCardWidgetSkeleton.tsx`:**
- Заменить Ant `Skeleton.Node` на shimmer-div'ы (как в категориях/ dashboard skeleton)

### 5.4 Bento 2×2 (ExpenseChart + MountlyExpenseChart)

**Layout:**
```
CSS Grid: 2 колонки (1fr 1fr), gap: 20px desktop / 16px tablet / 16px mobile

  ┌──────────────────────┐  ┌──────────────────────┐
  │ ExpenseChart (donut) │  │ MountlyExpenseChart  │
  │ aurora-card          │  │ aurora-card          │
  │                      │  │                      │
  │ Title: "Expenses     │  │ Title + DatePicker   │
  │  by category"        │  │ "Expenses by month"  │
  │                      │  │                      │
  │   ┌─────────┐       │  │  Line chart          │
  │   │  Donut   │       │  │                      │
  │   │ Total    │       │  │                      │
  │   │ $X,XXX   │       │  │                      │
  │   └─────────┘       │  │                      │
  │                      │  │                      │
  │   Legend             │  │                      │
  └──────────────────────┘  └──────────────────────┘
```

**Tablet (<1200px):** 1 колонка (стек), каждый график на полную ширину.

**Mobile (<768px):** 1 колонка, min-height 320px.

### 5.5 ReportsLists Widget

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ aurora-card (padding: 16px)                             │
│                                                          │
│ Ant Tabs (defaultActiveKey="categories")                 │
│ ┌──────────────┬─────────────────┐                      │
│ │ Categories   │ Transactions    │  ← Ant Tabs          │
│ └──────────────┴─────────────────┘                      │
│                                                          │
│ <AnimatePresence mode="wait">                            │
│   <motion.div key={activeKey}>                           │
│     {activeKey === "categories"  → TopCategories.Widget} │
│     {activeKey === "transactions" → LargestTransactions.Widget}│
│   </motion.div>                                          │
│ </AnimatePresence>                                       │
└──────────────────────────────────────────────────────────┘
```

**Tabs:**
- `activeKey` из `useState<'categories' | 'transactions'>('categories')`
- Стилизация через Ant Design токены (по умолчанию светлые, без кастомизации — aurora-тема не затрагивает Ant)


**AnimatePresence:**
- `mode="wait"` — сначала exit, потом enter
- initial `{ opacity: 0, y: 8 }`, animate `{ opacity: 1, y: 0 }`, exit `{ opacity: 0, y: -8 }`
- duration: enter `durationEnter` (0.22s), exit `durationExit` (0.14s)
- ease: `easeOut`

**Mobile:**
- Tabs скроллятся (`<Tabs>` не оборачивается — Ant сам обрабатывает overflow на мобильных с `tabBarExtraContent`)

**Tabs i18n keys:**
- `tabsCategories` → "Categories" / "Категории"
- `tabsTransactions` → "Transactions" / "Транзакции"

---

## 6. ECharts Reconfiguration

### 6.1 Common Aurora Defaults

Все 3 графика используют эти базовые настройки:

```javascript
// Шрифты
textStyle: { fontFamily: "'Inter', sans-serif" }

// Tooltip — единый для всех
tooltip: {
  backgroundColor: '#FFFFFF',
  borderColor: '#E8E4F0',
  textStyle: { color: '#1E1B2E', fontFamily: "'Inter', sans-serif", fontSize: 13 },
  extraCssText: 'box-shadow: 0 4px 12px rgba(76,29,149,0.10); border-radius: 12px; padding: 10px 14px;',
}

// Сетка (оси)
splitLine: { lineStyle: { color: '#E8E4F0', type: 'dashed' } }
axisLine: { show: false }
axisTick: { show: false }
axisLabel: { color: '#6B6680', fontSize: 12, fontFamily: "'Inter', sans-serif" }
```

### 6.2 ExpenseChart (Donut)

```javascript
// Цвета серий — через aurora-переменные из CSS (getComputedStyle или хардкод)
const COLORS = ['#7C3AED', '#0E9F6E', '#E0457B', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899', '#10B981'];

series: [{
  type: 'pie',
  radius: ['55%', '75%'],         // достаточно места для total в центре (desktop)
  center: ['50%', '50%'],
  data: chartData.data,
  color: COLORS,
  label: {
    show: true,
    position: 'outside',
    formatter: '{b}\n{d}%',
    color: '#6B6680',
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
  },
  emphasis: {
    scaleSize: 8,
    label: { fontSize: 14, fontWeight: 'bold' },
  },
  itemStyle: { borderColor: '#FFFFFF', borderWidth: 2 },
  animationDuration: 600,
  animationEasing: 'cubicOut',
}]

// Total в центре
title: {
  text: `$${chartData.total.toLocaleString()}`,
  left: 'center',
  top: 'center',
  textStyle: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "'Sora', 'Inter', sans-serif",
    color: '#1E1B2E',
  },
  subtext: t('total'),
  subtextStyle: {
    fontSize: 12,
    color: '#6B6680',
    fontFamily: "'Inter', sans-serif",
  },
}

// Легенда
legend: {
  icon: 'circle',
  orient: isMobile ? 'horizontal' : 'vertical',
  bottom: isMobile ? 0 : undefined,
  right: isMobile ? undefined : 10,
  top: isMobile ? undefined : 'middle',
  textStyle: { color: '#6B6680', fontSize: 13, fontFamily: "'Inter', sans-serif" },
  itemWidth: 8,
  itemHeight: 8,
}
```

**Mobile (<768px) donut:**
- `radius: ['50%', '70%']` (чуть тоньше, но total читаем)
- Легенда — горизонтальная, внизу
- `center: ['50%', '45%']` — сдвиг вверх чтобы освободить место под легенду

### 6.3 IncomeVsExpenceChart (Bar)

```javascript
// Кастомные цвета
const INCOME_COLOR = '#0E9F6E';   // --aurora-success
const EXPENSE_COLOR = '#E0457B';  // --aurora-danger

series: [
  {
    name: t('expense'),
    type: 'bar',
    data: chartData.expenseValues,
    color: EXPENSE_COLOR,
    itemStyle: { borderRadius: [6, 6, 0, 0] },
    barMaxWidth: 40,
    animationDuration: 600,
    animationEasing: 'cubicOut',
  },
  {
    name: t('income'),
    type: 'bar',
    data: chartData.incomeValues,
    color: INCOME_COLOR,
    itemStyle: { borderRadius: [6, 6, 0, 0] },
    barMaxWidth: 40,
    animationDuration: 600,
    animationEasing: 'cubicOut',
  },
]

grid: {
  left: 16,
  right: 16,
  bottom: isMobile ? 48 : 32,
  top: 40,
  containLabel: true,
}

legend: {
  data: [t('expense'), t('income')],
  textStyle: { color: '#6B6680', fontSize: 14, fontFamily: "'Inter', sans-serif" },
  top: 0,
  itemWidth: 10,
  itemHeight: 10,
  icon: 'roundRect',
}
```

**Mobile:**
- Легенда снизу (`bottom: 0`)
- `xAxis.axisLabel.rotate: 45`, `fontSize: 10`
- `barMaxWidth: 28`

### 6.4 MountlyExpenseChart (Line + Area)

```javascript
// Цвет линии
const LINE_COLOR = '#7C3AED';  // --aurora-accent

series: [{
  type: 'line',
  data: chartData.amounts,
  smooth: true,
  color: LINE_COLOR,
  lineStyle: { width: 2.5 },
  symbol: 'circle',
  symbolSize: isMobile ? 4 : 6,
  areaStyle: {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(124, 58, 237, 0.15)' },
      { offset: 1, color: 'rgba(124, 58, 237, 0.02)' },
    ]),
  },
  animationDuration: 600,
  animationEasing: 'cubicOut',
}]

grid: {
  left: 16,
  right: 16,
  bottom: isMobile ? 36 : 32,
  top: 8,
  containLabel: true,
}
```

**Примечание**: `areaStyle` использует `echarts.graphic.LinearGradient` — это допустимо, т.к. это area-заливка под линией, а не декоративный градиент. Пользовательское ограничение «без градиентов» относится к декоративным градиентам (хедеры, кнопки, фон). Area-заливка — функциональный элемент графика, помогает воспринимать тренд.

**Дата-пикер в UI** — остаётся как есть, но кнопки и DatePicker оборачиваются в aurora-стили (не меняем Ant-компоненты, только фон карточки).

---

## 7. Responsive Design

### 7.1 Breakpoints

| Breakpoint | Columns | Layout |
|---|---|---|
| `>1200px` (desktop) | Hero 2-col, KPI 4-col, Bento 2-col | Полный featured layout |
| `768px-1200px` (tablet) | Hero 1-col stack, KPI 2-col, Bento 1-col | Hero: текст сверху → график снизу |
| `<768px` (mobile) | Всё 1-col, KPI 2-col | Компактный вид |
| `<480px` (very small) | Всё 1-col, KPI 2-col, orbs скрыты | Минимальный chrome |

### 7.2 Per-Section Behaviour

**Hero:**
- Desktop: 2 колонки (text+orbs | chart)
- Tablet/Mobile: 1 колонка — text+orbs сверху, chart снизу
- `<480px`: orbs `display: none`

**KPI:**
- Desktop: 4 колонки
- Tablet: 2 колонки
- Mobile: 2 колонки

**Bento:**
- Desktop: 2 колонки (donut | line)
- Tablet: 1 колонка
- Mobile: 1 колонка, min-height 320px (donut), 360px (line с date picker)

**ReportsLists:**
- Tabs скроллятся на mobile (Ant Tabs обрабатывает это автоматически при narrow-контейнере)

**Gaps:**
- Desktop: 20px
- Tablet: 16px
- Mobile: 16px

### 7.3 Chart-specific Mobile Adjustments

| Chart | Mobile change |
|---|---|
| Donut (ExpenseChart) | `radius: ['50%','70%']`, легенда снизу горизонтальная |
| Bar (IncomeVsExpenceChart) | `xAxis.rotate: 45`, `fontSize: 10`, легенда снизу |
| Line (MountlyExpenseChart) | `symbolSize: 4`, упрощённый грид |
| Donut minimal | min-height: 320px |

---

## 8. Animations (framer-motion)

### 8.1 Motion Config (`src/shared/lib/motion.ts`)

Расширить `useMotionConfig` — добавить новые поля в возвращаемый объект:

```typescript
export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  return useMemo(
    () => ({
      // ... существующие поля (hidden, visible, spring, springSnappy, etc.) ...

      // Scroll reveal — для графиков в bento
      scrollRevealHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
      scrollRevealVisible: { opacity: 1, y: 0 },
      scrollRevealDuration: prefersReduced ? 0 : 0.35,
      scrollRevealViewport: { once: true, margin: "-40px" } as const,

      // Tab panel transition
      tabPanelHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
      tabPanelVisible: { opacity: 1, y: 0 },
      tabPanelExit: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 },
    }),
    [prefersReduced],
  );
}
```

Использование в компонентах:

- **Scroll reveal**: `<motion.div initial={scrollRevealHidden} whileInView={scrollRevealVisible} viewport={scrollRevealViewport} transition={{ duration: scrollRevealDuration, ease: easeOut }}>`
- **Tab panel**: `<AnimatePresence mode="wait"><motion.div key={activeKey} initial={tabPanelHidden} animate={tabPanelVisible} exit={tabPanelExit} transition={{ duration: durationEnter / durationExit }}>`

Не нужно создавать отдельные variant-объекты вне хука — все значения учитывают `prefers-reduced-motion` внутри `useMotionConfig`.

### 8.2 Animation Map

| Element | Trigger | Animation | Duration/Easing | Reduced Motion |
|---|---|---|---|---|
| Page sections | Mount (stagger) | `motion.div` stagger container → children fade + y | stagger 0.05, delay 0.1 | No stagger, instant |
| Hero card | Mount | `initial={{ opacity:0, y:12 }}` → `animate={{ opacity:1, y:0 }}` | 0.3s, `easeOut`, delay 0.05 | Instant |
| Hero orbs | Mount | `animate={{ x: [0,20,-10,0], y: [0,-15,10,0], opacity: [0.3,0.5,0.3] }}` loop | 8s, `easeInOut`, `repeat:Infinity` | `display: none` |
| Hero count-up | Mount (in-view) | `useMotionValue(0)` + `animate(target)` | 1.2s, `easeOut` | Instant (0s) |
| KPI cards | Mount (stagger) | Stagger grid reveal + `whileHover={{ y:-2 }}` | stagger 0.05, hover springSnappy | No stagger, no hover |
| KPI count-up | Mount (in-view) | `useMotionValue(0)` + `animate(target)` | 1.2s, `easeOut` | Instant (0s) |
| Bento charts | Scroll (whileInView) | `whileInView` → opacity + y 12 | 0.35s, `easeOut`, `viewport: { once: true }` | Instant |
| ReportsLists tabs | Tab switch | `AnimatePresence mode="wait"` fade + y | enter 0.22s, exit 0.14s, `easeOut` | No animation |

### 8.3 Count-Up Implementation Pattern

Каждый KPI и числа в hero используют этот паттерн:

```typescript
import { useMotionValue, animate } from "framer-motion";
import { useMotionConfig } from "@/shared/lib/motion";

function CountUpValue({ value, format }: { value: number; format: (v: number) => string }) {
  const { countUpDuration, easeOut } = useMotionConfig();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: countUpDuration,
      ease: easeOut,
      onUpdate: (latest) => setDisplay(format(latest)),
    });
    return () => controls.stop();
  }, [value, countUpDuration, easeOut, format]);

  return <span className="aurora-font-display aurora-tabular">{display}</span>;
}
```

**Важно**: если `countUpDuration === 0` (reduced motion), `animate()` мгновенно устанавливает конечное значение, что даёт статичный показ без анимации.

---

## 9. i18n

### 9.1 New Keys

Добавить в `src/i18n.js` в обе локели:

| Key | EN | RU |
|---|---|---|
| `savingsRate` | "Savings Rate" | "Норма сбережений" |
| `tabsCategories` | "Categories" | "Категории" |
| `tabsTransactions` | "Transactions" | "Транзакции" |
| `reportsNoData` | "No data for this period" | "Нет данных за период" |
| `reportsNoDataHint` | "Try adjusting the filters or adding transactions" | "Попробуйте изменить фильтры или добавить транзакции" |

### 9.2 Reused Keys

Эти ключи уже существуют и переиспользуются:

- `reports` — заголовок страницы (Reports / Отчеты)
- `reportsOnYourTransactions` — подзаголовок
- `totalIncome` — Income KPI
- `totalExpense` — Expense KPI
- `balance` — Net Balance KPI
- `expensesByCategory` — title ExpenseChart
- `expensesByMonth` — title MountlyExpenseChart
- `incomeVsExpense` — title IncomeVsExpenceChart
- `topCategories` — tab label (fallback, новый ключ `tabsCategories` приоритетнее)
- `largestTransactions` — tab label (fallback)
- `total` — центр donut subtext
- `income` / `expense` — легенда
- `retry` — кнопка Retry
- `loadingError` — error title
- `categories` — tab label (fallback)
- `transactions` — tab label (fallback)

### 9.3 Приоритет

В ReportsLists Tabs: использовать **новые** ключи `tabsCategories` и `tabsTransactions`, а не старые `categories`/`transactions` или `topCategories`/`largestTransactions`. Это позволяет табам иметь отдельные строки, если в будущем понадобится другой текст.

---

## 10. States (Loading / Error / Empty)

### 10.1 Loading State

При `useContainer().loading === true` (или page-level loading) рендерится полный скелетон страницы:

```
ReportsPage (loading)
├── AppShell
│     └── div (gap: 20px)
│           ├── aurora-card (filters skeleton: 1 строка shimmer)
│           ├── ReportsHeroSkeleton:
│           │     aurora-card--elevated, внутри 2 колонки:
│           │     левая — 3 shimmer lines (заголовок + описание + 3 числа),
│           │     правая — shimmer rect (график), min-height 280px
│           ├── ReportCardWidgetSkeleton:
│           │     4 shimmer card-placeholder'а в grid
│           ├── bento grid skeleton:
│           │     2 shimmer rect'а (donut + line), min-height 320px
│           └── ReportsListsSkeleton:
│                 aurora-card, tabs skeleton + таблица shimmer
```

**Скелетоны shimmer:** используют Ant Design `Skeleton` с `active={true}` или кастомные div'ы с CSS-анимацией `shimmer` (как в категориях). Размеры skeleton-элементов соответствуют размерам реальных компонентов, чтобы избежать layout shift.

**Файлы скелетонов:**
- `widgets/reportsHero/ui/ReportsHeroSkeleton.tsx`
- `widgets/reportsLists/ui/ReportsListsSkeleton.tsx`
- `widgets/reportCard/container/ReportCardWidgetSkeleton.tsx` (переработан)

### 10.2 Error State

```tsx
<div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
  <ExclamationCircleOutlined style={{ fontSize: 48, color: "var(--aurora-text-secondary)", opacity: 0.6, marginBottom: 16 }} />
  <div className="aurora-font-body" style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginBottom: 8 }}>
    {t("loadingError")}
  </div>
  <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
    {String(error)}
  </div>
  <Button type="primary" onClick={() => refetch()}>{t("retry")}</Button>
</div>
```

Иконка: `ExclamationCircleOutlined` из `@ant-design/icons` (не emoji).

### 10.3 Empty State

Если данные загружены, но массив transactions пуст (после применения фильтров):

```tsx
<div className="aurora-card">
  <div className="aurora-empty-state">
    <InboxOutlined className="aurora-empty-state__icon" />
    <div className="aurora-empty-state__title">{t("reportsNoData")}</div>
    <p className="aurora-text-secondary" style={{ fontSize: 14 }}>
      {t("reportsNoDataHint")}
    </p>
  </div>
</div>
```

При empty state: фильтры и AppShell остаются видимы, но hero/KPI/bento/lists заменяются на один empty-state контейнер.

**Важно**: empty state показывается ТОЛЬКО когда данные загружены (не loading, не error), но результат пуст. Это не смешивается с loading skeleton.

---

## 11. Constraints and Known Issues

1. **Нет градиентов** — ни в CSS, ни в декоративных элементах. Только `areaStyle` в линейном графике MountlyExpenseChart — это функционально.
2. **Ant компоненты светлые** — `AppAntdProvider` не использует `darkAlgorithm`. Тёмная тема только через `prefers-color-scheme: dark` и CSS custom properties.
3. **Без emoji** — все иконки из `@ant-design/icons` (SVG).
4. **`prefers-reduced-motion`** — все анимации должны иметь fallback на instant/no-op через `useMotionConfig()`.
5. **TS strict**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (type-only imports), `erasableSyntaxOnly` — соблюдать во всех новых/изменяемых файлах.
6. **Существующие TS-ошибки**: `largestTransactions` (null vs string) и `topCategories` (Category | undefined) — не блокируют, но в новых файлах ошибок быть не должно.
7. **framer-motion v12.43.0** — версия с `useMotionValue` и `animate()`. API стабилен.
8. **ECharts** — `echarts-for-react` обёртка. `ReactECharts` принимает `option` и `className`. Не пересоздавать chart при каждом рендере (использовать `useMemo` для option).
9. **Инлайн-стили** — допускаются для gap, padding, basic layout. Сложные стили — в SCSS modules.
10. **AppShell** — используется существующий, без изменений. Страница рендерится внутри `<AppShell title={...} subtitle={...}>`.
11. **Фильтры** — TransactionsFiltersWidget остаётся без изменений, только оборачивается в `aurora-card` для визуальной консистентности.
12. **Savings Rate** — может быть отрицательным при expense > income. Отображать как `XX%` с цветом danger если отрицательный.

---

## 12. Acceptance Criteria (Checklist)

### Visual & Layout
- [ ] Страница использует `aurora-surface` фон, консистентна с dashboard и categories
- [ ] ReportsHero: featured layout (text+orbs | chart), count-up 3 числа, aurora-orbs с blur 80px и float-анимацией
- [ ] KPI: 4 aurora-card--insight карточки (Total Income success, Total Expense danger, Net Balance accent, Savings Rate neutral) с count-up
- [ ] Bento 2×2: ExpenseChart (donut с total в центре) + MountlyExpenseChart в CSS Grid
- [ ] ReportsLists: Ant Tabs (Categories/Transactions) + AnimatePresence fade переключение

### Charts
- [ ] ECharts используют aurora-палитру (success `#0E9F6E`, danger `#E0457B`, accent `#7C3AED`)
- [ ] Tooltip: белый фон, hairline-бордер, shadow, border-radius 12px
- [ ] Сетка: dashed, цвет `--aurora-border`
- [ ] Bar: borderRadius `[6,6,0,0]`, без градиентов
- [ ] Donut: radius `[55%,75%]`, total в центре, Sora 700 tabular-nums
- [ ] Линия: areaStyle с accent-полупрозрачной заливкой (не декоративный градиент)

### Responsive
- [ ] Desktop (>1200px): полный featured layout, hero 2-col, KPI 4-col, bento 2-col
- [ ] Tablet (768-1200px): hero стекается, KPI 2-col, bento 1-col
- [ ] Mobile (<768px): 1 колонка, графики min-height 320-360px, легенды внизу
- [ ] Very small (<480px): orbs скрыты
- [ ] KPI 2×2 на mobile
- [ ] Tabs скроллятся на узких экранах

### Animations
- [ ] Stagger reveal секций страницы при mount
- [ ] Hero: fade + y-offset entrance, orbs float loop
- [ ] KPI: count-up чисел + hover-lift
- [ ] Bento: scroll-reveal (whileInView, once)
- [ ] Tabs: AnimatePresence mode="wait", fade + y
- [ ] Все анимации уважают `prefers-reduced-motion` (instant fallback)

### States
- [ ] Loading: shimmer skeleton всей страницы (hero, KPI, bento, lists)
- [ ] Error: aurora-card с ExclamationCircleOutlined и Retry кнопкой
- [ ] Empty: aurora-empty-state с InboxOutlined, заголовком «Нет данных за период» и подсказкой

### i18n
- [ ] Новые ключи добавлены: `savingsRate`, `tabsCategories`, `tabsTransactions`, `reportsNoData`, `reportsNoDataHint`
- [ ] EN и RU переводы заполнены

### Code Quality
- [ ] `npm run lint` проходит без ошибок в новых/изменённых файлах
- [ ] `npm run build` не добавляет новых TS-ошибок (существующие 2 acceptable)
- [ ] Все импорты используют `import type` для type-only imports (`verbatimModuleSyntax`)
- [ ] SVG иконки из `@ant-design/icons`, без emoji
- [ ] FSD: новые виджеты экспортируются как `{ Widget: Container }`
- [ ] Баррел-экспорты (`index.ts`) для всех новых директорий
- [ ] SCSS modules ко-лоцированы с компонентами
- [ ] Не используется `any` в новых файлах
