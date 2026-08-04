import dayjs from "dayjs";
import type { Transaction } from "./types";
import { aggregateBalanceByDay } from "./aggregateByDay";

export type DashboardStats = {
  /** Итоговый баланс (sum INCOME − sum EXPENSE) за весь период */
  balance: number;
  /** Доходы за последние 30 дней */
  income30d: number;
  /** Расходы за последние 30 дней */
  expense30d: number;
  /** Процентная дельта баланса: текущие 30д vs предыдущие 30д */
  deltaPercent: number | null;
  /** Крупнейшая транзакция (по abs amount) за всё время */
  largestTransaction: Transaction | null;
  /** Данные спарклайна (кумулятивный баланс за 30д) */
  sparkline: { dates: string[]; cumulative: number[] };
};

/**
 * Логика calculatePercentage, переиспользующая алгоритм из reportCard.
 */
function calcPercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 10_000) / 100;
}

/**
 * Суммирует balance (INCOME − EXPENSE) для списка транзакций.
 */
function sumBalance(txs: Transaction[]): number {
  return txs.reduce((acc, t) => acc + (t.type === "INCOME" ? t.amount : -t.amount), 0);
}

/**
 * Фильтрует транзакции, попадающие в интервал [start, end] (включительно).
 */
function inRange(txs: Transaction[], start: dayjs.Dayjs, end: dayjs.Dayjs): Transaction[] {
  return txs.filter((t) => {
    if (!t.date) return false;
    const d = dayjs(t.date);
    return d.isAfter(start.subtract(1, "millisecond")) && d.isBefore(end.add(1, "day"));
  });
}

export function calculateDashboardStats(transactions: Transaction[]): DashboardStats {
  const today = dayjs().startOf("day");
  const current30Start = today.subtract(29, "day");
  const previous30End = current30Start.subtract(1, "day");
  const previous30Start = previous30End.subtract(29, "day");

  // Текущие 30 дней
  const current30 = inRange(transactions, current30Start, today);

  // Предыдущие 30 дней
  const previous30 = inRange(transactions, previous30Start, previous30End);

  const currentBalance30 = sumBalance(current30);
  const previousBalance30 = sumBalance(previous30);

  const income30d = current30
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense30d = current30
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  // Полный баланс за всё время
  const balance = sumBalance(transactions);

  // Дельта
  const deltaPercent =
    previousBalance30 === 0 && currentBalance30 === 0
      ? null
      : calcPercentage(currentBalance30, previousBalance30);

  // Крупнейшая транзакция (max по abs)
  let largest: Transaction | null = null;
  for (const t of transactions) {
    if (!largest || Math.abs(t.amount) > Math.abs(largest.amount)) {
      largest = t;
    }
  }

  // Спарклайн
  const sparkline = aggregateBalanceByDay(transactions, 30);

  return {
    balance,
    income30d,
    expense30d,
    deltaPercent,
    largestTransaction: largest,
    sparkline,
  };
}
