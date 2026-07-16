import dayjs from "dayjs";
import type { TFunction } from "i18next";

import type { Transaction } from "@/entities/transaction";
import type { TransactionFilters } from "@/features/transaction/filters/model/types";
import { filterTransactions } from "@/entities/transaction/model/filterTransactions";
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

function getSelectedPeriod(filters: TransactionFilters) {
  const now = dayjs();

  // If user partially specified a range, assume a 30-day window anchored to the provided bound.
  if (filters.dateFrom && filters.dateTo) {
    return {
      startDate: dayjs(filters.dateFrom),
      endDate: dayjs(filters.dateTo),
    };
  }

  if (filters.dateFrom) {
    const startDate = dayjs(filters.dateFrom);
    return { startDate, endDate: startDate.add(fallbackPeriodDays - 1, "day") };
  }

  if (filters.dateTo) {
    const endDate = dayjs(filters.dateTo);
    return {
      startDate: endDate.subtract(fallbackPeriodDays - 1, "day"),
      endDate,
    };
  }

  return { startDate: now.subtract(1, "month"), endDate: now };
}

function getPeriodDays(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  return Math.max(
    endDate.startOf("day").diff(startDate.startOf("day"), "day") + 1,
    1,
  );
}

function getPreviousMonthPeriod(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  return {
    startDate: startDate.subtract(1, "month"),
    endDate: endDate.subtract(1, "month"),
  };
}

function getPeriodFilters(
  filters: TransactionFilters,
  period: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs },
): TransactionFilters {
  return {
    ...filters,
    // Cards already split by type (income/expense/balance). Respecting `filters.type`
    // would make totals incorrect (e.g. income card becomes 0 when EXPENSE is selected).
    type: undefined,
    dateFrom: period.startDate.toISOString(),
    dateTo: period.endDate.toISOString(),
  };
}

export function calculateReportCards(
  transactions: Transaction[],
  filters: TransactionFilters,
  t: TFunction,
): ReportCardViewModel[] {
  const hasSelectedPeriod = Boolean(filters.dateFrom || filters.dateTo);

  const currentPeriod = hasSelectedPeriod
    ? getSelectedPeriod(filters)
    : undefined;

  const currentTransactions = hasSelectedPeriod
    ? filterTransactions(
        transactions,
        getPeriodFilters(filters, currentPeriod!),
      )
    : filterTransactions(transactions, {
        ...filters,
        type: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });

  const periodDays = hasSelectedPeriod
    ? getPeriodDays(currentPeriod!.startDate, currentPeriod!.endDate)
    : getPeriodDays(
        getTransactionDateRange(currentTransactions).startDate,
        getTransactionDateRange(currentTransactions).endDate,
      );

  const comparisonPeriod = hasSelectedPeriod
    ? getPreviousMonthPeriod(currentPeriod!.startDate, currentPeriod!.endDate)
    : null;

  const previousTransactions = hasSelectedPeriod
    ? filterTransactions(
        transactions,
        getPeriodFilters(filters, comparisonPeriod!),
      )
    : [];

  const comparisonDescription = hasSelectedPeriod
    ? `vs ${formatDate(comparisonPeriod!.startDate)} - ${formatDate(
        comparisonPeriod!.endDate,
      )}`
    : "All time";

  return reportCardsConfig.map((config) => {
    const value = config.getValue(currentTransactions, periodDays);
    const previousValue = config.getValue(previousTransactions, periodDays);
    const percentage = calculatePercentage(value, previousValue);

    const showPercentage = hasSelectedPeriod && config.showPercentage;

    return {
      id: config.id,
      title: t(config.titleKey),
      value,
      percentage: showPercentage ? Math.abs(percentage) : undefined,
      positive: showPercentage ? percentage >= 0 : undefined,
      description: showPercentage
        ? comparisonDescription
        : hasSelectedPeriod
          ? `Based on ${periodDays} days`
          : comparisonDescription,
      Icon: config.Icon,
      tone: config.tone,
    };
  });
}
