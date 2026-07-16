import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/entities/transaction/model/filterTransactions";
import type { Transaction } from "@/entities/transaction/model/types";

export type ExpenseChartData = {
  total: number;
  data: Array<{ value: number; name: string }>;
};

export function calculateExpenceChart(
  transactions: Transaction[],
  filters: TransactionFilters,
): ExpenseChartData {
  const currentTransactions = filterTransactions(transactions, filters);

  const expenseData = currentTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "EXPENSE") {
        acc.total += transaction.amount;
        const categoryName = transaction.category.name ?? "";
        if (acc.data[categoryName]) {
          acc.data[categoryName] += transaction.amount;
        } else {
          acc.data[categoryName] = transaction.amount;
        }
        return acc;
      }
      return acc;
    },
    { total: 0, data: {} } as {
      total: number;
      data: Record<string, number>;
    },
  );
  const resultArray = Object.keys(expenseData.data).map((key) => {
    return { name: key, value: expenseData.data[key] };
  });

  return {
    total: parseFloat(expenseData.total.toFixed(2)),
    data: resultArray.sort((a, b) => b.value - a.value),
  };
}
