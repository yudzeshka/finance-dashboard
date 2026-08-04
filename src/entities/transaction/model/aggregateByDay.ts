import dayjs from "dayjs";
import type { Transaction } from "./types";

/**
 * Вычисляет кумулятивный running sum баланса по дням за последние N дней.
 * INCOME +amount, EXPENSE −amount.
 */
export function aggregateBalanceByDay(
  transactions: Transaction[],
  days: number = 30,
): { dates: string[]; cumulative: number[] } {
  const today = dayjs().startOf("day");
  const startDate = today.subtract(days - 1, "day");

  // Инициализируем массив дней
  const dateLabels: string[] = [];
  for (let i = 0; i < days; i++) {
    dateLabels.push(startDate.add(i, "day").format("YYYY-MM-DD"));
  }

  // Группируем транзакции по дням
  const dailyDelta = new Map<string, number>();
  for (const t of transactions) {
    if (!t.date) continue;
    const dateKey = dayjs(t.date).startOf("day").format("YYYY-MM-DD");
    const delta = t.type === "INCOME" ? t.amount : -t.amount;
    dailyDelta.set(dateKey, (dailyDelta.get(dateKey) ?? 0) + delta);
  }

  // Строим кумулятивный массив
  let running = 0;
  const cumulative: number[] = [];
  for (const label of dateLabels) {
    running += dailyDelta.get(label) ?? 0;
    cumulative.push(running);
  }

  return { dates: dateLabels, cumulative };
}
