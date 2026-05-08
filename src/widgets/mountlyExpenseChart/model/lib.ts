import type { Transaction } from "@/entities/transaction/model/types";

export function getTransactionsByMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): {
  days: string[];
  amounts: number[];
} {
  const targetMonthIndex = referenceDate.getMonth();
  const targetYear = referenceDate.getFullYear();

  const totalsByDay = new Map<number, number>();

  for (const transaction of transactions) {
    if (!transaction.date) continue;

    const date = new Date(transaction.date);
    if (
      date.getFullYear() !== targetYear ||
      date.getMonth() !== targetMonthIndex
    ) {
      continue;
    }

    const dayOfMonth = date.getDate();
    totalsByDay.set(
      dayOfMonth,
      (totalsByDay.get(dayOfMonth) ?? 0) + transaction.amount,
    );
  }

  const sortedDays = Array.from(totalsByDay.keys()).sort((a, b) => a - b);

  return {
    days: sortedDays.map(String),
    amounts: sortedDays.map((day) => totalsByDay.get(day) ?? 0),
  };
}
