import type { Category } from "@/entities/category";
import type { Transaction } from "@/entities/transaction/model/types";

export type TopCategoryRow = { category: Category; amount: number };

export function getTopCategories(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): TopCategoryRow[] {
  const targetMonthIndex = referenceDate.getMonth();
  const targetYear = referenceDate.getFullYear();

  const totalsByCategory = new Map<string, TopCategoryRow>();

  for (const transaction of transactions) {
    if (!transaction.date) continue;

    const date = new Date(transaction.date);
    if (
      date.getFullYear() !== targetYear ||
      date.getMonth() !== targetMonthIndex
    ) {
      continue;
    }

    if (transaction.type !== "EXPENSE") continue;

    const category = transaction.category;
    const existing = totalsByCategory.get(category.name);
    totalsByCategory.set(category.name, {
      category,
      amount: (existing?.amount ?? 0) + transaction.amount,
    });
  }

  const sortedCategories = Array.from(totalsByCategory.values()).sort(
    (a, b) => b.amount - a.amount,
  );

  return sortedCategories;
}
