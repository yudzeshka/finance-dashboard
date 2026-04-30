import dayjs from "dayjs";

import type { Transaction } from "@/entities/transaction";
import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/features/transaction/manage/model/filterTransactions";
import { reportCardsConfig } from "./cardsConfig";
import type { ReportCardViewModel } from "./types";

const fallbackPeriodDays = 30;

function calculatePercentage(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 10_000) / 100;
}

function formatDate(date: dayjs.Dayjs) {
  return date.format("MMM D");
}

function getTransactionDateRange(transactions: Transaction[]) {
  const dates = transactions
    .map((transaction) => transaction.date)
    .filter((date): date is string => Boolean(date))
    .map((date) => dayjs(date))
    .filter((date) => date.isValid());

  if (dates.length === 0) {
    const endDate = dayjs();
    return {
      startDate: endDate.subtract(fallbackPeriodDays - 1, "day"),
      endDate,
    };
  }

  return dates.reduce(
    (range, date) => ({
      startDate: date.isBefore(range.startDate) ? date : range.startDate,
      endDate: date.isAfter(range.endDate) ? date : range.endDate,
    }),
    { startDate: dates[0], endDate: dates[0] },
  );
}

function getCurrentPeriod(transactions: Transaction[], filters: TransactionFilters) {
  if (filters.dateFrom || filters.dateTo) {
    const fallbackRange = getTransactionDateRange(transactions);

    return {
      startDate: filters.dateFrom ? dayjs(filters.dateFrom) : fallbackRange.startDate,
      endDate: filters.dateTo ? dayjs(filters.dateTo) : dayjs(),
    };
  }

  return getTransactionDateRange(transactions);
}

function getPeriodDays(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  return Math.max(endDate.startOf("day").diff(startDate.startOf("day"), "day") + 1, 1);
}

function getPreviousMonthPeriod(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  return {
    startDate: startDate.subtract(1, "month"),
    endDate: endDate.subtract(1, "month"),
  };
}

function getPreviousPeriodFilters(
  filters: TransactionFilters,
  previousPeriod: ReturnType<typeof getPreviousMonthPeriod>,
): TransactionFilters {
  return {
    ...filters,
    dateFrom: previousPeriod.startDate.toISOString(),
    dateTo: previousPeriod.endDate.toISOString(),
  };
}

export function calculateReportCards(
  transactions: Transaction[],
  filters: TransactionFilters,
): ReportCardViewModel[] {
  const currentPeriod = getCurrentPeriod(transactions, filters);
  const periodDays = getPeriodDays(currentPeriod.startDate, currentPeriod.endDate);
  const previousPeriod = getPreviousMonthPeriod(
    currentPeriod.startDate,
    currentPeriod.endDate,
  );
  const currentTransactions = filterTransactions(transactions, filters);
  const previousTransactions = filterTransactions(
    transactions,
    getPreviousPeriodFilters(filters, previousPeriod),
  );
  const comparisonDescription = `vs ${formatDate(previousPeriod.startDate)} - ${formatDate(
    previousPeriod.endDate,
  )}`;

  return reportCardsConfig.map((config) => {
    const value = config.getValue(currentTransactions, periodDays);
    const previousValue = config.getValue(previousTransactions, periodDays);
    const percentage = calculatePercentage(value, previousValue);

    return {
      id: config.id,
      title: config.title,
      value,
      percentage: config.showPercentage ? Math.abs(percentage) : undefined,
      positive: config.showPercentage ? percentage >= 0 : undefined,
      description: config.showPercentage
        ? comparisonDescription
        : `Based on ${periodDays} days`,
      Icon: config.Icon,
      tone: config.tone,
    };
  });
}
