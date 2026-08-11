# Спецификация: Страница настроек (`/settings`)

**Дата:** 2026-08-06
**Статус:** Черновик
**Ветка:** `feat/dashboard-aurora-redesign`

## Контекст

В сайдбаре приложения есть пункт «Настройки» (`/settings`) — ссылка есть, роут и страница отсутствуют. Спецификация описывает полноценную страницу настроек в стиле Aurora Halo с 4 вкладками.

## Цель

Дать пользователю контроль над профилем, оформлением, безопасностью и данными через единую страницу настроек.

## Дизайн-система (Aurora Halo)

Используем существующие токены из `src/index.css`:

| Токен | Значение |
|---|---|
| `--aurora-accent` | `#7C3AED` |
| `--aurora-accent-soft` | `#EDE9FE` |
| `--aurora-surface` | `#F7F5FB` |
| `--aurora-surface-card` | `#FFFFFF` |
| `--aurora-text` | `#1E1B2E` |
| `--aurora-text-secondary` | `#6B6680` |
| `--aurora-border` | `#E8E4F0` |
| `--aurora-danger` | `#E0457B` |
| `--aurora-danger-soft` | `#FCE7F3` |
| `--aurora-success` | `#0E9F6E` |
| `--aurora-success-soft` | `#D1FAE5` |
| `--aurora-shadow-sm` | `0 1px 2px rgba(76,29,149,0.08)` |
| `--aurora-shadow-md` | `0 4px 12px rgba(76,29,149,0.08)` |
| `--aurora-shadow-lg` | `0 12px 32px rgba(76,29,149,0.08)` |

Шрифты: `Sora` (логотип), `Inter` (body), `system-ui` (fallback).

Используем глобальные классы: `.aurora-card`, `.aurora-card--elevated`, `.aurora-text-primary`, `.aurora-text-secondary`, `.aurora-text-danger`, `.aurora-focus-ring`.

## Макет страницы

```
┌─ AppShell ──────────────────────────────────────────┐
│  Header: "Настройки" / "Settings"                    │
│  Subtitle: "Управление профилем и приложением"       │
├─────────────────────────────────────────────────────┤
│  Ant Design Tabs (4 вкладки)                         │
│  [Профиль] [Оформление] [Безопасность] [Данные]     │
│  ──────────────────────────────────────────────────  │
│  ┌─ aurora-card ─────────────────────────────────┐  │
│  │  Содержимое активной вкладки (форма)           │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

- Контент в `.dashboard-contentInner` (max-width 1320px, margin auto)
- Вкладки — Ant Design Tabs, стилизованные под Aurora (accent active indicator)
- Каждая вкладка внутри `.aurora-card` (border-radius 16px, shadow-sm, border)
- Отступы: 20px padding у `.dashboard-content`, 24px padding внутри карточек

### Мобильная версия (≤768px)

- Вкладки — горизонтальный скролл (tabPosition="top" + overflow-x auto)
- Карточки на всю ширину
- Кнопки full-width
- Опасная зона: красная карточка с border вместо обводки

## Архитектура (FSD)

```
src/
├── pages/settings/
│   └── ui/SettingsPage.tsx              # Тонкая обёртка → SettingsWidget
├── widgets/settings/
│   ├── index.ts                          # export { SettingsWidget }
│   ├── container/useContainer.ts         # Логика (стейт вкладки, хендлеры)
│   └── ui/SettingsView.tsx              # Dumb-компонент (Tabs + вкладки)
├── features/settings/
│   ├── profile/
│   │   └── model/useProfile.ts           # Хук: чтение/сохранение displayName
│   ├── appearance/
│   │   ├── model/useAppearance.ts         # Хук: язык + валюта
│   │   └── model/store.ts                # Zustand useAppearanceStore (persist в localStorage)
│   ├── security/
│   │   └── model/useSecurity.ts          # Хук: changePassword, deleteAccount
│   └── data/
│       └── model/useDataManagement.ts    # Хук: exportCsv, clearAllData
└── entities/settings/
    └── model/types.ts                    # AppearanceSettings, ProfileFormValues и т.д.
```

## Вкладка 1: Профиль

### UI
- Поле «Имя»: Ant Design `Input` с `aurora-focus-ring`
- Email: `Input` disabled (только чтение)
- Кнопка «Сохранить»: Ant Design `Button` тип `primary`

### Логика
- **Чтение**: `user.displayName` и `user.email` из `useAuth()`
- **Сохранение**: `nhost.auth.updateUser({ displayName })` через `@nhost/nhost-js`
- **Валидация**: имя не пустое, мин. 1 символ
- **Обратная связь**: Ant Design `message.success` / `message.error`
- **Состояния**: загрузка (кнопка disabled + spinner), ошибка (красный alert под полем)

### i18n-ключи
- `settingsProfile` — "Профиль" / "Профиль"
- `settingsName` — "Имя" / "Имя"
- `settingsEmail` — "Email" (без перевода)
- `settingsSave` — "Сохранить" / "Сохранить"
- `settingsNameRequired` — "Имя обязательно" / "Имя обязательно"
- `settingsProfileSaved` — "Профиль обновлён" / "Профиль обновлён"
- `settingsProfileError` — "Не удалось сохранить" / "Не удалось сохранить"

## Вкладка 2: Оформление

### UI
- Язык: Ant Design `Select` с опциями EN / RU
- Валюта: Ant Design `Select` с опциями USD / RUB / EUR / BYN
- Оба поля в вертикальном стеке с label

### Логика
- **Zustand-стор** `useAppearanceStore`:
  - `language: 'en' | 'ru'` (инициализируется из `i18n.language`)
  - `currency: 'USD' | 'RUB' | 'EUR' | 'BYN'` (дефолт `'USD'`)
  - `setLanguage(lang)`, `setCurrency(curr)`
- **Персистентность**: `persist` middleware → localStorage ключ `appearance-settings`
- **Эффект при смене языка**: `i18n.changeLanguage(language)`
- **Эффект при смене валюты**: перерендер всех виджетов через React-стейт
- **Виджеты-потребители**: `formatCurrency` в DashboardHero, ReportsHero, ReportCard, TopCategories, ExpenseChart — все используют `useAppearanceStore().currency`
- **Сохранение мгновенное** — без кнопки Save, применяется при `onChange`

### i18n-ключи
- `settingsAppearance` — "Оформление" / "Оформление"
- `settingsLanguage` — "Язык" / "Язык"
- `settingsCurrency` — "Валюта" / "Валюта"

## Вкладка 3: Безопасность

### UI
- Секция «Смена пароля»:
  - `Input.Password` для нового пароля
  - `Input.Password` для подтверждения
  - Кнопка «Сменить пароль» (primary)
- Разделитель `Divider`
- Секция «Опасная зона»:
  - Красная карточка с `border: 1px solid var(--aurora-danger)` и фоном `var(--aurora-danger-soft)`
  - Заголовок «Опасная зона» с иконкой предупреждения
  - Пояснительный текст
  - Кнопка «Удалить аккаунт» (danger, outlined) — открывает модалку
  - Модалка: текст «Введите УДАЛИТЬ для подтверждения», Input + кнопка (danger, disabled пока не введено верное слово)

### Логика
- **Смена пароля**:
  - Валидация: мин. 8 символов, пароли совпадают
  - Вызов: `nhost.auth.changePassword({ newPassword })` → требует чтобы пользователь был недавно аутентифицирован
  - Если `changePassword` требует oldPassword → используем `nhost.auth.resetPassword({ email })` (отправляет ссылку на почту)
  - **Решение для v1**: используем `nhost.auth.resetPassword({ email })` — отправляет ссылку на сброс на почту пользователя. UI: показываем алерт «Ссылка для сброса пароля отправлена на ваш email»
- **Удаление аккаунта**:
  - Удаление через Hasura: сначала удалить все транзакции + категории пользователя, затем вызвать API удаления
  - Nhost v4: `nhost.auth.deleteSelf()` — удаляет auth-запись (каскадное удаление транзакций/категорий зависит от схемы БД)
  - Если каскада нет — сначала удаляем данные через Apollo mutations, затем аккаунт
  - После удаления: `purgeApolloCache()` + `nhost.auth.signOut()` + редирект на `/auth`
- **Обратная связь**: `message.success` / `message.error`
- **Состояния**: загрузка на кнопках, ошибки под полями

### i18n-ключи
- `settingsSecurity` — "Безопасность" / "Безопасность"
- `settingsChangePassword` — "Смена пароля" / "Смена пароля"
- `settingsNewPassword` — "Новый пароль" / "Новый пароль"
- `settingsConfirmPassword` — "Подтвердите пароль" / "Подтвердите пароль"
- `settingsPasswordMinLength` — "Минимум 8 символов" / "Минимум 8 символов"
- `settingsPasswordsDoNotMatch` — "Пароли не совпадают" / "Пароли не совпадают"
- `settingsPasswordChanged` — "Пароль изменён" / "Пароль изменён"
- `settingsPasswordResetSent` — "Ссылка для сброса пароля отправлена на ваш email" / "Ссылка для сброса пароля отправлена на ваш email"
- `settingsDangerZone` — "Опасная зона" / "Опасная зона"
- `settingsDeleteAccount` — "Удалить аккаунт" / "Удалить аккаунт"
- `settingsDeleteAccountDesc` — "Удаление аккаунта — необратимое действие. Все ваши транзакции и категории будут удалены." / "Удаление аккаунта — необратимое действие. Все ваши транзакции и категории будут удалены."
- `settingsDeleteAccountConfirm` — "Введите УДАЛИТЬ для подтверждения" / "Введите УДАЛИТЬ для подтверждения"
- `settingsDeleteAccountSuccess` — "Аккаунт удалён" / "Аккаунт удалён"
- `settingsSave` — "Сохранить" / "Сохранить"

## Вкладка 4: Данные

### UI
- Секция «Экспорт»:
  - Пояснительный текст
  - Кнопка «Экспорт в CSV» (default, с иконкой DownloadOutlined)
- Разделитель `Divider`
- Секция «Опасная зона» — как во вкладке Безопасность:
  - Красная карточка
  - Заголовок, пояснение, кнопка «Очистить все данные»
  - Модалка с подтверждением (ввод «ОЧИСТИТЬ»)

### Логика
- **Экспорт в CSV**:
  - Запрос: все транзакции пользователя из Apollo-кэша (если нет — refetch)
  - CSV-колонки: `date, type, category, amount, description`
  - Генерация: `csvString = BOM + headers + rows.map(joinComma).join('\n')`
  - Скачивание: `Blob([csvString], { type: 'text/csv;charset=utf-8' })` + `URL.createObjectURL` + `<a download="transactions.csv">`
  - После скачивания: `URL.revokeObjectURL`
- **Очистка данных**:
  - Удалить все транзакции пользователя → `DELETE_TRANSACTION` для каждой
  - Удалить все пользовательские категории → `DELETE_CATEGORY` для каждой с `user_id IS NOT NULL`
  - После удаления: сбросить Apollo-кэш, показать toast
  - **Не удаляем системные категории** (`user_id IS NULL`)
- **Обратная связь**: `message.success` / `message.error`

### i18n-ключи
- `settingsData` — "Данные" / "Данные"
- `settingsExport` — "Экспорт" / "Экспорт"
- `settingsExportDesc` — "Скачайте все транзакции в формате CSV" / "Скачайте все транзакции в формате CSV"
- `settingsExportCsv` — "Экспорт в CSV" / "Экспорт в CSV"
- `settingsExportSuccess` — "Файл скачан" / "Файл скачан"
- `settingsClearData` — "Очистить все данные" / "Очистить все данные"
- `settingsClearDataDesc` — "Очистка всех данных. Это действие необратимо. Все транзакции и пользовательские категории будут удалены без возможности восстановления." / "Очистка всех данных. Это действие необратимо. Все транзакции и пользовательские категории будут удалены без возможности восстановления."
- `settingsClearDataConfirm` — "Введите ОЧИСТИТЬ для подтверждения" / "Введите ОЧИСТИТЬ для подтверждения"
- `settingsClearDataSuccess` — "Все данные удалены" / "Все данные удалены"
- `settingsProcessing` — "Обработка..." / "Обработка..."

## Глобальный стейт (Zustand)

```typescript
// features/settings/appearance/model/store.ts

interface AppearanceState {
  language: 'en' | 'ru';
  currency: 'USD' | 'RUB' | 'EUR' | 'BYN';
  setLanguage: (lang: 'en' | 'ru') => void;
  setCurrency: (curr: 'USD' | 'RUB' | 'EUR' | 'BYN') => void;
}
```

- `persist` middleware, ключ `appearance-settings`
- Инициализация `language` из `i18n.language`
- Инициализация `currency` → `'USD'`

## Рефакторинг форматеров валют

Текущее состояние: в коде микс RUB и USD в разных виджетах.

Нужно заменить все `Intl.NumberFormat` вызовы на единый хук/утилиту:

```typescript
// shared/lib/useCurrencyFormatter.ts
import { useAppearanceStore } from '@/features/settings/appearance/model/store';

export function useCurrencyFormatter() {
  const currency = useAppearanceStore((s) => s.currency);
  return (value: number) =>
    new Intl.NumberFormat(currency === 'RUB' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'RUB' ? 0 : 2,
    }).format(value);
}
```

Затрагиваемые файлы:
- `src/widgets/dashboardHero/ui/DashboardHeroView.tsx`
- `src/widgets/reportCard/ui/ReportCard.tsx`
- `src/widgets/topCategories/container/useContainer.tsx`
- `src/widgets/reportsHero/ui/ReportsHeroView.tsx`
- `src/widgets/expenseChart/container/useContainer.tsx`

## Роутинг

Добавить в `main.tsx`:

```tsx
import { SettingsPage } from "./pages/settings";
// ...
<Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
```

## Состояния UI

Каждая вкладка обрабатывает:

| Состояние | Профиль | Оформление | Безопасность | Данные |
|---|---|---|---|---|
| Загрузка | Скелетон полей | N/A (мгновенно) | Скелетон | N/A |
| Ошибка | Alert под полем | N/A | Alert под полем | Alert / message.error |
| Успех | message.success | N/A (мгновенно) | message.success / модалка | message.success |
| Пустое | N/A | N/A | N/A | N/A |

## Ограничения и допущения

1. **Смена пароля через resetPassword**: `changePassword` в Nhost требует старый пароль. Используем `resetPassword({ email })` — отправляет ссылку на почту. Это проще для v1 и не требует знания текущего пароля.
2. **Экспорт только CSV**: JSON и другие форматы — за рамками v1.
3. **Импорт не делаем**: парсинг и валидация CSV — отдельная задача.
4. **Удаление аккаунта**: предполагаем, что в БД настроен `ON DELETE CASCADE` от `auth.users` к `transactions` и `categories`. Если нет — сначала удаляем данные вручную через Apollo.
5. **Валюта в localStorage**: не синхронизируется между устройствами (это нормально для v1).
6. **Тёмная тема**: уже работает через `prefers-color-scheme`, настройки не затрагивают её.

## Не входят в scope v1

- Тёмная тема как ручной переключатель (уже есть системная)
- Формат даты/времени
- Уведомления (push/email)
- Социальные привязки (Google/Apple/GitHub)
- Импорт данных
- Бюджеты и цели
- Сохранение настроек на бэкенд (синхронизация между устройствами)
