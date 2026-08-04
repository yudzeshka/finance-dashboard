import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";
import { calculateDashboardStats } from "@/entities/transaction/model/calculateDashboardStats";
import type { DashboardStats } from "@/entities/transaction/model/calculateDashboardStats";

export type InsightTileData = {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  icon: string;
  sublabel: string;
};

function formatInsight(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted.replace(",", ".").replace(/\s/g, " ") + " ₽";
}

export function useDashboardInsights() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const stats: DashboardStats = useMemo(
    () => calculateDashboardStats(allTransactions),
    [allTransactions],
  );

  const tiles: InsightTileData[] = useMemo(
    () => [
      {
        id: "income",
        label: t("income30Days"),
        value: stats.income30d,
        formattedValue: "+" + formatInsight(stats.income30d),
        color: "var(--aurora-success)",
        icon: "💰",
        sublabel: t("last30Days"),
      },
      {
        id: "expense",
        label: t("expense30Days"),
        value: stats.expense30d,
        formattedValue: "−" + formatInsight(stats.expense30d),
        color: "var(--aurora-danger)",
        icon: "💸",
        sublabel: t("last30Days"),
      },
      {
        id: "largest",
        label: t("largestTransaction"),
        value: stats.largestTransaction ? stats.largestTransaction.amount : 0,
        formattedValue: stats.largestTransaction
          ? (stats.largestTransaction.type === "INCOME" ? "+" : "−") +
            formatInsight(stats.largestTransaction.amount)
          : "—",
        color: "var(--aurora-accent)",
        icon: stats.largestTransaction?.category?.icon ?? "📌",
        sublabel: stats.largestTransaction?.category?.name ?? "",
      },
    ],
    [stats, t],
  );

  return { tiles };
}
