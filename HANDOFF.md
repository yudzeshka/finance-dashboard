# Handoff: `finance-dashboard` (контекст для следующего агента)

## Проект
- **Stack**: React 19 + Vite + TypeScript, Ant Design 6, react-router-dom 7, Apollo Client 4, i18next (en/ru), Zustand
- **Backend**: Nhost (Auth + Hasura GraphQL + Postgres)
- **Архитектура**: FSD-подобная — `pages/`, `widgets/`, `features/`, `entities/`
- **Паттерн**: логика в `features/*/model/use*.ts` или `widgets/*/container/useContainer.ts`, UI — dumb `*View.tsx` / `*PageView.tsx`
- **Важно**: mock GraphQL server больше не нужен для транзакций/категорий

## Env / Dev
`.env.development` (без угловых скобок):

```env
VITE_NHOST_REGION=eu-central-1
VITE_NHOST_SUBDOMAIN=fwbpueyfmtoabaoymuvu
VITE_GRAPHQL_URL=http://localhost:4000/graphql  # fallback, если нет Nhost env
```

После смены `.env` — перезапуск `npm run dev`.

## Провайдеры и auth (src/main.tsx)
Порядок провайдеров:
`AppAntdProvider → AuthProvider → AppApolloProvider → BrowserRouter`

### AuthProvider
- `createClient`, `session`, `nhost`, `useAuth()`

### AppApolloProvider
- Apollo endpoint: `https://{subdomain}.graphql.{region}.nhost.run/v1`
- Заголовок: `Authorization: Bearer <accessToken>`
- Перед запросом: `nhost.refreshSession(60)`

### ProtectedRoute / маршруты
- Защищены: `/`, `/reports`
- Публичные: `/auth/*`, `/verify`

Auth-flow:
- Роуты: `/auth`, `/auth/login`, `/auth/register`, `/auth/verify`, дубль `/verify` (совместимость со старыми письмами)
- Register: PKCE, `redirectTo: ${origin}/auth/verify`
- Verify: `tokenExchange`, редирект на `/`
- Nhost Allowed Redirect URLs:
  - `http://localhost:5173/auth/verify`
  - `http://localhost:5173/verify`
- Logout в `AppShell` через `nhost.auth.signOut` — проверить end-to-end

## GraphQL / транзакции (Nhost)
Hasura-style операции в `src/entities/transaction/api/graphql.ts`:
- `transactions`
- `insert_transactions_one`
- `update_transactions_by_pk`
- `delete_transactions_by_pk`

Категории в транзакциях:
- `category { id name icon }` (relationship)

### БД: таблицы и связи
`transactions`
- `user_id → auth.users`, permissions по `X-Hasura-User-Id`
- `category_id → categories`

`categories` (одна таблица)
- **System**: `user_id IS NULL` — общие для всех, нельзя edit/delete
- **User**: `user_id = auth user` — CRUD только свои
- Колонки: `id, name, icon, type (transaction_type), user_id, created_at`

Удалён старый constraint `categories_name_key`; частичные unique:
- system: unique `name` where `user_id IS NULL`
- user: unique `(user_id, name)` where `user_id IS NOT NULL`

### Hasura permissions: `categories` (role `user`)
- **Select**:
  - check: `_or: [user_id IS NULL, user_id = X-Hasura-User-Id]`
  - columns: `id, name, icon, type, user_id`
- **Insert**:
  - columns: `name, icon, type`
  - preset: `user_id = X-Hasura-User-Id`
- **Update**:
  - check: `user_id = X-Hasura-User-Id`
  - columns: `name, icon, type`
- **Delete**:
  - check: `user_id = X-Hasura-User-Id`

Важно:
- В GraphQL Console запросы под `admin` **не применяют preset** `user_id` → вставка даёт `user_id = null`.
- Тестировать под `user` + JWT.

Relationships на `transactions`: `category`, `user`.

## Страница категорий (готово)
- Route: `/categories`, пункт в сайдбаре
- Структура:
  - `pages/categories/ui/CategoriesPage.tsx` — тонкая обёртка → `Categories.Widget`
  - `widgets/categories/` — container + dumb UI
- UI: таблица (name, type, emoji, count транзакций, actions), модалка с `emoji-picker-react`
- Логика: `useContainer.ts` — `GET_CATEGORIES`, `INSERT/UPDATE/DELETE` через Apollo, `isSystem = user_id === null`
- GraphQL: `src/entities/category/api/graphql.ts`
- Удаление категории с привязанными транзакциями может падать из‑за FK `ON DELETE RESTRICT`.

## Skeleton / loading
- Ant Design Skeleton, не текст `Loading...`
- Есть скелетоны: dashboard, report cards, top categories, largest transactions
- `Skeleton.Node` не растягивается на 100% height без обёртки `flex: 1` + styles на root/content

## Стили / layout
- Исправлен лишний body-scroll: `#root/body/dashboard-shell` на `height: 100svh`, скролл в `.dashboard-content`
- `dashboard-header/footer`: `box-sizing: border-box` для border
- Reports: `ReportsPage.module.scss` — фиксированная высота grid

## Известные TS-ошибки (не трогали)
- `src/widgets/largestTransactions/ui/index.tsx` — `null` vs `string`
- `src/widgets/topCategories/model/lib.ts` — `Category | undefined`

## Что логично делать дальше
- **E2E**: регистрация → verify → login → dashboard → categories CRUD
- **System categories**: обновить Salary и др.: `UPDATE ... SET type = 'INCOME' WHERE user_id IS NULL AND name = 'Salary'`
- **UX/i18n**: i18n для ошибок категорий; обработка delete при FK constraint (понятное сообщение)
- **Logout**: полный flow в `AppShell`
- **Транзакции**: фильтры/формы — убедиться, что `GET_CATEGORIES` с `type/user_id` не ломает типы
- **Dev**: seed/mock server не использовать для dev с Nhost

## Dev
```bash
npm run dev   # порт 5173, после смены env — перезапуск
```

## Полезные ссылки
- Nhost React tutorial
- GraphQL operations (part 4)
- User authentication (part 3)

