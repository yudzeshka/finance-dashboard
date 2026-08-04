import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { useEffect, useMemo } from "react";
import { calculateExpenceChart } from "../model/lib";
import type { PieDataItemOption } from "echarts/types/src/chart/pie/PieSeries.js";

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

  const reportFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () => calculateExpenceChart(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const textColor = isDark ? "#f3f4f6" : "#08060d";

  const center: [string, string] = isMobile ? ["50%", "42%"] : ["30%", "50%"];

  const legend = isMobile
    ? {
        icon: "circle" as const,
        show: true,
        orient: "horizontal" as const,
        bottom: 0,
        left: "center" as const,
        type: "scroll" as const,
        textStyle: { color: textColor },
        formatter: (name: string) => {
          const item = chartData.data.find((item) => item.name === name);
          const value = item?.value ?? 0;
          const percentage =
            chartData.total > 0 ? (value / chartData.total) * 100 : 0;
          return item
            ? `${item.name}: ${value} $ - ${percentage.toFixed(2)}% `
            : name;
        },
      }
    : {
        icon: "circle" as const,
        show: true,
        orient: "vertical" as const,
        right: 0,
        top: "top" as const,
        textStyle: { color: textColor },
        formatter: (name: string) => {
          const item = chartData.data.find((item) => item.name === name);
          const value = item?.value ?? 0;
          const percentage =
            chartData.total > 0 ? (value / chartData.total) * 100 : 0;
          return item
            ? `${item.name}: ${value} $ - ${percentage.toFixed(2)}% `
            : name;
        },
      };

  const option: EChartsOption = {
    title: {
      text: `total: ${chartData.total} $`,
      left: center[0],
      top: center[1],
      textAlign: "center",
      textVerticalAlign: "middle",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal",
        color: textColor,
      },
    },
    series: [
      {
        type: "pie",
        data: chartData.data as PieDataItemOption[],
        radius: ["50%", "85%"],
        center,
        label: {
          show: false,
          position: "inner",
        },
      },
    ],
    legend,
    tooltip: { trigger: "item" },
  };
  return { option };
};
