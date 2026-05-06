import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
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

  const center: [string, string] = ["30%", "50%"];

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
        color: "#000",
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
    legend: {
      icon: "circle",
      show: true,
      orient: "vertical",
      right: 0,
      top: "top",
      formatter: (name: string) => {
        const item = chartData.data.find((item) => item.name === name);
        const percentage = (item?.value / chartData.total) * 100;
        return item ? `${item.name}: ${item.value} $ - ${percentage.toFixed(2)}% ` : name;
      },
    },
    tooltip: { trigger: "item" },
  };
  return { option };
};
