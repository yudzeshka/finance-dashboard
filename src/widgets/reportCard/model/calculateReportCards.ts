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

function getSelectedPeriod(filters: TransactionFilters) {
  const now = dayjs();

  // If user partially specified a range, assume a 30-day window anchored to the provided bound.
  if (filters.dateFrom && filters.dateTo) {
    return { startDate: dayjs(filters.dateFrom), endDate: dayjs(filters.dateTo) };
  }

  if (filters.dateFrom) {
    const startDate = dayjs(filters.dateFrom);
    return { startDate, endDate: startDate.add(fallbackPeriodDays - 1, "day") };
  }

  if (filters.dateTo) {
    const endDate = dayjs(filters.dateTo);
    return { startDate: endDate.subtract(fallbackPeriodDays - 1, "day"), endDate };
  }

  return { startDate: now.subtract(1, "month"), endDate: now };
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
  const selectedPeriod = getSelectedPeriod(filters);

  // Cards should always display the month BEFORE the selected/current period.
  const cardPeriod =
    filters.dateFrom || filters.dateTo
      ? getPreviousMonthPeriod(selectedPeriod.startDate, selectedPeriod.endDate)
      : selectedPeriod;

  const periodDays = getPeriodDays(cardPeriod.startDate, cardPeriod.endDate);
  const comparisonPeriod = getPreviousMonthPeriod(cardPeriod.startDate, cardPeriod.endDate);

  const currentTransactions = filterTransactions(
    transactions,
    getPreviousPeriodFilters(filters, cardPeriod),
  );
  const previousTransactions = filterTransactions(
    transactions,
    getPreviousPeriodFilters(filters, comparisonPeriod),
  );

  const comparisonDescription = `vs ${formatDate(comparisonPeriod.startDate)} - ${formatDate(
    comparisonPeriod.endDate,
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
