# Спецификация: Редизайн Dashboard — «Aurora Finance» (Вариант A)

**Дата:** 2026-08-04
**Статус:** Ожидает одобрения пользователя
**Страница:** `/` (маршрут «Главная» — таблица транзакций)
**Скиллы:** ui-ux-pro-max (встроенные правила, Python недоступен), superpowers:brainstorming
**Анимация:** Framer Motion `^12.43.0` (уже установлен, нигде не используется)
**Тема:** ТОЛЬКО светлая (темный режим не затрагивается — остаётся как есть через `prefers-color-scheme`)

## 1. Цель и контекст

Полный редизайн страницы `/` (Dashboard) — список транзакций с фильтрами. Текущая страница рендерит единый `<TransactionsWidget>` внутри `<AppShell>` (Sider 240px + Header 72px + Content max-width 1320px). Виджет содержит панель фильтров и Ant Design `<Table>`.

Цель редизайна: премиальный, динамичный, современный финансовый dashboard с акцентом на баланс-визуализацию и плавные анимации. Страница `/reports` (графики) НЕ затрагивается.

**Подпись дизайна (signature):** Hero-блок баланса с count-up анимацией (0 → значение при mount) и мягким aurora-ореолом.

## 2. Ограничения кодовой базы (проверено)

- `DashboardPage` (`src/pages/dashboard/ui/DashboardPage.tsx`) в нормальном режиме возвращает `<TransactionsWidget ... filtersSlot={<TransactionsFiltersWidget />} />`. AppShell рендерится ВНУТРИ `TransactionsWidget` (`src/widgets/transactions/ui/TransactionsWidget.tsx:61-68`).
- Хук `useTransactionsDashboard` (`src/features/transaction/manage/model/useTransactionsDashboard.ts`) возвращает: `transactions` (уже отфильтрованы, без сортировки), `categoryOptions`, `loading`, `error`, `isModalOpen`, `modalTitle`, `confirmLoading`, `form`, `openCreate`, `openEdit`, `closeModal`, `submit`, `remove`, `deleteLoading`.
- **Полный набор транзакций** `allTransactions` доступен через Zustand-стор `useTransactionsStore` (`src/entities/transaction/model/store.ts`) — нужен для расчёта агрегатов баланса/дохода/расхода за период (т.к. `transactions` уже отфильтрованы).
- Тип `Transaction` (`src/entities/transaction/model/types.ts`): `{ id: string; amount: number; type: "INCOME"|"EXPENSE"; category: Category; date?: string|null; description?: string|null }`.
- Тип `Category` (`src/entities/category/model/types.ts`): `{ id; name; icon (emoji string); type: "INCOME"|"EXPENSE"; user_id }`.
- Фильтры: Zustand `useTransactionFiltersStore` (`src/features/transaction/filters/model/store.ts`) — `{ search, type, dateFrom, dateTo, category, amountFrom, amountTo }`. UI: `TransactionsFiltersWidget` → `TransactionsFilters` (поиск-инпут + кнопка фильтров-модалка + кнопка сброса).
- Существующие расчёты: `cardsConfig.tsx` (balance = sum(INCOME)−sum(EXPENSE), income, expense, averagePerDay) и `calculateReportCards.ts` (с дельтой vs предыдущий период). Стоит переиспользовать логику дельты.
- Спарклайн-агрегация по дням: `getTransactionsByMonth` в `src/widgets/mountlyExpenseChart/model/lib.ts` — группирует по дню, суммирует amount. Можно обобщить для спарклайна баланса за 30 дней.
- Ant Design `<Table>` колонки (нынешние): description, type, amount, category (emoji+name), date (DD.MM.YYYY), actions (delete/edit). Summary: total = sum(INCOME)−sum(EXPENSE). rowClassName подсвечивает доход/расход.
- AppAntdProvider: `colorPrimary "#aa3bff"`, `borderRadius 10`, `fontFamily system-ui`. **Нет darkAlgorithm** — Ant-компоненты всегда светлые (из MEMORY.md).
- i18n: ключи `balance`, `totalIncome`, `totalExpense`, `averagePerDay`, `transactions`, `addTransaction`, `search`, `filters`, `clear`, `apply`, `income`, `expense`, `category`, `date`, `description`, `amount`, `actions`, `total` — УЖЕ есть. Новые ключи нужны для: hero/insights/period-меток.
- `#root` имеет `overflow:hidden` глобально — контент AppShell скроллится внутри `.dashboard-content` (`overflow:auto`).

## 3. Дизайн-токены

Новые semantic CSS-переменные (добавить в `:root` в `src/index.css`, НЕ трогать существующие `--accent`/`--bg`/`--text` чтобы не сломать остальные страницы). Префикс `--aurora-` для изоляции:

**Поверхности:**
- `--aurora-surface: #F7F5FB` — фон страницы (лавандовый)
- `--aurora-surface-card: #FFFFFF` — карточки/плитки
- `--aurora-surface-elevated: #FFFFFF` — hero (приподнят тенью)

**Акцент и семантика:**
- `--aurora-accent: #7C3AED` — фиолетовый акцент (более глубокий чем `#aa3bff`)
- `--aurora-accent-soft: #EDE9FE` — акцентный фон
- `--aurora-success: #0E9F6E` — доходы/позитив (изумруд)
- `--aurora-success-soft: #D1FAE5`
- `--aurora-danger: #E0457B` — расходы/негатив (малиновый, premium)
- `--aurora-danger-soft: #FCE7F3`
- `--aurora-text: #1E1B2E` — основной текст (графит с фиолетовым подтоном)
- `--aurora-text-secondary: #6B6680` — вторичный
- `--aurora-border: #E8E4F0`
- `--aurora-shadow-color: rgba(76, 29, 149, 0.08)`

**Радиусы:** 16px (карточки), 12px (кнопки/инпуты), 999px (бейджи/чипы).
**Тени:**
- `--aurora-shadow-sm: 0 1px 2px var(--aurora-shadow-color)`
- `--aurora-shadow-md: 0 4px 12px var(--aurora-shadow-color)`
- `--aurora-shadow-lg: 0 12px 32px var(--aurora-shadow-color)` (hero aurora-ореол)

**Контраст (проверка):** `--aurora-text #1E1B2E` на `#FFFFFF` = 14.8:1 (AAA). `--aurora-text-secondary #6B6680` на `#FFFFFF` = 5.9:1 (AA). `--aurora-accent #7C3AED` на `#FFFFFF` = 5.7:1 (AA). `--aurora-danger #E0457B` на `#FFFFFF` = 4.0:1 — для крупных сумм (≥24px, large-text 3:1 ОК) и иконок; для мелкого текста расходов использовать `--aurora-text` с danger-иконкой. `--aurora-success #0E9F6E` на `#FFFFFF` = 3.4:1 — аналогично, крупные суммы ОК, мелочь через иконку+текст.

## 4. Типографика

Шрифты подключить через Google Fonts (index.html `<link>` или CSS `@import`):
- **Sora** (display): 600/700. Баланс, крупные числа. `letter-spacing: -0.02em`.
- **Inter** (body/UI): 400/500/600.

Типо-шкала: 48 (баланс hero) / 28 (insight-числа) / 20 / 18 (заголовки секций) / 15 (body) / 13 / 12 (labels uppercase, `letter-spacing: 0.04em`).

**`font-variant-numeric: tabular-nums`** для ВСЕХ чисел: баланс, суммы в таблице, insight-числа, даты-числа — предотвращает смещение layout при count-up и обновлениях.

Ant Design `ConfigProvider` (`AppAntdProvider`) — добавить `fontFamily` с Inter; `colorPrimary` пока оставить `#aa3bff` (общий для app) — на странице Dashboard используется `--aurora-accent` в custom CSS, Ant-кнопка primary в фильтрах остаётся brand-фиолетовой (приемлемо, не конфликтует). Решение: оставить Ant `colorPrimary` как есть, чтобы не сломать `/reports`, `/categories`, auth.

## 5. Layout страницы (внутри AppShell Content)

Структура (вертикально, max-width 1320px унаследован от `.dashboard-contentInner`):

```
[Hero Balance]            ← большая карточка, signature
[Доходы] [Расходы] [Крупнейшая]   ← 3 insight-плитки, grid 3-col
[Панель фильтров + CTA]   ← поиск/селекты/«+ Добавить»
[Таблица транзакций]      ← floating card
```

### 5.1. Hero Balance
- Карточка `--aurora-surface-elevated`, radius 16, `--aurora-shadow-lg`, padding 32px, `position: relative; overflow: hidden`.
- **Aurora-ореол:** 2 радиальных градиента (accent-soft + success-soft), `position: absolute`, opacity ~0.5, за контентом, НЕ кликабельны. Плавно анимируются (см. motion).
- Слева: eyebrow-label «Текущий баланс» (12px uppercase, `--aurora-text-secondary`). Под ним — баланс (Sora 48px, `--aurora-text`, tabular-nums, count-up при mount). Под ним — дельта-строка: стрелка ↑/↓ + «+12,4% за 30 дней» (success/danger цвет, 13px). Если данных за предыдущий период нет — скрыть дельту.
- Справа: мини-спарклайн баланса за 30 дней (inline SVG ~180×56px, линия `--aurora-success` с area-градиентом до прозрачности). `role="img"` + `aria-label` с текстовым описанием тренда.
- Источник данных: `allTransactions` из `useTransactionsStore`, агрегация по дням (переиспользовать/обобщить `getTransactionsByMonth`). Баланс = running sum (кумулятивный) по дням.

### 5.2. Insight-плитки (grid, gap 16px)
3 плитки, каждая `--aurora-surface-card`, radius 16, `--aurora-shadow-sm`, padding 20px:
1. **«Доходы · 30 дней»** — `+58 200 ₽` (success, Sora 28px, tabular-nums) + мини-спарклайн-стрелка.
2. **«Расходы · 30 дней»** — `−15 620 ₽` (danger, Sora 28px) + спарклайн.
3. **«Крупнейшая транзакция»** — `🛒 Продукты` (имя категории) + `−3 450 ₽` (danger). Emoji-иконка категории в круге `--aurora-accent-soft`.
- Hover-lift: `whileHover={{ y: -2 }}`, тень → `--aurora-shadow-md`. `cursor: default` (не кликабельны в MVP; будущий drill-down — out of scope).
- Адаптив: <768px → 1 колонка.

### 5.3. Панель фильтров
Переиспользовать `TransactionsFiltersWidget` (поиск + кнопка фильтров-модалка + сброс), но обернуть в `--aurora-surface-card`, radius 12, padding 12px. Primary CTA «+ Добавить» (`openCreate`) — кнопка `--aurora-accent` заливка, белый текст, radius 12, min-height 40px (≥44px touch target с padding). Одна primary CTA на экран (правило `primary-action`).

### 5.4. Таблица транзакций
Переиспользовать `TransactionsTable` (Ant Design `<Table>`), обёрнутый в floating-карточку (`--aurora-surface-card`, radius 16, `--aurora-shadow-sm`, overflow hidden).
- Колонки сохранить: category (emoji+name), description, date (DD.MM.YYYY), amount (right-aligned, tabular-nums, success для INCOME/danger для EXPENSE), actions.
- Убрать колонку `type` (избыточна — цвет суммы + знак уже несут сигнал; но оставить `aria-label`/`title` со словом Income/Expense для скринридеров и `aria-sort`).
- Сумма: `+3 450,00 ₽` / `−3 450,00 ₽` со знаком, tabular-nums.
- rowClassName подсветку доход/расход — заменить с инлайн-rgba на `--aurora-success-soft`/`--aurora-danger-soft` очень низкой opacity (0.04) ИЛИ убрать (оставить только цвет суммы). Решение: убрать row-подсветку, оставить цвет суммы+знак — чище. Hover-row: `--aurora-accent-soft` 30%.
- Action-иконки (edit/delete): показывать всегда на мобильных (hover недоступен), при hover на десктопе — плавное появление через `AnimatePresence` (opacity+scale). Icon-only buttons → `aria-label` (`t("editTransaction")`, `t("delete")`). Touch target ≥44px (padding). Delete → `--aurora-danger` цвет + confirm-dialog (уже есть в `useTransactionMutations`? — проверить, если нет — добавить Popconfirm).
- Summary (total) сохранить: «Итого: 42 580,00 ₽», Sora 16px, tabular-nums.
- Пагинация: сохранить Ant `pageSize: 10, showSizeChanger`. Добавить staggered-вход строк (см. motion).
- Empty state: если `transactions.length === 0` — дружелюбное сообщение + CTA «Добавить первую транзакцию» (правило `empty-states`).
- Сортировка: сохранить client-side sorters (date, amount, category).

## 6. Framer Motion — спецификация анимаций

Общие motion-токены (вынести в константы, напр. `src/shared/lib/motion.ts`):
- `durationEnter: 0.22` (220ms)
- `durationExit: 0.14` (140ms) — exit быстрее enter (правило `exit-faster-than-enter`)
- `easeOut: [0.16, 1, 0.3, 1]` (easeOutExpo-ish)
- `spring: { stiffness: 120, damping: 18 }` — для физических feedback
- `springSnappy: { stiffness: 300, damping: 24 }` — для hover

**Все анимации обёрнуты в проверку `prefers-reduced-motion`** — через `useReducedMotion()` из framer-motion: если reduced, анимации мгновенные/отключены (правило `reduced-motion`).

| Элемент | Анимация | Детали |
|---|---|---|
| **Hero баланс (count-up)** | `useMotionValue(0)` → `animate(0, value, {duration:1.2, ease})` + `useTransform` в форматтер ₽. Reduced: мгновенно показать значение. | Signature. Respects reduced-motion. |
| **Aurora-ореол** | `animate` infinite: x/y ±20px, opacity 0.5↔0.8, `duration: 8s, easeInOut, repeat: Infinity`. Reduced: статично. | `transform`/`opacity` only (правило `transform-performance`). |
| **Insight-плитки (вход)** | `staggerChildren: 0.05, delayChildren: 0.1`; variants hidden `{opacity:0, y:16}` → visible `{opacity:1, y:0}`, spring. | Правило `stagger-sequence` 30–50ms. |
| **Insight-плитки (hover)** | `whileHover={{ y: -2 }}`, springSnappy. | `scale-feedback`/hover-lift. |
| **Фильтры (вход)** | stagger чипов 30ms, opacity+slide. | |
| **Таблица строки (вход)** | stagger по строкам 30–40ms (cap на первых 10 — не анимировать хвост пагинации), opacity+y. | `stagger-sequence`. Не блокировать input (`no-blocking-animation`). |
| **Action-иконки** | `AnimatePresence`: enter opacity+scale 0.8→1 (0.2s), exit opacity (0.12s, быстрее). На мобильных — всегда видимы. | `exit-faster-than-enter`. |
| **Hero-карточка (вход)** | opacity+y(12) → 0, 0.3s easeOut, delay 0.05. | |
| **Дельта-строка** | Появляется после count-up (delay ~0.8s), opacity+x(−8)→0. | `motion-meaning` — count-up завершён → показываем контекст. |

**Производительность:** только `transform`/`opacity` (правило `transform-performance`). Виртуализация не нужна (пагинация 10/стр). `layout-shift-avoid`: зарезервировать высоту hero/плиток (skeleton при loading).

## 7. Состояния

- **Loading:** `DashboardPageSkeleton` — заменить на aurora-styled skeleton (блоки hero/плиток/таблицы с shimmer). Соответствие `progressive-loading` (>300ms → skeleton).
- **Error:** сейчас `<p>Error</p>` без shell. Заменить на friendly error-блок внутри AppShell: иконка + сообщение + кнопка «Повторить» (правило `error-recovery`). Retry = refetch Apollo query.
- **Empty (нет транзакций):** hero показывает «0,00 ₽», insight-плитки «—», таблица → empty-state с CTA.
- **Offline:** AppShell уже показывает amber-banner (не трогать). Таблица работает offline-first (optimistic mutations сохраняются). Hero/insights пересчитываются из кэша.

## 8. Доступность (ui-ux-pro-max, CRITICAL)

- Контраст 4.5:1 (AA) для текста; 3:1 для крупных сумм/иконок (см. токены).
- Focus-ring: 2px `--aurora-accent` outline на всех интерактивных элементах (правило `focus-states`). НЕ удалять Ant default focus.
- aria-label на icon-only кнопках (edit/delete, поиск-инпут имеет placeholder + `aria-label`).
- Спарклайн: `role="img"` + `aria-label` с текстовым описанием тренда (правило `color-not-only` — не только цвет).
- `aria-sort` на сортируемых колонках таблицы.
- `prefers-reduced-motion` — все анимации отключаются (см. motion).
- Tab order: hero → плитки → фильтры → таблица → пагинация. Соответствует визуальному.
- Heading hierarchy: h1 (баланс/«Dashboard»), h2 (секции). Не пропускать уровни.
- Touch targets ≥44px (кнопки, action-иконки с padding).
- Суммы не только цветом: знак +/− + цвет + (для скринридера) слово Income/Expense в aria-label ячейки.

## 9. Адаптивность

- Desktop (≥1024px): layout как описано, 3-кол плитки, спарклайн в hero виден.
- Tablet (768–1024px): 3-кол плитки, hero-спарклайн уже.
- Mobile (<768px): плитки 1 колонка, баланс 36px, спарклайн скрыт (или мини под балансом), фильтры wrap, таблица горизонтальный скролл (`scroll={{ x: 'max-content' }}` — уже есть). Action-иконки всегда видимы. CTA «+» full-width.
- `min-h-dvh` не нужен (AppShell управляет высотой через `100svh`).
- Нет горизонтального скролла страницы (только таблицы на мобильных).

## 10. Структура компонентов (FSD)

Создать/изменить (не удаляя существующие переиспользуемые хуки):

- `src/pages/dashboard/ui/DashboardPage.tsx` — refactor: рендерит новый `<DashboardView>` (dumb) с данными из `useTransactionsDashboard` + агрегаты. AppShell оборачивает DashboardView (перенести из TransactionsWidget, т.к. теперь составной layout).
- `src/widgets/dashboardHero/` — новый виджет: hero balance + count-up + спарклайн + aurora. `.Widget` export pattern. Container `useContainer` считает баланс/дельту из `allTransactions`.
- `src/widgets/dashboardInsights/` — новый виджет: 3 insight-плитки. `.Widget` pattern.
- `src/widgets/transactions/ui/TransactionsWidget.tsx` — оставить для модалки add/edit (переиспользуется), но вынести AppShell-оборачивание наверх в DashboardPage. Фильтры+таблица рендерятся напрямую в DashboardView.
- `src/widgets/transactions-table/ui/TransactionsTable.tsx` — обёрнуть строки в motion (через components.body.row), убрать type-колонку, добавить aria.
- `src/entities/transaction/model/` — новая утилита `aggregateByDay.ts` (обобщение `getTransactionsByMonth`) + `calculateBalance.ts` (balance, income, expense, delta vs prev period — переиспользовать логику `calculateReportCards`).
- `src/shared/lib/motion.ts` — motion-токены + `useReducedMotion` обёртка.
- `src/index.css` — добавить `--aurora-*` токены в `:root` (НЕ трогать существующие). Добавить aurora-styled классы.
- `src/i18n.js` — добавить ключи: `currentBalance`, `last30Days`, `largestTransaction`, `noTransactionsYet`, `addFirstTransaction`, `retry`, `trendUp`, `trendDown`, `vsPreviousPeriod` (en + ru).

## 11. Out of scope

- Страница `/reports` — не трогать.
- Темный режим — не добавлять переключатель, не адаптировать aurora-токены под dark (светлая only по требованию).
- Новые backend-эндпоинты/GraphQL-операции — все агрегаты клиентские из существующих `allTransactions`.
- Drill-down с insight-плиток (кликабельность) — будущая фича.
- Изменение `colorPrimary` Ant глобально — оставляем `#aa3bff` для других страниц.

## 12. Риски и открытые вопросы

- **Ant `<Table>` + Framer Motion для строк:** Ant рендерит строки через `components.body.row` — нужно передать motion-обёртку, соблюдая `rowKey`. Потенциальная проблема с virtual scroll (не используется, ОК) и re-render при сортировке (stagger должен переигрываться аккуратно — возможно анимировать только при mount, не при каждом sort). Решение: анимировать stagger только при первом mount и при смене страницы пагинации, НЕ при сортировке.
- **Count-up производительность:** `useMotionValue` + `animate` — на transform/opacity, не вызывает re-render React (motion подписка). ОК.
- **Спарклайн баланс-кумулятив:** если транзакций мало (<2 за 30 дней) — спарклайн деградирует в точку/короткую линию. Empty-обработка.
- **Шрифты Google Fonts:** +1 сетевой запрос. `font-display: swap` (правило `font-loading`). Preload Sora 600 + Inter 400/500. Fallback system-ui.

---

**Самоанализ спецификации:**
- Placeholder/TODO: нет.
- Внутренняя согласованность: layout, токены, motion — согласованы. AppShell-перенос описан явно.
- Scope: один план реализации (редизайн одной страницы) — ОК.
- Ambiguity: уточнены — какая сумма в hero (кумулятивный баланс, не текущий остаток после фильтров), какие колонки убрать (type), когда анимировать stagger (mount + page-change, не sort).
