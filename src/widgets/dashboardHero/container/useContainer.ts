import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";
import { calculateDashboardStats } from "@/entities/transaction/model/calculateDashboardStats";

export function useDashboardHero() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const stats = useMemo(
    () => calculateDashboardStats(allTransactions),
    [allTransactions],
  );

  const isPositive = stats.balance >= 0;

  return {
    balance: stats.balance,
    income30d: stats.income30d,
    expense30d: stats.expense30d,
    deltaPercent: stats.deltaPercent,
    sparklineData: stats.sparkline.cumulative,
    isPositive,
    t,
  };
}
