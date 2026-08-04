# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

## Language

Always communicate with the user in Russian.
All explanations, progress updates, plans and summaries must be written in Russian.
Code, identifiers, API names, commit messages requested by the project, and code comments should follow the project's existing language conventions.
Do not translate code or technical terms when it would make them less clear.

- `npm run dev` — Vite dev server on port 5173. Restart after changing `.env.development`.
- `npm run build` — `tsc -b && vite build` (type-checks then builds). Expect type-check failures until known issues are fixed (see Known Issues).
- `npm run lint` — `eslint .` (flat config, ESLint 9).
- `npm run preview` — `vite preview`.
- `npm run mock:graphql` — `tsx mock-server/server.ts`, mock GraphQL server on port 4000. Only needed for the legacy fallback path; Nhost is the primary backend.
- **No test framework is configured.** No vitest, jest, test scripts, or `*.test.*` files. Do not run or write tests without first setting one up.

## Stack

React 19 + Vite 8 + TypeScript 6, Ant Design 6 (primary `#aa3bff`, border radius 10px), react-router-dom 7, Apollo Client 4, i18next (en/ru, inline translations in `src/i18n.js`), Zustand 5, ECharts 6 via echarts-for-react, dayjs, emoji-picker-react, PWA (vite-plugin-pwa). Backend: **Nhost** (Auth + Hasura GraphQL + Postgres).

## Environment

`.env.development` keys:
- `VITE_NHOST_REGION=eu-central-1`
- `VITE_NHOST_SUBDOMAIN=fwbpueyfmtoabaoymuvu`
- `VITE_GRAPHQL_URL=http://localhost:4000/graphql` — fallback used when Nhost env is absent.

## Architecture: Feature-Sliced Design (FSD)

Layers under `src/`: `pages/`, `widgets/`, `features/`, `entities/`, `shared/`, plus `app/providers/`.

### Conventions

- **Logic/UI split**: business logic in `features/*/model/use*.ts` or `widgets/*/container/useContainer.ts`. UI is "dumb" — named `*View.tsx`, `*PageView.tsx`, or `index.tsx`.
- **Pages** are thin route-level wrappers, each wrapped in `<ErrorBoundary>` in main.tsx.
- **Widgets** export as objects with a `.Widget` member: `export const LangSwitcher = { Widget: Container }` then `<LangSwitcher.Widget />`. Chart widgets (ExpenseChart, IncomeVsExpenceChart, MountlyExpenseChart, TopCategories, LargestTransactions) and Categories all follow this pattern.
- **Entities** own their GraphQL operations (`api/graphql.ts`), types (`model/types.ts`), and Zustand stores.
- **Barrel exports**: every directory has `index.ts` re-exporting its public API. Import via the barrel.
- Path alias `@` → `src/` (configured in vite.config.ts and tsconfig.app.json).
- SCSS modules co-located (`*.module.scss`); global styles in App.css / index.css.

## GraphQL

- **No codegen.** Operations are hand-written `gql` template literals in `entities/{transaction,category}/api/graphql.ts`. No schema file, no graphql-codegen. Types are manual.
- Hasura-style operation names: `insert_transactions_one`, `update_transactions_by_pk`, `delete_transactions_by_pk`.
- Transactions expose nested `category { id name icon }`.
- Apollo client factory in `src/app/providers/apollo.ts`: builds endpoint from Nhost subdomain+region env vars (fallback to `VITE_GRAPHQL_URL` then `/graphql`), `InMemoryCache` persisted to localStorage via `cache-persist-4-apollo`, auth via SetContextLink calling `getAccessToken` (which calls `nhost.refreshSession(60)`). On creation it calls `applyQueueToRestoredCache(client)` to drop pending offline deletes.
- `optimizeDeps.exclude` in vite.config.ts includes `@apollo/client` and `@apollo/client/react`.
- PWA workbox: NetworkFirst for `/graphql`, CacheFirst for static assets.

## Providers & Routing

Provider nesting order (from main.tsx, outer to inner):
`AppAntdProvider → AuthProvider → AppApolloProvider → BrowserRouter`

- Protected routes (redirect to `/auth/login` when unauthenticated): `/` (DashboardPage), `/reports` (ReportsPage), `/categories` (CategoriesPage).
- Public auth routes under `<AuthLayout />`: `/auth`, `/auth/login`, `/auth/register`, `/auth/verify`.
- Legacy route `/verify` → VerifyPage (compatibility with old verification emails).

## Auth (Nhost, @nhost/nhost-js v4)

- `AuthProvider.tsx` exposes context: `user`, `session`, `isAuthenticated`, `isLoading`, `nhost`. Cross-tab session sync via `nhost.sessionStorage.onChange()`, periodic refresh every 10 min, plus refresh on `visibilitychange`/`focus`.
- **Login**: `nhost.auth.signInEmailPassword()`.
- **Register**: PKCE flow — `generatePKCEPair`, verifier stored in `sessionStorage` key `nhost_pkce_verifier`, `redirectTo: ${origin}/auth/verify`.
- **Verify**: reads `code` from URL, retrieves PKCE verifier, calls `nhost.auth.tokenExchange()`, redirects to `/`.
- **Logout**: `nhost.auth.signOut()` + `purgeApolloCache()` + navigate to `/` (wired in AppShell).
- Allowed Redirect URLs must include `http://localhost:5173/auth/verify` and `http://localhost:5173/verify`.

## State Management

Zustand stores:
- `useTransactionsStore` (`entities/transaction/model/store.ts`) — `transactions` + `allTransactions`.
- `useTransactionFiltersStore` (`features/transaction/filters/model/store.ts`) — filter object with `setFilters`/`resetFilters`.
- `useOfflineQueue` (`shared/lib/offlineQueue.ts`) — persisted to localStorage key `offline-mutation-queue`.
- Pure filtering logic is in `entities/transaction/model/filterTransactions.ts`.
- Apollo cache is the primary data store for GraphQL; mutations do optimistic updates.

## Offline-first

- `useOnlineStatus.ts` — tracks `navigator.onLine` via online/offline events.
- `offlineQueue.ts` — Zustand queue persisted to localStorage; entries `{ id, type: 'add'|'edit'|'delete', variables, timestamp }`.
- `syncOfflineQueue.ts` — replays the queue on reconnect; `applyQueueToRestoredCache(client)` drops pending deletes from restored cache.
- `OfflineSyncProvider.tsx` wraps the app; on online event with non-empty queue triggers sync with toasts.
- `useTransactionMutations.ts`: each mutation catches `!navigator.onLine`, writes optimistically with temp `offline-*` IDs, pushes to queue, shows "Saved offline" toast.
- `AppShell.tsx` shows an amber banner when offline (pending count) and a blue banner when online with pending sync count.

## i18n

Config in `src/i18n.js` (plain JS). `en` and `ru` translations are **inline** in this file under `resources.{en,ru}.translation` — there is no `locales/` directory. `fallbackLng: 'en'`, `load: 'languageOnly'`. Usage: `const { t } = useTranslation(); t("key")`. Switching via `LangSwitcher` widget calling `i18n.changeLanguage()`.

## Charts

ECharts 6 via echarts-for-react. Five chart widgets following the `.Widget` object-export pattern: ExpenseChart, IncomeVsExpenceChart, MountlyExpenseChart, TopCategories, LargestTransactions. ECharts does not use Ant Design charts.

## Known Issues

- Two known unfixed TS errors that will cause `npm run build` to fail type-check: `src/widgets/largestTransactions/ui/index.tsx` (`null` vs `string`) and `src/widgets/topCategories/model/lib.ts` (`Category | undefined`).
- tsconfig.app.json is strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly`. Build compiles `src` but excludes `mock-server` and `src/mock-server`.
- Deleting a category with remaining transactions may fail due to FK `ON DELETE RESTRICT`.
- Strict CSP in index.html whitelists specific Nhost domains, localhost:4000, and WebSocket.
- `useDebounce` lives in `shared/hooks/UseDebounce.ts` (capitalized filename) but exports lowercase `useDebounce`; returns `{ debouncedValue }`.
- `HANDOFF.md` (Russian) contains deeper backend/schema context: DB schema, Hasura permissions, system vs user categories, and a task list. Consult it for backend details.
