import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/entities/transaction/model/filterTransactions";
import type { Transaction } from "@/entities/transaction/model/types";

export type IncomeVsExpenceChartData = {
  names: string[];
  expenseValues: number[];
  incomeValues: number[];
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function calculateIncomeVsExpenceChart(
  transactions: Transaction[],
  filters: TransactionFilters,
): IncomeVsExpenceChartData {
  const currentTransactions = filterTransactions(transactions, filters);
  const expenseSums = Array(12).fill(0);
  const incomeSums = Array(12).fill(0);
  for (const transaction of currentTransactions) {
    if (transaction.type === "EXPENSE") {
      if (!transaction.date) continue;
      const month = new Date(transaction.date).getMonth();
      expenseSums[month] += transaction.amount;
    }
    if (transaction.type === "INCOME") {
      if (!transaction.date) continue;
      const month = new Date(transaction.date).getMonth();
      incomeSums[month] += transaction.amount;
    }
  }
  const names = [...monthNames];
  const expenseValues = expenseSums;
  const incomeValues = incomeSums;
  return {
    names,
    expenseValues,
    incomeValues,
  };
}
