import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";
import { calculateDashboardStats } from "@/entities/transaction/model/calculateDashboardStats";
import { aggregateByTypeByDay } from "@/entities/transaction/model/aggregateByDay";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
import type { DashboardStats } from "@/entities/transaction/model/calculateDashboardStats";

export type InsightTileData = {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  icon: string;
  sublabel: string;
  sparkline?: number[];
  sparklineColor?: string;
};

export function useDashboardInsights() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();

  const stats: DashboardStats = useMemo(
    () => calculateDashboardStats(allTransactions),
    [allTransactions],
  );

  const tiles: InsightTileData[] = useMemo(() => {
    const incomeSparkline = aggregateByTypeByDay(
      allTransactions,
      30,
      "INCOME",
    ).values;
    const expenseSparkline = aggregateByTypeByDay(
      allTransactions,
      30,
      "EXPENSE",
    ).values;

    return [
      {
        id: "income",
        label: t("income30Days"),
        value: stats.income30d,
        formattedValue: "+" + formatCurrency(stats.income30d),
        color: "var(--aurora-success)",
        icon: "income",
        sublabel: t("last30Days"),
        sparkline: incomeSparkline,
        sparklineColor: "#0E9F6E",
      },
      {
        id: "expense",
        label: t("expense30Days"),
        value: stats.expense30d,
        formattedValue: "−" + formatCurrency(stats.expense30d),
        color: "var(--aurora-danger)",
        icon: "expense",
        sublabel: t("last30Days"),
        sparkline: expenseSparkline,
        sparklineColor: "#E0457B",
      },
      {
        id: "largest",
        label: t("largestTransaction"),
        value: stats.largestTransaction ? stats.largestTransaction.amount : 0,
        formattedValue: stats.largestTransaction
          ? (stats.largestTransaction.type === "INCOME" ? "+" : "−") +
            formatCurrency(Math.abs(stats.largestTransaction.amount))
          : "—",
        color: "var(--aurora-accent)",
        icon: stats.largestTransaction?.category?.icon ?? "other",
        sublabel: stats.largestTransaction?.category?.name ?? "",
      },
    ];
  }, [stats, allTransactions, t, formatCurrency]);

  return { tiles };
}
