import type { Category } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";
import type { CategoryRowViewModel } from "./types";

export function countTransactionsByCategory(
  transactions: Transaction[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const transaction of transactions) {
    const categoryId = transaction.category.id;
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }

  return counts;
}

export function mapCategoryToRow(
  category: Category,
  transactionsCount: number,
): CategoryRowViewModel {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon,
    transactionsCount,
    isSystem: category.user_id === null,
  };
}
