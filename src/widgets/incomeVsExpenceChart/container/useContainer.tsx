import type { EChartsOption } from "echarts";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { calculateIncomeVsExpenceChart } from "../model/lib";

const INCOME_COLOR = "#0E9F6E";
const EXPENSE_COLOR = "#E0457B";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const { transactions } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(filters.search ?? "", 250);
  const { isMobile } = useMedia();
  const { t } = useTranslation();

  const reportFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () => calculateIncomeVsExpenceChart(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => ({
    textStyle: { fontFamily: "'Inter', sans-serif" },
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const },
      backgroundColor: "#FFFFFF",
      borderColor: "#E8E4F0",
      textStyle: { color: "#1E1B2E", fontSize: 13 },
      extraCssText: "box-shadow: 0 4px 12px rgba(76,29,149,0.10); border-radius: 12px; padding: 10px 14px;",
    },
    grid: {
      left: 16,
      right: 16,
      bottom: isMobile ? 48 : 32,
      top: 40,
      containLabel: true,
    },
    xAxis: {
      data: chartData.names,
      axisLabel: {
        color: "#6B6680",
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      axisLabel: { color: "#6B6680", fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#E8E4F0", type: "dashed" } },
    },
    series: [
      {
        name: t("expense"),
        type: "bar",
        data: chartData.expenseValues,
        color: EXPENSE_COLOR,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        barMaxWidth: isMobile ? 28 : 40,
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
      {
        name: t("income"),
        type: "bar",
        data: chartData.incomeValues,
        color: INCOME_COLOR,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        barMaxWidth: isMobile ? 28 : 40,
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
    ],
    legend: isMobile
      ? {
          data: [t("expense"), t("income")],
          bottom: 0,
          textStyle: { color: "#6B6680", fontSize: 14 },
          itemWidth: 10,
          itemHeight: 10,
          icon: "roundRect" as const,
        }
      : {
          data: [t("expense"), t("income")],
          top: 0,
          textStyle: { color: "#6B6680", fontSize: 14 },
          itemWidth: 10,
          itemHeight: 10,
          icon: "roundRect" as const,
        },
  }), [chartData, isMobile, t]);

  return { option };
};
