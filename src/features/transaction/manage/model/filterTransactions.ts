import dayjs from "dayjs";

import type { Transaction } from "../../../../entities/transaction";
import type { TransactionFilters } from "../../filters/model/types";

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const predicates: Array<(tx: Transaction) => boolean> = [];

  if (filters.category) {
    predicates.push((tx) => tx.category.id === filters.category);
  }

  if (filters.type) {
    predicates.push((tx) => tx.type === filters.type);
  }

  if (filters.dateFrom) {
    predicates.push(
      (tx) => !!tx.date && !dayjs(tx.date).isBefore(filters.dateFrom),
    );
  }

  if (filters.dateTo) {
    predicates.push(
      (tx) => !!tx.date && !dayjs(tx.date).isAfter(filters.dateTo),
    );
  }

  if (filters.amountFrom !== undefined) {
    predicates.push((tx) => tx.amount >= filters.amountFrom!);
  }

  if (filters.amountTo !== undefined) {
    predicates.push((tx) => tx.amount <= filters.amountTo!);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    predicates.push((tx) => (tx.description ?? "").toLowerCase().includes(q));
  }

  if (predicates.length === 0) return transactions;

  return transactions.filter((tx) => predicates.every((p) => p(tx)));
}
