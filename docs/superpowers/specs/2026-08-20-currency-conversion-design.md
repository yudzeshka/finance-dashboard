# Дизайн: конверсия валют с актуальным курсом

Дата: 2026-08-20
Статус: согласован (дизайн-обзор), ждёт ревью спеки

## Проблема

1. Изменение валюты в «Настройках» влияет только на виджет «Текущий баланс». При этом **конверсии нет вообще** — меняется лишь символ, число остаётся прежним (100₽ → «$100»).
2. `TransactionsTable.tsx` и `dashboardInsights/useContainer.ts` хардкодят `ru-RU` + `₽` и не подписаны на настройку.
3. `LargestTransactions` выводит сумму вообще без форматирования (голое число).
4. Ввод, редактирование, фильтр по сумме и CSV-экспорт не учитывают валюту.

## Решения (согласовано с пользователем)

| Вопрос | Решение |
|---|---|
| Базовая валюта хранения | **USD**. Все суммы в БД — в USD. |
| Дефолт отображения | USD (совпадает с текущим дефолтом стора — менять не нужно). |
| Ввод сумм | Пользователь вводит в **выбранной** валюте; на запись конвертируется в USD. |
| Офлайн / сбой API | Кэш курсов в localStorage + подпись «Курс от ДД.ММ.ГГГГ». Нет кэша вовсе → показать в USD (базе). |
| Существующие данные | **Не мигрировать**. Старые суммы будут трактоваться как USD (числа не меняются). |
| CSV-экспорт | В **выбранной** валюте. |

## Исследование API курсов

Выбран **`https://open.er-api.com`** (free-тир exchangerate-api.com):
- `access-control-allow-origin: *` — CORS для браузера ✓
- `GET /v6/latest/USD` — курсы с базой USD, включая RUB/EUR/BYN ✓
- Обновление раз в сутки; проверено 20.08.2026: `1 USD = 85.005 RUB / 0.858444 EUR / 3.037669 BYN` (RUB-база: `1 RUB = 0.011764 USD / 0.010122 EUR / 0.035679 BYN`)
- Бесплатно, без ключа ✓

Отброшены: jsDelivr `@irfanokr/currency-api` (данные от 19.05.2026 — протухли), Frankfurter/ECB (нет BYN), exchangerate.host (нет CORS), CBR (нет CORS).

Ограничение: строгий CSP в `index.html` разрешает `connect-src` только для Nhost + localhost. **Добавить `https://open.er-api.com` в `connect-src`.**

## Архитектура

### Новый модуль `src/entities/currency/`

- `model/types.ts`
  - `CurrencyRates = Record<Currency, number>` — курс «1 USD в валюте X» (RUB ≈ 85, USD = 1).
- `model/ratesStore.ts` — Zustand + `persist` (localStorage-ключ `currency-rates`):
  - `rates: CurrencyRates | null`, `fetchedAt: number | null`, `loading`, `error`;
  - `fetchRates()` — GET `/v6/latest/USD`, парсит `data.rates`, сохраняет `fetchedAt`;
  - `ensureRates()` — фетч, если нет кэша или он старше `MAX_RATE_AGE` (12 ч).
- `model/convert.ts` — чистые функции:
  - `usdToDisplay(usd, currency, rates)` — если `currency === 'USD'` или нет rates → `usd`; иначе `usd * rates[currency]`;
  - `displayToUsd(amount, currency, rates)` — если `currency === 'USD'` или нет rates → `amount`; иначе `amount / rates[currency]`; округление до 2 знаков;
  - `currencySymbol(code)` — `$ / ₽ / € / Br`.
- `index.ts` — barrel.

### Загрузка курсов

- Провайдер `src/app/providers/CurrencyRatesProvider.tsx` — на mount вызывает `ensureRates()`, повторно на `online`-событии.
- Подключить в `main.tsx` (внутри `AppAntdProvider`).

### Единая точка конверсии — `useCurrencyFormatter`

`src/shared/lib/useCurrencyFormatter.ts`: подписывается на сторе валюты **и** на `ratesStore`; внутри делает `usdToDisplay(value, currency, rates)` затем `Intl.NumberFormat`. Сигнатура `(value: number) => string` сохраняется — все существующие вызовы (DashboardHero, expenseChart, topCategories, reportsHero, reportCard) автоматически получают конверсию.

Проценты (savingsRate в ReportCard) используют отдельный `formatPercent` — не затрагиваются.

### Фиксы хардкода

| Файл | Изменение |
|---|---|
| `widgets/transactions-table/ui/TransactionsTable.tsx` | `formatTableAmount` → `useCurrencyFormatter` (знак «+»/«−» вручную); итог в футере тоже; aria-label — код выбранной валюты. |
| `widgets/dashboardInsights/container/useContainer.ts` | `formatInsight` (ru-RU + ₽) → `useCurrencyFormatter`. |
| `widgets/largestTransactions/ui/index.tsx` | Голое `row.amount` → форматирование через `useCurrencyFormatter`. |

### Запись и правка транзакций

- `features/transaction/manage/model/useTransactionMutations.ts`:
  - перед мутацией `amount = displayToUsd(values.amount, currency, rates)`;
  - **все** ветки (онлайн-мутация, temp-транзакция, офлайн-очередь) используют одно и то же сконвертированное значение → очередь реплеится с уже-USD, дрейфа нет.
- `features/transaction/manage/model/useTransactionFormModal.ts` (`openEdit`): в поле формы подставлять `usdToDisplay(tx.amount, currency, rates)`.
- `widgets/transactions/ui/TransactionFormModal.tsx`: префикс поля суммы `prefix="$"` → `currencySymbol(выбранная валюта)`.

### Фильтр по сумме (слайдер)

`features/transaction/filters/container/useContainer.tsx`: границы слайдера (`amountBounds`) и значения (`amountRange`) отображаются в выбранной валюте; при коммите в `filtersValues.amountFrom/To` сохраняются **USD** (фильтр `filterTransactions.ts` сравнивает сырые суммы). Открытие/сброс слайдера — конверсия туда и обратно.

### CSV-экспорт

`features/settings/data/model/useDataManagement.ts` `generateCsv`: `tx.amount.toString()` → строка в выбранной валюте (`usdToDisplay` + `Intl.NumberFormat`). Прокинуть `currency` + `rates` в хук.

## Обработка ошибок / офлайн

- Фетч курсов падает (офлайн/сбой) → используется последний кэш любой давности; рядом с селектом валюты подпись «Курс от ДД.ММ.ГГГГ».
- Кэша нет вовсе → отображение в USD (rate = 1), конверсия выключена.
- Повторная попытка на `online`.

## Крайние случаи

- `displayToUsd` округляет до 2 знаков — в БД не копятся длинные хвосты.
- Round-trip при редактировании (`usdToDisplay` → `displayToUsd`) даёт не более центов дрейфа — приемлемо.
- CountUp-анимация баланса конвертирует каждый кадр — визуально корректно.
- Курсы зависят только от USD-базы, BYN поддерживается.

## Вне рамок

- Миграция существующих данных (решение «не трогать»).
- История курсов по дате транзакции.
- Мультивалютный ввод (одна транзакция в своей валюте) — ввод всегда в выбранной валюте.

## Порядок работ

1. `entities/currency` (типы, convert, ratesStore) + barrel.
2. CSP в `index.html` + `CurrencyRatesProvider` в `main.tsx`.
3. `useCurrencyFormatter` → конверсия.
4. Фиксы хардкода (TransactionsTable, dashboardInsights, LargestTransactions).
5. Запись/правка (mutations, form modal, prefix).
6. Фильтр-слайдер.
7. CSV в выбранной валюте.
