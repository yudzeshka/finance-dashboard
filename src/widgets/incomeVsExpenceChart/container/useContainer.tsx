import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useEffect, useMemo } from "react";
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

  const option: EChartsOption = {
    xAxis: {
      data: chartData.names,
    },
    yAxis: {},
    series: [
      {
        type: "bar",
        data: chartData.expenseValues,
      },
      {
        type: "bar",
        data: chartData.incomeValues,
      },
    ],
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
