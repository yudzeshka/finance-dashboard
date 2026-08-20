# Reports Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полный редизайн страницы /reports в Aurora design system (вариант C — Editorial/Featured): ReportsHero с count-up и orbs, KPI aurora-card--insight, bento 2×2, ReportsLists с Tabs, перенастройка ECharts, адаптив, framer-motion анимации.

**Architecture:** FSD. Новые виджеты ReportsHero и ReportsLists. useReportsData хук (обёртка над useTransactionQueries, пишет в Zustand store) управляет loading/error/empty на уровне страницы. Виджеты читают из store (cache hit). ECharts option'ы перенастроены на aurora-токены.

**Tech Stack:** React 19, Vite, TypeScript 6 (strict), Ant Design 6, framer-motion 12.43, ECharts 6 (echarts-for-react), i18next, Zustand 5, SCSS modules.

---

## Global Constraints

- Нет градиентов (только areaStyle в линейном графике — функционально)
- Ant компоненты светлые (dark через CSS только)
- Без emoji — иконки из @ant-design/icons (SVG)
- prefers-reduced-motion везде через useMotionConfig()
- TS strict: noUnusedLocals, noUnusedParameters, verbatimModuleSyntax (import type), erasableSyntaxOnly
- import type для type-only imports
- FSD: виджеты экспортируются как { Widget: Container }, barrel index.ts
- SCSS modules ко-лоцированы
- Не использовать any

---

## File Structure (net-new and changed files)

```
src/
  pages/reports/
    ui/
      ReportsPage.tsx          ← ПЕРЕРАБОТАН
      ReportsPage.module.scss  ← ПЕРЕПИСАН (bento + adaptive grid)
      ReportsPageSkeleton.tsx  ← НОВЫЙ (page-level skeleton)

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

  shared/
    lib/motion.ts                ← ДОБАВЛЕНЫ scrollReveal, tabPanel variants
    ui/CountUpValue.tsx          ← НОВЫЙ (переиспользуемый count-up)

  features/transaction/manage/model/
    useReportsData.ts            ← НОВЫЙ (page-level data hook)

  i18n.js                        ← ИЗМЕНЁН (5 новых ключей)
```

---

## Tasks

---

### Task 1: Expand motion.ts + extract CountUpValue to shared

**Files:**
- Modify: `src/shared/lib/motion.ts`
- Create: `src/shared/ui/CountUpValue.tsx`

**Interfaces:**

*Consumes:* framer-motion `useReducedMotion()`, existing exports from motion.ts
*Produces:*
- `useMotionConfig()` returns added fields: `scrollRevealHidden`, `scrollRevealVisible`, `scrollRevealDuration`, `scrollRevealViewport`, `tabPanelHidden`, `tabPanelVisible`, `tabPanelExit`
- `CountUpValue` component: `{ value: number; format: (v: number) => string; className?: string }`

**Steps:**

- [ ] **1.1** Add scrollReveal and tabPanel variants to `useMotionConfig()` return in `src/shared/lib/motion.ts`:

```typescript
export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  return useMemo(
    () => ({
      // ... keep existing: hidden, visible, spring, springSnappy, durationEnter, durationExit,
      //     easeOut, prefersReduced, countUpDuration, staggerChildren, delayChildren,
      //     rowStagger, orbDuration, deltaDelay, heroEnterDuration, heroEnterDelay, heroEnterY ...

      // NEW: scroll reveal — for charts in bento
      scrollRevealHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
      scrollRevealVisible: { opacity: 1, y: 0 },
      scrollRevealDuration: prefersReduced ? 0 : 0.35,
      scrollRevealViewport: { once: true, margin: "-40px" } as const,

      // NEW: tab panel transition
      tabPanelHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
      tabPanelVisible: { opacity: 1, y: 0 },
      tabPanelExit: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 },
    }),
    [prefersReduced],
  );
}
```

- [ ] **1.2** Create `src/shared/ui/CountUpValue.tsx`:

```tsx
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useMotionConfig } from "@/shared/lib/motion";

type CountUpValueProps = {
  value: number;
  format: (v: number) => string;
  className?: string;
};

export function CountUpValue({ value, format, className }: CountUpValueProps) {
  const { countUpDuration, easeOut } = useMotionConfig();
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => format(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: countUpDuration,
      ease: easeOut as [number, number, number, number],
    });
    return controls.stop;
  }, [value, countUpDuration, easeOut, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}
```

- [ ] **1.3** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors.
- [ ] **1.4** Commit: `feat(motion): add scrollReveal and tabPanel variants, extract CountUpValue to shared`

---

### Task 2: Add i18n keys

**Files:**
- Modify: `src/i18n.js`

**Interfaces:**

*Consumes:* existing i18n flat structure `resources.{en,ru}.translation`
*Produces:* 5 new keys in EN and RU:
- `savingsRate`: "Savings Rate" / "Норма сбережений"
- `tabsCategories`: "Categories" / "Категории"
- `tabsTransactions`: "Transactions" / "Транзакции"
- `reportsNoData`: "No data for this period" / "Нет данных за период"
- `reportsNoDataHint`: "Try adjusting the filters or adding transactions" / "Попробуйте изменить фильтры или добавить транзакции"

**Steps:**

- [ ] **2.1** Insert into `en.translation` (near line ~72, after existing `reportsOnYourTransactions`):

```javascript
savingsRate: "Savings Rate",
tabsCategories: "Categories",
tabsTransactions: "Transactions",
reportsNoData: "No data for this period",
reportsNoDataHint: "Try adjusting the filters or adding transactions",
```

- [ ] **2.2** Insert into `ru.translation` (near line ~224, after existing `reportsOnYourTransactions`):

```javascript
savingsRate: "Норма сбережений",
tabsCategories: "Категории",
tabsTransactions: "Транзакции",
reportsNoData: "Нет данных за период",
reportsNoDataHint: "Попробуйте изменить фильтры или добавить транзакции",
```

- [ ] **2.3** Verify: `npm run lint` on the changed file — no errors.
- [ ] **2.4** Commit: `feat(i18n): add savingsRate, tabs, and empty-state keys for reports redesign`

---

### Task 3: Create useReportsData hook

**Files:**
- Create: `src/features/transaction/manage/model/useReportsData.ts`

**Interfaces:**

*Consumes:*
- `useTransactionQueries()` from `@/features/transaction/manage/model/useTransactionQueries` → `{ transactions: Transaction[], categories: Category[], categoryOptions: TransactionCategoryOption[], loading: boolean, error: ApolloError | undefined, refetch: () => Promise<void> }`
- `useSetAllTransactions()` from `@/entities/transaction/model/selectors`

*Produces:*
- `useReportsData()` → `{ loading: boolean, error: ApolloError | undefined, refetch: () => Promise<void>, isEmpty: boolean }`

**Steps:**

- [ ] **3.1** Create `src/features/transaction/manage/model/useReportsData.ts`:

```typescript
import { useEffect, useMemo } from "react";
import { useTransactionQueries } from "./useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";

export function useReportsData() {
  const { transactions, loading, error, refetch } = useTransactionQueries();
  const setAllTransactions = useSetAllTransactions();

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const isEmpty = useMemo(
    () => !loading && !error && transactions.length === 0,
    [loading, error, transactions],
  );

  return { loading, error, refetch, isEmpty };
}
```

- [ ] **3.2** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors.
- [ ] **3.3** Commit: `feat(reports): add useReportsData hook for page-level loading/error/empty`

---

### Task 4: Create ReportsHero widget

**Files:**
- Create: `src/widgets/reportsHero/index.ts`
- Create: `src/widgets/reportsHero/container/index.tsx`
- Create: `src/widgets/reportsHero/container/useContainer.ts`
- Create: `src/widgets/reportsHero/ui/ReportsHeroView.tsx`
- Create: `src/widgets/reportsHero/ui/ReportsHero.module.scss`
- Create: `src/widgets/reportsHero/ui/ReportsHeroSkeleton.tsx`

**Interfaces:**

*Consumes:*
- `useTransactionsStore()` from `@/entities/transaction/model/store` — reads `allTransactions`
- `useTranslation()` — `t`
- `useMotionConfig()` from `@/shared/lib/motion`
- `CountUpValue` from `@/shared/ui/CountUpValue`
- `IncomeVsExpenceChart.Widget` from `@/widgets/incomeVsExpenceChart` (rendered in hero right column)

*Produces:*
- `ReportsHero = { Widget: ReportsHeroContainer }`
- `useReportsHero()` → `{ totalIncome: number, totalExpense: number, balance: number, t }`
- `ReportsHeroView` props: `{ totalIncome: number, totalExpense: number, balance: number, t: TFunction }`
- `ReportsHeroSkeleton` — shimmer placeholder matching hero layout

**Steps:**

- [ ] **4.1** Create `src/widgets/reportsHero/container/useContainer.ts`:

```typescript
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";

export function useReportsHero() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = allTransactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = allTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [allTransactions]);

  return { totalIncome, totalExpense, balance, t };
}
```

- [ ] **4.2** Create `src/widgets/reportsHero/container/index.tsx`:

```tsx
import { ReportsHeroView } from "../ui/ReportsHeroView";
import { useReportsHero } from "./useContainer";

export function ReportsHeroContainer() {
  const props = useReportsHero();
  return <ReportsHeroView {...props} />;
}
```

- [ ] **4.3** Create `src/widgets/reportsHero/index.ts`:

```typescript
import { ReportsHeroContainer } from "./container";

export const ReportsHero = {
  Widget: ReportsHeroContainer,
};
```

- [ ] **4.4** Create `src/widgets/reportsHero/ui/ReportsHeroView.tsx` — featured hero: 2-column grid (text+orbs left, chart right), count-up 3 numbers, aurora orbs, IncomeVsExpenceChart embedded:

```tsx
import { motion } from "framer-motion";
import type { TFunction } from "i18next";
import { IncomeVsExpenceChart } from "@/widgets/incomeVsExpenceChart";
import { CountUpValue } from "@/shared/ui/CountUpValue";
import { useMotionConfig } from "@/shared/lib/motion";
import styles from "./ReportsHero.module.scss";

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  t: TFunction;
};

function formatCurrencyUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReportsHeroView({ totalIncome, totalExpense, balance, t }: Props) {
  const config = useMotionConfig();

  return (
    <motion.div
      className={`aurora-card--elevated ${styles.hero}`}
      initial={{ opacity: 0, y: config.heroEnterY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: config.heroEnterDuration,
        delay: config.heroEnterDelay,
        ease: config.easeOut as [number, number, number, number],
      }}
    >
      {/* Aurora orbs */}
      <motion.div
        className={`${styles.orb} ${styles.orb1}`}
        animate={
          config.prefersReduced
            ? {}
            : { x: [0, 20, -10, 0], y: [0, -15, 10, 0], opacity: [0.3, 0.5, 0.3] }
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
            : { x: [0, -15, 10, 0], y: [0, 10, -10, 0], opacity: [0.2, 0.4, 0.2] }
        }
        transition={
          config.prefersReduced
            ? {}
            : { duration: config.orbDuration * 1.3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <h1 className="aurora-font-display" style={{ fontSize: 32, fontWeight: 700, color: "var(--aurora-text)", margin: 0 }}>
            {t("reports")}
          </h1>
          <p className="aurora-font-body aurora-text-secondary" style={{ fontSize: 15, margin: "4px 0 24px" }}>
            {t("reportsOnYourTransactions")}
          </p>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("totalIncome")}</span>
              <CountUpValue
                value={totalIncome}
                format={formatCurrencyUSD}
                className={`aurora-font-display aurora-tabular aurora-text-success ${styles.summaryValue}`}
              />
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("totalExpense")}</span>
              <CountUpValue
                value={totalExpense}
                format={formatCurrencyUSD}
                className={`aurora-font-display aurora-tabular aurora-text-danger ${styles.summaryValue}`}
              />
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t("balance")}</span>
              <CountUpValue
                value={balance}
                format={formatCurrencyUSD}
                className={`aurora-font-display aurora-tabular ${styles.summaryValue}`}
                style={{ color: balance >= 0 ? "var(--aurora-accent)" : "var(--aurora-danger)" }}
              />
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className="aurora-card">
            <IncomeVsExpenceChart.Widget />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

**Note:** The `<CountUpValue>` accepts `className` but not `style`. Adjust inline style to use a wrapper `<span>` with style and pass `CountUpValue` inside, or add `style` to the `CountUpValue` props if preferred. For simplicity in implementation, wrap in a `<span>`:

```tsx
<span style={{ color: balance >= 0 ? "var(--aurora-accent)" : "var(--aurora-danger)" }}>
  <CountUpValue
    value={balance}
    format={formatCurrencyUSD}
    className={`aurora-font-display aurora-tabular ${styles.summaryValue}`}
  />
</span>
```

- [ ] **4.5** Create `src/widgets/reportsHero/ui/ReportsHero.module.scss`:

```scss
.hero {
  position: relative;
  padding: 32px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.heroContent {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.heroLeft {
  min-width: 0;
}

.heroRight {
  min-width: 0;
}

.summaryGrid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summaryItem {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summaryLabel {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--aurora-text-secondary);
  font-family: 'Inter', system-ui, sans-serif;
}

.summaryValue {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

/* Aurora orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.orb1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(124, 58, 237, 0.15) 0%,
    rgba(124, 58, 237, 0) 70%
  );
  top: -40px;
  left: -20px;
}

.orb2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(124, 58, 237, 0.1) 0%,
    rgba(124, 58, 237, 0) 70%
  );
  bottom: -30px;
  left: 40%;
}

@media (max-width: 480px) {
  .orb {
    display: none;
  }

  .summaryValue {
    font-size: 22px;
  }
}
```

- [ ] **4.6** Create `src/widgets/reportsHero/ui/ReportsHeroSkeleton.tsx`:

```tsx
import { Skeleton } from "antd";
import styles from "./ReportsHero.module.scss";

export function ReportsHeroSkeleton() {
  return (
    <div className={`aurora-card--elevated ${styles.hero}`}>
      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <Skeleton.Input active size="large" style={{ width: 120, marginBottom: 8 }} />
          <Skeleton.Input active size="small" style={{ width: 200, marginBottom: 24 }} />
          <Skeleton.Input active size="large" style={{ width: 180, marginBottom: 8 }} />
          <Skeleton.Input active size="large" style={{ width: 180, marginBottom: 8 }} />
          <Skeleton.Input active size="large" style={{ width: 180 }} />
        </div>
        <div className={styles.heroRight}>
          <Skeleton.Node active style={{ width: "100%", minHeight: 280 }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **4.7** **ADJUST IncomeVsExpenceChart** to support `hideTitle` prop — the hero embeds the chart without its own `h4` title. This change is done in Task 7 (ECharts incomeVsExpenceChart). For now, ReportsHero will render `<IncomeVsExpenceChart.Widget />` — the title `h4` will be removed in Task 7 when the UI component gets an optional `hideTitle` prop. The spec says: "UI-компонент графика НЕ рендерит собственный title (заголовок уже есть в левой колонке)."

- [ ] **4.8** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors in reportsHero files. (IncomeVsExpenceChart may still have a title until Task 7 — acceptable for now.)
- [ ] **4.9** Commit: `feat(reports): add ReportsHero widget with count-up summary, aurora orbs, and embedded chart`

---

### Task 5: Refactor ReportCardWidget — types, config, calculate, UI, skeleton, SCSS

**Files:**
- Modify: `src/widgets/reportCard/model/types.ts`
- Modify: `src/widgets/reportCard/model/cardsConfig.tsx`
- Modify: `src/widgets/reportCard/model/calculateReportCards.ts`
- Modify: `src/widgets/reportCard/container/useContainer.tsx`
- Modify: `src/widgets/reportCard/container/ReportCardWidget.tsx`
- Modify: `src/widgets/reportCard/container/ReportCardWidgetSkeleton.tsx`
- Modify: `src/widgets/reportCard/ui/ReportCard.tsx`
- Modify: `src/widgets/reportCard/ui/styles.module.scss`

**Interfaces:**

*Consumes:*
- `useTransactionQueries()`, `useFilters()`, `useSetAllTransactions()`, `useDebounce()`
- `calculateReportCards()` — still used, extended for savingsRate
- `CountUpValue` from `@/shared/ui/CountUpValue`
- `useMotionConfig()` for hover animation

*Produces:*
- `ReportCardTone`: `"green" | "red" | "purple" | "neutral"` (adds "neutral", replaces "blue")
- `ReportCardConfig.id`: `"income" | "expense" | "balance" | "savingsRate"` (replaces "averagePerDay")
- `ReportCardViewModel` — same shape but with `tone: ReportCardTone`
- `reportCardsConfig`: 4 cards — income, expense, balance, savingsRate
- `ReportCardWidget` — renders loading skeleton, error card, or 4-card grid

**Steps:**

- [ ] **5.1** Modify `src/widgets/reportCard/model/types.ts`:

```typescript
import type { ComponentType } from "react";
import type { Transaction } from "@/entities/transaction";

export type ReportCardTone = "green" | "red" | "purple" | "neutral";

export type ReportCardTitleKey =
  | "totalIncome"
  | "totalExpense"
  | "balance"
  | "savingsRate";

export type ReportCardConfig = {
  id: "income" | "expense" | "balance" | "savingsRate";
  titleKey: ReportCardTitleKey;
  Icon: ComponentType<{ className?: string }>;
  tone: ReportCardTone;
  getValue: (transactions: Transaction[], periodDays: number) => number;
  showPercentage: boolean;
};

export type ReportCardViewModel = {
  id: ReportCardConfig["id"];
  title: string;
  value: number;
  percentage?: number;
  positive?: boolean;
  description: string;
  Icon: ReportCardConfig["Icon"];
  tone: ReportCardTone;
};
```

- [ ] **5.2** Modify `src/widgets/reportCard/model/cardsConfig.tsx`:

```tsx
import type { Transaction } from "@/entities/transaction";
import {
  DollarOutlined,
  WalletOutlined,
  PieChartOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { ReportCardConfig } from "./types";

export const reportCardsConfig: ReportCardConfig[] = [
  {
    id: "income",
    titleKey: "totalIncome",
    Icon: DollarOutlined,
    tone: "green",
    getValue: (transactions: Transaction[], _periodDays: number) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "expense",
    titleKey: "totalExpense",
    Icon: ArrowDownOutlined,
    tone: "red",
    getValue: (transactions: Transaction[], _periodDays: number) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "EXPENSE" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "balance",
    titleKey: "balance",
    Icon: WalletOutlined,
    tone: "purple",
    getValue: (transactions: Transaction[], _periodDays: number) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME"
            ? acc + transaction.amount
            : acc - transaction.amount,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "savingsRate",
    titleKey: "savingsRate",
    Icon: PieChartOutlined,
    tone: "neutral",
    getValue: (transactions: Transaction[], _periodDays: number) => {
      const income = transactions
        .filter((tx) => tx.type === "INCOME")
        .reduce((acc, tx) => acc + tx.amount, 0);
      const expense = transactions
        .filter((tx) => tx.type === "EXPENSE")
        .reduce((acc, tx) => acc + tx.amount, 0);
      return income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    },
    showPercentage: false,
  },
];
```

- [ ] **5.3** Modify `src/widgets/reportCard/model/calculateReportCards.ts` — enhance the `description` for `savingsRate` config. The existing logic already handles `showPercentage: false` — for savingsRate it will return `description: "All time"` or `"Based on N days"`. Add explicit handling for savingsRate id:

In the `return reportCardsConfig.map(...)` block, adjust the description logic to differentiate savingsRate:

```typescript
// Inside the map callback, after computing showPercentage:
const description =
  config.id === "savingsRate"
    ? hasSelectedPeriod
      ? `Based on ${periodDays} days`
      : "All time"
    : showPercentage
      ? comparisonDescription
      : hasSelectedPeriod
        ? `Based on ${periodDays} days`
        : comparisonDescription;
```

(Note: the existing code already does `description: showPercentage ? comparisonDescription : ...` — this just makes it explicit for `savingsRate`. Keep the existing logic; it already works because `showPercentage: false` creates the right branch.)

- [ ] **5.4** Modify `src/widgets/reportCard/ui/ReportCard.tsx` — rewrite with aurora-card--insight, CountUpValue, motion hover, tone classes:

```tsx
import { motion } from "framer-motion";
import {
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { CountUpValue } from "@/shared/ui/CountUpValue";
import { useMotionConfig } from "@/shared/lib/motion";
import type { ReportCardViewModel } from "../model/types";
import styles from "./styles.module.scss";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function ReportCard({
  title,
  value,
  percentage,
  positive,
  description,
  Icon,
  tone,
  id,
}: ReportCardViewModel) {
  const { springSnappy } = useMotionConfig();

  const isPercentage = id === "savingsRate";
  const formatFn = isPercentage ? formatPercent : formatCurrency;

  const valueColorClass =
    tone === "green" ? "aurora-text-success" :
    tone === "red" ? "aurora-text-danger" :
    tone === "purple" ? "" : // default accent
    "aurora-text-secondary"; // neutral

  return (
    <motion.div
      className={`aurora-card--insight ${styles.card}`}
      whileHover={springSnappy.stiffness !== undefined ? { y: -2 } : {}}
      transition={springSnappy}
    >
      <div className={styles.cardInner}>
        <div className={`${styles.iconWrapper} ${styles[tone]}`}>
          <Icon className={styles.icon} />
        </div>

        <div className={styles.label}>{title}</div>

        <CountUpValue
          value={value}
          format={formatFn}
          className={`aurora-font-display aurora-tabular ${styles.value} ${
            valueColorClass !== "" ? valueColorClass : ""
          }`}
        />

        <div className={styles.footer}>
          {percentage !== undefined && positive !== undefined ? (
            <span className={positive ? styles.deltaPositive : styles.deltaNegative}>
              {positive ? <CaretUpOutlined /> : <CaretDownOutlined />}{" "}
              {percentage}%
            </span>
          ) : null}
          <span className={styles.description}>
            {percentage !== undefined && positive !== undefined ? " " : ""}
            {description}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **5.5** Rewrite `src/widgets/reportCard/ui/styles.module.scss` with aurora tokens:

```scss
.cardsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.card {
  width: 100%;
}

.cardInner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iconWrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.icon {
  font-size: 20px;
}

// Tone classes using aurora tokens
.green {
  color: var(--aurora-success);
  background-color: var(--aurora-success-soft);
}

.red {
  color: var(--aurora-danger);
  background-color: var(--aurora-danger-soft);
}

.purple {
  color: var(--aurora-accent);
  background-color: var(--aurora-accent-soft);
}

.neutral {
  color: var(--aurora-text-secondary);
  background-color: var(--aurora-accent-soft);
}

.label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--aurora-text-secondary);
}

.value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--aurora-text);

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  flex-wrap: wrap;
}

.deltaPositive {
  color: var(--aurora-success);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.deltaNegative {
  color: var(--aurora-danger);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.description {
  font-size: 12px;
  color: var(--aurora-text-secondary);
  white-space: nowrap;
}
```

- [ ] **5.6** Rewrite `src/widgets/reportCard/container/ReportCardWidgetSkeleton.tsx` with shimmer placeholders:

```tsx
import styles from "../ui/styles.module.scss";

function ShimmerCard() {
  return (
    <div className={`aurora-card--insight ${styles.card}`}>
      <div className={styles.cardInner}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--aurora-accent-soft)",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            width: "60%",
            height: 11,
            borderRadius: 4,
            background: "var(--aurora-border)",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            width: "80%",
            height: 28,
            borderRadius: 6,
            background: "var(--aurora-accent-soft)",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            width: "50%",
            height: 13,
            borderRadius: 4,
            background: "var(--aurora-border)",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    </div>
  );
}

export function ReportCardWidgetSkeleton() {
  return (
    <div className={styles.cardsGrid}>
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </div>
  );
}
```

- [ ] **5.7** Modify `src/widgets/reportCard/container/ReportCardWidget.tsx` — add error state with aurora-card:

```tsx
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { ReportCard } from "../ui/ReportCard";
import styles from "../ui/styles.module.scss";
import { ReportCardWidgetSkeleton } from "./ReportCardWidgetSkeleton";
import { useContainer } from "./useContainer";

export function ReportCardWidget() {
  const { cards, loading, error, refetch } = useContainer();
  const { t } = useTranslation();

  if (loading) return <ReportCardWidgetSkeleton />;

  if (error) {
    return (
      <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
        <ExclamationCircleOutlined
          style={{
            fontSize: 48,
            color: "var(--aurora-text-secondary)",
            opacity: 0.6,
            marginBottom: 16,
          }}
        />
        <div
          className="aurora-font-body"
          style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginBottom: 8 }}
        >
          {t("loadingError")}
        </div>
        <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
          {String(error)}
        </div>
        <Button type="primary" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.cardsGrid}>
      {cards.map((card) => (
        <ReportCard key={card.id} {...card} />
      ))}
    </div>
  );
}
```

- [ ] **5.8** Modify `src/widgets/reportCard/container/useContainer.tsx` — add `refetch` to return:

```typescript
// In the return statement, change to:
return {
  cards,
  loading,
  error,
  refetch,  // was missing before
};
```

(Add `refetch` from the `useTransactionQueries()` destructuring — it's already destructured, just add it to the return object.)

- [ ] **5.9** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors in reportCard files.
- [ ] **5.10** Commit: `feat(reportCard): redesign KPI cards with aurora tokens, count-up, savingsRate, error state`

---

### Task 6: Reconfigure ExpenseChart (Donut) with aurora ECharts options

**Files:**
- Modify: `src/widgets/expenseChart/container/useContainer.tsx`
- Modify: `src/widgets/expenseChart/ui/index.tsx`
- Modify: `src/widgets/expenseChart/ui/styles.module.scss`

**Interfaces:**

*Consumes:* same inputs as current — `useTransactionQueries()`, `useFilters()`, `useMedia()`, `calculateExpenceChart()`
*Produces:* `{ option: EChartsOption }` — reconfigured with aurora tokens

**Steps:**

- [ ] **6.1** Rewrite `src/widgets/expenseChart/ui/styles.module.scss`:

```scss
.chartContainer {
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-height: 320px;

  @media (max-width: 768px) {
    min-height: 320px;
  }
}

.chartTitle {
  font-family: 'Sora', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--aurora-text);
  margin: 0 0 8px 0;
  padding: 16px 16px 0;
}

.chart {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}
```

- [ ] **6.2** Modify `src/widgets/expenseChart/ui/index.tsx` — wrap in aurora-card, use aurora typography:

```tsx
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
};

export const UI = ({ option }: UIPropertyType) => {
  const { t } = useTranslation();
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styles.chartContainer}>
        <h4 className={`aurora-font-display ${styles.chartTitle}`}>
          {t("expensesByCategory")}
        </h4>
        <ReactECharts option={option} className={styles.chart} />
      </div>
    </div>
  );
};
```

- [ ] **6.3** Rewrite `src/widgets/expenseChart/container/useContainer.tsx` with aurora ECharts option:

```typescript
import type { EChartsOption } from "echarts";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { calculateExpenceChart } from "../model/lib";
import type { PieDataItemOption } from "echarts/types/src/chart/pie/PieSeries.js";

const COLORS = [
  "#7C3AED", "#0E9F6E", "#E0457B", "#8B5CF6",
  "#F59E0B", "#3B82F6", "#EC4899", "#10B981",
];

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const { transactions } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(filters.search ?? "", 250);
  const { isMobile } = useMedia();
  const { t } = useTranslation();

  const reportFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () => calculateExpenceChart(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => {
    const radius: [string, string] = isMobile ? ["50%", "70%"] : ["55%", "75%"];
    const center: [string, string] = isMobile ? ["50%", "45%"] : ["50%", "50%"];

    return {
      textStyle: { fontFamily: "'Inter', sans-serif" },
      tooltip: {
        trigger: "item",
        backgroundColor: "#FFFFFF",
        borderColor: "#E8E4F0",
        textStyle: { color: "#1E1B2E", fontSize: 13 },
      },
      title: {
        text: `${t("total")}: $${chartData.total.toLocaleString()}`,
        left: "center",
        top: "center",
        textStyle: {
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "'Sora', 'Inter', sans-serif",
          color: "#1E1B2E",
        },
        subtext: t("total"),
        subtextStyle: { fontSize: 12, color: "#6B6680" },
      },
      series: [
        {
          type: "pie",
          data: chartData.data as PieDataItemOption[],
          radius,
          center,
          color: COLORS,
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{d}%",
            color: "#6B6680",
            fontSize: 12,
          },
          emphasis: { scaleSize: 8, label: { fontSize: 14, fontWeight: "bold" } },
          itemStyle: { borderColor: "#FFFFFF", borderWidth: 2 },
          animationDuration: 600,
          animationEasing: "cubicOut" as const,
        },
      ],
      legend: isMobile
        ? {
            icon: "circle" as const,
            orient: "horizontal" as const,
            bottom: 0,
            left: "center" as const,
            textStyle: { color: "#6B6680", fontSize: 13 },
            itemWidth: 8,
            itemHeight: 8,
          }
        : {
            icon: "circle" as const,
            orient: "vertical" as const,
            right: 10,
            top: "middle",
            textStyle: { color: "#6B6680", fontSize: 13 },
            itemWidth: 8,
            itemHeight: 8,
          },
    };
  }, [chartData, isMobile, t]);

  return { option };
};
```

- [ ] **6.4** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors.
- [ ] **6.5** Commit: `feat(expenseChart): reconfigure donut with aurora palette, tooltip, and responsive legend`

---

### Task 7: Reconfigure IncomeVsExpenceChart (Bar) with aurora ECharts + hideTitle prop

**Files:**
- Modify: `src/widgets/incomeVsExpenceChart/container/useContainer.tsx`
- Modify: `src/widgets/incomeVsExpenceChart/ui/index.tsx`
- Modify: `src/widgets/incomeVsExpenceChart/ui/styles.module.scss`

**Interfaces:**

*Consumes:* same inputs as current + new optional `hideTitle` prop
*Produces:* `{ option: EChartsOption }` — reconfigured with aurora bar styles

**Steps:**

- [ ] **7.1** Rewrite `src/widgets/incomeVsExpenceChart/ui/styles.module.scss`:

```scss
.chartContainer {
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.chartTitle {
  font-family: 'Sora', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--aurora-text);
  margin: 0 0 8px 0;
  padding: 16px 16px 0;
}

.chart {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}
```

- [ ] **7.2** Modify `src/widgets/incomeVsExpenceChart/ui/index.tsx` — add `hideTitle` prop, wrap in aurora-card conditionally:

```tsx
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
  hideTitle?: boolean;
};

export const UI = ({ option, hideTitle = false }: UIPropertyType) => {
  const { t } = useTranslation();
  const content = (
    <div className={styles.chartContainer}>
      {!hideTitle && (
        <h4 className={`aurora-font-display ${styles.chartTitle}`}>
          {t("incomeVsExpense")}
        </h4>
      )}
      <ReactECharts option={option} className={styles.chart} />
    </div>
  );

  if (hideTitle) return content;
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {content}
    </div>
  );
};
```

- [ ] **7.3** Rewrite `src/widgets/incomeVsExpenceChart/container/useContainer.tsx` with aurora bar config:

```typescript
import type { EChartsOption } from "echarts";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { calculateIncomeVsExpenceChart } from "../model/lib";

const INCOME_COLOR = "#0E9F6E";
const EXPENSE_COLOR = "#E0457B";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const { transactions } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(filters.search ?? "", 250);
  const { isMobile } = useMedia();
  const { t } = useTranslation();

  const reportFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () => calculateIncomeVsExpenceChart(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => ({
    textStyle: { fontFamily: "'Inter', sans-serif" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#FFFFFF",
      borderColor: "#E8E4F0",
      textStyle: { color: "#1E1B2E", fontSize: 13 },
      extraCssText: "box-shadow: 0 4px 12px rgba(76,29,149,0.10); border-radius: 12px; padding: 10px 14px;",
    },
    grid: {
      left: 16,
      right: 16,
      bottom: isMobile ? 48 : 32,
      top: 40,
      containLabel: true,
    },
    xAxis: {
      data: chartData.names,
      axisLabel: {
        color: "#6B6680",
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      axisLabel: { color: "#6B6680", fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#E8E4F0", type: "dashed" } },
    },
    series: [
      {
        name: t("expense"),
        type: "bar",
        data: chartData.expenseValues,
        color: EXPENSE_COLOR,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        barMaxWidth: isMobile ? 28 : 40,
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
      {
        name: t("income"),
        type: "bar",
        data: chartData.incomeValues,
        color: INCOME_COLOR,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        barMaxWidth: isMobile ? 28 : 40,
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
    ],
    legend: isMobile
      ? {
          data: [t("expense"), t("income")],
          bottom: 0,
          textStyle: { color: "#6B6680", fontSize: 14 },
          itemWidth: 10,
          itemHeight: 10,
          icon: "roundRect" as const,
        }
      : {
          data: [t("expense"), t("income")],
          top: 0,
          textStyle: { color: "#6B6680", fontSize: 14 },
          itemWidth: 10,
          itemHeight: 10,
          icon: "roundRect" as const,
        },
  }), [chartData, isMobile, t]);

  return { option };
};
```

- [ ] **7.4** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors.
- [ ] **7.5** Commit: `feat(incomeVsExpenceChart): reconfigure bar chart with aurora colors, hideTitle prop for hero embedding`

---

### Task 8: Reconfigure MountlyExpenseChart (Line) with aurora ECharts option

**Files:**
- Modify: `src/widgets/mountlyExpenseChart/container/useContainer.tsx`
- Modify: `src/widgets/mountlyExpenseChart/ui/index.tsx`
- Modify: `src/widgets/mountlyExpenseChart/ui/styles.module.scss`

**Interfaces:**

*Consumes:* same inputs as current
*Produces:* `{ option: EChartsOption, targetDate: Date, onTargetDateChange: (date: Date | null) => void }` — reconfigured with aurora line+area style

**Steps:**

- [ ] **8.1** Rewrite `src/widgets/mountlyExpenseChart/ui/styles.module.scss`:

```scss
.chartContainer {
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-height: 360px;

  @media (max-width: 768px) {
    min-height: 360px;
  }
}

.chartTitleContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 0;
  flex-wrap: wrap;
  gap: 8px;
}

.chartTitle {
  font-family: 'Sora', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--aurora-text);
  margin: 0;
}

.datePickerContainer {
  display: flex;
  align-items: center;
  gap: 5px;
}

.chart {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}
```

- [ ] **8.2** Modify `src/widgets/mountlyExpenseChart/ui/index.tsx` — wrap in aurora-card:

```tsx
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
  targetDate: Date;
  onTargetDateChange: (date: Date | null) => void;
};

export const UI = ({ option, targetDate, onTargetDateChange }: UIPropertyType) => {
  const { t } = useTranslation();
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styles.chartContainer}>
        <div className={styles.chartTitleContainer}>
          <h4 className={`aurora-font-display ${styles.chartTitle}`}>
            {t("expensesByMonth")} {dayjs(targetDate).format("MMMM YYYY")}
          </h4>
          <div className={styles.datePickerContainer}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                onTargetDateChange(dayjs(targetDate).subtract(1, "month").toDate())
              }
            />
            <DatePicker
              value={dayjs(targetDate)}
              onChange={(value: Dayjs | null) =>
                onTargetDateChange(value ? value.toDate() : null)
              }
              picker="month"
            />
            <Button
              icon={<ArrowRightOutlined />}
              onClick={() =>
                onTargetDateChange(dayjs(targetDate).add(1, "month").toDate())
              }
            />
          </div>
        </div>
        <ReactECharts option={option} className={styles.chart} />
      </div>
    </div>
  );
};
```

- [ ] **8.3** Rewrite `src/widgets/mountlyExpenseChart/container/useContainer.tsx` with aurora line+area config:

```typescript
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";
import { useMemo, useEffect, useState } from "react";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useMedia } from "@/shared/hooks/useMedia";
import { getTransactionsByMonth } from "../model/lib";

const LINE_COLOR = "#7C3AED";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const { transactions } = useTransactionQueries();
  const setAllTransactions = useSetAllTransactions();
  const { isMobile } = useMedia();

  const chartData = useMemo(
    () => getTransactionsByMonth(transactions, targetDate),
    [transactions, targetDate],
  );

  const onTargetDateChange = (date: Date | null) => {
    if (date) setTargetDate(date);
  };

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => ({
    textStyle: { fontFamily: "'Inter', sans-serif" },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#FFFFFF",
      borderColor: "#E8E4F0",
      textStyle: { color: "#1E1B2E", fontSize: 13 },
      extraCssText: "box-shadow: 0 4px 12px rgba(76,29,149,0.10); border-radius: 12px; padding: 10px 14px;",
    },
    grid: {
      left: 16,
      right: 16,
      bottom: isMobile ? 36 : 32,
      top: 8,
      containLabel: true,
    },
    xAxis: {
      data: chartData.days,
      axisLabel: {
        color: "#6B6680",
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      axisLabel: { color: "#6B6680", fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#E8E4F0", type: "dashed" } },
    },
    series: [
      {
        type: "line",
        data: chartData.amounts,
        smooth: true,
        color: LINE_COLOR,
        lineStyle: { width: 2.5 },
        symbol: "circle",
        symbolSize: isMobile ? 4 : 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(124, 58, 237, 0.15)" },
            { offset: 1, color: "rgba(124, 58, 237, 0.02)" },
          ]),
        },
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
    ],
  }), [chartData, isMobile]);

  return { option, targetDate, onTargetDateChange };
};
```

- [ ] **8.4** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors. Ensure `echarts` import is available (it is a dependency of `echarts-for-react`).
- [ ] **8.5** Commit: `feat(mountlyExpenseChart): reconfigure line+area chart with aurora accent gradient and tooltip`

---

### Task 9: Create ReportsLists widget (Ant Tabs + AnimatePresence)

**Files:**
- Create: `src/widgets/reportsLists/index.ts`
- Create: `src/widgets/reportsLists/container/index.tsx`
- Create: `src/widgets/reportsLists/ui/ReportsListsView.tsx`
- Create: `src/widgets/reportsLists/ui/ReportsLists.module.scss`
- Create: `src/widgets/reportsLists/ui/ReportsListsSkeleton.tsx`

**Interfaces:**

*Consumes:*
- `TopCategories.Widget` from `@/widgets/topCategories`
- `LargestTransactions.Widget` from `@/widgets/largestTransactions`
- `useTranslation()` — for tab labels
- `useMotionConfig()` — for tabPanel animation variants
- `useState` for activeKey

*Produces:*
- `ReportsLists = { Widget: ReportsListsContainer }`
- `ReportsListsView` — Ant Tabs with AnimatePresence

**Steps:**

- [ ] **9.1** Create `src/widgets/reportsLists/ui/ReportsListsView.tsx`:

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { TopCategories } from "@/widgets/topCategories";
import { LargestTransactions } from "@/widgets/largestTransactions";
import { useMotionConfig } from "@/shared/lib/motion";
import styles from "./ReportsLists.module.scss";

export function ReportsListsView() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string>("categories");
  const { durationEnter, durationExit, easeOut, tabPanelHidden, tabPanelVisible, tabPanelExit } =
    useMotionConfig();

  const tabItems: TabsProps["items"] = [
    { key: "categories", label: t("tabsCategories") },
    { key: "transactions", label: t("tabsTransactions") },
  ];

  return (
    <div className="aurora-card" style={{ padding: 16 }}>
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={setActiveKey}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={tabPanelHidden}
          animate={tabPanelVisible}
          exit={tabPanelExit}
          transition={{
            duration: activeKey === "categories" ? durationEnter : durationExit,
            ease: easeOut as [number, number, number, number],
          }}
        >
          {activeKey === "categories" ? (
            <div className={styles.tabPanel}>
              <TopCategories.Widget />
            </div>
          ) : (
            <div className={styles.tabPanel}>
              <LargestTransactions.Widget />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **9.2** Create `src/widgets/reportsLists/ui/ReportsLists.module.scss`:

```scss
.tabPanel {
  min-height: 200px;
}
```

- [ ] **9.3** Create `src/widgets/reportsLists/ui/ReportsListsSkeleton.tsx`:

```tsx
import { Skeleton } from "antd";

export function ReportsListsSkeleton() {
  return (
    <div className="aurora-card" style={{ padding: 16 }}>
      <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 16 }} />
      <Skeleton.Input active size="small" style={{ width: 120, marginLeft: 16, marginBottom: 16 }} />
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
}
```

- [ ] **9.4** Create `src/widgets/reportsLists/container/index.tsx`:

```tsx
import { ReportsListsView } from "../ui/ReportsListsView";

export function ReportsListsContainer() {
  return <ReportsListsView />;
}
```

- [ ] **9.5** Create `src/widgets/reportsLists/index.ts`:

```typescript
import { ReportsListsContainer } from "./container";

export const ReportsLists = {
  Widget: ReportsListsContainer,
};
```

- [ ] **9.6** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors.
- [ ] **9.7** Commit: `feat(reports): add ReportsLists widget with Ant Tabs and AnimatePresence`

---

### Task 10: Rework ReportsPage — compose, skeleton, error, empty, bento grid

**Files:**
- Modify: `src/pages/reports/ui/ReportsPage.tsx`
- Modify: `src/pages/reports/ui/ReportsPage.module.scss`
- Create: `src/pages/reports/ui/ReportsPageSkeleton.tsx`

**Interfaces:**

*Consumes:*
- `useReportsData()` → `{ loading, error, refetch, isEmpty }`
- `useTranslation()` — `t`
- `AppShell` — existing wrapper
- `TransactionsFiltersWidget` — existing (unchanged)
- `ReportsHero.Widget` — from Task 4
- `ReportCardWidget` — from Task 5
- `ExpenseChart.Widget` — from Task 6
- `MountlyExpenseChart.Widget` — from Task 8
- `ReportsLists.Widget` — from Task 9

*Produces:*
- `ReportsPage` — page with full state management

**Steps:**

- [ ] **10.1** Create `src/pages/reports/ui/ReportsPageSkeleton.tsx`:

```tsx
import { Skeleton } from "antd";
import styles from "./ReportsPage.module.scss";
import { ReportsHeroSkeleton } from "@/widgets/reportsHero/ui/ReportsHeroSkeleton";
import { ReportCardWidgetSkeleton } from "@/widgets/reportCard/container/ReportCardWidgetSkeleton";
import { ReportsListsSkeleton } from "@/widgets/reportsLists/ui/ReportsListsSkeleton";

function ChartSkeleton() {
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 320 }}>
      <div style={{ padding: 16 }}>
        <Skeleton.Input active size="small" style={{ width: 160 }} />
      </div>
      <Skeleton.Node active style={{ width: "100%", flex: 1, minHeight: 260 }} />
    </div>
  );
}

export function ReportsPageSkeleton() {
  return (
    <div className={styles.page}>
      {/* Filters skeleton */}
      <div className="aurora-card" style={{ padding: "12px 16px" }}>
        <Skeleton.Input active size="small" style={{ width: "100%" }} />
      </div>

      <ReportsHeroSkeleton />
      <ReportCardWidgetSkeleton />

      {/* Bento skeleton */}
      <div className={styles.bentoGrid}>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ReportsListsSkeleton />
    </div>
  );
}
```

- [ ] **10.2** Rewrite `src/pages/reports/ui/ReportsPage.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { ExclamationCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { TransactionsFiltersWidget } from "@/features/transaction/filters";
import { ReportCardWidget } from "@/widgets/reportCard";
import { ExpenseChart } from "@/widgets/expenseChart";
import { MountlyExpenseChart } from "@/widgets/mountlyExpenseChart";
import { ReportsHero } from "@/widgets/reportsHero";
import { ReportsLists } from "@/widgets/reportsLists";
import { useReportsData } from "@/features/transaction/manage/model/useReportsData";
import { useMotionConfig } from "@/shared/lib/motion";
import { ReportsPageSkeleton } from "./ReportsPageSkeleton";
import styles from "./ReportsPage.module.scss";

export function ReportsPage() {
  const { t } = useTranslation();
  const { loading, error, refetch, isEmpty } = useReportsData();
  const config = useMotionConfig();

  if (loading) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <ReportsPageSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <div className="aurora-surface" style={{ padding: 0 }}>
          <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
            <ExclamationCircleOutlined
              style={{
                fontSize: 48,
                color: "var(--aurora-text-secondary)",
                opacity: 0.6,
                marginBottom: 16,
              }}
            />
            <div
              className="aurora-font-body"
              style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginBottom: 8 }}
            >
              {t("loadingError")}
            </div>
            <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
              {String(error)}
            </div>
            <Button type="primary" onClick={() => refetch()}>
              {t("retry")}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (isEmpty) {
    return (
      <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
        <div className="aurora-surface" style={{ padding: 0 }}>
          <div className="aurora-card">
            <div className="aurora-empty-state">
              <InboxOutlined className="aurora-empty-state__icon" />
              <div className="aurora-empty-state__title">{t("reportsNoData")}</div>
              <p className="aurora-text-secondary" style={{ fontSize: 14 }}>
                {t("reportsNoDataHint")}
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("reports")} subtitle={t("reportsOnYourTransactions")}>
      <motion.div
        className="aurora-surface"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: config.staggerChildren, delayChildren: config.delayChildren } },
        }}
      >
        {/* Filters */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <div className="aurora-card" style={{ padding: "12px 16px" }}>
            <TransactionsFiltersWidget />
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportsHero.Widget />
        </motion.div>

        {/* KPI */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportCardWidget />
        </motion.div>

        {/* Bento 2×2 */}
        <motion.div
          className={styles.bentoGrid}
          variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}
        >
          <motion.div
            initial={config.scrollRevealHidden}
            whileInView={config.scrollRevealVisible}
            viewport={config.scrollRevealViewport}
            transition={{ duration: config.scrollRevealDuration, ease: config.easeOut as [number, number, number, number] }}
          >
            <ExpenseChart.Widget />
          </motion.div>
          <motion.div
            initial={config.scrollRevealHidden}
            whileInView={config.scrollRevealVisible}
            viewport={config.scrollRevealViewport}
            transition={{ duration: config.scrollRevealDuration, ease: config.easeOut as [number, number, number, number] }}
          >
            <MountlyExpenseChart.Widget />
          </motion.div>
        </motion.div>

        {/* Lists */}
        <motion.div variants={config.hidden !== config.visible ? { hidden: config.hidden, visible: config.visible } : undefined}>
          <ReportsLists.Widget />
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
```

- [ ] **10.3** Rewrite `src/pages/reports/ui/ReportsPage.module.scss`:

```scss
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1200px) {
    gap: 16px;
  }
}

.bentoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  // Each direct child fills height
  > * {
    min-height: 320px;
    display: flex;
    flex-direction: column;
  }
}
```

- [ ] **10.4** Verify: `npx tsc --noEmit --project tsconfig.app.json` — no new errors. The existing 2 known errors (`largestTransactions` null vs string, `topCategories` Category | undefined) are acceptable.
- [ ] **10.5** Verify: `npm run lint` passes on all changed files (no new lint errors). Use `npx eslint src/pages/reports/ui/ReportsPage.tsx src/pages/reports/ui/ReportsPageSkeleton.tsx src/widgets/reportsHero/ src/widgets/reportsLists/ src/widgets/reportCard/ src/widgets/expenseChart/ src/widgets/incomeVsExpenceChart/ src/widgets/mountlyExpenseChart/ src/shared/lib/motion.ts src/shared/ui/CountUpValue.tsx src/i18n.js`.
- [ ] **10.6** Commit: `feat(reports): rework ReportsPage with ReportsHero, KPI cards, bento grid, ReportsLists, full state handling`

---

### Task 11: Final verification — lint, build, visual check

**Files:** No new files, verification-only.

**Steps:**

- [ ] **11.1** Run `npm run lint` — confirm zero new errors in all changed files. Fix any lint issues.
- [ ] **11.2** Run `npm run build` (or `npx tsc --noEmit --project tsconfig.app.json`) — confirm only the 2 pre-existing TS errors remain (`largestTransactions`, `topCategories`). No new errors.
- [ ] **11.3** Start dev server: `npm run dev` and verify visually:
  - [ ] Desktop (>1200px): Hero 2-col, KPI 4-col with count-up numbers, bento 2-col, ReportsLists with tabs
  - [ ] Tablet (768-1200px): Hero stacks, KPI 2-col, bento 1-col
  - [ ] Mobile (<768px): single column, charts have adequate min-height, legends at bottom
  - [ ] Very small (<480px): orbs hidden
  - [ ] Animations: stagger reveal on page mount, scroll-reveal on bento charts
  - [ ] prefers-reduced-motion: all animations are instant (check via devtools emulation)
  - [ ] Loading state: skeleton appears then transitions to content
  - [ ] Empty state: shows "Нет данных за период" with InboxOutlined
  - [ ] Error state: shows error with Retry button (simulate by stopping backend or adding a GraphQL error)
  - [ ] Tab switching in ReportsLists: smooth AnimatePresence fade
  - [ ] KPI cards: hover lift effect, count-up numbers, savingsRate shows XX%
  - [ ] Dawnut chart: aurora palette, total in center
  - [ ] Bar chart: aurora colors, rounded corners
  - [ ] Line chart: aurora accent line, area gradient
  - [ ] i18n: switch to EN/RU — all new keys translate correctly
- [ ] **11.4** Fix any issues found during visual verification.
- [ ] **11.5** Commit (if any fixes needed): `fix(reports): visual verification fixes for responsive layout and animations`
- [ ] **11.6** Final commit of any remaining adjustments.

---

## Self-Review

**Spec coverage:**
- Section 5.1 (Page Shell) → Task 10
- Section 5.2 (ReportsHero) → Task 4 (+ Task 7 for chart embedding)
- Section 5.3 (KPI Bar / ReportCardWidget) → Task 5
- Section 5.4 (Bento 2×2) → Task 10 (layout) + Task 6/8 (charts)
- Section 5.5 (ReportsLists) → Task 9
- Section 6 (ECharts Reconfiguration) → Tasks 6, 7, 8
- Section 7 (Responsive) → embedded in each task's SCSS
- Section 8 (Animations) → Task 1 (motion.ts) + woven into Tasks 4, 5, 9, 10
- Section 9 (i18n) → Task 2
- Section 10 (States) → Tasks 4, 5, 9, 10 (skeletons, error cards, empty state)
- Section 11 (Constraints) → respected in all tasks

**Placeholder scan:** No TODO, TBD, or "implement X" abstract steps. Every step contains specific code.

**Type consistency:**
- `useReportsData()` matches `useTransactionQueries()` return shape
- `CountUpValue` props: `{ value: number; format: (v: number) => string; className?: string }` — consistent across all uses
- `ReportCardTone` includes `"neutral"` — used in types, cardsConfig, ReportCard SCSS
- `ReportsHero.useContainer()` returns `{ totalIncome, totalExpense, balance, t }` — consumed by `ReportsHeroView`
- `IncomeVsExpenceChart.UIPropertyType` extended with `hideTitle?: boolean` — used in hero embedded chart
- `ReportCardWidget.useContainer()` now returns `refetch` — consumed by ReportCardWidget error state
- `useMotionConfig()` returns extended shape with `scrollReveal*` and `tabPanel*` fields — used in Tasks 9 and 10
- All `import type` used where applicable
- `echarts` namespace import used for `echarts.graphic.LinearGradient` in mountlyExpenseChart
