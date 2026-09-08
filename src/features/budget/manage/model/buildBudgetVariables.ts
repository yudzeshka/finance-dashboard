import { displayToUsd } from "@/entities/currency";
import type { CurrencyRates } from "@/entities/currency";
import type { Currency } from "@/entities/settings";

export type BudgetFormValues = {
  categoryId: string;
  /** Лимит в валюте приложения (на входе). */
  limit: number;
};

export type BudgetVariables = {
  categoryId: string;
  /** Лимит в USD (для GraphQL `limit_usd`). */
  limitUsd: number;
};

/**
 * Преобразует значения формы бюджета в GraphQL-переменные мутации.
 *
 * - `limit` вводится в валюте приложения и конвертируется в USD через
 *   `displayToUsd` → `limit_usd`.
 * - Категория принимается явно: для edit она фиксирована (не меняется), для
 *   create — выбранная EXPENSE-категория.
 * - Бросает ошибку при пустой категории или неположительном лимите (≤ 0).
 */
export function buildBudgetVariables(
  values: BudgetFormValues,
  currency: Currency,
  rates: CurrencyRates | null,
): BudgetVariables {
  const categoryId = values.categoryId;
  if (!categoryId) {
    throw new Error("Category is required");
  }

  const limit = Number(values.limit);
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error("Limit must be greater than 0");
  }

  const limitUsd = displayToUsd(limit, currency, rates);
  if (limitUsd <= 0) {
    throw new Error("Limit must be greater than 0");
  }

  return { categoryId, limitUsd };
}
