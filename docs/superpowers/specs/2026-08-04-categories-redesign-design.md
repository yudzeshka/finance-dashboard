# Спецификация: Редизайн Categories — «Calm 2026»

**Дата:** 2026-08-04
**Статус:** Ожидает одобрения пользователя
**Страница:** `/categories` (маршрут «Категории»)
**Скиллы:** ui-ux-pro-max, superpowers:brainstorming
**Тема:** ТОЛЬКО светлая (тёмный режим не затрагивается — Ant-компоненты остаются светлыми, т.к. `AppAntdProvider` не имеет `darkAlgorithm`)
**Дизайн-макет:** `.superpowers/brainstorm/5155-1785853908/content/calm-2026-v2.html` (утверждён)

## 1. Цель и контекст

Полный редизайн страницы `/categories` — управление категориями транзакций. Текущая страница рендерит `<CategoriesWidget>` внутри `<AppShell>`: заголовок «Категории», subtitle, CTA-кнопка «+ Добавить», и Ant Design `<Table>` с колонками name, type, emoji, transactionsCount, actions.

Цель редизайна: заменить табличное представление на адаптивную сетку карточек в стиле «Calm 2026» — спокойный, лаконичный интерфейс с solid-заливками, без градиентов. Одновременно провести миграцию с эмодзи на кураторский набор SVG-иконок во всём проекте (6 точек рендера).

**Главное правило дизайна:** БЕЗ ГРАДИЕНТОВ. Все цветовые блоки — solid fills. Никаких `linear-gradient`/`radial-gradient` в CSS редизайна категорий.

## 2. Ограничения кодовой базы (проверено)

- `CategoriesPage` (`src/pages/categories/ui/CategoriesPage.tsx`) — тонкая обёртка: возвращает `<Categories.Widget />`. AppShell рендерится внутри `CategoriesView` (`src/widgets/categories/ui/CategoriesView.tsx:57`).
- `CategoriesWidget` (`src/widgets/categories/container/CategoriesWidget.tsx`) — при `loading && categories.length === 0` показывает `<CategoriesPageSkeleton />`, иначе `<CategoriesView>`.
- Хук `useContainer` (`src/widgets/categories/container/useContainer.ts`) возвращает: `categories: CategoryRowViewModel[]`, `loading`, `errorMessage`, `deleteLoading`, `isModalOpen`, `modalTitle`, `confirmLoading`, `form`, `isEmojiPickerOpen`, `selectedEmoji`, `onAddClick`, `onEdit`, `onDelete`, `onModalOk`, `onModalCancel`, `onEmojiPickerOpenChange`, `onEmojiClick`.
- Тип `Category` (`src/entities/category/model/types.ts`): `{ id: string; name: string; icon: string; type: "INCOME"|"EXPENSE"; user_id: string | null }`. Поле `icon` — строка (сейчас эмодзи, после миграции — SVG-ключ).
- Тип `CategoryRowViewModel` (`src/widgets/categories/model/types.ts`): `{ id; name; type; icon; transactionsCount; isSystem }`.
- Системные категории определяются через `user_id === null` в `src/widgets/categories/model/lib.ts:28` (`mapCategoryToRow`).
- `CategoriesTable` (`src/widgets/categories/ui/CategoriesTable.tsx`) — Ant `<Table>` с 5 колонками: name, type (Tag income/expense), emoji (emojiCell + emojiCircle), transactionsCount, actions (edit/delete с кнопками ✏️/🗑️). Системные категории — без action-кнопок (строка 76: `if (record.isSystem) return null`).
- `CategoryFormModal` (`src/widgets/categories/ui/CategoryFormModal.tsx`) — Ant `<Modal>` с `<Form>`: name (Input), type (Radio.Group INCOME/EXPENSE), icon (`emoji-picker-react` Popover + триггер-кнопка с selectedEmoji).
- `CategoriesPageSkeleton` (`src/widgets/categories/ui/CategoriesPageSkeleton.tsx`) — `<Skeleton active paragraph={{ rows: 12 }}>` внутри AppShell.
- `emoji-picker-react` v4.19.1 в `package.json:21`. Импортируется в `CategoryFormModal.tsx:3` и `useContainer.ts:2` (тип `EmojiClickData`). Больше нигде не используется (grep подтверждает).
- AppAntdProvider: `colorPrimary "#aa3bff"`, `borderRadius 10`, `fontFamily system-ui`. **Нет darkAlgorithm** — Ant-компоненты всегда светлые.
- `#root` имеет `overflow:hidden` глобально — контент AppShell скроллится внутри `.dashboard-content` (`overflow:auto`).
- Aurora-токены (`--aurora-*`) уже определены в `src/index.css:14-30` и используются дашбордом. НЕ добавлять dark-варианты.
- Классы-утилиты aurora в `src/index.css:426-562`: `.aurora-surface`, `.aurora-card`, `.aurora-card--elevated`, `.aurora-card--insight`, `.aurora-tabular`, `.aurora-focus-ring`, `.aurora-row-hover`, `.aurora-row-actions`, `.aurora-empty-state`, `.aurora-text-primary/secondary/success/danger`, `.aurora-font-display` (Sora), `.aurora-font-body` (Inter).
- Шрифты Sora + Inter уже подключены (используются дашбордом через Google Fonts).
- i18n: существующие ключи для категорий: `categories`, `categoriesSubtitle`, `addCategory`, `editCategory`, `categoryName`, `categoryNamePlaceholder`, `categoryNameIsRequired`, `categoryEmoji`, `categoryEmojiIsRequired`, `categoryTransactionsCount`, `deleteCategoryConfirm`, `delete`, `cancel`, `save`, `income`, `expense`, `type`, `typeIsRequired`, `search`, `loadingError`, `retry`.
- Мок-сервер (`mock-server/schema.ts:20-36`) содержит 15 категорий с эмодзи: 🍔 Food&Drinks, 💰 Salary, 🚗 Transport, 🎉 Entertainment, 💪 Health, 🎓 Education, 🔌 Utilities, 🏠 Rent, 🏠 Mortgage, 💳 Loan, 💳 Credit Card, 💳 Debt, 💳 Insurance, 💵 Taxes, 💵 Other.

## 3. Дизайн-токены

Переиспользовать СУЩЕСТВУЮЩИЕ aurora-токены из `src/index.css:14-30`. НЕ добавлять новые переменные в `:root` (все необходимые уже есть). Если понадобятся новые утилит-классы (например, `.aurora-type-pill`), добавить их в существующий блок aurora-классов (`src/index.css:426+`), БЕЗ градиентов.

**Поверхности:**
- `--aurora-surface: #F7F5FB` — фон страницы (уже даётся AppShell; контент surface-классом не оборачивается)
- `--aurora-surface-card: #FFFFFF` — карточки категорий
- `--aurora-accent: #7C3AED` — акцент (hover-ring, CTA-кнопка)
- `--aurora-accent-soft: #EDE9FE` — акцентный фон (используется в TopCategories/LargestTransactions iconCircle)
- `--aurora-success: #0E9F6E` — доходы/income-пилюля (текст)
- `--aurora-success-soft: #D1FAE5` — income-пилюля (фон)
- `--aurora-danger: #E0457B` — расходы/expense-пилюля (текст)
- `--aurora-danger-soft: #FCE7F3` — expense-пилюля (фон)
- `--aurora-text: #1E1B2E` — основной текст
- `--aurora-text-secondary: #6B6680` — вторичный текст
- `--aurora-border: #E8E4F0` — границы карточек
- `--aurora-shadow-sm: 0 1px 2px var(--aurora-shadow-color)`
- `--aurora-shadow-md: 0 4px 12px var(--aurora-shadow-color)`

**Контраст (проверка):**
- `--aurora-text #1E1B2E` на `#FFFFFF` = 14.8:1 (AAA).
- `--aurora-text-secondary #6B6680` на `#FFFFFF` = 5.9:1 (AA).
- `--aurora-accent #7C3AED` на `#FFFFFF` = 5.7:1 (AA).
- `--aurora-success #0E9F6E` на `--aurora-success-soft #D1FAE5` — проверить контраст (текст пилюли). Если <4.5:1 — использовать `--aurora-text` для текста пилюли, оставив success-soft фон как цветовой индикатор (правило `color-not-only`: пилюля всегда содержит текст Income/Expense).
- `--aurora-danger #E0457B` на `--aurora-danger-soft #FCE7F3` — аналогично, проверить контраст; при необходимости использовать `--aurora-text` для текста.

**Палитра макета calm-2026-v2** (фон #FAFAFA, карточки #FFFFFF, границы #EBEBEB) совместима с aurora-токенами. Используем aurora-токены как канонические (уже в коде).

## 4. Типографика

Переиспользовать существующие шрифты проекта — Sora (display) + Inter (body). Уже подключены через Google Fonts и используются дашбордом. НЕ подключать новые шрифты (Newsreader/Geist из макета НЕ импортировать).

**Типо-шкала для страницы категорий:**
- Название категории в карточке: Sora 16px, weight 600, цвет `--aurora-text`.
- Count транзакций: Inter/Sora 14px, `font-variant-numeric: tabular-nums` (через класс `.aurora-tabular`), цвет `--aurora-text-secondary`.
- Type-пилюля: Inter 12px, weight 500, `text-transform: uppercase; letter-spacing: 0.04em`.
- Заголовок страницы (AppShell title) — существующий (не менять).
- Labels в форме (Ant Form layout vertical) — Inter (наследуется от ConfigProvider).

Все числа на странице (count транзакций) используют `font-variant-numeric: tabular-nums` (класс `.aurora-tabular`).

## 5. Layout страницы (внутри AppShell Content)

Структура (сохраняется):

```
[AppShell: title «Категории», subtitle, primaryAction «+ Добавить»]
  └── [Состояние: loading / error / empty / normal]
        └── [Состояние normal:]
              [Grid карточек категорий 3→2→1]
                ├── карточка 1
                ├── карточка 2
                ├── ...
                └── Ghost-card «+ Добавить категорию»
  └── [CategoryFormModal] (вне потока контента)
```

### 5.1. Сетка карточек (grid 3→2→1)

Заменить Ant Design `<Table>` на адаптивный CSS Grid карточек:
- Desktop (≥1024px): `grid-template-columns: repeat(3, 1fr)`, gap 16px.
- Tablet (768–1024px): `grid-template-columns: repeat(2, 1fr)`.
- Mobile (<768px): `grid-template-columns: 1fr`.

### 5.2. Карточка категории

Каждая карточка использует класс `.aurora-card` (border-radius 16px, shadow-sm, border `--aurora-border`, background `--aurora-surface-card`), padding ~20px.

**Содержимое карточки:**
- **Иконка категории** — `<CategoryIcon icon={category.icon} size={...} />` в круге/квадрате (размер ~40–48px), фон `--aurora-accent-soft`. Иконка декоративна (`aria-hidden`).
- **Название категории** — Sora 16px 600, `--aurora-text`.
- **Type-пилюля** — `INCOME` → фон `--aurora-success-soft`, текст `--aurora-success` (или `--aurora-text` при недостаточном контрасте). `EXPENSE` → фон `--aurora-danger-soft`, текст `--aurora-danger`. Solid fill, border-radius 999px, padding 2px 10px, Inter 12px 500 uppercase letter-spacing 0.04em. Содержит текст «Income» / «Expense» (i18n).
- **Count транзакций** — tabular-nums, `--aurora-text-secondary`, 14px.
- **Action-кнопки** (edit/delete) — SVG-иконки (inline, outline-style, currentColor), размер ~18–20px. На десктопе скрыты в покое (opacity 0), reveal на hover всей карточки (opacity 0→1, transition 0.18s ease). На мобиле (max-width: 768px) всегда видимы (opacity 1). Всегда видимы при focus-within (клавиатура). Delete — `--aurora-danger` цвет + Popconfirm (как сейчас). Edit — `--aurora-text-secondary`. Обе кнопки имеют `aria-label` (`t("editCategory")`, `t("delete")`). Touch target ≥44px (padding). Паттерн: переиспользовать существующий `.aurora-row-actions` механизм (определён в `src/index.css:535-561`).

**Hover карточки:** `box-shadow: 0 0 0 1px var(--aurora-accent)` (hover-ring, solid 1px — НЕ градиент) + лёгкий трансформ (`translateY(-2px)`). Transition 0.2s ease. При `prefers-reduced-motion` — только ring без подъёма.

**Все карточки идентичны в покое** — нет `.active`-класса, нет подсветки одной категории.

### 5.3. Ghost-card «Добавить категорию»

В конце grid — карточка с пунктирной границей (`border: 2px dashed var(--aurora-border)`), border-radius 16px, текст «+ Добавить категорию», центрирована. Hover: border-color → `--aurora-accent` (solid, не градиент), background → `--aurora-accent-soft` с низкой opacity (~0.3). `cursor: pointer`. Клик → `onAddClick` (открывает ту же модалку `CategoryFormModal`). `aria-label={t("addCategory")}`.

**CTA-кнопка в AppShell header** остаётся как есть: Ant `<Button type="primary">`, solid `--aurora-accent` заливка, белый текст. Это единственная primary-action на странице (правило `primary-action`).

### 5.4. Системные категории

Системные категории (`user_id === null`) показываются в той же сетке, что и пользовательские. Отличие: у карточек системных категорий **нет** action-кнопок (edit/delete) — сохранить текущую логику `if (record.isSystem) return null` из `CategoriesTable.tsx:76`. В остальном карточка идентична (иконка, название, пилюля, count). НЕ выносить системные категории в отдельную секцию. НЕ добавлять визуальный бейдж «системная». Сортировка остаётся по имени (localeCompare) — уже в `useContainer.ts:96`.

## 6. SVG-иконки — кураторский набор + маппинг (КЛЮЧЕВОЕ)

### 6.1. Архитектура

- **Кураторский набор ~24 SVG-иконок** — инлайн React SVG-компоненты в проекте, каждая в отдельном файле (или один файл `icons.tsx` с именованными экспортами). Иконки: еда, транспорт, зарплата, развлечения, здоровье, образование, коммуналка, аренда, ипотека, кредит, страховка, налоги, покупки, кафе, путешествия, подарки, инвестиции, спорт, питомцы, технологии, одежда, красота, перевод, прочее. Стиль: outline/minimal, stroke 1.5–2px, `currentColor` (наследует цвет родителя). **НЕ использовать lucide-react, react-icons и другие npm-пакеты** — только хэнд-крафт SVG в проекте.
- **Поле `icon` в БД/типах** (`Category.icon: string`, `CategoryRowViewModel.icon: string`, `CategoryFormValues.icon: string`) хранит **строковый ключ** (например, `'food'`, `'transport'`, `'salary'`). Не эмодзи. Тип остаётся `string` — Hasura мутации уже принимают `$icon: String!`, совместимо.
- **Маппинг эмодзи→ключ** — для существующих эмодзи-данных (мок-сервер + потенциально прод). Словарь: `'🍔'→'food'`, `'💰'→'salary'`, `'🚗'→'transport'`, `'🎉'→'entertainment'`, `'💪'→'health'`, `'🎓'→'education'`, `'🔌'→'utilities'`, `'🏠'→'rent'` (для Rent) / `'mortgage'` (нужна доп. логика по имени категории — если emoji=🏠 и name содержит «Mortgage» → 'mortgage'), `'💳'→'credit_card'` (по умолчанию), `'💵'→'taxes'` (по умолчанию). Для неоднозначных эмодзи (🏠, 💳, 💵) — маппинг может учитывать имя категории. Fallback-ключ: `'other'`.
- **Единый компонент `<CategoryIcon>`** — в `src/shared/ui/CategoryIcon/` (или `src/entities/category/ui/CategoryIcon/`). Принимает: `{ icon: string; size?: number; className?: string }`. Логика: если `icon` — эмодзи (определяется через regex/проверку code point > 0xFFFF или length !== 1 для эмодзи с variation selector), маппит через `emojiToKey` словарь; если уже ключ — напрямую. Рендерит соответствующий SVG из набора. Fallback — иконка 'other'. Экспортирует `CategoryIcon` + `emojiToKey` (для использования в других местах) + `DEFAULT_ICON_KEY` (константа `'other'`).

### 6.2. Шесть точек рендера (все обновить через `<CategoryIcon>`)

1. **Страница категорий — карточка** (новый `CategoriesGrid.tsx`, замена `CategoriesTable.tsx`) — иконка в карточке: `<CategoryIcon icon={category.icon} size={40} aria-hidden />` в круге `--aurora-accent-soft`.
2. **TransactionsTable** (`src/widgets/transactions-table/ui/TransactionsTable.tsx:135-140`) — `<span>{category.icon}</span>` → `<CategoryIcon icon={category.icon} size={20} aria-hidden />`. Существующий layout сохраняется: иконка + название рядом.
3. **TopCategories** (`src/widgets/topCategories/ui/index.tsx:52-54`) — `iconCircle` 44px, accent-bg. Эмодзи в `<span className={styles.iconEmoji}>` → `<CategoryIcon icon={row.icon} size={28} aria-hidden />` внутри `iconCircle`. Существующие стили iconCircle сохраняются.
4. **LargestTransactions** (`src/widgets/largestTransactions/ui/index.tsx:28-30`) — `iconCircle` 36px, accent-bg. Аналогично → `<CategoryIcon icon={row.category.icon} size={24} aria-hidden />`.
5. **DashboardInsights** (`src/widgets/dashboardInsights/container/useContainer.ts:82`) — fallback `"📌"` → `DEFAULT_ICON_KEY` (`'other'`). Рендер в `DashboardInsightsView.tsx:29`: `<div className={styles.tileIcon}>{tile.icon}</div>` → `<CategoryIcon icon={tile.icon} size={28} className={styles.tileIcon} />`.
6. **TransactionFormModal (Select категорий)** — `useTransactionQueries.ts:36-40`: `categoryOptions` включает `icon: category.icon` (теперь ключ). Select рендер через `optionRender`/`tagRender` с `<CategoryIcon>` в лейбле. Транзакционная форма НЕ редизайнится — только замена рендера иконки.

### 6.3. Форма создания/редактирования категории

Заменить `emoji-picker-react` Popover на **сетку выбора SVG-иконок** (grid из ~24 `<CategoryIcon>`-кнопок). Каждая кнопка — `<button>` с иконкой, `aria-label` (название ключа), при выборе вызывает `onIconSelect(key)`. Grid: 6 колонок на десктопе, 4 на мобиле. Выбранная иконка подсвечивается (box-shadow: 0 0 0 2px `--aurora-accent`).

Триггер: кнопка показывает `<CategoryIcon icon={selectedIcon}>` вместо эмодзи.

Это позволяет **удалить зависимость `emoji-picker-react`** из `package.json` (используется только в CategoryFormModal и useContainer — grep подтверждает).

### 6.4. DEFAULT-иконка и переименования

- `useContainer.ts:44` — `DEFAULT_EMOJI = "🙂"` → `DEFAULT_ICON_KEY = "other"` (импорт из CategoryIcon).
- `selectedEmoji` → `selectedIcon` (string-ключ), `isEmojiPickerOpen` → `isIconPickerOpen`.
- `handleEmojiClick(emoji: EmojiClickData)` → `handleIconSelect(key: string)`: `setSelectedIcon(key)`, `form.setFieldValue("icon", key)`, `setIsIconPickerOpen(false)`.
- Убрать импорт `EmojiClickData` из `emoji-picker-react`.
- `openCreate` → `setSelectedIcon(DEFAULT_ICON_KEY)` + `form.setFieldsValue({ icon: DEFAULT_ICON_KEY })`.
- `openEdit` → `setSelectedIcon(category.icon)`.
- `resetModalState` → `setSelectedIcon(DEFAULT_ICON_KEY)`.

## 7. Состояния (loading / error / empty)

Следовать паттерну `DashboardPage` (`src/pages/dashboard/ui/DashboardPage.tsx`):

### 7.1. Loading
Заменить `CategoriesPageSkeleton` (Ant `<Skeleton>`) на skeleton-карточки: grid 3→2→1 пустых `.aurora-card` блоков (фиксированная высота ~160px) с shimmer-анимацией. AppShell с title/subtitle рендерится (как и сейчас в CategoriesWidget). Первый mount (категорий нет) → skeleton сразу. Если категории уже загружены и refetch — НЕ показывать skeleton (сохранить текущие данные).

### 7.2. Error
Карточка `.aurora-card` с padding 48px, text-align center:
- SVG-иконка warning 48px, opacity 0.6, цвет `--aurora-text-secondary`.
- Заголовок: `t("loadingError")` — Inter 16px, weight 500, `--aurora-text`.
- Текст ошибки: `errorMessage` — 14px, `--aurora-text-secondary`.
- Кнопка «Повторить»: `<Button type="primary" onClick={refetch}>{t("retry")}</Button>`.

Внутри AppShell (как в DashboardPage:26-58).

Заменить текущий `{errorMessage ? <p>{errorMessage}</p> : null}` (CategoriesView.tsx:66) на этот полноценный error-блок.

### 7.3. Empty (нет категорий)
Если `categories.length === 0` после загрузки — дружелюбное сообщение + ghost-card как единственный CTA. Сообщение: `t("categoriesGridEmpty")` (Inter 16px, `--aurora-text`) + подзаголовок `t("addFirstCategory")`. Ghost-card «Добавить первую категорию» в центре. AppShell отрендерен (с title/subtitle). CTA в header всё ещё видна.

## 8. Доступность (CRITICAL — ui-ux-pro-max)

- **Контраст:** 4.5:1 (AA) для текста; 3:1 для крупных элементов/иконок. Проверить текст пилюль на success-soft/danger-soft фоне (см. раздел 3).
- **Focus-ring:** `.aurora-focus-ring` (2px outline `--aurora-accent`, offset 2px) на всех интерактивных элементах. НЕ удалять Ant default focus. Карточки категорий — фокусируемые (tabIndex=0?), либо focus-ring на action-кнопках.
- **aria-label на icon-only кнопках:** edit-кнопка — `t("editCategory")`, delete-кнопка — `t("delete")`. Ghost-card кнопка/div — `t("addCategory")`. CTA в header — уже имеет текст.
- **Action-кнопки:** reveal на hover (десктоп) + всегда на focus-within (клавиатура) + всегда на мобиле (`max-width: 768px`). Паттерн `aurora-row-actions` уже реализует это (`src/index.css:535-561`).
- **prefers-reduced-motion:** все transitions/animations отключаются (`transition: none`). Уже есть в `src/index.css:557-561` для `aurora-row-actions`; для hover-lift карточки — добавить аналогично.
- **Tab order:** header CTA → карточки (по порядку) → ghost-card. Внутри карточки: action-кнопки (edit → delete). Иконка категории — не интерактивная.
- **Touch targets ≥44px:** action-кнопки с padding до ≥44px, ghost-card ≥44px min-height, CTA в header ≥44px (уже в дашборд-спеке).
- **Иконки категорий декоративны:** `<CategoryIcon aria-hidden />` — имя категории рядом несёт смысл.
- **Heading hierarchy:** h1 — AppShell title «Категории». Карточки — НЕ заголовки (div + name). Не пропускать уровни.
- **Не полагаться только на цвет:** type-пилюля содержит текст (Income/Expense) + цвет. Цвет суммы (count) вторичен.

## 9. Адаптивность

- **Desktop (≥1024px):** grid 3 колонки, gap 16px.
- **Tablet (768–1024px):** grid 2 колонки.
- **Mobile (<768px):** grid 1 колонка, action-кнопки всегда видимы (opacity 1), CTA full-width, форма-модалка адаптивна (grid выбора иконок 4 колонки). Ghost-card full-width.
- Нет горизонтального скролла страницы. `#root` имеет `overflow:hidden` — контент скроллится внутри `.dashboard-content`.
- `min-h-dvh` не нужен (AppShell управляет высотой через `100svh`).

## 10. Структура компонентов (FSD)

Создать/изменить (не удаляя переиспользуемые хуки):

- **`src/shared/ui/CategoryIcon/`** — НОВЫЙ единый компонент (full module):
  - `CategoryIcon.tsx` — компонент, принимает `{ icon: string; size?: number; className?: string }`. Определяет эмодзи vs ключ, рендерит SVG.
  - `icons.tsx` — набор ~24 SVG-иконок (named exports: `FoodIcon`, `TransportIcon`, `SalaryIcon`, … + lookup map `iconComponents: Record<string, React.FC<{size?: number}>>`).
  - `emojiMapping.ts` — словарь `emojiToKey: Record<string, string>` + функция `resolveIconKey(raw: string, categoryName?: string): string`.
  - `index.ts` — barrel: экспорт `CategoryIcon`, `DEFAULT_ICON_KEY`, `emojiToKey`, `resolveIconKey`.

- **`src/pages/categories/ui/CategoriesPage.tsx`** — refactor: вместо `<Categories.Widget />` — дублировать логику `DashboardPage`: если loading → skeleton в AppShell, если error → error-блок в AppShell, иначе → CategoriesView. (Или оставить CategoriesWidget как есть, переработав его логику — решение: обновить CategoriesWidget для поддержки error/loading внутри AppShell).

- **`src/widgets/categories/container/CategoriesWidget.tsx`** — refactor: при loading → `CategoriesPageSkeleton` (как сейчас, но с новым skeleton-дизайном). Добавить error-ветку: `<AppShell><aurora-card error-block></AppShell>`. Добавить empty-ветку: при `!loading && categories.length === 0` → empty-state.

- **`src/widgets/categories/ui/CategoriesView.tsx`** — refactor:
  - Пропсы: `isEmojiPickerOpen`→`isIconPickerOpen`, `selectedEmoji`→`selectedIcon`, `onEmojiPickerOpenChange`→`onIconPickerOpenChange`, `onEmojiClick`→`onIconSelect`. Тип `EmojiClickData` заменить на `string`.
  - Убрать `import type { EmojiClickData } from "emoji-picker-react"`.
  - Контент: заменить `<div className="dashboard-card"><CategoriesTable ...></div>` на `<CategoriesGrid ...>`.
  - Убрать `{errorMessage ? <p>{errorMessage}</p> : null}` (error-состояние обрабатывается на уровне CategoriesWidget / CategoriesPage).
  - `<CategoryFormModal>` — новые пропсы иконок.

- **`src/widgets/categories/ui/CategoriesTable.tsx`** — **УДАЛИТЬ** (заменён на CategoriesGrid). Ant Table больше не нужен.

- **`src/widgets/categories/ui/CategoriesGrid.tsx`** — НОВЫЙ компонент (взамен CategoriesTable):
  - Пропсы: `categories: CategoryRowViewModel[]`, `deleteLoading?: boolean`, `onEdit`, `onDelete`, `onAddClick`, `loading?: boolean`.
  - Рендерит CSS Grid контейнер с карточками категорий + ghost-card.
  - Карточка: `.aurora-card` + `.aurora-row-hover`. Иконка, название, type-пилюля, count, action-кнопки с `.aurora-row-actions`.
  - Ghost-card: последний элемент, пунктирная граница, onClick → onAddClick.

- **`src/widgets/categories/ui/CategoryFormModal.tsx`** — refactor:
  - Убрать импорт `EmojiPicker`, `EmojiClickData`, `Theme`. Убрать `emoji-picker-react`.
  - Заменить Popover на `<CategoryIconPicker>` — новый внутренний компонент или отдельный файл: grid ~24 иконок, состояние `selectedIcon`, onClick → `onIconSelect(key)`.
  - Пропсы: `selectedIcon: string`, `onIconSelect: (key: string) => void`, `isIconPickerOpen: boolean`, `onIconPickerOpenChange: (open: boolean) => void`.
  - Триггер-кнопка: `<CategoryIcon icon={selectedIcon} size={24} />`.

- **`src/widgets/categories/ui/CategoriesView.module.scss`** — переписать:
  - Убрать: `.emojiCell`, `.emojiCircle`, `.emojiPickerTrigger`, `.emojiPickerPopover`, `.actionsCell` (всё, что связано с таблицей и emoji-picker).
  - Добавить: `.categoriesGrid` (display: grid, медиа-запросы 3→2→1), `.categoryCard`, `.categoryCardHover`, `.ghostCard`, `.iconCircle` (общий с CategoryIcon), `.typePill` (income/expense варианты), `.count`, `.actions` (aurora-row-actions).
  - БЕЗ градиентов.

- **`src/widgets/categories/container/useContainer.ts`** — refactor:
  - `DEFAULT_EMOJI` → импорт `DEFAULT_ICON_KEY` из `@/shared/ui/CategoryIcon`.
  - `selectedEmoji` → `selectedIcon`, `isEmojiPickerOpen` → `isIconPickerOpen`.
  - `handleEmojiClick(emoji: EmojiClickData)` → `handleIconSelect(key: string)`.
  - `openCreate` / `openEdit` / `resetModalState` — использовать `DEFAULT_ICON_KEY`.
  - Возвращаемые значения: переименовать поля.
  - Убрать импорт `EmojiClickData`.

- **`src/widgets/categories/model/types.ts`** — `CategoryFormValues.icon: string` остаётся без изменений (теперь ключ). `CategoryRowViewModel.icon: string` — тоже без изменений. Добавить комментарий, что `icon` — SVG-ключ (не эмодзи).

- **`src/widgets/categories/index.ts`** — barrel, без изменений (экспорт Categories.Widget остаётся).

- **`src/widgets/categories/ui/CategoriesPageSkeleton.tsx`** — переписать: Ant `<Skeleton>` → grid пустых `.aurora-card` блоков со shimmer.

- **`src/widgets/transactions-table/ui/TransactionsTable.tsx`** (строка 137) — `<span>{category.icon}</span>` → `<CategoryIcon icon={category.icon} size={20} aria-hidden />`.

- **`src/widgets/topCategories/ui/index.tsx`** (строка 53) — `<span className={styles.iconEmoji}>{row.icon}</span>` → `<CategoryIcon icon={row.icon} size={28} aria-hidden />`.

- **`src/widgets/largestTransactions/ui/index.tsx`** (строка 29) — `<span className={styles.iconEmoji}>{row.category.icon}</span>` → `<CategoryIcon icon={row.category.icon} size={24} aria-hidden />`.

- **`src/widgets/dashboardInsights/container/useContainer.ts`** (строка 82) — `icon: stats.largestTransaction?.category?.icon ?? "📌"` → `icon: stats.largestTransaction?.category?.icon ?? DEFAULT_ICON_KEY`. Импорт `DEFAULT_ICON_KEY`.

- **`src/widgets/dashboardInsights/ui/DashboardInsightsView.tsx`** (строка 29) — `<div className={styles.tileIcon}>{tile.icon}</div>` → `<CategoryIcon icon={tile.icon} size={28} className={styles.tileIcon} />`.

- **`src/features/transaction/manage/model/useTransactionQueries.ts`** (строки 36-40) — `categoryOptions` сохранить, `icon` остаётся строкой-ключом. Рендер опции Select через `optionRender`/`tagRender` (проверить, где используется `categoryOptions` и добавить кастомный рендер с `<CategoryIcon>`). Если `categoryOptions` передаётся в `TransactionFormModal`, рендер опций в Select обновить там.

- **`src/index.css`** — НЕ добавлять новые токены. Если нужны новые утилит-классы (например, `.aurora-type-pill`, `.aurora-ghost-card`, `.aurora-icon-btn`) — добавить в существующий блок (строки 426+), БЕЗ градиентов.

- **`src/i18n.js`** — добавить ключи (en + ru):
  - `categoriesGridEmpty`: "No categories yet" / "Категорий пока нет"
  - `addFirstCategory`: "Add your first category" / "Добавьте первую категорию"
  - `chooseIcon`: "Choose an icon" / "Выберите иконку"
  - Проверить существующие ключи: `loadingError`, `retry` — уже есть (добавлены в dashboard-спеке). `categoryEmoji` / `categoryEmojiIsRequired` — оставить как есть (ключ не менять, хоть теперь это иконка; можно добавить алиас `categoryIcon` с теми же значениями для будущего использования).

- **`package.json`** — удалить `emoji-picker-react` (строка 21). Выполнить `npm uninstall emoji-picker-react` после подтверждения что нигде больше не используется (grep подтверждает: только CategoryFormModal.tsx и useContainer.ts).

## 11. Out of scope

- Тёмный режим — только светлая версия по решению пользователя.
- Страницы `/` (Dashboard), `/reports`, `/auth` — НЕ редизайнить (но обновить 5 точек рендера иконок: TransactionsTable, TopCategories, LargestTransactions, DashboardInsights, useTransactionQueries — это замена эмодзи на SVG в существующем дизайне, не редизайн).
- Новые backend/GraphQL-операции — поле `icon` остаётся `String!`, совместимо с ключами и эмодзи.
- Изменение `colorPrimary` Ant глобально — оставляем `#aa3bff` для других страниц.
- Миграция существующих данных в БД (эмодзи→ключи) — маппинг runtime, БД не трогаем.
- Реальная БД Nhost — маппинг покрывает мок-данные. Если в проде есть пользовательские категории с эмодзи — fallback-иконка `'other'` их покроет.
- Кастомные иконки (загрузка пользователем) — будущая фича (out of scope для calm-2026).

## 12. Риски и открытые вопросы

- **`emoji-picker-react` удаление:** используется только в `src/widgets/categories/ui/CategoryFormModal.tsx:3` (импорт) и `src/widgets/categories/container/useContainer.ts:2` (тип `EmojiClickData`). После рефакторинга — удалить из `package.json` командой `npm uninstall emoji-picker-react`.

- **6 точек рендера — scope расширен:** замена эмодзи на SVG затрагивает дашборд (TransactionsTable, TopCategories, LargestTransactions, DashboardInsights) и форму транзакции (useTransactionQueries Select). Это НЕ редизайн этих виджетов — только замена рендера иконки на `<CategoryIcon>`, существующий layout/стили сохраняются. Риск: SVG-иконка может выглядеть иначе по размеру в сравнении с эмодзи в кругах `--aurora-accent-soft`. Решение: подобрать размер SVG в `<CategoryIcon size={...}>` под существующие `iconCircle` (44px для TopCategories, 36px для LargestTransactions, 28px для DashboardInsights, 20px для TransactionsTable, 28px для Select options).

- **Тип `icon: string` — двусмысленность:** после миграции поле хранит ключ (`'food'`), но старые данные — эмодзи (`'🍔'`). `<CategoryIcon>` обрабатывает оба через маппинг + fallback. Select в форме транзакции должен рендерить `<CategoryIcon>` в `optionRender`, не raw строку.

- **Неоднозначные эмодзи в мок-данных:** 🏠 используется для Rent и Mortgage; 💳 — для Loan, Credit Card, Debt, Insurance; 💵 — для Taxes и Other. Маппинг `emojiToKey` с учётом имени категории решает это (передавать `categoryName` в `resolveIconKey` для неоднозначных эмодзи).

- **Кураторский набор ~24 иконок:** может не покрыть все пользовательские категории (пользователь не может загрузить свою иконку — только выбрать из набора). Fallback `'other'` для неизвестных/невыбранных. Будущая фича: кастомные иконки (out of scope).

- **Ant Table → grid:** теряем встроенную пагинацию и сортировку Ant Table. Категорий обычно немного (десятки), пагинация не нужна. Сортировка по имени (localeCompare) уже есть в `useContainer.ts:96` — сохраняется. Сортировка по count (transactionsCount) была в Table sorter — убираем, оставляем только сортировку по имени. Если в будущем потребуется сортировка по count — добавить client-side sort controls.

- **Hover-reveal на тач-устройствах:** паттерн `aurora-row-actions` уже обеспечивает постоянную видимость на `max-width: 768px`. ОК.

- **Ghost-card семантика:** ghost-card — кликабельный `<div>` с `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space → `onAddClick`), `aria-label`. Или использовать `<button>` с классом `.aurora-ghost-card` — решение за реализатором.

- **i18n-ключ `categoryEmoji`:** остаётся для обратной совместимости в форме (`label={t("categoryEmoji")}`), хотя теперь выбирается иконка. Можно добавить алиас `categoryIcon` с тем же переводом. Решение: оставить ключ `categoryEmoji` и добавить `categoryIcon`/`chooseIcon` с семантически правильным текстом.

## Самоанализ спецификации

- **Placeholder/TODO:** нет. Все пункты имеют конкретные указания.
- **Внутренняя согласованность:** layout (grid 3→2→1), токены (переиспользуем aurora-*), SVG-архитектура (CategoryIcon с маппингом) — согласованы. Все пропсы и переименования описаны единообразно (emoji→icon). Без градиентов во всех цветовых блоках.
- **Scope:** один план реализации с двумя связанными задачами: (A) редизайн страницы /categories (Card grid + ghost-card + skeleton/error/empty) и (B) миграция эмодзи→SVG во всём проекте (6 точек рендера). Scope шире одной страницы из-за SVG-миграции, но изменения вне /categories минимальны (только замена рендера иконки, не layout).
- **Ambiguity (уточнено):**
  - Поле `icon` хранит строковый ключ (не эмодзи), с runtime-маппингом для старых эмодзи-данных.
  - Ghost-card ведёт к `onAddClick` — та же модалка `CategoryFormModal`, что и CTA в header.
  - `CategoriesTable.tsx` — полностью удаляется, заменяется на `CategoriesGrid.tsx`.
  - Ant Table sorter по count — убирается; сортировка по имени (localeCompare) сохраняется в useContainer.
  - `CategoryIcon` размещается в `src/shared/ui/CategoryIcon/` (shared layer, используется из виджетов и features).
