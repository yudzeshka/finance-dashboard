import type { Transaction } from "@/entities/transaction";
import type { Budget, BudgetProgress, BudgetStatus } from "./types";

const WARNING_THRESHOLD = 0.8;

/**
 * Считает прогресс бюджета по транзакциям за текущий календарный месяц
 * (относительно referenceDate). Чистая функция без бэкенда.
 *
 * Для каждого бюджета:
 *  - spent = сумма amount по EXPENSE-транзакциям этой категории за месяц;
 *  - ratio = spent / limit_usd;
 *  - status: < 0.8 → ok, 0.8–1 → warning, ≥ 1 → danger;
 *  - remaining = limit - spent (может быть < 0).
 */
export function calculateBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): BudgetProgress[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  return budgets.map((budget) => {
    const spent = transactions.reduce((sum, transaction) => {
      if (transaction.type !== "EXPENSE") return sum;
      if (transaction.category.id !== budget.category_id) return sum;

      const date = transaction.date ? new Date(transaction.date) : null;
      if (!date) return sum;
      if (date.getFullYear() !== year || date.getMonth() !== month) return sum;

      return sum + transaction.amount;
    }, 0);

    const limit = budget.limit_usd;
    const ratio = limit > 0 ? spent / limit : 0;
    const status: BudgetStatus =
      ratio >= 1 ? "danger" : ratio >= WARNING_THRESHOLD ? "warning" : "ok";
    const remaining = limit - spent;

    return { budget, spent, limit, ratio, remaining, status };
  });
}
