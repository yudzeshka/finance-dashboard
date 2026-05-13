import type { Transaction } from "@/entities/transaction/model/types";
import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/features/transaction/manage/model/filterTransactions";

export type LargestTransactionRow = Transaction;

export function getLargestTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): LargestTransactionRow[] {
  const currentTransactions = filterTransactions(transactions, filters);

  return [...currentTransactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}
