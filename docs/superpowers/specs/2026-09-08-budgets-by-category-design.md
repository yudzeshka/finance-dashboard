# Бюджеты по категориям — дизайн

Дата: 2026-09-08
Статус: утверждён

## Цель

Дать пользователю планировать расходы: задавать месячный лимит на категорию и видеть, сколько уже потрачено относительно лимита. Сейчас приложение умеет фиксировать траты (транзакции), но не умеет планировать.

## Зафиксированные решения

- **Модель лимита** — повторяющийся месячный лимит на категорию (задаётся один раз, действует каждый месяц, пока его не изменят). Без поля «месяц» в данных — «расход за месяц» считается на лету.
- **Хранилище** — отдельная таблица `budgets` в Nhost/Hasura (подход A). Лимиты синхронизируются между устройствами.
- **Scope** — лимиты только для EXPENSE-категорий.
- **Период** — текущий календарный месяц.
- **Порог warning** — 80% от лимита.
- **Размещение** — отдельная страница «Бюджеты» (пункт сайдбара + route `/budgets`).

## Схема БД и миграция

```sql
CREATE TABLE budgets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  limit_usd   numeric NOT NULL CHECK (limit_usd > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);
```

- `limit_usd` в USD — как и `transactions.amount` (всё приложение хранит деньги в USD и конвертирует на показ).
- `ON DELETE CASCADE` на `category_id`: при удалении категории бюджет уходит вместе с ней. Сама категория защищена FK транзакций, поэтому отдельную ошибку для бюджетов не плодим.

### Hasura permissions (role `user`)

По образцу `categories`:

| Операция | Проверка / preset | Столбцы |
|----------|-------------------|---------|
| select   | `user_id = X-Hasura-User-Id` | `id, category_id, limit_usd, user_id` |
| insert   | preset `user_id = X-Hasura-User-Id` | `category_id, limit_usd` |
| update   | `user_id = X-Hasura-User-Id` | `category_id, limit_usd` |
| delete   | `user_id = X-Hasura-User-Id` | — |

### Relationships

- `budgets.category_id → categories.id` — object relationship `category`.
- `categories.budgets` — array relationship (обратная).

## GraphQL-операции (`entities/budget/api/graphql.ts`)

```graphql
query GetBudgets {
  budgets {
    id
    category_id
    limit_usd
    category { id name icon type }
  }
}

mutation InsertBudgetOne($categoryId: uuid!, $limitUsd: numeric!) {
  insert_budgets_one(object: { category_id: $categoryId, limit_usd: $limitUsd }) {
    id category_id limit_usd
    category { id name icon type }
  }
}

mutation UpdateBudgetByPk($id: uuid!, $limitUsd: numeric!) {
  update_budgets_by_pk(pk_columns: { id: $id }, _set: { limit_usd: $limitUsd }) {
    id category_id limit_usd
    category { id name icon type }
  }
}

mutation DeleteBudgetByPk($id: uuid!) {
  delete_budgets_by_pk(id: $id) { id }
}
```

## Модель данных (TS-типы)

```ts
export type Budget = {
  id: string;
  category_id: string;
  limit_usd: number;
  category: Category; // { id name icon type }
};

export type BudgetProgress = {
  budget: Budget;
  spent: number;     // USD
  limit: number;     // USD
  ratio: number;     // spent / limit
  remaining: number; // limit - spent (может быть < 0)
  status: "ok" | "warning" | "danger";
};
```

## Логика расчёта (`entities/budget/model/calculateBudgetProgress.ts`)

Чистая функция, без бэкенда:

```ts
export function calculateBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): BudgetProgress[]
```

Алгоритм для каждого бюджета:

1. `spent = Σ amount` по транзакциям, где `category.id === budget.category_id`, `type === "EXPENSE"` и `date` в текущем календарном месяце.
2. `ratio = spent / limit_usd`.
3. `status`: `ratio < 0.8` → `ok`; `0.8 ≤ ratio < 1` → `warning`; `≥ 1` → `danger`.
4. `remaining = limit_usd - spent`.

Мультивалютность (переиспользуем `entities/currency`):

- Показ `spent`/`limit` — через `formatAmount` (USD → валюта приложения).
- Ввод лимита — через `displayToUsd` (валюта приложения → USD).
- Курсы недоступны → суммы без конвертации (как в остальном приложении, с подсказкой).

## UI — страница «Бюджеты»

- Route `/budgets` (защищённый), пункт сайдбара «Бюджеты».
- Список **активных бюджетов** (только категории с лимитом):
  - строка: иконка + название категории, `Progress`-бар, «spent / limit», бейдж статуса, действия «изменить»/«удалить»;
  - статус: `ok` — штатный цвет, `warning` — amber, `danger` — red + «превышен на …».
- Шапка: заголовок «Бюджеты · <месяц год>», кнопка «Добавить бюджет».
- Модалка «Добавить бюджет»: `Select` по EXPENSE-категориям без лимита + поле суммы (в валюте приложения). «Изменить» — та же модалка с предзаполненной суммой (категория зафиксирована).
- Пустое состояние → «Добавить первый бюджет».
- Сводка в шапке (опционально, можно отложить): «итого потрачено X из Y».

## FSD-раскладка файлов

```
entities/budget/
  api/graphql.ts
  model/types.ts
  model/calculateBudgetProgress.ts
  index.ts
features/budget/
  manage/model/useBudgets.ts        # query budgets + транзакции из Apollo cache, computed progress
  manage/model/useSetLimit.ts       # логика модалки (create/edit)
widgets/budgets/
  container/BudgetsWidget.tsx
  ui/BudgetsView.tsx
  ui/BudgetFormModal.tsx
  ui/BudgetsPageSkeleton.tsx
  index.ts
pages/budgets/
  index.ts
  ui/BudgetsPage.tsx
```

Плюс:

- регистрация route в `src/main.tsx` (внутри `<ProtectedRoute>`, обёрнуто в `<ErrorBoundary>`);
- пункт в `AppShell.tsx` (иконка + label);
- i18n-ключи (en/ru).

## i18n-ключи

`budgets`, `budgetsSubtitle`, `addBudget`, `addFirstBudget`, `editBudget`, `deleteBudget`, `budgetLimit`, `budgetSpent`, `budgetRemaining`, `budgetOverBy`, `budgetCategory`, `budgetLimitRequired`, `budgetCategoryRequired`, `budgetsNoData`, `budgetsNoDataHint`.

## Краевые случаи

- **Нет бюджетов** → empty state с CTA.
- **Перерасход** (`ratio ≥ 1`) → danger + «превышен на …».
- **Курсы валют недоступны** → суммы без конвертации (существующий механизм подсказки в настройках).
- **Офлайн** → бюджеты online-only в v1 (как категории — они не в offline-очереди).
- **Лимит 0 / отрицательный** → запрещён `CHECK (limit_usd > 0)` + валидация формы.

## Вне scope (follow-ups)

- Навигация по прошлым месяцам (лимит общий, меняется только окно транзакций).
- Общий месячный бюджет (не по категориям).
- История изменения лимитов.
- Снапшоты лимитов на месяц (для точной истории).
- Уведомления о приближении к лимиту.
