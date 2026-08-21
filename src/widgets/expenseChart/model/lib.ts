import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/entities/transaction/model/filterTransactions";
import type { Transaction } from "@/entities/transaction/model/types";
import type { Category } from "@/entities/category";

export type ExpenseChartData = {
  total: number;
  data: Array<{ value: number; name: string }>;
};

export function calculateExpenceChart(
  transactions: Transaction[],
  filters: TransactionFilters,
  getLabel: (category: Category) => string,
): ExpenseChartData {
  const currentTransactions = filterTransactions(transactions, filters);

  const byCategory = new Map<string, { value: number; name: string }>();
  let total = 0;

  for (const transaction of currentTransactions) {
    if (transaction.type !== "EXPENSE") continue;
    total += transaction.amount;

    const category = transaction.category;
    const existing = byCategory.get(category.id);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      byCategory.set(category.id, {
        value: transaction.amount,
        name: getLabel(category),
      });
    }
  }

  return {
    total: parseFloat(total.toFixed(2)),
    data: Array.from(byCategory.values()).sort((a, b) => b.value - a.value),
  };
}
