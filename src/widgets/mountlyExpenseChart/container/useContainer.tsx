import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useMedia } from "@/shared/hooks/useMedia";
import { useEffect, useMemo, useState } from "react";
import { getTransactionsByMonth } from "../model/lib";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const {
    transactions,
    loading: _loading,
    error: _error,
  } = useTransactionQueries();

  const setAllTransactions = useSetAllTransactions();
  const { isDark, isMobile } = useMedia();

  const chartData = useMemo(
    () => getTransactionsByMonth(transactions, targetDate),
    [transactions, targetDate],
  );

  const onTargetDateChange = (date: Date | null) => {
    if (date) setTargetDate(date);
  };

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const subTextColor = isDark ? "#9ca3af" : "#6b6375";

  const option: EChartsOption = {
    grid: {
      left: 8,
      right: 8,
      bottom: isMobile ? 36 : 24,
      containLabel: true,
    },
    xAxis: {
      data: chartData.days,
      axisLabel: {
        color: subTextColor,
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
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
        data: chartData.amounts,
        type: "line",
        smooth: true,
        areaStyle: {
          color: "rgba(6, 35, 251, 0.2)",
        },
      },
    ],
  };
  return { option, targetDate, onTargetDateChange };
};
