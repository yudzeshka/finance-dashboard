import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { calculateIncomeVsExpenceChart } from "../model/lib";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const {
    transactions,
    loading: _loading,
    error: _error,
  } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(
    filters.search ?? "",
    250,
  );
  const { isDark, isMobile } = useMedia();
  const { t } = useTranslation();

  const reportFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () => calculateIncomeVsExpenceChart(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const textColor = isDark ? "#f3f4f6" : "#08060d";
  const subTextColor = isDark ? "#9ca3af" : "#6b6375";

  const option: EChartsOption = {
    grid: {
      left: 8,
      right: 8,
      bottom: isMobile ? 40 : 24,
      containLabel: true,
    },
    xAxis: {
      data: chartData.names,
      axisLabel: {
        color: subTextColor,
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
        interval: 0,
      },
      axisLine: {
        lineStyle: { color: subTextColor },
      },
    },
    yAxis: {
      axisLabel: {
        color: subTextColor,
      },
      axisLine: {
        lineStyle: { color: subTextColor },
      },
      splitLine: {
        lineStyle: { color: isDark ? "#2e303a" : "#e5e4e7" },
      },
    },
    series: [
      {
        name: t("expense"),
        type: "bar",
        data: chartData.expenseValues,
      },
      {
        name: t("income"),
        type: "bar",
        data: chartData.incomeValues,
      },
    ],
    legend: {
      data: [t("expense"), t("income")],
      textStyle: { color: textColor },
      top: 0,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    color: ["#FF4D4F", "#52C41A"],
  };
  return { option };
};
