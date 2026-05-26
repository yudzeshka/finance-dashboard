import type { Category } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";
import type { CategoryRowViewModel } from "./types";

const STANDARD_CATEGORY_TYPES: Record<string, CategoryRowViewModel["type"]> = {
  "Food & Drinks": "EXPENSE",
  Salary: "INCOME",
  Transport: "EXPENSE",
  Entertainment: "EXPENSE",
  Health: "EXPENSE",
  Education: "EXPENSE",
  Utilities: "EXPENSE",
  Rent: "EXPENSE",
  Mortgage: "EXPENSE",
  Loan: "EXPENSE",
  "Credit Card": "EXPENSE",
  Debt: "EXPENSE",
  Insurance: "EXPENSE",
  Taxes: "EXPENSE",
  Other: "EXPENSE",
};

export function getDefaultCategoryType(
  name: string,
): CategoryRowViewModel["type"] {
  return STANDARD_CATEGORY_TYPES[name] ?? "EXPENSE";
}

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
  category: Pick<Category, "id" | "name" | "icon"> & {
    type?: CategoryRowViewModel["type"];
    isSystem?: boolean;
  },
  transactionsCount: number,
): CategoryRowViewModel {
  return {
    id: category.id,
    name: category.name,
    type: category.type ?? getDefaultCategoryType(category.name),
    icon: category.icon,
    transactionsCount,
    isSystem: category.isSystem ?? true,
  };
}
