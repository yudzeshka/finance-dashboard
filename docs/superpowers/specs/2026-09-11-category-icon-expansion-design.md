# Иконки категорий: расширение набора (Phosphor duotone)

Дата: 2026-09-11
Ветка: `feat/category-icons`

## Контекст и проблема

Иконки категорий были нарисованы вручную — 28 контурных SVG (`stroke`, `currentColor`, 24×24) в
`src/shared/ui/CategoryIcon/icons.tsx`, по сути клоны Feather/Lucide. Часть читалась плохо
(`food`, `education`, `entertainment`). Плюс в модалке добавления категории было всего 25 иконок —
мало.

## Решение

- **Стиль:** Phosphor **duotone** — заливка с полупрозрачным вторым слоем, один цвет через
  `currentColor`. Ложится в тему «ахроматика + один акцент», без новых цветов.
- **Набор:** курируемый каталог из **136 иконок**, 13 смысловых групп, без поиска.
- **Навигация:** скролл-контейнер в пикере (`max-height: 340px`, sticky-заголовки групп).
  Виртуализация не нужна на этом объёме.

## Каталог (13 групп)

Еда и напитки (14), Транспорт (11), Дом и ЖКХ (12), Финансы (15), Покупки (10),
Здоровье (10), Развлечения и спорт (14), Образование (8), Работа и бизнес (10), Техника (6),
Путешествия (8), Семья и питомцы (8), Прочее (10).

## Модель данных и совместимость

`category.icon` остаётся строкой — **миграция БД не нужна**.

- Новые выборы пишут имя Phosphor (`"pizza"`).
- Старые 25 ключей (`"food"`, `"salary"`…) маппятся через `legacyKeyToName` → имя Phosphor.
- Легаси-эмодзи маппятся через `emojiToKey` → старый ключ → имя Phosphor.
- Иконки действий `"edit"`/`"delete"` маппятся на `pencil-simple`/`trash`; `"warning"` —
  имя Phosphor напрямую.
- `resolveIconKey` резолвит: имя Phosphor → старый ключ → эмодзи → fallback `dots-three-circle`.

## Файлы

| Файл | Изменение |
|---|---|
| `src/shared/ui/CategoryIcon/icons.tsx` | карта `Record<string, Icon>` из 138 импортов Phosphor |
| `src/shared/ui/CategoryIcon/iconCatalog.ts` | новый: сгруппированный каталог пикера |
| `src/shared/ui/CategoryIcon/emojiMapping.ts` | `legacyKeyToName` + `emojiToKey` + `resolveIconKey` |
| `src/shared/ui/CategoryIcon/CategoryIcon.tsx` | рендер Phosphor duotone |
| `src/shared/ui/CategoryIcon/CategoryIconPicker.tsx` | сгруппированный каталог + скролл |
| `src/shared/ui/CategoryIcon/CategoryIconPicker.module.scss` | скролл, sticky-заголовки, шире сетка |
| `src/shared/ui/CategoryIcon/index.ts` | обновлённый баррель |
| `package.json` | `@phosphor-icons/react` |

## Что не изменилось

- Обёртка `CategoryIcon` (сигнатура та же) — все потребители без изменений.
- Данные в БД (старые ключи/эмодзи продолжают резолвиться).
- `CategoryIcon` принимает `size`/`className`/`title` как раньше.

## Верификация

- `npx tsc -b` — без ошибок.
- `npm run build` — успешно; tree-shaking проверен (неимпортированные иконки в бандле отсутствуют).
- `npm run lint` — 0 ошибок (6 предупреждений — предсуществующие, не в этих файлах).
