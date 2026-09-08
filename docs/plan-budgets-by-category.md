# Plan: Бюджеты по категориям

**PRD:** [prd-budgets-by-category.md](./prd-budgets-by-category.md)
**Дата:** 2026-09-08

## Ресурсы

- **PRD:** `docs/prd-budgets-by-category.md`
- **Спека (дизайн):** `docs/superpowers/specs/2026-09-08-budgets-by-category-design.md`
- **Мокап UI (эталон для реализации):** [`docs/superpowers/mockups/budgets-page.html`](./superpowers/mockups/budgets-page.html)

Правки вносятся в ветку `feat/budgets`. Каждая фаза даёт рабочий результат, можно остановиться после любой.

## Фазы реализации

### Фаза 1: Схема БД и GraphQL-слой бюджета (Tracer Bullet)
**Цель:** бюджеты хранятся и доступны через GraphQL API — минимальный рабочий путь данных.
**Затрагивает:** database, backend
**Задачи:**
- [ ] SQL-миграция `budgets`: `id`, `user_id` (FK `auth.users`), `category_id` (FK `categories` ON DELETE CASCADE), `limit_usd numeric CHECK (> 0)`, `created_at`/`updated_at`, `UNIQUE(user_id, category_id)`; применить в Nhost/Hasura.
- [ ] Права Hasura (role `user`) по образцу `categories`: select/update/delete — `user_id = X-Hasura-User-Id`; insert — preset `user_id`.
- [ ] Relationships: object `budgets.category → categories` (колонки `id, name, icon, type`); array `categories.budgets`.
- [ ] `entities/budget/api/graphql.ts`: `GetBudgets`, `InsertBudgetOne`, `UpdateBudgetByPk`, `DeleteBudgetByPk` (join `category { id name icon type }`).
- [ ] `entities/budget/model/types.ts` (`Budget`, `BudgetProgress`) + barrel `entities/budget/index.ts`.
**Тесты:** type-check `npm run build` (валидация TS-типов GraphQL-результатов); ручной smoke-query `GetBudgets` в Nhost GraphQL Console.
**Когда готова:** `npm run build` проходит; `GetBudgets` возвращает список бюджетов текущего пользователя.

### Фаза 2: Логика расчёта прогресса
**Цель:** чистая функция, которая по бюджетам и транзакциям считает `spent/ratio/status/remaining`.
**Затрагивает:** frontend
**Задачи:**
- [ ] `entities/budget/model/calculateBudgetProgress.ts`: `calculateBudgetProgress(budgets, transactions, referenceDate = new Date())`.
- [ ] Алгоритм: `spent = Σ amount` по EXPENSE-транзакциям категории за текущий календарный месяц; `ratio = spent / limit_usd`; статусы `< 0.8` ok / `0.8–1` warning / `≥ 1` danger; `remaining = limit - spent`.
- [ ] Экспорт из `entities/budget/index.ts`.
**Тесты:** vitest `calculateBudgetProgress.test.ts` — суммирует только EXPENSE текущего месяца; игнорирует INCOME и другие месяцы; пороги статусов; отрицательный `remaining` при перерасходе.
**Когда готова:** `npm test` проходит; функция покрыта юнит-тестами.

### Фаза 3: Управление бюджетом (features)
**Цель:** хуки получения данных и мутаций (создание/изменение/удаление лимита).
**Затрагивает:** frontend
**Задачи:**
- [ ] `features/budget/manage/model/useBudgets.ts`: query `GetBudgets` + `GET_TRANSACTIONS`, возвращает `BudgetProgress[]` через `calculateBudgetProgress` и мутации create/edit/delete.
- [ ] `features/budget/manage/model/useSetLimit.ts`: логика модалки — выбор категории, валидация суммы, `displayToUsd` на входе; чистая функция `buildBudgetVariables` (form → GraphQL variables).
- [ ] Barrel `features/budget/index.ts`.
**Тесты:** vitest `buildBudgetVariables.test.ts` — конвертация ввода в `limit_usd`, запрет `≤ 0`, категория для edit зафиксирована.
**Когда готова:** хуки создают/изменяют/удаляют бюджет через Apollo (ручная проверка на dev-сервере), `npm test` проходит.

### Фаза 4: UI страницы «Бюджеты»
**Цель:** страница `/budgets` со списком, прогрессом, статусами и модалкой — по мокапу.
**Затрагивает:** frontend
**Задачи:**
- [ ] `widgets/budgets/ui/BudgetsView.tsx`: список строк (иконка + имя категории, `Progress`, `spent / limit`, бейдж статуса, действия изменить/удалить), empty state «Добавить первый бюджет».
- [ ] `widgets/budgets/ui/BudgetFormModal.tsx`: `Select` EXPENSE-категорий без лимита + поле суммы (в валюте приложения); для edit категория зафиксирована, сумма предзаполнена.
- [ ] `widgets/budgets/container/BudgetsWidget.tsx` + `ui/BudgetsPageSkeleton.tsx` + barrel `widgets/budgets/index.ts`.
- [ ] `pages/budgets/` (`BudgetsPage.tsx`, `index.ts`) + route `/budgets` (ProtectedRoute, ErrorBoundary) в `src/main.tsx` + пункт сайдбара в `AppShell.tsx`.
- [ ] i18n-ключи (en/ru) из спекы в `src/i18n.js`: `budgets`, `budgetsSubtitle`, `addBudget`, `addFirstBudget`, `editBudget`, `deleteBudget`, `budgetLimit`, `budgetSpent`, `budgetRemaining`, `budgetOverBy`, `budgetCategory`, `budgetLimitRequired`, `budgetCategoryRequired`, `budgetsNoData`, `budgetsNoDataHint`.
**Эталон UI:** [`docs/superpowers/mockups/budgets-page.html`](./superpowers/mockups/budgets-page.html) — вёрстка, токены Aurora, статусы ok/warning/danger, модалка.
**Тесты:** `npm run build` + `npm run lint`; ручной smoke-тест страницы (в проекте нет React Testing Library — компонентные тесты не вводятся).
**Когда готова:** страница открывается по `/budgets`, список и модалка работают, интерфейс переведён.

### Фаза 5: Сводка, валюты и приёмка
**Цель:** финальная полировка и закрытие всех критериев PRD.
**Затрагивает:** frontend
**Задачи:**
- [ ] Сводка месяца: «итого потрачено X из Y» (сумма `spent`/`limit` по всем бюджетам).
- [ ] Валютное форматирование через `formatAmount` + `useAppearanceStore`/`useCurrencyRatesStore` (USD → валюта приложения); при недоступности курсов — без конвертации.
- [ ] Текст статусов (не только цвет): «превышен на N» (danger), бейджи warning/danger.
- [ ] Адаптивность (по мокапу, без горизонтального скролла), skeleton при загрузке.
- [ ] Финальная проверка: `npm run build`, `npm run lint`, `npm test` без ошибок.
**Когда готова:** все 8 критериев готовности из PRD выполнены.
