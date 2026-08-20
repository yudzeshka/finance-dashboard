# Конверсия валют с актуальным курсом — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать так, чтобы смена валюты в «Настройках» влияла на все суммы в приложении: отображение конвертируется из базовой валюты USD по актуальному курсу (open.er-api.com), ввод/правка/фильтр/CSV работают в выбранной валюте.

**Architecture:** База данных — USD (все суммы в БД — числа в долларах). Новый модуль `entities/currency` хранит курсы (Zustand + persist в localStorage), обновляет их с `https://open.er-api.com/v6/latest/USD` и даёт чистые функции `usdToDisplay` / `displayToUsd` / `formatAmount`. Единая точка конверсии — `useCurrencyFormatter`. Офлайн — кэш курсов + подпись «Курс от ДД.ММ.ГГГГ».

**Tech Stack:** React 19, Zustand 5, vitest 4 (уже установлен, `npm test` зелёный), `@/` alias → `src`, FSD.

**Spec:** `docs/superpowers/specs/2026-08-20-currency-conversion-design.md`

## Global Constraints

- **База валюты = USD.** Всё, что хранится в БД / в Apollo-кэше / в офлайн-очереди — это USD. Отображение — результат `usdToDisplay`.
- **Ввод пользователя — в выбранной валюте.** Перед записью обязательно `displayToUsd(...)` (округляет до 2 знаков).
- Офлайн-фолбэк: если `rates === null`, все функции конверсии возвращают значение как есть (rate = 1); подпись «Курс от …» показывается только когда есть кэш.
- `verbatimModuleSyntax` — типы импортировать через `import type`.
- `erasableSyntaxOnly` — никаких enum, только объекты/строковые литералы.
- Тесты — только чистые функции через vitest (`*.test.ts`). UI-слои проверяются `npm run build` + ручным прогоном (компонентного тест-харнеса нет).
- **Без миграции данных:** старые записи остаются числами как есть (трактуются как USD). Это осознанное решение.
- Каждая задача завершается коммитом на ветке `feat/currency-conversion`.

---

### Task 1: `entities/currency` — чистые функции конверсии и форматирования (TDD)

**Files:**
- Create: `src/entities/currency/model/types.ts`
- Create: `src/entities/currency/model/convert.ts`
- Create: `src/entities/currency/model/format.ts`
- Create: `src/entities/currency/index.ts`
- Test: `src/entities/currency/model/convert.test.ts`

**Interfaces:**
- Consumes: `Currency` из `@/entities/settings` (уже экспортируется баррелем).
- Produces (публичный API модуля `entities/currency`):
  - `type CurrencyRates = Record<Currency, number>` (курс «1 USD в валюте X», USD = 1)
  - `currencySymbol(code: Currency): string`
  - `getRate(currency: Currency, rates: CurrencyRates | null): number`
  - `usdToDisplay(usd: number, currency: Currency, rates: CurrencyRates | null): number`
  - `displayToUsd(amount: number, currency: Currency, rates: CurrencyRates | null): number`
  - `formatAmount(valueUsd: number, currency: Currency, rates: CurrencyRates | null): string`

- [ ] **Step 1: Написать падающие тесты**

Создать `src/entities/currency/model/convert.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { currencySymbol, displayToUsd, getRate, usdToDisplay } from "./convert";
import { formatAmount } from "./format";

const RATES = { USD: 1, RUB: 85, EUR: 0.85, BYN: 3.0 };

describe("usdToDisplay", () => {
  it("passes through USD", () => {
    expect(usdToDisplay(100, "USD", RATES)).toBe(100);
  });
  it("converts USD to RUB", () => {
    expect(usdToDisplay(1, "RUB", RATES)).toBe(85);
  });
  it("converts USD to EUR", () => {
    expect(usdToDisplay(100, "EUR", RATES)).toBeCloseTo(85);
  });
  it("falls back to passthrough when rates are null", () => {
    expect(usdToDisplay(50, "RUB", null)).toBe(50);
  });
});

describe("displayToUsd", () => {
  it("passes through USD", () => {
    expect(displayToUsd(100, "USD", RATES)).toBe(100);
  });
  it("converts RUB to USD", () => {
    expect(displayToUsd(85, "RUB", RATES)).toBe(1);
  });
  it("rounds to 2 decimals", () => {
    expect(displayToUsd(1, "RUB", RATES)).toBe(0.01);
  });
  it("falls back to passthrough when rates are null", () => {
    expect(displayToUsd(85, "RUB", null)).toBe(85);
  });
});

describe("getRate", () => {
  it("returns 1 without rates", () => {
    expect(getRate("RUB", null)).toBe(1);
  });
});

describe("currencySymbol", () => {
  it("maps currency codes to symbols", () => {
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("RUB")).toBe("₽");
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("BYN")).toBe("Br");
  });
});

describe("formatAmount", () => {
  it("formats USD with $", () => {
    expect(formatAmount(100, "USD", RATES)).toContain("$");
  });
  it("formats converted RUB with ₽", () => {
    expect(formatAmount(1, "RUB", RATES)).toContain("₽");
  });
});
```

- [ ] **Step 2: Запустить тесты, убедиться что падают**

Run: `npm test`
Expected: FAIL — `convert.ts` не существует (Cannot find module).

- [ ] **Step 3: Реализовать модуль**

`src/entities/currency/model/types.ts`:
```ts
import type { Currency } from "@/entities/settings";

export type CurrencyRates = Record<Currency, number>;
```

`src/entities/currency/model/convert.ts`:
```ts
import type { Currency } from "@/entities/settings";
import type { CurrencyRates } from "./types";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  RUB: "₽",
  EUR: "€",
  BYN: "Br",
};

export function currencySymbol(code: Currency): string {
  return CURRENCY_SYMBOLS[code];
}

export function getRate(
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (!rates) return 1;
  return rates[currency] ?? 1;
}

export function usdToDisplay(
  usd: number,
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (currency === "USD") return usd;
  return usd * getRate(currency, rates);
}

export function displayToUsd(
  amount: number,
  currency: Currency,
  rates: CurrencyRates | null,
): number {
  if (currency === "USD") return amount;
  const rate = getRate(currency, rates);
  if (!Number.isFinite(rate) || rate <= 0) return amount;
  return Math.round((amount / rate) * 100) / 100;
}
```

`src/entities/currency/model/format.ts`:
```ts
import type { Currency } from "@/entities/settings";
import type { CurrencyRates } from "./types";
import { usdToDisplay } from "./convert";

export function formatAmount(
  valueUsd: number,
  currency: Currency,
  rates: CurrencyRates | null,
): string {
  const display = usdToDisplay(valueUsd, currency, rates);
  const locale = currency === "RUB" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "RUB" ? 0 : 2,
    maximumFractionDigits: currency === "RUB" ? 0 : 2,
  }).format(display);
}
```

`src/entities/currency/index.ts`:
```ts
export * from "./model/convert";
export * from "./model/format";
export * from "./model/types";
```

- [ ] **Step 4: Запустить тесты, убедиться что проходят**

Run: `npm test`
Expected: PASS — теперь 5 файлов тестов (добавился convert.test.ts), все зелёные.

- [ ] **Step 5: Commit**

```bash
git add src/entities/currency
git commit -m "feat(currency): add pure conversion and formatting helpers

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Rates store (Zustand + persist + fetch)

**Files:**
- Create: `src/entities/currency/model/ratesStore.ts`
- Modify: `src/entities/currency/index.ts`

**Interfaces:**
- Consumes: `CurrencyRates` из `./types`.
- Produces: `useCurrencyRatesStore` — Zustand-стор с полями `rates: CurrencyRates | null`, `fetchedAt: number | null`, `loading: boolean`, `error: string | null` и экшенами `fetchRates(): Promise<void>`, `ensureRates(): Promise<void>`. persist-ключ `currency-rates` (персистятся только `rates` и `fetchedAt`).

- [ ] **Step 1: Реализовать стор**

Создать `src/entities/currency/model/ratesStore.ts`:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyRates } from "./types";

const MAX_RATE_AGE_MS = 12 * 60 * 60 * 1000; // 12h

type RatesState = {
  rates: CurrencyRates | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
  ensureRates: () => Promise<void>;
};

export const useCurrencyRatesStore = create<RatesState>()(
  persist(
    (set, get) => ({
      rates: null,
      fetchedAt: null,
      loading: false,
      error: null,

      fetchRates: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as {
            rates?: Record<string, number>;
          };
          const r = data.rates ?? {};
          set({
            rates: { USD: 1, RUB: r.RUB ?? 1, EUR: r.EUR ?? 1, BYN: r.BYN ?? 1 },
            fetchedAt: Date.now(),
            loading: false,
          });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      },

      ensureRates: async () => {
        const { rates, fetchedAt, loading } = get();
        const stale =
          !rates || !fetchedAt || Date.now() - fetchedAt > MAX_RATE_AGE_MS;
        if (stale && !loading) await get().fetchRates();
      },
    }),
    {
      name: "currency-rates",
      partialize: (s) => ({ rates: s.rates, fetchedAt: s.fetchedAt }),
    },
  ),
);
```

Обновить `src/entities/currency/index.ts`:
```ts
export * from "./model/convert";
export * from "./model/format";
export * from "./model/ratesStore";
export * from "./model/types";
```

- [ ] **Step 2: Проверить сборку**

Run: `npm run build`
Expected: PASS (type-check + vite build).

- [ ] **Step 3: Commit**

```bash
git add src/entities/currency
git commit -m "feat(currency): add persisted exchange-rates store

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: CSP + CurrencyRatesProvider + main.tsx

**Files:**
- Modify: `index.html`
- Create: `src/app/providers/CurrencyRatesProvider.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `useCurrencyRatesStore` из `@/entities/currency`.
- Produces: `<CurrencyRatesProvider>{children}</CurrencyRatesProvider>` — вызывает `ensureRates()` на mount и повторно на событии `online`.

- [ ] **Step 1: Добавить домен в CSP**

В `index.html` внутри `connect-src` (сейчас: `'self' https://*.nhost.run https://*.nhost.app http://localhost:4000 ws://localhost:* wss://localhost:*`) добавить строку `https://open.er-api.com`:

```html
connect-src 'self'
  https://*.nhost.run
  https://*.nhost.app
  http://localhost:4000
  ws://localhost:*
  wss://localhost:*
  https://open.er-api.com;
```

- [ ] **Step 2: Создать провайдер**

Создать `src/app/providers/CurrencyRatesProvider.tsx`:

```tsx
import { useEffect, type ReactNode } from "react";
import { useCurrencyRatesStore } from "@/entities/currency";

export function CurrencyRatesProvider({ children }: { children: ReactNode }) {
  const ensureRates = useCurrencyRatesStore((s) => s.ensureRates);

  useEffect(() => {
    ensureRates();
    window.addEventListener("online", ensureRates);
    return () => window.removeEventListener("online", ensureRates);
  }, [ensureRates]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Подключить в main.tsx**

Обернуть приложение внутри `AppAntdProvider`:

```tsx
<AppAntdProvider>
  <CurrencyRatesProvider>
    <AuthProvider>
      <AppApolloProvider>
        ...
      </AppApolloProvider>
    </AuthProvider>
  </CurrencyRatesProvider>
</AppAntdProvider>
```

Добавить импорт: `import { CurrencyRatesProvider } from "./app/providers/CurrencyRatesProvider";`

- [ ] **Step 4: Проверить сборку**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html src/app/providers/CurrencyRatesProvider.tsx src/main.tsx
git commit -m "feat(currency): fetch exchange rates on app start (CSP + provider)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Конверсия в `useCurrencyFormatter`

**Files:**
- Modify: `src/shared/lib/useCurrencyFormatter.ts`

**Interfaces:**
- Consumes: `useAppearanceStore` (`@/features/settings/appearance`), `useCurrencyRatesStore` и `formatAmount` (`@/entities/currency`).
- Produces: прежняя сигнатура `useCurrencyFormatter(): (value: number) => string`, где `value` — **сумма в USD**. Функция конвертирует и форматирует.

- [ ] **Step 1: Заменить содержимое файла**

Полностью заменить `src/shared/lib/useCurrencyFormatter.ts`:

```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { formatAmount, useCurrencyRatesStore } from "@/entities/currency";

export function useCurrencyFormatter(): (value: number) => string {
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  return (value: number) => formatAmount(value, currency, rates);
}
```

Примечание: `Intl.NumberFormat`-логика теперь в `formatAmount` (Task 1). Поведение для USD-значений при `currency === "USD"` идентично прежнему (курс не влияет).

- [ ] **Step 2: Проверить сборку**

Run: `npm run build`
Expected: PASS — все существующие вызовы `useCurrencyFormatter` компилируются (они передают суммы в USD).

- [ ] **Step 3: Ручная проверка (dev)**

Run: `npm run dev`
Проверить: на дашборде баланс конвертируется при выборе RUB в Настройках (например, 100 USD → ~8 500 ₽). Если курсы ещё не подгрузились — значения сначала как есть, затем «подпрыгивают» до корректных.

- [ ] **Step 4: Commit**

```bash
git add src/shared/lib/useCurrencyFormatter.ts
git commit -m "feat(currency): convert stored USD amounts in formatter

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Убрать хардкод ₽ (TransactionsTable, dashboardInsights, LargestTransactions)

**Files:**
- Modify: `src/widgets/transactions-table/ui/TransactionsTable.tsx`
- Modify: `src/widgets/dashboardInsights/container/useContainer.ts`
- Modify: `src/widgets/largestTransactions/ui/index.tsx`

**Interfaces:**
- Consumes: `useCurrencyFormatter` (`@/shared/lib/useCurrencyFormatter`).

- [ ] **Step 1: TransactionsTable**

В `src/widgets/transactions-table/ui/TransactionsTable.tsx`:

1. Удалить функцию `formatTableAmount` (строки 31–38).
2. Добавить импорт `useCurrencyFormatter`:
```ts
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
```
3. Внутри компонента добавить хук:
```ts
const formatCurrency = useCurrencyFormatter();
```
4. В колонке «amount» рендер заменить (знак ставится вручную, значение по модулю):
```tsx
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
      aria-label={`${ariaType}: ${sign}${formatCurrency(Math.abs(amount))}`}
    >
      {sign}
      {formatCurrency(Math.abs(amount))}
    </span>
  );
},
```
5. Итоговую строку заменить:
```ts
const totalFormatted = useMemo(() => {
  const sign = total >= 0 ? "+" : "−";
  return `${sign}${formatCurrency(Math.abs(total))}`;
}, [total, formatCurrency]);
```
6. В `useMemo` для `columns` добавить `formatCurrency` в массив зависимостей:
```ts
}, [deleteLoading, descriptionFilter, onDelete, onEdit, t, formatCurrency]);
```

- [ ] **Step 2: dashboardInsights**

В `src/widgets/dashboardInsights/container/useContainer.ts`:

1. Удалить функцию `formatInsight` (строки 20–27).
2. Добавить импорт и хук:
```ts
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
...
export function useDashboardInsights() {
  ...
  const formatCurrency = useCurrencyFormatter();
```
3. В `useMemo` для `tiles` заменить `formatInsight(...)` на `formatCurrency(...)` (значения `income30d`/`expense30d` уже положительные, знак ставится вручную):
```ts
formattedValue: "+" + formatCurrency(stats.income30d),
...
formattedValue: "−" + formatCurrency(stats.expense30d),
...
formattedValue: stats.largestTransaction
  ? (stats.largestTransaction.type === "INCOME" ? "+" : "−") +
    formatCurrency(Math.abs(stats.largestTransaction.amount))
  : "—",
```
4. В зависимости `useMemo` для `tiles` добавить `formatCurrency`:
```ts
}, [stats, allTransactions, t, formatCurrency]);
```

- [ ] **Step 3: LargestTransactions**

В `src/widgets/largestTransactions/ui/index.tsx`:

1. Добавить импорт:
```ts
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
```
2. Внутри `UI` добавить хук:
```ts
const formatCurrency = useCurrencyFormatter();
```
3. Строку `$ {row.amount}` заменить:
```tsx
{formatCurrency(row.amount)}
```
(Файл уже содержит известную по CLAUDE.md потенциальную TS-ошибку про `dayjs(row.date)` — если `npm run build` упадёт на ней, заменить `dayjs(row.date)` на `dayjs(row.date ?? undefined)` в обоих местах — строках 43 и 45.)

- [ ] **Step 4: Проверить сборку**

Run: `npm run build`
Expected: PASS, новых ошибок нет.

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`
Проверить: в таблице, плитках инсайтов и LargestTransactions суммы отображаются в выбранной валюте (смена валюты в Настройках → все числа меняются и конвертируются).

- [ ] **Step 6: Commit**

```bash
git add src/widgets/transactions-table src/widgets/dashboardInsights src/widgets/largestTransactions
git commit -m "fix(currency): replace hardcoded RUB formatting with shared formatter

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Запись и правка транзакций в выбранной валюте

**Files:**
- Modify: `src/features/transaction/manage/model/useTransactionMutations.ts`
- Modify: `src/features/transaction/manage/model/useTransactionFormModal.ts`
- Modify: `src/widgets/transactions/ui/TransactionFormModal.tsx`
- Modify: `src/widgets/transactions/ui/TransactionsWidget.tsx` (inline-форма, префикс — для консистентности)

**Interfaces:**
- Consumes: `useAppearanceStore`, `useCurrencyRatesStore`, `usdToDisplay`, `displayToUsd`, `currencySymbol` (`@/entities/currency`).
- Ключевой инвариант: в БД, Apollo-кэш и офлайн-очередь попадает только USD.

- [ ] **Step 1: useTransactionMutations — конвертация перед записью**

В `src/features/transaction/manage/model/useTransactionMutations.ts`:

1. Импорты:
```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { displayToUsd, useCurrencyRatesStore } from "@/entities/currency";
```
2. `toTransactionVariables` теперь принимает готовую сумму в USD:
```ts
function toTransactionVariables(
  values: TransactionFormValues,
  amountUsd: number,
) {
  return {
    amount: amountUsd,
    description: values.description ?? null,
    categoryId: values.category,
    date: values.date ? values.date.toISOString() : new Date().toISOString(),
    type: values.type,
  };
}
```
3. `buildTempTransaction` тоже принимает `amountUsd`:
```ts
function buildTempTransaction(
  formValues: TransactionFormValues,
  existingCategories: Category[],
  amountUsd: number,
): Transaction {
  ...
  return {
    id: `offline-${crypto.randomUUID()}`,
    amount: amountUsd,
    ...
  };
}
```
4. Внутри `useTransactionMutations` прочитать валюту и курсы и определить конвертер:
```ts
const currency = useAppearanceStore((s) => s.currency);
const rates = useCurrencyRatesStore((s) => s.rates);
const toUsd = (amount: number) => displayToUsd(Number(amount), currency, rates);
```
5. В `createTransaction` сконвертировать один раз и прокинуть во все три места (мутация, temp-транзакция, очередь):
```ts
const createTransaction = async (values: TransactionFormValues) => {
  const amountUsd = toUsd(values.amount);
  try {
    await addMutation({
      variables: toTransactionVariables(values, amountUsd),
    });
  } catch (error) {
    if (!navigator.onLine) {
      const tempTransaction = buildTempTransaction(
        values,
        getCachedCategories(),
        amountUsd,
      );
      ...
      useOfflineQueue.getState().push({
        type: "add",
        variables: toTransactionVariables(values, amountUsd),
      });
      ...
    }
    throw error;
  }
};
```
6. Аналогично в `updateTransaction`:
```ts
const updateTransaction = async (
  id: string,
  values: TransactionFormValues,
) => {
  const amountUsd = toUsd(values.amount);
  try {
    await editMutation({
      variables: { id, ...toTransactionVariables(values, amountUsd) },
    });
  } catch (error) {
    if (!navigator.onLine) {
      const tempTransaction = buildTempTransaction(
        values,
        getCachedCategories(),
        amountUsd,
      );
      ...
      useOfflineQueue.getState().push({
        type: "edit",
        variables: { id, ...toTransactionVariables(values, amountUsd) },
      });
      ...
    }
    throw error;
  }
};
```
7. Внутренности `catch`-блоков (cache.updateQuery, message.info, throw) не меняются — меняются только аргументы `buildTempTransaction` и `variables`.

- [ ] **Step 2: useTransactionFormModal — префилл поля правки**

В `src/features/transaction/manage/model/useTransactionFormModal.ts`:

1. Импорты:
```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { usdToDisplay, useCurrencyRatesStore } from "@/entities/currency";
```
2. Внутри хука:
```ts
const currency = useAppearanceStore((s) => s.currency);
const rates = useCurrencyRatesStore((s) => s.rates);
```
3. В `openEdit` сумму подставлять сконвертированной:
```ts
form.setFieldsValue({
  amount: usdToDisplay(Number(tx.amount), currency, rates),
  description: tx.description ?? undefined,
  category: tx.category.id,
  date: dayjs(tx.date ?? new Date().toISOString()),
  type: tx.type,
});
```

- [ ] **Step 3: Префикс поля суммы**

В `src/widgets/transactions/ui/TransactionFormModal.tsx`:

1. Импорты:
```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { currencySymbol } from "@/entities/currency";
```
2. Внутри компонента:
```ts
const currency = useAppearanceStore((s) => s.currency);
```
3. `prefix="$"` → `prefix={currencySymbol(currency)}` (в InputNumber для `amount`).

То же самое в `src/widgets/transactions/ui/TransactionsWidget.tsx` (inline-форма, строки 96–102): добавить те же импорты, хук и `prefix={currencySymbol(currency)}`.

- [ ] **Step 4: Проверить сборку**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`
Проверить:
- Смена валюты на RUB → «Добавить транзакцию» → поле с префиксом `₽`; ввод 8500 → после сохранения в таблице `8 500 ₽`.
- Смена валюты на USD → редактирование этой же транзакции → в поле подставляется `≈100` (8500₽ / 85); сохранение не дрейфует (снова ~8500₽).
- Офлайн (DevTools → Network → Offline): добавление показывает temp-сумму в USD, после возврата в сеть синхронизация не удваивает значение.

- [ ] **Step 6: Commit**

```bash
git add src/features/transaction src/widgets/transactions
git commit -m "feat(currency): input and edit amounts in selected currency, store USD

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Фильтр по сумме — слайдер в выбранной валюте

**Files:**
- Modify: `src/features/transaction/filters/container/useContainer.tsx`

**Interfaces:**
- Consumes: `useAppearanceStore`, `usdToDisplay`, `displayToUsd`, `useCurrencyRatesStore`.
- Инвариант: в `filters.amountFrom/amountTo` по-прежнему хранятся **USD** (так их сравнивает `filterTransactions.ts`). Слайдер отображает выбранную валюту.

- [ ] **Step 1: Конвертация границ и значений**

В `src/features/transaction/filters/container/useContainer.tsx`:

1. Импорты:
```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { displayToUsd, usdToDisplay, useCurrencyRatesStore } from "@/entities/currency";
```
2. Внутри `useContainer`:
```ts
const currency = useAppearanceStore((s) => s.currency);
const rates = useCurrencyRatesStore((s) => s.rates);
```
3. Исходные границы в USD переименовать и добавить отображаемые границы:
```ts
const amountBoundsUsd = useMemo((): [number, number] => {
  if (allTransactions.length === 0) return [0, 100];
  const amounts = allTransactions.map((tx) => tx.amount);
  return [Math.min(...amounts), Math.max(...amounts)];
}, [allTransactions]);

const amountBounds = useMemo(
  (): [number, number] => [
    usdToDisplay(amountBoundsUsd[0], currency, rates),
    usdToDisplay(amountBoundsUsd[1], currency, rates),
  ],
  [amountBoundsUsd, currency, rates],
);
```
4. В `onOpen` сид в выбранной валюте:
```ts
const onOpen = () => {
  setFiltersValues(filters);
  setAmountRange([
    usdToDisplay(filters.amountFrom ?? amountBoundsUsd[0], currency, rates),
    usdToDisplay(filters.amountTo ?? amountBoundsUsd[1], currency, rates),
  ]);
  setIsOpen(true);
};
```
5. В `onAmountRangeCommit` коммит в USD:
```ts
const onAmountRangeCommit = (value: number[]) => {
  setFiltersValues((prev) => ({
    ...prev,
    amountFrom: displayToUsd(value[0], currency, rates),
    amountTo: displayToUsd(value[1], currency, rates),
  }));
};
```

- [ ] **Step 2: Проверить сборку**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Ручная проверка**

Run: `npm run dev`
Проверить: при валюте RUB слайдер фильтра показывает границы в рублях (≈ от 0 до 850 000), после применения фильтра таблица фильтруется по той же сумме в рублях.

- [ ] **Step 4: Commit**

```bash
git add src/features/transaction/filters/container/useContainer.tsx
git commit -m "feat(currency): amount filter slider in selected currency

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: CSV-экспорт в выбранной валюте

**Files:**
- Modify: `src/features/settings/data/model/useDataManagement.ts`

**Interfaces:**
- Consumes: `useAppearanceStore`, `useCurrencyRatesStore`, `formatAmount`.
- Produces: CSV-столбец `amount` в выбранной валюте.

- [ ] **Step 1: Конвертация в generateCsv**

В `src/features/settings/data/model/useDataManagement.ts`:

1. Импорты:
```ts
import { useAppearanceStore } from "@/features/settings/appearance";
import { formatAmount, useCurrencyRatesStore } from "@/entities/currency";
```
2. `generateCsv` принимает валюту и курсы:
```ts
function generateCsv(
  transactions: Transaction[],
  currency: Currency,
  rates: CurrencyRates | null,
): string {
  ...
  const rows = transactions.map((tx) =>
    [
      tx.date ? new Date(tx.date).toISOString().slice(0, 10) : "",
      tx.type,
      tx.category?.name ?? "",
      formatAmount(tx.amount, currency, rates),
      tx.description ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  ...
}
```
3. Типы для `Currency` / `CurrencyRates`:
```ts
import type { Currency } from "@/entities/settings";
import type { CurrencyRates } from "@/entities/currency";
```
4. В `useDataManagement`:
```ts
const currency = useAppearanceStore((s) => s.currency);
const rates = useCurrencyRatesStore((s) => s.rates);
```
5. В `exportToCsv`:
```ts
const csv = generateCsv(transactions, currency, rates);
```
и добавить `currency, rates` в зависимости `useCallback`:
```ts
}, [refetch, t, currency, rates]);
```

- [ ] **Step 2: Проверить сборку**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Ручная проверка**

Run: `npm run dev`
Проверить: «Настройки → Данные → Экспорт CSV» при выбранной RUB — в столбце amount суммы в рублях (`8 500 ₽`), Excel открывает без ломания строк (escapeCsv уже оборачивает в кавычки значения с запятыми).

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/data/model/useDataManagement.ts
git commit -m "feat(currency): export CSV amounts in selected currency

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: i18n-ключи + подпись «Курс от …» в Настройках + lint

**Files:**
- Modify: `src/i18n.js`
- Modify: `src/widgets/settings/container/useContainer.ts`
- Modify: `src/widgets/settings/ui/SettingsView.tsx`

- [ ] **Step 1: Добавить i18n-ключи**

В `src/i18n.js`:

- В блоке `en.translation` сразу после строки `settingsCurrency: "Currency",` (строка 192) добавить:
```js
ratesUpdatedOn: "Rates as of {{date}}",
```
- В блоке `ru.translation` сразу после строки `settingsCurrency: "Валюта",` (строка 392) добавить:
```js
ratesUpdatedOn: "Курс от {{date}}",
```

- [ ] **Step 2: Прокинуть hint в контейнер**

В `src/widgets/settings/container/useContainer.ts`:

1. Импорты:
```ts
import dayjs from "dayjs";
import { useCurrencyRatesStore } from "@/entities/currency";
```
2. Внутри хука:
```ts
const rates = useCurrencyRatesStore((s) => s.rates);
const ratesFetchedAt = useCurrencyRatesStore((s) => s.fetchedAt);
const ratesHint =
  currency !== "USD" && rates && ratesFetchedAt
    ? t("ratesUpdatedOn", { date: dayjs(ratesFetchedAt).format("DD.MM.YYYY") })
    : null;
```
3. Добавить в возвращаемый объект:
```ts
ratesHint,
```

- [ ] **Step 3: Показать hint в SettingsView**

В `src/widgets/settings/ui/SettingsView.tsx`:

1. В интерфейс `SettingsContainerProps` добавить поле:
```ts
ratesHint?: string | null;
```
2. В деструктуризацию `props` добавить `ratesHint`.
3. В appearance-табе, сразу после закрывающего `</div>` той `settings-row`, где находится селектор валюты (внутри `settings-card__section`, не внутри flex-строки), добавить:
```tsx
{ratesHint && (
  <div style={{ marginTop: 4 }}>
    <Typography.Text type="secondary" className="settings-row__hint">
      {ratesHint}
    </Typography.Text>
  </div>
)}
```

- [ ] **Step 4: Проверить сборку и линт**

Run: `npm run build` → Expected: PASS.
Run: `npm run lint` → Expected: PASS (без новых warning-ов).

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`
Проверить: при валюте RUB под селектором в Настройках подпись «Курс от 20.08.2026»; при USD подписи нет.

- [ ] **Step 6: Commit**

```bash
git add src/i18n.js src/widgets/settings
git commit -m "feat(currency): show exchange-rate date hint in settings

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Финальная проверка

- [ ] **Step 1: Полный прогон**

Run: `npm run build` → PASS
Run: `npm test` → PASS (все тесты, включая новые convert.test.ts)
Run: `npm run lint` → PASS

- [ ] **Step 2: Ручной smoke-тест по чек-листу**

- [ ] Смена валюты в Настройках мгновенно обновляет: баланс, плитки инсайтов, таблицу (строки + итог), графики (expenseChart/topCategories), отчёты (reportsHero/reportCard), LargestTransactions.
- [ ] Ввод новой транзакции в RUB → сохраняется в USD; при возврате в USD показывается исходная сумма.
- [ ] Редактирование не дрейфует (round-trip USD → display → USD).
- [ ] Офлайн: кэш курсов работает (значения конвертируются), подпись о дате курса видна.
- [ ] Нет кэша вовсе (чистый localStorage, офлайн): всё отображается в USD.
- [ ] CSV-экспорт — в выбранной валюте.
- [ ] Процентные карточки (savingsRate) не искажены.
- [ ] CSP не блокирует запрос к open.er-api.com (в DevTools нет CSP-ошибки).
