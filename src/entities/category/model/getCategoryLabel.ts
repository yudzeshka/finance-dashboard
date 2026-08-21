import type { Category } from "./types";

/**
 * Возвращает локализованное имя категории. Системные категории имеют `key`
 * (стабильный идентификатор) и переводятся через i18next; пользовательские —
 * свободный текст, показывается как есть.
 */
export function getCategoryLabel(
  category: Pick<Category, "name" | "key">,
  t: (key: string) => string,
): string {
  return category.key ? t(`categoryNames.${category.key}`) : category.name;
}
